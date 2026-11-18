<template>
  <div ref="cursorEl" aria-hidden="true" class="cursor">
    <span class="fill"></span><span class="c tl"></span><span class="c tr"></span><span class="c bl"></span><span class="c br"></span>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

// Pointer: a dot that snaps onto links and buttons as four corner brackets, pulled slightly
// toward the mouse. Fine pointers without reduced motion only; everyone else keeps the system pointer.
const TARGETS = "a[href], button";

const cursorEl = ref<HTMLElement>();
let stop = () => {};

onMounted(() => {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || reduce) return;

  const cur = cursorEl.value!;
  const root = document.documentElement;
  const listeners = new AbortController();
  const signal = listeners.signal;
  let alive = true;
  let mx = -9999;
  let my = -9999;
  let first = true;
  let active: Element | null = null;
  // Over elements that show their own pointer (the "View project" pill, the list preview)
  let hidden = false;
  const S = { x: 0, y: 0, w: 12, h: 12 };
  let last = performance.now();
  const ease = (from: number, to: number, rate: number, dt: number) => from + (to - from) * (1 - Math.pow(1 - rate, dt));

  root.classList.add("has-cursor");
  window.addEventListener("pointermove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (first) {
      S.x = mx;
      S.y = my;
      first = false;
    }
    cur.classList.add("live");
  }, { passive: true, signal });
  document.addEventListener("pointerover", (e) => {
    const el = e.target as Element;
    hidden = !!el.closest?.("[data-hide-cursor]");
    active = hidden ? null : (el.closest?.(TARGETS) ?? null);
    cur.classList.toggle("on", !!active);
  }, { signal });
  document.addEventListener("pointerleave", () => {
    cur.classList.remove("live");
    active = null;
  }, { signal });

  // Springs for position and size, so the pointer can be redirected mid-flight
  const loop = (now: number) => {
    if (!alive) return;
    const dt = Math.min(4, (now - last) / 16.667);
    last = now;
    let tx = mx;
    let ty = my;
    let tw = 12;
    let th = 12;
    if (active?.isConnected) {
      const r = active.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      tx = cx + (mx - cx) * 0.12;
      ty = cy + (my - cy) * 0.12;
      tw = r.width + 16;
      th = r.height + 12;
    }
    S.x = ease(S.x, tx, 0.38, dt);
    S.y = ease(S.y, ty, 0.38, dt);
    S.w = ease(S.w, tw, 0.26, dt);
    S.h = ease(S.h, th, 0.26, dt);
    cur.style.width = `${S.w.toFixed(1)}px`;
    cur.style.height = `${S.h.toFixed(1)}px`;
    cur.style.transform = `translate3d(${(S.x - S.w / 2).toFixed(1)}px,${(S.y - S.h / 2).toFixed(1)}px,0)`;
    cur.classList.toggle("hide", hidden);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  stop = () => {
    alive = false;
    listeners.abort();
    root.classList.remove("has-cursor");
  };
});

onBeforeUnmount(() => stop());
</script>
