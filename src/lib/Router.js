// bubble-router.js
import { html, effect, createSignal, createComponent } from '../index.js';

export function createRouter({ mode = 'history', base = '/', routes = [] }) {
    // normalizza un path in relazione al base
    function stripBase(path) {
        if (!base || base === '/') return path;
        return path.startsWith(base) ? path.slice(base.length) || '/' : null;
    }

    // legge il “path corrente” da URL (hash o history)
    function getLocation() {
        if (mode === 'hash') {
            return window.location.hash.slice(1) || '/';
        } else {
            return stripBase(window.location.pathname) || '/';
        }
    }

    const [getDestination, setDestination] = createSignal(getLocation());

    // quando cambia la history/hash, aggiorna il segnale
    const popEvt = mode === 'hash' ? 'hashchange' : 'popstate';
    window.addEventListener(popEvt, () => setDestination(getLocation()));

    // funzione per navigare via JS
    function navigate(to) {
        const full = mode === 'hash'
            ? `#${to}`
            : base.replace(/\/$/, '') + (to.startsWith('/') ? to : '/' + to);

        if (mode === 'hash') {
            window.location.hash = to;
        } else {
            history.pushState(null, '', full);
            setDestination(getLocation());
        }
    }
    function RouterLink(obj) {
        const { to, children, ...attrs } = obj;
        if (typeof to !== 'string') {
            return tagToRouterLink(obj);
        }
        const href = mode === 'hash'
            ? `#${to}`
            : base.replace(/\/$/, '') + (to.startsWith('/') ? to : '/' + to);

        const a = html(`<a href="${href}">${children}</a>`);
        a.addEventListener('click', e => {
            e.preventDefault();
            navigate(to);
        });
        Object.entries(attrs).forEach(([k, v]) => a.setAttribute(k, v));
        return a;
    }
    function tagToRouterLink(element) {
        const to = element.getAttribute('to');
        const children = element.innerHTML;
        const attrs = {};
        [...element.attributes].forEach(attr => {
            if (attr.name !== 'to') {
                attrs[attr.name] = attr.value;
            }
        });
        return RouterLink({ to, children, ...attrs });
    }
    const componentMemory = new Map();
    // componete <RouterView/>
    function RouterView() {
        const outlet = html(`<div></div>`);
        effect(() => {
            const current = getDestination();
            // troviamo la prima route che “matcha” (qui solo path esatti)
            const match = routes.find(r => r.path === current);
            outlet.innerHTML = '';
            if (match) {
                // se è un oggetto SFC, usiamo createComponent
                if (match.component.template)
                {
                    let comp;
                    if(match.persistent && componentMemory.has(match.path)) {
                        comp = componentMemory.get(match.path);
                    } else {
                        comp = createComponent(match.component, match.data || null);
                        if(match.persistent) {
                            componentMemory.set(match.path, comp);
                        }
                    }
                    outlet.appendChild(comp.$element);
                }
                // altrimenti se è funzione di tipo signal
                else {
                    outlet.appendChild(match.component());
                }
            }
        });
        return outlet;
    }

    return { navigate, RouterLink, RouterView, routes, setDestination, getDestination };
}
