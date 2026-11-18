<template>
  <header class="nav">
    <!-- Plain links: on the home page they scroll to the section, elsewhere they go home first -->
    <a class="brand" href="/#top">Borys Babas</a>
    <div class="nav-right">
      <nav aria-label="Main">
        <ul>
          <li><a href="/#work">Work</a></li>
          <li><a href="/#about">About</a></li>
          <li><a href="/#contact">Contact</a></li>
        </ul>
      </nav>
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

const themeBtn = ref<HTMLButtonElement>();

// Theme switch: the new theme grows out of the button as a circle. color-mode stores the choice
// and mirrors it to <html data-theme>, which the stylesheet keys on.
const colorMode = useColorMode();
// The server cannot know the visitor's theme, so the label waits for hydration.
const hydrated = ref(false);
onMounted(() => (hydrated.value = true));
const themeLabel = computed(() =>
  hydrated.value && colorMode.value === "dark" ? "Switch to light mode" : "Switch to dark mode",
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
