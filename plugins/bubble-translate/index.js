class Translator {
    #strings = {};
    #cache = {};
    #lang;
    #cfg;

    static #defaults = {
        defaultLang: "en",
        storageKey: "bubble-translate.lang",
        url: (lang) => `/localization/${lang}.json`,
    };

    constructor(config = {}) {
        this.#cfg = { ...Translator.#defaults, ...config };
        this.#lang = this.#readStorage();
    }

    #readStorage() {
        try {
            return localStorage.getItem(this.#cfg.storageKey) || this.#cfg.defaultLang;
        } catch {
            return this.#cfg.defaultLang;
        }
    }

    #writeStorage(lang) {
        try { localStorage.setItem(this.#cfg.storageKey, lang); } catch {}
    }

    async #load(lang) {
        if (this.#cache[lang]) return this.#cache[lang];
        const res = await fetch(this.#cfg.url(lang));
        if (!res.ok) throw new Error(`[bubble-translate] Failed to load "${lang}" from ${this.#cfg.url(lang)}`);
        return (this.#cache[lang] = await res.json());
    }

    translate(message, ...args) {
        if (!message) return "";
        let msg = this.#strings[message] ?? message;
        for (const arg of args.flat()) {
            if (arg != null) msg = msg.replace("%s", arg);
        }
        return msg;
    }

    async setLang(lang) {
        const next = lang ?? this.#cfg.defaultLang;
        try {
            this.#strings = await this.#load(next);
            this.#lang = next;
        } catch {
            const fallback = this.#cfg.defaultLang;
            if (fallback !== next) this.#strings = await this.#load(fallback);
            this.#lang = fallback;
        }
        this.#writeStorage(this.#lang);
        return this.#lang;
    }

    get lang() { return this.#lang; }
}

function createTranslate(config = {}) {
    const translator = new Translator(config);
    const t = (message, ...args) => translator.translate(message, ...args);
    t.setLang = (lang) => translator.setLang(lang);
    Object.defineProperty(t, "lang", { get: () => translator.lang });
    return t;
}

export { createTranslate, Translator };
