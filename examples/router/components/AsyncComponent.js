export default {
  name: 'AsyncComponent',
  template() {
    /*html*/
    return `
    <div class="p-4 rounded-lg bg-indigo-50 border border-indigo-200">
      <p class="text-indigo-900 font-semibold">Hello from an async component!</p>
      <p class="text-indigo-800 text-sm mt-1">Loaded at {{ loadedAt }}</p>
    </div>
    `;
  },
  data() {
    return {
      loadedAt: new Date().toLocaleTimeString()
    };
  }
};
