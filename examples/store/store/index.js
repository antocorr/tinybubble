import { createStore }       from '../../../plugins/bubble-store/index.js';
import { createBubbleStore } from '../../../plugins/bubble-store/bubble.js';
import menuReducer            from './reducers/menu.reducer.js';
import cartReducer            from './reducers/cart.reducer.js';

function rootReducer(state = {}, action) {
    return {
        menu: menuReducer(state.menu, action),
        cart: cartReducer(state.cart, action),
    };
}

const devtools =
    typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__
        ? window.__REDUX_DEVTOOLS_EXTENSION__.connect({ name: 'Pizzeria' })
        : null;

const store = createStore(rootReducer, {}, devtools);

export const { connectStore, dispatch, getState } = createBubbleStore(store);