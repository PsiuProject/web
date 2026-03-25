<template>
  <div class="project-detail-canvas">
    <!-- Back button -->
    <button class="back-button" @click="$emit('close')">
      <span class="back-arrow">&larr;</span> VOLTAR
    </button>

    <!-- Active collaborators presence -->
    <div v-if="realtimeStore.activeUsers.length > 0" class="presence-bar">
      <div
        v-for="user in realtimeStore.activeUsers"
        :key="user.id"
        class="presence-avatar"
        :title="user.name"
      >
        {{ (user.name || '?').charAt(0).toUpperCase() }}
      </div>
      <span class="presence-count">{{ realtimeStore.activeUsers.length }} online</span>
    </div>

    <!-- Central project info -->
    <div class="detail-section central-section">
      <div class="section-row">
        <div class="detail-node central-node">
          <div class="node-status" :class="'tag-' + project.type">
            {{ displayText(project.statusTagKey) }}
          </div>

          <InlineEdit
            :modelValue="displayText(project.titleKey)"
            :rawValue="project._raw?.title"
            tag="h1"
            displayClass="detail-title"
            :canEdit="canEdit"
            :editedBy="realtimeStore.isFieldBeingEdited('title')?.userName"
            @save="(val) => saveField('title', val)"
            @save-translation="(t) => saveTranslation('title', t)"
            @editing="(v) => broadcastEditing('title', v)"
          />

          <InlineEdit
            :modelValue="displayText(project.descriptionKey)"
            :rawValue="project._raw?.description"
            tag="p"
            displayClass="detail-description"
            :multiline="true"
            :canEdit="canEdit"
            :editedBy="realtimeStore.isFieldBeingEdited('description')?.userName"
            @save="(val) => saveField('description', val)"
            @save-translation="(t) => saveTranslation('description', t)"
            @editing="(v) => broadcastEditing('description', v)"
          />

          <!-- KPI -->
          <div v-if="project.kpiLabelKey" class="kpi-section">
            <div class="kpi-label">{{ displayText(project.kpiLabelKey) }}</div>
            <div v-if="project.kpiValue" class="kpi-value">{{ project.kpiValue }}</div>
            <div v-if="project.kpiDetail" class="kpi-detail">{{ project.kpiDetail }}</div>
          </div>
        </div>

        <!-- Info sidebar -->
        <div class="detail-sidebar">
          <!-- Territory & Axes -->
          <div class="detail-node info-node">
            <div class="node-header">{{ $t('project.location') || 'LOCATION' }}</div>
            <div class="node-item">{{ project.territory }}</div>
            <div v-if="project.axis && project.axis.length" class="node-header" style="margin-top: 1rem;">
              {{ $t('sidebar.axes') || 'AXES' }}
            </div>
            <div v-for="axis in project.axis" :key="axis" class="axis-tag">{{ axis }}</div>
          </div>

          <!-- Meta details -->
          <div v-if="project.meta && project.meta.length" class="detail-node meta-node">
            <div class="node-header">{{ $t('project.details') || 'DETAILS' }}</div>
            <div v-for="item in project.meta" :key="item.labelKey" class="meta-detail">
              <label>{{ displayText(item.labelKey) }}</label>
              <span>{{ item.value }}</span>
            </div>
          </div>

          <!-- Links -->
          <div v-if="project.links && project.links.length" class="detail-node links-node">
            <div class="node-header">LINKS</div>
            <div class="links-list">
              <LinkChip
                v-for="(link, idx) in project.links"
                :key="idx"
                :url="link.url"
                :type="link.type"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Blocks Section -->
    <div class="detail-section content-section">
      <div class="section-header-bar">
        <div class="node-header">CONTENT</div>
        <button
          v-if="canEdit"
          class="add-block-btn"
          @click="showAddBlock = !showAddBlock"
        >+ Add Block</button>
      </div>

      <!-- Add block menu -->
      <div v-if="showAddBlock && canEdit" class="add-block-menu">
        <button @click="addBlock('text')">
          <span class="block-icon">T</span> Text
        </button>
        <button @click="addBlock('image')">
          <span class="block-icon">&square;</span> Image
        </button>
        <button @click="addBlock('link')">
          <span class="block-icon">&rarr;</span> Link
        </button>
      </div>

      <!-- Content blocks list -->
      <div class="blocks-list">
        <div
          v-for="block in contentBlocks"
          :key="block.id"
          class="content-block"
          :class="'block-' + block.type"
          @mouseenter="hoveredBlock = block.id"
          @mouseleave="hoveredBlock = null"
        >
          <!-- Text block -->
          <template v-if="block.type === 'text'">
            <InlineEdit
              :modelValue="displayText(block.content)"
              :rawValue="typeof block.content === 'object' ? block.content : null"
              tag="div"
              displayClass="block-text"
              :multiline="true"
              :canEdit="canEdit"
              @save="(val) => updateBlock(block.id, { content: val })"
              @save-translation="(t) => updateBlockTranslation(block.id, block.content, t)"
            />
          </template>

          <!-- Image block -->
          <template v-if="block.type === 'image'">
            <img v-if="block.url" :src="block.url" :alt="displayText(block.content) || 'Image'" class="block-image" />
            <InlineEdit
              v-if="canEdit"
              :modelValue="block.url || ''"
              tag="div"
              displayClass="block-image-url"
              placeholder="Paste image URL..."
              :canEdit="canEdit"
              @save="(val) => updateBlock(block.id, { url: val })"
            />
            <InlineEdit
              :modelValue="displayText(block.content)"
              :rawValue="typeof block.content === 'object' ? block.content : null"
              tag="div"
              displayClass="block-caption"
              placeholder="Caption..."
              :canEdit="canEdit"
              @save="(val) => updateBlock(block.id, { content: val })"
              @save-translation="(t) => updateBlockTranslation(block.id, block.content, t)"
            />
          </template>

          <!-- Link block - auto chip -->
          <template v-if="block.type === 'link'">
            <LinkChip v-if="block.url" :url="block.url" :label="displayText(block.content)" />
            <InlineEdit
              v-if="canEdit"
              :modelValue="block.url || ''"
              tag="div"
              displayClass="block-link-url"
              placeholder="https://..."
              :canEdit="canEdit"
              @save="(val) => updateBlock(block.id, { url: val })"
            />
            <InlineEdit
              :modelValue="displayText(block.content)"
              :rawValue="typeof block.content === 'object' ? block.content : null"
              tag="div"
              displayClass="block-link-label"
              placeholder="Label..."
              :canEdit="canEdit"
              @save="(val) => updateBlock(block.id, { content: val })"
              @save-translation="(t) => updateBlockTranslation(block.id, block.content, t)"
            />
          </template>

          <!-- Delete block button -->
          <button
            v-if="canEdit && hoveredBlock === block.id"
            class="delete-block-btn"
            @click.stop="deleteBlock(block.id)"
          >&times;</button>
        </div>

        <div v-if="contentBlocks.length === 0" class="no-blocks">
          <p>No content blocks yet.</p>
          <p v-if="canEdit" style="opacity: 0.6; font-size: 0.8rem;">Click "+ Add Block" to add text, images, or links.</p>
        </div>
      </div>
    </div>

    <!-- Share & Privacy (owner/editor only) -->
    <div v-if="canEdit" class="detail-section privacy-section">
      <div class="detail-node privacy-node">
        <div class="node-header">SHARE & PRIVACY</div>

        <div class="privacy-toggles">
          <button v-for="opt in privacyOptions" :key="opt.value"
            class="privacy-btn" :class="{ active: currentPrivacy === opt.value }"
            @click="setPrivacy(opt.value)">
            <span class="privacy-icon">{{ opt.icon }}</span>
            <span class="privacy-label">{{ opt.label }}</span>
          </button>
        </div>

        <!-- Shareable slug link -->
        <div class="share-link" style="margin-top:12px">
          <label>Shareable Link</label>
          <div class="share-link-row">
            <input :value="slugUrl" readonly class="share-input" @click="copySlugLink" />
            <button class="copy-btn" @click="copySlugLink">Copy</button>
            <button class="copy-btn" style="background:var(--moss)" @click="regenerateSlug">↺</button>
          </div>
          <div v-if="slugCopied" style="font-size:0.6rem;color:var(--moss-light);margin-top:3px">Copied!</div>
        </div>
      </div>
    </div>

    <!-- Members Management (owner only) -->
    <div v-if="isOwner" class="detail-section members-section">
      <div class="detail-node members-node">
        <div class="node-header">INVITE COLLABORATORS</div>

        <!-- Invite form -->
        <form @submit.prevent="inviteMember" class="invite-form">
          <input v-model="inviteEmail" type="email" placeholder="email@example.com" class="invite-input" required />
          <select v-model="inviteRole" class="invite-role">
            <option value="viewer">Viewer</option>
            <option value="commenter">Commenter</option>
            <option value="editor">Editor</option>
          </select>
          <button type="submit" class="invite-btn">Invite</button>
        </form>

        <!-- Members list -->
        <div class="members-list">
          <div v-for="member in members" :key="member.id" class="member-row">
            <div class="member-info">
              <div class="member-avatar">{{ member.email.charAt(0).toUpperCase() }}</div>
              <div>
                <div class="member-email">{{ member.email }}</div>
                <div class="member-role-label">{{ member.role }}</div>
              </div>
            </div>
            <div class="member-actions">
              <select
                :value="member.role"
                @change="changeRole(member.id, $event.target.value)"
                class="role-select"
              >
                <option value="viewer">Viewer</option>
                <option value="commenter">Commenter</option>
                <option value="editor">Editor</option>
              </select>
              <button class="remove-member-btn" @click="removeMember(member.id)">&times;</button>
            </div>
          </div>
          <div v-if="members.length === 0" class="no-members">
            No members yet. Invite collaborators above.
          </div>
        </div>
      </div>
    </div>

    <!-- Subprojects -->
    <div v-if="subprojects.length > 0" class="detail-section subprojects-section">
      <div class="detail-node">
        <div class="node-header">SUBPROJECTS ({{ subprojects.length }})</div>
        <div v-for="sub in subprojects" :key="sub.id" class="subproject-card" @click="$emit('close'); $nextTick(() => galleryStore.openDetailView(sub))">
          <div class="sub-status" :class="'tag-' + sub.type">{{ displayText(sub.statusTagKey) }}</div>
          <div class="sub-title">{{ displayText(sub.titleKey) }}</div>
          <div class="sub-desc">{{ displayText(sub.descriptionKey) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGalleryStore } from '../stores/gallery'
import { useProjectsStore } from '../stores/projectsStore'
import { useAuthStore } from '../stores/auth'
import { useMembersStore } from '../stores/membersStore'
import { useContentBlocksStore } from '../stores/contentBlocksStore'
import { useRealtimeStore } from '../stores/realtimeStore'
import InlineEdit from './InlineEdit.vue'
import LinkChip from './LinkChip.vue'
import { queueTranslation, translateBlock, saveToGlossary } from '../lib/translationService'

const { t, te, locale } = useI18n()

const props = defineProps({
  project: { type: Object, required: true },
  translateX: { type: Number, default: 0 },
  translateY: { type: Number, default: 0 },
  zoom: { type: Number, default: 1 }
})

defineEmits(['close'])

const galleryStore = useGalleryStore()
const projectsStore = useProjectsStore()
const auth = useAuthStore()
const membersStore = useMembersStore()
const contentBlocksStore = useContentBlocksStore()
const realtimeStore = useRealtimeStore()

const showAddBlock = ref(false)
const hoveredBlock = ref(null)
const inviteEmail = ref('')
const inviteRole = ref('viewer')
const currentPrivacy = ref(props.project.privacy || 'private')

function displayText(value) {
  if (!value) return ''
  if (typeof value === 'object') return value[locale.value] ?? value['pt'] ?? value['en'] ?? ''
  if (typeof value === 'string' && value.includes('.') && te(value)) return t(value)
  return value
}

const canEdit = computed(() => galleryStore.canEditProject(props.project))
const isOwner = computed(() => {
  if (!auth.isLoggedIn) return false
  return props.project.owner_id === auth.userId
})

const subprojects = computed(() => {
  return galleryStore.projects.filter(p => p.parentId === props.project.id)
})

const contentBlocks = computed(() => {
  return contentBlocksStore.getBlocksByProject(props.project.id)
})

const members = computed(() => {
  return membersStore.getMembersByProject(props.project.id)
})

const privacyOptions = [
  { value: 'public', label: 'Public', icon: '\uD83C\uDF0D' },
  { value: 'private', label: 'Private', icon: '\uD83D\uDD12' },
  { value: 'link_only', label: 'Link Only', icon: '\uD83D\uDD17' }
]

const shareUrl = computed(() => {
  return `${window.location.origin}/projects/#/p/${props.project.id}`
})

// Load data on mount
onMounted(async () => {
  if (projectsStore.isSupabaseLoaded) {
    await contentBlocksStore.loadBlocks(props.project.id)
    contentBlocksStore.subscribeToBlocks(props.project.id)

    if (auth.isLoggedIn) {
      await membersStore.loadMembers(props.project.id)

      // Join realtime presence
      realtimeStore.joinChannel(`project-${props.project.id}`, {
        id: auth.userId,
        name: auth.userName,
        avatar: auth.userAvatar
      })
    }
  }
})

onUnmounted(() => {
  contentBlocksStore.unsubscribeFromBlocks()
  realtimeStore.leaveChannel()
})

async function saveField(field, value) {
  // Merge into existing JSONB — only update the current locale's value
  const current = (typeof props.project._raw?.[field] === 'object' && props.project._raw[field] !== null)
    ? props.project._raw[field]
    : {}
  const merged = { ...current, [locale.value]: value }
  await projectsStore.updateProject(props.project.id, { [field]: merged })
  queueTranslation(props.project.id, field, value, locale.value)
}

async function saveTranslation(field, { lang, text }) {
  const current = props.project._raw?.[field] ?? {}
  await projectsStore.updateProject(props.project.id, { [field]: { ...current, [lang]: text } })
  const sourceText = current[locale.value]
  if (sourceText) saveToGlossary(sourceText, locale.value, text, lang)
}

function broadcastEditing(fieldKey, editing) {
  if (!auth.isLoggedIn) return
  realtimeStore.broadcastFieldEditing(fieldKey, auth.userId, auth.userName, editing)
}

async function setPrivacy(privacy) {
  currentPrivacy.value = privacy
  await projectsStore.updatePrivacy(props.project.id, privacy)
}

function copyShareLink() {
  navigator.clipboard.writeText(shareUrl.value).catch(() => {})
}

async function addBlock(type) {
  const defaults = {
    text: { content: 'New text block...', url: null },
    image: { content: '', url: '' },
    link: { content: 'Link', url: 'https://' }
  }
  const d = defaults[type]
  await contentBlocksStore.addBlock(props.project.id, type, d.content, d.url)
  showAddBlock.value = false
}

async function updateBlock(blockId, updates) {
  // Wrap text content as JSONB so it matches the schema
  const normalized = { ...updates }
  if (typeof normalized.content === 'string') {
    normalized.content = { [locale.value]: normalized.content }
  }
  await contentBlocksStore.updateBlock(blockId, props.project.id, normalized)
  if (normalized.content) translateBlock(blockId, normalized.content, locale.value)
}

// Patches only the target lang in a block's content JSONB + saves to glossary
async function updateBlockTranslation(blockId, currentContent, { lang, text }) {
  const current = typeof currentContent === 'object' ? currentContent : {}
  const updated = { ...current, [lang]: text }
  await contentBlocksStore.updateBlock(blockId, props.project.id, { content: updated })
  const sourceText = current[locale.value]
  if (sourceText) saveToGlossary(sourceText, locale.value, text, lang)
}

async function deleteBlock(blockId) {
  await contentBlocksStore.deleteBlock(blockId, props.project.id)
}

async function inviteMember() {
  if (!inviteEmail.value) return
  await membersStore.inviteMember(props.project.id, inviteEmail.value, inviteRole.value)
  inviteEmail.value = ''
}

async function changeRole(memberId, role) {
  await membersStore.updateRole(memberId, props.project.id, role)
}

async function removeMember(memberId) {
  await membersStore.removeMember(memberId, props.project.id)
}
</script>

<style scoped>
.project-detail-canvas {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 900px;
  max-width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
  z-index: 2;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 32px;
  scrollbar-width: thin;
  scrollbar-color: var(--moss) transparent;
}

.back-button {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--moss);
  color: var(--ink);
  border: none;
  padding: 8px 16px;
  font-family: 'Space Mono', monospace;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.2s;
  width: fit-content;
}

.back-button:hover {
  background: var(--terracotta);
  transform: translateX(-4px);
}

.back-arrow {
  font-size: 1.1rem;
}

/* Presence bar */
.presence-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: fit-content;
}

.presence-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--stencil-orange);
  color: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  font-family: 'Space Mono', monospace;
}

.presence-count {
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  color: var(--moss-light);
  margin-left: 4px;
}

/* Sections */
.detail-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-row {
  display: flex;
  gap: 24px;
}

.detail-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 260px;
  max-width: 300px;
}

/* Nodes */
.detail-node {
  background: rgba(20, 20, 18, 0.95);
  border: 1px solid var(--moss);
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
}

.central-node {
  flex: 1;
  border-color: var(--terracotta);
  border-width: 2px;
}

.node-header {
  font-family: 'Courier New', monospace;
  font-size: 0.7rem;
  font-weight: bold;
  color: var(--moss);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--moss);
  padding-bottom: 8px;
}

.node-status {
  display: inline-block;
  padding: 4px 12px;
  font-size: 0.65rem;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 12px;
  border: 1px solid;
  font-family: 'Space Mono', monospace;
}

.tag-active { background: rgba(255, 95, 31, 0.2); border-color: #ff5f1f; color: #ff5f1f; }
.tag-pipeline { background: rgba(106, 125, 91, 0.2); border-color: #6a7d5b; color: #6a7d5b; }
.tag-done { background: rgba(181, 93, 58, 0.2); border-color: #b55d3a; color: #b55d3a; }

.detail-title {
  font-size: 2rem;
  line-height: 1.1;
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 12px;
  color: var(--paper);
}

.detail-description {
  font-size: 0.95rem;
  line-height: 1.6;
  opacity: 0.85;
  color: var(--paper);
  margin-bottom: 16px;
}

/* KPI */
.kpi-section {
  background: rgba(106, 125, 91, 0.1);
  border-left: 3px solid var(--moss);
  padding: 12px 16px;
  margin-top: 12px;
}

.kpi-label {
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  color: var(--moss-light);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.kpi-value {
  font-family: 'Space Mono', monospace;
  font-size: 1.4rem;
  color: var(--stencil-orange);
  font-weight: 700;
}

.kpi-detail {
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 4px;
}

/* Info items */
.node-item {
  padding: 6px 0;
  border-bottom: 1px solid rgba(106, 125, 91, 0.2);
  color: var(--paper);
  font-size: 0.9rem;
}

.axis-tag {
  display: inline-block;
  padding: 3px 8px;
  background: rgba(106, 125, 91, 0.15);
  border: 1px solid rgba(106, 125, 91, 0.3);
  color: var(--moss-light);
  font-size: 0.7rem;
  font-family: 'Space Mono', monospace;
  margin: 2px 4px 2px 0;
  text-transform: uppercase;
}

/* Meta */
.meta-detail {
  margin-bottom: 10px;
}

.meta-detail label {
  display: block;
  font-size: 0.65rem;
  color: var(--moss);
  text-transform: uppercase;
  margin-bottom: 2px;
  font-family: 'Space Mono', monospace;
}

.meta-detail span {
  color: var(--paper);
  font-size: 0.85rem;
}

/* Links */
.links-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* Content blocks */
.section-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header-bar .node-header {
  border: none;
  margin: 0;
  padding: 0;
}

.add-block-btn {
  background: rgba(255, 95, 31, 0.15);
  border: 1px solid rgba(255, 95, 31, 0.3);
  color: var(--stencil-orange);
  padding: 6px 12px;
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
}

.add-block-btn:hover {
  background: rgba(255, 95, 31, 0.3);
}

.add-block-menu {
  display: flex;
  gap: 8px;
}

.add-block-menu button {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--moss);
  color: var(--paper);
  padding: 8px 14px;
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.add-block-menu button:hover {
  border-color: var(--terracotta);
  background: rgba(255, 255, 255, 0.1);
}

.block-icon {
  font-size: 0.8rem;
  color: var(--stencil-orange);
}

.blocks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.content-block {
  position: relative;
  background: rgba(20, 20, 18, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 16px;
  transition: border-color 0.2s;
}

.content-block:hover {
  border-color: rgba(255, 255, 255, 0.2);
}

.block-text {
  color: var(--paper);
  font-size: 0.9rem;
  line-height: 1.6;
  white-space: pre-wrap;
}

.block-image {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  margin-bottom: 8px;
}

.block-image-url,
.block-link-url {
  font-size: 0.7rem;
  color: var(--moss-light);
  font-family: 'Space Mono', monospace;
}

.block-caption,
.block-link-label {
  font-size: 0.8rem;
  color: var(--paper);
  opacity: 0.8;
  margin-top: 4px;
}

.delete-block-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 50, 50, 0.2);
  border: 1px solid rgba(255, 50, 50, 0.4);
  color: #ff4444;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.delete-block-btn:hover {
  background: rgba(255, 50, 50, 0.4);
}

.no-blocks {
  padding: 24px;
  text-align: center;
  color: var(--paper);
  opacity: 0.5;
  border: 1px dashed rgba(255, 255, 255, 0.1);
}

/* Privacy */
.privacy-toggles {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.privacy-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--paper);
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Space Mono', monospace;
}

.privacy-btn:hover {
  border-color: var(--moss);
  background: rgba(255, 255, 255, 0.06);
}

.privacy-btn.active {
  border-color: var(--terracotta);
  background: rgba(181, 93, 58, 0.15);
}

.privacy-icon {
  font-size: 1.2rem;
}

.privacy-label {
  font-size: 0.7rem;
  text-transform: uppercase;
}

.share-link label {
  display: block;
  font-size: 0.65rem;
  color: var(--moss-light);
  text-transform: uppercase;
  margin-bottom: 4px;
  font-family: 'Space Mono', monospace;
}

.share-link-row {
  display: flex;
  gap: 4px;
}

.share-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--moss);
  color: var(--paper);
  padding: 6px 8px;
  font-size: 0.75rem;
  font-family: 'Space Mono', monospace;
  cursor: pointer;
}

.copy-btn {
  background: var(--moss);
  border: none;
  color: var(--paper);
  padding: 6px 12px;
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  cursor: pointer;
  text-transform: uppercase;
}

.copy-btn:hover {
  background: var(--terracotta);
  color: var(--ink);
}

/* Members */
.invite-form {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.invite-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--moss);
  color: var(--paper);
  padding: 8px 10px;
  font-size: 0.8rem;
}

.invite-input:focus {
  outline: none;
  border-color: var(--terracotta);
}

.invite-role {
  background: var(--ink);
  border: 1px solid var(--moss);
  color: var(--paper);
  padding: 4px 8px;
  font-size: 0.75rem;
  font-family: 'Space Mono', monospace;
}

.invite-btn {
  background: var(--terracotta);
  border: none;
  color: var(--ink);
  padding: 8px 14px;
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  cursor: pointer;
  text-transform: uppercase;
  white-space: nowrap;
}

.invite-btn:hover {
  background: var(--stencil-orange);
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.member-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.member-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--moss);
  color: var(--paper);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
}

.member-email {
  font-size: 0.8rem;
  color: var(--paper);
}

.member-role-label {
  font-size: 0.65rem;
  color: var(--moss-light);
  text-transform: uppercase;
}

.member-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.role-select {
  background: var(--ink);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--paper);
  padding: 2px 6px;
  font-size: 0.7rem;
}

.remove-member-btn {
  background: none;
  border: 1px solid rgba(255, 50, 50, 0.3);
  color: #ff4444;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.9rem;
}

.remove-member-btn:hover {
  background: rgba(255, 50, 50, 0.2);
}

.no-members {
  font-size: 0.8rem;
  color: var(--paper);
  opacity: 0.4;
  text-align: center;
  padding: 12px;
}

/* Subprojects */
.subproject-card {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 6px;
}

.subproject-card:hover {
  border-color: var(--terracotta);
  background: rgba(255, 255, 255, 0.06);
}

.sub-status {
  display: inline-block;
  padding: 2px 8px;
  font-size: 0.6rem;
  font-weight: bold;
  text-transform: uppercase;
  border: 1px solid;
  margin-bottom: 6px;
  font-family: 'Space Mono', monospace;
}

.sub-title {
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--paper);
  margin-bottom: 4px;
}

.sub-desc {
  font-size: 0.8rem;
  color: var(--paper);
  opacity: 0.7;
}

/* Responsive */
@media (max-width: 768px) {
  .section-row {
    flex-direction: column;
  }

  .detail-sidebar {
    max-width: 100%;
  }

  .project-detail-canvas {
    width: 100vw;
    max-width: 100vw;
    padding: 16px;
  }

  .privacy-toggles {
    flex-direction: column;
  }

  .invite-form {
    flex-direction: column;
  }
}
</style>
