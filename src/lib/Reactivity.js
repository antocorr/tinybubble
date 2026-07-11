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

/**
 * Register a global helper function available in all templates as $name(...)
 * @param {string} name - helper name, with or without leading $
 * @param {Function} fn
 */
export function registerHelper(name, fn) {
    globals[name.startsWith('$') ? name : `$${name}`] = fn;
}

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

/**
 * Resolve a value that may be a function (called with `ctx` as this)
 */
function resolve(v, ctx) {
    return typeof v === "function" ? v.call(ctx) : v;
}

// ============================================================
// SCOPE AND PROPS HELPERS
// ============================================================

/**
 * Build the scope for template evaluation.
 * Uses _propsSignals for reactivity in templates.
 * `globals + methods` are fixed once the component mounts and are cached
 * permanently. `data` and `propsSignals` are read live on every call —
 * `data` in particular can grow after the first render (e.g. a Signal
 * added inside a lifecycle hook), so it must never be snapshotted.
 * Consumers must read keys (`in` / property access), never spread/enumerate.
 */
function buildScope(component, localScope) {
    let base = component._scopeBase;
    if (!base) {
        base = component._scopeBase = Object.assign(Object.create(globals), component._methods);
    }
    return Object.assign(Object.create(base), component.data, component._propsSignals, localScope);
}

function caseSensitiveToHyphen(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Reactively evaluate `expr` in the component scope and apply the result.
 */
function bindExpr(expr, component, localScope, apply) {
    effect(() => apply(evaluate(expr, buildScope(component, localScope), component)));
}

/**
 * Match `key` against declared names (props/emits), normalizing camelCase/kebab-case
 */
function matchDeclared(names, key) {
    return names.find(n => caseSensitiveToHyphen(n) === key || n.toLowerCase() === key.toLowerCase());
}

/**
 * Create props object with Proxy for JS access and signals for template
 */
function createProps(propKeys, incoming) {
    const _signals = {};
    for (const k in incoming) {
        const definedKey = matchDeclared(propKeys, k) || k;
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

function parseFor(attr) {
    const [rawItemKey, listExpr] = attr.split(' in ').map(s => s.trim());
    let itemKey = rawItemKey;
    let indexKey = null;

    const destructured = rawItemKey.match(/^\(\s*([^()]+)\s*\)$/);
    if (destructured && destructured[1].includes(',')) {
        const [itemName, idxName] = destructured[1].split(',').map(p => p.trim());
        if (itemName) itemKey = itemName;
        if (idxName) indexKey = idxName;
    }
    return { itemKey, indexKey, listExpr };
}

/**
 * Parse the x-for expression and capture :key before the attr binder sees it
 */
function prepareFor(el) {
    const parsed = parseFor(el.getAttribute('x-for'));
    parsed.keyExpr = el.getAttribute(':key');
    el.removeAttribute(':key');
    return parsed;
}

/**
 * Dispose child effects and remove rendered nodes. Shared teardown of x-for / x-if.
 */
function teardown(disposers, nodes) {
    disposers.forEach(d => d());
    nodes?.forEach(n => n.remove());
}

/**
 * Local scope for one loop item (index/key added only when requested)
 */
function itemScope(localScope, itemKey, item, indexKey, idx) {
    const scope = { ...localScope, [itemKey]: item };
    if (indexKey) scope[indexKey] = idx;
    return scope;
}

function evalList(listExpr, component, localScope) {
    const list = listExpr ? evaluate(listExpr, buildScope(component, localScope), component) : [];
    return list instanceof SignalObject ? list.value : list;
}

/**
 * Set up the reactive list-render effect for a prepared template descriptor.
 * Shared by `x-for` on a normal element and `x-for` on a component root.
 */
function runForEffect(tpl, parsed, component, localScope, bindNodeFn) {
    if (parsed.keyExpr) return runKeyedForEffect(tpl, parsed, component, localScope, bindNodeFn);
    const { itemKey, indexKey, listExpr } = parsed;
    let renderedItems = [];
    let childDisposers = [];

    effect(() => {
        teardown(childDisposers, renderedItems);
        childDisposers = [];
        renderedItems = [];

        const list = evalList(listExpr, component, localScope);
        const pairs = Array.isArray(list) ? list.map((v, i) => [v, i])
            : list && typeof list === "object" ? Object.entries(list).map(([k, v]) => [v, k])
            : [];

        pairs.forEach(([itemData, idx]) => {
            const scoped = itemScope(localScope, itemKey, itemData, indexKey, idx);
            renderedItems.push(...insertClone(tpl, component, scoped, bindNodeFn, childDisposers));
        });
    });

    // Teardown: effect dispose alone never removes rendered DOM or child effects.
    registerDispose(() => teardown(childDisposers, renderedItems));
}

/**
 * Keyed list-render: reuse DOM nodes and child effects across list changes,
 * preserving each item's state. The item is exposed as a Signal so bindings
 * re-track when the same key receives new data — no re-bind, no recreate.
 */
function runKeyedForEffect(tpl, parsed, component, localScope, bindNodeFn) {
    const { itemKey, indexKey, listExpr, keyExpr } = parsed;
    let entries = new Map();   // key -> { nodes, disposers, itemSig, indexSig }

    effect(() => {
        let list = evalList(listExpr, component, localScope);
        if (!Array.isArray(list)) list = [];

        const anchor = tpl.anchor;
        const parent = anchor.parentNode;
        const next = new Map();

        list.forEach((itemData, idx) => {
            const keyScope = itemScope(localScope, itemKey, itemData, indexKey, idx);
            const key = evaluate(keyExpr, keyScope, component);

            let entry = entries.get(key);
            if (entry) {
                entry.itemSig.value = itemData;              // reuse: child bindings re-track
                if (entry.indexSig) entry.indexSig.value = idx;
                entries.delete(key);
            } else {
                const itemSig = Signal(itemData);
                const indexSig = indexKey ? Signal(idx) : null;
                const scope = itemScope(localScope, itemKey, itemSig, indexKey, indexSig);
                const disposers = [];
                const nodes = insertClone(tpl, component, scope, bindNodeFn, disposers);
                entry = { nodes, disposers, itemSig, indexSig };
            }
            entry.nodes.forEach(n => parent.insertBefore(n, anchor));   // move into order
            next.set(key, entry);
        });

        entries.forEach(e => teardown(e.disposers, e.nodes));           // leftovers were removed
        entries = next;
    });

    registerDispose(() => entries.forEach(e => teardown(e.disposers, e.nodes)));
}

export function handleFor(el, component, localScope, bindNodeFn) {
    if (!el.hasAttribute('x-for')) return false;
    const parsed = prepareFor(el);
    const tpl = extractTemplate(el, 'x-for');
    runForEffect(tpl, parsed, component, localScope, bindNodeFn);
    return true;
}

/**
 * Set up the reactive conditional-render effect for a prepared template descriptor.
 * Shared by `x-if` on a normal element and `x-if` on a component root.
 */
function runIfEffect(tpl, expr, component, localScope, bindNodeFn) {
    let renderedNodes = null;
    let childDisposers = [];

    bindExpr(expr, component, localScope, result => {
        if (result && !renderedNodes) {
            renderedNodes = insertClone(tpl, component, localScope, bindNodeFn, childDisposers);
        } else if (!result && renderedNodes) {
            teardown(childDisposers, renderedNodes);
            childDisposers = [];
            renderedNodes = null;
        }
    });

    registerDispose(() => teardown(childDisposers, renderedNodes));
}

function handleIf(el, component, localScope, bindNodeFn) {
    const expr = el.getAttribute('x-if');
    if (!expr) return false;
    const tpl = extractTemplate(el, 'x-if');
    runIfEffect(tpl, expr, component, localScope, bindNodeFn);
    return true;
}

/**
 * Render a root element that carries x-for / x-if, reusing the component's own
 * comment anchor as the directive anchor. The root element is never inserted in
 * the DOM itself; it is cloned per render by insertClone, exactly like a template.
 */
function renderRootDirective(component, rootEl, directive, anchor, bindNodeFn) {
    const isTemplate = rootEl.tagName === 'TEMPLATE';
    const tpl = {
        anchor,
        isTemplate,
        content: isTemplate ? rootEl.content : rootEl,
        attrName: directive
    };
    if (directive === 'x-for') {
        runForEffect(tpl, prepareFor(rootEl), component, {}, bindNodeFn);
    } else {
        runIfEffect(tpl, rootEl.getAttribute('x-if'), component, {}, bindNodeFn);
    }
}

function handleHtml(el, component, localScope) {
    if (!el.hasAttribute('x-html')) return false;
    bindExpr(el.getAttribute('x-html'), component, localScope, val => {
        el.innerHTML = val ?? '';
    });
    return true;
}

function handleShowHide(el, component, localScope) {
    const isShow = el.hasAttribute('x-show');
    if (!isShow && !el.hasAttribute('x-hide')) return;
    bindExpr(el.getAttribute(isShow ? 'x-show' : 'x-hide'), component, localScope, res => {
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
        const scope = buildScope(component, localScope);
        scope.$event = event;
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
    if (boundElements.has(el)) return false;
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
                const definedEvent = matchDeclared(componentEmits, eventName);
                if (definedEvent) {
                    if (!emitListeners[definedEvent]) emitListeners[definedEvent] = [];
                    emitListeners[definedEvent].push((...args) => {
                        const scope = buildScope(component, localScope);
                        scope.$event = args[0];
                        scope.$args = args;
                        invokeExpr(attr.value, component, scope, args);
                    });
                } else {
                    nativeEventBindings.push({ eventName, expr: attr.value });
                }
            } else {
                childProps[attr.name] = attr.value;
            }
        });

        const childComp = createComponent(compDef, undefined, childProps, component, emitListeners);
        registerDispose(() => childComp.$destroy());
        nativeEventBindings.forEach(({ eventName, expr }) => {
            attachEvent(childComp.$element, eventName, expr, component, localScope);
        });
        el.replaceWith(childComp.$element);
        childComp._renderRoot?.();

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

function toClassString(val) {
    if (Array.isArray(val)) return val.filter(Boolean).join(' ');
    if (val && typeof val === 'object') {
        return Object.entries(val).filter(([, v]) => v).map(([k]) => k).join(' ');
    }
    return val ?? '';
}

function toStyleString(val) {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
        return Object.entries(val)
            .filter(([, v]) => v !== false && v != null)
            .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`)
            .join('; ');
    }
    return val ?? '';
}

function handleAttributes(el, component, localScope) {
    [...el.attributes].forEach(attr => {
        if (!attr.name.startsWith(':')) return;
        const attrName = attr.name.substring(1);
        const baseAttr = (attrName === 'class' || attrName === 'style')
            ? (el.getAttribute(attrName) || '').trim().replace(/;\s*$/, '')
            : '';
        bindExpr(attr.value, component, localScope, val => {
            if (attrName === 'class') {
                const next = [baseAttr, String(toClassString(val)).trim()].filter(Boolean).join(' ');
                if (next) el.setAttribute('class', next);
                else el.removeAttribute('class');
            } else if (attrName === 'style') {
                const next = [baseAttr, String(toStyleString(val)).trim().replace(/;\s*$/, '')]
                    .filter(Boolean).join('; ');
                if (next) el.setAttribute('style', next);
                else el.removeAttribute('style');
            } else if (val === undefined || val === null) {
                el.removeAttribute(attrName);
            } else if (BOOLEAN_ATTRS.has(attrName)) {
                if (val) el.setAttribute(attrName, '');
                else el.removeAttribute(attrName);
            } else {
                el.setAttribute(attrName, val);
            }
        });
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

        // 3. Handle x-html
        if (handleHtml(el, component, localScope)) return;

        // 4. Handle x-show / x-hide
        handleShowHide(el, component, localScope);

        // 5. Handle Refs
        handleRefs(el, component);

        // 6. Handle Events
        handleEvents(el, component, localScope);

        // 7. Handle x-model
        handleModel(el, component, localScope);

        // 8. Handle Nested Components
        if (el != component.$element) {
            if (handleCustomComponent(el, component, localScope)) {
                boundElements.add(el);
                return;
            }
        }
        boundElements.add(el);

        // 9. Handle Colon-Prefixed Attributes
        handleAttributes(el, component, localScope);

        // 10. Recursion on standard children
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
        props = resolve(data.props, data);
        delete data.props;
    }

    // 2. Setup base component object
    const dataFn = original?.data;
    const component = {
        $element: null,
        appendTo: (parent) => {
            if (component.$element) {
                parent.appendChild(component.$element);
                component._renderRoot?.();
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
        const initData = resolve(dataFn, component);
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
    const tp = resolve(component.setTemplate || component.template, component);

    if (tp !== undefined && tp !== null) {
        const rootEl = html(bubblify(tp));
        const rootDirective = rootEl.hasAttribute('x-for') ? 'x-for'
            : rootEl.hasAttribute('x-if') ? 'x-if' : null;

        if (rootDirective) {
            // Root carries a structural directive: the component "is" a comment
            // anchor. Content renders as siblings on (re)mount, so it survives
            // persistent router pages that wipe the outlet between navigations.
            const anchor = document.createComment(rootDirective + ':root');
            component.$element = anchor;
            component._renderRoot = () => {
                component._disposers?.forEach(d => d());
                component._disposers = collectEffects(
                    () => renderRootDirective(component, rootEl, rootDirective, anchor, bindNode)
                );
            };
        } else {
            // 7. Start Binding (standard single-element root)
            component.$element = rootEl;
            component._disposers = collectEffects(() => bindNode(component.$element, component, {}));
        }
    }

    component.$destroy = function () {
        if (this.beforeDestroy) this.beforeDestroy();
        this._disposers?.forEach(d => d());
        if (this.destroy) this.destroy();
    };

    for (const key in globals) {
        if (!key.startsWith('$')) continue;
        if (globals[key] instanceof SignalObject) {
            Object.defineProperty(component, key, { get: () => globals[key].value, configurable: true });
        } else if (typeof globals[key] === 'function') {
            component[key] = globals[key];
        }
    }

    // 8. Handle Scoped/Global CSS
    if (component.style && !styleTagsAdded.has(component.compId)) {
        const style = resolve(component.style, component);
        document.head.appendChild(html(`<style>${style}</style>`));
        if (component.compId) styleTagsAdded.add(component.compId);
    }
    // 9. Handle style links
    if (component.styleURL && !styleTagsAdded.has(component.styleURL)) {
        const url = resolve(component.styleURL, component);
        document.head.appendChild(html(`<link rel="stylesheet" href="${url}">`));
        styleTagsAdded.add(url);
    }
    // 10. Init Lifecycle
    if (component.init) component.init();

    // 11. Call mounted after binding is complete
    if (component.mounted) component.mounted();

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
