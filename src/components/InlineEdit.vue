<template>
  <div
    class="inline-edit"
    :class="{ editing: isEditing, 'read-only': !canEdit, [`mode-${editMode}`]: isEditing }"
    @mouseenter="showControls = canEdit"
    @mouseleave="showControls = false"
  >
    <!-- Display mode -->
    <component
      v-if="!isEditing"
      :is="tag"
      :class="displayClass"
      @click.stop="canEdit && startEdit('data')"
    >
      {{ modelValue || placeholder }}

      <!-- Dual edit buttons on hover -->
      <span v-if="showControls && canEdit" class="edit-controls" @click.stop>
        <button class="edit-btn btn-data"        @click.stop="startEdit('data')"        title="Edit source text">✎ {{ sourceLang.toUpperCase() }}</button>
        <button class="edit-btn btn-translation" @click.stop="startEdit('translation')" title="Edit translation only">✎ {{ targetLang.toUpperCase() }}</button>
      </span>
    </component>

    <!-- Edit mode -->
    <div v-else class="edit-container" @click.stop>
      <!-- Mode badge -->
      <div class="mode-badge" :class="'badge-' + editMode">
        <span v-if="editMode === 'data'">✎ editing {{ sourceLang.toUpperCase() }} — auto-translates to {{ targetLang.toUpperCase() }}</span>
        <span v-else>✎ editing {{ targetLang.toUpperCase() }} translation only</span>
        <button class="mode-switch" @click.stop="switchMode">switch to {{ editMode === 'data' ? targetLang.toUpperCase() : sourceLang.toUpperCase() }}</button>
      </div>

      <textarea
        v-if="multiline"
        ref="inputRef"
        :value="editValue"
        @input="onInput($event.target.value)"
        @blur="finishEdit"
        @keydown.escape="cancelEdit"
        @keydown.enter.ctrl="finishEdit"
        class="edit-input edit-textarea"
        :placeholder="placeholder"
        rows="3"
      />
      <input
        v-else
        ref="inputRef"
        :type="inputType"
        :value="editValue"
        @input="onInput($event.target.value)"
        @blur="finishEdit"
        @keydown.escape="cancelEdit"
        @keydown.enter="finishEdit"
        class="edit-input"
        :placeholder="placeholder"
      />
    </div>

    <div v-if="editedBy" class="edited-by-indicator">
      <span class="edited-by-dot"></span>{{ editedBy }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const props = defineProps({
  modelValue:   { type: String,  default: '' },
  tag:          { type: String,  default: 'span' },
  displayClass: { type: String,  default: '' },
  placeholder:  { type: String,  default: 'Click to edit...' },
  multiline:    { type: Boolean, default: false },
  inputType:    { type: String,  default: 'text' },
  canEdit:      { type: Boolean, default: false },
  editedBy:     { type: String,  default: null },
  rawValue:     { type: [Object, String], default: null },
})

const emit = defineEmits(['save', 'save-translation', 'editing', 'cancel'])

const isEditing    = ref(false)
const showControls = ref(false)
const inputRef     = ref(null)
const editValue    = ref('')
const originalValue = ref('')
const editMode     = ref('data') // 'data' | 'translation'
let autosaveTimer  = null

const sourceLang = computed(() => locale.value)
const targetLang = computed(() => locale.value === 'pt' ? 'en' : 'pt')

async function startEdit(mode) {
  if (!props.canEdit) return
  editMode.value = mode
  // Load the right text for the mode
  const lang = mode === 'data' ? locale.value : targetLang.value
  const val = props.rawValue?.[lang] ?? (mode === 'data' ? props.modelValue : '') ?? ''
  editValue.value = val
  originalValue.value = val
  isEditing.value = true
  emit('editing', true)
  await nextTick()
  inputRef.value?.focus()
  inputRef.value?.select()
}

async function switchMode() {
  doSave()
  await startEdit(editMode.value === 'data' ? 'translation' : 'data')
}

function onInput(val) {
  editValue.value = val
  clearTimeout(autosaveTimer)
  if (val !== originalValue.value) {
    autosaveTimer = setTimeout(doSave, 7000)
  }
}

function doSave() {
  clearTimeout(autosaveTimer)
  if (editValue.value === originalValue.value) return
  originalValue.value = editValue.value
  if (editMode.value === 'data') {
    // Overwrites source lang → triggers auto-translation
    emit('save', editValue.value)
  } else {
    // Patches only the target lang in the JSONB — no re-translation
    emit('save-translation', { lang: targetLang.value, text: editValue.value })
  }
}

function finishEdit() {
  isEditing.value = false
  emit('editing', false)
  doSave()
}

function cancelEdit() {
  clearTimeout(autosaveTimer)
  editValue.value = originalValue.value
  isEditing.value = false
  emit('editing', false)
  emit('cancel')
}

onBeforeUnmount(() => clearTimeout(autosaveTimer))
</script>

<style scoped>
.inline-edit { position: relative; display: inline-block; width: 100%; }
.inline-edit:not(.read-only):hover { cursor: text; }

/* Dual hover buttons */
.edit-controls {
  display: inline-flex;
  gap: 3px;
  margin-left: 6px;
  vertical-align: middle;
  animation: fadeIn 0.15s forwards;
}

@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

.edit-btn {
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  font-size: 0.6rem;
  font-family: 'Space Mono', monospace;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.15s;
}

.btn-data {
  background: rgba(181, 93, 58, 0.15);
  border-color: var(--terracotta);
  color: var(--terracotta);
}
.btn-data:hover { background: rgba(181, 93, 58, 0.35); }

.btn-translation {
  background: rgba(80, 140, 220, 0.15);
  border-color: #508cdc;
  color: #508cdc;
}
.btn-translation:hover { background: rgba(80, 140, 220, 0.3); }

/* Edit container */
.edit-container { width: 100%; }

/* Mode badge */
.mode-badge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px 8px;
  font-size: 0.6rem;
  font-family: 'Space Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 3px;
}

.badge-data {
  background: rgba(181, 93, 58, 0.2);
  border-left: 3px solid var(--terracotta);
  color: var(--terracotta);
}

.badge-translation {
  background: rgba(80, 140, 220, 0.15);
  border-left: 3px solid #508cdc;
  color: #508cdc;
}

.mode-switch {
  background: none;
  border: 1px solid currentColor;
  color: inherit;
  font-family: 'Space Mono', monospace;
  font-size: 0.55rem;
  padding: 1px 6px;
  cursor: pointer;
  text-transform: uppercase;
  opacity: 0.7;
  transition: opacity 0.15s;
}
.mode-switch:hover { opacity: 1; }

/* Input — color-coded by mode */
.edit-input {
  width: 100%;
  color: var(--paper);
  padding: 6px 8px;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  outline: none;
}

.mode-data .edit-input {
  background: rgba(181, 93, 58, 0.12);
  border: 1px solid var(--terracotta);
  box-shadow: 0 0 0 2px rgba(181, 93, 58, 0.15);
}

.mode-translation .edit-input {
  background: rgba(80, 140, 220, 0.1);
  border: 1px solid #508cdc;
  box-shadow: 0 0 0 2px rgba(80, 140, 220, 0.12);
}

.edit-textarea { resize: vertical; min-height: 60px; }

.edited-by-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.65rem;
  color: var(--stencil-orange);
  margin-top: 2px;
  font-family: 'Space Mono', monospace;
}

.edited-by-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--stencil-orange);
  animation: pulse 1.5s infinite;
}

@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
</style>
