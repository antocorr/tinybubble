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
        this.value.push(new SignalObject(newValue));
        this.refresh();
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