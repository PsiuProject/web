<template>
  <div class="editor-toolbar" :class="{ 'collapsed': collapsed }">
    <!-- Collapse toggle -->
    <button class="collapse-btn" @click="collapsed = !collapsed">
      {{ collapsed ? '›' : '‹' }}
    </button>

    <template v-if="!collapsed">
      <!-- Tools section -->
      <div class="toolbar-section">
        <div class="section-label">{{ $t('editor.tools') }}</div>
        
        <button 
          v-for="tool in tools" 
          :key="tool.type"
          class="tool-btn"
          :class="{ active: activeTool === tool.type }"
          @click="selectTool(tool.type)"
          :title="$t(`editor.tools.${tool.type}`)"
        >
          <span class="tool-icon">{{ tool.icon }}</span>
          <span class="tool-label">{{ $t(`editor.tools.${tool.type}`) }}</span>
        </button>
      </div>

      <!-- Connection types (when connection tool is active) -->
      <div v-if="activeTool === 'connection'" class="toolbar-section">
        <div class="section-label">{{ $t('editor.connectionType') }}</div>
        
        <button
          v-for="connType in connectionTypes"
          :key="connType.name"
          class="connection-type-btn"
          :class="{ active: selectedConnectionType === connType.name }"
          @click="selectedConnectionType = connType.name"
          :style="{ borderColor: connType.color }"
        >
          <span class="conn-dot" :style="{ background: connType.color }"></span>
          {{ $t(connType.label_key) || connType.name }}
        </button>
      </div>

      <!-- Quick insert cards -->
      <div v-if="activeTool === 'card'" class="toolbar-section">
        <div class="section-label">{{ $t('editor.quickAdd') }}</div>
        
        <button 
          class="quick-card-btn"
          @click="quickAddCard('active')"
        >
          <span class="card-preview tag-active"></span>
          {{ $t('sections.active') }}
        </button>
        <button 
          class="quick-card-btn"
          @click="quickAddCard('pipeline')"
        >
          <span class="card-preview tag-pipeline"></span>
          {{ $t('sections.pipeline') }}
        </button>
        <button 
          class="quick-card-btn"
          @click="quickAddCard('done')"
        >
          <span class="card-preview tag-done"></span>
          {{ $t('sections.done') }}
        </button>
      </div>

      <!-- Actions -->
      <div class="toolbar-section">
        <div class="section-label">{{ $t('editor.actions') }}</div>
        
        <button class="action-btn" @click="$emit('save')">
          <span class="action-icon">💾</span>
          {{ $t('editor.save') }}
        </button>
        
        <button class="action-btn" @click="$emit('undo')">
          <span class="action-icon">↶</span>
          {{ $t('editor.undo') }}
        </button>
        
        <button class="action-btn" @click="$emit('redo')">
          <span class="action-icon">↷</span>
          {{ $t('editor.redo') }}
        </button>
      </div>

      <!-- Zoom controls -->
      <div class="toolbar-section zoom-section">
        <div class="section-label">Zoom</div>
        <div class="zoom-controls">
          <button @click="$emit('zoom-out')">−</button>
          <span class="zoom-level">{{ Math.round(zoom * 100) }}%</span>
          <button @click="$emit('zoom-in')">+</button>
          <button @click="$emit('zoom-reset')">{{ $t('editor.reset') }}</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  activeTool: { type: String, default: 'select' },
  zoom: { type: Number, default: 1 },
  selectedConnectionType: { type: String, default: 'subProject' }
})

const emit = defineEmits(['update:activeTool', 'update:selectedConnectionType', 'save', 'undo', 'redo', 'zoom-in', 'zoom-out', 'zoom-reset', 'quick-add-card'])

const collapsed = ref(false)

const tools = [
  { type: 'select', icon: '🖱️' },
  { type: 'card', icon: '📄' },
  { type: 'text', icon: 'T' },
  { type: 'image', icon: '🖼️' },
  { type: 'link', icon: '🔗' },
  { type: 'note', icon: '📝' },
  { type: 'connection', icon: '↔️' }
]

const connectionTypes = [
  { name: 'subProject', label_key: 'connections.subProject', color: '#ff5f1f' },
  { name: 'related', label_key: 'connections.related', color: '#6a7d5b' },
  { name: 'inspiration', label_key: 'connections.inspiration', color: '#b55d3a' },
  { name: 'evolution', label_key: 'connections.evolution', color: '#508cdc' },
  { name: 'dependency', label_key: 'connections.dependency', color: '#9b59b6' },
  { name: 'reference', label_key: 'connections.reference', color: '#95a5a6' }
]

function selectTool(toolType) {
  emit('update:activeTool', toolType)
}

function quickAddCard(status) {
  emit('quick-add-card', status)
}
</script>

<style scoped>
.editor-toolbar {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 240px;
  background: rgba(20, 20, 18, 0.95);
  border: 2px solid var(--moss);
  border-radius: 8px;
  padding: 16px;
  z-index: 100;
  transition: all 0.3s;
  backdrop-filter: blur(8px);
}

.editor-toolbar.collapsed {
  width: 40px;
  padding: 8px;
}

.collapse-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--terracotta);
  border: none;
  color: var(--ink);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
}

.toolbar-section {
  margin-bottom: 20px;
}

.toolbar-section:last-child {
  margin-bottom: 0;
}

.section-label {
  font-family: 'Space Mono', monospace;
  font-size: 0.65rem;
  color: var(--moss-light);
  text-transform: uppercase;
  margin-bottom: 8px;
  letter-spacing: 0.1em;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--paper);
  cursor: pointer;
  margin-bottom: 6px;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--moss);
}

.tool-btn.active {
  background: rgba(106, 125, 91, 0.2);
  border-color: var(--moss);
}

.tool-icon {
  font-size: 1.2rem;
}

.tool-label {
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  text-transform: uppercase;
}

.connection-type-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--paper);
  cursor: pointer;
  margin-bottom: 4px;
  font-size: 0.65rem;
  font-family: 'Space Mono', monospace;
}

.connection-type-btn.active {
  background: rgba(255, 255, 255, 0.1);
}

.conn-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.quick-card-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--paper);
  cursor: pointer;
  margin-bottom: 4px;
  font-size: 0.65rem;
  font-family: 'Space Mono', monospace;
  text-transform: uppercase;
}

.card-preview {
  width: 16px;
  height: 16px;
  border: 2px solid;
}

.tag-active { border-color: #ff5f1f; background: rgba(255, 95, 31, 0.2); }
.tag-pipeline { border-color: #6a7d5b; background: rgba(106, 125, 91, 0.2); }
.tag-done { border-color: #b55d3a; background: rgba(181, 93, 58, 0.2); }

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--paper);
  cursor: pointer;
  margin-bottom: 4px;
  font-size: 0.65rem;
  font-family: 'Space Mono', monospace;
  text-transform: uppercase;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.action-icon {
  font-size: 1rem;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.zoom-controls button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: var(--paper);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
}

.zoom-controls button:hover {
  background: var(--terracotta);
  color: var(--ink);
}

.zoom-level {
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  color: var(--moss-light);
  min-width: 45px;
  text-align: center;
}
</style>
