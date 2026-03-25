import { defineStore } from 'pinia'
import { useProjectsStore } from './projectsStore'
import { useAuthStore } from './auth'
import { useMembersStore } from './membersStore'
import { createMainViewportState, createMainViewportGetters, createMainViewportActions } from './viewport/mainViewport'
import { createProjectViewportState, createProjectViewportGetters, createProjectViewportActions } from './viewport/projectViewport'
import { startViewportDebug, stopViewportDebug, logViewportSnapshot } from './viewport/debug'

export const useGalleryStore = defineStore('gallery', {
  state: () => ({
    cardSizes: {
      'card-sm': { width: 210, height: 280 },
      'card-md': { width: 280, height: 370 },
      'card-lg': { width: 360, height: 460 }
    },

    calculatedCardSizes: {},

    ...createMainViewportState(),
    ...createProjectViewportState(),

    activeFilter: 'todos',
    activeAxisFilter: null,
    activeCategoryFilter: null,
    activeYearFilter: null,
    focusedType: null,

    detailViewProject: null,
    detailViewActive: false,
    detailViewAnimated: false,

    animationComplete: false,
    cardAnimations: {},

    // Drag-and-drop state for card repositioning
    draggedCardId: null,
    isDraggingCard: false
  }),

  getters: {
    ...createMainViewportGetters(),
    ...createProjectViewportGetters(),

    // Get gallery-formatted projects from the projects store
    projects() {
      const projectsStore = useProjectsStore()
      return projectsStore.galleryProjects
    },

    filteredProjects(state) {
      let filtered = this.projects

      if (state.focusedType) {
        filtered = filtered.filter(p => p.type === state.focusedType)
      }

      if (state.activeFilter && state.activeFilter !== 'todos') {
        filtered = filtered.filter(p => p.territory === state.activeFilter)
      }

      if (state.activeAxisFilter) {
        filtered = filtered.filter(p => p.axis && p.axis.includes(state.activeAxisFilter))
      }

      if (state.activeCategoryFilter) {
        filtered = filtered.filter(p => p.category === state.activeCategoryFilter)
      }

      if (state.activeYearFilter) {
        filtered = filtered.filter(p => p.year === state.activeYearFilter)
      }

      return filtered
    },

    projectConnections(state) {
      const filtered = this.filteredProjects
      const filteredIds = new Set(filtered.map(p => p.id))

      return filtered
        .filter(p => p.parentId && filteredIds.has(p.parentId))
        .map(p => ({
          id: p.id,
          parentId: p.parentId,
          connectionTypeKey: p.connectionTypeKey,
          childProject: p,
          parentProject: filtered.find(ep => ep.id === p.parentId)
        }))
    },

    getConnectionCount(state) {
      return (projectId) => {
        return this.projects.filter(p => p.parentId === projectId).length
      }
    },

    // Check if current user can edit a project
    canEditProject() {
      return (project) => {
        const auth = useAuthStore()
        if (!auth.isLoggedIn) return false
        if (project.owner_id === auth.userId) return true
        const members = useMembersStore()
        return members.isEditor(project.id, auth.userId)
      }
    },

    // Check if current user can view a project
    canViewProject() {
      return (project) => {
        if (project.privacy === 'public' || project.privacy === 'link_only') return true
        const auth = useAuthStore()
        if (!auth.isLoggedIn) return false
        if (project.owner_id === auth.userId) return true
        const members = useMembersStore()
        return !!members.getUserRole(project.id, auth.userId)
      }
    },

    layoutProjects(state) {
      const filtered = this.filteredProjects

      const PADDING = 100
      const VERTICAL_GAP = 150
      const SECTION_GAP = 350
      const SUB_PROJECT_GAP = 80
      const HORIZONTAL_GAP = 100

      const getCardDims = (project) => {
        const calculated = this.calculatedCardSizes[project.id]
        if (calculated) return { w: calculated.width, h: calculated.height }
        const defaultSize = this.cardSizes[project.size] || this.cardSizes['card-md']
        return { w: defaultSize.width, h: defaultSize.height }
      }

      const sections = {
        active: { label: 'EM EXECUCAO', top: 150, projects: [], color: '#ff5f1f' },
        pipeline: { label: 'PIPELINE / ESCRITA', top: 0, projects: [], color: '#6a7d5b' },
        done: { label: 'CONCLUIDOS', top: 0, projects: [], color: '#b55d3a' }
      }

      const rootProjects = filtered.filter(p => !p.parentId)
      const subProjects = filtered.filter(p => p.parentId)

      rootProjects.forEach(p => {
        if (sections[p.type]) {
          sections[p.type].projects.push(p)
        }
      })

      const positionedProjects = []
      const occupiedRects = []

      const checkCollision = (left, top, width, height) => {
        const padding = 10
        for (const rect of occupiedRects) {
          if (
            left < rect.right + padding &&
            left + width > rect.left - padding &&
            top < rect.bottom + padding &&
            top + height > rect.top - padding
          ) {
            return true
          }
        }
        return false
      }

      const findNextAvailablePosition = (width, height, startY) => {
        let testTop = startY
        let testLeft = PADDING
        const maxX = 3000
        let attempts = 0
        const maxAttempts = 1000

        while (attempts < maxAttempts) {
          if (!checkCollision(testLeft, testTop, width, height)) {
            return { left: testLeft, top: testTop }
          }
          testLeft += width + HORIZONTAL_GAP
          if (testLeft + width > maxX) {
            testLeft = PADDING
            testTop += 50
          }
          attempts++
        }
        return { left: PADDING, top: testTop }
      }

      const markOccupied = (left, top, width, height) => {
        occupiedRects.push({ left, top, right: left + width, bottom: top + height })
      }

      let currentSectionTop = sections.active.top

      Object.entries(sections).forEach(([type, section]) => {
        if (section.projects.length === 0) return

        section.top = currentSectionTop

        const sortedProjects = [...section.projects].sort((a, b) => {
          const connA = this.getConnectionCount(a.id)
          const connB = this.getConnectionCount(b.id)
          return connB - connA
        })

        let rowTop = section.top
        let rowLeft = PADDING
        let maxRowHeight = 0
        let cardsInRow = 0

        sortedProjects.forEach((project) => {
          const dims = getCardDims(project)
          const cardWidth = dims.w
          const cardHeight = dims.h

          let left = rowLeft
          let top = rowTop

          if (checkCollision(left, top, cardWidth, cardHeight)) {
            const nextPos = findNextAvailablePosition(cardWidth, cardHeight, rowTop)
            left = nextPos.left
            top = nextPos.top
          }

          positionedProjects.push({
            ...project,
            computedPosition: { left, top }
          })

          markOccupied(left, top, cardWidth, cardHeight)

          rowLeft = left + cardWidth + HORIZONTAL_GAP
          maxRowHeight = Math.max(maxRowHeight, cardHeight)
          cardsInRow++

          const children = subProjects.filter(sp => sp.parentId === project.id)
          let totalChildrenHeight = 0

          if (children.length > 0) {
            const childStartTop = top + cardHeight + SUB_PROJECT_GAP
            let childTop = childStartTop
            let childLeft = left
            let rowChildrenHeight = 0

            children.forEach((child) => {
              const childDims = getCardDims(child)
              const childWidth = childDims.w
              const childHeight = childDims.h

              if (checkCollision(childLeft, childTop, childWidth, childHeight)) {
                const nextPos = findNextAvailablePosition(childWidth, childHeight, childTop)
                childLeft = nextPos.left
                childTop = nextPos.top
              }

              positionedProjects.push({
                ...child,
                computedPosition: { left: childLeft, top: childTop }
              })

              markOccupied(childLeft, childTop, childWidth, childHeight)

              rowChildrenHeight = Math.max(rowChildrenHeight, childHeight)
              totalChildrenHeight = Math.max(totalChildrenHeight, childTop - childStartTop + childHeight)
              childLeft += childWidth + HORIZONTAL_GAP
            })
          }

          const cardTotalHeight = cardHeight + totalChildrenHeight + (children.length > 0 ? SUB_PROJECT_GAP : 0)
          maxRowHeight = Math.max(maxRowHeight, cardTotalHeight)
        })

        let maxY = currentSectionTop
        occupiedRects.forEach(rect => {
          maxY = Math.max(maxY, rect.bottom)
        })
        currentSectionTop = maxY + SECTION_GAP
      })

      return {
        projects: positionedProjects,
        separators: []
      }
    },

    filteredSeparators(state) {
      const layout = this.layoutProjects
      const sections = {
        active: { label: 'EM EXECUCAO', color: '#ff5f1f', projects: [] },
        pipeline: { label: 'PIPELINE / ESCRITA', color: '#6a7d5b', projects: [] },
        done: { label: 'CONCLUIDOS', color: '#b55d3a', projects: [] }
      }

      layout.projects.forEach(p => {
        if (!p.parentId && sections[p.type]) {
          sections[p.type].projects.push(p)
        }
      })

      const separators = []
      Object.entries(sections).forEach(([type, section]) => {
        if (section.projects.length > 0) {
          const topProject = section.projects.reduce((min, p) =>
            p.computedPosition.top < min.computedPosition.top ? p : min
          )
          separators.push({
            label: section.label,
            color: section.color,
            top: topProject.computedPosition.top - 50,
            left: 0,
            width: 2600
          })
        }
      })

      return separators.sort((a, b) => a.top - b.top)
    },

    coordsDisplay(state) {
      return `EG_SA // X: ${Math.round(state.mouseX)} // Y: ${Math.round(state.mouseY)}`
    }
  },

  actions: {
    ...createMainViewportActions(),
    ...createProjectViewportActions(),

    startDebug() {
      startViewportDebug(this)
    },

    stopDebug() {
      stopViewportDebug()
    },

    logSnapshot(label) {
      logViewportSnapshot(this, label)
    },

    focusSection(type) {
      this.centerOnSection(type)
      this.focusedType = type
    },

    clearFocus() {
      this.focusedType = null
    },

    triggerEntryAnimation() {
      const layout = this.layoutProjects
      this.centerOnFirstProject()

      setTimeout(() => {
        this.centerOnFirstProject()
      }, 50)

      this.projects.forEach((project, i) => {
        this.cardAnimations[project.id] = {
          opacity: '0',
          transform: 'translateZ(-500px)'
        }
        setTimeout(() => {
          this.cardAnimations[project.id] = {
            opacity: '1',
            transform: 'translateZ(0)'
          }
        }, 50 * i)
      })
      this.animationComplete = true
    },

    openDetailView(project) {
      this.cacheGalleryView()
      this.detailViewProject = project
      this.detailViewAnimated = false
      this.centerOnProject(project)
      setTimeout(() => {
        this.detailViewActive = true
        setTimeout(() => {
          this.detailViewAnimated = true
        }, 50)
      }, 100)
    },

    closeDetailView() {
      this.detailViewAnimated = false
      setTimeout(() => {
        this.detailViewActive = false
        setTimeout(() => {
          this.restoreGalleryView()
          this.detailViewProject = null
        }, 300)
      }, 50)
    },

    calculateCardSize(project) {
      const baseWidth = 240
      const padding = 30

      const resolveText = (v) => typeof v === 'object' && v !== null ? (v.pt || v.en || '') : (v || '')
      const titleLength = resolveText(project.titleKey || project.title).length || 20
      const descLength = resolveText(project.descriptionKey || project.description).length || 50
      const metaCount = project.meta ? project.meta.length : 0
      const hasKpi = project.kpiValue ? 1 : 0

      const connectionCount = this.getConnectionCount(project.id)

      const titleHeight = Math.ceil(titleLength / 25) * 24
      const descHeight = Math.ceil(descLength / 40) * 19
      const kpiHeight = hasKpi ? 62 : 0
      const metaHeight = metaCount * 40
      const baseHeight = 170
      const calculatedHeight = baseHeight + titleHeight + descHeight + kpiHeight + metaHeight + padding
      const connectionBonus = Math.min(connectionCount * 15, 60)

      const width = Math.max(210, Math.min(430, baseWidth + Math.floor(descLength / 3) + connectionBonus))
      const height = Math.max(240, Math.min(620, calculatedHeight))

      return { width, height }
    },

    updateCardSize(projectId, dimensions) {
      this.calculatedCardSizes[projectId] = dimensions
    },

    // Card drag-and-drop for repositioning
    startCardDrag(cardId) {
      this.draggedCardId = cardId
      this.isDraggingCard = true
    },

    endCardDrag() {
      this.draggedCardId = null
      this.isDraggingCard = false
    }
  }
})
