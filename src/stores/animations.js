// Animation state and logic

export function createAnimationState() {
  return {
    animationComplete: false,
    cardAnimations: {}
  }
}

export function createAnimationGetters() {
  return {
    cardStyle: (state) => (project) => {
      const anim = state.cardAnimations[project.id]
      if (!anim) return {}
      return {
        opacity: anim.opacity,
        transform: anim.transform,
        top: `${project.position.top}px`,
        left: `${project.position.left}px`
      }
    },

    cardOpacity(state) {
      return (project) => {
        if (!state.focusedType) return undefined
        return project.type === state.focusedType ? '1' : '0.2'
      }
    },

    coordsDisplay(state) {
      return `EG_SA // X: ${Math.round(state.mouseX)} // Y: ${Math.round(state.mouseY)}`
    }
  }
}

export function createAnimationActions() {
  return {
    triggerEntryAnimation() {
      this.projects.forEach((project, i) => {
        this.cardAnimations[project.id] = {
          opacity: '0',
          transform: 'translateZ(' + (-window.innerWidth * 0.5208) + 'px)'
        }
        setTimeout(() => {
          this.cardAnimations[project.id] = {
            opacity: '1',
            transform: 'translateZ(0)'
          }
        }, 100 * i)
      })
      this.animationComplete = true
    }
  }
}
