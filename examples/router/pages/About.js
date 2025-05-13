// pages/About.js
export default {
    name: 'AboutPage',
    /*html*/
    template() {
        return `
      <section class="about-page p-6 max-w-2xl mx-auto">
        <h1 class="text-3xl font-bold mb-4">ℹ️ About Bubble App</h1>
        <p class="mb-4">
          Bubble is a lightweight reactive framework that lets you build components and SPAs without any external dependencies.
        </p>

        <h2 class="text-2xl font-semibold mb-2">Key Features</h2>
        <ul class="list-disc list-inside mb-4">
          {{#each item in features}}
            <li>{{item}}</li>
          {{/each}}
        </ul>

        <div class="mb-6">
          <span class="font-semibold">Version:</span>
          <span>{{ version }}</span>
        </div>

        <nav class="space-x-4">
          <router-link to="/">Home</router-link>
          <router-link to="/contact">Contact</router-link>
        </nav>
      </section>
    `;
    },
    data() {
        return {
            version: '1.0.0',
            features: [
                'Reactive signals and effects',
                'Simple SFC-style components',
                'Built-in router (hash/history modes)',
                'Zero external dependencies'
            ]
        };
    },
    methods: {
        // add methods here if needed
    },
    mounted() {
        console.log('📝 AboutPage mounted');
    }
};
