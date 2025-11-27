import { importComponent } from '../../../src/lib/Reactivity.js';

export default {
    name: 'AsyncPage',
    template() {
        /*html*/
        return `
    <section class="space-y-6">
      <header class="space-y-2">
        <p class="text-sm uppercase tracking-wide text-gray-500">Lazy loaded demo</p>
        <h1 class="text-3xl font-semibold">Async route page</h1>
        <p class="text-gray-700">
          This page is not bundled in the shell. The router loads it on demand via
          <code>route.src</code>, so the browser only downloads it when you click the link.
        </p>
      </header>

      <article class="p-4 bg-gray-50 border rounded-lg space-y-3">
        <h2 class="text-xl font-medium">How the async load works</h2>
        <p class="text-gray-700">
          The router waits until you navigate to <code>/async</code> before calling
          <code>import(route.src)</code>. After the module resolves, it renders the default export
          like any other page component.
        </p>
        <ul class="list-disc pl-5 space-y-1 text-gray-800">
          <li x-for="point in points">{{ point }}</li>
        </ul>
      </article>

      <section class="p-4 border rounded-lg space-y-4">
        <div class="flex items-center gap-3">
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
            ref="fetchBtn"
            @click="simulateFetch"
          >
            {{ loading ? 'Loading…' : 'Simulate async fetch' }}
          </button>
          <span class="text-sm text-gray-600">{{ status }}</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-3 bg-white border rounded-md">
            <h3 class="font-semibold mb-2">Last fetch log</h3>
            <p class="text-sm text-gray-700" x-if="log.length === 0">
              Click the button to trigger a fake API call.
            </p>
            <template x-for="item in log">
              <p class="text-sm text-gray-800">• {{ item }}</p>
            </template>
          </div>
          <div class="p-3 bg-white border rounded-md">
            <h3 class="font-semibold mb-2">Why use async routes?</h3>
            <p class="text-sm text-gray-700">
              Lazy routes keep the initial bundle tiny. Users only download code for the pages they actually visit,
              which is great for docs, dashboards, or rarely used admin sections.
            </p>
          </div>
        </div>
      </section>

      <section class="p-4 border rounded-lg space-y-4">
        <div class="flex items-center gap-2 justify-between">
          <div class="space-y-1">
            <h3 class="text-lg font-semibold">Showcase: importComponent()</h3>
            <p class="text-sm text-gray-700">
              Dynamically import and mount a component at runtime. Helpful when you want a light shell but still need optional widgets.
            </p>
            <pre>
const src = new URL('../components/AsyncComponent.js', import.meta.url).href;
const comp = await importComponent(src);
comp.appendTo(host);
            </pre>
          </div>
          <button
            class="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-60 whitespace-nowrap"
            :disabled="childLoading"
            @click="loadAsyncChild"
          >
            {{ childLoading ? 'Importing…' : (childLoaded ? 'Reload widget' : 'Load widget') }}
          </button>
        </div>
        <p class="text-sm text-gray-600">{{ childStatus }}</p>
        <div ref="asyncChildHost" class="min-h-[96px] p-3 bg-white border border-dashed rounded-md flex items-center justify-center text-gray-500">
          <span x-if="!childLoaded">Nothing mounted yet.</span>
        </div>
      </section>
    </section>
    `;
    },
    data() {
        return {
            loading: false,
            status: 'Idle — ready to load.',
            log: [],
            points: [
                'Routes can declare a "src" pointing to a module instead of embedding the component.',
                'The router resolves that path relative to the router config file and imports it when matched.',
                'After the import finishes, the default export is treated like a normal Bubble component.',
                'Combine "persistent: true" with async routes to keep once-loaded pages warm in memory.',
            ],
            childLoading: false,
            childLoaded: false,
            childStatus: 'Idle — click to mount the async widget.'
        };
    },
    simulateFetch() {
        if (this._data.loading.value) return;
        this.refs.fetchBtn.setAttribute('disabled', true);
        this._data.loading.value = true;
        this._data.status.value = 'Request in flight…';
        const startedAt = new Date().toLocaleTimeString();
        setTimeout(() => {
            const finishedAt = new Date().toLocaleTimeString();
            this._data.loading.value = false;
            this._data.status.value = 'Finished — data cached locally.';
            this._data.log.value = [
                `Started at ${startedAt}`,
                `Completed at ${finishedAt}`,
                'Response cached in memory for this session.'
            ];
            this.refs.fetchBtn.removeAttribute('disabled');
        }, 650);
    },
    async loadAsyncChild() {
        if (this._data.childLoading.value) return;
        this._data.childLoading.value = true;
        this._data.childStatus.value = 'Importing module via importComponent...';
        const host = this.refs.asyncChildHost;
        host.innerHTML = '';
        try {
            const src = new URL('../components/AsyncComponent.js', import.meta.url).href;
            const comp = await importComponent(src);
            comp.appendTo(host);
            this._data.childLoaded.value = true;
            this._data.childStatus.value = 'Component mounted from async import.';
        } catch (err) {
            this._data.childStatus.value = 'Failed to import component. Check the console for details.';
        } finally {
            this._data.childLoading.value = false;
        }
    },    
};
