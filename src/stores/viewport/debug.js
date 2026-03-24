// Viewport debug utilities
// Real-time viewport position monitoring

let debugInterval = null

/**
 * Start continuous viewport position logging
 * @param {Object} store - Gallery store instance
 */
export function startViewportDebug(store) {
  if (debugInterval) {
    stopViewportDebug()
  }

  console.log('🔍 VIEWPORT DEBUG STARTED - Logging every 2 seconds')
  console.log('📍 Use arrow keys or drag to adjust viewport, then tell me the correct values')
  
  debugInterval = setInterval(() => {
    if (typeof window === 'undefined') return
    
    const vw = window.innerWidth
    const vh = window.innerHeight
    
    // Get first active project for reference
    const layout = store.layoutProjects
    const firstProject = layout.projects.find(p => p.type === 'active') || layout.projects[0]
    
    if (!firstProject) return
    
    const pos = firstProject.computedPosition || firstProject.position
    const cardSize = store.calculatedCardSizes[firstProject.id] || 
                    store.cardSizes[firstProject.size] || 
                    store.cardSizes['card-md']
    
    const cardCenterX = pos.left + cardSize.width / 2
    const cardCenterY = pos.top + cardSize.height / 2
    
    // Calculate where the card center appears on screen
    const screenX = cardCenterX * store.zoom + store.translateX
    const screenY = cardCenterY * store.zoom + store.translateY
    
    // Calculate what translate values would center it
    const correctTranslateX = (vw / 2) - (cardCenterX * store.zoom)
    const correctTranslateY = (vh / 2) - (cardCenterY * store.zoom)
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎯 VIEWPORT DEBUG SNAPSHOT')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📐 Viewport:', { width: vw, height: vh, center: { x: vw/2, y: vh/2 } })
    console.log('🎴 First Card:', { 
      id: firstProject.id, 
      worldPos: pos,
      worldCenter: { x: cardCenterX, y: cardCenterY },
      size: cardSize
    })
    console.log('🔢 Current Transform:', {
      translateX: store.translateX.toFixed(2),
      translateY: store.translateY.toFixed(2),
      zoom: store.zoom.toFixed(3)
    })
    console.log('📍 Card Screen Position:', {
      x: screenX.toFixed(2),
      y: screenY.toFixed(2),
      offsetFromCenter: {
        x: (screenX - vw/2).toFixed(2),
        y: (screenY - vh/2).toFixed(2)
      }
    })
    console.log('✅ Correct Values for Centering:', {
      translateX: correctTranslateX.toFixed(2),
      translateY: correctTranslateY.toFixed(2),
      zoom: store.zoom.toFixed(3)
    })
    console.log('❌ Current Error:', {
      translateX: (store.translateX - correctTranslateX).toFixed(2),
      translateY: (store.translateY - correctTranslateY).toFixed(2)
    })
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  }, 2000)
}

/**
 * Stop viewport position logging
 */
export function stopViewportDebug() {
  if (debugInterval) {
    clearInterval(debugInterval)
    debugInterval = null
    console.log('🔍 VIEWPORT DEBUG STOPPED')
  }
}

/**
 * Log a single viewport snapshot
 * @param {Object} store - Gallery store instance
 * @param {string} label - Label for this snapshot
 */
export function logViewportSnapshot(store, label = 'SNAPSHOT') {
  if (typeof window === 'undefined') return
  
  const vw = window.innerWidth
  const vh = window.innerHeight
  
  const layout = store.layoutProjects
  const firstProject = layout.projects.find(p => p.type === 'active') || layout.projects[0]
  
  if (!firstProject) return
  
  const pos = firstProject.computedPosition || firstProject.position
  const cardSize = store.calculatedCardSizes[firstProject.id] || 
                  store.cardSizes[firstProject.size] || 
                  store.cardSizes['card-md']
  
  const cardCenterX = pos.left + cardSize.width / 2
  const cardCenterY = pos.top + cardSize.height / 2
  
  const screenX = cardCenterX * store.zoom + store.translateX
  const screenY = cardCenterY * store.zoom + store.translateY
  
  const correctTranslateX = (vw / 2) - (cardCenterX * store.zoom)
  const correctTranslateY = (vh / 2) - (cardCenterY * store.zoom)
  
  console.log(`📸 ${label}:`, {
    viewport: { width: vw, height: vh },
    current: { 
      translateX: store.translateX.toFixed(2), 
      translateY: store.translateY.toFixed(2), 
      zoom: store.zoom.toFixed(3) 
    },
    cardScreenPos: { x: screenX.toFixed(2), y: screenY.toFixed(2) },
    shouldBe: { 
      translateX: correctTranslateX.toFixed(2), 
      translateY: correctTranslateY.toFixed(2) 
    },
    error: {
      x: (store.translateX - correctTranslateX).toFixed(2),
      y: (store.translateY - correctTranslateY).toFixed(2)
    }
  })
}
