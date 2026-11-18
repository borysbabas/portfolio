<template>
  <header class="nav">
    <!-- Plain links: on the home page they scroll to the section, elsewhere they go home first -->
    <a :href="`${home}#top`" class="brand">Borys Babas</a>
    <div class="nav-right">
      <nav :aria-label="text.nav.label">
        <ul>
          <li><a :href="`${home}#work`">{{ text.nav.work }}</a></li>
          <li><a :href="`${home}#about`">{{ text.nav.about }}</a></li>
          <li><a :href="`${home}#contact`">{{ text.nav.contact }}</a></li>
        </ul>
      </nav>
      <!-- A full page load per language, so each one comes from its own cached page -->
      <div :aria-label="text.nav.language" class="lang" role="group">
        <a
          v-for="l in locales"
          :key="l.code"
          :aria-current="l.code === locale ? 'true' : undefined"
          :href="switchLocalePath(l.code)"
          :hreflang="l.language"
          :lang="l.language"
          :title="l.name"
        >{{ l.code.toUpperCase() }}</a>
      </div>
      <button
        id="theme"
        ref="themeBtn"
        :aria-label="themeLabel"
        class="theme-btn"
        type="button"
        @click="toggleTheme"
      >
        <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24" width="18">
          <circle cx="12" cy="12" r="8"></circle>
          <path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"></path>
        </svg>
      </button>
    </div>
    <span aria-hidden="true" class="progress"></span>
  </header>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, ref } from "vue";

const text = useText();
const { locale, locales } = useI18n();
const localePath = useLocalePath();
const switchLocalePath = useSwitchLocalePath();
const home = computed(() => localePath("/"));

const themeBtn = ref<HTMLButtonElement>();

// Theme switch: the new theme grows out of the button as a circle. color-mode stores the choice
// and mirrors it to <html data-theme>, which the stylesheet keys on.
const colorMode = useColorMode();
// The server cannot know the visitor's theme, so the label waits for hydration.
const hydrated = ref(false);
onMounted(() => (hydrated.value = true));
const themeLabel = computed(() =>
  hydrated.value && colorMode.value === "dark" ? text.value.nav.toLight : text.value.nav.toDark,
);

const toggleTheme = () => {
  const next = colorMode.value === "dark" ? "light" : "dark";
  const apply = () => {
    colorMode.preference = next;
    return nextTick();
  };
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduce || !themeBtn.value) {
    apply();
    return;
  }
  const r = themeBtn.value.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  document.startViewTransition(apply).ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
      { duration: 550, easing: "cubic-bezier(0.23, 1, 0.32, 1)", pseudoElement: "::view-transition-new(root)" },
    );
  });
};
</script>

<style scoped>
.lang { display: flex; }
.lang a {
  display: inline-flex; align-items: center; min-height: 44px; padding: 0 0.4rem;
  font-family: var(--mono); font-size: 0.75rem; letter-spacing: 0.04em; color: var(--muted); text-decoration: none;
}
.lang a:hover, .lang a[aria-current] { color: var(--ink); }
.lang a[aria-current] { text-decoration: underline; text-underline-offset: 0.35em; }
/* The home page's entrance fades the nav in; the language switch comes in with it */
@media (prefers-reduced-motion: no-preference) {
  :global(.js) .lang { opacity: 0; }
  :global(.ready) .lang { animation: fade 700ms var(--ease-out) both; animation-delay: 350ms; }
}
/* Phones: the brand gives way so links, languages and the theme switch fit on one line */
@media (max-width: 560px) {
  .brand { display: none; }
  .nav ul a { padding: 0 0.4rem; font-size: 0.875rem; }
}
</style>
