import { createComponent, watch } from "../../../src/index.js";
// import { createComponent } from "../../../dist/bubble.js";
import Select from "./form/Select.js";
import Toggle from "./form/Toggle.js";
const App = {
    template() {
        /* html */
        return `<div>
            <h1 class="text-2xl font-bold">Basic test</h1>
            <div class="mt-4">
                <div class="mb-4">
                    <input type="text" class="border border-gray-300 p-2" x-model="name">
                </div>
                <div>
                    <input type="text" class="border border-gray-300 p-2" x-model="surname">
                </div>
                <p class="mt-2">Hello {{name}} {{surname}}</p>
            </div>
            <div class="counter mt-4">
                <p>Count: {{counter}}</p>
                <button class="bg-blue-500 text-white p-2" @click="this.increment()">Increment</button>
            </div>
            <div class="mt-4">Country1 value is: {{country1}}</div>
            <x-select :items="[{ text: 'Canada', value: 'CA'}, { text: 'France', value: 'FR'}, { text: 'Italy', value: 'IT'}]" @change="selectChange" placeholder="Select country" :model-val="country1" label="Country"></x-select>
            <x-select :items="[{ text: 'New Mexico', value: 'NMX'}, { text: 'Florida', value: 'FL'}, { text: 'California', value: 'CA'}]" @change="(x, y) => selectChange2(x, y, name)"></x-select>
            <x-select :items="[{ text: 'Germany', value: 'DE'}, { text: 'England', value: 'GB'}, { text: 'Sicily', value: 'SI'}]" default="GB" :model-val="country2"></x-select>
            <x-toggle label="toggle" class="mb-4" @change="switchChange"></x-toggle>
            <x-toggle label="toggle2"  :model-val="switchValue"></x-toggle>
            <!-- add a list -->
            <div class="mt-4">
                <ul>
                    <li x-for="item in items">{{item}}</li>
                </ul>
                <!--- add an input to add items to the list -->
                <input type="text" class="border border-gray-300 p-2" x-model="newItem" @keyup="checkInput">
                <button class="bg-blue-500 text-white p-2" @click="this.addItem()">Add item</button>
            </div>
        </div>`
    },
    components: {
        'x-select': Select,
        'x-toggle': Toggle
    },
    data() {
        return {
            name: 'Salted',
            surname: "Gringo",
            counter: 1,
            items: ['do laundry', "repair the car"],
            newItem: '',
            country1: 'CA',
            country2: 'DE',
            switchValue: true,            
        }
    },
    selectChange2(x, y, name) {
        console.log("select changed 2", x, y, name)
    },
    checkInput(evt) {
        if (evt.key == 'Enter') {
            this.addItem();
        }
    },
    selectChange(v) {
        console.log("select changed", v, this._data.country1.value)
    },
    increment() {
        this._data.counter.value++;
    },
    switchChange(v) {
        console.log("new value", v)
    },
    addItem() {
        if (!this._data.newItem.value) {
            return;
        }
        this._data.items.push(this._data.newItem.value);
        this._data.newItem.value = '';
    },
    init() {
        watch(this._data.country1, (v, old) => {
            console.log("watcher is enabled", v, old)
        })
    }
}

const app = createComponent(App);
app.appendTo(document.getElementById('app'));