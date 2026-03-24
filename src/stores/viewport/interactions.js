// Viewport interaction handlers
// Pan, zoom, and drag logic

export function createInteractionActions() {
  return {
    updateMouse(x, y) {
      this.mouseX = x
      this.mouseY = y
    },

    setDragging(val) {
      this.isDragging = val
      if (!val) {
        this.velocityX = 0
        this.velocityY = 0
      }
    },

    setStart(x, y) {
      this.startX = x - this.translateX
      this.startY = y - this.translateY
    },

    updateTranslate(x, y) {
      this.translateX = x - this.startX
      this.translateY = y - this.startY
    },

    adjustZoom(deltaY, mouseX, mouseY) {
      if (this.zoomTimeout) clearTimeout(this.zoomTimeout)
      this.isZooming = true
      
      const oldZoom = this.zoom
      const newZoom = Math.min(Math.max(0.15, this.zoom - deltaY * 0.001), 2)
      
      if (newZoom !== oldZoom) {
        // Calculate world point under mouse
        const worldX = (mouseX - this.translateX) / oldZoom
        const worldY = (mouseY - this.translateY) / oldZoom
        
        // Keep same world point under mouse after zoom
        this.translateX = mouseX - worldX * newZoom
        this.translateY = mouseY - worldY * newZoom
        this.zoom = newZoom
      }
      
      this.zoomTimeout = setTimeout(() => {
        this.isZooming = false
      }, 100)
    },

    resetMouseToCenter() {
      if (typeof window !== 'undefined') {
        this.mouseX = window.innerWidth / 2
        this.mouseY = window.innerHeight / 2
      }
    }
  }
}
