// bubble-router.js
import { html, effect, createSignal, createComponent } from '../index.js';

export function createRouter({ mode = 'history', base = '/', routes = [], srcBase = null }) {
    const resolvedSrcBase = srcBase
        || (typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : null)
        || (typeof window !== 'undefined' ? window.location.href : null);

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

            outlet.innerHTML = '';
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
                
                // Crea l'oggetto $route da iniettare
                const $route = {
                    path: current,
                    params: params,
                    query: Object.fromEntries(new URLSearchParams(window.location.search))
                };

                if (typeof match.component != "function" && match.component.template) {
                    let comp;
                    if (match.persistent && componentMemory.has(match.path)) {
                        comp = componentMemory.get(match.path);
                        // Aggiorna $route se il componente è persistente
                        if (comp.props.$route) {
                            comp.props.$route.value = $route;
                        }
                        comp.$route = $route;
                    } else {
                        // Passa $route sia in data (per init) che in props (per template)
                        const instanceData = { ...(match.data || {}), $route };
                        comp = createComponent(match.component, instanceData, { $route });
                        
                        // Aggiunge getter this.$route per accesso reattivo dal codice (sovrascrive la prop statica)
                        Object.defineProperty(comp, '$route', {
                            get() { return this.props.$route ? this.props.$route.value : undefined; },
                            configurable: true
                        });

                        if (match.persistent) {
                            componentMemory.set(match.path, comp);
                        }
                    }
                    outlet.appendChild(comp.$element);
                } else {
                    // Componente funzionale
                    outlet.appendChild(match.component({ $route }));
                }
                return outlet;
            }
            return outlet;
        });
        return outlet;
    }

    return { navigate, RouterLink, RouterView, routes, setDestination, getDestination };
}
