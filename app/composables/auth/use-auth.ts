/**
 * useAuth Composable - Clean Architecture Auth Handler
 * Handles login, logout, refresh token, and auth state
 */
import { computed } from "vue";
import { useDataStore } from "~/stores/data-store";
import { apiFetch } from "~/composables/api-fetch";
import type {
  AuthLoginRequest,
  AuthLoginResponse,
  AuthProfileResponse,
  AuthRefreshResponse,
  AuthLogoutResponse,
  AuthUser,
  UserRole,
} from "~/composables/types-auth/auth.interface";

export function useAuth() {
  const dataStore = useDataStore();

  // =============================================
  // COMPUTED STATE
  // =============================================
  const isAuthenticated = computed(() => !!dataStore.token);
  const user = computed(() => dataStore.profile);
  const userRole = computed(
    () => dataStore.profile?.role as UserRole | undefined,
  );
  const token = computed(() => dataStore.token);

  // =============================================
  // LOGIN
  // =============================================
  async function login(
    credentials: AuthLoginRequest,
  ): Promise<{ success: boolean; message: string; user?: AuthUser }> {
    try {
      const { data: response } = await apiFetch<AuthLoginResponse>(
        "AuthService",
        "/login",
        {
          method: "POST",
          data: credentials,
        },
        false,
      );

      if (response.success && response.data) {
        dataStore.setToken(response.data.accessToken, "");
        dataStore.setRefreshToken(response.data.refreshToken);
        dataStore.setProfile(response.data.user);

        console.debug("[useAuth] Login successful:", {
          role: response.data.user.role,
          entity_id: response.data.user.entity_id,
          entity_type: response.data.user.entity_type,
          identifier: response.data.user.identifier,
        });

        // Verify profile was set correctly
        setTimeout(() => {
          console.debug("[useAuth] Profile verification:", {
            storeProfile: dataStore.profile,
            localStorageProfile: localStorage.getItem("profile"),
            storeToken: !!dataStore.token,
          });
        }, 100);

        return {
          success: true,
          message: response.message,
          user: response.data.user,
        };
      }

      return {
        success: false,
        message: response.message || "Login gagal",
      };
    } catch (error: any) {
      console.error("[useAuth] Login error:", error);
      return {
        success: false,
        message:
          error?.response?.data?.message || "Terjadi kesalahan saat login",
      };
    }
  }

  // =============================================
  // LOGOUT
  // =============================================
  async function logout(): Promise<void> {
    try {
      await apiFetch<AuthLogoutResponse>(
        "AuthService",
        "/logout",
        { method: "POST" },
        true,
      );
    } catch (error) {
      console.error("[useAuth] Logout error:", error);
    } finally {
      dataStore.clearAuth();
    }
  }

  // =============================================
  // GET CURRENT USER (from JWT - no API call needed)
  // =============================================
  function getCurrentUser(): AuthUser | null {
    if (!dataStore.jwtPayload) return null;

    // Build user object from JWT payload
    return {
      id: dataStore.jwtPayload.id,
      entity_id: dataStore.jwtPayload.entity_id,
      entity_type: dataStore.jwtPayload.entity_type,
      identifier: dataStore.jwtPayload.identifier,
      role: dataStore.jwtPayload.role as UserRole,
      name: dataStore.profile?.name || "",
      email: dataStore.profile?.email || "",
    };
  }

  // =============================================
  // FETCH FULL PROFILE (from API - use sparingly)
  // =============================================
  async function fetchProfile(): Promise<AuthUser | null> {
    // If we already have profile data and it's recent, return it
    if (dataStore.profile) {
      return dataStore.profile;
    }

    // Build minimal user from JWT
    const userFromToken = getCurrentUser();
    if (userFromToken) {
      dataStore.setProfile(userFromToken);
    }
    return userFromToken;
  }

  // =============================================
  // REFRESH TOKEN
  // =============================================
  async function refreshToken(): Promise<boolean> {
    const currentRefreshToken = dataStore.refreshToken;
    if (!currentRefreshToken) return false;

    try {
      const { data: response } = await apiFetch<AuthRefreshResponse>(
        "AuthService",
        "/refresh",
        {
          method: "POST",
          data: { refreshToken: currentRefreshToken },
        },
        false,
      );

      if (response.success && response.data) {
        dataStore.setToken(response.data.accessToken, "");
        dataStore.setRefreshToken(response.data.refreshToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error("[useAuth] Refresh token error:", error);
      dataStore.clearAuth();
      return false;
    }
  }

  // =============================================
  // CHECK AUTH & INITIALIZE
  // =============================================
  function checkAuth(): boolean {
    dataStore.initializeFromLocalStorage();

    if (!dataStore.token || !dataStore.jwtPayload) return false;

    // Check if token is expired
    if (dataStore.jwtPayload.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (now >= dataStore.jwtPayload.exp) {
        dataStore.clearAuth();
        return false;
      }
    }

    return true;
  }

  // =============================================
  // CHANGE PASSWORD
  // =============================================
  async function changePassword(payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const { data: response } = await apiFetch<{
        success: boolean;
        message: string;
      }>(
        "AuthService",
        "/change-password",
        {
          method: "POST",
          data: payload,
        },
        true,
      );

      if (response.success) {
        return {
          success: true,
          message: response.message || "Password berhasil diubah",
        };
      }

      return {
        success: false,
        message: response.message || "Gagal mengubah password",
      };
    } catch (error: any) {
      console.error("[useAuth] Change password error:", error);
      const msg =
        error?.response?.data?.message ||
        "Terjadi kesalahan saat mengubah password";
      return { success: false, message: msg };
    }
  }

  // =============================================
  // ROLE HELPERS
  // =============================================
  function hasRole(role: UserRole): boolean {
    return userRole.value === role;
  }

  function isAdmin(): boolean {
    return hasRole("admin");
  }

  function isGuru(): boolean {
    return hasRole("guru");
  }

  function isSiswa(): boolean {
    return hasRole("siswa");
  }

  function isMentor(): boolean {
    return hasRole("mentor");
  }

  // =============================================
  // GET DASHBOARD ROUTE BY ROLE
  // =============================================
  function getDashboardRoute(): string {
    switch (userRole.value) {
      case "admin":
        return "/admin";
      case "guru":
        return "/guru";
      case "siswa":
        return "/siswa";
      case "mentor":
        return "/mentor";
      default:
        return "/login";
    }
  }

  return {
    // State
    isAuthenticated,
    user,
    userRole,
    token,

    // Actions
    login,
    logout,
    getCurrentUser,
    fetchProfile,
    refreshToken,
    checkAuth,
    changePassword,

    // Role helpers
    hasRole,
    isAdmin,
    isGuru,
    isSiswa,
    isMentor,
    getDashboardRoute,
  };
}
