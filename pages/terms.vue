<template>
  <LegalPage :doc="doc" />
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { legal } from "~/content/legal";
import type { Locale } from "~/content/site";

const { locale } = useI18n();
const doc = computed(() => legal[locale.value as Locale].terms);

useSeoMeta({ title: () => `${doc.value.title} - Borys`, description: () => doc.value.intro });
</script>
