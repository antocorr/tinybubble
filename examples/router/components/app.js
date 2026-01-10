import { router } from "../components/router.js";
import { createComponent } from '../../../src/index.js';
const App = {
  name: 'App',
  template() {
    /*html*/
    return `
    <div>
      <header class="p-4 bg-gray-100 flex space-x-4">
        <div x-for="item in navItems" :class="'inline-block px-4 py-2 rounded-xl' + (item.destination == currentLink ? ' bg-gray-200' : '')">
          <router-link :to="item.destination" @click="selectLink(item)">{{item.title}}</router-link>
        </div>
      </header>
      <main class="p-4">
        <router-view/>
      </main>
    </div>
    `;
  },
  data() {
    return {
      currentLink: '/',
      navItems: [{
        destination: '/',
        title: 'Home'
      },
      {
        destination: '/about',
        title: 'About'
      },
      {
        destination: '/persistent-home',
        title: 'Persistent Home'
      },
      {
        destination: '/async',
        title: 'Async route'
      },
      {
        destination: '/user/1',
        title: 'User 1'
      },
      {
        destination: '/user/2',
        title: 'User 2'
      },
      {
        destination: '/nested-arrays',
        title: 'Nested Arrays'
      }
      ]
    }
  },
  components: {
    'router-link': router.RouterLink,
    'router-view': router.RouterView
  },
  selectLink(item) {
    this._data.currentLink.value = item.destination;
  },
  init() {
    this._data.currentLink.value = router.getDestination();
  }
};

const app = createComponent(App);
app.appendTo(document.getElementById('app'));
