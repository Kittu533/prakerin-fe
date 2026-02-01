import { defineStore } from 'pinia';
import type { AuthUser, UserRole } from '~/composables/types-auth/auth.interface';

export const useDataStore = defineStore('data', {
  state: () => ({
    // UI State
    isMinimized: false,
    isTemporarilyOpen: false,

    // Auth Tokens
    token: null as string | null,
    tokenSignature: null as string | null,
    refreshToken: null as string | null,

    // User Profile
    profile: null as AuthUser | null,
  }),

  getters: {
    shouldExpand: (state) => !state.isMinimized || state.isTemporarilyOpen,
    
    // Auth getters
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.profile?.role as UserRole | undefined,
    userId: (state) => state.profile?.id,
    userIdentifier: (state) => state.profile?.identifier,
  },

  actions: {
    // =====================
    // UI HANDLER
    // =====================
    toggleSidebar() {
      this.isMinimized = !this.isMinimized;
    },
    openTemporarily() {
      this.isTemporarilyOpen = true;
    },
    closeTemporarily() {
      this.isTemporarilyOpen = false;
    },

    // =====================
    // PROFILE HANDLER
    // =====================
    setProfile(profile: AuthUser) {
      this.profile = profile;
      if (import.meta.client) {
        localStorage.setItem('profile', JSON.stringify(profile));
      }
    },
    clearProfile() {
      this.profile = null;
      if (import.meta.client) {
        localStorage.removeItem('profile');
      }
    },

    // =====================
    // TOKEN HANDLER
    // =====================
    setToken(token: string, signature: string = '') {
      this.token = token;
      this.tokenSignature = signature;
      if (import.meta.client) {
        localStorage.setItem('token', token);
        if (signature) {
          localStorage.setItem('tokenSignature', signature);
        }
      }
    },
    clearToken() {
      this.token = null;
      this.tokenSignature = null;
      if (import.meta.client) {
        localStorage.removeItem('token');
        localStorage.removeItem('tokenSignature');
      }
    },

    // =====================
    // REFRESH TOKEN HANDLER
    // =====================
    setRefreshToken(token: string) {
      this.refreshToken = token;
      if (import.meta.client) {
        localStorage.setItem('refreshToken', token);
      }
    },
    clearRefreshToken() {
      this.refreshToken = null;
      if (import.meta.client) {
        localStorage.removeItem('refreshToken');
      }
    },

    // =====================
    // CLEAR ALL AUTH DATA
    // =====================
    clearAuth() {
      this.clearToken();
      this.clearRefreshToken();
      this.clearProfile();
    },

    // =====================
    // INITIALIZATION
    // =====================
    initializeFromLocalStorage() {
      if (!import.meta.client) return;

      this.token = localStorage.getItem('token');
      this.tokenSignature = localStorage.getItem('tokenSignature');
      this.refreshToken = localStorage.getItem('refreshToken');

      const savedProfile = localStorage.getItem('profile');
      if (savedProfile) {
        try {
          this.profile = JSON.parse(savedProfile);
        } catch {
          this.profile = null;
        }
      }
    },
  },
});
