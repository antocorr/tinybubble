// bubble-router.js
import { html, effect, createSignal, createComponent, globals, Signal, SignalObject } from '../index.js';

export function createRouter({ mode = 'history', base = '/', routes = [], srcBase = null }) {
    const resolvedSrcBase = srcBase
        || (typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : null)
        || (typeof window !== 'undefined' ? window.location.href : null);

    const routeSignal = Signal({ path: '/', params: {}, query: {} });
    globals.$route = routeSignal;

    function resolveRouteSrc(src) {
        // Allow absolute URLs or protocol-relative imports to pass through
        const isAbsolute = /^(?:[a-z]+:)?\/\//i.test(src);
        if (isAbsolute) return src;
        try {
            return new URL(src, resolvedSrcBase || undefined).href;
        } catch (e) {
            return src;
        }
    }
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
    // Helper: converte path "/user/:id" in regex e estrae parametri
    // Supporta anche parametri opzionali ":id?"
    function matchRoute(routePath, currentPath) {
        if (routePath === '*') {
            return { params: {} };
        }

        // Se non ci sono parametri dinamici, match esatto
        if (!routePath.includes(':')) {
            return routePath === currentPath ? { params: {} } : null;
        }

        const paramNames = [];
        const routeSegments = routePath.split('/').filter(Boolean);
        const regexParts = routeSegments.map((segment) => {
            if (!segment.startsWith(':')) {
                return `/${segment}`;
            }

            const isOptional = segment.endsWith('?');
            const key = segment.slice(1, isOptional ? -1 : undefined);
            paramNames.push({ key, optional: isOptional });

            return isOptional ? '(?:/([^/]+))?' : '/([^/]+)';
        });

        const regexPath = regexParts.length ? regexParts.join('') : '/';

        const match = currentPath.match(new RegExp(`^${regexPath}$`));
        if (!match) return null;

        const params = {};
        match.slice(1).forEach((val, i) => {
            const descriptor = paramNames[i];
            if (!descriptor) return;
            params[descriptor.key] = val;
        });
        return { params };
    }

    const componentMemory = new Map();
    // component <RouterView/>
    function RouterView() {
        const outlet = html(`<div></div>`);
        let mountedComp = null;
        let mountedIsPersistent = false;

        effect(async () => {
            const current = getDestination();

            // Trova la rotta corrispondente
            let match = null;
            let params = {};

            for (const r of routes) {
                const m = matchRoute(r.path, current);
                if (m) {
                    match = r;
                    params = m.params;
                    break;
                }
            }

            // Destroy previous component (skip persistent — it stays alive in memory)
            if (mountedComp && !mountedIsPersistent) mountedComp.$destroy();
            outlet.innerHTML = '';
            mountedComp = null;
            mountedIsPersistent = false;

            if (match) {
                if (match.src && !match.component) {
                    try {
                        const src = resolveRouteSrc(match.src);
                        const compModule = await import(src);
                        match.component = compModule.default || compModule;
                    } catch (e) {
                        return outlet;
                    }
                }

                // Aggiorna il signal globale (tutte le istanze si aggiornano automaticamente)
                routeSignal.value = {
                    path: current,
                    params,
                    query: Object.fromEntries(new URLSearchParams(window.location.search))
                };

                if (typeof match.component != "function" && match.component.template) {
                    let comp;
                    if (match.persistent && componentMemory.has(match.path)) {
                        comp = componentMemory.get(match.path);
                    } else {
                        comp = createComponent(match.component, match.data || {});
                        if (match.persistent) {
                            componentMemory.set(match.path, comp);
                        }
                    }
                    outlet.appendChild(comp.$element);
                    mountedComp = comp;
                    mountedIsPersistent = !!match.persistent;
                } else {
                    // Componente funzionale
                    outlet.appendChild(match.component({ $route: routeSignal.value }));
                }
                return outlet;
            }
            return outlet;
        });
        return outlet;
    }

    return { navigate, RouterLink, RouterView, routes, setDestination, getDestination };
}
