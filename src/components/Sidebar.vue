<template>
  <aside class="sidebar">
    <div class="filter-group">
      <div class="filter-label">{{ $t('sidebar.categories') }}</div>
      <button
        v-for="cat in categories"
        :key="cat"
        class="filter-btn"
        :class="{ active: store.activeCategoryFilter === cat }"
        @click="store.activeCategoryFilter = store.activeCategoryFilter === cat ? null : cat"
      >{{ $t('categories.' + cat) }}</button>
    </div>
    <div class="filter-group">
      <div class="filter-label">{{ $t('sidebar.years') }}</div>
      <button
        v-for="year in years"
        :key="year"
        class="filter-btn"
        :class="{ active: store.activeYearFilter === year }"
        @click="store.activeYearFilter = store.activeYearFilter === year ? null : year"
      >{{ $t('years.' + year) }}</button>
    </div>
  </aside>
</template>

<script setup>
import { useGalleryStore } from '../stores/gallery'

const store = useGalleryStore()

const axes = ['Arte', 'Tecnologia', 'Água', 'Direitos']
const categories = ['culture', 'environmental', 'climate', 'restoration', 'rights']
const years = [2024, 2025, 2026, 2027]
</script>