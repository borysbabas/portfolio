<template>
  <div>
    <SiteNav />
    <main class="page wrap error-page">
      <p class="error-code">{{ statusCode }}</p>
      <h1>{{ title }}</h1>
      <p>{{ message }}</p>
      <ul class="links">
        <li><button type="button" @click="handleClear">Back home</button></li>
        <li><a href="/#work">Selected work</a></li>
        <li><a href="/#contact">Contact</a></li>
      </ul>
      <!-- Surfaced in development only: in production this is either noise or an information leak. -->
      <pre v-if="isDev && error?.message">{{ error.message }}</pre>
    </main>
    <SiteCursor />
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { NuxtError } from "#app";

const props = defineProps<{ error?: NuxtError }>();

const isDev = import.meta.dev;

const statusCode = computed(() => props.error?.statusCode ?? 500);
const isNotFound = computed(() => statusCode.value === 404);

const title = computed(() =>
  isNotFound.value ? "This page doesn't exist" : "Something went wrong",
);

const message = computed(() =>
  isNotFound.value
    ? "The link might be out of date, or the page may have moved."
    : "That is on my end, not yours. Try again in a moment.",
);

// clearError tears down the error state before navigating, so the app does
// not render the error page again on the next route.
const handleClear = () => clearError({ redirect: "/" });

useSeoMeta({
  title: () => `${statusCode.value} - Borys`,
  // Nothing here is worth indexing, and a soft 404 in the index is worse
  // than none at all.
  robots: "noindex, follow",
});
</script>
