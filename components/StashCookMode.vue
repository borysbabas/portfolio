<template>
  <div :aria-label="`Cooking ${title}`" aria-modal="true" class="cook" role="dialog">
    <div class="cook-top">
      <p class="mono">Step {{ index + 1 }} of {{ steps.length }}</p>
      <div class="cook-tools">
        <button v-if="ingredients.length" :aria-expanded="String(showIngredients)" class="cook-quiet" type="button" @click="showIngredients = !showIngredients">
          {{ showIngredients ? "Back to the step" : "Ingredients" }}
        </button>
        <button aria-label="Stop cooking" class="cook-quiet" type="button" @click="emit('close')">Close</button>
      </div>
      <span aria-hidden="true" class="cook-progress" :style="{ transform: `scaleX(${(index + 1) / steps.length})` }"></span>
    </div>

    <div class="cook-body" @pointerdown="swipeStart" @pointerup="swipeEnd">
      <div v-if="showIngredients" class="cook-ingredients">
        <div v-for="section in ingredients" :key="section.title">
          <h2>{{ section.title }}</h2>
          <ul>
            <li v-for="(entry, i) in section.items" :key="i" :class="{ group: entry.endsWith(':') }">{{ entry }}</li>
          </ul>
        </div>
      </div>
      <Transition v-else mode="out-in" name="cook-step">
        <div :key="index" class="cook-step">
          <p v-if="steps[index]!.section" class="mono">{{ steps[index]!.section }}</p>
          <span aria-hidden="true" class="cook-n">{{ String(index + 1).padStart(2, "0") }}</span>
          <p aria-live="polite" class="cook-text">{{ steps[index]!.text }}</p>
        </div>
      </Transition>
    </div>

    <div class="cook-nav">
      <button :disabled="index === 0" class="cook-quiet" type="button" @click="go(-1)">Back</button>
      <p class="mono">{{ awake ? "Screen stays on" : "" }}</p>
      <button ref="nextBtn" class="cook-next" type="button" @click="index === steps.length - 1 ? emit('close') : go(1)">
        {{ index === steps.length - 1 ? "Done" : "Next step" }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps<{
  title: string;
  steps: { section: string; text: string }[];
  ingredients: { title: string; items: string[] }[];
}>();
const emit = defineEmits<{ close: [] }>();

const index = ref(0);
const showIngredients = ref(false);
const awake = ref(false);
const nextBtn = ref<HTMLButtonElement>();

const go = (by: number) => {
  showIngredients.value = false;
  index.value = Math.min(props.steps.length - 1, Math.max(0, index.value + by));
};

const onKey = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    e.preventDefault();
    if (showIngredients.value) showIngredients.value = false;
    else emit("close");
  } else if (e.key === "ArrowRight" || e.key === "PageDown") {
    e.preventDefault();
    go(1);
  } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
    e.preventDefault();
    go(-1);
  }
};

// A horizontal swipe of 60px or more turns the page; anything shorter is a tap or a scroll
let startX = 0;
let startY = 0;
const swipeStart = (e: PointerEvent) => {
  startX = e.clientX;
  startY = e.clientY;
};
const swipeEnd = (e: PointerEvent) => {
  const dx = e.clientX - startX;
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(e.clientY - startY) * 1.5) go(dx < 0 ? 1 : -1);
};

// Keep the screen on while cooking. The browser drops the lock whenever the tab is hidden, so take it again on return.
let lock: WakeLockSentinel | null = null;
const holdScreen = async () => {
  if (!("wakeLock" in navigator) || document.visibilityState !== "visible") return;
  try {
    lock = await navigator.wakeLock.request("screen");
    awake.value = true;
    lock.addEventListener("release", () => (awake.value = false));
  } catch {
    // Refused, for example on low battery: cooking mode still works, the screen just may dim
    awake.value = false;
  }
};
const onVisibility = () => {
  if (document.visibilityState === "visible") holdScreen();
};

let returnFocus: HTMLElement | null = null;
onMounted(() => {
  returnFocus = document.activeElement as HTMLElement | null;
  document.documentElement.style.overflow = "hidden";
  document.addEventListener("visibilitychange", onVisibility);
  // On the window, not the dialog: a tap on the text moves focus to the page body, and the keys should still work
  window.addEventListener("keydown", onKey);
  holdScreen();
  nextBtn.value?.focus();
});
onBeforeUnmount(() => {
  document.documentElement.style.overflow = "";
  document.removeEventListener("visibilitychange", onVisibility);
  window.removeEventListener("keydown", onKey);
  lock?.release().catch(() => {});
  returnFocus?.focus();
});
</script>

<style scoped>
.cook {
  position: fixed; inset: 0; z-index: 30; display: grid; grid-template-rows: auto minmax(0, 1fr) auto;
  background: var(--paper); color: var(--ink);
}
.cook .mono { margin: 0; }
.cook-top { position: relative; display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 1rem clamp(1.25rem, 4vw, 3rem); border-bottom: 1px solid var(--line); }
.cook-tools { display: flex; gap: 0.25rem; }
.cook-progress { position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: var(--ink); transform-origin: 0 50%; transition: transform 300ms var(--ease-out); }
.cook-body { overflow-y: auto; padding: clamp(1.5rem, 6vh, 4rem) clamp(1.25rem, 6vw, 6rem); touch-action: pan-y; }
.cook-step { max-width: 46rem; margin: 0 auto; display: grid; gap: 1rem; }
.cook-n { font-family: var(--display); font-weight: 650; font-size: clamp(3rem, 10vw, 6rem); line-height: 0.9; letter-spacing: -0.04em; color: var(--muted); }
.cook-text { margin: 0; font-size: clamp(1.4rem, 3.4vw, 2.2rem); line-height: 1.45; letter-spacing: -0.01em; text-wrap: pretty; }
.cook-ingredients { max-width: 40rem; margin: 0 auto; }
.cook-ingredients h2 { margin: 0 0 0.75rem; font-family: var(--display); font-weight: 650; font-size: 1.6rem; }
.cook-ingredients ul { list-style: none; margin: 0 0 1.5rem; padding: 0; }
.cook-ingredients li { padding: 0.55rem 0; border-bottom: 1px solid var(--line); font-size: 1.15rem; }
.cook-ingredients li.group { border-bottom: 0; padding-top: 1rem; font-family: var(--mono); font-size: 0.8rem; color: var(--muted); text-transform: uppercase; }
.cook-nav { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 1rem clamp(1.25rem, 4vw, 3rem) max(1rem, env(safe-area-inset-bottom)); border-top: 1px solid var(--line); }
.cook-quiet { min-height: 48px; padding: 0 1rem; border: 0; border-radius: 999px; background: none; color: var(--muted); font: inherit; cursor: pointer; }
.cook-quiet:hover:not(:disabled) { color: var(--ink); }
.cook-quiet:disabled { opacity: 0.35; cursor: default; }
.cook-next { min-height: 56px; padding: 0 1.75rem; border: 0; border-radius: 999px; background: var(--ink); color: var(--paper); font: 500 1rem var(--body); cursor: pointer; }
.cook button:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }

@media (prefers-reduced-motion: no-preference) {
  .cook-step-enter-active, .cook-step-leave-active { transition: opacity 160ms ease, transform 200ms var(--ease-out); }
  .cook-step-enter-from { opacity: 0; transform: translateY(10px); }
  .cook-step-leave-to { opacity: 0; transform: translateY(-6px); }
}
</style>
