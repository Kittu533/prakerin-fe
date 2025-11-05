import { defineStore } from 'pinia'
import type { AuthProfileResponse } from '~/composables/types-auth/auth.interface'

export const useDataStore = defineStore('data', {
  state: () => ({
    // UI State
    isMinimized: false,
    isTemporarilyOpen: false,

    // Token & Signature
    token: null as string | null,
    tokenSignature: null as string | null,
    refreshToken: null as string | null,
    refreshTokenSignature: null as string | null,

    // Data Pengguna
    profile: null as AuthProfileResponse['data'] | null, // ✅ ambil tipe data dari interface
  }),

  getters: {
    shouldExpand: (state) => !state.isMinimized || state.isTemporarilyOpen
  },

  actions: {
    // =====================
    // UI HANDLER
    // =====================
    toggleSidebar() {
      this.isMinimized = !this.isMinimized
    },
    openTemporarily() {
      this.isTemporarilyOpen = true
    },
    closeTemporarily() {
      this.isTemporarilyOpen = false
    },

    // =====================
    // PROFILE HANDLER
    // =====================
    setProfile(profile: AuthProfileResponse['data']) {
      this.profile = profile
      localStorage.setItem('profile', JSON.stringify(profile))
    },
    clearProfile() {
      this.profile = null
      localStorage.removeItem('profile')
    },

    // =====================
    // TOKEN HANDLER
    // =====================
    setToken(token: string, signature: string) {
      this.token = token
      this.tokenSignature = signature
      localStorage.setItem('token', token)
      localStorage.setItem('tokenSignature', signature)
    },
    clearToken() {
      this.token = null
      this.tokenSignature = null
      localStorage.removeItem('token')
      localStorage.removeItem('tokenSignature')
    },

    // =====================
    // REFRESH TOKEN HANDLER
    // =====================
    setRefreshToken(token: string, signature?: string) {
      this.refreshToken = token
      localStorage.setItem('refreshToken', token)
      if (signature) {
        this.refreshTokenSignature = signature
        localStorage.setItem('refreshTokenSignature', signature)
      }
    },
    clearRefreshToken() {
      this.refreshToken = null
      this.refreshTokenSignature = null
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('refreshTokenSignature')
    },

    // =====================
    // INITIALIZATION
    // =====================
    initializeFromLocalStorage() {
      this.token = localStorage.getItem('token')
      this.tokenSignature = localStorage.getItem('tokenSignature')
      this.refreshToken = localStorage.getItem('refreshToken')
      this.refreshTokenSignature = localStorage.getItem('refreshTokenSignature')

      const savedProfile = localStorage.getItem('profile')
      if (savedProfile) {
        try {
          this.profile = JSON.parse(savedProfile)
        } catch {
          this.profile = null
        }
      }
    }
  }
})
