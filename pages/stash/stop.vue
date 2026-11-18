<template>
  <div class="stash">
    <div class="stash-head"><h1>Reminders</h1></div>
    <p v-if="title" class="summary">Done. You won't be reminded about “{{ title }}” again.</p>
    <template v-else>
      <p class="summary">Stop the weekly reminder for this card? It stays in your stash.</p>
      <div class="stash-form">
        <button :disabled="busy" type="button" @click="stop">{{ busy ? "Stopping…" : "Stop reminding me" }}</button>
      </div>
    </template>
    <p v-if="error" class="stash-error" role="alert">{{ error }}</p>
    <p><a class="quiet" href="/stash">Open your stash</a></p>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import "~/assets/css/stash.css";

// Reminders stop only from this button, never from opening the link,
// so mail scanners that visit links on arrival can't switch them off
useSeoMeta({ title: "Reminders", robots: "noindex, nofollow" });

const route = useRoute();
const busy = ref(false);
const error = ref("");
const title = ref("");

const stop = async () => {
  busy.value = true;
  error.value = "";
  try {
    const result = await $fetch<{ title: string }>("/api/stash/stop", {
      method: "POST",
      body: { id: route.query.id, token: route.query.token },
    });
    title.value = result.title;
  } catch (e) {
    error.value = (e as { data?: { statusMessage?: string } })?.data?.statusMessage ?? "Something went wrong, try again.";
  } finally {
    busy.value = false;
  }
};
</script>
