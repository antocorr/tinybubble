const examples = [
    {
        title: 'Basic Counter',
        description: 'The simplest possible component: a reactive counter with one signal and one method.',
        tags: ['signals', 'reactivity'],
        href: 'examples/reactivity/basic.html',
    },
    {
        title: 'Signals & Effects',
        description: 'Raw signals API — createSignal, effect, html() — without the component layer.',
        tags: ['signals', 'effects'],
        href: 'examples/reactivity/effect.html',
    },
    {
        title: 'Pizzeria App',
        description: 'Full-featured app with search, category filtering, and an inline editor. Shows props/emits, x-model, x-for, and async data loading.',
        tags: ['components', 'props', 'emits', 'x-model'],
        href: 'examples/reactivity/pizzeria.html',
    },
    {
        title: 'RGB Color Studio',
        description: 'A child ColorSlider component wired with :value and @input. The parent reads slider values to update a live color preview.',
        tags: ['components', ':value', '@input'],
        href: 'examples/reactivity/color-studio.html',
    },
    {
        title: 'Router Demo',
        description: 'Hash-mode router with dynamic params, nested routes, lazy-loaded async pages, and programmatic navigation.',
        tags: ['router', 'lazy-loading'],
        href: 'examples/router/index.html',
    },
    {
        title: 'Shoelace Components',
        description: 'TinyBubble paired with Shoelace web components for accessible UI elements.',
        tags: ['web components', 'shoelace'],
        href: 'examples/reactivity/shoelace.html',
    },
]

const tagColors = {
    signals:       'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800',
    reactivity:    'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800',
    effects:       'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800',
    components:    'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 border-brand-200 dark:border-brand-800',
    props:         'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 border-brand-200 dark:border-brand-800',
    emits:         'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 border-brand-200 dark:border-brand-800',
    'x-model':     'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 border-brand-200 dark:border-brand-800',
    ':value':      'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800',
    '@input':      'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800',
    router:        'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    'lazy-loading':'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    'web components':'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    shoelace:      'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
}

function tagClass(tag) {
    return tagColors[tag] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
}

export default {
    name: 'ExamplesPage',

    template() {
        return /*html*/`
        <div>
            <div class="mb-10">
                <h1 class="text-3xl font-bold mb-2">Examples</h1>
                <p class="text-gray-600 dark:text-gray-400">
                    Live demos you can open and inspect. Each example has a
                    <code class="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono">&lt;&nbsp;/&nbsp;&gt;</code>
                    button to browse its source files.
                </p>
            </div>

            <div class="grid sm:grid-cols-2 gap-5" id="examples-grid"></div>
        </div>
        `
    },

    init() {
        const grid = this.$element.querySelector('#examples-grid')

        for (const ex of examples) {
            const card = document.createElement('a')
            card.href = ex.href
            card.target = '_blank'
            card.rel = 'noopener'
            card.className = [
                'group block rounded-xl border border-gray-200 dark:border-gray-800',
                'bg-white dark:bg-gray-900 p-5',
                'hover:border-brand-400 dark:hover:border-brand-600',
                'hover:shadow-md hover:shadow-brand-500/5',
                'transition-all duration-150 no-underline',
            ].join(' ')

            const tags = ex.tags.map(t =>
                `<span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${tagClass(t)}">${t}</span>`
            ).join('')

            card.innerHTML = `
                <div class="flex items-start justify-between gap-3 mb-2">
                    <h3 class="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        ${ex.title}
                    </h3>
                    <span class="text-gray-400 dark:text-gray-600 group-hover:text-brand-500 transition-colors text-sm flex-shrink-0 mt-0.5">
                        Open →
                    </span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">${ex.description}</p>
                <div class="flex flex-wrap gap-1.5">${tags}</div>
            `
            grid.appendChild(card)
        }
    },
}
