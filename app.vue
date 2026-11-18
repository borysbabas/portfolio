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

useHead({
  link: [
    {rel: "preconnect", href: "https://fonts.googleapis.com"},
    {rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: ""},
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800&family=Geist:wght@400..600&family=Geist+Mono:wght@400;500&display=swap",
    },
  ],
});
</script>
