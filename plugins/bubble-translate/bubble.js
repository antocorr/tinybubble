import { globals, Signal } from "tinybubble";
import { Translator } from "./index.js";

function createTranslate(config = {}) {
    const translator = new Translator(config);

    globals.i18nLang ??= Signal(translator.lang);

    const t = (message, ...args) => {
        globals.i18nLang?.value; // touch signal → reactive in templates
        return translator.translate(message, ...args);
    };

    t.setLang = async (lang) => {
        const result = await translator.setLang(lang);
        globals.i18nLang.value = result;
        return result;
    };

    Object.defineProperty(t, "lang", { get: () => translator.lang });

    globals.t = t; // available as t('...') in all bubble templates

    return t;
}

export { createTranslate };
