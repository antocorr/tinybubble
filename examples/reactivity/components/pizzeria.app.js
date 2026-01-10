import { createComponent } from "../../../src/index.js";
import SinglePizzaEditor from "./SinglePizzaEditor.js";

const PizzeriaApp = {
    name: "PizzeriaApp",
    components: {
        "single-pizza-editor": SinglePizzaEditor
    },
    template() {
        /* html */
        return `
        <div class="min-h-[70vh]">
            <header class="rounded-2xl border border-crust-200 bg-white/80 shadow-sm overflow-hidden">
                <div class="px-6 py-5 border-b border-crust-100">
                    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div>
                            <div class="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-basil-800">
                                <span class="h-2 w-2 rounded-full bg-basil-600"></span>
                                Menu editor
                            </div>
                            <h1 class="mt-1 text-3xl sm:text-4xl font-serif font-extrabold text-stone-900">
                                Pizzeria <span class="text-tomato-700">Tradition</span>
                            </h1>
                            <p class="mt-1 text-sm text-stone-600">
                                Reactivity + Tailwind example: filter, select, and edit pizzas.
                            </p>
                        </div>
                        <div class="flex items-center gap-2">
                            <button class="px-3.5 py-2.5 rounded-xl bg-tomato-600 hover:bg-tomato-700 text-white text-sm font-semibold shadow-sm"
                                type="button"
                                @click="startNewPizza">
                                + New pizza
                            </button>
                        </div>
                    </div>
                </div>

                <div class="px-6 py-4">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <label class="block lg:col-span-2">
                            <span class="block text-xs font-semibold tracking-wide uppercase text-stone-600">Search</span>
                            <input class="mt-1 w-full rounded-xl border border-crust-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-tomato-200 focus:border-tomato-300"
                                placeholder="E.g. Margherita, Pepperoni..."
                                type="text"
                                x-model="search" />
                        </label>
                        <div class="flex items-end justify-between gap-3 lg:justify-end">
                            <div class="text-sm text-stone-700">
                                <span class="font-semibold">{{ getVisibleItems().length }}</span> pizzas
                            </div>
                            <button class="px-3 py-2 rounded-xl border border-crust-200 bg-white hover:bg-crust-50 text-stone-800 text-sm"
                                type="button"
                                @click="resetFilters"
                                x-if="search || selectedCategoryId">
                                Reset filters
                            </button>
                        </div>
                    </div>

                    <div class="mt-4 flex flex-wrap gap-2">
                        <button class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border border-crust-200 bg-white hover:bg-crust-50 transition focus:outline-none focus:ring-2 focus:ring-basil-200"
                            :class="(selectedCategoryId ? 'text-stone-800' : 'text-white bg-basil-700 border-basil-700 hover:bg-basil-700')"
                            type="button"
                            @click="setCategory(0)">
                            All
                        </button>
                        <button class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border border-crust-200 bg-white hover:bg-crust-50 transition focus:outline-none focus:ring-2 focus:ring-basil-200"
                            x-for="cat in categories"
                            :class="(selectedCategoryId == cat.id ? 'text-white bg-basil-700 border-basil-700 hover:bg-basil-700' : 'text-stone-800')"
                            type="button"
                            @click="setCategory(cat.id)">
                            {{ cat.name }}
                        </button>
                    </div>
                </div>
            </header>

            <main class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <section class="lg:col-span-1">
                    <div class="rounded-2xl border border-crust-200 bg-white/90 shadow-sm overflow-hidden">
                        <div class="px-5 py-4 border-b border-crust-100 flex items-center justify-between">
                            <h2 class="text-base font-semibold text-stone-900">Pizza list</h2>
                            <div class="text-xs text-stone-500" x-if="loading">Loading...</div>
                        </div>

                        <div class="p-2">
                            <div class="rounded-xl border border-tomato-200 bg-tomato-50 px-4 py-3 text-sm text-tomato-900"
                                x-if="error">
                                {{ error }}
                            </div>
                            <div class="mt-2 space-y-2" x-if="!loading">
                                <button class="w-full text-left rounded-xl border border-crust-200 bg-white hover:bg-crust-50 px-4 py-3 transition focus:outline-none focus:ring-2 focus:ring-tomato-200"
                                    x-for="pizza in getVisibleItems()"
                                    :class="(selectedPizzaId == pizza.id ? 'ring-2 ring-tomato-200 border-tomato-300 bg-tomato-50/40' : '')"
                                    type="button"
                                    @click="selectPizza(pizza.id)">
                                    <div class="flex items-start justify-between gap-3">
                                        <div class="min-w-0">
                                            <div class="font-semibold text-stone-900 truncate leading-tight">{{ pizza.name }}</div>
                                            <div class="mt-1 text-xs text-stone-600">
                                                {{ getCategoryName(pizza.categoryId) }} · {{ pizza.ingredientIds.length }} ingredients
                                            </div>
                                        </div>
                                        <div class="shrink-0 text-sm font-extrabold text-tomato-700 tabular-nums text-right leading-none pt-0.5">
                                            €{{ formatPrice(pizza.price) }}
                                        </div>
                                    </div>
                                </button>

                                <div class="rounded-xl border border-crust-200 bg-crust-50 px-4 py-6 text-center text-sm text-stone-600"
                                    x-if="getVisibleItems().length === 0">
                                    No results: try adjusting the filters.
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="lg:col-span-2">
                    <div class="rounded-2xl border border-crust-200 bg-white/80 shadow-sm px-5 py-4"
                        x-if="!selectedPizza">
                        <div class="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-stone-600">
                            <span class="h-2 w-2 rounded-full bg-tomato-600"></span>
                            Selection
                        </div>
                        <h2 class="mt-2 text-2xl font-serif font-bold text-stone-900">Choose a pizza</h2>
                        <p class="mt-1 text-sm text-stone-600">
                            Pick an item from the list or create a new pizza.
                        </p>
                    </div>

                    <single-pizza-editor
                        x-if="selectedPizza"
                        :currentItem="selectedPizza"
                        :categories="categories"
                        :ingredients="ingredients"
                        :mode="editorMode"
                        -x-on:save="onSavePizza"
                        -x-on:cancel="onCancelEdit"
                        -x-on:delete="onDeletePizza"
                    ></single-pizza-editor>

                    <div class="mt-3 text-sm text-basil-800 font-semibold"
                        x-if="toast">
                        {{ toast }}
                    </div>
                </section>
            </main>
        </div>
        `;
    },
    data() {
        return {
            loading: true,
            error: "",
            categories: [],
            ingredients: [],
            items: [],
            search: "",
            selectedCategoryId: 0,
            selectedPizzaId: null,
            selectedPizza: null,
            editorMode: "edit",
            toast: ""
        };
    },
    init() {
        this.loadData();
    },
    async loadData() {
        this._data.loading.value = true;
        this._data.error.value = "";
        this._data.toast.value = "";
        try {
            const url = new URL("../data/pizzeria.json", import.meta.url);
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();

            this._data.categories.value = json.categories || [];
            this._data.ingredients.value = json.ingredients || [];
            this._data.items.value = json.items || [];

            const firstId = this._data.items.value?.[0]?.id ?? null;
            if (firstId != null) this.selectPizza(firstId);
        } catch (err) {
            console.warn("Menu loading error:", err);
            this._data.error.value = "Unable to load the menu.";
            this._data.items.value = [];
            this._data.selectedPizzaId.value = null;
            this._data.selectedPizza.value = null;
        } finally {
            this._data.loading.value = false;
        }
    },
    resetFilters() {
        this._data.search.value = "";
        this._data.selectedCategoryId.value = 0;
    },
    setCategory(categoryId) {
        this._data.selectedCategoryId.value = categoryId;
    },
    formatPrice(v) {
        const n = Number(v);
        if (!Number.isFinite(n)) return "0.00";
        return n.toFixed(2);
    },
    getCategoryName(categoryId) {
        const id = Number(categoryId);
        const cat = (this._data.categories.value || []).find((c) => c.id === id);
        return cat?.name || "—";
    },
    getVisibleItems() {
        const items = this._data.items.value || [];
        const q = String(this._data.search.value || "").trim().toLowerCase();
        const catId = Number(this._data.selectedCategoryId.value) || 0;

        return items.filter((p) => {
            if (catId && Number(p.categoryId) !== catId) return false;
            if (!q) return true;
            return String(p.name || "").toLowerCase().includes(q);
        });
    },
    selectPizza(pizzaId) {
        const items = this._data.items.value || [];
        const id = Number(pizzaId);
        const pizza = items.find((p) => Number(p.id) === id);
        if (!pizza) {
            this._data.selectedPizzaId.value = null;
            this._data.selectedPizza.value = null;
            return;
        }

        this._data.selectedPizzaId.value = pizza.id;
        this._data.editorMode.value = "edit";
        this._data.selectedPizza.value = {
            ...pizza,
            ingredientIds: [...(pizza.ingredientIds || [])]
        };
    },
    startNewPizza() {
        const categories = this._data.categories.value || [];
        const categoryId = categories?.[0]?.id ?? "";

        this._data.selectedPizzaId.value = null;
        this._data.editorMode.value = "new";
        this._data.toast.value = "";
        this._data.selectedPizza.value = {
            name: "",
            categoryId,
            ingredientIds: [],
            price: ""
        };
    },
    onCancelEdit() {
        if (this._data.editorMode.value === "new") {
            this._data.selectedPizza.value = null;
            this._data.editorMode.value = "edit";
            return;
        }
        const id = this._data.selectedPizzaId.value;
        if (id != null) this.selectPizza(id);
    },
    onSavePizza(payload) {
        const item = payload?.item || this._data.selectedPizza.value;
        if (!item) {
            this._data.toast.value = "Unable to save: missing data.";
            return;
        }

        const ingredients = Array.isArray(item.ingredientIds) ? item.ingredientIds : [];
        const normalized = {
            ...item,
            categoryId: item.categoryId === "" ? "" : Number(item.categoryId),
            price: item.price === "" ? "" : Number(item.price),
            ingredientIds: [...ingredients]
        };

        const items = this._data.items.value || [];
        const isNew = this._data.editorMode.value === "new" || normalized.id == null;

        if (isNew) {
            const maxId = items.reduce((m, p) => Math.max(m, Number(p.id) || 0), 0);
            const saved = { ...normalized, id: maxId + 1 };
            this._data.items.value = [...items, saved];
            this._data.toast.value = "Pizza added to the menu.";
            this._data.editorMode.value = "edit";
            this.selectPizza(saved.id);
            return;
        }

        const updated = items.map((p) => Number(p.id) === Number(normalized.id) ? { ...p, ...normalized } : p);
        this._data.items.value = updated;
        this._data.toast.value = "Changes saved.";
        this.selectPizza(normalized.id);
    },
    onDeletePizza({ id }) {
        const items = this._data.items.value || [];
        const next = items.filter((p) => Number(p.id) !== Number(id));
        if (next.length === items.length) return;

        const removed = items.find((p) => Number(p.id) === Number(id));
        this._data.items.value = next;
        this._data.toast.value = `Deleted: ${removed?.name || "pizza"}.`;
        this._data.selectedPizzaId.value = null;
        this._data.selectedPizza.value = null;
        this._data.editorMode.value = "edit";

        if (next.length) {
            this.selectPizza(next[0].id);
        }
    }
};

const app = createComponent(PizzeriaApp);
app.appendTo(document.getElementById("app"));
