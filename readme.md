# BubbleJs
A reactive vanilla javascript library based on singnals and pub sub.

## Import the library
### As a ES-6 module (recommended) from CDN
```javascript
import { createComponent } from "https://cdn.jsdelivr.net/gh/antocorr/bubble/src/lib/dist/bubble.js"
```

### Import via npm

```shell
npm i https://github.com/antocorr/bubble
```


## Using the library

### Vue Single File component style


```javascript
//components/MyComponent.js
export default {
    name: 'Shoryuken',
    template(){
         /*html*/
         return `
            <div>
                <div>{{ character }}</div>
                <div class="counter mt-4">
                    <p>Count: {{counter}}</p>
                    <button class="bg-blue-500 text-white p-2" @click="this.increment()">Increment</button>
                </div>
            </div>
         `
    },
    increment() {
        //data is the original data, _data are signals
        this._data.counter.value++;
    },
    data(){
        return{
            counter: 1,
            character: 'Ken'
        }
    }
}

```


```javascript
//in your main js file
import { createComponent } from "bubble";
import MyComponent from "./components/MyComponent.js";
const override = { name 'Hadouken', props: { counter: 5, character: 'Ryu'} };
const myComponent = createComponent(MyComponent,  override);
myComponent.appendTo(document.body);

```

### Signal style (Svelte Runes, SolidJs)

```javascript
import { html, effect, createSignal } from "../../../src/index.js";
const counter = html(
    /*html*/
    `
        <div class="counter mt-4">
                <p>Count: <span id="count">1</span></p>
                <button class="bg-blue-500 text-white p-2" id="btn">Increment</button>
            </div>
    `);
const btn = counter.querySelector('#btn');
const count = counter.querySelector('#count');
const [getCount, setCount] = createSignal(+count.textContent);
document.getElementById('app').appendChild(counter);
effect(() => {
    count.textContent = getCount();
})
btn.onclick = () => {
    setCount(getCount() + 1);
}
```

## Component library support

we are just testing shoelace support.

example: https://antocorr.github.io/bubble/src/lib/examples/reactivity/shoelace.html
