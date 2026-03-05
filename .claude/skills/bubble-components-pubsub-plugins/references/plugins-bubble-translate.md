# bubble-translate Plugin

## What It Provides

Files:
- `plugins/bubble-translate/index.js` -> framework-agnostic translator (`Translator`, `createTranslate`)
- `plugins/bubble-translate/bubble.js` -> Bubble integration (registers globals)
- `plugins/bubble-translate/vue.js` -> Vue composable (`useTranslate`)

For Bubble apps, prefer `plugins/bubble-translate/bubble.js`.

## Bubble Bootstrap Pattern

```js
import { createComponent } from "tinybubble";
import { createTranslate } from "./plugins/bubble-translate/bubble.js";
import App from "./components/App.bubble.js";

const t = createTranslate({
    defaultLang: "en_EN",
    storageKey: "app.lang",
    url: (lang) => `./localization/${lang}.json`
});

await t.setLang(t.lang);

const app = createComponent(App);
app.appendTo(document.getElementById("app"));
```

Behavior:
- registers `globals.t`
- initializes `globals.i18nLang` signal
- updates `globals.i18nLang.value` on `t.setLang(...)`
- template calls like `{{ t('Welcome') }}` become reactive on language changes

## API Contract

Config keys:
- `defaultLang` (default: `"en"`)
- `storageKey` (default: `"bubble-translate.lang"`)
- `url(lang)` (default: `/localization/${lang}.json`)

Translator behavior:
- `t("key")` -> translated string or original key fallback
- `%s` placeholders replaced positionally using additional args
- supports array args (`t("Hi %s", [name])`)
- chosen lang persisted in `localStorage`
- language files cached per language

## Component Usage Pattern

```js
import { globals } from "tinybubble";

export default {
    data() {
        return { currentLang: "en_EN" };
    },
    async setItalian() {
        await globals.t.setLang("it_IT");
        this.data.currentLang.value = globals.t.lang;
    },
    template() {
        return /*html*/`
        <section>
            <h2>{{ t('Welcome') }}</h2>
            <button @click="setItalian">{{ t('Italian') }}</button>
        </section>
        `;
    }
};
```

## Gotchas

- Do not create translator per component instance unless explicitly needed
- Ensure initial `await t.setLang(t.lang)` happens before first meaningful render
- Keep translation keys stable and centralized
- If editing only Bubble UI code, avoid importing from `plugins/bubble-translate/index.js` directly
- Bubble plugin wrapper is responsible for globals wiring; plain translator is not
- In component JS methods, call `globals.t` (do not assume bare `t` exists in JS scope)
