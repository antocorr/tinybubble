import { createComponent, registerHelper } from '../../../src/index.js';
import { connectStore }  from '../store/index.js';
import { selectCartCount } from '../store/selectors/cart.selectors.js';
import PizzaCard   from './PizzaCard.js';
import CartSidebar from './CartSidebar.js';

registerHelper('formatPrice', (value) =>
    Number(value).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
);

const App = connectStore({
    components: {
        'x-pizza-card':   PizzaCard,
        'x-cart-sidebar': CartSidebar,
    },

    data() {
        return {
            menuItems:  [],
            cartCount:  0,
        };
    },

    template() {
        /* html */
        return `
        <div class="min-h-screen bg-crust-50 paper">

            <!-- Header -->
            <header class="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-crust-100 shadow-sm">
                <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="text-2xl">🍕</span>
                        <span class="font-bold text-xl text-tomato-600">Pizzeria da Luigi</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-500">
                        <span>🛒</span>
                        <span x-show="cartCount" class="font-bold text-tomato-600">{{cartCount}}</span>
                        <span x-hide="cartCount" class="text-gray-300">0</span>
                    </div>
                </div>
            </header>

            <!-- Body: menu + cart -->
            <div class="max-w-6xl mx-auto px-4 py-8 flex gap-8 items-start">

                <!-- Menu grid -->
                <main class="flex-1 min-w-0">
                    <h2 class="text-2xl font-bold text-gray-900 mb-6">Our Menu</h2>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <x-pizza-card x-for="pizza in menuItems" :pizza="pizza"></x-pizza-card>
                    </div>
                </main>

                <!-- Cart sidebar -->
                <div class="w-80 shrink-0 sticky top-24 bg-white rounded-2xl shadow-sm border border-crust-100 p-5">
                    <x-cart-sidebar></x-cart-sidebar>
                </div>

            </div>
        </div>`;
    },

}, (state) => ({
    menuItems: state.menu.items,
    cartCount: selectCartCount(state),
}));

const app = createComponent(App);
app.appendTo(document.getElementById('app'));