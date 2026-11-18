<template>
  <article class="legal">
    <h1>{{ doc.title }}</h1>
    <p class="mono">{{ doc.updated }}</p>
    <p class="intro">
      <template v-for="(part, i) in withEmail(doc.intro)" :key="i">{{ part }}<a v-if="i < withEmail(doc.intro).length - 1" :href="`mailto:${EMAIL}`">{{ EMAIL }}</a></template>
    </p>
    <section v-for="section in doc.sections" :key="section.heading">
      <h2>{{ section.heading }}</h2>
      <p v-for="(text, p) in section.paragraphs ?? []" :key="p">
        <template v-for="(part, i) in withEmail(text)" :key="i">{{ part }}<a v-if="i < withEmail(text).length - 1" :href="`mailto:${EMAIL}`">{{ EMAIL }}</a></template>
      </p>
      <ul v-if="section.list">
        <li v-for="(item, i) in section.list" :key="i">{{ item }}</li>
      </ul>
    </section>
  </article>
</template>

<script lang="ts" setup>
import type { LegalDoc } from "~/content/legal";

defineProps<{ doc: LegalDoc }>();

const EMAIL = "info@borysbabas.dev";
// The text around each mention of the address; the template puts a mailto link between the pieces
const withEmail = (text: string) => text.split(EMAIL);
</script>

<style scoped>
.legal { max-width: 68ch; display: flex; flex-direction: column; gap: 0.75rem; padding-bottom: 2rem; }
.legal h1 { margin: 0; font-weight: 650; font-size: clamp(2.5rem, 7vw, 4.5rem); letter-spacing: -0.04em; line-height: 1; }
.legal .mono { margin: 0; }
.legal .intro { margin: 0.75rem 0 0; font-size: 1.15rem; }
.legal h2 { margin: 1.5rem 0 0.25rem; font-weight: 650; font-size: 1.4rem; }
.legal p { margin: 0; color: var(--muted); }
.legal .intro { color: var(--ink); }
.legal ul { margin: 0; padding-left: 1.2rem; display: grid; gap: 0.5rem; color: var(--muted); }
.legal a { color: var(--ink); text-underline-offset: 0.2em; }
</style>
