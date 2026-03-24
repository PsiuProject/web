// Project detail viewport state and actions
// Handles viewport for detail view with centering on selected project

export function createProjectViewportState() {
  return {
    galleryViewCache: {
      translateX: 0,
      translateY: 0,
      zoom: 0.7
    }
  }
}

export function createProjectViewportGetters() {
  return {
    // No getters needed - using main viewport transform
  }
}

export function createProjectViewportActions() {
  return {
    // Cache current gallery view before opening detail
    cacheGalleryView() {
      this.galleryViewCache = {
        translateX: this.translateX,
        translateY: this.translateY,
        zoom: this.zoom
      }
    },

    // Restore gallery view from cache
    restoreGalleryView() {
      this.translateX = this.galleryViewCache.translateX
      this.translateY = this.galleryViewCache.translateY
      this.zoom = this.galleryViewCache.zoom
    },

    // Center on a specific project for detail view
    centerOnProject(project) {
      if (typeof window === 'undefined') return
      
      // Detail view has its own canvas with fixed layout
      // Central node is at left: 41.67vw (800px), top: 37.04vh (400px) in ProjectDetail.vue
      // Detail canvas is 125vw (2400px) x 129.63vh (1400px)
      
      const detailCanvasWidth = window.innerWidth * 1.25
      const detailCanvasHeight = window.innerHeight * 1.2963
      
      // Central node position in detail canvas
      const centralNodeLeft = window.innerWidth * 0.4167
      const centralNodeTop = window.innerHeight * 0.3704
      
      // Central node size (approximate from ProjectDetail styles)
      const centralNodeWidth = window.innerWidth * 0.2083
      const centralNodeHeight = window.innerHeight * 0.2778 // approximate
      
      // Calculate center of the central node
      const nodeCenterX = centralNodeLeft + centralNodeWidth / 2
      const nodeCenterY = centralNodeTop + centralNodeHeight / 2
      
      // Dynamic zoom based on card size
      const baseZoom = 0.85
      const isSmallCard = project.size === 'card-sm' || project.size === 'card-xs'
      const detailZoom = isSmallCard ? baseZoom + 0.15 : baseZoom
      
      // Calculate viewport center
      const viewportCenterX = window.innerWidth / 2
      const viewportCenterY = window.innerHeight / 2
      
      // Transform formula: screenPos = worldPos * zoom + translate
      // To center: viewportCenter = nodeCenter * zoom + translate
      // Therefore: translate = viewportCenter - nodeCenter * zoom
      this.translateX = viewportCenterX - (nodeCenterX * detailZoom)
      this.translateY = viewportCenterY - (nodeCenterY * detailZoom)
      this.zoom = detailZoom
      
      console.log('🎯 centerOnProject (detail view):', {
        projectId: project.id,
        detailCanvas: { width: detailCanvasWidth, height: detailCanvasHeight },
        centralNode: { left: centralNodeLeft, top: centralNodeTop, width: centralNodeWidth, height: centralNodeHeight },
        nodeCenter: { x: nodeCenterX, y: nodeCenterY },
        viewport: { width: window.innerWidth, height: window.innerHeight },
        zoom: detailZoom,
        result: { translateX: this.translateX, translateY: this.translateY },
        verification: {
          screenX: nodeCenterX * detailZoom + this.translateX,
          screenY: nodeCenterY * detailZoom + this.translateY,
          expectedX: viewportCenterX,
          expectedY: viewportCenterY
        }
      })
    }
  }
}
