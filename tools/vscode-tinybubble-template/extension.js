const vscode = require("vscode");

function skipQuotedString(text, start, quote) {
  let i = start + 1;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "\\") {
      i += 2;
      continue;
    }
    if (ch === quote) return i;
    i += 1;
  }
  return -1;
}

function skipLineComment(text, start) {
  let i = start + 2;
  while (i < text.length && text[i] !== "\n") i += 1;
  return i;
}

function skipBlockComment(text, start) {
  const end = text.indexOf("*/", start + 2);
  return end === -1 ? -1 : end + 1;
}

function skipTemplateExpression(text, startIndex) {
  let depth = 1;
  let i = startIndex;

  while (i < text.length) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === "'" || ch === '"') {
      const end = skipQuotedString(text, i, ch);
      if (end === -1) return -1;
      i = end + 1;
      continue;
    }

    if (ch === "`") {
      const end = skipTemplateLiteral(text, i);
      if (end === -1) return -1;
      i = end + 1;
      continue;
    }

    if (ch === "/" && next === "/") {
      i = skipLineComment(text, i) + 1;
      continue;
    }

    if (ch === "/" && next === "*") {
      const end = skipBlockComment(text, i);
      if (end === -1) return -1;
      i = end + 1;
      continue;
    }

    if (ch === "{") {
      depth += 1;
      i += 1;
      continue;
    }

    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i;
      i += 1;
      continue;
    }

    i += 1;
  }

  return -1;
}

function skipTemplateLiteral(text, backtickIndex) {
  let i = backtickIndex + 1;

  while (i < text.length) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === "\\") {
      i += 2;
      continue;
    }

    if (ch === "`") return i;

    if (ch === "$" && next === "{") {
      const end = skipTemplateExpression(text, i + 2);
      if (end === -1) return -1;
      i = end + 1;
      continue;
    }

    i += 1;
  }

  return -1;
}

function findMatchingBrace(text, openBraceIndex) {
  let depth = 0;
  let i = openBraceIndex;

  while (i < text.length) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === "'" || ch === '"') {
      const end = skipQuotedString(text, i, ch);
      if (end === -1) return -1;
      i = end + 1;
      continue;
    }

    if (ch === "`") {
      const end = skipTemplateLiteral(text, i);
      if (end === -1) return -1;
      i = end + 1;
      continue;
    }

    if (ch === "/" && next === "/") {
      i = skipLineComment(text, i) + 1;
      continue;
    }

    if (ch === "/" && next === "*") {
      const end = skipBlockComment(text, i);
      if (end === -1) return -1;
      i = end + 1;
      continue;
    }

    if (ch === "{") {
      depth += 1;
    } else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }

    i += 1;
  }

  return -1;
}

function skipWs(text, index) {
  let i = index;
  while (i < text.length && /\s/.test(text[i])) i += 1;
  return i;
}

function findReturnTemplateRanges(methodSource, methodOffset) {
  const ranges = [];
  const returnRe = /\breturn\b/g;
  let match;

  while ((match = returnRe.exec(methodSource))) {
    let i = skipWs(methodSource, match.index + match[0].length);

    if (methodSource.startsWith("/*", i)) {
      const commentEnd = methodSource.indexOf("*/", i + 2);
      if (commentEnd === -1) continue;
      i = skipWs(methodSource, commentEnd + 2);
    }

    if (methodSource[i] !== "`") continue;

    const templateEnd = skipTemplateLiteral(methodSource, i);
    if (templateEnd === -1) continue;

    ranges.push({
      start: methodOffset + i,
      end: methodOffset + templateEnd,
      contentStart: methodOffset + i + 1,
      contentEnd: methodOffset + templateEnd,
    });

    returnRe.lastIndex = templateEnd + 1;
  }

  return ranges;
}

const VOID_HTML_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

function isTagNameChar(ch) {
  return /[A-Za-z0-9:_-]/.test(ch);
}

function readTagName(text, index) {
  let i = index;
  if (!/[A-Za-z]/.test(text[i] || "")) return null;
  while (i < text.length && isTagNameChar(text[i])) i += 1;
  return {
    name: text.slice(index, i),
    next: i,
  };
}

function findTagClose(text, startIndex) {
  let i = startIndex;
  let quote = null;

  while (i < text.length) {
    const ch = text[i];
    const next = text[i + 1];

    if (quote) {
      if (ch === "\\") {
        i += 2;
        continue;
      }
      if (ch === quote) quote = null;
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      i += 1;
      continue;
    }

    if (ch === "$" && next === "{") {
      const exprEnd = skipTemplateExpression(text, i + 2);
      if (exprEnd === -1) return -1;
      i = exprEnd + 1;
      continue;
    }

    if (ch === ">") return i;

    i += 1;
  }

  return -1;
}

function addHtmlElementRanges(document, fullText, templateEntry, ranges) {
  const stack = [];
  let i = templateEntry.contentStart;

  while (i < templateEntry.contentEnd) {
    const ch = fullText[i];
    if (ch !== "<") {
      i += 1;
      continue;
    }

    const next = fullText[i + 1];

    if (next === "!") {
      if (fullText.startsWith("<!--", i)) {
        const commentEnd = fullText.indexOf("-->", i + 4);
        i = commentEnd === -1 ? templateEntry.contentEnd : commentEnd + 3;
      } else {
        const declEnd = findTagClose(fullText, i + 2);
        i = declEnd === -1 ? templateEntry.contentEnd : declEnd + 1;
      }
      continue;
    }

    if (next === "?") {
      const piEnd = findTagClose(fullText, i + 2);
      i = piEnd === -1 ? templateEntry.contentEnd : piEnd + 1;
      continue;
    }

    const isClosing = next === "/";
    const nameStart = isClosing ? i + 2 : i + 1;
    const parsed = readTagName(fullText, nameStart);
    if (!parsed) {
      i += 1;
      continue;
    }

    const tagName = parsed.name.toLowerCase();
    const tagClose = findTagClose(fullText, parsed.next);
    if (tagClose === -1 || tagClose > templateEntry.contentEnd) break;

    if (isClosing) {
      let j = stack.length - 1;
      while (j >= 0 && stack[j].name !== tagName) j -= 1;
      if (j >= 0) {
        const opening = stack[j];
        stack.length = j;
        const startLine = document.positionAt(opening.offset).line;
        const endLine = document.positionAt(tagClose).line;
        if (endLine > startLine) {
          ranges.push(new vscode.FoldingRange(startLine, endLine, vscode.FoldingRangeKind.Region));
        }
      }
      i = tagClose + 1;
      continue;
    }

    const prevChar = fullText[tagClose - 1];
    const selfClosing = prevChar === "/" || VOID_HTML_TAGS.has(tagName);
    if (!selfClosing) {
      stack.push({
        name: tagName,
        offset: i,
      });
    }

    i = tagClose + 1;
  }
}

function provideRanges(document) {
  const text = document.getText();
  const ranges = [];
  const methodRe = /\b(?:template|setTemplate)\s*\(\s*\)\s*\{/g;
  let match;

  while ((match = methodRe.exec(text))) {
    const openBrace = text.indexOf("{", match.index);
    if (openBrace === -1) continue;

    const closeBrace = findMatchingBrace(text, openBrace);
    if (closeBrace === -1) continue;

    const methodSource = text.slice(openBrace + 1, closeBrace);
    const methodOffset = openBrace + 1;
    const templateRanges = findReturnTemplateRanges(methodSource, methodOffset);

    for (const entry of templateRanges) {
      const startLine = document.positionAt(entry.start).line;
      const endLine = document.positionAt(entry.end).line;
      if (endLine > startLine) {
        ranges.push(new vscode.FoldingRange(startLine, endLine, vscode.FoldingRangeKind.Region));
      }
      addHtmlElementRanges(document, text, entry, ranges);
    }

    methodRe.lastIndex = closeBrace + 1;
  }

  return ranges;
}

function activate(context) {
  const selector = [
    { language: "javascript" },
    { language: "javascriptreact" },
    { language: "typescript" },
    { language: "typescriptreact" },
  ];

  const provider = {
    provideFoldingRanges(document) {
      return provideRanges(document);
    },
  };

  context.subscriptions.push(vscode.languages.registerFoldingRangeProvider(selector, provider));
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
