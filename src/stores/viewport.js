// Viewport state and zoom/pan logic
// Matches the working test-zoom.html implementation

export function createViewportState() {
  return {
    translateX: -100,
    translateY: -100,
    zoom: 0.80,
    isDragging: false,
    isZooming: false,
    zoomTimeout: null,
    startX: 0,
    startY: 0,
    mouseX: 0,
    mouseY: 0,
    zoomBeforeDrag: 0.80
  }
}

export function createViewportGetters() {
  return {
    canvasTransform(state) {
      const tx = state.translateX
      const ty = state.translateY
      const z = state.zoom
      // No parallax/3D effects - just translate and scale
      return `translate3d(${tx}px, ${ty}px, 0) scale(${z})`
    }
  }
}

export function createViewportActions() {
  return {
    setDragging(val) {
      if (val && !this.isDragging) {
        this.zoomBeforeDrag = this.zoom
        this.zoom = Math.max(0.20, 0.35)
      } else if (!val && this.isDragging) {
        this.zoom = this.zoomBeforeDrag
      }
      this.isDragging = val
    },

    setStart(x, y) {
      this.startX = x - this.translateX
      this.startY = y - this.translateY
    },

    updateMouse(x, y) {
      this.mouseX = x
      this.mouseY = y
    },

    updateTranslate(x, y) {
      this.translateX = x - this.startX
      this.translateY = y - this.startY
      this.constrainTranslation()
    },

    adjustZoom(deltaY, mouseX, mouseY) {
      // Cancel any pending zoom end
      if (this.zoomTimeout) clearTimeout(this.zoomTimeout)
      this.isZooming = true
      
      // Store current state
      const oldZoom = this.zoom
      
      // Calculate new zoom level
      const newZoom = Math.min(Math.max(0.15, this.zoom - deltaY * 0.001), 2)
      
      // Only proceed if zoom actually changed
      if (newZoom !== oldZoom) {
        // CSS transform: translate3d(tx, ty, 0) scale(z)
        // Applied right-to-left: scale first, then translate
        // So: screenPos = worldPos * zoom + translate
        
        // Find the world point under the mouse before zoom
        const worldX = (mouseX - this.translateX) / oldZoom
        const worldY = (mouseY - this.translateY) / oldZoom
        
        // After zoom, we want the same world point under the mouse:
        // mouseX = worldX * newZoom + newTranslateX
        // So: newTranslateX = mouseX - worldX * newZoom
        const newTranslateX = mouseX - worldX * newZoom
        const newTranslateY = mouseY - worldY * newZoom
        
        // Update state
        this.zoom = newZoom
        this.translateX = newTranslateX
        this.translateY = newTranslateY
        
        // Constrain translation to keep content visible
        this.constrainTranslation()
      }
      
      // Mark zoom as complete after a short delay
      this.zoomTimeout = setTimeout(() => {
        this.isZooming = false
      }, 100)
    },

    constrainTranslation() {
      if (typeof window === 'undefined') return
      
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      // Find actual content bounds from project positions
      let minX = 0, maxX = 0, minY = 0, maxY = 0
      this.projects.forEach(p => {
        const cardWidth = p.size === 'card-lg' ? window.innerWidth * 0.2604 : p.size === 'card-md' ? window.innerWidth * 0.2083 : window.innerWidth * 0.1667
        const cardHeight = p.size === 'card-lg' ? window.innerHeight * 0.5556 : p.size === 'card-md' ? window.innerHeight * 0.4167 : window.innerHeight * 0.3519
        minX = Math.min(minX, p.position.left)
        maxX = Math.max(maxX, p.position.left + cardWidth)
        minY = Math.min(minY, p.position.top)
        maxY = Math.max(maxY, p.position.top + cardHeight)
      })
      
      // Add some padding
      const padding = window.innerWidth * 0.0521
      minX -= padding
      minY -= padding
      maxX += padding
      maxY += padding
      
      // CSS transform: translate3d(tx, ty, 0) scale(z)
      // Applied right-to-left: scale first, then translate
      // So: screenPos = worldPos * zoom + translate
      
      // For the left edge (minX) to be visible on screen (at x=0 or greater):
      // 0 <= minX * zoom + translateX
      // translateX >= -minX * zoom
      const minTranslateX = -minX * this.zoom
      
      // For the right edge (maxX) to be visible on screen (at x=viewportWidth or less):
      // maxX * zoom + translateX <= viewportWidth
      // translateX <= viewportWidth - maxX * zoom
      const maxTranslateX = viewportWidth - maxX * this.zoom
      
      // Same for Y
      const minTranslateY = -minY * this.zoom
      const maxTranslateY = viewportHeight - maxY * this.zoom
      
      // Constrain translation
      this.translateX = Math.max(minTranslateX, Math.min(maxTranslateX, this.translateX))
      this.translateY = Math.max(minTranslateY, Math.min(maxTranslateY, this.translateY))
    },

    setZoom(val) {
      this.zoom = Math.min(Math.max(0.15, val), 2)
    },

    resetMouseToCenter() {
      if (typeof window !== 'undefined') {
        this.mouseX = window.innerWidth / 2
        this.mouseY = window.innerHeight / 2
      }
    }
  }
}
