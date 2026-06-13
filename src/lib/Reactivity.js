import { effect, Signal, SignalObject, watch, collectEffects, computed, registerDispose } from "./Signals.js";
import { evaluate } from "./Evaluate.js";

/**
 * Create an HTML element from a string
 * @param {string} markup
 * @returns {HTMLElement}
 */
export function html(markup) {
    const tp = document.createElement('template');
    tp.innerHTML = markup.trim();
    const el = tp.content.firstElementChild;
    if (!el) throw new Error("TinyBubble template must return one root element");
    return el;
}

const styleTagsAdded = new Set();

export const globals = {};

const BOOLEAN_ATTRS = new Set([
    'disabled', 'checked', 'selected', 'readonly', 'required',
    'hidden', 'open', 'multiple', 'autofocus',
]);

/**
 * Replaces syntax sugar (@click -> -x-on:click)
 */
function bubblify(str) {
    return str.replace(/@([a-zA-Z0-9_-]+)(\s*=)/g, (_, eventName, eq) => {
        return `-x-on:${eventName}${eq}`;
    });
}



// ============================================================
// SCOPE AND PROPS HELPERS
// ============================================================

/**
 * Build the scope for template evaluation
 * Uses _propsSignals for reactivity in templates
 */
function buildScope(component, localScope = {}) {
    return {
        ...globals,
        ...component._methods,
        ...component.data,
        ...component._propsSignals,
        ...localScope
    };
}

function caseSensitiveToHyphen(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Create props object with Proxy for JS access and signals for template
 */
function createProps(propKeys, incoming) {
    const _signals = {};
    for (const k in incoming) {
        const definedKey = propKeys.find(pk => caseSensitiveToHyphen(pk) === k || pk.toLowerCase() === k.toLowerCase()) || k;
        _signals[definedKey] = incoming[k] instanceof SignalObject ? incoming[k] : Signal(incoming[k]);
    }
    for (const k of propKeys) {
        if (!(k in _signals)) _signals[k] = Signal(undefined);
    }
    const proxy = new Proxy(_signals, {
        get(target, key) {
            if (key === '_signals') return target;
            const signal = target[key];
            return signal ? signal.value : undefined;
        },
        set() { return false; }
    });

    return { proxy, signals: _signals };
}

/**
 * Watch a specific prop for changes
 */
export function watchProp(component, key, callback) {
    const signal = component._propsSignals && component._propsSignals[key];
    if (signal instanceof SignalObject) watch(signal, callback);
}

// ============================================================
// DIRECTIVE HANDLERS
// ============================================================

/**
 * After bindNode, a child may have been replaced in the DOM (e.g. by handleCustomComponent).
 * Returns the actual node currently in the DOM, or null.
 */
function trackNode(child, anchor, expectedParent) {
    if (child.isConnected && child.parentNode === expectedParent) return child;
    const candidate = anchor.previousSibling;
    return (candidate && candidate !== anchor && candidate.parentNode === expectedParent)
        ? candidate : null;
}

/**
 * Evaluate an event-handler expression. If the expression is a bare method name,
 * call it directly on the component. Otherwise evaluate and call the result.
 */
function invokeExpr(expr, component, scope, args) {
    if (typeof expr === 'string' && !expr.includes(' ') && !expr.includes('(')) {
        if (typeof component[expr] === 'function') {
            component[expr](...args);
            return;
        }
    }
    const res = evaluate(expr, scope, component);
    if (typeof res === 'function') res(...args);
}

/**
 * Detach `el` (or its template content) from the DOM, leaving a comment
 * anchor in its place. Shared preamble of x-for / x-if.
 */
function extractTemplate(el, attrName) {
    const anchor = document.createComment(attrName);
    el.parentNode.insertBefore(anchor, el);
    const isTemplate = el.tagName === 'TEMPLATE';
    const content = isTemplate ? el.content : el;
    el.remove();
    return { anchor, isTemplate, content, attrName };
}

/**
 * Clone the extracted template, insert it before its anchor and bind it.
 * Effect disposers are pushed into `disposers`; returns the inserted nodes.
 */
function insertClone(tpl, component, scope, bindNodeFn, disposers) {
    const { anchor, isTemplate, content, attrName } = tpl;
    const parent = anchor.parentNode;
    const clone = content.cloneNode(true);
    if (!isTemplate) clone.removeAttribute(attrName);
    const inserted = [];
    (isTemplate ? [...clone.childNodes] : [clone]).forEach(child => {
        parent.insertBefore(child, anchor);
        disposers.push(...collectEffects(() => bindNodeFn(child, component, scope)));
        const tracked = trackNode(child, anchor, parent);
        if (tracked && !inserted.includes(tracked)) inserted.push(tracked);
    });
    return inserted;
}

export function handleFor(el, component, localScope, bindNodeFn) {
    if (!el.hasAttribute('x-for')) return false;

    const attr = el.getAttribute('x-for');
    const [rawItemKey, listExpr] = attr.split(' in ').map(s => s.trim());
    let itemKey = rawItemKey;
    let indexKey = null;

    const destructured = rawItemKey.match(/^\(\s*([^()]+)\s*\)$/);
    if (destructured && destructured[1].includes(',')) {
        const [itemName, idxName] = destructured[1].split(',').map(p => p.trim());
        if (itemName) itemKey = itemName;
        if (idxName) indexKey = idxName;
    }

    const tpl = extractTemplate(el, 'x-for');

    let renderedItems = [];
    let childDisposers = [];

    effect(() => {
        childDisposers.forEach(d => d());
        childDisposers = [];
        renderedItems.forEach(node => node.remove());
        renderedItems = [];

        const currentScope = buildScope(component, localScope);
        let list = listExpr ? evaluate(listExpr, currentScope, component) : [];
        if (list instanceof SignalObject) list = list.value;

        if (Array.isArray(list)) {
            list.forEach((itemData, idx) => {
                const scoped = indexKey
                    ? { ...localScope, [itemKey]: itemData, [indexKey]: idx }
                    : { ...localScope, [itemKey]: itemData };
                renderedItems.push(...insertClone(tpl, component, scoped, bindNodeFn, childDisposers));
            });
        } else if (list && typeof list === "object") {
            for (const key in list) {
                const scoped = indexKey
                    ? { ...localScope, [itemKey]: list[key], [indexKey]: key }
                    : { ...localScope, [itemKey]: list[key] };
                renderedItems.push(...insertClone(tpl, component, scoped, bindNodeFn, childDisposers));
            }
        }
    });

    return true;
}

function handleIf(el, component, localScope, bindNodeFn) {
    const expr = el.getAttribute('x-if');
    if (!expr) return false;

    const tpl = extractTemplate(el, 'x-if');

    let renderedNodes = null;
    let childDisposers = [];

    effect(() => {
        const result = evaluate(expr, buildScope(component, localScope), component);

        if (result && !renderedNodes) {
            renderedNodes = insertClone(tpl, component, localScope, bindNodeFn, childDisposers);
        } else if (!result && renderedNodes) {
            childDisposers.forEach(d => d());
            childDisposers = [];
            renderedNodes.forEach(n => n.remove());
            renderedNodes = null;
        }
    });
    return true;
}

function handleShowHide(el, component, localScope) {
    const isShow = el.hasAttribute('x-show');
    if (!isShow && !el.hasAttribute('x-hide')) return;
    const expr = el.getAttribute(isShow ? 'x-show' : 'x-hide');
    effect(() => {
        let res = evaluate(expr, buildScope(component, localScope), component);
        el.style.display = (isShow ? res : !res) ? '' : 'none';
    });
}

function handleRefs(el, component) {
    if (el.hasAttribute('ref')) {
        component.refs[el.getAttribute('ref')] = el;
    }
}

/**
 * Bind a native DOM event to an expression. Supports the `-prevent` suffix;
 * input/change handlers receive (value, oldValue, event) instead of (event).
 */
function attachEvent(el, eventName, expr, component, localScope) {
    let oldVal = el.value || undefined;
    let prevent = false;
    if (eventName.includes('-prevent')) {
        prevent = true;
        eventName = eventName.replace('-prevent', '').trim();
    }
    el.addEventListener(eventName, (event) => {
        if (prevent) event.preventDefault();
        const scope = { ...buildScope(component, localScope), $event: event };
        if (['input', 'change'].includes(eventName)) {
            invokeExpr(expr, component, scope, [event.target.value, oldVal, event]);
            oldVal = event.target.value;
        } else {
            invokeExpr(expr, component, scope, [event]);
        }
    });
}

function handleEvents(el, component, localScope) {
    [...el.attributes].forEach(attr => {
        if (attr.name.startsWith('-x-on:')) {
            attachEvent(el, attr.name.replace('-x-on:', ''), attr.value, component, localScope);
        }
    });
}

function handleModel(el, component, localScope) {
    if (!el.hasAttribute('x-model')) return;
    const expr = el.getAttribute('x-model');

    const scope = buildScope(component, localScope);
    const returnSignal = !expr.includes('.');
    const parts = expr.split('.');
    const last = parts.pop();
    const targetExpr = parts.join('.') || expr;

    el.addEventListener('input', () => {
        const target = evaluate(targetExpr, scope, component, returnSignal);
        if (target instanceof SignalObject) {
            target.value = el.value;
        } else {
            if (target && last != null) target[last] = el.value;
        }
    });

    effect(() => {
        const target = evaluate(targetExpr, scope, component, returnSignal);
        let next = '';
        if (target instanceof SignalObject) {
            next = target.value;
        } else {
            next = target ? target[last] : '';
        }
        if (el.value !== next) el.value = next;
    });
}

function handleCustomComponent(el, component, localScope) {
    const tagName = el.tagName.toLowerCase();
    if (component.components && component.components[tagName]) {
        const currentScope = buildScope(component, localScope);
        const compDef = component.components[tagName];
        const isFunctional = typeof compDef === 'function';
        const childProps = { children: el.innerHTML };
        const emitListeners = {};
        const nativeEventBindings = [];
        const componentEmits = Array.isArray(compDef.emits) ? compDef.emits : [];

        [...el.attributes].forEach(attr => {
            if (attr.name.startsWith(':')) {
                const expr = attr.value.trim();
                if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(expr) && currentScope[expr] instanceof SignalObject) {
                    childProps[attr.name.substring(1)] = currentScope[expr];
                } else if (!isFunctional) {
                    childProps[attr.name.substring(1)] = computed(() => evaluate(attr.value, currentScope, component));
                } else {
                    childProps[attr.name.substring(1)] = evaluate(attr.value, currentScope, component);
                }
            } else if (attr.name.startsWith('-x-on:')) {
                const eventName = attr.name.replace('-x-on:', '');
                const definedEvent = componentEmits.find(e => caseSensitiveToHyphen(e) === eventName || e.toLowerCase() === eventName.toLowerCase());
                if (definedEvent) {
                    if (!emitListeners[definedEvent]) emitListeners[definedEvent] = [];
                    emitListeners[definedEvent].push((...args) => {
                        const scope = {
                            ...buildScope(component, localScope),
                            $event: args[0],
                            $args: args
                        };
                        invokeExpr(attr.value, component, scope, args);
                    });
                } else {
                    nativeEventBindings.push({ eventName, expr: attr.value });
                }
            } else {
                childProps[attr.name] = attr.value;
            }
        });

        if (boundElements.has(el)) return;

        const childComp = createComponent(compDef, undefined, childProps, component, emitListeners);
        registerDispose(() => childComp.$destroy());
        nativeEventBindings.forEach(({ eventName, expr }) => {
            attachEvent(childComp.$element, eventName, expr, component, localScope);
        });
        el.replaceWith(childComp.$element);

        if (!childComp.data) {
            bindNode(childComp.$element, component, localScope);
        }

        return true;
    }
    return false;
}

function handleTextNode(el, component, localScope) {
    if (!el.textContent.includes('{{')) return;
    const template = el.textContent;
    effect(() => {
        const scope = buildScope(component, localScope);
        el.textContent = template.replace(/\{\{(.+?)\}\}/g, (_, expr) => {
            const val = evaluate(expr.trim(), scope, component);
            return val !== undefined && val !== null ? val : '';
        });
    });
}

// ============================================================
// CORE: Recursive binding function (Traverse)
// ============================================================

function handleAttributes(el, component, localScope) {
    [...el.attributes].forEach(attr => {
        if (attr.name.startsWith(':')) {
            const attrName = attr.name.substring(1);
            const expr = attr.value;
            const baseAttr = (attrName === 'class' || attrName === 'style')
                ? (el.getAttribute(attrName) || '').trim().replace(/;\s*$/, '')
                : '';
            effect(() => {
                const currentScope = buildScope(component, localScope);
                const val = evaluate(expr, currentScope, component);
                if (attrName === 'class') {
                    let dynamicClass = '';
                    if (Array.isArray(val)) {
                        dynamicClass = val.filter(Boolean).join(' ');
                    } else if (val && typeof val === 'object') {
                        dynamicClass = Object.entries(val)
                            .filter(([, v]) => v).map(([k]) => k).join(' ');
                    } else {
                        dynamicClass = val ?? '';
                    }
                    const nextClass = [baseAttr, String(dynamicClass).trim()].filter(Boolean).join(' ');
                    if (nextClass) el.setAttribute('class', nextClass);
                    else el.removeAttribute('class');
                } else if (attrName === 'style') {
                    let dynamicStyle = '';
                    if (val && typeof val === 'object' && !Array.isArray(val)) {
                        dynamicStyle = Object.entries(val)
                            .filter(([, v]) => v !== false && v != null)
                            .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`)
                            .join('; ');
                    } else {
                        dynamicStyle = val ?? '';
                    }
                    const nextStyle = [baseAttr, String(dynamicStyle).trim().replace(/;\s*$/, '')]
                        .filter(Boolean)
                        .join('; ');
                    if (nextStyle) el.setAttribute('style', nextStyle);
                    else el.removeAttribute('style');
                } else if (val !== undefined && val !== null) {
                    if (BOOLEAN_ATTRS.has(attrName)) {
                        if (!val) el.removeAttribute(attrName);
                        else el.setAttribute(attrName, '');
                    } else {
                        el.setAttribute(attrName, val);
                    }
                } else {
                    el.removeAttribute(attrName);
                }
            });
        }
    });
}

const boundElements = new WeakSet();

function bindNode(el, component, localScope) {
    if (el && el.tagName == 'svg') return;
    if (boundElements.has(el)) return;

    if (el.nodeType === 1) {
        // 1. Handle x-for (stops normal descent, handles its own children)
        if (handleFor(el, component, localScope, bindNode)) return;

        // 2. Handle x-if (stops descent if false)
        if (handleIf(el, component, localScope, bindNode)) return;

        // 3. Handle x-show / x-hide
        handleShowHide(el, component, localScope);

        // 4. Handle Refs
        handleRefs(el, component);

        // 5. Handle Events
        handleEvents(el, component, localScope);

        // 6. Handle x-model
        handleModel(el, component, localScope);

        // 7. Handle Nested Components
        if (el != component.$element) {
            if (handleCustomComponent(el, component, localScope)) {
                boundElements.add(el);
                return;
            }
        }
        boundElements.add(el);

        // 8. Handle Colon-Prefixed Attributes
        handleAttributes(el, component, localScope);

        // 9. Recursion on standard children
        let child = el.firstChild;
        while (child) {
            const next = child.nextSibling;
            bindNode(child, component, localScope);
            child = next;
        }
    } else if (el.nodeType === 3) {
        handleTextNode(el, component, localScope);
    }
}


/**
 * Creates the component
 */
export function createComponent(original, data, _props, parent = null, emitListeners = {}) {
    const declaredProps = Array.isArray(original?.props) ? original.props : [];

    // 0. Handle Functional Components (e.g. RouterView, RouterLink)
    if (typeof original === 'function') {
        const el = original({ ...data, ..._props });
        return {
            $element: el,
            appendTo: (parent) => { if (el) parent.appendChild(el); },
            $destroy: () => {}
        };
    }
    // 1. Handle initial Props
    let props = {};
    if (data && data.props) {
        props = typeof data.props === "function" ? data.props() : data.props;
        delete data.props;
    }

    // 2. Setup base component object
    const dataFn = original?.data;
    const component = {
        $element: null,
        appendTo: (parent) => {
            if (component.$element) {
                parent.appendChild(component.$element);
                if (component.mounted) component.mounted();
            }
        },
        refs: {},
        ...original,
        ...data,
        props: {},
        data: {},
        _methods: {},
        _emitListeners: emitListeners || {},
        parent
    };

    component.emit = function (eventName, ...args) {
        const listeners = this._emitListeners[eventName];
        if (listeners) {
            for (const fn of listeners) fn(...args);
        }
    };

    // 3. Initialize Props
    const incomingProps = _props || {};
    const { proxy, signals } = createProps(declaredProps, incomingProps);
    component.props = proxy;
    component._propsSignals = signals;

    // 4. Initialize Data as Signals
    if (dataFn) {
        const initData = typeof dataFn === 'function' ? dataFn.call(component) : dataFn;
        const merged = { ...initData, ...props };
        for (const key in merged) {
            component.data[key] = Signal(merged[key]);
        }
    }

    // 5. Initialize Methods
    for (const key in component) {
        if (typeof component[key] === 'function') {
            component._methods[key] = component[key].bind(component);
        }
    }

    // 6. Handle Template
    let tp = component.setTemplate ? component.setTemplate : component.template;
    if (typeof tp === "function") tp = tp.apply(component);

    if (tp !== undefined && tp !== null) {
        component.$element = html(bubblify(tp));
    }

    // 7. Start Binding
    if (component.$element) {
        component._disposers = collectEffects(() => bindNode(component.$element, component, {}));
    }

    component.$destroy = function () {
        if (this.beforeDestroy) this.beforeDestroy();
        this._disposers?.forEach(d => d());
        if (this.destroy) this.destroy();
    };

    for (const key in globals) {
        if (key.startsWith('$') && globals[key] instanceof SignalObject) {
            Object.defineProperty(component, key, { get: () => globals[key].value, configurable: true });
        }
    }

    // 8. Handle Scoped/Global CSS
    if (component.style && !styleTagsAdded.has(component.compId)) {
        let style = typeof component.style === "function" ? component.style() : component.style;
        const styleTag = html(`<style>${style}</style>`);
        document.head.appendChild(styleTag);
        if (component.compId) styleTagsAdded.add(component.compId);
    }
    // 9. Handle style links
    if (component.styleURL && !styleTagsAdded.has(component.styleURL)) { 
        const url = typeof component.styleURL === "function" ? component.styleURL() : component.styleURL;
        const linkTag = html(`<link rel="stylesheet" href="${url}">`);
        document.head.appendChild(linkTag);
        styleTagsAdded.add(url);
    }
    // 10. Init Lifecycle
    if (component.init) component.init();

    return component;
}

/**
 * @type {{[src:string] : Component}}
 */
const componentCache = {};

function resolveSrc(src) {
    try { return new URL(src).href; } catch { return src; }
}

export async function importComponent(src, data, _props, parent = null, emitListeners = {}) {
    let comp = { appendTo: () => { }, $element: document.createElement('div'), $destroy: () => {} };
    try {
        src = resolveSrc(src);
        let compModule = componentCache[src];
        if (!compModule) {
            compModule = await import(src);
            componentCache[src] = compModule;
        }
        const compDefinition = compModule?.default || compModule;
        if (compDefinition) {
            comp = createComponent(compDefinition, data, _props, parent, emitListeners);
        }
    } catch (e) {
        console.error(e);
    }
    return comp;
}
