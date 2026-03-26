import { defineStore } from "pinia";
import type {
  AuthUser,
  UserRole,
} from "~/composables/types-auth/auth.interface";

// =============================================
// JWT DECODE HELPER
// =============================================
interface JwtPayload {
  id: string;
  identifier: string;
  role: string;
  entity_id: string;
  entity_type: string;
  iat: number;
  exp: number;
  [key: string]: any;
}

/**
 * Decode JWT token tanpa library eksternal
 * Hanya decode payload, tidak validasi signature
 */
function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    // Handle base64url encoding
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Cek apakah token sudah expired
 */
function isTokenExpired(payload: JwtPayload | null): boolean {
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

export const useDataStore = defineStore("data", {
  state: () => ({
    // UI State
    isMinimized: false,
    isTemporarilyOpen: false,

    // Auth Tokens (Access Token is kept in memory and cookie for SSR)
    token: null as string | null,
    tokenSignature: null as string | null,

    // User Profile
    profile: null as AuthUser | null,

    // Decoded JWT payload (untuk akses cepat tanpa decode ulang)
    jwtPayload: null as JwtPayload | null,
  }),

  getters: {
    shouldExpand: (state) => !state.isMinimized || state.isTemporarilyOpen,

    // Auth getters - ambil langsung dari JWT payload
    isAuthenticated: (state) =>
      !!state.token && !isTokenExpired(state.jwtPayload),
    userRole: (state) => state.jwtPayload?.role as UserRole | undefined,
    userId: (state) => state.jwtPayload?.entity_id as string | undefined,
    userType: (state) => state.jwtPayload?.entity_type as string | undefined,

    // Cek apakah token akan expired segera (dalam 5 menit)
    isTokenExpiringSoon: (state) => {
      if (!state.jwtPayload?.exp) return true;
      const expiryTime = state.jwtPayload.exp * 1000;
      const fiveMinutes = 5 * 60 * 1000;
      return Date.now() >= expiryTime - fiveMinutes;
    },
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
      const profileCookie = useCookie("profile", { maxAge: 7 * 24 * 60 * 60 });
      profileCookie.value = JSON.stringify(profile);
    },
    clearProfile() {
      this.profile = null;
      const profileCookie = useCookie("profile");
      profileCookie.value = null;
    },

    // =====================
    // TOKEN HANDLER
    // =====================
    setToken(token: string, signature: string = "") {
      this.token = token;
      this.tokenSignature = signature;

      // Decode dan simpan payload JWT untuk akses cepat
      this.jwtPayload = decodeJwt(token);

      // Save to cookie for SSR persistence
      const tokenCookie = useCookie("token", { 
        maxAge: 7 * 24 * 60 * 60,
        sameSite: 'lax'
      });
      tokenCookie.value = token;
      
      if (signature) {
        const sigCookie = useCookie("tokenSignature", { maxAge: 7 * 24 * 60 * 60 });
        sigCookie.value = signature;
      }
    },
    clearToken() {
      this.token = null;
      this.tokenSignature = null;
      this.jwtPayload = null;
      
      const tokenCookie = useCookie("token");
      tokenCookie.value = null;
      const sigCookie = useCookie("tokenSignature");
      sigCookie.value = null;
    },

    // =====================
    // CLEAR ALL AUTH DATA
    // =====================
    clearAuth() {
      this.clearToken();
      this.clearProfile();
    },

    // =====================
    // INITIALIZATION
    // =====================
    initializeFromLocalStorage() {
      // Use cookies instead of localStorage for better SSR and security
      const token = useCookie("token").value;
      const tokenSignature = useCookie("tokenSignature").value;

      this.token = token || null;
      this.tokenSignature = tokenSignature || null;

      // Decode token untuk mendapatkan payload
      if (this.token) {
        this.jwtPayload = decodeJwt(this.token);
      }

      const savedProfile = useCookie("profile").value;
      if (savedProfile) {
        try {
          // useCookie might already parse JSON if it's an object, 
          // but sometimes it's stored as string
          this.profile = typeof savedProfile === 'string' 
            ? JSON.parse(savedProfile) 
            : savedProfile;
        } catch {
          this.profile = null;
        }
      }
    },

    // =====================
    // JWT HELPERS
    // =====================
    /**
     * Ambil data user langsung dari JWT payload
     * Tidak perlu call API /auth/me lagi
     */
    getUserFromToken(): { id: string; role: string; type: string } | null {
      if (!this.jwtPayload || isTokenExpired(this.jwtPayload)) {
        return null;
      }
      return {
        id: this.jwtPayload.entity_id,
        role: this.jwtPayload.role,
        type: this.jwtPayload.entity_type,
      };
    },
  },
});
