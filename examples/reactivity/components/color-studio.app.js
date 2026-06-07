import { createComponent } from "../../../src/index.js";
import ColorSlider from "./color-studio/ColorSlider.js";

const ColorStudioApp = {
    name: "ColorStudioApp",
    components: {
        "color-slider": ColorSlider,
    },

    template() {
        return /*html*/`
        <div class="rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">

            <!-- Live color swatch -->
            <div class="relative h-48 transition-colors duration-150"
                :style="'background: linear-gradient(135deg, ' + getRgb() + ' 0%, ' + getDimRgb() + ' 100%)'">
                <div class="absolute inset-0 flex flex-col justify-end p-5 bg-gradient-to-t from-black/40 to-transparent">
                    <span class="text-xs font-semibold tracking-widest uppercase text-white/60 mb-1">Current color</span>
                    <span class="text-4xl font-mono font-black text-white drop-shadow">{{ getHex() }}</span>
                </div>
                <!-- Complementary dot -->
                <div class="absolute top-4 right-4 flex items-center gap-2">
                    <span class="text-xs text-white/50">compl.</span>
                    <div class="w-6 h-6 rounded-full ring-2 ring-white/20 shadow"
                        :style="'background:' + getComplementary()"></div>
                </div>
            </div>

            <!-- Controls panel -->
            <div class="bg-gray-900 px-6 pt-5 pb-6 space-y-5">

                <div class="flex items-center justify-between">
                    <h1 class="text-white font-bold">RGB Color Studio</h1>
                    <code class="text-xs bg-gray-800 text-gray-500 rounded-lg px-2.5 py-1 font-mono">
                        :value + @input
                    </code>
                </div>

                <!--
                    Figlio: <color-slider>
                    - :value  → passa il segnale al prop "value" del figlio
                    - @input  → ascolta l'evento "input" emesso dal figlio
                -->
                <color-slider :value="red"   label="Red"   accent="#f87171" @input="onRed"></color-slider>
                <color-slider :value="green" label="Green" accent="#4ade80" @input="onGreen"></color-slider>
                <color-slider :value="blue"  label="Blue"  accent="#60a5fa" @input="onBlue"></color-slider>

                <!-- RGB string + swatches -->
                <div class="flex items-center justify-between pt-2 border-t border-gray-800">
                    <span class="text-xs text-gray-500 font-mono">rgb({{ red }}, {{ green }}, {{ blue }})</span>
                    <div class="flex gap-1.5">
                        <div class="w-5 h-5 rounded-full ring-1 ring-white/10"
                            :style="'background:' + getRgb()"></div>
                        <div class="w-5 h-5 rounded-full ring-1 ring-white/10"
                            :style="'background:' + getComplementary()"></div>
                    </div>
                </div>

                <!-- Text preview -->
                <div class="rounded-xl border border-gray-800 bg-gray-950/50 px-4 py-3">
                    <p class="text-sm font-semibold leading-snug transition-colors duration-150"
                        :style="'color:' + getRgb()">
                        The quick brown fox jumps over the lazy dog.
                    </p>
                    <p class="mt-1 text-xs text-gray-700">text preview</p>
                </div>
            </div>
        </div>
        `;
    },

    data() {
        return { red: 99, green: 102, blue: 241 };
    },

    onRed(val)   { this.data.red.value   = val; },
    onGreen(val) { this.data.green.value = val; },
    onBlue(val)  { this.data.blue.value  = val; },

    getRgb() {
        return `rgb(${this.data.red.value}, ${this.data.green.value}, ${this.data.blue.value})`;
    },
    getDimRgb() {
        const dim = v => Math.max(0, Math.round(v * 0.35));
        return `rgb(${dim(this.data.red.value)}, ${dim(this.data.green.value)}, ${dim(this.data.blue.value)})`;
    },
    getHex() {
        const h = v => v.toString(16).padStart(2, "0");
        return `#${h(this.data.red.value)}${h(this.data.green.value)}${h(this.data.blue.value)}`;
    },
    getComplementary() {
        return `rgb(${255 - this.data.red.value}, ${255 - this.data.green.value}, ${255 - this.data.blue.value})`;
    },
};

const app = createComponent(ColorStudioApp);
app.appendTo(document.getElementById("app"));
