import { router } from '../router.js'
import Sidebar from './Sidebar.js'

export default {
  name: 'App',

  components: {
    'app-sidebar':  Sidebar,
    'router-link':  router.RouterLink,
    'router-view':  router.RouterView,
  },

  data() {
    return { menuOpen: false }
  },

  template() {
    return /*html*/`
      <div class="min-h-screen flex flex-col">

        <!-- Navbar -->
        <header class="sticky top-0 z-50 h-14 border-b border-gray-200 dark:border-gray-800
                        bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm flex items-center px-4 gap-3">

          <button @click="toggleMenu"
            class="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-gray-100
                   hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          <a href="#/" class="flex items-center gap-2 font-bold text-lg text-brand-600 dark:text-brand-400 mr-2">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="4"/>
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" opacity="0.4"/>
              <circle cx="12" cy="12" r="13" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.15"/>
            </svg>
            TinyBubble
          </a>

          <span class="text-xs px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-mono">
            v1.0.2
          </span>

          <div class="flex-1"></div>

          <a href="https://github.com/antocorr/tinybubble" target="_blank" rel="noopener"
             class="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-gray-100
                    hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
          </a>

          <button @click="toggleDark"
            class="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-gray-100
                   hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Toggle dark mode">
            <svg class="w-5 h-5 hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>
            </svg>
            <svg class="w-5 h-5 block dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
          </button>
        </header>

        <div class="flex flex-1 relative">

          <!-- Mobile overlay -->
          <div @click="closeMenu" x-show="menuOpen"
               class="fixed inset-0 z-30 bg-black/40 lg:hidden"></div>

          <!-- Sidebar -->
          <aside class="fixed top-14 bottom-0 left-0 z-40 w-64 overflow-y-auto
                         bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800
                         transition-transform duration-200 lg:translate-x-0 lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)]"
                 :class="{ '-translate-x-full': !menuOpen, 'translate-x-0': menuOpen }">
            <app-sidebar></app-sidebar>
          </aside>

          <!-- Content -->
          <main class="flex-1 min-w-0 px-6 md:px-10 py-10 max-w-4xl mx-auto lg:mx-0">
            <router-view></router-view>
          </main>

        </div>
      </div>
    `
  },

  toggleMenu() {
    this.data.menuOpen.value = !this.data.menuOpen.value
  },

  closeMenu() {
    this.data.menuOpen.value = false
  },

  toggleDark() {
    const isDark = document.documentElement.classList.toggle('dark')
    localStorage.setItem('tb-theme', isDark ? 'dark' : 'light')
  },

  init() {
    // Close sidebar on hash navigation
    window.addEventListener('hashchange', () => {
      this.data.menuOpen.value = false
      window.scrollTo({ top: 0, behavior: 'instant' })
    })
  },
}
