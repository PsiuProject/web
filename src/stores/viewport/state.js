// Viewport state management
// Centralized viewport state structure

export function createViewportState() {
  return {
    translateX: 0,
    translateY: 0,
    zoom: 0.4,
    isDragging: false,
    isZooming: false,
    zoomTimeout: null,
    startX: 0,
    startY: 0,
    mouseX: 0,
    mouseY: 0,
    velocityX: 0,
    velocityY: 0
  }
}

export function createViewportGetters() {
  return {
    canvasTransform(state) {
      return `translate3d(${state.translateX}px, ${state.translateY}px, 0) scale(${state.zoom})`
    }
  }
}
