let current;
/**
 * 
 * @param {*} initialValue 
 * @returns {[function(): *, function(*): void, function(): void]}
 */
export function createSignal(initialValue) {
    let value = initialValue;
    const subscribers = new Set();
    function refresh() {
        subscribers.forEach(sub => sub())
    }
function
    set(newValue) {
        if (Object.is(newValue, value)) {
            return;
        }
        value = newValue;
        refresh();
    }
    function get() {
        if (current) {
            subscribers.add(current);
        }
        return value;
    }
    return [get, set, refresh]
}
export function effect(fn) {
    current = fn;
    fn();
    current = null;
}
export class SignalObject {
    get;
    set;
    refresh;
    constructor(value) {
        const [get, set, refresh] = createSignal(value);
        this.get = get;
        this.set = set;
        this.refresh = refresh;
    }
    get value() {
        return this.get();
    }
    set value(newValue) {
        this.set(newValue);
    }
    push(newValue) {
        this.value.push(newValue);
        this.refresh();
    }
    pushSignal(newValue) {
        const signal = new SignalObject(newValue);
        this.push(signal);
        return signal;
    }
    overwrite(newSignalObject, key) {
        if (!(newSignalObject instanceof SignalObject)) return;
        if (newSignalObject == this) return;
        // Remember current subscribers so we can re-run them and re-bind to the new signal
        const previousRefresh = this.refresh;
        // Proxy this signal's internals to the incoming signal
        this.get = () => newSignalObject.get();
        this.set = (v) => newSignalObject.set(v);
        this.refresh = () => newSignalObject.refresh();
        // Re-run existing subscribers once so they attach to the new signal
        previousRefresh();
    }
}
export function Signal(value) {
    return new SignalObject(value);
}

export function computed(fn) {
    const derived = new SignalObject();
    effect(() => {
        derived.value = fn();
    });
    return derived;
}

export function watch(source, cb) {
    let oldValue;
    let initialized = false;
    effect(() => {
        const val = typeof source === 'function' ? source() : source.value;
        if (initialized) {
            cb(val, oldValue);
        }
        oldValue = val;
        initialized = true;
    });
}
