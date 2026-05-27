import { connectStore, dispatch } from '../store/index.js';
import { makeCartItemByIdSelector } from '../store/selectors/cart.selectors.js';

export default connectStore({
    props: ['pizza'],

    data() {
        return { cartQty: 0 };
    },

    init() {
        // Private selector instance: each card tracks its own pizza in the cart
        // without interfering with other cards' memoization caches.
        this._selectItem = makeCartItemByIdSelector();
    },

    template() {
        /* html */
        return `
        <div class="bg-white rounded-2xl shadow-sm border border-crust-100 overflow-hidden flex flex-col">
            <div class="bg-crust-50 flex items-center justify-center h-28 text-5xl select-none">
                {{pizza.emoji}}
            </div>
            <div class="p-4 flex flex-col flex-1">
                <h3 class="font-bold text-gray-900">{{pizza.name}}</h3>
                <p class="text-xs text-gray-400 mt-1 flex-1">{{pizza.desc}}</p>
                <div class="flex items-center justify-between mt-4">
                    <span class="font-bold text-tomato-600">€ {{ $formatPrice(pizza.price) }}</span>

                    <button
                        x-hide="cartQty"
                        @click="this.add()"
                        class="px-3 py-1.5 bg-tomato-500 hover:bg-tomato-600 text-white text-sm font-medium rounded-lg transition-colors">
                        Add
                    </button>

                    <div x-show="cartQty" class="flex items-center gap-2">
                        <button
                            @click="this.decrement()"
                            class="w-7 h-7 rounded-full bg-crust-100 hover:bg-crust-200 font-bold text-gray-700 flex items-center justify-center transition-colors">
                            −
                        </button>
                        <span class="w-5 text-center font-semibold text-gray-900">{{cartQty}}</span>
                        <button
                            @click="this.increment()"
                            class="w-7 h-7 rounded-full bg-tomato-500 hover:bg-tomato-600 text-white font-bold flex items-center justify-center transition-colors">
                            +
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    },

    add() {
        const { id, name, price } = this.props.pizza;
        dispatch({ type: 'CART_ADD', payload: { id, name, price } });
    },

    increment() {
        dispatch({ type: 'CART_UPDATE_QTY', payload: { id: this.props.pizza.id, qty: this.data.cartQty.value + 1 } });
    },

    decrement() {
        const next = this.data.cartQty.value - 1;
        dispatch({ type: 'CART_UPDATE_QTY', payload: { id: this.props.pizza.id, qty: next } });
    },

}, (state, component) => ({
    cartQty: component._selectItem?.(state, component.props.pizza?.id)?.qty ?? 0,
}));