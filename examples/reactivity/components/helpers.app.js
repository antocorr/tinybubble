import { createComponent, registerHelper } from "../../../src/index.js";

// ── Register helpers once at app startup ─────────────────────────────────────

registerHelper('formatDateTime', (value) => {
    if (!value) return '—';
    return new Intl.DateTimeFormat('it-IT', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    }).format(new Date(value));
});

registerHelper('formatCurrency', (value, currency = 'EUR') => {
    if (value == null) return '—';
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency }).format(value);
});

// ── Single tournament card component ─────────────────────────────────────────

const TournamentCard = {
    props: ['tournament'],
    template() {
        /* html */
        return `
        <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div class="flex items-center justify-between mb-3">
                <h2 class="text-lg font-semibold">{{tournament.name}}</h2>
                <span class="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">{{tournament.game}}</span>
            </div>
            <dl class="space-y-1 text-sm text-gray-600">
                <div class="flex justify-between">
                    <dt>Registration closes</dt>
                    <dd class="font-medium text-gray-900">{{ $formatDateTime(tournament.joinClosesAt) }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt>Tournament starts</dt>
                    <dd class="font-medium text-gray-900">{{ $formatDateTime(tournament.startsAt) }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt>Prize pool</dt>
                    <dd class="font-medium text-gray-900">{{ $formatCurrency(tournament.prizePool) }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt>Entry fee</dt>
                    <dd class="font-medium text-gray-900">{{ $formatCurrency(tournament.entryFee) }}</dd>
                </div>
            </dl>
        </div>`;
    }
};

// ── Main app ──────────────────────────────────────────────────────────────────

const App = {
    components: { 'x-tournament-card': TournamentCard },

    template() {
        /* html */
        return `
        <div>
            <h1 class="text-2xl font-bold mb-1">Available tournaments</h1>
            <p class="text-sm text-gray-500 mb-6">
                Last updated: {{ $formatDateTime(lastUpdated) }}
            </p>
            <div class="space-y-4">
                <x-tournament-card
                    x-for="t in tournaments"
                    :tournament="t">
                </x-tournament-card>
            </div>
            <div class="mt-8 p-4 bg-gray-100 rounded-xl text-sm font-mono whitespace-pre">{{exportSummary}}</div>
            <button class="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm" @click="this.copyToClipboard()">
                Copy summary
            </button>
        </div>`;
    },

    data() {
        return {
            exportSummary: '',
            lastUpdated: new Date().toISOString(),
            tournaments: [
                {
                    name: 'Coppa Primavera',
                    game: 'FIFA 25',
                    joinClosesAt: '2026-06-01T18:00:00',
                    startsAt: '2026-06-05T15:00:00',
                    prizePool: 5000,
                    entryFee: 20,
                },
                {
                    name: 'Summer Clash',
                    game: 'Rocket League',
                    joinClosesAt: '2026-06-10T12:00:00',
                    startsAt: '2026-06-15T10:00:00',
                    prizePool: 12500,
                    entryFee: 50,
                },
                {
                    name: 'Open Cup #3',
                    game: 'Chess',
                    joinClosesAt: '2026-07-01T23:59:00',
                    startsAt: '2026-07-08T09:00:00',
                    prizePool: 0,
                    entryFee: 0,
                },
            ]
        };
    },

    // Helpers registered with registerHelper are also available inside methods
    // as this.$formatDateTime(...) and this.$formatCurrency(...)
    buildSummary() {
        return this.data.tournaments.value.map(t =>
            `${t.name} (${t.game})\n` +
            `  Registration closes: ${this.$formatDateTime(t.joinClosesAt)}\n` +
            `  Starts:              ${this.$formatDateTime(t.startsAt)}\n` +
            `  Prize pool:          ${this.$formatCurrency(t.prizePool)}\n`
        ).join('\n');
    },

    copyToClipboard() {
        const text = this.buildSummary();
        navigator.clipboard.writeText(text);
        this.data.exportSummary.value = text;
    },

    init() {
        this.data.exportSummary.value = this.buildSummary();
    }
};

const app = createComponent(App);
app.appendTo(document.getElementById('app'));