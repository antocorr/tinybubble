(function () {
    const script = document.currentScript;
    const fileList = (script.getAttribute('data-files') || '')
        .split(',').map(s => s.trim()).filter(Boolean);

    if (!fileList.length) return;

    let hlReady = false;
    let panelEl = null;

    function loadHighlight() {
        if (hlReady) return Promise.resolve();
        return new Promise(resolve => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css';
            document.head.appendChild(link);
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
            s.onload = () => { hlReady = true; resolve(); };
            document.head.appendChild(s);
        });
    }

    /** @param {string[]} paths @returns {object} */
    function buildTree(paths) {
        const root = {};
        for (const path of paths) {
            const parts = path.split('/');
            let node = root;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!node[parts[i]]) node[parts[i]] = {};
                node = node[parts[i]];
            }
            node[parts[parts.length - 1]] = path;
        }
        return root;
    }

    /**
     * @param {object} node
     * @param {number} depth
     * @param {HTMLElement} container
     * @param {function(string): void} onSelect
     */
    function renderTree(node, depth, container, onSelect) {
        for (const [name, value] of Object.entries(node)) {
            if (typeof value === 'string') {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.setAttribute('aria-label', name);
                btn.dataset.path = value;
                btn.style.cssText = [
                    'display:block;width:100%;text-align:left;',
                    `padding:5px 8px 5px ${depth * 14 + 10}px;`,
                    'color:#c9d1d9;font-size:12px;font-family:ui-monospace,monospace;',
                    'background:none;border:none;cursor:pointer;border-radius:4px;',
                    'transition:background 0.12s;',
                ].join('');
                btn.innerHTML = `<span style="opacity:.35;margin-right:6px;font-size:10px">◆</span>${name}`;
                btn.addEventListener('mouseenter', () => { if (!btn.dataset.active) btn.style.background = '#21262d'; });
                btn.addEventListener('mouseleave', () => { if (!btn.dataset.active) btn.style.background = 'none'; });
                btn.addEventListener('click', () => {
                    container.querySelectorAll('[data-path]').forEach(b => {
                        delete b.dataset.active;
                        b.style.background = 'none';
                    });
                    btn.dataset.active = '1';
                    btn.style.background = '#2d333b';
                    onSelect(value);
                });
                container.appendChild(btn);
            } else {
                const dir = document.createElement('div');
                dir.style.cssText = [
                    `padding:6px 8px 2px ${depth * 14 + 10}px;`,
                    'color:#6e7681;font-size:11px;font-family:ui-monospace,monospace;',
                    'letter-spacing:0.04em;user-select:none;',
                ].join('');
                dir.textContent = name + '/';
                container.appendChild(dir);
                renderTree(value, depth + 1, container, onSelect);
            }
        }
    }

    function buildPanel() {
        const panel = document.createElement('div');
        panel.style.cssText = [
            'position:fixed;bottom:0;left:0;right:0;height:62vh;',
            'background:#13161b;border-top:1px solid #30363d;',
            'display:flex;flex-direction:column;',
            'z-index:9999;box-shadow:0 -12px 40px rgba(0,0,0,.55);',
            'font-family:-apple-system,BlinkMacSystemFont,sans-serif;',
        ].join('');

        // Header
        const header = document.createElement('div');
        header.style.cssText = [
            'display:flex;align-items:center;gap:10px;',
            'padding:10px 16px;border-bottom:1px solid #30363d;',
            'background:#0d1117;flex-shrink:0;',
        ].join('');
        header.innerHTML = `
            <span style="color:#58a6ff;font-family:ui-monospace,monospace;font-size:13px;font-weight:700">{ }</span>
            <span style="color:#e6edf3;font-size:13px;font-weight:600">Source code</span>
        `;
        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = 'margin-left:auto;background:none;border:none;color:#6e7681;cursor:pointer;font-size:15px;padding:2px 6px;border-radius:4px;';
        closeBtn.addEventListener('mouseenter', () => { closeBtn.style.color = '#c9d1d9'; });
        closeBtn.addEventListener('mouseleave', () => { closeBtn.style.color = '#6e7681'; });
        closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });
        header.appendChild(closeBtn);
        panel.appendChild(header);

        // Body
        const body = document.createElement('div');
        body.style.cssText = 'display:flex;flex:1;overflow:hidden;';

        // Tree pane
        const treePane = document.createElement('div');
        treePane.style.cssText = [
            'width:210px;flex-shrink:0;overflow-y:auto;',
            'border-right:1px solid #30363d;padding:8px 0;',
            'background:#13161b;',
        ].join('');

        // Code pane
        const codePane = document.createElement('div');
        codePane.style.cssText = 'flex:1;overflow:auto;background:#0d1117;position:relative;';

        const placeholder = document.createElement('div');
        placeholder.style.cssText = 'display:flex;align-items:center;justify-content:center;height:100%;color:#484f58;font-size:13px;';
        placeholder.textContent = 'Select a file';
        codePane.appendChild(placeholder);

        const pre = document.createElement('pre');
        pre.style.cssText = 'margin:0;padding:20px;font-size:12.5px;line-height:1.6;display:none;';
        const codeEl = document.createElement('code');
        pre.appendChild(codeEl);
        codePane.appendChild(pre);

        async function showFile(path) {
            pre.style.display = 'none';
            placeholder.textContent = 'Loading…';
            placeholder.style.display = 'flex';

            const [res] = await Promise.all([fetch(path), loadHighlight()]);
            const text = await res.text();

            const ext = path.split('.').pop();
            const lang = ext === 'html' ? 'html' : 'javascript';
            codeEl.removeAttribute('data-highlighted');
            codeEl.className = `language-${lang}`;
            codeEl.textContent = text;
            window.hljs.highlightElement(codeEl);

            placeholder.style.display = 'none';
            pre.style.display = 'block';
        }

        renderTree(buildTree(fileList), 0, treePane, showFile);
        treePane.querySelector('[data-path]')?.click();

        body.appendChild(treePane);
        body.appendChild(codePane);
        panel.appendChild(body);

        return panel;
    }

    document.addEventListener('DOMContentLoaded', () => {
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.innerHTML = '&lt;&nbsp;/&nbsp;&gt;';
        toggleBtn.title = 'Show source code';
        toggleBtn.style.cssText = [
            'position:fixed;bottom:20px;right:20px;',
            'background:#13161b;color:#58a6ff;',
            'border:1px solid #30363d;border-radius:8px;',
            'padding:8px 14px;font-family:ui-monospace,monospace;font-size:13px;font-weight:600;',
            'cursor:pointer;z-index:9998;',
            'box-shadow:0 4px 16px rgba(0,0,0,.4);',
            'transition:border-color 0.15s,box-shadow 0.15s;',
        ].join('');
        toggleBtn.addEventListener('mouseenter', () => {
            toggleBtn.style.borderColor = '#58a6ff';
            toggleBtn.style.boxShadow = '0 4px 20px rgba(88,166,255,.2)';
        });
        toggleBtn.addEventListener('mouseleave', () => {
            toggleBtn.style.borderColor = '#30363d';
            toggleBtn.style.boxShadow = '0 4px 16px rgba(0,0,0,.4)';
        });
        toggleBtn.addEventListener('click', () => {
            if (!panelEl) {
                panelEl = buildPanel();
                document.body.appendChild(panelEl);
            } else {
                panelEl.style.display = panelEl.style.display === 'none' ? 'flex' : 'none';
            }
        });
        document.body.appendChild(toggleBtn);
    });
})();
