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

    // Auth Tokens
    token: null as string | null,
    tokenSignature: null as string | null,
    refreshToken: null as string | null,

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
      if (import.meta.client) {
        localStorage.setItem("profile", JSON.stringify(profile));
      }
    },
    clearProfile() {
      this.profile = null;
      if (import.meta.client) {
        localStorage.removeItem("profile");
      }
    },

    // =====================
    // TOKEN HANDLER
    // =====================
    setToken(token: string, signature: string = "") {
      this.token = token;
      this.tokenSignature = signature;

      // Decode dan simpan payload JWT untuk akses cepat
      this.jwtPayload = decodeJwt(token);

      if (import.meta.client) {
        localStorage.setItem("token", token);
        if (signature) {
          localStorage.setItem("tokenSignature", signature);
        }
      }
    },
    clearToken() {
      this.token = null;
      this.tokenSignature = null;
      this.jwtPayload = null;
      if (import.meta.client) {
        localStorage.removeItem("token");
        localStorage.removeItem("tokenSignature");
      }
    },

    // =====================
    // REFRESH TOKEN HANDLER
    // =====================
    setRefreshToken(token: string) {
      this.refreshToken = token;
      if (import.meta.client) {
        localStorage.setItem("refreshToken", token);
      }
    },
    clearRefreshToken() {
      this.refreshToken = null;
      if (import.meta.client) {
        localStorage.removeItem("refreshToken");
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

      const token = localStorage.getItem("token");
      const tokenSignature = localStorage.getItem("tokenSignature");
      const refreshToken = localStorage.getItem("refreshToken");

      this.token = token;
      this.tokenSignature = tokenSignature;
      this.refreshToken = refreshToken;

      // Decode token untuk mendapatkan payload
      if (token) {
        this.jwtPayload = decodeJwt(token);
        console.log("[DataStore] Token decoded:", {
          hasToken: !!token,
          payload: this.jwtPayload,
          isExpired: this.jwtPayload
            ? this.jwtPayload.exp * 1000 < Date.now()
            : null,
        });
      }

      console.log("[DataStore] Initialized from localStorage:", {
        hasToken: !!token,
        hasRefreshToken: !!refreshToken,
        tokenLength: token?.length || 0,
        userId: this.jwtPayload?.entity_id,
        userRole: this.jwtPayload?.role,
      });

      const savedProfile = localStorage.getItem("profile");
      if (savedProfile) {
        try {
          this.profile = JSON.parse(savedProfile);
          console.log("[DataStore] Profile loaded:", this.profile?.role);
        } catch {
          this.profile = null;
          console.error("[DataStore] Failed to parse saved profile");
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
