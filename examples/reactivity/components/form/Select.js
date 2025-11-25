export default {
    template() {
        /*html*/
        return `
            <div class="block w-full">
                <label for="countries" class="block mb-2 text-sm font-medium text-gray-600 w-full">Country</label>
                <select class="h-12 border border-gray-300 text-gray-600 text-base rounded-lg block w-full py-2.5 px-4 focus:outline-none" @change="change" x-model="modelVal">
                    <option selected>{{ placeholder || 'Select an option' }}</option>
                    <option x-for="item in items" :value="typeof item == 'object' ? item.value : item">{{ typeof item == 'object' ? item.text || item.value : item }}</option>
                </select>
            </div>
        `;
    },
    props: ['items', 'model-val', 'placeholder'],
    data() {
        return {
            modelVal: null,
        }
    },
    change(val, oldVal) {
        console.log("changed", val, this._data.modelVal.value, oldVal);
        this.emit('change', val)
    },
    init() {
        if (this.props['model-val']) {
            this._data.modelVal = this.props['model-val'];
        }
        console.log("placeholder", this.props.placeholder)
    },
    emits: ['change']
}
