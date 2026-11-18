<template>
  <div>
    <SiteNav />
    <main class="page wrap error-page">
      <p class="error-code">{{ statusCode }}</p>
      <h1>{{ title }}</h1>
      <p>{{ message }}</p>
      <ul class="links">
        <li><button type="button" @click="handleClear">{{ text.error.home }}</button></li>
        <li><a :href="`${home}#work`">{{ text.error.work }}</a></li>
        <li><a :href="`${home}#contact`">{{ text.error.contact }}</a></li>
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
const text = useText();
const home = useLocalePath()("/");
// The error page renders without app.vue, and on an unknown address neither useLocaleHead() nor the
// locales list gives it a language tag, so it maps the locale itself (same tags as nuxt.config.ts)
const { locale } = useI18n();
const LANG_TAGS: Record<string, string> = { en: "en-GB", nl: "nl-NL", pl: "pl-PL" };
useHead({ htmlAttrs: { lang: () => LANG_TAGS[locale.value] } });

const isDev = import.meta.dev;

const statusCode = computed(() => props.error?.statusCode ?? 500);
const isNotFound = computed(() => statusCode.value === 404);

const title = computed(() => (isNotFound.value ? text.value.error.notFoundTitle : text.value.error.errorTitle));
const message = computed(() => (isNotFound.value ? text.value.error.notFoundText : text.value.error.errorText));

// clearError tears down the error state before navigating, so the app does
// not render the error page again on the next route.
const handleClear = () => clearError({ redirect: home });

useSeoMeta({
  title: () => `${statusCode.value} - Borys`,
  // Nothing here is worth indexing, and a soft 404 in the index is worse
  // than none at all.
  robots: "noindex, follow",
});
</script>
