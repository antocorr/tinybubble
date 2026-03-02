export default {
    template() {
        /*html*/
        return `
            <div class="block w-full my-4">
                <label for="countries" class="block mb-2 text-sm font-medium text-gray-600 w-full" x-if="label">{{label}}</label>
                <select ref="select" class="h-12 border border-gray-300 text-gray-600 text-base rounded-lg block w-full py-2.5 px-4 focus:outline-none" @change="change" x-model="modelVal">
                    <option selected value="">{{ placeholder || 'Select an option' }}</option>
                    <option x-for="item in items" :value="typeof item == 'object' ? item.value : item">{{ typeof item == 'object' ? item.text || item.value : item }}</option>
                </select>
            </div>
        `;
    },
    props: ['items', 'model-val', 'placeholder', 'default', 'label'],
    data() {
        return {
            modelVal: null,
        }
    },
    change(val, oldVal) {
        this.emit('change', val, oldVal)
    },
    init() {
        if (this.props.default) {
            this.data.modelVal.value = this.props.default;
        }
        if (this.props['model-val']) {
            this.data.modelVal.value = this.props['model-val'];
            this.refs.select.value = this.data.modelVal.value;
        }
    },
    emits: ['change']
}
