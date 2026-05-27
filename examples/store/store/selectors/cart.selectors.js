import { createSelector, createSelectorFactory } from '../../../../plugins/bubble-store/index.js';

const selectCartSlice = state => state.cart;
const selectCartItems = createSelector(selectCartSlice, cart => cart.items);

const selectCartSubtotal = createSelector(
    selectCartItems,
    items => items.reduce((sum, i) => sum + i.price * i.qty, 0)
);

const selectCartDiscount = createSelector(selectCartSlice, cart => cart.discount);

const selectCartFinalTotal = createSelector(
    selectCartSubtotal,
    selectCartDiscount,
    (subtotal, discount) => subtotal * (1 - discount / 100)
);

const selectCartCount = createSelector(
    selectCartItems,
    items => items.reduce((sum, i) => sum + i.qty, 0)
);

// Per-instance factory: each PizzaCard gets its own memoization cache
// so concurrent lookups with different IDs don't invalidate each other.
const makeCartItemByIdSelector = createSelectorFactory(() =>
    createSelector(
        selectCartItems,
        (state, id) => id,
        (items, id) => items.find(i => i.id === id) ?? null
    )
);

export {
    selectCartItems,
    selectCartSubtotal,
    selectCartDiscount,
    selectCartFinalTotal,
    selectCartCount,
    makeCartItemByIdSelector,
};