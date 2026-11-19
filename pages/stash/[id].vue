<template>
  <div class="stash stash-detail">
    <p><NuxtLink :to="localePath('/stash')" class="quiet back">{{ st.allCards }}</NuxtLink></p>

    <p v-if="!item" class="summary">{{ loadError || st.loading }}</p>

    <template v-else>
      <!-- A recipe gets a small picture beside the title, so the steps aren't pushed down a screen -->
      <div v-if="item.image && !isRecipe" class="hero">
        <img :src="item.image" alt="" referrerpolicy="no-referrer" />
      </div>
      <header :class="{ 'with-thumb': item.image && isRecipe }" class="detail-head">
        <img v-if="item.image && isRecipe" :src="item.image" alt="" class="thumb" referrerpolicy="no-referrer" />
        <div>
          <p class="mono">{{ st.kinds[item.kind] }} · {{ item.site || hostname(item.url) }} · {{ fillText(st.saved, { date: formatDate(item.created_at) }) }}</p>
          <h1>{{ item.title }}</h1>
        </div>
      </header>
      <p v-if="translating" class="mono" role="status">{{ st.translatingCard }}</p>
      <p class="summary">{{ item.summary }}</p>
      <p class="sources">
        <a :href="item.url" rel="noopener noreferrer" target="_blank">{{ st.openLink }}</a>
      </p>

      <dl v-if="item.details.facts?.length" class="facts">
        <div v-for="fact in item.details.facts" :key="fact.label">
          <dt>{{ fact.label }}</dt>
          <dd>{{ fact.value }}</dd>
        </div>
      </dl>

      <!-- Recipes: ingredients beside the steps, so both are in view while cooking -->
      <div v-if="isRecipe && steps.length" class="recipe">
        <section v-if="ingredients.length" class="section ingredients">
          <div v-for="section in ingredients" :key="section.title">
            <h2>{{ section.title }}</h2>
            <ul>
              <li v-for="(entry, i) in section.items" :key="i" :class="{ group: entry.endsWith(':') }">{{ entry }}</li>
            </ul>
          </div>
        </section>
        <section class="section steps">
          <div v-for="(section, n) in steps" :key="section.title">
            <div class="steps-head">
              <h2>{{ section.title }}</h2>
              <button v-if="n === 0" class="cook-start" type="button" @click="cooking = true">{{ st.startCooking }}</button>
            </div>
            <ol>
              <li v-for="(entry, i) in section.items" :key="i">
                <span aria-hidden="true" class="step-n">{{ String(i + 1).padStart(2, "0") }}</span>
                <p>{{ entry }}</p>
              </li>
            </ol>
          </div>
        </section>
      </div>

      <section v-for="section in rest" :key="section.title" class="section">
        <h2>{{ section.title }}</h2>
        <template v-if="section.style === 'text'">
          <p v-for="(entry, i) in section.items" :key="i">{{ entry }}</p>
        </template>
        <component :is="section.style === 'steps' ? 'ol' : 'ul'" v-else>
          <li v-for="(entry, i) in section.items" :key="i">{{ entry }}</li>
        </component>
      </section>

      <section v-if="item.details.links?.length" class="section">
        <h2>{{ st.links }}</h2>
        <ul class="link-list">
          <li v-for="l in item.details.links" :key="l.url">
            <a :href="l.url" rel="noopener noreferrer" target="_blank">{{ l.label }}</a>
            <span class="mono">{{ hostname(l.url) }}</span>
          </li>
        </ul>
      </section>

      <div v-if="item.tags.length" class="tags"><span v-for="tag in item.tags" :key="tag">{{ tag }}</span></div>

      <div class="actions">
        <button :disabled="busy" class="quiet" type="button" @click="remove">{{ confirming ? st.confirmDelete : st.delete }}</button>
      </div>

      <form class="stash-compose" @submit.prevent="readAgain">
        <label class="sr-only" for="stash-again-text">{{ st.textLabel }}</label>
        <textarea
          id="stash-again-text"
          v-model="text"
          data-hide-cursor
          :disabled="busy"
          :placeholder="st.againPlaceholder"
          rows="2"
        ></textarea>
        <div class="compose-foot">
          <p aria-live="polite" class="mono">{{ busy ? st.readingHint : "" }}</p>
          <button :disabled="busy || translating" type="submit">{{ busy ? st.reading : st.readAgain }}</button>
        </div>
      </form>

      <StashCookMode v-if="cooking" :ingredients="ingredients" :steps="cookSteps" :title="item.title" @close="cooking = false" />
    </template>

    <p v-if="error" class="stash-error" role="alert">{{ error }}</p>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import type { StashItem } from "~/server/utils/stash";
import "~/assets/css/stash.css";

const siteText = useText();
const st = computed(() => siteText.value.stash);
const { locale } = useI18n();
const localePath = useLocalePath();
const formatDate = useFormatDate();
const errorText = useStashError();

useSeoMeta({ title: () => st.value.title, robots: "noindex, nofollow" });

const route = useRoute();
// In the page's language if a translation is stored; otherwise in English, and translated below
const { data: item, error: fetchError } = await useFetch<StashItem>(`/api/stash/items/${route.params.id}`, {
  query: { lang: locale },
});
const loadError = computed(() =>
  fetchError.value?.statusCode === 401 ? st.value.signInFirst : fetchError.value ? st.value.missing : "",
);

// The card is on screen in English while Claude translates it; it switches over when done
const translating = ref(false);
onMounted(async () => {
  if (!item.value?.untranslated) return;
  translating.value = true;
  try {
    item.value = await $fetch<StashItem>(`/api/stash/items/${route.params.id}`, { query: { lang: locale.value, translate: 1 } });
  } catch {
    // Stays in English; the next visit tries again
  } finally {
    translating.value = false;
  }
});

const text = ref("");
const busy = ref(false);
const error = ref("");
const confirming = ref(false);

// Cards saved before sections existed carry a single list instead
const sections = computed(() => {
  const details = item.value?.details;
  if (details?.sections) return details.sections;
  return details?.list?.length ? [{ title: details.list_title ?? "", style: "list" as const, items: details.list }] : [];
});

const isRecipe = computed(() => item.value?.kind === "recipe");
const ingredients = computed(() =>
  isRecipe.value ? sections.value.filter((s) => s.style === "list" && /ingredient/i.test(s.key ?? s.title)) : [],
);
const steps = computed(() => (isRecipe.value ? sections.value.filter((s) => s.style === "steps") : []));
// Only split out when there are steps to put beside them; otherwise everything renders in order
const rest = computed(() =>
  steps.value.length ? sections.value.filter((s) => !ingredients.value.includes(s) && !steps.value.includes(s)) : sections.value,
);

// One step at a time; a recipe with several step sections ("Sauce", "Assembly") shows which one each step is in
const cooking = ref(false);
const cookSteps = computed(() =>
  steps.value.flatMap((s) => s.items.map((text) => ({ section: steps.value.length > 1 ? s.title : "", text }))),
);

const hostname = (url: string) => new URL(url).hostname.replace(/^www\./, "");

const run = async (action: () => Promise<void>) => {
  busy.value = true;
  error.value = "";
  try {
    await action();
  } catch (e) {
    error.value = errorText(e);
  } finally {
    busy.value = false;
  }
};

const readAgain = () =>
  run(async () => {
    item.value = await $fetch<StashItem>(`/api/stash/items/${route.params.id}/refresh`, {
      method: "POST",
      body: { text: text.value, lang: locale.value },
    });
    text.value = "";
  });

// Two presses, so a stray click can't throw a card away
const remove = () => {
  if (!confirming.value) {
    confirming.value = true;
    return;
  }
  return run(async () => {
    await $fetch(`/api/stash/items/${route.params.id}`, { method: "DELETE" });
    await navigateTo(localePath("/stash"));
  });
};
</script>
