// Main gallery viewport state and actions
// Handles pan, zoom, and centering for the main gallery view

export function createMainViewportState() {
  return {
    translateX: 0,
    translateY: 0,
    zoom: 0.7,
    isDragging: false,
    isZooming: false,
    zoomTimeout: null,
    startX: 0,
    startY: 0,
    mouseX: 0,
    mouseY: 0,
    // Momentum/inertia state
    velocityX: 0,
    velocityY: 0,
    lastMoveTime: 0,
    lastMoveX: 0,
    lastMoveY: 0,
    momentumAnimationFrame: null
  }
}

export function createMainViewportGetters() {
  return {
    canvasTransform() {
      return `translate3d(${this.translateX}px, ${this.translateY}px, 0) scale(${this.zoom})`
    }
  }
}

export function createMainViewportActions() {
  return {
    // Mouse tracking
    updateMouse(x, y) {
      this.mouseX = x
      this.mouseY = y
    },

    resetMouseToCenter() {
      if (typeof window !== 'undefined') {
        this.mouseX = window.innerWidth / 2
        this.mouseY = window.innerHeight / 2
      }
    },

    // Drag handling with momentum tracking
    setDragging(val) {
      if (val) {
        // Starting drag - stop any momentum
        this.stopMomentum()
        this.isDragging = true
      } else {
        // Ending drag - start momentum animation
        this.isDragging = false
        this.startMomentum()
      }
    },

    setStart(x, y) {
      this.startX = x - this.translateX
      this.startY = y - this.translateY
      this.lastMoveX = x
      this.lastMoveY = y
      this.lastMoveTime = performance.now()
    },

    updateTranslate(x, y) {
      const now = performance.now()
      const dt = Math.max(1, now - this.lastMoveTime)
      
      // Calculate velocity based on movement
      const dx = x - this.lastMoveX
      const dy = y - this.lastMoveY
      
      this.velocityX = dx / dt * 16 // Normalize to 60fps
      this.velocityY = dy / dt * 16
      
      this.translateX = x - this.startX
      this.translateY = y - this.startY
      
      this.lastMoveX = x
      this.lastMoveY = y
      this.lastMoveTime = now
    },

    // Momentum animation
    startMomentum() {
      // Only start momentum if velocity is significant
      const speed = Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2)
      if (speed < 0.5) {
        this.velocityX = 0
        this.velocityY = 0
        return
      }

      const animate = () => {
        // Apply friction (0.92 = 8% friction per frame)
        const friction = 0.92
        this.velocityX *= friction
        this.velocityY *= friction
        
        // Apply velocity to position
        this.translateX += this.velocityX
        this.translateY += this.velocityY
        
        // Stop when velocity is very small
        const currentSpeed = Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2)
        if (currentSpeed > 0.1 && !this.isDragging) {
          this.momentumAnimationFrame = requestAnimationFrame(animate)
        } else {
          this.velocityX = 0
          this.velocityY = 0
          this.momentumAnimationFrame = null
        }
      }
      
      this.momentumAnimationFrame = requestAnimationFrame(animate)
    },

    stopMomentum() {
      if (this.momentumAnimationFrame) {
        cancelAnimationFrame(this.momentumAnimationFrame)
        this.momentumAnimationFrame = null
      }
      this.velocityX = 0
      this.velocityY = 0
    },

    // Zoom handling - optimized
    adjustZoom(deltaY, mouseX, mouseY) {
      // Stop momentum when zooming
      this.stopMomentum()
      
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
      }, 150)
    },

    // Centering - simple viewport center calculation
    centerOnFirstProject() {
      // Stop momentum when centering
      this.stopMomentum()
      
      if (typeof window === 'undefined') return
      
      const layout = this.layoutProjects
      if (!layout || layout.projects.length === 0) {
        console.warn('⚠️ No layout or projects available for centering')
        return
      }
      
      // Find first active project
      const firstProject = layout.projects.find(p => p.type === 'active') || layout.projects[0]
      
      // Get position - must use computedPosition from layout
      const position = firstProject.computedPosition
      if (!position) {
        console.error('❌ No computedPosition for project:', firstProject.id)
        return
      }
      
      // Get card size - use default sizes, not calculated (which may not be ready yet)
      const cardSize = this.cardSizes[firstProject.size] || this.cardSizes['card-md']
      
      // Calculate card center in world space
      const cardCenterX = position.left + cardSize.width / 2
      const cardCenterY = position.top + cardSize.height / 2
      
      // Calculate viewport center
      const viewportCenterX = window.innerWidth / 2
      const viewportCenterY = window.innerHeight / 2
      
      // Transform formula: screenPos = worldPos * zoom + translate
      // To center: viewportCenter = cardCenter * zoom + translate
      // Therefore: translate = viewportCenter - cardCenter * zoom
      this.translateX = viewportCenterX - (cardCenterX * this.zoom)
      this.translateY = viewportCenterY - (cardCenterY * this.zoom)
      
      console.log('🎯 centerOnFirstProject:', {
        projectId: firstProject.id,
        position,
        cardSize,
        cardCenter: { x: cardCenterX, y: cardCenterY },
        viewport: { width: window.innerWidth, height: window.innerHeight, center: { x: viewportCenterX, y: viewportCenterY } },
        zoom: this.zoom,
        result: { translateX: this.translateX, translateY: this.translateY },
        verification: {
          screenX: cardCenterX * this.zoom + this.translateX,
          screenY: cardCenterY * this.zoom + this.translateY,
          expectedX: viewportCenterX,
          expectedY: viewportCenterY,
          errorX: Math.abs((cardCenterX * this.zoom + this.translateX) - viewportCenterX),
          errorY: Math.abs((cardCenterY * this.zoom + this.translateY) - viewportCenterY)
        }
      })
    },

    centerOnSection(type) {
      // Stop momentum when centering
      this.stopMomentum()
      
      if (typeof window === 'undefined') return
      
      const layout = this.layoutProjects
      const firstOfKind = layout.projects.find(p => p.type === type)
      
      if (!firstOfKind) {
        console.warn('⚠️ No project found for type:', type)
        return
      }
      
      const position = firstOfKind.computedPosition
      if (!position) {
        console.error('❌ No computedPosition for project:', firstOfKind.id)
        return
      }
      
      const cardSize = this.cardSizes[firstOfKind.size] || this.cardSizes['card-md']
      
      const cardCenterX = position.left + cardSize.width / 2
      const cardCenterY = position.top + cardSize.height / 2
      
      const viewportCenterX = window.innerWidth / 2
      const viewportCenterY = window.innerHeight / 2
      
      this.zoom = 0.8
      this.translateX = viewportCenterX - (cardCenterX * this.zoom)
      this.translateY = viewportCenterY - (cardCenterY * this.zoom)
      
      console.log('🎯 centerOnSection:', {
        type,
        projectId: firstOfKind.id,
        position,
        result: { translateX: this.translateX, translateY: this.translateY, zoom: this.zoom }
      })
    }
  }
}
