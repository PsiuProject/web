<template>
  <header class="app-header" :class="`mode-${mode}`">
    <div class="header-left">
      <router-link to="/" class="logo">
        EG
        <span>.SUR</span>
      </router-link>

      <!-- Gallery mode: NO section filters (clean view) -->

      <!-- Project mode: view/edit/comment/present tabs — filtered by role -->
      <!-- 
        Viewer role: View | Present only
        Comment role: View | Comment | Present (no Edit)
        Editor/Owner role: View | Comment | Edit | Present
      -->
      <nav v-if="projectId" class="mode-nav">
        <router-link :to="`/${projectId}/view`" :class="{ active: mode === 'view' }">
          View
        </router-link>
        <router-link
          v-if="permissions.canComment"
          :to="`/${projectId}/comment`"
          :class="{ active: mode === 'comment' }"
        >
          Comment
        </router-link>
        <router-link
          v-if="permissions.canEdit"
          :to="`/${projectId}/edit`"
          :class="{ active: mode === 'edit' }"
        >
          Edit
        </router-link>
        <!-- Presentation is always visible for all roles -->
        <router-link :to="`/${projectId}/present`" :class="{ active: mode === 'present' }">
          Present
        </router-link>
      </nav>
    </div>

    <div class="header-center" v-if="projectId">
      <span class="project-name">{{ currentProjectName }}</span>
    </div>

    <div class="header-right">
      <!-- Gallery button (all roles when in project mode) -->
      <router-link v-if="projectId" to="/gallery" class="gallery-btn">Gallery</router-link>

      <!-- Fork button (all roles when in project mode - requires login) -->
      <button
        v-if="projectId && auth.isLoggedIn"
        class="fork-btn"
        @click="forkProject"
        :disabled="forking"
        :title="'Fork project to your account'"
      >
        {{ forking ? '...' : '⑂ Fork' }}
      </button>

      <!-- Export button (all roles when in project mode) -->
      <button
        v-if="projectId"
        class="export-btn"
        @click="showExportMenu = !showExportMenu"
        title="Export / Download"
      >
        ↓ Export
      </button>

      <!-- Export dropdown menu -->
      <div v-if="showExportMenu && projectId" class="export-menu" @click.stop>
        <button @click="exportAsJSON">Export as JSON</button>
        <button @click="exportAsPNG">Export as PNG</button>
        <button @click="exportAsPDF">Export as PDF</button>
      </div>

      <!-- Notification bell -->
      <button
        v-if="auth.isLoggedIn && comments.unreadCount > 0"
        class="notif-btn"
        @click="showNotifications = !showNotifications"
      >
        {{ comments.unreadCount }}
      </button>

      <button @click="i18nStore.toggleLocale()" class="lang-toggle">
        {{ i18nStore.currentLocale === 'pt' ? 'EN' : 'PT' }}
      </button>

      <div v-if="auth.isLoggedIn" class="user-info">
        <button class="user-btn" @click="showUserMenu = !showUserMenu">
          <img v-if="auth.userAvatar" :src="auth.userAvatar" :alt="auth.userName" />
          <span v-else>{{ auth.userInitial }}</span>
        </button>

        <div v-if="showUserMenu" class="user-menu" @click.stop>
          <div class="user-menu-header">
            <strong>{{ auth.userName }}</strong>
            <small>{{ auth.userEmail }}</small>
          </div>
          <button @click="handleLogout">Logout</button>
        </div>
      </div>

      <button v-else @click="showAuth = true" class="login-btn">LOGIN</button>
    </div>

    <AuthModal v-if="showAuth" @close="showAuth = false" />

    <!-- Notifications Panel -->
    <div v-if="showNotifications" class="notifications-panel" @click.stop>
      <div class="notifications-header">
        <h3>Notifications</h3>
        <button @click="showNotifications = false">&times;</button>
      </div>
      <div class="notifications-list">
        <div
          v-for="notif in comments.notifications"
          :key="notif.id"
          class="notification-item"
          :class="{ unread: !notif.read }"
          @click="goToComment(notif)"
        >
          <p>{{ notif.comment?.content }}</p>
          <button @click.stop="comments.markAsRead(notif.id)">Mark read</button>
        </div>
        <div v-if="comments.notifications.length === 0" class="empty-notif">No notifications</div>
      </div>
    </div>

    <!-- New Project Modal -->
    <div v-if="showNewProjectModal" class="modal-overlay" @click="showNewProjectModal = false">
      <div class="modal-content" @click.stop>
        <h2 class="modal-title">CREATE NEW PROJECT</h2>
        <form @submit.prevent="createProject" class="new-project-form">
          <div class="form-group">
            <label>Title (PT)</label>
            <input
              v-model="newProject.title_pt"
              type="text"
              required
              placeholder="Titulo do projeto"
            />
          </div>
          <div class="form-group">
            <label>Title (EN)</label>
            <input
              v-model="newProject.title_en"
              type="text"
              placeholder="Project title (optional)"
            />
          </div>
          <div class="form-group">
            <label>Description (PT)</label>
            <textarea
              v-model="newProject.description_pt"
              rows="3"
              required
              placeholder="Descricao breve"
            ></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Status</label>
              <select v-model="newProject.status">
                <option value="active">Active</option>
                <option value="pipeline">Pipeline</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div class="form-group">
              <label>Privacy</label>
              <select v-model="newProject.privacy">
                <option value="private">Private</option>
                <option value="public">Public</option>
                <option value="link_only">Link Only</option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="showNewProjectModal = false">
              Cancel
            </button>
            <button type="submit" class="create-btn" :disabled="creating">
              {{ creating ? 'Creating...' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </header>

  <!-- Section Filters - Dynamic placement based on mode -->
  <nav v-if="mode === 'view' || mode === 'comment'" class="section-filters-top">
    <a href="#" class="filter-link" @click.prevent="galleryStore.clearFocus()">All</a>
    <a
      href="#"
      class="filter-link"
      :class="{ active: galleryStore.focusedType === 'active' }"
      @click.prevent="galleryStore.focusSection('active')"
    >
      Active
    </a>
    <a
      href="#"
      class="filter-link"
      :class="{ active: galleryStore.focusedType === 'pipeline' }"
      @click.prevent="galleryStore.focusSection('pipeline')"
    >
      Pipeline
    </a>
    <a
      href="#"
      class="filter-link"
      :class="{ active: galleryStore.focusedType === 'done' }"
      @click.prevent="galleryStore.focusSection('done')"
    >
      Done
    </a>
    <button
      v-if="auth.isLoggedIn && mode === 'edit'"
      class="new-project-mini"
      @click="showNewProjectModal = true"
    >
      + NEW
    </button>
  </nav>

  <!-- Minimized section filters at bottom for edit mode -->
  <nav v-if="mode === 'edit'" class="section-filters-bottom">
    <a href="#" class="filter-link mini" @click.prevent="galleryStore.clearFocus()">All</a>
    <a
      href="#"
      class="filter-link mini"
      :class="{ active: galleryStore.focusedType === 'active' }"
      @click.prevent="galleryStore.focusSection('active')"
    >
      Active
    </a>
    <a
      href="#"
      class="filter-link mini"
      :class="{ active: galleryStore.focusedType === 'pipeline' }"
      @click.prevent="galleryStore.focusSection('pipeline')"
    >
      Pipeline
    </a>
    <a
      href="#"
      class="filter-link mini"
      :class="{ active: galleryStore.focusedType === 'done' }"
      @click.prevent="galleryStore.focusSection('done')"
    >
      Done
    </a>
    <button v-if="auth.isLoggedIn" class="new-project-mini" @click="showNewProjectModal = true">
      + NEW
    </button>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { usePermissionsStore } from '../../stores/permissions'
import { useCommentsStore } from '../../stores/comments'
import { useI18nStore } from '../../stores/i18n-store'
import { useProjectsStore } from '../../stores/projectsStore'
import { useGalleryStore } from '../../stores/gallery'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import AuthModal from '../AuthModal.vue'

const props = defineProps({
  mode: { type: String, default: 'gallery' }
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const permissions = usePermissionsStore()
const comments = useCommentsStore()
const i18nStore = useI18nStore()
const projects = useProjectsStore()
const galleryStore = useGalleryStore()

const showAuth = ref(false)
const showUserMenu = ref(false)
const showNotifications = ref(false)
const showNewProjectModal = ref(false)
const showExportMenu = ref(false)
const creating = ref(false)
const forking = ref(false)
const newProject = ref({
  title_pt: '',
  title_en: '',
  description_pt: '',
  status: 'active',
  privacy: 'private'
})
const isDev = import.meta.env.DEV

const projectId = computed(() => route.params.projectId)

const currentProjectName = computed(() => {
  if (!projectId.value) return ''
  const p = projects.projects.find((p) => p.id === projectId.value)
  if (!p) return ''
  const t = p.title
  if (typeof t === 'object') return t[i18nStore.currentLocale] || t.pt || t.en || ''
  return t || ''
})

function goToComment(notif) {
  if (notif.comment?.project_id) {
    router.push({ name: 'canvas-comment', params: { projectId: notif.comment.project_id } })
    comments.markAsRead(notif.id)
    showNotifications.value = false
  }
}

async function forkProject() {
  if (!auth.isLoggedIn || !projectId.value) return
  forking.value = true
  try {
    const src = projects.projects.find((p) => p.id === projectId.value)
    if (!src || !isSupabaseConfigured) return
    const { data: newP, error } = await supabase
      .from('projects')
      .insert({
        title: src.title,
        description: src.description,
        status: src.status,
        privacy: 'private',
        size: src.size || 'card-md',
        territory: src.territory,
        axis: src.axis || [],
        year: src.year || new Date().getFullYear(),
        position_x: Math.random() * 400,
        position_y: Math.random() * 300,
        owner_id: auth.userId
      })
      .select()
      .single()
    if (error) throw error
    const { data: elems } = await supabase
      .from('canvas_elements')
      .select('*')
      .eq('project_id', projectId.value)
    if (elems?.length) {
      const newElems = elems.map(({ id, created_at, updated_at, ...rest }) => ({
        ...rest,
        project_id: newP.id,
        created_by: auth.userId
      }))
      await supabase.from('canvas_elements').insert(newElems)
    }
    router.push({ name: 'canvas-edit', params: { projectId: newP.id } })
  } catch (err) {
    console.error('[Fork] Failed:', err.message)
  } finally {
    forking.value = false
  }
}

function exportProject() {
  if (!projectId.value) return
  const src = projects.projects.find((p) => p.id === projectId.value)
  if (!src) return
  const blob = new Blob([JSON.stringify(src, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `project-${projectId.value}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function exportAsJSON() {
  showExportMenu.value = false
  exportProject()
}

async function exportAsPNG() {
  showExportMenu.value = false
  // PNG export would require html2canvas library
  // For now, use browser's screenshot functionality
  alert(
    "For PNG export, use your browser's screenshot functionality (Cmd+Shift+4 on Mac, Win+Shift+S on Windows), or install html2canvas package."
  )
}

async function exportAsPDF() {
  showExportMenu.value = false
  // Basic PDF export using print
  try {
    window.print()
  } catch (err) {
    console.error('[Export PDF] Failed:', err)
    alert('PDF export failed. Use browser print (Ctrl+P) to save as PDF.')
  }
}

async function createProject() {
  if (!auth.isLoggedIn) return
  creating.value = true
  try {
    const data = {
      title: {
        pt: newProject.value.title_pt,
        ...(newProject.value.title_en ? { en: newProject.value.title_en } : {})
      },
      description: { pt: newProject.value.description_pt },
      status: newProject.value.status,
      privacy: newProject.value.privacy,
      size: 'card-md',
      territory: 'Brasil',
      axis: [],
      year: new Date().getFullYear(),
      position_x: Math.random() * 500,
      position_y: Math.random() * 300
    }
    const created = await projects.createProject(data)
    if (created) {
      newProject.value = {
        title_pt: '',
        title_en: '',
        description_pt: '',
        status: 'active',
        privacy: 'private'
      }
      showNewProjectModal.value = false
      router.push({ name: 'canvas-edit', params: { projectId: created.id } })
    }
  } finally {
    creating.value = false
  }
}

function handleLogout() {
  auth.logout()
  showUserMenu.value = false
}
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: rgba(20, 20, 18, 0.95);
  border-bottom: 1px solid var(--moss);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
}

.header-center {
  flex: 1;
  text-align: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  justify-content: flex-end;
  position: relative;
}

.logo {
  font-family: 'Space Mono', monospace;
  font-size: 1rem;
  font-weight: 700;
  color: var(--paper);
  text-decoration: none;
  letter-spacing: -0.02em;
}

.logo span {
  color: var(--terracotta);
}

/* Section nav (gallery) */
.section-nav {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.section-nav .nav-link,
.section-nav .new-project-btn {
  padding: 0.35rem 0.75rem;
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-decoration: none;
  color: var(--paper);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.section-nav .nav-link:hover {
  background: rgba(106, 125, 91, 0.1);
  border-color: var(--moss);
}

.section-nav .nav-link.active {
  background: var(--terracotta);
  color: var(--ink);
  border-color: var(--terracotta);
}

.new-project-btn {
  color: var(--stencil-orange) !important;
  border-color: rgba(255, 95, 31, 0.3) !important;
  background: rgba(255, 95, 31, 0.1) !important;
}

.new-project-btn:hover {
  background: rgba(255, 95, 31, 0.25) !important;
}

/* Mode nav (project views) */
.mode-nav {
  display: flex;
  gap: 0.25rem;
}

.mode-nav a {
  padding: 0.35rem 0.75rem;
  color: var(--moss-light);
  text-decoration: none;
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.mode-nav a:hover {
  color: var(--paper);
}

.mode-nav a.active {
  color: var(--terracotta);
  border-bottom-color: var(--terracotta);
}

.project-name {
  font-family: 'Space Mono', monospace;
  font-size: 0.8rem;
  color: var(--paper);
  font-weight: 600;
}

.gallery-btn {
  padding: 0.35rem 0.75rem;
  background: rgba(106, 125, 91, 0.15);
  border: 1px solid var(--moss);
  color: var(--paper);
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}
.gallery-btn:hover {
  background: rgba(106, 125, 91, 0.3);
}

.fork-btn,
.export-btn {
  padding: 0.35rem 0.65rem;
  background: transparent;
  border: 1px solid var(--moss);
  color: var(--paper);
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
}
.fork-btn:hover:not(:disabled) {
  background: rgba(106, 125, 91, 0.15);
  border-color: var(--terracotta);
  color: var(--terracotta);
}
.fork-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.export-btn:hover {
  background: rgba(106, 125, 91, 0.15);
}

.notif-btn,
.lang-toggle,
.user-btn,
.login-btn {
  padding: 0.35rem 0.65rem;
  background: transparent;
  border: 1px solid var(--moss);
  color: var(--paper);
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.notif-btn:hover,
.lang-toggle:hover,
.login-btn:hover {
  border-color: var(--moss-light);
  background: rgba(106, 125, 91, 0.1);
}

.notif-btn {
  background: rgba(255, 95, 31, 0.15);
  border-color: rgba(255, 95, 31, 0.3);
  color: var(--stencil-orange);
  font-weight: 700;
}

.user-info {
  position: relative;
}

.user-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.user-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: rgba(20, 20, 18, 0.98);
  border: 1px solid var(--moss);
  padding: 1rem;
  min-width: 180px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  z-index: 1001;
}

.user-menu-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--moss);
}

.user-menu-header strong {
  color: var(--paper);
  font-size: 0.85rem;
}
.user-menu-header small {
  color: var(--moss-light);
  font-size: 0.7rem;
}

.user-menu button {
  width: 100%;
  padding: 0.4rem;
  background: transparent;
  border: 1px solid var(--moss);
  color: var(--paper);
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  cursor: pointer;
}

.user-menu button:hover {
  background: rgba(106, 125, 91, 0.1);
}

/* Notifications */
.notifications-panel {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 350px;
  max-height: 400px;
  background: rgba(20, 20, 18, 0.98);
  border: 1px solid var(--moss);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  z-index: 1001;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--moss);
}

.notifications-header h3 {
  margin: 0;
  font-size: 0.85rem;
  color: var(--paper);
}
.notifications-header button {
  background: transparent;
  border: none;
  color: var(--moss-light);
  font-size: 1.2rem;
  cursor: pointer;
}

.notifications-list {
  max-height: 320px;
  overflow-y: auto;
}

.notification-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(106, 125, 91, 0.2);
  cursor: pointer;
  transition: background 0.15s;
}

.notification-item:hover {
  background: rgba(106, 125, 91, 0.05);
}
.notification-item.unread {
  background: rgba(255, 95, 31, 0.05);
  border-left: 3px solid var(--terracotta);
}
.notification-item p {
  margin: 0 0 0.4rem 0;
  font-size: 0.8rem;
  color: var(--paper);
}
.notification-item button {
  padding: 0.2rem 0.4rem;
  background: transparent;
  border: 1px solid var(--moss);
  color: var(--moss-light);
  font-size: 0.65rem;
  cursor: pointer;
}

.empty-notif {
  padding: 2rem;
  text-align: center;
  color: var(--moss-light);
  font-size: 0.8rem;
}

/* New Project Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.modal-content {
  background: var(--ink);
  border: 1px solid var(--moss);
  padding: 2rem;
  max-width: 500px;
  width: 90vw;
}

.modal-title {
  font-family: 'Space Mono', monospace;
  font-size: 1rem;
  color: var(--paper);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.new-project-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.form-group label {
  font-family: 'Space Mono', monospace;
  font-size: 0.65rem;
  color: var(--moss-light);
  text-transform: uppercase;
}

.form-group input,
.form-group textarea,
.form-group select {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--moss);
  color: var(--paper);
  padding: 0.5rem 0.75rem;
  font-family: inherit;
  font-size: 0.85rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--terracotta);
}
.form-group textarea {
  resize: vertical;
  min-height: 60px;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.cancel-btn {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--paper);
  padding: 0.6rem;
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  cursor: pointer;
  text-transform: uppercase;
}

.create-btn {
  flex: 2;
  background: var(--terracotta);
  border: none;
  color: var(--ink);
  padding: 0.6rem;
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  font-weight: bold;
  cursor: pointer;
  text-transform: uppercase;
}

.create-btn:hover {
  background: var(--stencil-orange);
}
.create-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Section Filters - Dynamic placement */
.section-filters-top {
  position: fixed;
  top: 60px;
  left: 2rem;
  display: flex;
  gap: 0.25rem;
  align-items: center;
  z-index: 999;
  background: rgba(20, 20, 18, 0.9);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: 1px solid var(--moss);
}

.section-filters-bottom {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.25rem;
  align-items: center;
  z-index: 999;
  background: rgba(20, 20, 18, 0.95);
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  border: 1px solid var(--moss);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.filter-link {
  padding: 0.35rem 0.75rem;
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-decoration: none;
  color: var(--paper);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-link:hover {
  background: rgba(106, 125, 91, 0.1);
  border-color: var(--moss);
}

.filter-link.active {
  background: var(--terracotta);
  color: var(--ink);
  border-color: var(--terracotta);
}

.filter-link.mini {
  padding: 0.25rem 0.5rem;
  font-size: 0.65rem;
}

.new-project-mini {
  padding: 0.35rem 0.75rem;
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--stencil-orange) !important;
  border: 1px solid rgba(255, 95, 31, 0.3) !important;
  background: rgba(255, 95, 31, 0.1) !important;
  cursor: pointer;
  transition: all 0.2s;
}

.new-project-mini:hover {
  background: rgba(255, 95, 31, 0.25) !important;
}

/* Export dropdown menu */
.export-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: rgba(20, 20, 18, 0.98);
  border: 1px solid var(--moss);
  padding: 0.5rem;
  min-width: 160px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.export-menu button {
  background: transparent;
  border: 1px solid transparent;
  color: var(--paper);
  padding: 0.4rem 0.75rem;
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
}

.export-menu button:hover {
  background: rgba(106, 125, 91, 0.15);
  border-color: var(--moss);
}
</style>
