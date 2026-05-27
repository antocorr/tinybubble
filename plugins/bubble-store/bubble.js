// ─────────────────────────────────────────────────────────────────────────────
// bubble-store — tinybubble integration
//
// createBubbleStore(store) wires a Redux-like store into tinybubble's
// Signal-based reactivity system.
//
// Returns:
//   connectStore(componentDef, mapStateToData) — HOC that binds a component
//   dispatch(action)                           — store.dispatch shorthand
//   getState()                                 — store.getState shorthand
//
// How reactivity works:
//   1. connectStore wraps data() to initialize signals from the store.
//   2. In init(), it subscribes to the store. On every dispatch, mapStateToData
//      is called and changed values are written back to the component's Signal
//      objects. Tinybubble's effect system picks up those writes and re-renders
//      only the DOM nodes that depend on the changed signals.
//   3. The subscription is cleaned up in beforeDestroy().
//
// Usage:
//   import { createStore }       from 'bubble-store';
//   import { createBubbleStore } from 'bubble-store/bubble';
//
//   const store = createStore(rootReducer, {});
//   export const { connectStore, dispatch } = createBubbleStore(store);
//
//   // In a component file:
//   export default connectStore({
//       name: 'TournamentList',
//       template() { return `<ul><li x-for="t in tournaments">{{t.name}}</li></ul>`; },
//       data() { return { tournaments: [] }; },
//   }, (state) => ({
//       tournaments: state.tournaments.items,
//   }));
// ─────────────────────────────────────────────────────────────────────────────

export function createBubbleStore(store) {

    // ─────────────────────────────────────────────────────────────────────────
    // connectStore
    //
    // @param {object}   componentDef   — standard tinybubble component definition
    // @param {Function} mapStateToData — (state, component) => plain object
    //     Keys must match keys returned by data(). Values are written into the
    //     corresponding Signal on every store dispatch.
    //     The component instance is passed as second argument so you can read
    //     props inside the selector (e.g. component.props.tournamentId).
    //
    // @returns {object} — wrapped component definition, drop-in replacement
    // ─────────────────────────────────────────────────────────────────────────
    function connectStore(componentDef, mapStateToData) {
        const originalData          = componentDef.data;
        const originalInit          = componentDef.init;
        const originalBeforeDestroy = componentDef.beforeDestroy;

        return {
            ...componentDef,

            data() {
                const base = typeof originalData === 'function'
                    ? originalData.call(this)
                    : (originalData || {});

                // Seed initial values from the store so the first render is
                // already populated — no flash of empty content.
                const fromStore = mapStateToData
                    ? (mapStateToData(store.getState(), this) || {})
                    : {};

                return { ...base, ...fromStore };
            },

            init() {
                if (mapStateToData) {
                    this._storeUnsubscribe = store.subscribe(() => {
                        const mapped = mapStateToData(store.getState(), this);
                        if (!mapped) return;
                        for (const [key, value] of Object.entries(mapped)) {
                            // Only update signals that exist in data().
                            // Writing .value triggers tinybubble's effect system.
                            if (this.data[key] !== undefined) {
                                this.data[key].value = value;
                            }
                        }
                    });
                }
                if (originalInit) originalInit.call(this);
            },

            beforeDestroy() {
                this._storeUnsubscribe?.();
                if (originalBeforeDestroy) originalBeforeDestroy.call(this);
            },
        };
    }

    return {
        connectStore,
        dispatch: (action)  => store.dispatch(action),
        getState: ()        => store.getState(),
    };
}