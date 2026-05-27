import { connectStore, dispatch } from '../store/index.js';
import {
    selectCartItems,
    selectCartSubtotal,
    selectCartDiscount,
    selectCartFinalTotal,
    selectCartCount,
} from '../store/selectors/cart.selectors.js';

export default connectStore({
    data() {
        return {
            cartItems:  [],
            cartCount:  0,
            subtotal:   0,
            discount:   0,
            finalTotal: 0,
            promoInput: '',
            promoError: '',
            ordered:    false,
        };
    },

    template() {
        /* html */
        return `
        <aside class="flex flex-col h-full">
            <h2 class="text-xl font-bold text-gray-900 mb-4">
                Your order
                <span x-show="cartCount" class="ml-2 text-sm font-normal text-gray-400">({{cartCount}} items)</span>
            </h2>

            <!-- Empty state -->
            <div x-hide="cartCount" class="flex-1 flex flex-col items-center justify-center text-center text-gray-400 gap-3">
                <span class="text-5xl">🛒</span>
                <p class="text-sm">Your cart is empty.<br>Add a pizza to get started!</p>
            </div>

            <!-- Cart items -->
            <div x-show="cartCount" class="flex-1 overflow-y-auto space-y-3 pr-1">
                <div x-for="item in cartItems" class="flex items-center gap-3">
                    <div class="flex-1 min-w-0">
                        <p class="font-medium text-sm text-gray-900 truncate">{{item.name}}</p>
                        <p class="text-xs text-gray-400">€ {{ $formatPrice(item.price) }} × {{item.qty}}</p>
                    </div>
                    <div class="flex items-center gap-1.5 shrink-0">
                        <button
                            @click="this.decrement(item)"
                            class="w-6 h-6 rounded-full bg-crust-100 hover:bg-crust-200 text-sm font-bold text-gray-600 flex items-center justify-center transition-colors">
                            −
                        </button>
                        <span class="w-4 text-center text-sm font-semibold">{{item.qty}}</span>
                        <button
                            @click="this.increment(item)"
                            class="w-6 h-6 rounded-full bg-tomato-500 hover:bg-tomato-600 text-white text-sm font-bold flex items-center justify-center transition-colors">
                            +
                        </button>
                        <button
                            @click="this.remove(item)"
                            class="w-6 h-6 ml-1 rounded-full bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 text-xs flex items-center justify-center transition-colors"
                            title="Remove">
                            ✕
                        </button>
                    </div>
                </div>
            </div>

            <!-- Promo + totals + checkout -->
            <div x-show="cartCount" class="mt-4 pt-4 border-t border-gray-100 space-y-3">

                <!-- Promo code -->
                <div class="flex gap-2">
                    <input
                        x-model="promoInput"
                        type="text"
                        placeholder="Promo code"
                        class="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-tomato-400">
                    <button
                        @click="this.applyPromo()"
                        class="px-3 py-1.5 bg-crust-100 hover:bg-crust-200 text-sm font-medium rounded-lg transition-colors">
                        Apply
                    </button>
                </div>
                <p x-show="promoError" class="text-xs text-red-500">{{promoError}}</p>
                <p x-show="discount" class="text-xs text-basil-600 font-medium">✓ Promo applied: −{{discount}}%</p>

                <!-- Totals -->
                <div class="space-y-1 text-sm">
                    <div class="flex justify-between text-gray-500">
                        <span>Subtotal</span>
                        <span>€ {{ $formatPrice(subtotal) }}</span>
                    </div>
                    <div x-show="discount" class="flex justify-between text-basil-600">
                        <span>Discount ({{discount}}%)</span>
                        <span>− € {{ $formatPrice(subtotalMinusFinal) }}</span>
                    </div>
                    <div class="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-100">
                        <span>Total</span>
                        <span>€ {{ $formatPrice(finalTotal) }}</span>
                    </div>
                </div>

                <!-- CTA -->
                <button
                    @click="this.order()"
                    class="w-full py-3 bg-tomato-500 hover:bg-tomato-600 text-white font-semibold rounded-xl transition-colors">
                    Order now 🍕
                </button>
                <button
                    @click="this.clear()"
                    class="w-full py-2 text-xs text-gray-400 hover:text-red-500 transition-colors">
                    Clear cart
                </button>
            </div>

            <!-- Order confirmation -->
            <div x-show="ordered" class="mt-4 p-4 bg-basil-50 border border-basil-200 rounded-xl text-center">
                <p class="text-2xl mb-1">🎉</p>
                <p class="font-semibold text-basil-700">Order placed!</p>
                <p class="text-xs text-basil-600 mt-1">Your pizza is on its way.</p>
            </div>
        </aside>`;
    },

    increment(item) {
        dispatch({ type: 'CART_UPDATE_QTY', payload: { id: item.id, qty: item.qty + 1 } });
    },

    decrement(item) {
        dispatch({ type: 'CART_UPDATE_QTY', payload: { id: item.id, qty: item.qty - 1 } });
    },

    remove(item) {
        dispatch({ type: 'CART_REMOVE', payload: item.id });
    },

    clear() {
        dispatch({ type: 'CART_CLEAR' });
        this.data.ordered.value  = false;
        this.data.promoInput.value = '';
        this.data.promoError.value = '';
    },

    applyPromo() {
        const code = this.data.promoInput.value.trim();
        if (!code) return;
        const before = this.data.discount.value;
        dispatch({ type: 'CART_APPLY_PROMO', payload: code });
        // Give the store subscriber one tick to update discount signal
        setTimeout(() => {
            if (this.data.discount.value === before) {
                this.data.promoError.value = `"${code}" is not a valid promo code.`;
            } else {
                this.data.promoError.value = '';
                this.data.promoInput.value = '';
            }
        }, 0);
    },

    order() {
        if (!this.data.cartCount.value) return;
        dispatch({ type: 'CART_CLEAR' });
        this.data.ordered.value = true;
        setTimeout(() => { this.data.ordered.value = false; }, 3500);
    },

}, (state) => ({
    cartItems:        selectCartItems(state),
    cartCount:        selectCartCount(state),
    subtotal:           selectCartSubtotal(state),
    discount:           selectCartDiscount(state),
    finalTotal:         selectCartFinalTotal(state),
    subtotalMinusFinal: selectCartSubtotal(state) - selectCartFinalTotal(state),
}));