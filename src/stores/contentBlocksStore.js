// Content blocks store - manages text/image/link blocks in project detail view
import { defineStore } from 'pinia'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export const useContentBlocksStore = defineStore('contentBlocks', {
  state: () => ({
    blocks: {},  // keyed by project_id
    loading: false,
    error: null,
    realtimeChannel: null
  }),

  getters: {
    getBlocksByProject: (state) => (projectId) => {
      const blocks = state.blocks[projectId] || []
      return [...blocks].sort((a, b) => (a.position || 0) - (b.position || 0))
    }
  },

  actions: {
    async loadBlocks(projectId) {
      if (!isSupabaseConfigured) return
      
      this.loading = true
      const { data, error } = await supabase
        .from('project_content_blocks')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true })

      if (error) {
        this.error = error.message
        console.error('[ContentBlocks] Load error:', error.message)
      } else {
        this.blocks[projectId] = data || []
      }
      this.loading = false
    },

    async addBlock(projectId, type, content, url = null) {
      if (!isSupabaseConfigured) return null

      const existingBlocks = this.blocks[projectId] || []
      const position = existingBlocks.length
      const { data: { user } } = await supabase.auth.getUser()

      // Wrap text content as JSONB {pt: ...} — translation fills other langs later
      const contentValue = (type !== 'link' && content)
        ? { pt: content }
        : content

      const { data, error } = await supabase
        .from('project_content_blocks')
        .insert({ project_id: projectId, type, content: contentValue, url, position, created_by: user?.id })
        .select()
        .single()

      if (error) {
        this.error = error.message
        console.error('[ContentBlocks] Add error:', error.message)
        return null
      }

      if (!this.blocks[projectId]) this.blocks[projectId] = []
      this.blocks[projectId].push(data)
      return data
    },

    async updateBlock(blockId, projectId, updates) {
      if (!isSupabaseConfigured) return null
      
      const { data, error } = await supabase
        .from('project_content_blocks')
        .update(updates)
        .eq('id', blockId)
        .select()
        .single()

      if (error) {
        this.error = error.message
        return null
      }

      const blocks = this.blocks[projectId] || []
      const idx = blocks.findIndex(b => b.id === blockId)
      if (idx >= 0) {
        blocks[idx] = data
      }
      return data
    },

    async deleteBlock(blockId, projectId) {
      if (!isSupabaseConfigured) return false
      
      const { error } = await supabase
        .from('project_content_blocks')
        .delete()
        .eq('id', blockId)

      if (error) {
        this.error = error.message
        return false
      }

      this.blocks[projectId] = (this.blocks[projectId] || [])
        .filter(b => b.id !== blockId)
      return true
    },

    async reorderBlocks(projectId, orderedIds) {
      if (!isSupabaseConfigured || !supabase) return
      
      const updates = orderedIds.map((id, idx) => ({ id, position: idx }))

      // Use Promise.all for parallel execution with error handling
      const results = await Promise.all(updates.map(u =>
        supabase.from('project_content_blocks').update({ position: u.position }).eq('id', u.id)
      ))

      // Check for errors and reload from DB on failure
      if (results.some(r => r.error)) {
        console.error('[ContentBlocks] Reorder failed:', results.find(r => r.error)?.error)
        await this.loadBlocks(projectId)
        return
      }

      // Reorder local state only after successful update
      const blocks = this.blocks[projectId] || []
      this.blocks[projectId] = orderedIds
        .map(id => blocks.find(b => b.id === id))
        .filter(Boolean)
    },

    // Realtime subscription for a specific project's blocks
    subscribeToBlocks(projectId) {
      if (this.realtimeChannel) {
        supabase.removeChannel(this.realtimeChannel)
      }

      this.realtimeChannel = supabase
        .channel(`blocks-${projectId}`)
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'project_content_blocks',
            filter: `project_id=eq.${projectId}`
          },
          (payload) => {
            const { eventType, new: newRecord, old: oldRecord } = payload
            if (!this.blocks[projectId]) this.blocks[projectId] = []

            if (eventType === 'INSERT') {
              const exists = this.blocks[projectId].find(b => b.id === newRecord.id)
              if (!exists) this.blocks[projectId].push(newRecord)
            } else if (eventType === 'UPDATE') {
              const idx = this.blocks[projectId].findIndex(b => b.id === newRecord.id)
              if (idx >= 0) this.blocks[projectId][idx] = newRecord
            } else if (eventType === 'DELETE') {
              this.blocks[projectId] = this.blocks[projectId].filter(b => b.id !== oldRecord.id)
            }
          }
        )
        .subscribe()
    },

    unsubscribeFromBlocks() {
      if (this.realtimeChannel) {
        supabase.removeChannel(this.realtimeChannel)
        this.realtimeChannel = null
      }
    }
  }
})
