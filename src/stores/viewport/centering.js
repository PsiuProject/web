// Viewport centering utilities
// Handles all viewport centering calculations

/**
 * Calculate viewport transform to center a world point
 * @param {number} worldX - X coordinate in world space
 * @param {number} worldY - Y coordinate in world space
 * @param {number} zoom - Current zoom level
 * @param {number} viewportWidth - Viewport width in pixels
 * @param {number} viewportHeight - Viewport height in pixels
 * @returns {{ translateX: number, translateY: number }}
 */
export function centerOnPoint(worldX, worldY, zoom, viewportWidth, viewportHeight) {
  // Transform formula: screenPos = worldPos * zoom + translate
  // To center: viewportCenter = worldPos * zoom + translate
  // Therefore: translate = viewportCenter - worldPos * zoom
  
  const translateX = (viewportWidth / 2) - (worldX * zoom)
  const translateY = (viewportHeight / 2) - (worldY * zoom)
  
  console.log('🎯 centerOnPoint:', {
    input: { worldX, worldY, zoom, viewportWidth, viewportHeight },
    output: { translateX, translateY },
    verification: {
      screenX: worldX * zoom + translateX,
      screenY: worldY * zoom + translateY,
      expectedX: viewportWidth / 2,
      expectedY: viewportHeight / 2
    }
  })
  
  return { translateX, translateY }
}

/**
 * Calculate the center point of a card in world coordinates
 * @param {Object} position - Card position { left, top }
 * @param {Object} size - Card size { width, height }
 * @returns {{ x: number, y: number }}
 */
export function getCardCenter(position, size) {
  return {
    x: position.left + size.width / 2,
    y: position.top + size.height / 2
  }
}

/**
 * Center viewport on a project card
 * @param {Object} project - Project with position data
 * @param {Object} cardSize - Card dimensions { width, height }
 * @param {number} zoom - Target zoom level
 * @param {number} viewportWidth - Viewport width
 * @param {number} viewportHeight - Viewport height
 * @returns {{ translateX: number, translateY: number, zoom: number }}
 */
export function centerOnCard(project, cardSize, zoom, viewportWidth, viewportHeight) {
  console.log('🎯 centerOnCard called:', {
    projectId: project.id,
    hasComputedPosition: !!project.computedPosition,
    hasPosition: !!project.position,
    computedPosition: project.computedPosition,
    position: project.position,
    cardSize,
    zoom
  })
  
  // Get card position (prefer computedPosition)
  const position = project.computedPosition || project.position
  
  if (!position) {
    console.error('❌ No position data for project:', project.id)
    return { translateX: 0, translateY: 0, zoom }
  }
  
  // Calculate card center in world coordinates
  const cardCenter = getCardCenter(position, cardSize)
  
  console.log('🎯 Card center calculated:', cardCenter)
  
  // Calculate viewport transform to center the card
  const { translateX, translateY } = centerOnPoint(
    cardCenter.x,
    cardCenter.y,
    zoom,
    viewportWidth,
    viewportHeight
  )
  
  console.log('🎯 Final centering result:', {
    projectId: project.id,
    position,
    cardSize,
    cardCenter,
    zoom,
    viewport: { width: viewportWidth, height: viewportHeight },
    result: { translateX, translateY },
    verification: {
      screenX: cardCenter.x * zoom + translateX,
      screenY: cardCenter.y * zoom + translateY,
      expectedX: viewportWidth / 2,
      expectedY: viewportHeight / 2,
      errorX: Math.abs((cardCenter.x * zoom + translateX) - (viewportWidth / 2)),
      errorY: Math.abs((cardCenter.y * zoom + translateY) - (viewportHeight / 2))
    }
  })
  
  return { translateX, translateY, zoom }
}
