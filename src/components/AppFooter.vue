<template>
  <footer>
    <div class="footer-links">
      <a href="#">{{ $t('footer.brandKit') }}</a>
      <a href="#">{{ $t('footer.database') }}</a>
      <a href="#">{{ $t('footer.calendar') }}</a>
    </div>
    <div class="coordinate-display">{{ store.coordsDisplay }}</div>
  </footer>
</template>

<script setup>
import { useGalleryStore } from '../stores/gallery'
const store = useGalleryStore()
</script>
