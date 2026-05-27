// ─────────────────────────────────────────────────────────────────────────────
// bubble-store — standalone store utilities (no tinybubble dependency)
//
// createStore       — Redux-like store with optional Redux DevTools support
// createSelector    — memoized selector (Reselect-inspired)
// createSelectorFactory — per-instance selector factory
// createStructuredSelector — structured selector shorthand
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
// createStore
// ─────────────────────────────────────────────────────────────────────────────

export function createStore(rootReducer, initialState = {}, devtools = null) {
    let state = initialState;
    const initialRootState = structuredClone(initialState);
    let listeners = [];

    function getState() {
        return state;
    }

    function subscribe(listener) {
        listeners.push(listener);
        return () => { listeners = listeners.filter(l => l !== listener); };
    }

    function notify() {
        listeners.forEach((l, i) => {
            try { l(); } catch (e) { console.error(`[bubble-store] listener ${i} error`, e); }
        });
    }

    function dispatch(action) {
        state = rootReducer(state, action);
        notify();
        devtools?.send(action, state);
    }

    if (devtools) {
        devtools.subscribe((message) => {
            if (message.type !== 'DISPATCH') return;
            const { type } = message.payload;
            if (type === 'JUMP_TO_STATE' || type === 'JUMP_TO_ACTION') {
                state = JSON.parse(message.state);
                notify();
            } else if (type === 'IMPORT_STATE') {
                const computedStates = message.payload.nextLiftedState?.computedStates || [];
                const last = computedStates[computedStates.length - 1];
                if (!last?.state) return;
                state = last.state;
                notify();
                devtools.send(null, message.payload.nextLiftedState);
            } else if (type === 'RESET') {
                state = structuredClone(initialRootState);
                notify();
                devtools.init(state);
            } else if (type === 'COMMIT') {
                devtools.init(state);
            } else if (type === 'ROLLBACK') {
                state = JSON.parse(message.state);
                notify();
                devtools.init(state);
            }
        });
    }

    dispatch({ type: '@@INIT' });
    if (devtools) devtools.init(state);

    return { getState, subscribe, dispatch };
}


// ─────────────────────────────────────────────────────────────────────────────
// createSelector
//
// Memoizes derived state computations. The result function is called only
// when at least one input selector returns a different reference (===).
// Works correctly with immutable reducers: unchanged slices keep the same
// reference, so the memoization hit rate is high.
//
// Usage:
//   const selectOpenTournaments = createSelector(
//       state => state.tournaments.items,
//       items => items.filter(t => t.status === 'open')
//   );
//
// Options:
//   equalityFn  — custom comparator for inputs (default: ===)
//   maxSize     — LRU cache size (default: 1). Increase when the same
//                 selector is called with different arguments in parallel
//                 (e.g. selectTournamentById from N list items).
//   name        — label shown in debug output
// ─────────────────────────────────────────────────────────────────────────────

function defaultEqualityFn(a, b) { return a === b; }

function inputsAreEqual(prev, next, eq) {
    if (prev.length !== next.length) return false;
    for (let i = 0; i < prev.length; i++) {
        if (!eq(prev[i], next[i])) return false;
    }
    return true;
}

export function createSelector(...args) {
    let options = {};
    if (
        args.length > 1 &&
        typeof args[args.length - 1] === 'object' &&
        args[args.length - 1] !== null &&
        !Array.isArray(args[args.length - 1])
    ) {
        options = args.pop();
    }

    const resultFn       = args.pop();
    const inputSelectors = args;
    const equalityFn     = options.equalityFn ?? defaultEqualityFn;
    const maxSize        = options.maxSize     ?? 1;

    if (typeof resultFn !== 'function')
        throw new Error('[createSelector] Last argument must be the result function.');
    if (inputSelectors.length === 0)
        throw new Error('[createSelector] At least one input selector is required.');
    if (!inputSelectors.every(s => typeof s === 'function'))
        throw new Error('[createSelector] All input selectors must be functions.');

    const cache = [];
    let recomputations = 0;
    let cacheHits = 0;

    function memoizedSelector(state, ...rest) {
        const nextInputs = inputSelectors.map(sel => sel(state, ...rest));

        for (let i = 0; i < cache.length; i++) {
            const entry = cache[i];
            if (inputsAreEqual(entry.inputs, nextInputs, equalityFn)) {
                cacheHits++;
                if (i !== 0) { cache.splice(i, 1); cache.unshift(entry); }
                return entry.result;
            }
        }

        recomputations++;
        const result = resultFn(...nextInputs);
        cache.unshift({ inputs: nextInputs, result });
        if (cache.length > maxSize) cache.pop();
        return result;
    }

    memoizedSelector.recomputations     = () => recomputations;
    memoizedSelector.cacheHits          = () => cacheHits;
    memoizedSelector.resetRecomputations = () => { recomputations = 0; cacheHits = 0; };
    memoizedSelector.clearCache         = () => { cache.length = 0; };
    memoizedSelector.inputSelectors     = inputSelectors;
    memoizedSelector.resultFn           = resultFn;
    memoizedSelector.selectorName       = options.name ?? null;

    return memoizedSelector;
}


// ─────────────────────────────────────────────────────────────────────────────
// createSelectorFactory
//
// Solves the N-instance problem: when the same parametric selector is used
// by multiple components simultaneously (e.g. selectTournamentById from a
// list), each component should have its own memoization cache so they don't
// invalidate each other.
//
// Each component calls factory() in init() to get a private instance.
// When the component is destroyed, the instance is simply abandoned.
//
// Usage:
//   export const makeTournamentSelector = createSelectorFactory(() =>
//       createSelector(
//           state => state.tournaments.items,
//           (state, id) => id,
//           (items, id) => items.find(t => t.id === id) ?? null
//       )
//   );
//
//   // In the component:
//   init() { this._selectTournament = makeTournamentSelector(); }
// ─────────────────────────────────────────────────────────────────────────────

export function createSelectorFactory(selectorCreator) {
    if (typeof selectorCreator !== 'function')
        throw new Error('[createSelectorFactory] Argument must be a function that returns a selector.');
    return () => selectorCreator();
}


// ─────────────────────────────────────────────────────────────────────────────
// createStructuredSelector
//
// Shorthand for mapping multiple store slices into a named object without
// repeating (state) => state.x for every key.
//
// Usage:
//   export const selectDashboard = createStructuredSelector({
//       tournaments:  selectAllTournaments,
//       selectedGame: selectSelectedGame,
//       isLoading:    state => state.palinsesto.loading,
//   });
// ─────────────────────────────────────────────────────────────────────────────

export function createStructuredSelector(inputSelectorsMap, options = {}) {
    if (typeof inputSelectorsMap !== 'object' || inputSelectorsMap === null || Array.isArray(inputSelectorsMap))
        throw new Error('[createStructuredSelector] Argument must be an object { key: selector }.');
    const keys      = Object.keys(inputSelectorsMap);
    const selectors = keys.map(k => inputSelectorsMap[k]);
    if (!selectors.every(s => typeof s === 'function'))
        throw new Error('[createStructuredSelector] All values must be functions.');
    return createSelector(
        ...selectors,
        (...values) => Object.fromEntries(keys.map((k, i) => [k, values[i]])),
        options
    );
}