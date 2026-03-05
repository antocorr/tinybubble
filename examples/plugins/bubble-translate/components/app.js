import { createComponent } from "../../../../src/index.js";
import { createTranslate } from "../../../../plugins/bubble-translate/bubble.js";

const t = createTranslate({
    defaultLang: "en_EN",
    storageKey: "bakery.lang",
    url: (lang) => `./localization/${lang}.json`,
});

await t.setLang(t.lang);

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeading = {
    name: "SectionHeading",
    props: ["kicker", "title", "subtitle", "center"],
    template() {
        return `
        <div :class="'max-w-3xl ' + (center ? 'mx-auto text-center' : '')">
            <p class="tracking-[0.22em] uppercase text-[11px] text-[color:var(--accent)]" x-if="kicker">{{ kicker }}</p>
            <h2 class="font-serif text-3xl md:text-4xl text-[color:var(--accent2)] mt-2">{{ title }}</h2>
            <p class="text-sm md:text-base text-[color:var(--muted)] mt-3 leading-relaxed" x-if="subtitle">{{ subtitle }}</p>
        </div>
        `;
    },
};

const IconCard = {
    name: "IconCard",
    props: ["icon", "title", "subtitle", "body", "tone"],
    template() {
        return `
        <article class="soft-card p-6 md:p-7">
            <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-full grid place-items-center text-xl" :style="'background:' + (tone || 'rgba(155,94,39,0.10)')">
                    <span aria-hidden="true">{{ icon }}</span>
                </div>
                <div class="min-w-0">
                    <h3 class="font-serif text-xl text-[color:var(--accent2)] leading-snug">{{ title }}</h3>
                    <p class="text-xs tracking-[0.18em] uppercase text-[color:var(--accent)] mt-1" x-if="subtitle">{{ subtitle }}</p>
                </div>
            </div>
            <p class="mt-4 text-sm text-[color:var(--muted)] leading-relaxed">{{ body }}</p>
        </article>
        `;
    },
};

const ImageTile = {
    name: "ImageTile",
    props: ["image", "label"],
    template() {
        return `
        <div class="relative overflow-hidden rounded-2xl min-h-[260px] ring-soft">
            <div class="absolute inset-0" :style="'background-image:url(' + image + '); background-size:cover; background-position:center'">
                <div class="absolute inset-0 bg-black/25"></div>
            </div>
            <div class="relative p-6 min-h-[260px] flex items-center">
                <span class="inline-flex items-center rounded-full px-4 py-2 text-[11px] tracking-[0.22em] uppercase bg-white/10 text-white border border-white/20 backdrop-blur">
                    {{ label }}
                </span>
            </div>
        </div>
        `;
    },
};

// ─── Main page ────────────────────────────────────────────────────────────────

const LandingPage = {
    name: "BakeryLanding",
    components: {
        "section-heading": SectionHeading,
        "icon-card": IconCard,
        "image-tile": ImageTile,
    },
    data() {
        return {
            languageMenuOpen: false,
            currentLang: t.lang,
            mobileOpen: false,
            topLinks: [
                { label: "Login", href: "#" },
                { label: "Sign in", href: "#" },
            ],
            navLinks: [
                { label: "Home", href: "#home" },
                { label: "Products", href: "#products" },
                { label: "Quality", href: "#quality" },
                { label: "Careers", href: "#careers" },
                { label: "Contact Us", href: "#contact" },
                { label: "Order Online", href: "#order" },
            ],
            hero: {
                title: "Whoever Said Money Can't Buy Happiness Never Shopped In A Bakery",
                subtitle: "Breads, pastries, cakes and little daily delights. Made with love, served warm.",
                image: "https://images.unsplash.com/photo-1509440159598-0249088772ff?auto=format&fit=crop&w=2200&q=80",
                cta1: "Shop Now",
                cta2: "Get Franchise",
            },
            expertise: {
                kicker: "Our Expertise",
                subtitle: "At our bakery, we take pride in our exceptional expertise and craftsmanship when it comes to creating delectable baked goods.",
            },
            expertiseItems: [
                { icon: "🍰", tone: "rgba(155,94,39,0.10)", title: "Special Occasions Cakes", subtitle: "Creations For Celebrations!", body: "From birthdays to anniversaries, custom cakes crafted with premium ingredients and meticulous detail." },
                { icon: "🥐", tone: "rgba(158,117,79,0.14)", title: "Cakes & Pastries", subtitle: "Creations For Celebrations!", body: "A daily rotation of croissants, tarts and sweet bites, fresh from the oven and ready to share." },
                { icon: "☕️", tone: "rgba(42,32,30,0.08)", title: "Hospitality Delights", subtitle: "Enjoy Memorable Celebrations", body: "Warm service, cozy spaces, and dessert tables designed to make your moments unforgettable." },
            ],
            services: {
                kicker: "Our Products & Services",
                subtitle: "Our skilled bakers create fresh, mouthwatering pastries, indulgent cakes, and more, using only the finest ingredients.",
            },
            servicesItems: [
                { icon: "🍞", tone: "rgba(155,94,39,0.10)", title: "Breads", body: "Artisan loaves with crisp crusts and soft centers, crafted with time, patience, and tradition." },
                { icon: "🍩", tone: "rgba(158,117,79,0.14)", title: "Donuts", body: "Fluffy, glazed, filled, or fried — a delightful array of perfectly blended sweetness." },
                { icon: "🎂", tone: "rgba(42,32,30,0.08)", title: "Cakes", body: "Classic and custom cakes baked with love and care to satisfy your sweetest cravings." },
                { icon: "🎉", tone: "rgba(155,94,39,0.10)", title: "Special Cakes", body: "Made-to-order celebration cakes for weddings, birthdays, and every big moment." },
                { icon: "🏷️", tone: "rgba(158,117,79,0.14)", title: "Monthly Offers", body: "Seasonal specials, bundles, and rotating flavors — check back for new surprises." },
                { icon: "🧑‍🍳", tone: "rgba(42,32,30,0.08)", title: "Chef Tasting", body: "Meet the chef and taste our best: curated assortments, stories, and pairings." },
            ],
            featureBlocks: [
                { title: "Simply Made", body: "We take pride in crafting artisan baked goods using only the finest ingredients, keeping things simple yet delicious, from our signature breads to delectable pastries and cookies.", button: "Check All Products", label: "Bakery", image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=1600&q=80", reverse: false },
                { title: "Tasty Ingredients", body: "We believe that the key to creating delicious treats lies in using only the finest and freshest ingredients, sourced with quality in mind.", button: "Check All Products", label: "Sweets", image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1600&q=80", reverse: true },
                { title: "Our Special Recipe", body: "A harmonious blend of premium ingredients and time-honored techniques — for extraordinary flavors, textures, and presentation.", button: "Check All Products", label: "Pastries", image: "https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=1600&q=80", reverse: false },
            ],
            nutrition: { kicker: "Nutrition Facts", button: "View All" },
            nutritionItems: [
                { title: "Wheat Flour Nutrients", image: "https://images.unsplash.com/photo-1525470713135-7bf5a360f265?auto=format&fit=crop&w=1400&q=80", cta: "View Details" },
                { title: "Rice Flour Nutrients", image: "https://images.unsplash.com/photo-1564759077036-3def242c6d5f?auto=format&fit=crop&w=1400&q=80", cta: "View Details" },
                { title: "Butter Bakery Nutrients", image: "https://images.unsplash.com/photo-1509440159598-0249088772ff?auto=format&fit=crop&w=1400&q=80", cta: "View Details" },
            ],
            story: {
                title: "Our Story",
                body1: "Discover a bakery like no other, where each bite is a little piece of heaven, our story is a blend of passion, tradition, and love for baking.",
                body2: "Our bakery begins with flour and ends with smiles. Every treat is made with love — warm aromas, slow proofing, and crisp flaky layers.",
            },
            mostViewed: { title: "Most Viewed Items" },
            mostViewedItems: [
                { title: "Brown Bread", image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=1600&q=80" },
                { title: "Tea Time Cakes", image: "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=1600&q=80" },
                { title: "Sandwiches", image: "https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=1600&q=80" },
            ],
            newsletter: {
                title: "Sign Up To Our News Letter",
                body: "Sign up to hear our latest events, discover new recipes, offers and more.",
                button: "Sign Up To Our News Letter",
                image: "https://images.unsplash.com/photo-1548940740-204726a19be3?auto=format&fit=crop&w=1600&q=80",
            },
            showNutritionModal: false,
        };
    },

    toggleLanguageMenu() {
        this.data.languageMenuOpen.value = !this.data.languageMenuOpen.value;
    },
    languageOptionClass(lang) {
        return this.data.currentLang.value === lang
            ? "gl-lang-opt gl-lang-opt--active"
            : "gl-lang-opt";
    },
    async onLanguageMenuPick(lang) {
        await t.setLang(lang);
        this.data.currentLang.value = t.lang;
        this.data.languageMenuOpen.value = false;
    },
    toggleMobile() {
        this.data.mobileOpen.value = !this.data.mobileOpen.value;
    },
    openNutritionModal() {
        this.data.showNutritionModal.value = true;
    },
    closeNutritionModal() {
        this.data.showNutritionModal.value = false;
    },

    template() {
        /*html*/
        return `
        <div class="min-h-screen bg-[color:var(--cream)]">

            <!-- Header -->
            <header class="bg-white/70 backdrop-blur border-b border-[color:var(--line)] sticky top-0 z-50">
                <div class="max-w-6xl mx-auto px-4">
                    <div class="h-12 flex items-center justify-between">

                        <div class="flex items-center gap-3 mt-12">
                            <div class="leading-tight">
                                <div class="text-[11px] tracking-[0.2em] uppercase text-[color:var(--muted)]">The Italian</div>
                                <div class="font-serif text-xl text-[color:var(--ink)]">Bakers</div>
                            </div>
                        </div>

                        <div class="hidden md:flex items-center gap-4 text-xs text-[color:var(--muted)]">
                            <template x-for="l in topLinks">
                                <a :href="l.href" class="hover:text-[color:var(--ink)] transition">{{ t(l.label) }}</a>
                            </template>

                            <span class="thin-line w-6"></span>

                            <!-- Language picker -->
                            <div class="relative">
                                <button
                                    class="gl-icon-btn"
                                    type="button"
                                    aria-haspopup="menu"
                                    :aria-expanded="languageMenuOpen ? 'true' : 'false'"
                                    aria-label="Language"
                                    @click="toggleLanguageMenu">
                                    <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                        <circle cx="12" cy="12" r="9"></circle>
                                        <path d="M3 12h18"></path>
                                        <path d="M12 3a15 15 0 0 1 0 18"></path>
                                        <path d="M12 3a15 15 0 0 0 0 18"></path>
                                    </svg>
                                </button>
                                <div class="gl-lang-menu" role="menu" x-show="languageMenuOpen">
                                    <button :class="languageOptionClass('en_EN')" role="menuitem" type="button" @click="onLanguageMenuPick('en_EN')">{{ t("English") }}</button>
                                    <button :class="languageOptionClass('it_IT')" role="menuitem" type="button" @click="onLanguageMenuPick('it_IT')">{{ t("Italian") }}</button>
                                    <button :class="languageOptionClass('es_ES')" role="menuitem" type="button" @click="onLanguageMenuPick('es_ES')">{{ t("Spanish") }}</button>
                                </div>
                            </div>

                            <span class="thin-line w-6"></span>

                            <a href="#" class="inline-flex items-center gap-2 hover:text-[color:var(--ink)] transition">
                                <span>{{ t('Cart') }}</span>
                                <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[rgba(155,94,39,0.10)] text-[color:var(--accent)]">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M7 7H21L19 15H8L7 7Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
                                        <path d="M7 7L6.4 4.7C6.2 3.9 5.5 3.4 4.7 3.4H3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                                        <path d="M9 20.2C9.9 20.2 10.6 19.5 10.6 18.6C10.6 17.7 9.9 17 9 17C8.1 17 7.4 17.7 7.4 18.6C7.4 19.5 8.1 20.2 9 20.2Z" fill="currentColor" />
                                        <path d="M18 20.2C18.9 20.2 19.6 19.5 19.6 18.6C19.6 17.7 18.9 17 18 17C17.1 17 16.4 17.7 16.4 18.6C16.4 19.5 17.1 20.2 18 20.2Z" fill="currentColor" />
                                    </svg>
                                </span>
                            </a>
                        </div>

                        <button class="md:hidden btn btn-outline !px-3 !py-2" @click="toggleMobile" aria-label="Open menu">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M4 7H20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                                <path d="M4 12H20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                                <path d="M4 17H20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                            </svg>
                        </button>
                    </div>

                    <nav class="hidden md:flex items-center justify-center gap-7 h-11 text-sm">
                        <template x-for="n in navLinks">
                            <a :href="n.href" class="text-[color:var(--muted)] hover:text-[color:var(--ink)] transition">{{ t(n.label) }}</a>
                        </template>
                    </nav>

                    <div class="md:hidden" x-show="mobileOpen">
                        <div class="pb-4">
                            <div class="thin-line my-2"></div>
                            <div class="grid gap-2">
                                <template x-for="n in navLinks">
                                    <a :href="n.href" @click="this.data.mobileOpen.value = false" class="px-2 py-2 rounded-lg hover:bg-black/5 text-[color:var(--muted)] hover:text-[color:var(--ink)] transition">{{ t(n.label) }}</a>
                                </template>
                            </div>
                            <div class="thin-line my-3"></div>
                            <div class="flex items-center gap-4 text-xs text-[color:var(--muted)]">
                                <template x-for="l in topLinks">
                                    <a :href="l.href" class="hover:text-[color:var(--ink)] transition">{{ t(l.label) }}</a>
                                </template>
                                <span class="ml-auto flex items-center gap-3">
                                    <button :class="languageOptionClass('en_EN')" type="button" @click="onLanguageMenuPick('en_EN')">EN</button>
                                    <button :class="languageOptionClass('it_IT')" type="button" @click="onLanguageMenuPick('it_IT')">IT</button>
                                    <button :class="languageOptionClass('es_ES')" type="button" @click="onLanguageMenuPick('es_ES')">ES</button>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Hero -->
            <section id="home" class="relative">
                <div class="absolute inset-0" :style="'background-image:url(' + hero.image + '); background-size:cover; background-position:center'">
                    <div class="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/35"></div>
                </div>
                <div class="relative max-w-6xl mx-auto px-4">
                    <div class="min-h-[520px] md:min-h-[560px] flex items-center">
                        <div class="max-w-2xl">
                            <h1 class="font-serif text-white text-4xl md:text-5xl leading-[1.08]">{{ t(hero.title) }}</h1>
                            <p class="mt-5 text-white/85 text-base md:text-lg leading-relaxed">{{ t(hero.subtitle) }}</p>
                            <div class="mt-8 flex flex-wrap items-center gap-3">
                                <a href="#products" class="btn btn-primary">
                                    <span>{{ t(hero.cta1) }}</span>
                                    <span aria-hidden="true">→</span>
                                </a>
                                <a href="#" class="btn btn-ghost">{{ t(hero.cta2) }}</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Expertise -->
            <section class="py-14 md:py-16">
                <div class="max-w-6xl mx-auto px-4">
                    <section-heading :kicker="t(expertise.kicker)" :title="t('Our Expertise')" :subtitle="t(expertise.subtitle)" center="true"></section-heading>
                    <div class="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <template x-for="it in expertiseItems">
                            <icon-card :icon="it.icon" :tone="it.tone" :title="t(it.title)" :subtitle="t(it.subtitle)" :body="t(it.body)"></icon-card>
                        </template>
                    </div>
                </div>
            </section>

            <!-- Products & Services -->
            <section id="products" class="py-14 md:py-16 bg-white/40 border-y border-[color:var(--line)]">
                <div class="max-w-6xl mx-auto px-4">
                    <section-heading :kicker="t(services.kicker)" :title="t('Our Products & Services')" :subtitle="t(services.subtitle)" center="true"></section-heading>
                    <div class="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <template x-for="it in servicesItems">
                            <icon-card :icon="it.icon" :tone="it.tone" :title="t(it.title)" :body="t(it.body)"></icon-card>
                        </template>
                    </div>
                </div>
            </section>

            <!-- Feature blocks -->
            <section id="quality" class="py-14 md:py-16">
                <div class="max-w-6xl mx-auto px-4 space-y-8">
                    <template x-for="block in featureBlocks">
                        <div class="grid grid-cols-1 md:grid-cols-2 md:gap-8 lg:gap-10 overflow-hidden rounded-2xl bg-white/35">
                            <div :class="(block.reverse ? 'md:order-2' : 'md:order-1')" class="p-4 sm:p-5 md:p-6 lg:p-8 h-full">
                                <image-tile :image="block.image" :label="t(block.label)"></image-tile>
                            </div>
                            <div :class="(block.reverse ? 'md:order-1' : 'md:order-2')" class="p-6 sm:p-8 md:p-10 lg:p-12 flex items-center">
                                <div class="max-w-xl">
                                    <h3 class="font-serif text-3xl text-[color:var(--accent2)]">{{ t(block.title) }}</h3>
                                    <p class="mt-4 text-[color:var(--muted)] leading-relaxed">{{ t(block.body) }}</p>
                                    <div class="mt-8">
                                        <a href="#" class="btn btn-outline">{{ t(block.button) }}</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </section>

            <!-- Nutrition facts -->
            <section class="py-14 md:py-16 bg-white/40 border-y border-[color:var(--line)]">
                <div class="max-w-6xl mx-auto px-4">
                    <div class="text-center">
                        <div class="font-serif text-3xl text-[color:var(--accent2)]">{{ t(nutrition.kicker) }}</div>
                        <div class="mt-4">
                            <button class="btn btn-outline" @click="openNutritionModal" type="button">{{ t(nutrition.button) }}</button>
                        </div>
                    </div>
                    <div class="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <template x-for="n in nutritionItems">
                            <article class="relative overflow-hidden rounded-2xl border border-[color:var(--line)] bg-white/20 min-h-[260px]">
                                <div class="absolute inset-0" :style="'background-image:url(' + n.image + '); background-size:cover; background-position:center'">
                                    <div class="absolute inset-0 bg-black/25"></div>
                                </div>
                                <div class="relative p-6 min-h-[260px] flex flex-col justify-between">
                                    <div class="text-white font-serif text-xl">{{ t(n.title) }}</div>
                                    <div><a href="#" class="btn btn-ghost">{{ t(n.cta) }}</a></div>
                                </div>
                            </article>
                        </template>
                    </div>
                </div>
            </section>

            <!-- Our Story -->
            <section id="careers" class="py-14 md:py-16">
                <div class="max-w-6xl mx-auto px-4">
                    <div class="text-center">
                        <div class="text-[color:var(--accent)]">❦</div>
                        <h2 class="font-serif text-4xl text-[color:var(--accent2)] mt-3">{{ t(story.title) }}</h2>
                        <div class="mt-6 max-w-3xl mx-auto text-[color:var(--muted)] leading-relaxed">
                            <p>{{ t(story.body1) }}</p>
                            <p class="mt-4">{{ t(story.body2) }}</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Most viewed -->
            <section class="py-14 md:py-16 bg-white/40 border-y border-[color:var(--line)]">
                <div class="max-w-6xl mx-auto px-4">
                    <h2 class="font-serif text-3xl text-[color:var(--accent2)] text-center">{{ t(mostViewed.title) }}</h2>
                    <div class="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <template x-for="m in mostViewedItems">
                            <article class="relative overflow-hidden rounded-2xl border border-[color:var(--line)] min-h-[220px]">
                                <div class="absolute inset-0" :style="'background-image:url(' + m.image + '); background-size:cover; background-position:center'">
                                    <div class="absolute inset-0 bg-gradient-to-t from-black/55 via-black/18 to-black/10"></div>
                                </div>
                                <div class="relative p-6 min-h-[220px] flex items-end">
                                    <div class="font-serif text-white text-xl">{{ t(m.title) }}</div>
                                </div>
                            </article>
                        </template>
                    </div>
                </div>
            </section>

            <!-- Newsletter -->
            <section id="contact" class="py-14 md:py-16">
                <div class="max-w-6xl mx-auto px-4">
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden rounded-2xl border border-[color:var(--line)]">
                        <div class="md:col-span-5 relative min-h-[260px]">
                            <div class="absolute inset-0" :style="'background-image:url(' + newsletter.image + '); background-size:cover; background-position:center'">
                                <div class="absolute inset-0 bg-black/10"></div>
                            </div>
                        </div>
                        <div class="md:col-span-7 bg-[#2a201e] text-white p-8 md:p-12 flex items-center">
                            <div class="max-w-xl">
                                <h3 class="font-serif text-3xl">{{ t(newsletter.title) }}</h3>
                                <p class="mt-4 text-white/80 leading-relaxed">{{ t(newsletter.body) }}</p>
                                <div class="mt-7 flex flex-col sm:flex-row gap-3">
                                    <input class="w-full sm:flex-1 rounded-full px-4 py-3 text-sm text-[color:var(--ink)] placeholder:text-[color:var(--muted)]" :placeholder="t('Your email address')" />
                                    <a href="#" class="btn btn-primary whitespace-nowrap">{{ t(newsletter.button) }}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Footer -->
            <footer id="order" class="py-10">
                <div class="max-w-6xl mx-auto px-4">
                    <div class="thin-line"></div>
                    <div class="pt-8 text-center">
                        <p class="font-serif text-2xl text-[color:var(--accent2)]">{{ t('Thank you for watching') }}</p>
                        <p class="mt-2 text-sm text-[color:var(--muted)]">© ${new Date().getFullYear()} The Italian Bakers — bubble-translate demo.</p>
                    </div>
                </div>
            </footer>

            <!-- Nutrition Modal -->
            <template x-if="showNutritionModal">
                <div class="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 py-8" @click.self="closeNutritionModal">
                    <div class="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-[color:var(--line)] overflow-hidden">
                        <div class="flex items-center justify-between px-6 py-4 border-b border-[color:var(--line)]">
                            <div class="font-serif text-2xl text-[color:var(--accent2)]">{{ t('Nutrition Facts') }}</div>
                            <button class="btn btn-outline !px-3 !py-2" type="button" @click="closeNutritionModal">{{ t('Close') }}</button>
                        </div>
                        <div class="max-h-[70vh] overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <template x-for="n in nutritionItems">
                                <article class="soft-card p-4 flex flex-col gap-3">
                                    <div class="relative h-32 rounded-xl overflow-hidden ring-soft">
                                        <div class="absolute inset-0" :style="'background-image:url(' + n.image + '); background-size:cover; background-position:center'"></div>
                                        <div class="absolute inset-0 bg-black/25"></div>
                                    </div>
                                    <div class="font-serif text-lg text-[color:var(--accent2)]">{{ t(n.title) }}</div>
                                    <div><a href="#" class="btn btn-outline w-full sm:w-auto">{{ t(n.cta) }}</a></div>
                                </article>
                            </template>
                        </div>
                    </div>
                </div>
            </template>

        </div>
        `;
    },
};

const app = createComponent(LandingPage);
app.appendTo(document.getElementById("app"));
