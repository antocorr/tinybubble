export default {
    name: 'NestedArrayPage',
    template() {
        /*html*/
        return `
    <section class="space-y-6">
      <header class="space-y-2">
        <p class="text-sm uppercase tracking-wide text-slate-500">Nested arrays</p>
        <h1 class="text-3xl font-semibold text-slate-900">Three-level rendering demo</h1>
        <p class="text-slate-700">
          Boards -> Lists -> Cards, all rendered with <code>x-for</code>. Each level is an array, so you can
          freely map, filter, or extend it just like in your favorite framework.
        </p>
      </header>

      <article class="p-4 border border-slate-200 rounded-xl bg-white shadow-sm space-y-3">
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <h2 class="text-xl font-semibold text-slate-900">Data shape</h2>
            <p class="text-sm text-slate-600">1) boards[], 2) lists[], 3) cards[].</p>
          </div>
          <div class="text-right text-sm text-slate-600">
            <div>Total boards: {{ boards.length }}</div>
            <div>Total lists: {{ getTotalLists() }}</div>
            <div>Total cards: {{ getTotalCards() }}</div>
          </div>
        </div>
        <ul class="list-disc pl-5 text-sm text-slate-700 space-y-1">
          <li>Three nested <code>x-for</code> loops walk through the arrays.</li>
          <li>Counts are calculated via small helper functions.</li>
          <li>All styling uses Tailwind utility classes.</li>
        </ul>
      </article>

      <section class="space-y-4">
        <div class="rounded-xl border border-slate-200 bg-white shadow-sm" x-for="board in boards">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-5 py-4 border-b border-slate-100">
            <div class="space-y-1">
              <p class="text-xs font-semibold uppercase tracking-wide text-emerald-700">Level 1 - Board</p>
              <h3 class="text-xl font-semibold text-slate-900">{{ board.title }}</h3>
              <p class="text-sm text-slate-700">{{ board.description }}</p>
            </div>
            <div class="text-sm text-slate-600 md:text-right">
              <div>Lists: {{ board.lists.length }}</div>
              <div>Cards: {{ getBoardCardCount(board) }}</div>
            </div>
          </div>

          <div class="px-5 py-4 space-y-4">
            <div class="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3" x-for="list in board.lists">
              <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-wide text-emerald-700">Level 2 - List</p>
                  <div class="text-base font-semibold text-slate-900">{{ list.title }}</div>
                  <p class="text-sm text-slate-700">{{ list.summary }}</p>
                </div>
                <div class="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full self-start">
                  {{ list.cards.length }} cards
                </div>
              </div>

              <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="p-3 rounded-lg border border-slate-200 bg-white shadow-sm" x-for="card in list.cards">
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <p class="text-xs uppercase tracking-wide text-slate-500">Level 3 - Card</p>
                      <div class="text-sm font-semibold text-slate-900">{{ card.title }}</div>
                      <p class="text-sm text-slate-700">{{ card.detail }}</p>
                    </div>
                    <span class="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">{{ card.owner }}</span>
                  </div>
                  <div class="mt-2 text-xs text-slate-500 flex items-center justify-between">
                    <span>Priority: {{ card.priority }}</span>
                    <span>ETA: {{ card.eta }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
    `;
    },
    data() {
        return {
            boards: [
                {
                    title: 'Product launch',
                    description: 'Tracks discovery, design, and execution tasks.',
                    lists: [
                        {
                            title: 'Discovery',
                            summary: 'User insights and market checks.',
                            cards: [
                                { title: 'Interview 5 early adopters', owner: 'Research', detail: 'Record notes in the shared doc.', eta: '2d', priority: 'High' },
                                { title: 'Competitive teardown', owner: 'PM', detail: 'Summarize three direct competitors.', eta: '1d', priority: 'Medium' },
                                { title: 'Define success metrics', owner: 'Data', detail: 'Propose activation and retention KPIs.', eta: '1d', priority: 'High' }
                            ]
                        },
                        {
                            title: 'Execution',
                            summary: 'Design and engineering delivery.',
                            cards: [
                                { title: 'UX flows draft', owner: 'Design', detail: 'Wireframe the new onboarding path.', eta: '3d', priority: 'High' },
                                { title: 'API contract', owner: 'Backend', detail: 'Agree on request/response shape.', eta: '2d', priority: 'Medium' },
                                { title: 'Beta feature flag', owner: 'Frontend', detail: 'Gate the experience for pilot users.', eta: '1d', priority: 'Low' }
                            ]
                        }
                    ]
                },
                {
                    title: 'Content calendar',
                    description: 'Keeps marketing assets in sync across channels.',
                    lists: [
                        {
                            title: 'Planning',
                            summary: 'Ideas to validate and prioritize.',
                            cards: [
                                { title: 'Landing page refresh', owner: 'Web', detail: 'Highlight the new pricing tiers.', eta: '4d', priority: 'Medium' },
                                { title: 'Churn email series', owner: 'Lifecycle', detail: '3-part sequence for reactivation.', eta: '3d', priority: 'High' }
                            ]
                        },
                        {
                            title: 'In progress',
                            summary: 'Assets currently in production.',
                            cards: [
                                { title: 'Q&A webinar deck', owner: 'Product Marketing', detail: 'Slides for the April webinar.', eta: '2d', priority: 'Medium' },
                                { title: 'Social cutdowns', owner: 'Video', detail: 'Short clips for LinkedIn and YouTube.', eta: '2d', priority: 'Low' },
                                { title: 'SEO blog post', owner: 'Content', detail: '2000-word guide on reactive UI patterns.', eta: '5d', priority: 'Medium' }
                            ]
                        }
                    ]
                }
            ]
        };
    },
    getTotalLists() {
        const boards = this._data.boards.value || [];
        return boards.reduce((sum, board) => sum + (board.lists?.length || 0), 0);
    },
    getBoardCardCount(board) {
        const lists = board?.lists || [];
        return lists.reduce((sum, list) => sum + (list.cards?.length || 0), 0);
    },
    getTotalCards() {
        const boards = this._data.boards.value || [];
        return boards.reduce((sum, board) => sum + this.getBoardCardCount(board), 0);
    }
};
