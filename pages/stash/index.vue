<template>
  <div class="stash">
    <div class="stash-head">
      <h1>Stash</h1>
      <button v-if="session?.authed" class="quiet" type="button" @click="signOut">Sign out</button>
    </div>

    <form v-if="!session?.authed" class="stash-form" @submit.prevent="signIn">
      <label class="sr-only" for="stash-password">Password</label>
      <input
        id="stash-password"
        data-hide-cursor
        v-model="password"
        autocomplete="current-password"
        placeholder="Password"
        required
        type="password"
      />
      <button :disabled="busy" type="submit">{{ busy ? "Checking…" : "Sign in" }}</button>
    </form>

    <template v-else>
      <form class="stash-form" @submit.prevent="save">
        <label class="sr-only" for="stash-url">Link to save</label>
        <input
          id="stash-url"
          data-hide-cursor
          v-model="link"
          :disabled="busy"
          inputmode="url"
          placeholder="Paste a link: a recipe, a product, an article…"
          required
          type="url"
        />
        <button :disabled="busy" type="submit">{{ busy ? "Reading…" : "Save" }}</button>
      </form>
      <p v-if="busy" class="mono">Claude is reading the page. That can take up to a minute.</p>
      <p v-else-if="!items.length" class="mono">Nothing saved yet.</p>
    </template>

    <p v-if="error" class="stash-error" role="alert">{{ error }}</p>

    <div v-if="session?.authed" class="stash-grid">
      <article v-for="item in items" :key="item.id" class="stash-card">
        <!-- Same destination as the title link, so it stays out of the tab order -->
        <a v-if="item.image" :href="item.url" aria-hidden="true" class="thumb" rel="noopener noreferrer" tabindex="-1" target="_blank">
          <img :src="item.image" alt="" loading="lazy" referrerpolicy="no-referrer" />
        </a>
        <div class="body">
          <p class="mono">{{ item.kind }} · {{ item.site || hostname(item.url) }} · {{ formatDate(item.created_at) }}</p>
          <h2><a :href="item.url" rel="noopener noreferrer" target="_blank">{{ item.title }}</a></h2>
          <p class="summary">{{ item.summary }}</p>
          <dl v-if="item.details.facts?.length" class="facts">
            <div v-for="fact in item.details.facts" :key="fact.label">
              <dt>{{ fact.label }}</dt>
              <dd>{{ fact.value }}</dd>
            </div>
          </dl>
          <template v-if="item.details.list?.length">
            <h3 class="mono">{{ item.details.list_title }}</h3>
            <ul class="entries">
              <li v-for="(entry, i) in item.details.list" :key="i">{{ entry }}</li>
            </ul>
          </template>
          <div v-if="item.tags.length" class="tags"><span v-for="tag in item.tags" :key="tag">{{ tag }}</span></div>
          <div class="actions">
            <span class="mono">{{ item.remind ? "Reminds you weekly" : "No reminders" }}</span>
            <button class="quiet" type="button" @click="toggleRemind(item)">{{ item.remind ? "Stop" : "Remind me" }}</button>
            <button class="quiet" type="button" @click="remove(item)">{{ confirming === item.id ? "Delete for good?" : "Delete" }}</button>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import type { StashItem } from "~/server/utils/stash";
import "~/assets/css/stash.css";

useSeoMeta({ title: "Stash", robots: "noindex, nofollow" });

const { data: session, refresh: refreshSession } = await useFetch("/api/stash/session");
const { data: items, execute: loadItems } = await useFetch<StashItem[]>("/api/stash/items", {
  default: () => [],
  immediate: !!session.value?.authed,
});

const password = ref("");
const link = ref("");
const busy = ref(false);
const error = ref("");
const confirming = ref<string | null>(null);

const hostname = (url: string) => new URL(url).hostname.replace(/^www\./, "");
const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const messageOf = (e: unknown) =>
  (e as { data?: { statusMessage?: string } })?.data?.statusMessage ?? "Something went wrong, try again.";

// Every action shows its own error and clears the last one
const run = async (action: () => Promise<void>) => {
  busy.value = true;
  error.value = "";
  try {
    await action();
  } catch (e) {
    error.value = messageOf(e);
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
  });

const signOut = () =>
  run(async () => {
    await $fetch("/api/stash/logout", { method: "POST" });
    items.value = [];
    await refreshSession();
  });

const save = () =>
  run(async () => {
    const item = await $fetch<StashItem>("/api/stash/items", { method: "POST", body: { url: link.value } });
    items.value = [item, ...items.value];
    link.value = "";
  });

const toggleRemind = (item: StashItem) =>
  run(async () => {
    const updated = await $fetch<StashItem>(`/api/stash/items/${item.id}`, {
      method: "PATCH",
      body: { remind: !item.remind },
    });
    items.value = items.value.map((i) => (i.id === updated.id ? updated : i));
  });

// Two presses, so a stray click can't throw a card away
const remove = (item: StashItem) => {
  if (confirming.value !== item.id) {
    confirming.value = item.id;
    return;
  }
  confirming.value = null;
  return run(async () => {
    await $fetch(`/api/stash/items/${item.id}`, { method: "DELETE" });
    items.value = items.value.filter((i) => i.id !== item.id);
  });
};
</script>
