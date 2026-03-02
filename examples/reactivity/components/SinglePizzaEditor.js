export default {
    name: "SinglePizzaEditor",
    props: ["currentItem", "categories", "ingredients", "mode"],
    emits: ["save", "cancel", "delete"],
    template() {
        /* html */
        return `
        <section class="rounded-2xl border border-crust-200 bg-white/90 shadow-sm">
            <header class="px-5 py-4 border-b border-crust-100 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div class="min-w-0">
                    <div class="text-sm font-semibold tracking-wide text-tomato-700 uppercase">
                        {{ mode === 'new' ? 'New pizza' : 'Edit pizza' }}
                    </div>
                    <h2 class="mt-1 text-xl font-serif font-bold text-stone-900 leading-tight truncate">
                        {{ currentItem?.name || '—' }}
                    </h2>
                    <p class="mt-1 text-sm text-stone-600">
                        Update the selected pizza.
                    </p>
                </div>
                <div class="flex items-center justify-end gap-2">
                    <button class="px-3 py-2 rounded-lg border border-crust-200 bg-white hover:bg-crust-50 text-stone-800 text-sm"
                        type="button" @click="cancel">
                        Cancel
                    </button>
                    <button class="px-3 py-2 rounded-lg bg-basil-600 hover:bg-basil-700 text-white text-sm font-semibold shadow-sm"
                        type="button" @click="save">
                        Save
                    </button>
                </div>
            </header>

            <div class="p-5">
                <div class="rounded-xl border border-tomato-200 bg-tomato-50 text-tomato-900 px-4 py-3 text-sm"
                    x-if="errors.length">
                    <div class="font-semibold">Please check these:</div>
                    <ul class="mt-1 list-disc pl-5">
                        <li x-for="err in errors">{{ err }}</li>
                    </ul>
                </div>
                
                <div class="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <label class="block">
                        <span class="block text-sm font-semibold text-stone-800">Name</span>
                        <input class="mt-1 w-full rounded-xl border border-crust-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-tomato-200 focus:border-tomato-300"
                            type="text" placeholder="" x-model="currentItem.name" />
                    </label>

                    <label class="block">
                        <span class="block text-sm font-semibold text-stone-800">Price (€)</span>
                        <input class="mt-1 w-full rounded-xl border border-crust-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-tomato-200 focus:border-tomato-300 tabular-nums"
                            type="number" step="0.01" min="0" placeholder="8.99" x-model="currentItem.price" />
                    </label>

                    <label class="block lg:col-span-2">
                        <span class="block text-sm font-semibold text-stone-800">Category</span>
                        <select class="mt-1 w-full rounded-xl border border-crust-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-basil-200 focus:border-basil-300"
                            x-model="currentItem.categoryId">
                            <option value="" disabled>Select a category</option>
                            <option x-for="cat in categories" :value="cat.id">
                                {{ cat.name }}
                            </option>
                        </select>
                    </label>
                </div>

                <div class="mt-6">
                    <div class="flex items-end justify-between gap-3">
                        <div>
                            <div class="text-sm font-semibold text-stone-800">Ingredients</div>
                            <div class="text-xs text-stone-600">Check to add or remove.</div>
                        </div>
                        <div class="text-xs text-stone-500">
                            Selected: {{ (currentItem?.ingredientIds || []).length }}
                        </div>
                    </div>

                    <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <label class="flex items-center gap-3 rounded-xl border border-crust-200 bg-white px-3 py-2 hover:bg-crust-50 cursor-pointer"
                            x-for="ing in ingredients">
                            <input class="h-4 w-4 rounded border-crust-300 text-basil-600 focus:ring-basil-200"
                                type="checkbox"
                                :checked="isIngredientSelected(ing.id)"
                                @change="(e) => toggleIngredient(ing.id, e)" />
                            <span class="text-sm text-stone-800">{{ ing.name }}</span>
                        </label>
                    </div>

                    <div class="mt-3 flex flex-wrap gap-2" x-if="(currentItem?.ingredientIds || []).length">
                        <span class="inline-flex items-center rounded-full bg-crust-100 px-2.5 py-1 text-xs font-semibold text-stone-800"
                            x-for="tag in selectedIngredientNames()">
                            {{ tag }}
                        </span>
                    </div>
                </div>

                <div class="mt-6 flex items-center justify-between">
                    <button class="text-sm font-semibold text-tomato-700 hover:text-tomato-800"
                        type="button"
                        x-if="mode !== 'new'"
                        @click="requestDelete">
                        Delete pizza
                    </button>
                    <span class="text-xs text-stone-500">
                        ID: {{ currentItem?.id || '—' }}
                    </span>
                </div>
            </div>
        </section>
        `;
    },
    data() {
        return {
            errors: []
        };
    },
    isIngredientSelected(ingredientId) {
        // Direct access to props (auto-unwrapped)
        const ids = this.props.currentItem?.ingredientIds || [];
        return Array.isArray(ids) && ids.includes(ingredientId);
    },
    toggleIngredient(ingredientId, evt) {
        // Direct access to the proxied object
        const item = this.props.currentItem;
        if (!item) return;
        
        const checked = !!evt?.target?.checked;
        const prev = Array.isArray(item.ingredientIds) ? item.ingredientIds : [];
        const next = checked 
            ? Array.from(new Set([...prev, ingredientId])) 
            : prev.filter(id => id !== ingredientId);
            
        // Direct change propagates to the parent
        item.ingredientIds = next;
    },
    selectedIngredientNames() {
        const ids = this.props.currentItem?.ingredientIds || [];
        const ings = this.props.ingredients || [];
        // Map ID -> Name
        const map = new Map(ings.map(i => [i.id, i.name]));
        return ids.map(id => map.get(id) || `#${id}`);
    },
    validate() {
        const errors = [];
        const item = this.props.currentItem || {};
        const name = String(item.name || "").trim();
        const price = Number(item.price);
        const categoryId = Number(item.categoryId);
        const ingredientIds = Array.isArray(item.ingredientIds) ? item.ingredientIds : [];

        if (!name) errors.push("Enter a name.");
        if (!Number.isFinite(price) || price <= 0) errors.push("Enter a valid price (> 0).");
        if (!Number.isFinite(categoryId) || categoryId <= 0) errors.push("Select a category.");
        if (ingredientIds.length === 0) errors.push("Select at least one ingredient.");

        this.data.errors.value = errors;
        return errors.length === 0;
    },
    save(evt) {
        evt?.preventDefault?.();
        if (!this.validate()) return;

        const item = this.props.currentItem || {};
        const payload = {
            ...item,
            ingredientIds: Array.isArray(item.ingredientIds) ? [...item.ingredientIds] : []
        };

        this.data.errors.value = [];
        this.emit("save", { item: payload });
    },
    cancel() {
        // Clear errors and emit cancel
        this.data.errors.value = [];
        this.emit("cancel");
    },
    requestDelete() {
        const id = this.props.currentItem?.id;
        if (id != null) {
            this.emit("delete", { id });
        }
    }
};
