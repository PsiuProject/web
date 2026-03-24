<template>
  <header>
    <div class="logo">EARTH<br>GUARDIANS<span>.SUR</span></div>
    <div class="nav-sections">
      <a href="#" class="nav-link" @click.prevent="store.clearFocus()">{{ $t('filters.all') }}</a>
      <a href="#" class="nav-link" :class="{ 'nav-active': store.focusedType === 'active' }" @click.prevent="store.focusSection('active')">{{ $t('sections.active') }}</a>
      <a href="#" class="nav-link" :class="{ 'nav-active': store.focusedType === 'pipeline' }" @click.prevent="store.focusSection('pipeline')">{{ $t('sections.pipeline') }}</a>
      <a href="#" class="nav-link" :class="{ 'nav-active': store.focusedType === 'done' }" @click.prevent="store.focusSection('done')">{{ $t('sections.done') }}</a>
      <button class="lang-toggle" @click="toggleLanguage">
        {{ locale === 'pt' ? 'EN' : 'PT' }}
      </button>
      <AuthModal />
    </div>
  </header>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useGalleryStore } from '../stores/gallery'
import AuthModal from './AuthModal.vue'

const { locale } = useI18n()
const store = useGalleryStore()

function toggleLanguage() {
  locale.value = locale.value === 'pt' ? 'en' : 'pt'
}
</script>

<style scoped>
.lang-toggle {
  background: transparent;
  border: 0.05vw solid var(--moss-light);
  color: var(--paper);
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  padding: 0.42vh 0.63vw;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 0.1vw;
}

.lang-toggle:hover {
  background: var(--terracotta);
  border-color: var(--terracotta);
  color: var(--ink);
}
</style>
