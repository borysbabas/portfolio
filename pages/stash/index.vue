<template>
  <div class="stash">
    <div class="stash-head">
      <h1>{{ s.title }}</h1>
      <button v-if="session?.authed" class="quiet" type="button" @click="signOut">{{ s.signOut }}</button>
    </div>
    <p v-if="session?.authed && costs" class="mono">{{ fillText(s.costs, { month: formatUsd(costs.month), last: formatUsd(costs.last) }) }}</p>

    <form v-if="!session?.authed" class="stash-form" @submit.prevent="signIn">
      <label class="sr-only" for="stash-password">{{ s.password }}</label>
      <input
        id="stash-password"
        v-model="password"
        data-hide-cursor
        autocomplete="current-password"
        :placeholder="s.password"
        required
        type="password"
      />
      <button :disabled="busy" type="submit">{{ busy ? s.checking : s.signIn }}</button>
    </form>

    <template v-else>
      <form class="stash-compose" @submit.prevent="save">
        <label class="sr-only" for="stash-url">{{ s.linkLabel }}</label>
        <input
          id="stash-url"
          v-model="link"
          data-hide-cursor
          :disabled="busy"
          inputmode="url"
          :placeholder="s.linkPlaceholder"
          required
          type="url"
        />
        <label class="sr-only" for="stash-text">{{ s.textLabel }}</label>
        <textarea
          id="stash-text"
          v-model="text"
          data-hide-cursor
          :disabled="busy"
          :placeholder="s.textPlaceholder"
          rows="2"
        ></textarea>
        <div class="compose-foot">
          <p aria-live="polite" class="mono">{{ busy ? s.readingHint : s.captionHint }}</p>
          <button :disabled="busy" type="submit">{{ busy ? s.reading : s.save }}</button>
        </div>
      </form>
      <p v-if="translating" class="mono" role="status">{{ s.translatingHint }}</p>
      <p v-else-if="!items.length && !loading" class="mono">{{ s.empty }}</p>
    </template>

    <p v-if="error" class="stash-error" role="alert">{{ error }}</p>

    <div v-if="session?.authed" class="stash-grid">
      <NuxtLink v-for="item in items" :key="item.id" :to="localePath(`/stash/${item.id}`)" class="stash-card">
        <div v-if="item.image" class="thumb">
          <img :src="item.image" alt="" loading="lazy" referrerpolicy="no-referrer" />
        </div>
        <div class="body">
          <p class="mono">{{ s.kinds[item.kind] }} · {{ item.site || hostname(item.url) }}</p>
          <h2>{{ item.title }}</h2>
          <p class="summary">{{ item.summary }}</p>
          <dl v-if="item.details.facts?.length" class="facts">
            <div v-for="fact in item.details.facts.slice(0, 3)" :key="fact.label">
              <dt>{{ fact.label }}</dt>
              <dd>{{ fact.value }}</dd>
            </div>
          </dl>
          <p class="mono foot">{{ fillText(s.saved, { date: formatDate(item.created_at) }) }}</p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import type { StashItem } from "~/server/utils/stash";
import "~/assets/css/stash.css";

const siteText = useText();
const s = computed(() => siteText.value.stash);
const { locale } = useI18n();
const localePath = useLocalePath();
const formatDate = useFormatDate();
const formatUsd = useFormatUsd();
const errorText = useStashError();

useSeoMeta({ title: () => s.value.title, robots: "noindex, nofollow" });

const { data: session, refresh: refreshSession } = await useFetch("/api/stash/session");
// In the page's language where a translation is stored; the rest come in English and are translated below
const { data: items, execute: loadItems, status } = await useFetch<StashItem[]>("/api/stash/items", {
  query: { lang: locale },
  default: () => [],
  immediate: !!session.value?.authed,
});
const loading = computed(() => status.value === "pending");
// After the page is up: the cost report is slower than the cards, and null without an admin key
const { data: costs, execute: loadCosts } = useFetch<{ month: number; last: number } | null>("/api/stash/costs", {
  server: false,
  immediate: !!session.value?.authed,
});

// Each card without a stored translation is translated on its own and switches over as soon as it's done.
// shortcut: all at once, which a stash of dozens of new cards could run into Claude's rate limit with; failed ones stay English until the next visit
const translating = ref(0);
const translateMissing = () => {
  for (const { id } of items.value.filter((item) => item.untranslated)) {
    translating.value++;
    $fetch<StashItem>(`/api/stash/items/${id}`, { query: { lang: locale.value, translate: 1 } })
      .then((done) => (items.value = items.value.map((item) => (item.id === id ? done : item))))
      .catch(() => {})
      .finally(() => translating.value--);
  }
};
onMounted(translateMissing);

const password = ref("");
const link = ref("");
const text = ref("");
const busy = ref(false);
const error = ref("");

const hostname = (url: string) => new URL(url).hostname.replace(/^www\./, "");

// Every action shows its own error and clears the last one
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

const signIn = () =>
  run(async () => {
    await $fetch("/api/stash/login", { method: "POST", body: { password: password.value } });
    password.value = "";
    await refreshSession();
    await loadItems();
    translateMissing();
    loadCosts();
  });

const signOut = () =>
  run(async () => {
    await $fetch("/api/stash/logout", { method: "POST" });
    items.value = [];
    costs.value = null;
    await refreshSession();
  });

const save = () =>
  run(async () => {
    const item = await $fetch<StashItem>("/api/stash/items", {
      method: "POST",
      body: { url: link.value, text: text.value, lang: locale.value },
    });
    items.value = [item, ...items.value];
    link.value = "";
    text.value = "";
  });
</script>
