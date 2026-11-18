<template>
  <footer class="site-footer wrap">
    <span class="mono">© {{ year }} borysbabas<span class="dev-mark">.dev</span></span>
    <ul class="links">
      <li><a href="https://github.com/borysbabas">GitHub</a></li>
      <li><a href="https://www.linkedin.com/in/borysbabas/">LinkedIn</a></li>
      <li><a href="/privacy">Privacy</a></li>
      <li><a href="/terms">Terms</a></li>
    </ul>
  </footer>
</template>

<script lang="ts" setup>
const year = new Date().getFullYear();
</script>
