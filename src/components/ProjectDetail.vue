<template>
  <div class="project-detail-canvas" :style="{ transform: canvasTransform }">
    <!-- Central project info -->
    <div class="detail-node central-node" :style="{ top: '37.04vh', left: '41.67vw' }">
      <div class="node-header">{{ t(project.titleKey) }}</div>
      <div class="node-status" :class="'tag-' + project.type">{{ t(project.statusTagKey) }}</div>
      <p class="node-description">{{ t(project.descriptionKey) }}</p>
      <button class="back-button" @click="$emit('close')">← VOLTAR</button>
    </div>

    <!-- KPI Node -->
    <div v-if="project.kpiValue" class="detail-node kpi-node" :style="{ top: '18.52vh', left: '20.83vw' }">
      <div class="node-header">{{ t(project.kpiLabelKey || 'labels.kpi') }}</div>
      <div class="node-value">{{ project.kpiValue }}</div>
      <div v-if="project.kpiDetail" class="node-detail">{{ project.kpiDetail }}</div>
    </div>

    <!-- Territory & Axis Node -->
    <div class="detail-node info-node" :style="{ top: '18.52vh', left: '62.5vw' }">
      <div class="node-header">LOCALIZAÇÃO</div>
      <div class="node-item">{{ project.territory }}</div>
      <div v-if="project.axis" class="node-header" style="margin-top: 1rem;">EIXOS</div>
      <div v-for="axis in project.axis" :key="axis" class="node-item">{{ axis }}</div>
    </div>

    <!-- Meta Node -->
    <div v-if="project.meta && project.meta.length" class="detail-node meta-node" :style="{ top: '55.56vh', left: '20.83vw' }">
      <div class="node-header">DETALHES</div>
      <div v-for="item in project.meta" :key="item.labelKey" class="meta-detail">
        <label>{{ t(item.labelKey) }}</label>
        <span>{{ item.value }}</span>
      </div>
    </div>

    <!-- Notes Node (placeholder for future expansion) -->
    <div class="detail-node notes-node" :style="{ top: '55.56vh', left: '62.5vw' }">
      <div class="node-header">NOTAS</div>
      <div class="node-content">
        <p style="opacity: 0.6; font-size: 0.85rem;">Espaço para anotações e links adicionais</p>
      </div>
    </div>

    <!-- Connection lines -->
    <svg class="detail-connections" xmlns="http://www.w3.org/2000/svg">
      <line v-if="project.kpiValue" x1="800" y1="450" x2="550" y2="280" stroke="var(--color-moss)" stroke-width="2" stroke-dasharray="4,4" opacity="0.4" />
      <line x1="1000" y1="450" x2="1300" y2="280" stroke="var(--color-moss)" stroke-width="2" stroke-dasharray="4,4" opacity="0.4" />
      <line v-if="project.meta && project.meta.length" x1="850" y1="550" x2="550" y2="650" stroke="var(--color-moss)" stroke-width="2" stroke-dasharray="4,4" opacity="0.4" />
      <line x1="1000" y1="550" x2="1300" y2="650" stroke="var(--color-moss)" stroke-width="2" stroke-dasharray="4,4" opacity="0.4" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  project: { type: Object, required: true },
  translateX: { type: Number, default: 0 },
  translateY: { type: Number, default: 0 },
  zoom: { type: Number, default: 1 }
})

defineEmits(['close'])

const canvasTransform = computed(() => {
  const tx = typeof props.translateX === 'number' ? props.translateX : 0
  const ty = typeof props.translateY === 'number' ? props.translateY : 0
  const z = typeof props.zoom === 'number' ? props.zoom : 1
  return `translate3d(${tx}px, ${ty}px, 0) scale(${z})`
})
</script>

<style scoped>
.project-detail-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 125vw;
  height: 129.63vh;
  transform-origin: 0 0;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
  pointer-events: none;
}

.detail-node {
  position: absolute;
  background: rgba(20, 20, 18, 0.95);
  border: 0.05vw solid var(--color-moss);
  padding: 1.5rem;
  min-width: 14.58vw;
  max-width: 20.83vw;
  box-shadow: 0 0.74vh 2.96vh rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(0.52vw);
  pointer-events: auto;
}

.central-node {
  min-width: 20.83vw;
  border-width: 0.1vw;
  border-color: var(--color-terracotta);
}

.node-header {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  font-weight: bold;
  color: var(--color-moss);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.75rem;
  border-bottom: 0.05vw solid var(--color-moss);
  padding-bottom: 0.5rem;
}

.node-status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 1rem;
  border: 0.05vw solid;
}

.tag-active { background: rgba(255, 95, 31, 0.2); border-color: #ff5f1f; color: #ff5f1f; }
.tag-pipeline { background: rgba(106, 125, 91, 0.2); border-color: #6a7d5b; color: #6a7d5b; }
.tag-done { background: rgba(181, 93, 58, 0.2); border-color: #b55d3a; color: #b55d3a; }

.node-description {
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--color-paper);
  margin-bottom: 1.5rem;
}

.node-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-terracotta);
  margin-bottom: 0.5rem;
}

.node-detail {
  font-size: 0.85rem;
  opacity: 0.8;
  color: var(--color-paper);
}

.node-item {
  padding: 0.5rem 0;
  border-bottom: 0.05vw solid rgba(106, 125, 91, 0.2);
  color: var(--color-paper);
  font-size: 0.9rem;
}

.meta-detail {
  margin-bottom: 0.75rem;
}

.meta-detail label {
  display: block;
  font-size: 0.7rem;
  color: var(--color-moss);
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.meta-detail span {
  color: var(--color-paper);
  font-size: 0.85rem;
}

.node-content {
  color: var(--color-paper);
  font-size: 0.9rem;
  line-height: 1.6;
}

.back-button {
  background: var(--color-moss);
  color: var(--color-ink);
  border: none;
  padding: 0.5rem 1rem;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.2s;
}

.back-button:hover {
  background: var(--color-terracotta);
  transform: translateX(-0.21vw);
}

.detail-connections {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
}
</style>
