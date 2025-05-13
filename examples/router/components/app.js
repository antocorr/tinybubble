import { router } from "../components/router.js";
import { createComponent } from '../../../src/index.js';
const App = {
    name: 'App',
    template() {
        /*html*/
        return `
    <div>
      <header class="p-4 bg-gray-100 flex space-x-4">
        <router-link to="/">Home</router-link>
        <router-link to="/about">About</router-link>
        <router-link to="/persistent-home">Persistent Home</router-link>
      </header>
      <main class="p-4">
        <router-view/>
      </main>
    </div>
    `;
    },
    components: {
        'router-link': router.RouterLink,
        'router-view': router.RouterView
    }
};

const app = createComponent(App);
app.appendTo(document.getElementById('app'));