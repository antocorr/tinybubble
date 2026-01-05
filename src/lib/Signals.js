let current;

/**
 * Basic dependency tracking
 * @param {Function} fn 
 */
export function effect(fn) {
    current = fn;
    fn();
    current = null;
}

export class SignalObject {
    _value;
    _subscribers = new Set();
    _linkedSignal = null;
    _linkUnsubscribe = null;

    constructor(initialValue) {
        this._initValue(initialValue);
    }

    _initValue(value) {
        if (value && typeof value === "object" && value.constructor === Object) {
            // Create a dedicated proxy for this signal
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
     * Subscribe a callback to this signal changes
     * @param {Function} callback 
     * @returns {Function} unsubscribe
     */
    subscribe(callback) {
        this._subscribers.add(callback);
        return () => this._subscribers.delete(callback);
    }

    refresh() {
        this._subscribers.forEach((sub) => sub());
    }

    get value() {
        if (current) {
            this._subscribers.add(current);
        }

        if (this._linkedSignal) {
            // SHIELDING: Prevent the active effect from subscribing to the upstream signal directly
            // We want dependencies to flow: effect -> this -> upstream
            const savedCurrent = current;
            current = null;
            const res = this._linkedSignal.value;
            current = savedCurrent;
            return res;
        }

        return this._value;
    }

    set value(newValue) {
        // Cleanup previous link if any
        if (this._linkedSignal) {
            if (this._linkUnsubscribe) {
                this._linkUnsubscribe();
                this._linkUnsubscribe = null;
            }
            this._linkedSignal = null;
        }

        // Check for linking
        if (newValue instanceof SignalObject) {
            // Prevent circular linking or self-linking if possible (basic check)
            if (newValue === this) return;
            
            this._linkedSignal = newValue;
            // Subscribe to the upstream signal so we can propagate notifications
            this._linkUnsubscribe = newValue.subscribe(() => {
                this.refresh();
            });
            // Notify our subscribers that our value (resolved via link) might have changed
            this.refresh();
            return;
        }

        // Normal assignment
        // If it was linked, strictly speaking we are now breaking the link and setting a new value
        // Optimization: check equality if not an object to avoid spurious updates
        if (!Object.is(this._value, newValue)) {
             this._initValue(newValue);
             this.refresh();
        }
    }
    // Proxy-like methods to maintain compatibility or ease of use
    toJSON() {
        return this.value;
    }
    toString() {
        return String(this.value);
    }
    toBoolean() {
        return Boolean(this.value);
    }
    valueOf() {
        return this.value;
    }

    get length() {
        return this.value?.length;
    }
}

/**
 * Compatibility wrapper for functional style signals if needed, 
 * or just a factory for SignalObject.
 */
export function createSignal(initialValue) {
   const sig = new SignalObject(initialValue);
   const get = () => sig.value;
   const set = (v) => sig.value = v;
   const refresh = () => sig.refresh();
   return [get, set, refresh];
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
        const val = typeof source === "function" ? source() : source.value;
        if (initialized) {
            cb(val, oldValue);
        }
        oldValue = val;
        initialized = true;
    });
}
