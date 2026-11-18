<template>
  <footer class="site-footer wrap">
    <span class="mono">© {{ year }} borysbabas<span class="dev-mark">.dev</span></span>
    <ul class="links">
      <li><a href="https://github.com/borysbabas">GitHub</a></li>
      <li><a href="https://www.linkedin.com/in/borysbabas/">LinkedIn</a></li>
      <li><a :href="localePath('/privacy')">{{ text.footer.privacy }}</a></li>
      <li><a :href="localePath('/terms')">{{ text.footer.terms }}</a></li>
    </ul>
  </footer>
</template>

<script lang="ts" setup>
const text = useText();
const localePath = useLocalePath();
const year = new Date().getFullYear();
</script>
