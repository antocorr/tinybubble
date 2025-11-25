// main.js
import { createRouter } from '../../../src/index.js';
import Home from '../pages/Home.js';
import About from '../pages/About.js';

export const router = createRouter({
    mode: 'hash',
    base: window.location.pathname,
    routes: [
        { path: '/', component: Home },
        { path: '/about', component: About },
        { path: '/persistent-home', component: Home, persistent: true, data: { props: { addTitle: 'Is Persistent!'}  }},
    ]
});
