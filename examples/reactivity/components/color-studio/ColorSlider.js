export default {
    name: "ColorSlider",
    props: ["value", "label", "accent"],
    emits: ["input"],

    template() {
        return /*html*/`
        <div>
            <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold tracking-widest uppercase" :style="'color:' + accent">
                    {{ label }}
                </span>
                <span class="w-8 text-right text-sm font-mono font-semibold text-white">{{ value }}</span>
            </div>
            <input
                type="range"
                min="0" max="255" step="1"
                :value="value"
                @input="onInput($event)"
                class="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-gray-700"
                :style="'accent-color:' + accent"
            />
        </div>
        `;
    },

    onInput(event) {
        this.emit("input", parseInt(event.target.value, 10));
    }
};
