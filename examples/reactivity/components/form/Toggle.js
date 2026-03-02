export default {
    template() {
        /*html*/
        return `
            <div :class="'flex items-center' + ( extraClass ? ' ' + extraClass : '')">
                <div :class="'relative inline-block w-11 h-6 rounded-full transition-colors duration-300 cursor-pointer ' + (isOn ? 'bg-gray-800' : 'bg-gray-400')" @click="change">
                    <div :class="'absolute top-0 left-0 w-6 h-6 bg-white rounded-full border border-gray-300 shadow-sm transition-transform duration-300 cursor-pointer ' + (isOn ? 'translate-x-5 border-gray-800' : '')"></div>
                </div>
                <div class="ml-2 text-xs" x-if="label">{{label}}</div>
            </div>
        `;
    },
    props: ['model-val', 'default', 'label', 'class'],
    data() {
        return {
            modelVal: null,
            extraClass: null,
            uid: null,
            isOn: false
        }
    },
    update() {
        this.data.isOn.value = !!this.data.modelVal.value;
    },
    change() {
        this.data.modelVal.value = !this.data.modelVal.value;
        this.update();
        this.emit('change', this.data.modelVal.value, !this.data.modelVal.value)
    },
    init() {
        this.data.uid.value = 'switch-' + Math.random().toString(36).slice(2, 8);

        if (this.props['model-val'] !== undefined) {
            this.data.modelVal.value = this.props['model-val'];
        }
        else if (this.props.default !== undefined) {
            this.data.modelVal.value = this.props.default;
        }

        if (this.props.class) {
            this.data.extraClass.value = this.props.class;
        }
        this.update();
    },
    emits: ['change']
}
