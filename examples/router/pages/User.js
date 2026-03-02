export default {
    name: 'UserPage',
    template() {
        return `
            <div class="p-6">
                <h1 class="text-2xl font-bold mb-4">User Profile</h1>
                <div class="bg-white p-4 rounded shadow border border-slate-200">
                    <p>User ID from Script: <span class="font-mono bg-slate-100 px-2 rounded">{{ scriptId }}</span></p>
                </div>
                <div class="mt-4">
                    <p class="text-sm text-slate-500">Try changing the URL ID!</p>
                </div>
            </div>
        `;
    },
    data() {
        return {
            scriptId: ''
        }
    },
    init() {
        // Dimostra l'accesso tramite this.$route nel codice
        this.data.scriptId.value = this.$route.params.id;
    }
}
