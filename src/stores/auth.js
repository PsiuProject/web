// Auth store - Supabase Google authentication
// Handles login, logout, session persistence, and user state
import { defineStore } from 'pinia'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    session: null,
    loading: true,
    error: null,
    _authSubscription: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
    userId: (state) => state.user?.id || null,
    userEmail: (state) => state.user?.email || '',
    userAvatar: (state) => state.user?.user_metadata?.avatar_url || null,
    userName: (state) => {
      const meta = state.user?.user_metadata
      return meta?.full_name || meta?.name || state.user?.email?.split('@')[0] || ''
    },
    userInitial: (state) => {
      const name = state.user?.user_metadata?.full_name || state.user?.email || ''
      return name.charAt(0).toUpperCase()
    }
  },

  actions: {
    // Initialize auth listener - call once on app mount
    async init() {
      if (!supabase) {
        this.loading = false
        return
      }

      // Clean up previous subscription if re-initialized (HMR)
      if (this._authSubscription) {
        this._authSubscription.unsubscribe()
        this._authSubscription = null
      }

      this.loading = true

      // Get initial session
      const { data: { session } } = await supabase.auth.getSession()
      this.session = session
      this.user = session?.user || null

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        this.session = session
        this.user = session?.user || null
        this.loading = false
      })
      this._authSubscription = subscription

      this.loading = false
    },

    // Google OAuth login
    async loginWithGoogle() {
      if (!supabase) return
      this.error = null
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/web/'
        }
      })
      if (error) {
        this.error = error.message
        console.error('[Auth] Google login error:', error.message)
      }
    },

    // Email/password login
    async loginWithEmail(email, password) {
      if (!supabase) return false
      this.error = null
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) {
        this.error = error.message
        console.error('[Auth] Email login error:', error.message)
        return false
      }
      this.session = data.session
      this.user = data.user
      return true
    },

    // Email/password signup (explicit, not auto)
    async signUpWithEmail(email, password) {
      if (!supabase) return false
      this.error = null
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/web/'
        }
      })
      if (error) {
        this.error = error.message
        console.error('[Auth] Signup error:', error.message)
        return false
      }
      this.session = data.session
      this.user = data.user
      return true
    },

    // Logout
    async logout() {
      if (!supabase) return
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('[Auth] Logout error:', error.message)
      }
      this.user = null
      this.session = null
    }
  }
})
