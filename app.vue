<template>
  <NuxtLayout>
    <NuxtPage/>
    <Analytics/>
  </NuxtLayout>
</template>

<script setup>
import {Analytics} from "@vercel/analytics/nuxt";
// After main.css (nuxt.config `css`): site.css is unlayered, so it wins over Tailwind's layers where both apply
import "@/assets/css/site.css";

const text = useText();
// <html lang>, and links to the same page in the other two languages for search engines
const i18nHead = useLocaleHead();

useHead({
  htmlAttrs: {lang: () => i18nHead.value.htmlAttrs?.lang},
  link: () => i18nHead.value.link ?? [],
  meta: () => [
    ...(i18nHead.value.meta ?? []),
    {name: "description", content: text.value.meta.description},
  ],
});
</script>
