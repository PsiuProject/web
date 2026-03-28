<template>
  <div
    class="canvas-card"
    :class="{ selected: isSelected, 'drag-over': isDragOver }"
    :style="cardStyle"
    @click.stop="$emit('click', element)"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop.prevent="onDrop"
    @contextmenu.prevent="onCardRightClick"
  >
    <!-- Resize handles -->
    <template v-if="isSelected && isEditMode">
      <div
        v-for="handle in resizeHandles"
        :key="handle"
        class="resize-handle"
        :class="handle"
        @mousedown.stop="onResizeStart($event, handle)"
      />
    </template>

    <!-- Card title -->
    <div
      ref="titleRef"
      class="card-title"
      :contenteditable="isEditMode ? 'true' : 'false'"
      @blur="saveTitle"
      @keydown.enter.prevent="$event.target.blur()"
      @click.stop
      @mousedown.stop
      :data-placeholder="'Card Title'"
    />

    <!-- Cells container -->
    <div class="card-cells" ref="cellsRef">
      <div
        v-for="(cell, idx) in cells"
        :key="cell.id"
        class="card-cell"
        :class="{
          'drag-over': dragOverCell === idx,
          empty: !cell.type,
          dragging: draggingCellIdx === idx,
          'full-width': cell.width === 'full' || !cell.column,
          'half-width': cell.column === 'left' || cell.column === 'right'
        }"
        :style="cellWrapperStyle(cell, idx)"
        :draggable="isEditMode && cell.type"
        @dragstart.stop="onCellDragStart($event, idx)"
        @dragover.prevent="onCellDragOver($event, idx)"
        @dragleave="dragOverCell = null"
        @drop.prevent="onCellDrop($event, idx)"
        @dragend.stop="onCellDragEnd"
        @mousedown.stop
        @contextmenu.prevent="onCellRightClick($event, idx)"
      >
        <!-- Empty cell skeleton -->
        <template v-if="!cell.type">
          <div v-if="isEditMode" class="cell-skeleton" @click.stop="showCellMenu(idx)">
            <span class="cell-plus">+</span>
            <span class="cell-hint">Add element</span>
          </div>
        </template>

        <!-- Text cell -->
        <template v-else-if="cell.type === 'text'">
          <div
            class="cell-text"
            :style="cellTextStyle(cell)"
            :contenteditable="isEditMode"
            @blur="saveCellText(idx, $event)"
            @input="onCellTextInput(idx, $event)"
            @mouseup="updateCellToolbarPosition(idx)"
            @keyup="updateCellFormatState()"
            @click.stop="handleCellClick(idx)"
            @dblclick.stop="handleCellDoubleClick(idx)"
            v-html="getCellHTML(cell)"
          />
          <div
            v-if="isEditMode"
            class="cell-resize-handle bottom"
            @mousedown.stop="onCellResizeStart($event, idx)"
            title="Resize height"
          />
          <!-- Font size resize handle (bottom-right corner) -->
          <div
            v-if="isEditMode && (showCellToolbar || cellFormatStateHasSelection)"
            class="cell-font-size-handle"
            :style="cellFontSizeHandleStyle(idx)"
            @mousedown.stop.prevent="onCellFontSizeResizeStart($event, idx)"
            title="Drag to resize font size"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
            >
              <path d="M4 4h16v16" />
              <path d="M4 20l8-8" />
            </svg>
            <span class="font-size-preview">{{ cell.fontSize || 14 }}</span>
          </div>
        </template>

        <!-- Image cell -->
        <template v-else-if="cell.type === 'image'">
          <img v-if="cell.url" :src="cell.url" class="cell-image" :style="cellImageStyle(cell)" />
          <div
            v-else
            class="cell-image-placeholder"
            @click.stop="isEditMode && triggerCellImageUpload(idx)"
          >
            <span>&#128247; Click to add image</span>
          </div>
          <input
            type="file"
            :ref="(el) => (cellFileInputs[idx] = el)"
            accept="image/*"
            @change="handleCellImageUpload($event, idx)"
            class="hidden-input"
          />
          <div
            v-if="isEditMode"
            class="cell-resize-handle bottom"
            @mousedown.stop="onCellResizeStart($event, idx)"
            title="Resize"
          />
        </template>

        <!-- Button cell -->
        <template v-else-if="cell.type === 'button'">
          <div class="cell-button-wrapper">
            <a
              :href="cell.url || '#'"
              class="cell-button"
              :style="cellButtonStyle(cell)"
              :contenteditable="isEditMode"
              @click.prevent="isEditMode ? null : openLink(cell.url)"
              @blur="saveCellButtonText(idx, $event)"
            >
              {{ getCellText(cell) || 'Button' }}
            </a>
          </div>
          <div v-if="isEditMode && !cell.url" class="cell-url-input">
            <input
              type="text"
              placeholder="Button URL..."
              :value="cell.url || ''"
              @blur="saveCellUrl(idx, $event)"
              @keydown.enter="$event.target.blur()"
            />
          </div>
          <div
            v-if="isEditMode"
            class="cell-resize-handle bottom"
            @mousedown.stop="onCellResizeStart($event, idx)"
            title="Resize"
          />
        </template>

        <!-- Link cell -->
        <template v-else-if="cell.type === 'link'">
          <div class="cell-link-wrapper">
            <input
              v-if="isEditMode"
              type="text"
              class="cell-link-input"
              placeholder="Link text..."
              :value="getCellText(cell)"
              @blur="saveCellText(idx, $event)"
            />
            <input
              v-if="isEditMode"
              type="text"
              class="cell-link-input"
              placeholder="URL..."
              :value="cell.url || ''"
              @blur="saveCellUrl(idx, $event)"
            />
            <a
              v-if="!isEditMode"
              :href="cell.url || '#'"
              class="cell-link"
              target="_blank"
              rel="noopener"
            >
              {{ getCellText(cell) || cell.url || 'Link' }}
            </a>
          </div>
        </template>

        <!-- Card cell (nested card) -->
        <template v-else-if="cell.type === 'card'">
          <div class="cell-nested-card">
            <Card
              :element="getCellCardData(cell)"
              :isSelected="false"
              :isEditMode="isEditMode"
              @click.stop
              @port-click.stop
              @port-drag-start.stop
              @port-hover.stop
              @port-leave.stop
            />
          </div>
        </template>

        <!-- Cell actions (edit mode) -->
        <div v-if="isEditMode && cell.type" class="cell-actions">
          <button class="cell-action-btn" @click.stop="removeCell(idx)" title="Remove">
            &times;
          </button>
          <button class="cell-action-btn drag-handle" title="Drag to reorder">&#8942;</button>
        </div>
      </div>

      <!-- Add cell button -->
      <button v-if="isEditMode" class="add-cell-btn" @click.stop="addEmptyCell">
        <span class="plus">+</span>
        Add Cell
      </button>
    </div>

    <!-- Floating toolbar for card cell text formatting -->
    <Teleport to="body">
      <div
        v-if="showCellToolbar && isEditMode"
        class="cell-format-toolbar"
        :style="cellToolbarStyle"
      >
        <div class="toolbar-group">
          <button
            @mousedown.prevent="toggleCellFormat('bold')"
            :class="{ active: cellFormatState.bold }"
            title="Bold"
            class="tb-btn"
          >
            <b>B</b>
          </button>
          <button
            @mousedown.prevent="toggleCellFormat('italic')"
            :class="{ active: cellFormatState.italic }"
            title="Italic"
            class="tb-btn"
          >
            <i>I</i>
          </button>
          <button
            @mousedown.prevent="toggleCellFormat('underline')"
            :class="{ active: cellFormatState.underline }"
            title="Underline"
            class="tb-btn"
          >
            <u>U</u>
          </button>
          <button
            @mousedown.prevent="toggleCellFormat('strikeThrough')"
            :class="{ active: cellFormatState.strikeThrough }"
            title="Strikethrough"
            class="tb-btn"
          >
            <s>S</s>
          </button>
        </div>
        <div class="toolbar-divider"></div>
        <div class="toolbar-group font-size-group">
          <button
            @mousedown.prevent="decreaseCellFontSize"
            title="Decrease Font Size"
            class="tb-btn tb-icon"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path d="M4 7V4h16v3M9 20h6M12 4v16" />
              <line x1="4" y1="18" x2="9" y2="18" />
            </svg>
          </button>
          <span class="font-size-display">{{ currentCellFontSize }}</span>
          <button
            @mousedown.prevent="increaseCellFontSize"
            title="Increase Font Size"
            class="tb-btn tb-icon"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path d="M4 7V4h16v3M9 20h6M12 4v16" />
              <line x1="4" y1="18" x2="9" y2="18" />
              <line x1="6.5" y1="15.5" x2="6.5" y2="20.5" />
            </svg>
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Cell type menu -->
    <Teleport to="body">
      <div v-if="cellMenuIdx !== null" class="cell-type-menu" :style="cellMenuStyle" @click.stop>
        <div class="menu-header">Select Element Type</div>
        <button v-for="t in cellTypes" :key="t.type" @click="setCellType(cellMenuIdx, t.type)">
          <span class="menu-icon">{{ t.icon }}</span>
          <span class="menu-label">{{ t.label }}</span>
        </button>
        <button @click="cellMenuIdx = null" class="menu-cancel">Cancel</button>
      </div>
    </Teleport>

    <!-- Connection type picker popup -->
    <ConnectionTypePicker
      :is-visible="showConnectionPicker"
      :position="connectionPickerPosition"
      :initial-type="selectedConnectionType"
      :initial-color="selectedConnectionColor"
      @apply="onConnectionTypeApply"
      @close="onConnectionPickerClose"
    />

    <!-- Context Menu for right-click -->
    <ContextMenu
      :is-visible="cellContextMenuVisible"
      :x="cellContextMenuPosition.x"
      :y="cellContextMenuPosition.y"
      :items="cellContextMenuItems"
      @update:is-visible="
        (val) => {
          if (!val) hideCellContextMenu()
        }
      "
      @action="handleCellContextMenuAction"
    />

    <!-- Drop indicator -->
    <div v-if="isDragOver" class="drop-indicator">
      <span>Drop here to add to card</span>
    </div>

    <!-- Connection ports (visible in connection mode) -->
    <template v-if="showPorts">
      <ConnectionPort
        v-for="side in ['top', 'bottom', 'left', 'right']"
        :key="`port-${side}`"
        :side="side"
        :element="element"
        :color="portColor"
        :is-highlighted="
          highlightedPort?.elementId === element.id && highlightedPort?.side === side
        "
        @mousedown.stop
        @click="$emit('port-click', { element, side })"
        @drag-start="$emit('port-drag-start', { element, side, color: portColor })"
        @hover="$emit('port-hover', { element, side })"
        @leave="$emit('port-leave', { element, side })"
      />
    </template>

    <!-- Card context menu -->
    <ContextMenu
      :is-visible="cardContextMenuVisible"
      :x="cardContextMenuPosition.x"
      :y="cardContextMenuPosition.y"
      :items="cardContextMenuItems"
      @update:is-visible="
        (val) => {
          if (!val) hideCardContextMenu()
        }
      "
      @action="handleCardContextMenuAction"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18nStore } from '../../../stores/i18n-store'
import { useElementsStore } from '../../../stores/elements'
import { useViewportStore } from '../../../stores/viewport'
import { usePermissionsStore } from '../../../stores/permissions'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'
import { useRoute } from 'vue-router'
import { sanitizeHTML, getSafeInnerHTML } from '../../../lib/safeHTML'
import ConnectionPort from './ConnectionPort.vue'
import ContextMenu from '../../UI/ContextMenu.vue'
import ConnectionTypePicker from '../Editor/ConnectionTypePicker.vue'
import { useContextMenu, MenuItems } from '../../../composables/useContextMenu'

const i18nStore = useI18nStore()
const route = useRoute()
const permissions = usePermissionsStore()

const props = defineProps({
  element: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
  isEditMode: { type: Boolean, default: false },
  showPorts: { type: Boolean, default: false },
  highlightedPort: { type: Object, default: null }
})

const emit = defineEmits([
  'click',
  'dblclick',
  'port-click',
  'port-drag-start',
  'port-hover',
  'port-leave'
])

const elements = useElementsStore()
const viewport = useViewportStore()

const cellsRef = ref(null)
const titleRef = ref(null)
const cellMenuIdx = ref(null)
const cellMenuPosition = ref({ x: 0, y: 0 })
const dragOverCell = ref(null)
const isDragOver = ref(false)
const cellFileInputs = ref({})
const draggingCellIdx = ref(null)
const showCellToolbar = ref(false)
const cellToolbarPosition = ref({ x: 0, y: 0 })
const currentCellIdx = ref(null)
const cellFormatState = ref({ bold: false, italic: false, underline: false, strikeThrough: false })
const currentCellFontSize = ref(14)
const cellInlineEditingIdx = ref(null) // Track which cell is being inline edited
const cellFormatStateHasSelection = ref(false) // Track if there's a text selection

// Context menu for cells - using inline state management
const cellContextMenuVisible = ref(false)
const cellContextMenuPosition = ref({ x: 0, y: 0 })
const cellContextMenuItems = ref([])
const currentRightClickCellIdx = ref(null)

// Card context menu
const cardContextMenuVisible = ref(false)
const cardContextMenuPosition = ref({ x: 0, y: 0 })
const cardContextMenuItems = ref([])

// Connection type picker
const showConnectionPicker = ref(false)
const connectionPickerPosition = ref({ x: 0, y: 0 })
const selectedConnectionType = ref('subProject')
const selectedConnectionColor = ref('#b55d3a')

function showCellContextMenu(x, y, items, title = '') {
  cellContextMenuPosition.value = { x, y }
  cellContextMenuItems.value = items || []
  cellContextMenuVisible.value = true
}

function hideCellContextMenu() {
  cellContextMenuVisible.value = false
  currentRightClickCellIdx.value = null
}

function onCardRightClick(e) {
  e.preventDefault()
  cardContextMenuPosition.value = { x: e.clientX, y: e.clientY }
  cardContextMenuItems.value = MenuItems.card(props.element, permissions)
  showCardContextMenu()
}

function showCardContextMenu() {
  cardContextMenuVisible.value = true
}

function hideCardContextMenu() {
  cardContextMenuVisible.value = false
}

function handleCardContextMenuAction(action) {
  switch (action) {
    case 'edit-card':
      elements.selectElement(props.element.id)
      break
    case 'duplicate-card':
      duplicateCard()
      break
    case 'bring-front':
      elements.updateElement(props.element.id, { z_index: (props.element.z_index || 0) + 1 })
      break
    case 'send-back':
      elements.updateElement(props.element.id, {
        z_index: Math.max(0, (props.element.z_index || 0) - 1)
      })
      break
    case 'connection-type':
      // Open connection type picker
      showConnectionPicker.value = true
      connectionPickerPosition.value = cardContextMenuPosition.value
      selectedConnectionType.value = props.element.content?.connectionType || 'subProject'
      selectedConnectionColor.value = props.element.style?.borderColor || '#b55d3a'
      break
    case 'delete-card':
      if (confirm('Delete this card?')) {
        history.push({ action: 'delete', elementId: props.element.id, state: { ...props.element } })
        elements.deleteElement(props.element.id)
      }
      break
  }
  hideCardContextMenu()
}

function onConnectionTypeApply({ type, color }) {
  // Update the card's connection type and color
  elements.updateElement(props.element.id, {
    content: { ...props.element.content, connectionType: type },
    style: { ...props.element.style, borderColor: color }
  })
  showConnectionPicker.value = false
}

function onConnectionPickerClose() {
  showConnectionPicker.value = false
}

function duplicateCard() {
  const newCard = {
    ...props.element,
    id: Date.now().toString(),
    position_x: props.element.position_x + 20,
    position_y: props.element.position_y + 20
  }
  elements.createElement(
    route.params.projectId,
    'card',
    { x: newCard.position_x, y: newCard.position_y },
    { width: newCard.width, height: newCard.height }
  )
}

const cellTypes = [
  { type: 'text', label: 'Text', icon: 'T' },
  { type: 'image', label: 'Image', icon: '&#128247;' },
  { type: 'button', label: 'Button', icon: '&#9744;' },
  { type: 'link', label: 'Link', icon: '&#128279;' },
  { type: 'card', label: 'Card', icon: '&#128446;' } // Add card as a cell type
]

const resizeHandles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']

// Cells are stored in element.content.cells
const cells = computed(() => props.element.content?.cells || [])

const cardTitle = computed(() => {
  const t = props.element.content?.title
  if (!t) return ''
  if (typeof t === 'object') return t[i18nStore.currentLocale] ?? t.pt ?? t.en ?? ''
  return t
})

const cardStyle = computed(() => {
  const el = props.element
  const style = el.style || {}

  // Build transform string with rotation and scale
  let transform = `rotate(${el.rotation || 0}deg)`
  if (style.scaleX && style.scaleX !== 1) {
    transform = `scaleX(${style.scaleX}) ${transform}`
  }
  if (style.scaleY && style.scaleY !== 1) {
    transform = `scaleY(${style.scaleY}) ${transform}`
  }

  // Build border radius CSS
  let borderRadius = '0'
  if (style.borderRadius) {
    if (typeof style.borderRadius === 'number') {
      borderRadius = `${style.borderRadius}px`
    } else if (typeof style.borderRadius === 'object') {
      const { topLeft = 0, topRight = 0, bottomRight = 0, bottomLeft = 0 } = style.borderRadius
      borderRadius = `${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px`
    } else if (typeof style.borderRadius === 'string') {
      borderRadius = style.borderRadius
    }
  }

  // Build box-shadow CSS
  let boxShadow = 'none'
  if (style.shadow) {
    const { x = 0, y = 4, blur = 8, spread = 0, color = '#000000', opacity = 0.25 } = style.shadow
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    boxShadow = `${x}px ${y}px ${blur}px ${spread}px rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  // Build border CSS
  const borderWidth = style.borderWidth || 0
  const borderColor = style.borderColor || 'var(--moss)'
  const borderStyle = style.borderStyle || 'solid'
  const border = borderWidth > 0 ? `${borderWidth}px ${borderStyle} ${borderColor}` : 'none'

  return {
    left: `${el.position_x}px`,
    top: `${el.position_y}px`,
    width: `${el.width}px`,
    minHeight: `${el.height}px`,
    background: style.background || 'rgba(20,20,18,0.95)',
    borderColor: borderColor,
    transform: transform,
    zIndex: el.z_index || 0,
    opacity: style.opacity ?? 1,
    borderRadius: borderRadius,
    boxShadow: boxShadow,
    border: border
  }
})

const cellMenuStyle = computed(() => ({
  position: 'fixed',
  left: `${cellMenuPosition.value.x}px`,
  top: `${cellMenuPosition.value.y}px`,
  zIndex: 9999
}))

const cellToolbarStyle = computed(() => ({
  position: 'fixed',
  left: `${cellToolbarPosition.value.x}px`,
  top: `${cellToolbarPosition.value.y}px`,
  zIndex: 9001
}))

// Font size resize handle style for cell text
const cellFontSizeHandleStyle = (idx) => {
  const cell = cells.value[idx]
  if (!cell) return {}

  // Position at bottom-right of cell text
  const fontSize = cell.fontSize || 14
  const scale = Math.max(0.8, Math.min(2, fontSize / 14)) // Scale based on font size

  return {
    transform: `scale(${scale})`,
    transformOrigin: 'bottom right'
  }
}

// Cell wrapper style for dynamic width layout
const cellWrapperStyle = (cell, idx) => {
  // If cell has column assignment (left/right), make it half width
  if (cell.column === 'left') {
    return {
      width: 'calc(50% - 4px)',
      marginRight: '4px',
      display: 'inline-block',
      verticalAlign: 'top'
    }
  }
  if (cell.column === 'right') {
    return {
      width: 'calc(50% - 4px)',
      marginLeft: '4px',
      display: 'inline-block',
      verticalAlign: 'top'
    }
  }
  // Default full width
  return {
    width: '100%',
    display: 'block'
  }
}

// Port color based on connection type or default
const portColor = computed(() => {
  // Default terracotta color, can be customized based on element's connection_type
  return props.element.color || '#b55d3a'
})

function getCellText(cell) {
  const t = cell.text
  if (!t) return ''
  if (typeof t === 'object') return t[i18nStore.currentLocale] ?? t.pt ?? t.en ?? ''
  return t
}

function getCellHTML(cell) {
  // Get HTML content from cell text, preserving formatting
  const t = cell.text
  if (!t) return ''
  if (typeof t === 'object') {
    const html = t[i18nStore.currentLocale] ?? t.pt ?? t.en ?? ''
    // If it contains HTML tags, sanitize and return
    if (html.includes('<')) {
      return sanitizeHTML(html)
    }
    // Otherwise convert newlines to <br>
    return html.replace(/\n/g, '<br>')
  }
  // Plain string - convert newlines to <br>
  return String(t).replace(/\n/g, '<br>')
}

function isCellInlineEditing(idx) {
  return cellInlineEditingIdx.value === idx
}

function getCellCardData(cell) {
  // Return a nested card element structure from cell data
  return {
    id: cell.cardId || `cell-card-${cell.id}`,
    type: 'card',
    content: {
      title: cell.cardTitle || { pt: 'Nested Card' },
      cells: cell.cardCells || []
    },
    style: cell.cardStyle || {
      background: 'rgba(30, 30, 28, 0.95)',
      borderColor: '#6a7d5b',
      borderWidth: 1
    },
    position_x: 0,
    position_y: 0,
    width: cell.cardWidth || 200,
    height: cell.cardHeight || 150,
    z_index: 0,
    rotation: 0
  }
}

function cellTextStyle(cell) {
  return {
    fontSize: `${cell.fontSize || 14}px`,
    color: cell.color || 'var(--paper)',
    fontWeight: cell.fontWeight || 'normal',
    fontStyle: cell.fontStyle || 'normal',
    minHeight: `${cell.height || 40}px`,
    lineHeight: cell.lineHeight || 1.5
  }
}

function cellImageStyle(cell) {
  return {
    width: '100%',
    height: `${cell.height || 120}px`,
    objectFit: cell.objectFit || 'cover'
  }
}

function cellButtonStyle(cell) {
  return {
    fontSize: `${cell.fontSize || 13}px`,
    background: cell.bgColor || 'var(--terracotta)',
    color: cell.color || 'var(--paper)',
    padding: `${cell.paddingV || 8}px ${cell.paddingH || 16}px`,
    borderRadius: `${cell.borderRadius || 2}px`
  }
}

function saveTitle(e) {
  const newTitle = e.target.innerText.trim()
  const current = props.element.content?.title
  let updated
  if (typeof current === 'object') updated = { ...current, [i18nStore.currentLocale]: newTitle }
  else updated = { pt: newTitle }
  elements.updateElement(props.element.id, {
    content: { ...props.element.content, title: updated }
  })
}

// Sync title ref without overwriting user edits mid-type
function syncTitle() {
  if (titleRef.value && document.activeElement !== titleRef.value) {
    titleRef.value.innerText = cardTitle.value
  }
}

onMounted(() => syncTitle())

// Cleanup function to prevent memory leaks from event listeners
let cleanupFns = []
const addCleanup = (fn) => {
  if (!cleanupFns.includes(fn)) cleanupFns.push(fn)
}

onUnmounted(() => {
  cleanupFns.forEach((fn) => fn())
  cleanupFns = []
})

watch(cardTitle, () => syncTitle())

function saveCells(newCells) {
  elements.updateElement(props.element.id, {
    content: { ...props.element.content, cells: newCells }
  })
}

function addEmptyCell() {
  const newCells = [...cells.value, { id: Date.now().toString(), type: null }]
  saveCells(newCells)
}

function removeCell(idx) {
  const newCells = cells.value.filter((_, i) => i !== idx)
  saveCells(newCells)
}

function showCellMenu(idx) {
  // Position menu near the cell
  const el = props.element
  const screenX =
    el.position_x * viewport.zoom + viewport.translateX + (el.width / 2) * viewport.zoom
  const screenY = el.position_y * viewport.zoom + viewport.translateY + 100 + idx * 60
  cellMenuPosition.value = {
    x: Math.min(screenX, window.innerWidth - 200),
    y: Math.min(screenY, window.innerHeight - 250)
  }
  cellMenuIdx.value = idx
}

function setCellType(idx, type) {
  const newCells = cells.value.map((c, i) => {
    if (i !== idx) return c
    const base = {
      ...c,
      type,
      height: type === 'image' ? 120 : type === 'button' ? 44 : type === 'card' ? 200 : 40
    }
    // Initialize card-specific data
    if (type === 'card') {
      base.cardId = Date.now().toString()
      base.cardTitle = { pt: 'Nested Card' }
      base.cardCells = []
      base.cardWidth = 200
      base.cardHeight = 150
    } else {
      base.text = { pt: '' }
    }
    return base
  })
  saveCells(newCells)
  cellMenuIdx.value = null
}

function onCellRightClick(e, idx) {
  e.preventDefault()
  currentRightClickCellIdx.value = idx
  const cell = cells.value[idx]

  // Get appropriate menu items based on cell type
  let menuItems = []
  if (!cell.type) {
    menuItems = MenuItems.textCell(cell, permissions) // Default to text menu for empty cells
  } else {
    switch (cell.type) {
      case 'text':
        menuItems = MenuItems.textCell(cell, permissions)
        break
      case 'image':
        menuItems = MenuItems.imageCell(cell, permissions)
        break
      case 'button':
        menuItems = MenuItems.buttonCell(cell, permissions)
        break
      case 'link':
        menuItems = MenuItems.linkCell(cell, permissions)
        break
      default:
        menuItems = MenuItems.textCell(cell, permissions)
    }
  }

  showCellContextMenu(e.clientX, e.clientY, menuItems, `Cell ${idx + 1}`)
}

function handleCellContextMenuAction(action) {
  if (currentRightClickCellIdx.value === null) return
  const idx = currentRightClickCellIdx.value
  const cell = cells.value[idx]

  switch (action) {
    case 'edit-text': {
      // Focus the cell text element
      const cellEl = document.querySelector(`.card-cell:nth-child(${idx + 1}) .cell-text`)
      if (cellEl) cellEl.focus()
      break
    }
    case 'format-bold':
      document.execCommand('bold', false, '')
      break
    case 'format-italic':
      document.execCommand('italic', false, '')
      break
    case 'format-underline':
      document.execCommand('underline', false, '')
      break
    case 'font-increase':
      if (cell.fontSize) cell.fontSize += 1
      else cell.fontSize = 15
      updateCell({ fontSize: cell.fontSize })
      break
    case 'font-decrease':
      if (cell.fontSize && cell.fontSize > 8) cell.fontSize -= 1
      updateCell({ fontSize: Math.max(8, cell.fontSize || 14) })
      break
    case 'delete-cell':
      removeCell(idx)
      break
    case 'replace-image':
      triggerCellImageUpload(idx)
      break
    case 'remove-image': {
      const newCells = cells.value.map((c, i) => (i === idx ? { ...c, url: '' } : c))
      saveCells(newCells)
      break
    }
    case 'fit-cover':
      updateCell({ objectFit: 'cover' })
      break
    case 'fit-contain':
      updateCell({ objectFit: 'contain' })
      break
    case 'edit-button':
    case 'edit-link':
    case 'edit-url':
      // Focus the appropriate input
      break
    case 'change-color': {
      // Open color picker for button cell
      const newColor = prompt('Enter color (hex):', cell.color || '#b55d3a')
      if (newColor) updateCell({ color: newColor })
      break
    }
    case 'open-original':
    case 'test-link':
    case 'open-new-tab':
      if (cell.url) window.open(cell.url, '_blank')
      break
    case 'copy-url':
      if (cell.url) navigator.clipboard.writeText(cell.url)
      break
    case 'align-left':
      updateCell({ textAlign: 'left' })
      break
    case 'align-center':
      updateCell({ textAlign: 'center' })
      break
    case 'align-right':
      updateCell({ textAlign: 'right' })
      break
    case 'layout-full':
      updateCell({ column: null, width: 'full' })
      break
    case 'layout-left':
      updateCell({ column: 'left' })
      break
    case 'layout-right':
      updateCell({ column: 'right' })
      break
  }

  currentRightClickCellIdx.value = null
}

function updateCell(updates) {
  if (currentRightClickCellIdx.value === null) return
  const newCells = cells.value.map((c, i) =>
    i === currentRightClickCellIdx.value ? { ...c, ...updates } : c
  )
  saveCells(newCells)
}

function saveCellText(idx, e) {
  const text = e.target.innerText || e.target.value
  const newCells = cells.value.map((c, i) => {
    if (i !== idx) return c
    const current = c.text
    let updated
    if (typeof current === 'object') updated = { ...current, [i18nStore.currentLocale]: text }
    else updated = { pt: text }
    return { ...c, text: updated }
  })
  saveCells(newCells)
}

function onCellTextInput(idx, e) {
  // Auto-adjust height based on content
  const scrollHeight = e.target.scrollHeight
  if (scrollHeight > (cells.value[idx].height || 40)) {
    const newCells = cells.value.map((c, i) => (i === idx ? { ...c, height: scrollHeight } : c))
    saveCells(newCells)
  }
}

function saveCellButtonText(idx, e) {
  const text = e.target.innerText
  const newCells = cells.value.map((c, i) => {
    if (i !== idx) return c
    const current = c.text
    let updated
    if (typeof current === 'object') updated = { ...current, [i18nStore.currentLocale]: text }
    else updated = { pt: text }
    return { ...c, text: updated }
  })
  saveCells(newCells)
}

function saveCellUrl(idx, e) {
  const url = e.target.value
  const newCells = cells.value.map((c, i) => (i === idx ? { ...c, url } : c))
  saveCells(newCells)
}

function triggerCellImageUpload(idx) {
  cellFileInputs.value[idx]?.click()
}

async function handleCellImageUpload(e, idx) {
  const file = e.target.files?.[0]
  if (!file || !isSupabaseConfigured) return
  const projectId = route.params.projectId
  const ext = file.name.split('.').pop()
  const path = `canvas/${projectId}/cell-${Date.now()}.${ext}`
  const { error } = await supabase.storage
    .from('uploads')
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) return
  const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(path)
  if (urlData?.publicUrl) {
    const newCells = cells.value.map((c, i) => (i === idx ? { ...c, url: urlData.publicUrl } : c))
    saveCells(newCells)
  }
}

function openLink(url) {
  if (url) window.open(url, '_blank', 'noopener')
}

// ---- Cell drag-to-reorder ----
function onCellDragStart(e, idx) {
  draggingCellIdx.value = idx
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('cell-idx', String(idx))
  e.dataTransfer.setData('source-card-id', props.element.id)
  e.dataTransfer.setData('cell-data', JSON.stringify(cells.value[idx]))
}

function onCellDragOver(e, idx) {
  dragOverCell.value = idx
}

function onCellDrop(e, targetIdx) {
  const sourceCardId = e.dataTransfer.getData('source-card-id')
  const sourceCellIdx = parseInt(e.dataTransfer.getData('cell-idx'))

  if (sourceCardId === props.element.id && !isNaN(sourceCellIdx)) {
    // Reorder within same card
    const newCells = [...cells.value]
    const [moved] = newCells.splice(sourceCellIdx, 1)
    newCells.splice(targetIdx, 0, moved)
    saveCells(newCells)
  } else {
    // Cell from another card or canvas element
    const canvasElementId = e.dataTransfer.getData('canvas-element-id')
    if (canvasElementId) {
      const el = elements.elements.find((el) => el.id === canvasElementId)
      if (el) {
        const newCell = canvasElementToCell(el)
        const newCells = [...cells.value]
        newCells.splice(targetIdx, 0, newCell)
        saveCells(newCells)
        elements.deleteElement(canvasElementId)
      }
    } else if (sourceCardId && sourceCardId !== props.element.id) {
      // Cell from different card
      try {
        const cellData = JSON.parse(e.dataTransfer.getData('cell-data'))
        if (cellData) {
          const newCell = { ...cellData, id: Date.now().toString() }
          const newCells = [...cells.value]
          newCells.splice(targetIdx, 0, newCell)
          saveCells(newCells)
        }
      } catch (err) {
        console.error('[Card] Cell drop error:', err)
      }
    }
  }
  dragOverCell.value = null
  draggingCellIdx.value = null
}

function onCellDragEnd() {
  dragOverCell.value = null
  draggingCellIdx.value = null
}

function canvasElementToCell(el) {
  const base = { id: Date.now().toString(), type: el.type }
  if (el.type === 'text')
    return { ...base, text: el.content?.text, fontSize: el.font_size, color: el.text_color }
  if (el.type === 'image') return { ...base, url: el.content?.url }
  if (el.type === 'button' || el.type === 'link')
    return { ...base, text: el.content?.label, url: el.content?.url }
  return base
}

// ---- Canvas element drop onto card ----
function onDragOver(e) {
  if (
    e.dataTransfer.types.includes('canvas-element-id') ||
    e.dataTransfer.types.includes('cell-data')
  ) {
    isDragOver.value = true
  }
}

function onDragLeave() {
  isDragOver.value = false
}

function onDrop(e) {
  isDragOver.value = false
  const canvasElementId = e.dataTransfer.getData('canvas-element-id')
  if (canvasElementId) {
    const el = elements.elements.find((el) => el.id === canvasElementId)
    if (el) {
      const newCell = canvasElementToCell(el)
      saveCells([...cells.value, newCell])
      elements.deleteElement(canvasElementId)
    }
  }
}

// ---- Card resize ----
function onResizeStart(e, handle) {
  e.preventDefault()
  e.stopPropagation()
  const startX = e.clientX
  const startY = e.clientY
  const startW = props.element.width
  const startH = props.element.height
  const startPX = props.element.position_x
  const startPY = props.element.position_y

  const onMove = (me) => {
    const dx = (me.clientX - startX) / viewport.zoom
    const dy = (me.clientY - startY) / viewport.zoom
    let newW = startW,
      newH = startH,
      newX = startPX,
      newY = startPY

    if (handle.includes('e')) newW = Math.max(150, startW + dx)
    if (handle.includes('s')) newH = Math.max(100, startH + dy)
    if (handle.includes('w')) {
      newW = Math.max(150, startW - dx)
      newX = startPX + (startW - newW)
    }
    if (handle.includes('n')) {
      newH = Math.max(100, startH - dy)
      newY = startPY + (startH - newH)
    }

    elements.updateElement(props.element.id, {
      width: newW,
      height: newH,
      position_x: newX,
      position_y: newY
    })
  }

  const onUp = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
    cleanupFns = cleanupFns.filter((fn) => fn !== cleanupWrapper)
  }

  const cleanupWrapper = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }

  addCleanup(cleanupWrapper)
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

// ---- Cell resize ----
function onCellResizeStart(e, idx) {
  e.preventDefault()
  const startY = e.clientY
  const startH = cells.value[idx].height || 80

  const onMove = (me) => {
    const newH = Math.max(30, startH + (me.clientY - startY) / viewport.zoom)
    const newCells = cells.value.map((c, i) => (i === idx ? { ...c, height: newH } : c))
    saveCells(newCells)
  }

  const onUp = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
    cleanupFns = cleanupFns.filter((fn) => fn !== cleanupWrapper)
  }

  const cleanupWrapper = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }

  addCleanup(cleanupWrapper)
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

// Cell text formatting toolbar functions
function updateCellToolbarPosition(idx) {
  const cellElement = document.querySelector(`.card-cell:nth-child(${idx + 1}) .cell-text`)
  if (cellElement) {
    const rect = cellElement.getBoundingClientRect()
    cellToolbarPosition.value = {
      x: rect.left + rect.width / 2 - 140, // Center the toolbar (approx 280px wide)
      y: rect.top - 45
    }
    currentCellIdx.value = idx
    currentCellFontSize.value = cells.value[idx].fontSize || 14

    // Update format state
    updateCellFormatState()
  }
}

function updateCellFormatState() {
  cellFormatState.value = {
    bold: document.queryCommandState('bold'),
    italic: document.queryCommandState('italic'),
    underline: document.queryCommandState('underline'),
    strikeThrough: document.queryCommandState('strikeThrough')
  }
  // Track if there's a text selection (for showing font size handle)
  const selection = window.getSelection()
  cellFormatStateHasSelection.value = !!(
    selection &&
    selection.rangeCount > 0 &&
    !selection.isCollapsed
  )
}

function toggleCellFormat(command) {
  document.execCommand(command, false, '')
  updateCellFormatState()

  // Save the formatted HTML content (sanitized for security)
  if (currentCellIdx.value !== null) {
    const cellElement = document.querySelector(
      `.card-cell:nth-child(${currentCellIdx.value + 1}) .cell-text`
    )
    if (cellElement) {
      const newCells = [...cells.value]
      const currentText = newCells[currentCellIdx.value].text
      const rawHtmlContent = cellElement.innerHTML
      const htmlContent = sanitizeHTML(rawHtmlContent)

      const updated =
        typeof currentText === 'object' && currentText !== null
          ? { ...currentText, [i18nStore.currentLocale]: htmlContent }
          : { pt: htmlContent }

      newCells[currentCellIdx.value] = { ...newCells[currentCellIdx.value], text: updated }
      saveCells(newCells)
    }
  }
}

function increaseCellFontSize() {
  if (currentCellIdx.value !== null) {
    const newSize = Math.min(72, (cells.value[currentCellIdx.value].fontSize || 14) + 1)
    const newCells = cells.value.map((c, i) =>
      i === currentCellIdx.value ? { ...c, fontSize: newSize } : c
    )
    saveCells(newCells)
    currentCellFontSize.value = newSize
  }
}

// Font size drag-to-resize for cell text
function onCellFontSizeResizeStart(e, idx) {
  e.preventDefault()
  e.stopPropagation()

  const startY = e.clientY
  const startFontSize = cells.value[idx].fontSize || 14

  const onMove = (me) => {
    const deltaY = startY - me.clientY // Drag up increases, down decreases
    const sensitivity = 0.1
    let newFontSize = Math.round((startFontSize + deltaY * sensitivity) * 10) / 10
    newFontSize = Math.max(8, Math.min(72, newFontSize))

    const newCells = cells.value.map((c, i) => (i === idx ? { ...c, fontSize: newFontSize } : c))
    saveCells(newCells)
  }

  const onUp = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
    cleanupFns = cleanupFns.filter((fn) => fn !== cleanupWrapper)
  }

  const cleanupWrapper = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }

  addCleanup(cleanupWrapper)
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

function decreaseCellFontSize() {
  if (currentCellIdx.value !== null) {
    const newSize = Math.max(8, (cells.value[currentCellIdx.value].fontSize || 14) - 1)
    const newCells = cells.value.map((c, i) =>
      i === currentCellIdx.value ? { ...c, fontSize: newSize } : c
    )
    saveCells(newCells)
    currentCellFontSize.value = newSize
  }
}

function handleCellClick(idx) {
  showCellToolbar.value = true
  updateCellToolbarPosition(idx)
}

function handleCellDoubleClick(idx) {
  showCellToolbar.value = true
  updateCellToolbarPosition(idx)
}
</script>

<style scoped>
.canvas-card {
  position: absolute;
  background: rgba(20, 20, 18, 0.95);
  border: 1px solid var(--moss);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  overflow: visible;
  border-radius: 4px;
}

.canvas-card.selected {
  outline: 2px solid var(--terracotta);
  outline-offset: 2px;
}

.canvas-card.drag-over {
  outline: 2px dashed var(--stencil-orange);
  outline-offset: 2px;
}

/* Resize handles */
.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: var(--terracotta);
  border: 1px solid var(--paper);
  z-index: 10;
  border-radius: 2px;
}
.resize-handle.nw {
  top: -5px;
  left: -5px;
  cursor: nw-resize;
}
.resize-handle.n {
  top: -5px;
  left: calc(50% - 5px);
  cursor: n-resize;
}
.resize-handle.ne {
  top: -5px;
  right: -5px;
  cursor: ne-resize;
}
.resize-handle.e {
  top: calc(50% - 5px);
  right: -5px;
  cursor: e-resize;
}
.resize-handle.se {
  bottom: -5px;
  right: -5px;
  cursor: se-resize;
}
.resize-handle.s {
  bottom: -5px;
  left: calc(50% - 5px);
  cursor: s-resize;
}
.resize-handle.sw {
  bottom: -5px;
  left: -5px;
  cursor: sw-resize;
}
.resize-handle.w {
  top: calc(50% - 5px);
  left: -5px;
  cursor: w-resize;
}

/* Card title */
.card-title {
  padding: 0.75rem 1rem;
  font-family: 'Space Mono', monospace;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--paper);
  border-bottom: 1px solid rgba(106, 125, 91, 0.3);
  outline: none;
  min-height: 2.5rem;
}
.card-title:empty::before {
  content: attr(data-placeholder);
  color: var(--moss-light);
  font-style: italic;
}
.card-title:focus {
  background: rgba(255, 255, 255, 0.03);
}

/* Cells */
.card-cells {
  display: flex;
  flex-direction: column;
  gap: 0;
  flex: 1;
  padding: 0.25rem;
}

/* Dynamic cell widths for 2-column layout */
.card-cell.full-width {
  width: 100%;
  display: block;
}

.card-cell.half-width {
  width: calc(50% - 4px);
  display: inline-block;
  vertical-align: top;
}

.card-cell.half-width + .card-cell.half-width {
  margin-left: 4px;
}

.card-cell.column-left {
  width: calc(50% - 4px);
  margin-right: 4px;
  display: inline-block;
  vertical-align: top;
}

.card-cell.column-right {
  width: calc(50% - 4px);
  margin-left: 4px;
  display: inline-block;
  vertical-align: top;
}

.card-cell {
  position: relative;
  border: 1px dashed rgba(106, 125, 91, 0.25);
  border-radius: 2px;
  min-height: 40px;
  transition: all 0.15s;
  margin: 2px 0;
}

.card-cell:hover {
  border-color: rgba(106, 125, 91, 0.5);
}

.card-cell.drag-over {
  background: rgba(181, 93, 58, 0.1);
  border-color: var(--terracotta);
  border-style: solid;
}

.card-cell.dragging {
  opacity: 0.5;
}

.card-cell.empty {
  min-height: 50px;
  border-style: dashed;
}

/* Empty skeleton */
.cell-skeleton {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50px;
  cursor: pointer;
  transition: all 0.15s;
  gap: 4px;
}
.cell-skeleton:hover {
  background: rgba(181, 93, 58, 0.05);
}

.cell-plus {
  font-size: 1.4rem;
  color: var(--moss-light);
  line-height: 1;
}
.cell-hint {
  font-family: 'Space Mono', monospace;
  font-size: 0.6rem;
  color: var(--moss-light);
  text-transform: uppercase;
}

/* Cell content */
.cell-text {
  padding: 0.5rem 0.75rem;
  color: var(--paper);
  outline: none;
  white-space: pre-wrap;
  word-wrap: break-word;
  cursor: text;
  min-height: 40px;
  line-height: 1.5;
}
.cell-text:focus {
  background: rgba(255, 255, 255, 0.03);
}
.cell-text b,
.cell-text strong {
  font-weight: bold;
}
.cell-text i,
.cell-text em {
  font-style: italic;
}
.cell-text u {
  text-decoration: underline;
}
.cell-text s,
.cell-text strike {
  text-decoration: line-through;
}

.cell-image {
  display: block;
  width: 100%;
  object-fit: cover;
  border-radius: 2px;
}
.cell-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--moss-light);
  font-size: 0.75rem;
  cursor: pointer;
  border-radius: 2px;
}
.cell-image-placeholder:hover {
  background: rgba(255, 255, 255, 0.06);
}

.cell-button-wrapper {
  padding: 0.5rem 0.75rem;
}

.cell-button {
  display: inline-block;
  background: var(--terracotta);
  color: var(--paper);
  text-decoration: none;
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  border-radius: 2px;
  cursor: pointer;
  transition: background 0.15s;
  outline: none;
}
.cell-button:hover {
  background: var(--stencil-orange);
}
.cell-button:focus {
  outline: 1px solid var(--paper);
}

.cell-url-input {
  padding: 0 0.75rem 0.5rem;
}

.cell-url-input input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--paper);
  padding: 0.25rem 0.5rem;
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  border-radius: 2px;
}

.cell-link-wrapper {
  padding: 0.5rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.cell-link-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--paper);
  padding: 0.3rem 0.5rem;
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  border-radius: 2px;
}

.cell-link {
  display: block;
  color: var(--stencil-orange);
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  text-decoration: underline;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Nested card cell */
.cell-nested-card {
  padding: 0.5rem;
  min-height: 150px;
  position: relative;
}

.cell-nested-card .canvas-card {
  position: relative !important;
  left: auto !important;
  top: auto !important;
  width: 100% !important;
  transform: none !important;
}

/* Cell resize handle */
.cell-resize-handle {
  position: absolute;
  left: 0;
  right: 0;
  height: 8px;
  cursor: s-resize;
  background: transparent;
  transition: background 0.1s;
  z-index: 5;
}
.cell-resize-handle.bottom {
  bottom: 0;
}
.cell-resize-handle:hover {
  background: rgba(181, 93, 58, 0.4);
}

/* Cell font size resize handle (bottom-right corner) */
.cell-font-size-handle {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, rgba(181, 93, 58, 0.9) 0%, rgba(181, 93, 58, 0.7) 100%);
  border: 2px solid var(--paper);
  border-radius: 4px;
  cursor: se-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.15s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
.cell-font-size-handle:hover {
  background: linear-gradient(135deg, rgba(181, 93, 58, 1) 0%, rgba(181, 93, 58, 0.85) 100%);
  transform: scale(1.1);
  box-shadow: 0 3px 12px rgba(181, 93, 58, 0.5);
}
.cell-font-size-handle svg {
  color: var(--paper);
  opacity: 0.9;
}
.cell-font-size-handle .font-size-preview {
  position: absolute;
  bottom: -18px;
  right: 0;
  font-family: 'Space Mono', monospace;
  font-size: 9px;
  color: var(--terracotta);
  background: rgba(20, 20, 18, 0.95);
  padding: 2px 4px;
  border-radius: 2px;
  border: 1px solid rgba(106, 125, 91, 0.4);
  pointer-events: none;
  white-space: nowrap;
}

/* Cell actions */
.cell-actions {
  position: absolute;
  top: 2px;
  right: 2px;
  display: none;
  gap: 2px;
  z-index: 5;
}
.card-cell:hover .cell-actions {
  display: flex;
}

.cell-action-btn {
  background: rgba(20, 20, 18, 0.95);
  border: 1px solid var(--moss);
  color: var(--moss-light);
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.1s;
  border-radius: 2px;
}
.cell-action-btn:hover {
  border-color: var(--terracotta);
  color: var(--terracotta);
}
.drag-handle {
  cursor: grab;
}

/* Add cell button */
.add-cell-btn {
  margin: 0.25rem;
  padding: 0.5rem;
  background: transparent;
  border: 1px dashed rgba(106, 125, 91, 0.4);
  color: var(--moss-light);
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.15s;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.add-cell-btn:hover {
  border-color: var(--terracotta);
  color: var(--terracotta);
}
.add-cell-btn .plus {
  font-size: 1rem;
}

/* Drop indicator */
.drop-indicator {
  position: absolute;
  inset: 0;
  border: 2px dashed var(--terracotta);
  background: rgba(181, 93, 58, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  color: var(--terracotta);
  pointer-events: none;
  z-index: 50;
  border-radius: 4px;
}

.hidden-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

/* Cell formatting toolbar */
.cell-text:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.03);
}
</style>

<!-- Global styles for teleported cell toolbar -->
<style>
.cell-format-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, rgba(20, 20, 18, 0.98) 0%, rgba(30, 30, 28, 0.95) 100%);
  border: 1px solid rgba(106, 125, 91, 0.4);
  padding: 6px 8px;
  border-radius: 8px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.3);
  pointer-events: all;
  backdrop-filter: blur(12px);
  transition: all 0.2s ease;
}

.cell-format-toolbar::before {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  background: inherit;
  border-right: 1px solid rgba(106, 125, 91, 0.4);
  border-bottom: 1px solid rgba(106, 125, 91, 0.4);
  transform: translateX(-50%) rotate(45deg);
}

.cell-format-toolbar .toolbar-group {
  display: flex;
  align-items: center;
  gap: 3px;
}

.cell-format-toolbar .toolbar-divider {
  width: 1px;
  height: 20px;
  background: rgba(106, 125, 91, 0.3);
  margin: 0 4px;
}

.cell-format-toolbar .tb-btn {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid transparent;
  color: var(--paper);
  padding: 6px 8px;
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;
  min-width: 28px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cell-format-toolbar .tb-btn:hover {
  background: rgba(106, 125, 91, 0.2);
  border-color: rgba(106, 125, 91, 0.5);
  transform: translateY(-1px);
}

.cell-format-toolbar .tb-btn.active {
  background: linear-gradient(135deg, rgba(181, 93, 58, 0.3) 0%, rgba(181, 93, 58, 0.2) 100%);
  border-color: var(--terracotta);
  color: var(--terracotta);
}

.cell-format-toolbar .tb-btn b,
.cell-format-toolbar .tb-btn i,
.cell-format-toolbar .tb-btn u,
.cell-format-toolbar .tb-btn s {
  font-weight: inherit;
  font-style: inherit;
  text-decoration: inherit;
}

.cell-format-toolbar .tb-icon {
  padding: 6px;
  min-width: 28px;
}

.cell-format-toolbar .font-size-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.cell-format-toolbar .font-size-display {
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  color: var(--paper);
  min-width: 24px;
  text-align: center;
}
</style>

<!-- Global styles for teleported menu -->
<style>
.cell-type-menu {
  background: linear-gradient(180deg, rgba(20, 20, 18, 0.98) 0%, rgba(25, 25, 23, 0.98) 100%);
  border: 1px solid rgba(106, 125, 91, 0.4);
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 180px;
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.5),
    0 4px 12px rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  backdrop-filter: blur(16px);
}

.menu-header {
  font-family: 'Space Mono', monospace;
  font-size: 0.6rem;
  color: var(--moss-light);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 8px 10px;
  border-bottom: 1px solid rgba(106, 125, 91, 0.2);
  margin-bottom: 4px;
}

.cell-type-menu button {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid transparent;
  color: var(--paper);
  padding: 10px 12px;
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.cell-type-menu button:hover {
  background: linear-gradient(135deg, rgba(106, 125, 91, 0.2) 0%, rgba(106, 125, 91, 0.1) 100%);
  border-color: rgba(106, 125, 91, 0.4);
  transform: translateX(2px);
}

.menu-icon {
  font-size: 1.1rem;
  width: 24px;
  text-align: center;
  color: var(--stencil-orange);
}

.menu-label {
  flex: 1;
}

.menu-cancel {
  color: var(--moss-light) !important;
  border-top: 1px solid rgba(106, 125, 91, 0.2) !important;
  margin-top: 4px;
  padding-top: 10px !important;
  justify-content: center !important;
}

.menu-cancel:hover {
  background: rgba(255, 50, 50, 0.1) !important;
  border-color: rgba(255, 50, 50, 0.3) !important;
  color: #ff4444 !important;
}
</style>
