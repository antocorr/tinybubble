// bubble-router.js
import { html, effect, createSignal, createComponent, globals, Signal, untrack } from '../index.js';

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
    // normalize a path relative to base
    function stripBase(path) {
        if (!base || base === '/') return path;
        return path.startsWith(base) ? path.slice(base.length) || '/' : null;
    }

    // splits the hash content into [path, query]: in hash mode the query string
    // lives inside the hash itself (e.g. #/foo/bar?hello=true), not in location.search
    function hashParts() {
        const raw = window.location.hash.slice(1) || '/';
        const qIndex = raw.indexOf('?');
        return qIndex === -1 ? [raw, ''] : [raw.slice(0, qIndex), raw.slice(qIndex + 1)];
    }

    // current "path" from the URL (hash or history), without the query string
    function getLocation() {
        return mode === 'hash' ? hashParts()[0] : (stripBase(window.location.pathname) || '/');
    }

    function getLocationQuery() {
        return mode === 'hash' ? hashParts()[1] : window.location.search;
    }

    const [getDestination, setDestination] = createSignal(getLocation());

    // when history/hash changes, update the signal
    const popEvt = mode === 'hash' ? 'hashchange' : 'popstate';
    window.addEventListener(popEvt, () => setDestination(getLocation()));

    function toHref(to) {
        return mode === 'hash'
            ? `#${to}`
            : base.replace(/\/$/, '') + (to.startsWith('/') ? to : '/' + to);
    }

    // function to navigate via JS
    function navigate(to) {
        if (mode === 'hash') {
            window.location.hash = to;
        } else {
            history.pushState(null, '', toHref(to));
            setDestination(getLocation());
        }
    }
    function RouterLink(obj) {
        const { to, children, ...attrs } = obj;
        if (typeof to !== 'string') {
            return tagToRouterLink(obj);
        }
        const a = html(`<a href="${toHref(to)}">${children}</a>`);
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
    // Compiled route patterns, built once per routePath
    const compiledRoutes = new Map();
    function compileRoute(routePath) {
        let compiled = compiledRoutes.get(routePath);
        if (compiled) return compiled;

        const paramNames = [];
        const routeSegments = routePath.split('/').filter(Boolean);
        const regexParts = routeSegments.map((segment) => {
            if (!segment.startsWith(':')) {
                return `/${segment}`;
            }

            const isOptional = segment.endsWith('?');
            paramNames.push(segment.slice(1, isOptional ? -1 : undefined));

            return isOptional ? '(?:/([^/]+))?' : '/([^/]+)';
        });

        const regexPath = regexParts.length ? regexParts.join('') : '/';
        compiled = { regex: new RegExp(`^${regexPath}$`), paramNames };
        compiledRoutes.set(routePath, compiled);
        return compiled;
    }

    // Helper: converts path "/user/:id" into a regex and extracts params
    // Also supports optional params ":id?"
    function matchRoute(routePath, currentPath) {
        if (routePath === '*') {
            return { params: {} };
        }

        // If there are no dynamic params, exact match
        if (!routePath.includes(':')) {
            return routePath === currentPath ? { params: {} } : null;
        }

        const { regex, paramNames } = compileRoute(routePath);
        const match = currentPath.match(regex);
        if (!match) return null;

        const params = {};
        for (let i = 0; i < paramNames.length; i++) {
            if (paramNames[i]) params[paramNames[i]] = match[i + 1];
        }
        return { params };
    }

    function resolveRoute(current) {
        const routesArray = typeof routes === 'function' ? routes() : routes;
        for (const r of routesArray || []) {
            const m = matchRoute(r.path, current);
            if (m) return { match: r, params: m.params };
        }
        return { match: null, params: {} };
    }

    const routeSelection = Signal(null);
    effect(() => {
        const current = getDestination();
        const resolved = resolveRoute(current);
        routeSignal.value = {
            path: current,
            params: resolved.params,
            query: Object.fromEntries(new URLSearchParams(getLocationQuery()))
        };
        routeSelection.value = resolved;
    });

    const componentMemory = new Map();
    // component <RouterView/>
    function RouterView() {
        const outlet = html(`<div></div>`);
        let mountedComp = null;
        let mountedIsPersistent = false;
        let navToken = 0;

        effect(() => {
            const match = routeSelection.value.match;
            const token = ++navToken;
            untrack(async () => {
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
                            return;
                        }
                        // a newer navigation started while the module was loading:
                        // let it own the outlet, don't mount a stale route
                        if (token !== navToken) return;
                    }

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
                        comp._renderRoot?.();
                        mountedComp = comp;
                        mountedIsPersistent = !!match.persistent;
                    } else {
                        // Functional component
                        outlet.appendChild(match.component({ $route: routeSignal.value }));
                    }
                }
            });
        });
        return outlet;
    }

    return { navigate, RouterLink, RouterView, routes, setDestination, getDestination };
}
