<template>
  <div>
    <SiteNav />
    <main class="page wrap">
      <slot />
    </main>
    <SiteFooter />
    <SiteCursor />
    <SpeedInsights />
  </div>
</template>

<script lang="ts" setup>
import { SpeedInsights } from "@vercel/speed-insights/vue";
</script>
