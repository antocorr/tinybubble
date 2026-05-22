export default {
  name: 'NotFoundPage',
  template() {
    return /*html*/`
      <div class="text-center py-20">
        <p class="text-6xl font-bold text-gray-200 dark:text-gray-800 mb-4">404</p>
        <h1 class="text-2xl font-bold mb-4">Page not found</h1>
        <a href="#/" class="text-brand-600 dark:text-brand-400 hover:underline">← Back to home</a>
      </div>
    `
  },
}
