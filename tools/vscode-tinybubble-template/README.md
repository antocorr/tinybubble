# TinyBubble Template Tools

This VS Code extension adds HTML syntax highlighting and template folding for TinyBubble templates in JavaScript/TypeScript files.

It is packaged from `tools/vscode-tinybubble-template` inside the main TinyBubble repository.

Supported patterns:

```js
template() { return `...` }
template() { /*html*/ return `...` }
/*html*/ `...`
```

Folding support:

- fold on multiline template literals returned by `template()`
- fold on multiline template literals returned by `setTemplate()`
- fold on nested HTML elements inside those templates (`div`, `section`, custom tags, etc.)

## Local usage

1. Open this folder in VS Code:

   - `tools/vscode-tinybubble-template`

2. Press `F5` to launch an Extension Development Host.
3. In the new window, open a TinyBubble component file and check highlighting inside `template()`.

## Package as VSIX

From `tools/vscode-tinybubble-template`:

```bash
npm i -D @vscode/vsce
npx vsce package
```

Then install the generated `.vsix` in VS Code.

## Publish to VS Code Marketplace

```bash
npx vsce publish
```

This requires a valid Visual Studio Marketplace publisher token for `antocorr`.
