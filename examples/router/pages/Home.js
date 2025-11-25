// pages/Home.js
export default {
  name: 'HomePage',
  template() {
    /*html*/
    return `
      <section class="home-page p-6 max-w-2xl mx-auto">
        <h1 class="text-3xl font-bold mb-4">👋 Welcome to Bubble!</h1>
        <p class="mb-6">
          This is your main page, ready to be expanded just like in Vue, React, or Angular.<br/>
          {{ addTitle }}
        </p>

        <div class="mb-6">
          <div class="mb-4">You can use -x-on:click or @click for events!</div>
          <span class="font-semibold">Visits:</span>
          <span>{{ visits }}</span>          
          <button
            -x-on:click="this.incrementVisits()"
            class="ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Visit
          </button>
        </div>
      </section>
    `;
  },
  data() {
    return {
      visits: 0
    };
  },
  incrementVisits() {
    // In Bubble SFC components, reactive data lives under this._data
    this._data.visits.value++;
  },
  init() {
    // Optional lifecycle hook after DOM mount
    console.log('🔔 HomePage mounted successfully!');
  }
};
