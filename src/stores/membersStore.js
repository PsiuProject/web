// Members store - manages project members/roles via Supabase
import { defineStore } from 'pinia'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export const useMembersStore = defineStore('members', {
  state: () => ({
    members: {},  // keyed by project_id
    loading: false,
    error: null
  }),

  getters: {
    getMembersByProject: (state) => (projectId) =>
      state.members[projectId] || [],

    getUserRole: (state) => (projectId, userId) => {
      const members = state.members[projectId] || []
      const member = members.find(m => m.user_id === userId)
      return member?.role || null
    },

    isOwner: (state) => (projectId, userId) => {
      const members = state.members[projectId] || []
      return members.some(m => m.user_id === userId && m.role === 'owner')
    },

    isEditor: (state) => (projectId, userId) => {
      const members = state.members[projectId] || []
      return members.some(m => m.user_id === userId && (m.role === 'editor' || m.role === 'owner'))
    },

    canComment: (state) => (projectId, userId) => {
      const members = state.members[projectId] || []
      return members.some(m => m.user_id === userId && (m.role === 'commenter' || m.role === 'editor' || m.role === 'owner'))
    },

    canEdit: (state) => (projectId, userId, ownerId) => {
      if (userId === ownerId) return true
      const members = state.members[projectId] || []
      return members.some(m => m.user_id === userId && (m.role === 'editor' || m.role === 'owner'))
    }
  },

  actions: {
    async loadMembers(projectId) {
      if (!isSupabaseConfigured) return
      
      this.loading = true
      const { data, error } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId)

      if (error) {
        this.error = error.message
        console.error('[Members] Load error:', error.message)
      } else {
        this.members[projectId] = data || []
      }
      this.loading = false
    },

    async inviteMember(projectId, email, role = 'viewer') {
      if (!isSupabaseConfigured) return null
      
      this.error = null

      const { data, error } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          email,
          role,
          user_id: null // Will be linked when user logs in with this email
        })
        .select()
        .single()

      if (error) {
        this.error = error.message
        console.error('[Members] Invite error:', error.message)
        return null
      }

      if (!this.members[projectId]) {
        this.members[projectId] = []
      }
      this.members[projectId].push(data)
      return data
    },

    async updateRole(memberId, projectId, newRole) {
      if (!isSupabaseConfigured) return null
      
      const { data, error } = await supabase
        .from('project_members')
        .update({ role: newRole })
        .eq('id', memberId)
        .select()
        .single()

      if (error) {
        this.error = error.message
        return null
      }

      const members = this.members[projectId] || []
      const idx = members.findIndex(m => m.id === memberId)
      if (idx >= 0) {
        members[idx] = data
      }
      return data
    },

    async removeMember(memberId, projectId) {
      if (!isSupabaseConfigured) return false
      
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', memberId)

      if (error) {
        this.error = error.message
        return false
      }

      this.members[projectId] = (this.members[projectId] || [])
        .filter(m => m.id !== memberId)
      return true
    }
  }
})
