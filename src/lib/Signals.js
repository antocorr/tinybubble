let current;

// --- Batching scheduler ---
let pendingEffects = new Set();
let batchScheduled = false;

function flushEffects() {
    batchScheduled = false;
    const batch = [...pendingEffects];
    pendingEffects.clear();
    for (const fn of batch) {
        if (!fn._disposed) fn();
    }
}

function scheduleEffect(fn) {
    pendingEffects.add(fn);
    if (!batchScheduled) {
        batchScheduled = true;
        queueMicrotask(flushEffects);
    }
}

/**
 * Flush all pending effects synchronously.
 * Use when you need the DOM to reflect signal changes immediately.
 */
export function tick() {
    if (batchScheduled) flushEffects();
}

// --- Effect scope ---
let _effectScope = null;

/**
 * Run fn and collect all dispose functions for effects created within.
 * Useful for cleanup when a component is unmounted.
 * @param {Function} fn
 * @returns {Function[]} array of dispose functions
 */
export function collectEffects(fn) {
    const prev = _effectScope;
    const collected = [];
    _effectScope = collected;
    fn();
    _effectScope = prev;
    return collected;
}

/**
 * Reactive effect with auto-tracking. Returns a dispose function.
 * @param {Function} fn
 * @returns {Function} dispose
 */
export function effect(fn) {
    current = fn;
    fn();
    current = null;
    const dispose = () => { fn._disposed = true; };
    if (_effectScope) _effectScope.push(dispose);
    return dispose;
}

export class SignalObject {
    _value;
    _subscribers = new Set();

    constructor(initialValue) {
        this._initValue(initialValue);
    }

    _initValue(value) {
        if (value && typeof value === "object") {
            this._value = new Proxy(value, {
                set: (target, prop, val) => {
                    target[prop] = val;
                    this.refresh();
                    return true;
                }
            });
        } else {
            this._value = value;
        }
    }

    /**
     * Subscribe a callback to this signal's changes.
     * @param {Function} callback
     * @returns {Function} unsubscribe
     */
    subscribe(callback) {
        this._subscribers.add(callback);
        return () => this._subscribers.delete(callback);
    }

    refresh() {
        for (const sub of this._subscribers) {
            if (sub._disposed) { this._subscribers.delete(sub); continue; }
            scheduleEffect(sub);
        }
    }

    get value() {
        if (current) this._subscribers.add(current);
        return this._value;
    }

    set value(newValue) {
        if (!Object.is(this._value, newValue)) {
            this._initValue(newValue);
            this.refresh();
        }
    }

    toJSON()   { return this.value; }
    toString() { return String(this.value); }
    valueOf()  { return this.value; }

    get length() { return this.value?.length; }
}

export function Signal(value) {
    return new SignalObject(value);
}

export function createSignal(initialValue) {
    const sig = new SignalObject(initialValue);
    return [() => sig.value, (v) => sig.value = v, () => sig.refresh()];
}

export function computed(fn) {
    const derived = new SignalObject();
    effect(() => { derived.value = fn(); });
    return derived;
}

export function watch(source, cb) {
    let oldValue;
    let initialized = false;
    effect(() => {
        const val = typeof source === "function" ? source() : source.value;
        if (initialized) cb(val, oldValue);
        oldValue = val;
        initialized = true;
    });
}
