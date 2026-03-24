// Filter state and logic

export function createFilterState() {
  return {
    activeFilter: 'todos',
    activeAxisFilter: null,
    focusedType: null
  }
}

export function createFilterGetters() {
  return {
    filteredProjects(state) {
      let filtered = state.projects
      
      // Filter by section type (active/pipeline/done)
      if (state.focusedType) {
        filtered = filtered.filter(p => p.type === state.focusedType)
      }
      
      // Filter by territory
      if (state.activeFilter && state.activeFilter !== 'todos') {
        filtered = filtered.filter(p => p.territory === state.activeFilter)
      }
      
      // Filter by axis
      if (state.activeAxisFilter) {
        filtered = filtered.filter(p => 
          p.axis && p.axis.includes(state.activeAxisFilter)
        )
      }
      
      return filtered
    },

    filteredSeparators(state) {
      if (!state.focusedType) return state.separators
      const typeToLabel = {
        active: 'EM EXECUÇÃO',
        pipeline: 'PIPELINE / ESCRITA',
        done: 'CONCLUÍDOS'
      }
      return state.separators.filter(s => s.label === typeToLabel[state.focusedType])
    }
  }
}

export function createFilterActions() {
  return {
    focusSection(type) {
      const firstOfKind = this.projects.find(p => p.type === type)
      if (firstOfKind) {
        this.translateX = -firstOfKind.position.left + (typeof window !== 'undefined' ? window.innerWidth / 2 : 960) - 250
        this.translateY = -firstOfKind.position.top + (typeof window !== 'undefined' ? window.innerHeight / 2 : 540) - 300
        this.zoom = 0.8
        this.focusedType = type
      }
    },

    clearFocus() {
      this.focusedType = null
    }
  }
}
