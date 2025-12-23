// main.js
import { createRouter } from '../../../src/index.js';
import Home from '../pages/Home.js';
import About from '../pages/About.js';
import User from '../pages/User.js';

export const router = createRouter({
    mode: 'hash',
    base: window.location.pathname,
    // Resolve lazy-loaded `src` values relative to this file
    srcBase: import.meta.url,
    routes: [
        { path: '/', component: Home },
        { path: '/about', component: About },
        { path: '/user/:id', component: User },
        { path: '/persistent-home', component: Home, persistent: true, data: { props: { addTitle: 'Is Persistent!' } } },
        { path: '/async', src: '../pages/AsyncPage.js' },
    ]
});
