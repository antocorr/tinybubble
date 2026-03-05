import { describe, expect, it, vi, beforeEach } from "vitest";
import { Translator, createTranslate } from "../../plugins/bubble-translate/index.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mockFetch(strings) {
    return vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(strings),
    });
}

function failingFetch() {
    return vi.fn().mockResolvedValue({ ok: false });
}

// ─── Translator ───────────────────────────────────────────────────────────────

describe("Translator", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("returns the message as-is when no translation is found (fallback)", async () => {
        global.fetch = mockFetch({});
        const tr = new Translator({ url: () => "/fake.json", defaultLang: "en" });
        await tr.setLang("en");
        expect(tr.translate("Hello")).toBe("Hello");
    });

    it("returns empty string for falsy message", async () => {
        global.fetch = mockFetch({});
        const tr = new Translator({ url: () => "/fake.json", defaultLang: "en" });
        await tr.setLang("en");
        expect(tr.translate("")).toBe("");
        expect(tr.translate(null)).toBe("");
        expect(tr.translate(undefined)).toBe("");
    });

    it("returns the translated string after setLang", async () => {
        global.fetch = mockFetch({ Hello: "Ciao", Goodbye: "Arrivederci" });
        const tr = new Translator({ url: () => "/fake.json", defaultLang: "en" });
        await tr.setLang("it_IT");
        expect(tr.translate("Hello")).toBe("Ciao");
        expect(tr.translate("Goodbye")).toBe("Arrivederci");
    });

    it("interpolates %s placeholders with positional args", async () => {
        global.fetch = mockFetch({ "Hello %s, you have %s messages": "Ciao %s, hai %s messaggi" });
        const tr = new Translator({ url: () => "/fake.json", defaultLang: "en" });
        await tr.setLang("it_IT");
        expect(tr.translate("Hello %s, you have %s messages", "Mario", 3)).toBe("Ciao Mario, hai 3 messaggi");
    });

    it("interpolates %s when args are passed as an array", async () => {
        global.fetch = mockFetch({});
        const tr = new Translator({ url: () => "/fake.json", defaultLang: "en" });
        await tr.setLang("en");
        expect(tr.translate("Welcome %s", ["Alice"])).toBe("Welcome Alice");
    });

    it("skips null/undefined args during interpolation", async () => {
        global.fetch = mockFetch({});
        const tr = new Translator({ url: () => "/fake.json", defaultLang: "en" });
        await tr.setLang("en");
        expect(tr.translate("Hello %s world", null)).toBe("Hello %s world");
    });

    it("updates lang after setLang resolves", async () => {
        global.fetch = mockFetch({});
        const tr = new Translator({ url: () => "/fake.json", defaultLang: "en" });
        await tr.setLang("it_IT");
        expect(tr.lang).toBe("it_IT");
    });

    it("falls back to defaultLang when fetch fails", async () => {
        const fetch = vi.fn()
            .mockResolvedValueOnce({ ok: false })                          // it_IT fails
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) }); // en fallback
        global.fetch = fetch;
        const tr = new Translator({ url: (l) => `/${l}.json`, defaultLang: "en" });
        await tr.setLang("it_IT");
        expect(tr.lang).toBe("en");
        expect(fetch).toHaveBeenCalledTimes(2);
    });

    it("caches fetched strings and does not double-fetch", async () => {
        const fetch = mockFetch({ Hi: "Ciao" });
        global.fetch = fetch;
        const tr = new Translator({ url: () => "/it.json", defaultLang: "en" });
        await tr.setLang("it_IT");
        await tr.setLang("it_IT");
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("persists chosen language to localStorage", async () => {
        global.fetch = mockFetch({});
        const tr = new Translator({ url: () => "/fake.json", defaultLang: "en", storageKey: "test.lang" });
        await tr.setLang("it_IT");
        expect(localStorage.getItem("test.lang")).toBe("it_IT");
    });

    it("reads initial language from localStorage", () => {
        localStorage.setItem("test.lang", "es_ES");
        const tr = new Translator({ url: () => "/fake.json", defaultLang: "en", storageKey: "test.lang" });
        expect(tr.lang).toBe("es_ES");
    });

    it("uses defaultLang when localStorage is empty", () => {
        const tr = new Translator({ url: () => "/fake.json", defaultLang: "en_EN" });
        expect(tr.lang).toBe("en_EN");
    });
});

// ─── createTranslate ──────────────────────────────────────────────────────────

describe("createTranslate", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("returns a callable function", async () => {
        global.fetch = mockFetch({});
        const t = createTranslate({ url: () => "/fake.json", defaultLang: "en" });
        await t.setLang("en");
        expect(typeof t).toBe("function");
        expect(t("Hello")).toBe("Hello");
    });

    it("exposes setLang on the function", () => {
        const t = createTranslate({ url: () => "/fake.json", defaultLang: "en" });
        expect(typeof t.setLang).toBe("function");
    });

    it("exposes lang as a getter on the function", () => {
        localStorage.setItem("bubble-translate.lang", "it_IT");
        const t = createTranslate({ url: () => "/fake.json" });
        expect(t.lang).toBe("it_IT");
    });

    it("translates after setLang via t()", async () => {
        global.fetch = mockFetch({ Goodbye: "Arrivederci" });
        const t = createTranslate({ url: () => "/it.json", defaultLang: "en" });
        await t.setLang("it_IT");
        expect(t("Goodbye")).toBe("Arrivederci");
    });

    it("t.lang updates after setLang", async () => {
        global.fetch = mockFetch({});
        const t = createTranslate({ url: () => "/fake.json", defaultLang: "en" });
        await t.setLang("es_ES");
        expect(t.lang).toBe("es_ES");
    });

    it("passes args through to interpolation", async () => {
        global.fetch = mockFetch({ "Hi %s": "Ciao %s" });
        const t = createTranslate({ url: () => "/it.json", defaultLang: "en" });
        await t.setLang("it_IT");
        expect(t("Hi %s", "Mario")).toBe("Ciao Mario");
    });
});
