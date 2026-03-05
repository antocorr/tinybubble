import { ref } from "vue";
import { Translator } from "./index.js";

function useTranslate(config = {}) {
    const translator = new Translator(config);
    const lang = ref(translator.lang);

    const t = (message, ...args) => {
        lang.value; // touch ref → reactive in Vue templates
        return translator.translate(message, ...args);
    };

    t.setLang = async (nextLang) => {
        const result = await translator.setLang(nextLang);
        lang.value = result;
        return result;
    };

    Object.defineProperty(t, "lang", { get: () => lang.value });

    return t;
}

export { useTranslate };
