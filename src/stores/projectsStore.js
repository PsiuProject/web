// Projects store - Supabase-backed project CRUD with realtime
// Replaces hardcoded data with live database queries
import { defineStore } from 'pinia'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { projectsData as fallbackData } from './data/projects'

export const useProjectsStore = defineStore('projects', {
  state: () => ({
    projects: [],
    loading: false,
    error: null,
    realtimeChannel: null,
    // Track whether we've loaded from Supabase
    isSupabaseLoaded: false
  }),

  getters: {
    getProject: (state) => (id) => state.projects.find(p => p.id === id),

    rootProjects: (state) => state.projects.filter(p => !p.parent_id),

    getChildren: (state) => (parentId) =>
      state.projects.filter(p => p.parent_id === parentId),

    getChildCount: (state) => (projectId) =>
      state.projects.filter(p => p.parent_id === projectId).length,

    projectsByStatus: (state) => (status) =>
      state.projects.filter(p => p.status === status),

    // Convert Supabase format to the format the gallery expects
    galleryProjects: (state) => {
      return state.projects.map(p => ({
        id: p.id,
        type: p.status,
        size: p.size || 'card-md',
        year: p.year,
        statusTagKey: p.status_tag || `status.${p.status}`,
        titleKey: p.title,        // JSONB {pt,en} or legacy string
        descriptionKey: p.description,
        territory: p.territory || 'Brasil',
        axis: p.axis || [],
        category: p.category,
        kpiLabelKey: p.kpi_label,
        kpiValue: p.kpi_value,
        kpiDetail: p.kpi_detail,
        meta: p.meta || [],
        links: p.links || [],
        parentId: p.parent_id,
        connectionTypeKey: p.connection_type,
        privacy: p.privacy || 'private',
        share_slug: p.share_slug || null,
        owner_id: p.owner_id,
        position_x: p.position_x || 0,
        position_y: p.position_y || 0,
        _raw: p
      }))
    }
  },

  actions: {
    // Load projects from Supabase, fallback to hardcoded data
    async loadProjects() {
      this.loading = true
      this.error = null

      if (!isSupabaseConfigured) {
        this.useFallbackData()
        this.loading = false
        return
      }

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: true })

        if (error) throw error

        if (data && data.length > 0) {
          this.projects = data
          this.isSupabaseLoaded = true
        } else {
          // Fallback to hardcoded data if DB is empty
          this.useFallbackData()
        }
      } catch (err) {
        console.warn('[Projects] Supabase load failed, using fallback data:', err.message)
        this.useFallbackData()
      }

      this.loading = false
    },

    // Use hardcoded data as fallback
    useFallbackData() {
      this.projects = fallbackData.map(p => ({
        id: p.id,
        title: p.titleKey,        // i18n key string — displayText handles it
        description: p.descriptionKey,
        status: p.type,
        status_tag: p.statusTagKey,
        privacy: 'public',
        size: p.size,
        territory: p.territory,
        axis: p.axis,
        category: p.category,
        year: p.year,
        parent_id: p.parentId || null,
        connection_type: p.connectionTypeKey,
        kpi_label: p.kpiLabelKey,
        kpi_value: p.kpiValue,
        kpi_detail: p.kpiDetail,
        meta: p.meta,
        links: p.links || [],
        position_x: 0,
        position_y: 0,
        owner_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
      this.isSupabaseLoaded = false
    },

    // Create a new project
    async createProject(projectData) {
      // Auto-inject owner_id from current auth session
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('projects')
        .insert({ ...projectData, owner_id: user?.id })
        .select()
        .single()

      if (error) {
        this.error = error.message
        console.error('[Projects] Create error:', error.message)
        return null
      }

      this.projects.push(data)
      return data
    },

    // Update a project
    async updateProject(id, updates) {
      if (!this.isSupabaseLoaded || !supabase) {
        // Local-only update for fallback mode
        const idx = this.projects.findIndex(p => p.id === id)
        if (idx >= 0) {
          this.projects[idx] = { ...this.projects[idx], ...updates }
        }
        return this.projects[idx]
      }

      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        this.error = error.message
        console.error('[Projects] Update error:', error.message)
        return null
      }

      const idx = this.projects.findIndex(p => p.id === id)
      if (idx >= 0) {
        this.projects[idx] = data
      }
      return data
    },

    // Delete a project
    async deleteProject(id) {
      if (!this.isSupabaseLoaded || !supabase) {
        this.projects = this.projects.filter(p => p.id !== id)
        return true
      }

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) {
        this.error = error.message
        return false
      }

      this.projects = this.projects.filter(p => p.id !== id)
      return true
    },

    // Update canvas position for a project
    async updatePosition(id, posX, posY) {
      if (!this.isSupabaseLoaded || !supabase) {
        const idx = this.projects.findIndex(p => p.id === id)
        if (idx >= 0) {
          this.projects[idx].position_x = posX
          this.projects[idx].position_y = posY
        }
        return
      }

      await supabase
        .from('projects')
        .update({ position_x: posX, position_y: posY })
        .eq('id', id)

      const idx = this.projects.findIndex(p => p.id === id)
      if (idx >= 0) {
        this.projects[idx].position_x = posX
        this.projects[idx].position_y = posY
      }
    },

    // Update privacy setting
    async updatePrivacy(id, privacy) {
      return this.updateProject(id, { privacy })
    },

    // Generate a funny readable slug and save it to the project
    async generateShareSlug(id) {
      const adjectives = ['cosmic','ancient','wild','silent','burning','frozen','golden','shadow','crystal','thunder']
      const nouns = ['jaguar','river','forest','volcano','condor','serpent','moon','storm','root','ember']
      const slug = `${adjectives[Math.floor(Math.random()*adjectives.length)]}-${nouns[Math.floor(Math.random()*nouns.length)]}-${Math.random().toString(36).slice(2,6)}`
      await this.updateProject(id, { share_slug: slug })
      return slug
    },

    // Subscribe to realtime changes - only if Supabase is configured
    subscribeToRealtime() {
      if (!isSupabaseConfigured || !supabase) return

      this.realtimeChannel = supabase
        .channel('projects-realtime')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'projects' },
          (payload) => {
            const { eventType, new: newRecord, old: oldRecord } = payload

            if (eventType === 'INSERT') {
              const exists = this.projects.find(p => p.id === newRecord.id)
              if (!exists) {
                this.projects.push(newRecord)
              }
            } else if (eventType === 'UPDATE') {
              const idx = this.projects.findIndex(p => p.id === newRecord.id)
              if (idx >= 0) {
                this.projects[idx] = newRecord
              }
            } else if (eventType === 'DELETE') {
              this.projects = this.projects.filter(p => p.id !== oldRecord.id)
            }
          }
        )
        .subscribe()
    },

    // Unsubscribe from realtime
    unsubscribeFromRealtime() {
      if (this.realtimeChannel && supabase) {
        supabase.removeChannel(this.realtimeChannel)
        this.realtimeChannel = null
      }
    }
  }
})
