<template>
  <div class="canvas-editor" :class="{ 'editing': isEditing }">
    <!-- Editor Toolbar -->
    <EditorToolbar
      v-if="canEdit"
      :activeTool="activeTool"
      :zoom="zoom"
      :selectedConnectionType="selectedConnectionType"
      @update:activeTool="activeTool = $event"
      @update:selectedConnectionType="selectedConnectionType = $event"
      @save="saveCanvas"
      @undo="undo"
      @redo="redo"
      @zoom-in="zoomIn"
      @zoom-out="zoomOut"
      @zoom-reset="resetZoom"
      @quick-add-card="quickAddCard"
    />

    <!-- Canvas Area -->
    <div 
      ref="canvasRef"
      class="editor-canvas"
      :class="{ 'tool-select': activeTool === 'select', 'tool-drag': isDragging }"
      @mousedown="onCanvasMouseDown"
      @mousemove="onCanvasMouseMove"
      @mouseup="onCanvasMouseUp"
      @mouseleave="onCanvasMouseLeave"
      @wheel="onWheel"
    >
      <!-- Grid Background -->
      <div class="canvas-grid" :style="gridStyle"></div>

      <!-- Connection Lines Layer -->
      <svg class="connections-layer">
        <g v-for="connection in connections" :key="connection.id">
          <line
            :x1="connection.x1"
            :y1="connection.y1"
            :x2="connection.x2"
            :y2="connection.y2"
            :stroke="connection.color"
            :stroke-width="3"
            :stroke-dasharray="getStrokePattern(connection.type)"
            :marker-end="getArrowMarker(connection.type)"
            class="connection-line"
            :class="{ selected: selectedElementId === connection.id }"
            @click="selectElement(connection)"
          />
          <!-- Connection label -->
          <foreignObject
            :x="(connection.x1 + connection.x2) / 2 - 50"
            :y="(connection.y1 + connection.y2) / 2 - 12"
            width="100"
            height="24"
            v-if="showConnectionLabels"
          >
            <div class="connection-label">{{ getConnectionLabel(connection.type) }}</div>
          </foreignObject>
        </g>
      </svg>

      <!-- Elements Layer -->
      <div
        v-for="element in elements"
        :key="element.id"
        class="canvas-element"
        :class="[
          `type-${element.type}`,
          { selected: selectedElementId === element.id },
          { dragging: draggingElementId === element.id }
        ]"
        :style="getElementStyle(element)"
        @mousedown.stop="onElementMouseDown($event, element)"
        @dblclick.stop="editElement(element)"
      >
        <!-- Card Element -->
        <template v-if="element.type === 'card'">
          <div class="element-card" :class="'status-' + element.content?.status">
            <div class="card-status-tag">{{ element.content?.status || 'active' }}</div>
            <h3 class="card-title">{{ element.content?.title || 'Untitled Card' }}</h3>
            <p class="card-description">{{ element.content?.description || '' }}</p>
          </div>
        </template>

        <!-- Text Element -->
        <template v-else-if="element.type === 'text'">
          <div class="element-text" v-html="element.content?.html || element.content?.text"></div>
        </template>

        <!-- Image Element -->
        <template v-else-if="element.type === 'image'">
          <img :src="element.content?.url" :alt="element.content?.caption" class="element-image" />
          <div v-if="element.content?.caption" class="image-caption">{{ element.content.caption }}</div>
        </template>

        <!-- Link Element -->
        <template v-else-if="element.type === 'link'">
          <a :href="element.content?.url" target="_blank" class="element-link">
            <span class="link-icon">🔗</span>
            {{ element.content?.label || element.content?.url }}
          </a>
        </template>

        <!-- Note Element -->
        <template v-else-if="element.type === 'note'">
          <div class="element-note">
            <div class="note-content">{{ element.content?.text }}</div>
          </div>
        </template>

        <!-- Resize handles (when selected and can edit) -->
        <div v-if="selectedElementId === element.id && canEdit" class="resize-handles">
          <div class="resize-handle nw" @mousedown.stop="startResize($event, element, 'nw')"></div>
          <div class="resize-handle ne" @mousedown.stop="startResize($event, element, 'ne')"></div>
          <div class="resize-handle sw" @mousedown.stop="startResize($event, element, 'sw')"></div>
          <div class="resize-handle se" @mousedown.stop="startResize($event, element, 'se')"></div>
        </div>

        <!-- Delete button (when selected and can edit) -->
        <button 
          v-if="selectedElementId === element.id && canEdit"
          class="delete-element-btn"
          @click.stop="deleteElement(element)"
        >×</button>
      </div>

      <!-- Drag preview for new elements -->
      <div
        v-if="isCreatingElement"
        class="drag-preview"
        :style="dragPreviewStyle"
      >
        <div class="preview-placeholder">+ {{ activeTool }}</div>
      </div>
    </div>

    <!-- Properties Panel (when element is selected) -->
    <div v-if="selectedElement && canEdit" class="properties-panel">
      <div class="panel-header">
        <span>{{ $t('editor.properties') }}</span>
        <button @click="selectedElement = null">×</button>
      </div>
      
      <div class="panel-content">
        <!-- Title/Text input -->
        <div v-if="selectedElement.type === 'card' || selectedElement.type === 'text'" class="prop-group">
          <label>{{ $t('editor.title') }}</label>
          <input 
            v-model="selectedElement.content.title" 
            @change="updateElement(selectedElement)"
            class="prop-input"
          />
        </div>

        <!-- Description textarea -->
        <div v-if="selectedElement.type === 'card'" class="prop-group">
          <label>{{ $t('editor.description') }}</label>
          <textarea 
            v-model="selectedElement.content.description"
            @change="updateElement(selectedElement)"
            class="prop-textarea"
            rows="3"
          ></textarea>
        </div>

        <!-- Status selector -->
        <div v-if="selectedElement.type === 'card'" class="prop-group">
          <label>Status</label>
          <select 
            v-model="selectedElement.content.status"
            @change="updateElement(selectedElement)"
            class="prop-select"
          >
            <option value="active">Active</option>
            <option value="pipeline">Pipeline</option>
            <option value="done">Done</option>
          </select>
        </div>

        <!-- URL input for images/links -->
        <div v-if="selectedElement.type === 'image' || selectedElement.type === 'link'" class="prop-group">
          <label>URL</label>
          <input 
            v-model="selectedElement.content.url"
            @change="updateElement(selectedElement)"
            class="prop-input"
            placeholder="https://..."
          />
        </div>

        <!-- Position inputs -->
        <div class="prop-row">
          <div class="prop-group">
            <label>X</label>
            <input 
              type="number"
              v-model.number="selectedElement.position_x"
              @change="updateElement(selectedElement)"
              class="prop-input-small"
            />
          </div>
          <div class="prop-group">
            <label>Y</label>
            <input 
              type="number"
              v-model.number="selectedElement.position_y"
              @change="updateElement(selectedElement)"
              class="prop-input-small"
            />
          </div>
        </div>

        <!-- Size inputs -->
        <div class="prop-row">
          <div class="prop-group">
            <label>W</label>
            <input 
              type="number"
              v-model.number="selectedElement.width"
              @change="updateElement(selectedElement)"
              class="prop-input-small"
            />
          </div>
          <div class="prop-group">
            <label>H</label>
            <input 
              type="number"
              v-model.number="selectedElement.height"
              @change="updateElement(selectedElement)"
              class="prop-input-small"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Edit mode indicator -->
    <div v-if="!canEdit" class="read-only-badge">
      👁️ {{ $t('editor.readOnly') }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { useGalleryStore } from '../../stores/gallery'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import EditorToolbar from './EditorToolbar.vue'

const { t } = useI18n()
const auth = useAuthStore()
const galleryStore = useGalleryStore()

const props = defineProps({
  projectId: { type: String, required: true },
  canEdit: { type: Boolean, default: false }
})

// State
const canvasRef = ref(null)
const isEditing = ref(false)
const activeTool = ref('select') // select, card, text, image, link, note, connection
const zoom = ref(1)
const selectedConnectionType = ref('subProject')

const elements = ref([])
const connections = ref([])
const selectedElement = ref(null)
const selectedElementId = ref(null)
const draggingElementId = ref(null)
const isCreatingElement = ref(false)
const dragStartPos = ref({ x: 0, y: 0 })
const dragCurrentPos = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const resizingElement = ref(null)
const resizeHandle = ref(null)

// Computed
const gridStyle = computed(() => ({
  transform: `scale(${zoom.value})`,
  backgroundSize: `${50 * zoom.value}px ${50 * zoom.value}px`
}))

const dragPreviewStyle = computed(() => ({
  left: `${dragCurrentPos.value.x}px`,
  top: `${dragCurrentPos.value.y}px`,
  transform: `scale(${zoom.value})`
}))

// Methods
function getElementStyle(element) {
  return {
    left: `${element.position_x}px`,
    top: `${element.position_y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    transform: `rotate(${element.rotation || 0}deg) scale(${zoom.value})`,
    zIndex: element.z_index || 0
  }
}

function getStrokePattern(type) {
  const patterns = {
    solid: 'none',
    dashed: '10,5',
    dotted: '3,3'
  }
  const connType = connectionTypes.find(ct => ct.name === type)
  return patterns[connType?.stroke_pattern || 'solid']
}

function getArrowMarker(type) {
  const connType = connectionTypes.find(ct => ct.name === type)
  if (connType?.arrow_style === 'none') return ''
  return 'url(#arrowhead)'
}

function getConnectionLabel(type) {
  const connType = connectionTypes.find(ct => ct.name === type)
  return t(connType?.label_key || type)
}

// Mouse handlers
function onCanvasMouseDown(e) {
  if (e.button !== 0) return // Only left click
  
  dragStartPos.value = { x: e.clientX, y: e.clientY }
  
  if (activeTool.value !== 'select') {
    isCreatingElement.value = true
  } else {
    isDragging.value = true
  }
}

function onCanvasMouseMove(e) {
  dragCurrentPos.value = { x: e.clientX, y: e.clientY }
  
  if (isCreatingElement.value) {
    // Update drag preview position
  } else if (isDragging.value && activeTool.value === 'select') {
    // Pan canvas
  } else if (draggingElementId.value) {
    // Move element
    const element = elements.value.find(el => el.id === draggingElementId.value)
    if (element) {
      const dx = (e.movementX || 0) / zoom.value
      const dy = (e.movementY || 0) / zoom.value
      element.position_x += dx
      element.position_y += dy
    }
  } else if (resizingElement.value) {
    // Resize element
    handleResize(e)
  }
}

function onCanvasMouseUp(e) {
  if (isCreatingElement.value) {
    // Create new element at position
    createNewElement(dragCurrentPos.value)
  }
  
  isCreatingElement.value = false
  isDragging.value = false
  draggingElementId.value = null
  resizingElement.value = null
}

function onCanvasMouseLeave() {
  isCreatingElement.value = false
  isDragging.value = false
}

function onElementMouseDown(e, element) {
  if (e.button !== 0) return
  
  e.stopPropagation()
  selectElement(element)
  
  if (activeTool.value === 'select') {
    draggingElementId.value = element.id
  }
}

function onWheel(e) {
  if (e.ctrlKey) {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    zoom.value = Math.max(0.25, Math.min(3, zoom.value + delta))
  }
}

// Element operations
function selectElement(element) {
  selectedElement.value = element
  selectedElementId.value = element?.id || null
}

function createNewElement(position) {
  const newElement = {
    id: crypto.randomUUID(),
    project_id: props.projectId,
    type: activeTool.value,
    content: getDefaultContent(activeTool.value),
    position_x: position.x / zoom.value,
    position_y: position.y / zoom.value,
    width: getDefaultSize(activeTool.value).width,
    height: getDefaultSize(activeTool.value).height,
    rotation: 0,
    z_index: elements.value.length,
    created_by: auth.userId
  }
  
  elements.value.push(newElement)
  selectElement(newElement)
  activeTool.value = 'select'
}

function getDefaultContent(type) {
  switch(type) {
    case 'card': return { title: '', description: '', status: 'active' }
    case 'text': return { text: 'New text block', html: '<p>New text block</p>' }
    case 'image': return { url: '', caption: '' }
    case 'link': return { url: 'https://', label: '' }
    case 'note': return { text: 'Note text...' }
    default: return {}
  }
}

function getDefaultSize(type) {
  const sizes = {
    card: { width: 300, height: 200 },
    text: { width: 400, height: 100 },
    image: { width: 400, height: 300 },
    link: { width: 300, height: 60 },
    note: { width: 250, height: 150 }
  }
  return sizes[type] || { width: 300, height: 200 }
}

function updateElement(element) {
  // Mark for saving
  saveCanvas()
}

function deleteElement(element) {
  const index = elements.value.findIndex(el => el.id === element.id)
  if (index > -1) {
    elements.value.splice(index, 1)
    selectedElement.value = null
    selectedElementId.value = null
    saveCanvas()
  }
}

function editElement(element) {
  if (!props.canEdit) return
  selectElement(element)
  // Could open a modal editor here
}

// Resize
function startResize(e, element, handle) {
  resizingElement.value = element
  resizeHandle.value = handle
}

function handleResize(e) {
  if (!resizingElement.value) return
  
  const el = resizingElement.value
  const dx = (e.movementX || 0) / zoom.value
  const dy = (e.movementY || 0) / zoom.value
  
  if (resizeHandle.value.includes('e')) {
    el.width += dx
  }
  if (resizeHandle.value.includes('w')) {
    el.width -= dx
    el.position_x += dx
  }
  if (resizeHandle.value.includes('s')) {
    el.height += dy
  }
  if (resizeHandle.value.includes('n')) {
    el.height -= dy
    el.position_y += dy
  }
  
  el.width = Math.max(100, el.width)
  el.height = Math.max(50, el.height)
}

// Zoom controls
function zoomIn() {
  zoom.value = Math.min(3, zoom.value + 0.25)
}

function zoomOut() {
  zoom.value = Math.max(0.25, zoom.value - 0.25)
}

function resetZoom() {
  zoom.value = 1
}

// Quick add card
function quickAddCard(status) {
  activeTool.value = 'card'
  // User clicks on canvas to place
}

// Save/Load
async function loadElements() {
  if (!isSupabaseConfigured) return
  
  const { data, error } = await supabase
    .from('canvas_elements')
    .select('*')
    .eq('project_id', props.projectId)
    .order('z_index')
  
  if (error) {
    console.error('[CanvasEditor] Load error:', error)
    return
  }
  
  elements.value = data || []
  loadConnections()
}

function loadConnections() {
  // Build connections from elements with parent_id
  connections.value = elements.value
    .filter(el => el.parent_id && el.type === 'connection')
    .map(el => {
      const parent = elements.value.find(p => p.id === el.parent_id)
      return {
        id: el.id,
        x1: parent ? parent.position_x + parent.width / 2 : 0,
        y1: parent ? parent.position_y + parent.height / 2 : 0,
        x2: el.position_x + el.width / 2,
        y2: el.position_y + el.height / 2,
        type: el.connection_type,
        color: getConnectionColor(el.connection_type)
      }
    })
}

function getConnectionColor(type) {
  const connType = connectionTypes.find(ct => ct.name === type)
  return connType?.color || '#b55d3a'
}

async function saveCanvas() {
  if (!isSupabaseConfigured || !props.canEdit) return
  
  // Save all elements (upsert)
  for (const el of elements.value) {
    await supabase
      .from('canvas_elements')
      .upsert({
        ...el,
        updated_at: new Date().toISOString()
      })
  }
  
  console.log('[CanvasEditor] Saved', elements.value.length, 'elements')
}

function undo() {
  // Implement undo history
  console.log('Undo')
}

function redo() {
  // Implement redo
  console.log('Redo')
}

// Lifecycle
onMounted(() => {
  loadElements()
  isEditing.value = true
})

onUnmounted(() => {
  isEditing.value = false
})

// Connection types reference
const connectionTypes = [
  { name: 'subProject', label_key: 'connections.subProject', color: '#ff5f1f', stroke_pattern: 'solid', arrow_style: 'classic' },
  { name: 'related', label_key: 'connections.related', color: '#6a7d5b', stroke_pattern: 'dashed', arrow_style: 'classic' },
  { name: 'inspiration', label_key: 'connections.inspiration', color: '#b55d3a', stroke_pattern: 'dotted', arrow_style: 'arrow' },
  { name: 'evolution', label_key: 'connections.evolution', color: '#508cdc', stroke_pattern: 'solid', arrow_style: 'arrow' },
  { name: 'dependency', label_key: 'connections.dependency', color: '#9b59b6', stroke_pattern: 'dashed', arrow_style: 'arrow' },
  { name: 'reference', label_key: 'connections.reference', color: '#95a5a6', stroke_pattern: 'dotted', arrow_style: 'none' }
]

// Expose methods
defineExpose({
  saveCanvas,
  loadElements,
  zoomIn,
  zoomOut,
  resetZoom
})
</script>

<style scoped>
.canvas-editor {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.editor-canvas {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: auto;
  cursor: crosshair;
}

.editor-canvas.tool-select {
  cursor: default;
}

.canvas-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(106, 125, 91, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(106, 125, 91, 0.1) 1px, transparent 1px);
  pointer-events: none;
}

.connections-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.connection-line {
  pointer-events: stroke;
  cursor: pointer;
  transition: stroke-width 0.2s;
}

.connection-line:hover {
  stroke-width: 5;
}

.connection-line.selected {
  stroke-width: 5;
  filter: drop-shadow(0 0 3px currentColor);
}

.connection-label {
  font-family: 'Space Mono', monospace;
  font-size: 0.6rem;
  color: var(--paper);
  background: rgba(0, 0, 0, 0.7);
  padding: 2px 6px;
  border-radius: 3px;
  text-align: center;
}

.canvas-element {
  position: absolute;
  transition: box-shadow 0.2s;
}

.canvas-element.selected {
  outline: 2px solid var(--terracotta);
  outline-offset: 2px;
}

.canvas-element.dragging {
  opacity: 0.8;
  cursor: grabbing;
}

.element-card {
  width: 100%;
  height: 100%;
  background: rgba(20, 20, 18, 0.95);
  border: 1px solid var(--moss);
  padding: 16px;
  overflow: hidden;
}

.card-status-tag {
  display: inline-block;
  padding: 4px 8px;
  font-size: 0.6rem;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 8px;
  font-family: 'Space Mono', monospace;
}

.status-active .card-status-tag { background: rgba(255, 95, 31, 0.2); color: #ff5f1f; }
.status-pipeline .card-status-tag { background: rgba(106, 125, 91, 0.2); color: #6a7d5b; }
.status-done .card-status-tag { background: rgba(181, 93, 58, 0.2); color: #b55d3a; }

.card-title {
  font-size: 1rem;
  font-weight: bold;
  color: var(--paper);
  margin-bottom: 8px;
}

.card-description {
  font-size: 0.8rem;
  color: var(--paper);
  opacity: 0.8;
  line-height: 1.4;
}

.element-text {
  width: 100%;
  height: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--paper);
  font-size: 0.9rem;
  line-height: 1.6;
}

.element-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: var(--paper);
  font-size: 0.75rem;
  padding: 4px 8px;
}

.element-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(106, 125, 91, 0.15);
  border: 1px solid var(--moss);
  color: var(--paper);
  text-decoration: none;
  font-size: 0.85rem;
}

.element-link:hover {
  background: rgba(106, 125, 91, 0.3);
}

.element-note {
  width: 100%;
  height: 100%;
  background: #fef3c7;
  padding: 12px;
  color: #1f2937;
  font-size: 0.9rem;
  writing-mode: vertical-rl;
}

.resize-handles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: var(--terracotta);
  border: 1px solid var(--paper);
  pointer-events: auto;
  cursor: nwse-resize;
}

.resize-handle.nw { top: -5px; left: -5px; cursor: nwse-resize; }
.resize-handle.ne { top: -5px; right: -5px; cursor: nesw-resize; }
.resize-handle.sw { bottom: -5px; left: -5px; cursor: nesw-resize; }
.resize-handle.se { bottom: -5px; right: -5px; cursor: nwse-resize; }

.delete-element-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 20px;
  height: 20px;
  background: #ef4444;
  border: 1px solid var(--paper);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  z-index: 10;
}

.drag-preview {
  position: absolute;
  width: 200px;
  height: 150px;
  border: 2px dashed var(--terracotta);
  background: rgba(255, 95, 31, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.preview-placeholder {
  font-family: 'Space Mono', monospace;
  font-size: 0.8rem;
  color: var(--terracotta);
  text-transform: uppercase;
}

.properties-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 280px;
  background: rgba(20, 20, 18, 0.95);
  border: 2px solid var(--moss);
  border-radius: 8px;
  padding: 16px;
  z-index: 100;
  backdrop-filter: blur(8px);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--moss);
}

.panel-header span {
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  color: var(--moss-light);
  text-transform: uppercase;
}

.panel-header button {
  background: none;
  border: none;
  color: var(--paper);
  font-size: 1.2rem;
  cursor: pointer;
}

.prop-group {
  margin-bottom: 12px;
}

.prop-group label {
  display: block;
  font-family: 'Space Mono', monospace;
  font-size: 0.65rem;
  color: var(--moss-light);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.prop-input,
.prop-textarea,
.prop-select {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--moss);
  color: var(--paper);
  padding: 8px;
  font-family: inherit;
  font-size: 0.8rem;
}

.prop-input:focus,
.prop-textarea:focus,
.prop-select:focus {
  outline: none;
  border-color: var(--terracotta);
}

.prop-row {
  display: flex;
  gap: 8px;
}

.prop-input-small {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--moss);
  color: var(--paper);
  padding: 6px;
  font-size: 0.75rem;
}

.read-only-badge {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid var(--moss);
  padding: 8px 16px;
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  color: var(--moss-light);
  text-transform: uppercase;
}
</style>
