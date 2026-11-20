<template>
  <div>
    <div v-if="showLoader" ref="loaderEl" class="loader" aria-hidden="true">
      <div class="loader-top"><span class="mono">Borys Babas</span></div>
      <div ref="countEl" class="loader-count">000</div>
      <span ref="barEl" class="loader-bar"></span>
    </div>

    <SiteNav />

    <main id="top">
      <section aria-label="Introduction" class="hero wrap">
        <p class="mono">{{ t.heroTag }}</p>
        <h1 ref="nameEl" aria-label="Borys Babas" class="name">
          <span v-for="(line, li) in nameLines" :key="li" :class="`line l${li + 1}`" aria-hidden="true">
            <span v-for="ch in line" :key="ch.i" :style="{ '--i': ch.i }" class="ch"><span class="chi">{{ ch.c }}</span></span>
          </span>
        </h1>
        <div class="hero-foot">
          <p>
            <span class="sr-only">{{ heroLine }}</span>
            <template v-for="(w, i) in heroWords" :key="i"><span aria-hidden="true" class="hw"><span :style="{ '--wi': i }">{{ w }}</span></span>{{ i < heroWords.length - 1 ? " " : "" }}</template>
          </p>
        </div>
      </section>

      <section aria-label="Statement" class="statement wrap">
        <p ref="bigEl" class="big">
          <span class="sr-only">{{ statement }}</span>
          <template v-for="(w, i) in statementWords" :key="i"><span :style="{ '--wi': i }" aria-hidden="true" class="w"><em v-if="w.em">{{ w.em }}</em>{{ w.t }}</span>{{ i < statementWords.length - 1 ? " " : "" }}</template>
        </p>
      </section>

      <section id="work" aria-labelledby="work-h" class="wrap">
        <div class="section-head">
          <h2 id="work-h" data-reveal>{{ t.work.title }}</h2>
          <div :aria-label="t.work.showAs" class="seg" data-reveal role="group" style="--d: 1">
            <button
              v-for="v in views"
              :key="v"
              :aria-pressed="String(view === v)"
              type="button"
              @click="setView(v)"
            >
              {{ v === "stack" ? t.work.stack : t.work.list }}
            </button>
          </div>
        </div>
        <p v-if="!projects.length" class="empty">
          {{ t.work.emptyBefore }}
          <a href="https://github.com/borysbabas">GitHub</a>{{ t.work.emptyAfter }}
        </p>
        <ol id="list" :hidden="view !== 'list'" class="list">
          <li v-for="(p, i) in projects" :key="p.repo" :data-for="i" class="row" data-hide-cursor>
            <a :href="p.site || p.repo">
              <span class="n">{{ num(i) }}</span><span class="t">{{ p.title }}</span><span class="k">{{ t.work.kinds[p.kind] }}</span><span class="to">{{ t.work.dest[p.dest] }} <span aria-hidden="true">↗</span></span>
            </a>
          </li>
        </ol>
        <div id="stack" :hidden="view !== 'stack'" :style="{ timelineScope }" class="stack">
          <article
            v-for="(p, i) in projects"
            :key="p.repo"
            :class="['card', { 'text-only': !p.image }]"
            :style="cardStyle(i)"
          >
            <div class="card-text">
              <span class="num">{{ num(i) }} · {{ t.work.kinds[p.kind] }}</span>
              <h3>{{ p.title }}</h3>
              <p>{{ p.text }}</p>
              <div class="tags"><span v-for="t in p.tags" :key="t">{{ t }}</span></div>
              <div class="links-row">
                <a v-if="p.site" :href="p.site" class="more">{{ t.work.dest[p.dest] }} <span aria-hidden="true">↗</span></a>
                <a :href="p.repo" class="more">{{ t.work.dest.github }} <span aria-hidden="true">↗</span></a>
              </div>
            </div>
            <!-- Same destination as the links beside it, so it stays out of the tab order and the accessibility tree -->
            <a v-if="p.image" :href="p.site || p.repo" :data-dest="t.work.dest[p.dest]" aria-hidden="true" class="media" data-hide-cursor tabindex="-1">
              <img :src="p.image" alt="" decoding="async" loading="lazy" />
            </a>
          </article>
        </div>
      </section>

      <section aria-labelledby="strip-h" class="strip">
        <div class="strip-pin">
          <div class="strip-head section-head">
            <h2 id="strip-h" data-reveal>{{ t.stackTitle }}</h2>
          </div>
          <div class="track">
            <div v-for="(panel, i) in t.stack" :key="panel.title" :style="{ '--d': i + 1 }" class="panel" data-reveal>
              <span class="k">{{ num(i) }}</span>
              <div>
                <h3>{{ panel.title }}</h3>
                <p>{{ panel.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" aria-labelledby="about-h" class="about wrap">
        <div>
          <h2 id="about-h" data-reveal>{{ t.about.title }}</h2>
          <p data-reveal style="--d: 1">{{ t.about.intro }}</p>
          <h3 class="mono interests-h" data-reveal>{{ t.about.interestsTitle }}</h3>
          <ul class="interests">
            <li v-for="(item, i) in t.about.interests" :key="item.title" :style="{ '--d': i }" data-reveal>
              <h4>{{ item.title }}</h4>
              <p>{{ item.text }}</p>
            </li>
          </ul>
        </div>
        <div class="about-side">
          <figure class="portrait">
            <div class="ph">
              <img
                :alt="t.about.portraitAlt"
                height="1024"
                src="/img/about.jpg"
                width="768"
              />
            </div>
          </figure>
          <dl class="facts">
            <div v-for="(fact, i) in t.about.facts" :key="fact.label" :style="{ '--d': i }" data-reveal>
              <dt>{{ fact.label }}</dt>
              <dd>{{ fact.value }}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section :aria-label="t.historyLabel" class="history wrap">
        <div v-for="group in t.history" :key="group.title">
          <h2 data-reveal>{{ group.title }}</h2>
          <ol>
            <li v-for="(entry, i) in group.entries" :key="entry.title" :style="{ '--d': i }" data-reveal>
              <div class="top">
                <h3>{{ entry.title }}</h3>
                <span class="mono">{{ entry.period }}</span>
              </div>
              <p>{{ entry.text }}</p>
              <a v-if="entry.link" :href="entry.link.href">{{ entry.link.label }}</a>
            </li>
          </ol>
        </div>
      </section>
    </main>

    <div class="closing">
      <section id="contact" aria-labelledby="contact-h" class="contact wrap">
        <h2 id="contact-h" ref="contactEl" :aria-label="contactLine">
          <template v-for="(c, i) in contactLine" :key="i"><template v-if="c === ' '">{{ " " }}</template><span v-else aria-hidden="true" class="lt"><span class="lti">{{ c }}</span></span></template>
        </h2>
        <div class="reach">
          <div ref="emailRow" class="email-row" data-reveal>
            <button aria-describedby="copy-label" class="email-copy" type="button" @click="copyEmail">
              <span aria-hidden="true" class="email-sel"></span>
              <span ref="emailEl" class="email">info@borysbabas.dev</span>
            </button>
            <span aria-hidden="true" class="copy-hint mono">
              <span class="ic">
                <svg class="cp" fill="none" height="14" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24" width="14">
                  <rect height="11" rx="2" width="11" x="9" y="9"></rect>
                  <path d="M5 15V5a2 2 0 0 1 2-2h8"></path>
                </svg>
                <svg class="ok" fill="none" height="14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="14">
                  <path d="M5 12.5l4.5 4.5L19 7.5"></path>
                </svg>
              </span>
              <span ref="hintEl">{{ t.contact.copyHint }}</span>
            </span>
            <span id="copy-label" ref="liveEl" aria-live="polite" class="sr-only">{{ t.contact.copyLabel }}</span>
          </div>
          <ul class="links">
            <li data-reveal style="--d: 1"><a href="https://github.com/borysbabas">GitHub</a></li>
            <li data-reveal style="--d: 2"><a href="https://www.linkedin.com/in/borysbabas/">LinkedIn</a></li>
            <li data-reveal style="--d: 3"><a href="https://www.instagram.com/borysbabas/">Instagram</a></li>
            <li data-reveal style="--d: 4"><a download="Borys_CV.pdf" href="/assets/borys-cv.pdf">{{ t.contact.cv }}</a></li>
          </ul>
        </div>
      </section>

      <footer class="wrap">
        <!-- No reveal here: the footer sits inside the bottom margin the reveal observer ignores, so it would never show -->
        <span class="mono">© {{ year }} borysbabas<span class="dev-mark">.dev</span></span>
        <!-- Plain links: a full page load leaves this page's stylesheet behind -->
        <ul class="links">
          <li><a :href="localePath('/privacy')">{{ text.footer.privacy }}</a></li>
          <li><a :href="localePath('/terms')">{{ text.footer.terms }}</a></li>
        </ul>
      </footer>
    </div>

    <div ref="pillEl" aria-hidden="true" class="cursor-pill"><span class="in">{{ pillLabel }} <span aria-hidden="true">↗</span></span></div>
    <div ref="previewEl" aria-hidden="true" class="preview"><div ref="previewIn" class="in"></div></div>
    <SiteCursor />
    <SpeedInsights />
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { SpeedInsights } from "@vercel/speed-insights/vue";
import type { PublicRepo } from "~/server/api/github/repos.get";

definePageMeta({ layout: false });

const EMAIL = "info@borysbabas.dev";

// The stylesheet keys its entrance states on these classes, so they have to land before first paint.
// onMounted sets them again for client-side navigation, where this inline script does not run in time.
const HTML_CLASSES = `(function(){var d=document.documentElement,r=matchMedia("(prefers-reduced-motion: reduce)").matches;d.classList.add("js");if(!r){d.classList.add("loading");if("IntersectionObserver"in window)d.classList.add("rv")}})()`;

useHead({
  bodyAttrs: { class: "home" },
  script: [{ innerHTML: HTML_CLASSES, tagPosition: "bodyOpen" }],
});

// Server-side and cached by the endpoint, so the work section is in the first HTML
const { data: repos } = await useFetch<PublicRepo[]>("/api/github/repos", {
  key: "github-repos",
  default: () => [],
});

// The profile README, and this site itself
const HIDDEN_REPOS = new Set(["borysbabas", "portfolio"]);
const LABEL_TOPICS = new Set(["school-project", "client-website"]);

// Descriptions often open with the project name ("ROTK: a text adventure...") and close with
// "HvA school project.", which the card already shows as its title and its School label
const cleanDescription = (text: string) => {
  const s = text.replace(/^[^:.]{1,30}:\s*/, "").replace(/\s*HvA school project\.$/, "");
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const projects = computed(() =>
  (repos.value ?? [])
    .filter((r) => !HIDDEN_REPOS.has(r.name))
    .map((r) => ({
      // README titles carry the odd tagline or full stop ("DeKamer.", "Name, My Next-Gen ...")
      title: (r.readmeTitle || r.name).split(", ")[0]!.replace(/\.$/, ""),
      kind: (r.topics.includes("school-project") ? "School" : r.topics.includes("client-website") ? "Client" : "Personal") as
        | "School"
        | "Client"
        | "Personal",
      text: cleanDescription(r.description),
      tags: r.topics.filter((t) => !LABEL_TOPICS.has(t)).slice(0, 4),
      image: r.thumbnail,
      site: r.homepage || "",
      repo: r.html_url,
      // Where a click goes: a client's live site, a demo of my own or school work, or else the code
      dest: (r.homepage ? (r.topics.includes("client-website") ? "site" : "demo") : "github") as "site" | "demo" | "github",
    }))
    // Projects with a README image lead; sort is stable, so each group keeps GitHub's last-updated order
    .sort((a, b) => Number(!a.image) - Number(!b.image)),
);

let n = 0;
const nameLines = ["Borys", "Babas"].map((word) => Array.from(word, (c) => ({ c, i: n++ })));

// The site's text in the URL's language; content/site.ts holds all three
const text = useText();
const t = computed(() => text.value.home);
const localePath = useLocalePath();

const heroLine = computed(() => t.value.heroLine);
const heroWords = computed(() => heroLine.value.split(" "));

const statement = computed(() => t.value.statement);
// Dutch and Polish end the sentence on the name ("Kieskeurig.nl."), so punctuation after it stays outside the highlight
const HIGHLIGHT = "Kieskeurig.nl";
const statementWords = computed(() =>
  statement.value.split(" ").map((w) => (w.startsWith(HIGHLIGHT) ? { em: HIGHLIGHT, t: w.slice(HIGHLIGHT.length) } : { em: "", t: w })),
);

const contactLine = computed(() => t.value.contact.line);
const year = new Date().getFullYear();

const num = (i: number) => String(i + 1).padStart(2, "0");

// Each card sinks as the next one slides over it, so it runs on the next card's view timeline.
// The stack declares every name so the timelines resolve across siblings.
const timelineScope = computed(() =>
  projects.value.slice(1).map((_, i) => `--c${i + 2}`).join(", ") || "none",
);
const cardStyle = (i: number) => ({
  "--i": i,
  ...(i > 0 && { viewTimelineName: `--c${i + 1}` }),
  ...(i < projects.value.length - 1 ? { animationTimeline: `--c${i + 2}` } : { animationName: "none" }),
});

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const showLoader = ref(true);
const loaderEl = ref<HTMLElement>();
const countEl = ref<HTMLElement>();
const barEl = ref<HTMLElement>();
const nameEl = ref<HTMLElement>();
const bigEl = ref<HTMLElement>();
const contactEl = ref<HTMLElement>();
const emailRow = ref<HTMLElement>();
const emailEl = ref<HTMLElement>();
const hintEl = ref<HTMLElement>();
const liveEl = ref<HTMLElement>();
const pillEl = ref<HTMLElement>();
const previewEl = ref<HTMLElement>();
const previewIn = ref<HTMLElement>();
// The cursor pill over a project image says where that image links to
const pillLabel = ref("");

// Stack or list view for the work section
const views = ["stack", "list"] as const;
const view = ref<(typeof views)[number]>("stack");
const setView = (v: (typeof views)[number]) => {
  if (view.value === v) return;
  const apply = () => {
    view.value = v;
    return nextTick();
  };
  if (document.startViewTransition && !prefersReducedMotion()) document.startViewTransition(apply);
  else apply();
};

// Hover to select, click to copy: the whole address gets selected for real, so Ctrl+C works too
let copyTimer: ReturnType<typeof setTimeout> | undefined;
const copyEmail = () => {
  const email = emailEl.value!;
  const row = emailRow.value!;
  const hint = hintEl.value!;
  const live = liveEl.value!;
  try {
    const range = document.createRange();
    range.selectNodeContents(email);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  } catch {}
  const done = () => {
    row.classList.add("done");
    hint.textContent = t.value.contact.copied;
    live.textContent = t.value.contact.copyDone;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      row.classList.remove("done");
      hint.textContent = t.value.contact.copyHint;
      live.textContent = t.value.contact.copyLabel;
      const sel = window.getSelection();
      if (sel?.anchorNode && email.contains(sel.anchorNode)) sel.removeAllRanges();
    }, 2200);
  };
  const fail = () => {
    row.classList.add("done");
    hint.textContent = t.value.contact.copyFallback;
  };
  try {
    navigator.clipboard.writeText(EMAIL).then(done, fail);
  } catch {
    fail();
  }
};

// Everything below drives the DOM directly, as the design does; these stop it when the page goes.
let alive = true;
const cleanups: (() => void)[] = [];

onMounted(() => {
  const root = document.documentElement;
  const reduce = prefersReducedMotion();
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const listeners = new AbortController();
  const signal = listeners.signal;
  cleanups.push(() => listeners.abort());

  root.classList.add("js");
  if (!reduce) {
    root.classList.add("loading");
    if ("IntersectionObserver" in window) root.classList.add("rv");
  }

  const big = bigEl.value!;
  const name = nameEl.value!;

  // Offset each word's fill by its position in the line, so lines sweep left to right
  const sweep = () => {
    const box = big.getBoundingClientRect();
    big.querySelectorAll<HTMLElement>(".w").forEach((w) => {
      const s = 14 + ((w.getBoundingClientRect().left - box.left) / Math.max(1, box.width)) * 14;
      w.style.setProperty("animation-range-start", `cover ${s.toFixed(1)}%`);
      w.style.setProperty("animation-range-end", `cover ${(s + 9).toFixed(1)}%`);
    });
  };

  // Letters get bolder as the cursor comes close. Each letter sits in a box of fixed width,
  // measured once at rest, so heavier letters never push the line around.
  let px = -9999;
  let py = -9999;
  const weighties: { measure: () => void; kick: () => void }[] = [];
  const weighty = (
    scope: HTMLElement,
    letters: HTMLElement[],
    o: { base: number; max: number; wdth: number; squeeze: number; radius: number },
  ) => {
    let boxes: { w: number; cx: number; cy: number }[] = [];
    const cur = letters.map(() => 0);
    let running = false;
    const setW = (el: HTMLElement, k: number) => {
      (el.firstElementChild as HTMLElement).style.fontVariationSettings =
        `"opsz" 96, "wdth" ${(o.wdth - k * o.squeeze).toFixed(1)}, "wght" ${Math.round(o.base + k * (o.max - o.base))}`;
    };
    const measure = () => {
      letters.forEach((el, i) => {
        cur[i] = 0;
        setW(el, 0);
        el.style.width = "";
      });
      // offsetLeft/Top ignore transforms, so the entrance animation can't throw the positions off
      boxes = letters.map((el) => ({
        w: el.getBoundingClientRect().width,
        cx: el.offsetLeft + el.offsetWidth / 2,
        cy: el.offsetTop + el.offsetHeight / 2,
      }));
      letters.forEach((el, i) => (el.style.width = `${boxes[i]!.w}px`));
    };
    const frame = () => {
      if (!alive) return;
      const hb = scope.getBoundingClientRect();
      let moving = false;
      letters.forEach((el, i) => {
        const b = boxes[i]!;
        const d = Math.hypot(px - (hb.left + b.cx), py - (hb.top + b.cy));
        let k = Math.max(0, 1 - d / o.radius);
        k = k * k * (3 - 2 * k);
        cur[i]! += (k - cur[i]!) * 0.18;
        if (Math.abs(k - cur[i]!) > 0.002) moving = true;
        setW(el, cur[i]!);
      });
      if (moving) requestAnimationFrame(frame);
      else running = false;
    };
    weighties.push({
      measure,
      kick: () => {
        if (!running && boxes.length) {
          running = true;
          requestAnimationFrame(frame);
        }
      },
    });
  };

  if (fine && !reduce) {
    weighty(contactEl.value!, Array.from(contactEl.value!.querySelectorAll<HTMLElement>(".lt")), {
      base: 400, max: 800, wdth: 85, squeeze: 10, radius: 300,
    });
    name.querySelectorAll<HTMLElement>(".line").forEach((line) => {
      weighty(line, Array.from(line.querySelectorAll<HTMLElement>(".ch")), {
        base: 600, max: 800, wdth: 85, squeeze: 9, radius: 380,
      });
    });
    const kickAll = () => weighties.forEach((w) => w.kick());
    window.addEventListener("pointermove", (e) => { px = e.clientX; py = e.clientY; kickAll(); }, { passive: true, signal });
    document.addEventListener("pointerleave", () => { px = py = -9999; kickAll(); }, { signal });
  }

  const layout = () => {
    sweep();
    weighties.forEach((w) => w.measure());
  };
  layout();
  document.fonts?.ready.then(() => alive && layout());
  let resizeTimer: ReturnType<typeof setTimeout> | undefined;
  window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(layout, 150); }, { signal });
  cleanups.push(() => clearTimeout(resizeTimer));

  // The email decodes once when it scrolls into view
  const email = emailEl.value!;
  if (!reduce && "IntersectionObserver" in window) {
    const glyphs = "abcdefghijklmnopqrstuvwxyz0123456789@.";
    const io = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / 700);
        const fixed = Math.floor(p * EMAIL.length);
        let out = "";
        for (let i = 0; i < EMAIL.length; i++) {
          out += i < fixed || EMAIL[i] === "@" || EMAIL[i] === "." ? EMAIL[i] : glyphs[(Math.random() * glyphs.length) | 0];
        }
        email.textContent = out;
        if (p < 1 && alive) requestAnimationFrame(step);
        else email.textContent = EMAIL;
      };
      step(start);
    }, { threshold: 0.8 });
    io.observe(email);
    cleanups.push(() => io.disconnect());
  }

  // Preloader: count up with real progress (fonts, images, page load), then lift away and play the entrance
  const startReveals = () => {
    if (reduce || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
    io.observe(big);
    cleanups.push(() => io.disconnect());
  };
  const enter = () => {
    if (!alive) return;
    root.classList.remove("loading");
    root.classList.add("ready", "first");
    setTimeout(() => root.classList.remove("first"), 1200);
    setTimeout(() => name.classList.add("loaded"), 1500);
    startReveals();
  };
  if (reduce) {
    showLoader.value = false;
    root.classList.add("ready");
    name.classList.add("loaded");
  } else {
    const loader = loaderEl.value!;
    const count = countEl.value!;
    const bar = barEl.value!;
    let seen = false;
    try {
      seen = sessionStorage.getItem("bb-seen") === "1";
      sessionStorage.setItem("bb-seen", "1");
    } catch {}
    const tasks: Promise<unknown>[] = [];
    if (document.fonts?.ready) tasks.push(document.fonts.ready);
    // Lazy project images only load once scrolled to, so waiting on them would hold the loader to its time limit
    document.querySelectorAll<HTMLImageElement>('img:not([loading="lazy"])').forEach((img) => {
      tasks.push(
        img.complete
          ? Promise.resolve()
          : new Promise((res) => {
              img.addEventListener("load", res, { once: true });
              img.addEventListener("error", res, { once: true });
            }),
      );
    });
    tasks.push(
      new Promise((res) => {
        if (document.readyState === "complete") res(undefined);
        else window.addEventListener("load", res, { once: true });
      }),
    );
    let doneCount = 0;
    let shown = 0;
    let finished = false;
    const total = tasks.length;
    const t0 = performance.now();
    const minTime = seen ? 250 : 1300;
    const hardStop = 5000;
    tasks.forEach((p) => p.then(() => doneCount++));
    const finish = () => {
      if (finished || !alive) return;
      finished = true;
      count.textContent = "100";
      bar.style.transform = "scaleX(1)";
      loader.classList.add("leaving");
      setTimeout(enter, seen ? 150 : 280);
      loader.addEventListener("animationend", (e) => {
        if (e.target === loader) showLoader.value = false;
      });
    };
    const tick = (now: number) => {
      if (finished || !alive) return;
      const elapsed = now - t0;
      let target = Math.min(doneCount / total, Math.min(1, elapsed / minTime)) * 100;
      if (elapsed > hardStop) target = 100;
      shown += (target - shown) * 0.12;
      if (target - shown < 0.6) shown = target;
      count.textContent = `00${Math.floor(shown)}`.slice(-3);
      bar.style.transform = `scaleX(${(shown / 100).toFixed(3)})`;
      if (shown >= 100) {
        setTimeout(finish, seen ? 0 : 180);
        return;
      }
      requestAnimationFrame(tick);
    };
    tick(t0);
  }

  // A pill that follows the cursor over project images, and the image preview in list view
  if (fine && !reduce) {
    const pill = pillEl.value!;
    const preview = previewEl.value!;
    const previewInner = previewIn.value!;
    const cards = document.querySelectorAll("#stack .card");
    let mx = -9999;
    let my = -9999;
    const P = { x: 0, y: 0 };
    const V = { x: 0, y: 0 };

    window.addEventListener("pointermove", (e) => {
      mx = e.clientX;
      my = e.clientY;
    }, { passive: true, signal });
    document.addEventListener("pointerover", (e) => {
      const el = e.target as Element;
      const media = el.closest?.<HTMLElement>("#stack .media");
      if (media) pillLabel.value = media.dataset.dest ?? "";
      pill.classList.toggle("show", !!media);
      const row = el.closest?.<HTMLElement>(".row");
      const src = row && cards[Number(row.dataset.for)]?.querySelector(".media");
      if (src && previewInner.dataset.for !== row.dataset.for) {
        previewInner.replaceChildren(src.cloneNode(true));
        previewInner.dataset.for = row.dataset.for;
      }
      preview.classList.toggle("show", !!src);
    }, { signal });

    const loop = () => {
      if (!alive) return;
      P.x += (mx - P.x) * 0.22;
      P.y += (my - P.y) * 0.22;
      V.x += (mx - V.x) * 0.12;
      V.y += (my - V.y) * 0.12;
      pill.style.transform = `translate3d(${P.x - pill.offsetWidth / 2}px,${P.y - pill.offsetHeight / 2}px,0)`;
      preview.style.transform = `translate3d(${V.x + 24}px,${V.y - 90}px,0) rotate(${Math.max(-6, Math.min(6, (mx - V.x) * 0.04))}deg)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
});

onBeforeUnmount(() => {
  alive = false;
  clearTimeout(copyTimer);
  cleanups.forEach((fn) => fn());
  // These live on <html>, outside this page, and would otherwise carry over to the next one
  document.documentElement.classList.remove("js", "loading", "rv", "ready", "first");
});
</script>

<style scoped>
/* The name lines slide past the screen edges as the hero scrolls away. Clipping here keeps that from
   widening the page, which let a jump to #work scroll sideways with no way back. clip, not hidden:
   it creates no scroll container, so the sticky cards and the horizontal strip keep working. */
main {
  overflow-x: clip;
}
</style>
