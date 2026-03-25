<template>
  <div class="project-canvas-view">
    <!-- Canvas Editor Component -->
    <CanvasEditor
      :project-id="project.id"
      :can-edit="canEdit"
      ref="canvasEditorRef"
    />
    
    <!-- Toggle between detail and canvas view -->
    <button class="view-toggle-btn" @click="$emit('toggle-view')">
      {{ showCanvas ? '📄 Ver Detalhes' : '🎨 Editar Canvas' }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useGalleryStore } from '../stores/gallery'
import { useProjectsStore } from '../stores/projectsStore'
import { useMembersStore } from '../stores/membersStore'
import CanvasEditor from './CanvasEditor/CanvasEditor.vue'

const props = defineProps({
  project: { type: Object, required: true },
  showCanvas: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'toggle-view'])

const auth = useAuthStore()
const galleryStore = useGalleryStore()
const projectsStore = useProjectsStore()
const membersStore = useMembersStore()

const canvasEditorRef = ref(null)

const canEdit = computed(() => {
  if (!auth.isLoggedIn) return false
  
  const project = props.project._raw || props.project
  
  // Owner can always edit
  if (project.owner_id === auth.userId) return true
  
  // Check if user is editor
  const members = membersStore.getMembersByProject(props.project.id)
  const member = members.find(m => m.user_id === auth.userId)
  
  return member?.role === 'editor'
})
</script>

<style scoped>
.project-canvas-view {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(20, 20, 18, 0.98);
  overflow: hidden;
}

.view-toggle-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 200;
  background: var(--terracotta);
  border: none;
  color: var(--ink);
  padding: 12px 24px;
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  font-weight: bold;
  cursor: pointer;
  text-transform: uppercase;
  box-shadow: 0 4px 16px rgba(255, 95, 31, 0.3);
}

.view-toggle-btn:hover {
  background: var(--stencil-orange);
}
</style>
