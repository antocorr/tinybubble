import { nav } from '../navigation.js'

export default {
  name: 'AppSidebar',

  data() {
    return { sections: nav }
  },

  template() {
    return /*html*/`
      <nav class="py-6 pr-4 pl-2">
        <div x-for="section in sections" class="mb-6">
          <p class="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {{ section.section }}
          </p>
          <ul class="space-y-0.5">
            <li x-for="item in section.items">
              <a :href="'#' + item.path"
                 class="block px-3 py-1.5 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                 :class="{ 'nav-link-active': $route.path === item.path }">
                {{ item.label }}
              </a>
            </li>
          </ul>
        </div>
      </nav>
    `
  },
}
