<template>
  <article
    ref="cardRef"
    :id="project.id"
    :data-type="project.type"
    class="project-card"
    :class="[project.size, { 'sub-project': isSubProject }]"
    :style="cardStyles"
    @click="handleCardClick"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div class="status-tag" :class="'tag-' + project.type">{{ t(project.statusTagKey) }}</div>
    <h2 class="title">{{ t(project.titleKey) }}</h2>
    <p class="description">{{ t(project.descriptionKey) }}</p>
    <div v-if="project.kpiValue" class="kpi-box">
      <div v-if="project.kpiLabelKey" class="filter-label">{{ t(project.kpiLabelKey) }}</div>
      <div class="kpi-value">{{ project.kpiValue }}</div>
      <div v-if="project.kpiDetail" style="font-size: 0.7rem; opacity: 0.7;">{{ project.kpiDetail }}</div>
    </div>
    <div v-if="project.meta.length" class="meta-grid">
      <div v-for="item in project.meta" :key="item.labelKey" class="meta-item">
        <label>{{ t(item.labelKey) }}</label>
        {{ item.value }}
      </div>
    </div>
    <div v-if="isSubProject" class="sub-project-indicator">&#8627; {{ t(project.connectionTypeKey || 'connections.subProject') }}</div>
  </article>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGalleryStore } from '../stores/gallery'

const { t } = useI18n()

const props = defineProps({
  project: { type: Object, required: true },
  isSubProject: { type: Boolean, default: false }
})

const store = useGalleryStore()
const cardRef = ref(null)
const isHovered = ref(false)

// Calculate dynamic dimensions based on content
const cardDimensions = computed(() => {
  // Check if we have calculated size
  if (store.calculatedCardSizes[props.project.id]) {
    return store.calculatedCardSizes[props.project.id]
  }
  
  // Calculate size based on content first
  return store.calculateCardSize(props.project)
})

// Measure actual card size after render
onMounted(() => {
  if (cardRef.value) {
    setTimeout(() => {
      const rect = cardRef.value.getBoundingClientRect()
      const actualDimensions = {
        width: Math.max(280, Math.min(520, rect.width / store.zoom)),
        height: Math.max(320, Math.min(620, rect.height / store.zoom))
      }
      store.updateCardSize(props.project.id, actualDimensions)
    }, 100)
  }
})

const cardStyles = computed(() => {
  const position = props.project.computedPosition || props.project.position
  const dim = cardDimensions.value
  const anim = store.cardAnimations[props.project.id]
  
  const baseStyles = {
    top: `${position.top}px`,
    left: `${position.left}px`,
    width: `${dim.width}px`,
    minHeight: `${dim.height}px`,
    cursor: 'pointer'
  }
  
  if (anim) {
    return {
      ...baseStyles,
      opacity: store.focusedType
        ? (props.project.type === store.focusedType ? '1' : '0.15')
        : anim.opacity,
      transform: anim.transform
    }
  }
  
  // Simplified static positioning - no transitions during drag
  return {
    ...baseStyles,
    opacity: store.focusedType
      ? (props.project.type === store.focusedType ? '1' : '0.15')
      : '1',
    transform: 'translateZ(0)'
  }
})

const handleCardClick = (e) => {
  e.stopPropagation()
  store.openDetailView(props.project)
}
</script>
