import { effect, Signal, SignalObject } from "./Signals.js";

/**
 * Create an HTML element from a string
 * @param {string} markup 
 * @returns {HTMLElement}
 */
export function html(markup) {
    const tp = document.createElement('template');
    tp.innerHTML = markup.trim();
    return tp.content.firstElementChild;
}

const styleTagsAdded = [];

/**
 * Replaces syntax sugar (@click -> -x-on:click)
 * All @whatever are converted to -x-on:whatever; emit/native is decided later.
 */
function bubblify(str) {
    return str.replace(/@([a-zA-Z0-9_-]+)(\s*=)/g, (_, eventName, eq) => {
        return `-x-on:${eventName}${eq}`;
    });
}

/**
 * Prepares {{ }} strings for replacement
 */
function prepareForReplace(txt) {
    const textArr = txt.split('{{');
    const reactiveIndexes = [];
    for (let i = 0; i < textArr.length; i++) {
        if (textArr[i].includes('}}')) {
            const parts = textArr[i].split('}}');
            textArr[i] = parts[0];
            textArr.splice(i + 1, 0, parts[1]);
            reactiveIndexes.push(i);
        }
    }
    return [textArr, reactiveIndexes];
}

const fnCache = new Map();

/**
 * Helper to evaluate JS expressions within the data context
 * Ex: "count > 5" or "isShow"
 */
function evaluate(expression, scope, context = null, returnResult = true) {
    try {
        // Replace 'this' with '__component__' to allow safe access to component properties
        // This avoids using 'with' or 'eval' while supporting 'this.prop' syntax
        const keys = Object.keys(scope);
        // Filter keys to ensure they are valid JS identifiers AND appear in the expression
        const validKeys = keys.filter(k => {
            return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) && new RegExp(`\\b${k}\\b`).test(expression);
        });

        // Cache Key: Expression + keys (sorted to ensure consistency)
        // We sort validKeys in place, so subsequent usage (map, new Function) uses the sorted order
        validKeys.sort();
        const cacheKey = expression + '::' + validKeys.join(',');

        let fn = fnCache.get(cacheKey);

        if (!fn) {
            // Create function using destructuring-like approach (arguments)
            // 'this' is supported via .apply()
            const body = returnResult ? `return ${expression};` : `${expression};`;
            fn = new Function(...validKeys, body);
            fnCache.set(cacheKey, fn);
        }

        // Extract values in the same order as keys
        const values = validKeys.map(k => {
            return (scope[k] instanceof SignalObject) ? scope[k].value : scope[k];
        });
        return fn.apply(context, values);
    } catch (e) {
        // Suppress ReferenceError (treat as undefined) to avoid console noise for missing variables
        if (!(e instanceof ReferenceError)) {
            console.warn(`Error evaluating expression "${expression}":`, e);
        }
        return undefined;
    }
}

// ============================================================
// DIRECTIVE HANDLERS
// ============================================================

export function handleFor(el, component, localScope, bindNodeFn) {
    if (!el.hasAttribute('x-for')) return false;

    const attr = el.getAttribute('x-for'); // "item in items"
    const [rawItemKey, listKey] = attr.split(' in ').map(s => s.trim());
    let itemKey = rawItemKey;
    let indexKey = null;

    const destructured = rawItemKey.match(/^\(\s*([^()]+)\s*\)$/);
    if (destructured && destructured[1].includes(',')) {
        const [itemName, idxName] = destructured[1].split(',').map(p => p.trim());
        if (itemName) itemKey = itemName;
        if (idxName) indexKey = idxName;
    }

    const anchor = document.createTextNode('');
    const parent = el.parentNode;
    parent.insertBefore(anchor, el);

    // If it's a <template> tag, use its content, otherwise clone the element itself
    const isTemplate = el.tagName === 'TEMPLATE';
    const templateContent = isTemplate ? el.content : el;

    // Remove the original template element from the visible DOM
    el.remove();

    let renderedItems = [];

    effect(() => {
        // Clean up old elements
        renderedItems.forEach(node => node.remove());
        renderedItems = [];

        // Construct scope lazily
        const currentScope = { ...component._methods, ...component._data, ...component.props, ...localScope };

        // Get array from data
        const listSignal = currentScope[listKey];
        const list = listSignal ? (listSignal instanceof SignalObject ? listSignal.value : listSignal) : [];

        if (Array.isArray(list)) {
            list.forEach((itemData, idx) => {
                // Clone the template
                const clone = templateContent.cloneNode(true);               
                // If it was a template tag, cloneNode returns a DocumentFragment
                // We must iterate its children to apply binding
                // If it was a regular element, clone is the element itself
                if (!isTemplate) clone.removeAttribute('x-for');
                const nodesToInsert = isTemplate ? [...clone.childNodes] : [clone];

                nodesToInsert.forEach(child => {
                    // Pass single item to scope
                    const scoped = indexKey ? { ...localScope, [itemKey]: itemData, [indexKey]: idx } : { ...localScope, [itemKey]: itemData };                    
                    child._$localScope = scoped;
                    // Insert before binding so custom components have a parent (replaceWith needs it)
                    parent.insertBefore(child, anchor);
                    if (bindNodeFn) {
                        bindNodeFn(child, component, scoped);
                    }

                    // Track the actual node now in the DOM (may differ if replaced)
                    let tracked = child;
                    if (!tracked.isConnected || tracked.parentNode !== parent) {
                        const candidate = anchor.previousSibling;
                        if (candidate && candidate !== anchor && candidate.parentNode === parent) {
                            tracked = candidate;
                        } else {
                            tracked = null;
                        }
                    }
                    if (tracked && !renderedItems.includes(tracked)) {
                        renderedItems.push(tracked);
                    }
                });
            });
        }
    });

    return true; // Stop recursion on this branch (handled internally)
}

function handleIf(el, component, localScope, bindNodeFn) {
    if (!el.getAttribute('x-if')) return false;

    const expr = el.getAttribute('x-if');
    const anchor = document.createComment('x-if-anchor');
    el.parentNode.insertBefore(anchor, el);

    const isTemplate = el.tagName === 'TEMPLATE';
    const templateContent = isTemplate ? el.content : el;
    el.remove();

    let renderedNode = null;

    effect(() => {
        const currentScope = { ...component._methods, ...component._data, ...component.props, ...localScope };
        const result = evaluate(expr, currentScope, component);

        if (result) {
            if (!renderedNode) {
                const clone = templateContent.cloneNode(true);

                // If template, insert children. If element, insert element.
                if (!isTemplate) clone.removeAttribute('x-if');
                const nodesToInsert = isTemplate ? [...clone.childNodes] : [clone];

                nodesToInsert.forEach(child => {
                    bindNodeFn(child, component, localScope);
                    anchor.parentNode.insertBefore(child, anchor);
                });
                // Keep track for removal
                renderedNode = nodesToInsert;
            }
        } else {
            if (renderedNode) {
                renderedNode.forEach(n => n.remove());
                renderedNode = null;
            }
        }
    });
    return true;
}

function handleShowHide(el, component, localScope) {
    if (el.hasAttribute('x-show') || el.hasAttribute('x-hide')) {
        const isShow = el.hasAttribute('x-show');
        const expr = el.getAttribute(isShow ? 'x-show' : 'x-hide');
        effect(() => {
            const currentScope = { ...component._methods, ...component._data, ...component.props, ...localScope };
            let res = evaluate(expr, currentScope, component);
            if (!isShow) res = !res;
            el.style.display = res ? '' : 'none';
        });
    }
}

function handleRefs(el, component) {
    if (el.hasAttribute('ref')) {
        component.refs[el.getAttribute('ref')] = el;
    }
}

function handleEvents(el, component, localScope) {
    [...el.attributes].forEach(attr => {
        if (attr.name.startsWith('-x-on:')) {
            let eventName = attr.name.replace('-x-on:', ''); // click, change...
            const expr = attr.value;
            let oldVal = el.value || undefined;
            let prevent = false;
            if (eventName.includes('-prevent')) {
                prevent = true;
                eventName = eventName.replace('-prevent', '').trim();
            }
            el.addEventListener(eventName, (event) => {
                if (prevent) {
                    event.preventDefault();
                }
                // available in eval as $event
                const currentScope = { ...component._methods, ...component._data, ...component.props, ...localScope };
                const eventScope = { ...currentScope, $event: event };
                if (typeof expr == "string" && !expr.includes(' ') && !expr.includes('(')) {
                    if (typeof component[expr] == "function") {
                        if (['input', 'change'].includes(eventName)) {
                            component[expr](event.target.value, oldVal);
                            oldVal = event.target.value;
                        } else {
                            component[expr](event);
                        }
                    }
                } else {
                    const res = evaluate(expr, eventScope, component);
                    if (typeof res === 'function') {
                        res(event);
                    }
                }
            });
        }
    });
}

function handleModel(el, component, localScope) {
    if (el.hasAttribute('x-model')) {
        const key = el.getAttribute('x-model');
        // We need scope to find the signal
        const currentScope = { ...component._methods, ...component._data, ...component.props, ...localScope };
        if (currentScope[key] && currentScope[key] instanceof SignalObject) {
            const signal = currentScope[key];
            // Init
            el.value = signal.value;
            // DOM Listener
            el.addEventListener('input', () => {
                signal.value = el.value
            });
            // Signal Listener
            effect(() => {
                if (el.value !== signal.value) el.value = signal.value;
            });
        }
    }
}

function handleCustomComponent(el, component, localScope) {
    // Handle Nested Components (custom tags defined in component.components)
    const tagName = el.tagName.toLowerCase();
    if (component.components && component.components[tagName]) {
        const currentScope = { ...component._methods, ...component._data, ...component.props, ...localScope };
        const compDef = component.components[tagName];
        const childProps = { children: el.innerHTML };
        const emitListeners = {};
        const nativeEventBindings = [];
        const componentEmits = Array.isArray(compDef.emits) ? compDef.emits : [];
        [...el.attributes].forEach(attr => {
            if (attr.name.startsWith(':')) {
                // :prop="val" -> evaluate expression
                const expr = attr.value.trim();
                // If the expression is a bare identifier that resolves to a SignalObject,
                // forward the signal itself instead of its current value so children can bind to it.
                if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(expr) && currentScope[expr] instanceof SignalObject) {
                    childProps[attr.name.substring(1)] = currentScope[expr];
                } else {
                    childProps[attr.name.substring(1)] = evaluate(attr.value, currentScope, component);
                }
            } else if (attr.name.startsWith('-x-on:')) {
                const eventName = attr.name.replace('-x-on:', '');
                if (componentEmits.includes(eventName)) {
                    if (!emitListeners[eventName]) emitListeners[eventName] = [];
                    emitListeners[eventName].push((...args) => {
                        const scoped = {
                            ...component._methods,
                            ...component._data,
                            ...component.props,
                            ...localScope,
                            $event: args[0],
                            $args: args
                        };
                        const expr = attr.value;
                        if (typeof expr === "string" && !expr.includes(' ') && !expr.includes('(')) {
                            if (typeof component[expr] === "function") {
                                if (args.length === 1) {
                                    component[expr](args[0]);
                                } else {
                                    component[expr](...args);
                                }
                                return;
                            }
                        }
                        const res = evaluate(expr, scoped, component);
                        if (typeof res === 'function') {
                            res(...args);
                        }
                    });
                } else {
                    nativeEventBindings.push({ eventName, expr: attr.value });
                }
            } else {
                // prop="val" -> static string
                childProps[attr.name] = attr.value;
            }
        });
        if (boundElements.has(el)) {
            return;
        }
        const childComp = createComponent(compDef, undefined, childProps, component, emitListeners);
        nativeEventBindings.forEach(({ eventName, expr }) => {
            childComp.$element.addEventListener(eventName, (event) => {
                const scope = { ...component._methods, ...component._data, ...component.props, ...localScope };
                const eventScope = { ...scope, $event: event };
                if (typeof expr == "string" && !expr.includes(' ') && !expr.includes('(')) {
                    if (typeof component[expr] == "function") {
                        if (['input', 'change'].includes(eventName)) {
                            component[expr](event.target.value);
                        } else {
                            component[expr](event);
                        }
                    }
                } else {
                    const res = evaluate(expr, eventScope, component);
                    if (typeof res === 'function') {
                        res(event);
                    }
                }
            });
        });
        el.replaceWith(childComp.$element);

        // If it's a functional component (no internal state), we must bind it to the current scope
        // so that slots/children (like {{item.label}}) can be interpolated.
        if (!childComp._data) {
            bindNode(childComp.$element, component, localScope);
        }

        return true; // Node replaced, stop
    }
    return false;
}

function handleTextNode(el, component, localScope) {
    if (el.textContent.includes('{{')) {
        // Ignore legacy blocks if present
        if (el.textContent.includes('#each') || el.textContent.includes('/each')) return;

        const [textArr, reactiveIndexes] = prepareForReplace(el.textContent);

        effect(() => {
            const currentScope = { ...component._methods, ...component._data, ...component.props, ...localScope };
            let newText = '';
            for (let i = 0; i < textArr.length; i++) {
                if (reactiveIndexes.includes(i)) {
                    const keyExpr = textArr[i].trim();
                    // Try to evaluate expression
                    const val = evaluate(keyExpr, currentScope, component);
                    newText += (val !== undefined && val !== null) ? val : '';
                } else {
                    newText += textArr[i];
                }
            }
            el.textContent = newText;
        });
    }
}

// ============================================================
// CORE: Recursive binding function (Traverse)
// ============================================================

function handleAttributes(el, component, localScope) {
    [...el.attributes].forEach(attr => {
        if (attr.name.startsWith(':')) {
            const attrName = attr.name.substring(1);
            const expr = attr.value;
            effect(() => {
                const currentScope = { ...component._methods, ...component._data, ...component.props, ...localScope };
                const val = evaluate(expr, currentScope, component);
                if (val !== undefined && val !== null) {
                    if (['disabled'].includes(attrName)) {
                        if (val === false) {
                            el.removeAttribute(attrName);
                        } else {
                            el.setAttribute(attrName, val);
                        }
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
const boundElements = new Set();
function bindNode(el, component, localScope) {
    if (el && el.tagName == 'svg') {
        return;
    }
    if (boundElements.has(el)) {
        return;
    }
    // A. Handle Elements (Node Type 1)
    if (el.nodeType === 1) {

        // 1. Handle x-for (Stops normal descent, handles its own children)
        if (handleFor(el, component, localScope, bindNode)) return;

        // 2. Handle x-if (Stops descent if false)
        if (handleIf(el, component, localScope, bindNode)) return;

        // 3. Handle x-show / x-hide
        handleShowHide(el, component, localScope);

        // 4. Handle Refs
        handleRefs(el, component);

        // 5. Handle Events (-x-on:click, -x-on:change, etc.)
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
    }

    // B. Handle Text Nodes (Interpolation {{ }})
    else if (el.nodeType === 3) {
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
            appendTo: (parent) => {
                if (el) parent.appendChild(el);
            }
        };
    }

    // 1. Handle initial Props
    let props = {};
    if (data && data.props) {
        props = typeof data.props === "function" ? data.props() : data.props;
        delete data.props;
    }

    // 2. Setup base component object
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
        _data: {}, // Internal reactive data
        _methods: {}, // Bound methods
        _emitListeners: emitListeners || {},
        parent
    };

    component.emit = function (eventName, ...args) {
        const listeners = this._emitListeners[eventName];
        if (listeners) {
            for (const fn of listeners) {
                fn(...args);
            }
        }
    };

    // 3. Initialize Props as Signals (include declared props even if not passed)
    const incomingProps = _props || {};
    const propKeys = new Set([...declaredProps, ...Object.keys(incomingProps)]);
    for (const k of propKeys) {
        const incoming = incomingProps[k];
        component.props[k] = incoming instanceof SignalObject ? incoming : Signal(incoming);
    }

    // 4. Initialize Data as Signals
    if (component.data) {
        const initData = typeof component.data === "function" ? component.data() : component.data;
        // Merge data and props for initial scope
        const merged = { ...initData, ...props };

        for (const key in merged) {
            const signal = Signal(merged[key]);
            Object.defineProperty(component._data, key, {
                get() {
                    return signal;
                },
                set(newVal) {
                    if (newVal instanceof SignalObject) {
                        signal.overwrite(newVal, key);
                    } else {
                        signal.value = newVal;
                    }
                },
                enumerable: true,
                configurable: true
            });
        }
    }

    // 5. Initialize Methods (Bind to component)
    for (const key in component) {
        if (typeof component[key] === 'function') {
            component._methods[key] = component[key].bind(component);
        }
    }

    // 6. Handle Template (Legacy {{#each}} replacement)
    let tp = component.setTemplate ? component.setTemplate : component.template;
    if (typeof tp === "function") tp = tp.apply(component);

    if (tp) {
        // Convert old handlebars syntax to x-for on template
        const regex = /{{#each\s+(\w+)\s+in\s+(\w+)}}([\s\S]*?){{\/each}}/g;
        tp = tp.replace(regex, (match, item, array, content) => {
            return `<template x-for="${item} in ${array}"><div>${content}</div></template>`;
        });
        component.$element = html(bubblify(tp));
    }

    // 7. Proxy Data and Props to allow this.property access
    // const proxySignal = (target, source) => {
    //     for (const key in source) {
    //         if (!(key in target)) {
    //             Object.defineProperty(target, key, {
    //                 get: () => source[key].value,
    //                 set: (v) => source[key].value = v,
    //                 configurable: true,
    //                 enumerable: true
    //             });
    //         }
    //     }
    // };
    // proxySignal(component, component._data);
    // proxySignal(component, component.props);

    // 8. Start Binding
    if (component.$element) {
        bindNode(component.$element, component, {});
    }

    // 9. Handle Scoped/Global CSS
    if (component.style && !styleTagsAdded.includes(component.compId)) {
        let style = typeof component.style === "function" ? component.style() : component.style;
        const styleTag = document.createElement('style');
        styleTag.innerHTML = style;
        document.head.appendChild(styleTag);
        if (component.compId) styleTagsAdded.push(component.compId);
    }

    // 10. Init Lifecycle
    if (component.init) {
        component.init();
    }

    return component;
}
/**
 * @type {{[src:string] : Component}} componentCache es componentCache['../abc/] = Commponent
 */
const componentCache = {};
function resolveSrc(src) {
    // Allow absolute URLs or protocol-relative imports to pass through
    const isAbsolute = /^(?:[a-z]+:)?\/\//i.test(src);
    if (isAbsolute) return src;
    try {
        return new URL(src).href;
    } catch (e) {
        return src;
    }
}
export async function importComponent(src, data, _props, parent = null, emitListeners = {}) {
    let comp = { appendTo: () => { }, $element: document.createElement('div') };
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
        console.warn("Error importing component!");
    }
    return comp;
}
