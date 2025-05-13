function generateUUID() {
    var dt = new Date().getTime();
    var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
}
export class EventTopic {
    listeners = {};
    topics = {};
    name = null;
    $state = {};
    $obj = null;
    parent = null;
    propagate = false;
    id = null;
    constructor(parent = null, name = null){
        this.parent = parent
        this.id = generateUUID();
        this.name = name;
    }
    /**
     * 
     * @param {string} event 
     * @param {function} callback 
     * @param {string} id 
     * @returns {this}
     */
    addEventListener(event, callback, id = null, single = false) {
        id = id || generateUUID()
        if (this.listeners[event]) {
            this.listeners[event].push({ callback: callback, id: id, single });
            return this;
        }
        this.listeners[event] = [{ callback: callback, id: id, single }];
        return this;
    }
    removeEventListener(event, callback = null, id = null) {
        if (!this.listeners[event]) {
            return this;
        }
        let i = 0;
        for (var listener of this.listeners[event]) {
            if (id && listener.id == id) {
                this.listeners[event].splice(i, 1);
                return this;
            }
            if (callback && listener.callback == callback) {
                this.listeners[event].splice(i, 1);
                return this;
            }
            i += 1;
        }
        return this;
    }
    on(event, callback, id = null) {
        this.addEventListener(event, callback, id);
        return this;
    }
    off(event, callback = null, id = null) {
        this.removeEventListener(event, callback, id);
        return this;
    }
    removeAllListeners() {
        this.listeners = {};
        return this;
    }
    emit(event) {
        if (this.listeners[event]) {
            var args = Array.prototype.slice.call(arguments);
            event = args.shift();
            for (var listener of this.listeners[event]) {
                const thisArg = this.$obj || this;
                listener.callback.apply(thisArg, args);
                if (listener.single) {
                    this.removeEventListener(event, listener.callback, listener.id);
                }
            }
        }
        return this;
    }
    one(event, callback) {
        this.addEventListener(event, callback, null, true)
    }
    once(event){
        var args = Array.prototype.slice.call(arguments);
        this.emit.apply(this, args);
        this.removeEventListener(event);
        return this;
    }
    bubble(event) {
        this.emit(event);
        if(this.parent && this.parent.emit){
            var args = Array.prototype.slice.call(arguments);
            this.parent.bubble(this, args);
        }
        return this;
    }
    /**
     * 
     * @param {string} topic 
     * @returns {EventTopic}
     */
    topic(topic) {
        if (!this.topics[topic]) {
            this.topics[topic] = new EventTopic(this, topic);
        }
        return this.topics[topic];
    }
    remove(topic) {
        if (this.topics[topic]) {
            delete this.topics[topic];
        }
        return this;
    }
    copyFunctionalities(obj){
        const self = this;
        for(const fn of ['addEventListener', 'removeEventListener', 'on', 'off', 'emit', 'topic']){
            obj[fn] = function () {
               const  args = Array.prototype.slice.call(arguments);
               self[fn].apply(self, args);
            }            
        }
    }
    setupApc(obj) {
        this.$obj = obj;
    }
    apc(func, args) {
        if (!this.$obj || !this.$obj[func]) {
            return;
        }
        args = Array.prototype.slice.call(arguments);
        func = args.shift();
        this.$obj[func].apply(this.$obj, args);
    }
    aset(key, val) {
        if (!this.$obj) {
            return;
        }
        this.$obj[key] = val;
    }
}