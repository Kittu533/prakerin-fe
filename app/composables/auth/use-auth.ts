/**
 * useAuth Composable - Clean Architecture Auth Handler
 * Handles login, logout, refresh token, and auth state
 */
import { computed } from 'vue';
import { useDataStore } from '~/stores/data-store';
import { apiFetch } from '~/composables/api-fetch';
import type {
  AuthLoginRequest,
  AuthLoginResponse,
  AuthProfileResponse,
  AuthRefreshResponse,
  AuthLogoutResponse,
  AuthUser,
  UserRole,
} from '~/composables/types-auth/auth.interface';

export function useAuth() {
  const dataStore = useDataStore();

  // =============================================
  // COMPUTED STATE
  // =============================================
  const isAuthenticated = computed(() => !!dataStore.token);
  const user = computed(() => dataStore.profile);
  const userRole = computed(() => dataStore.profile?.role as UserRole | undefined);
  const token = computed(() => dataStore.token);

  // =============================================
  // LOGIN
  // =============================================
  async function login(credentials: AuthLoginRequest): Promise<{ success: boolean; message: string; user?: AuthUser }> {
    try {
      const { data: response } = await apiFetch<AuthLoginResponse>(
        'AuthService',
        '/login',
        {
          method: 'POST',
          data: credentials,
        },
        false
      );

      if (response.success && response.data) {
        dataStore.setToken(response.data.accessToken, '');
        dataStore.setRefreshToken(response.data.refreshToken);
        dataStore.setProfile(response.data.user);

        return {
          success: true,
          message: response.message,
          user: response.data.user,
        };
      }

      return {
        success: false,
        message: response.message || 'Login gagal',
      };
    } catch (error: any) {
      console.error('[useAuth] Login error:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Terjadi kesalahan saat login',
      };
    }
  }

  // =============================================
  // LOGOUT
  // =============================================
  async function logout(): Promise<void> {
    try {
      await apiFetch<AuthLogoutResponse>(
        'AuthService',
        '/logout',
        { method: 'POST' },
        true
      );
    } catch (error) {
      console.error('[useAuth] Logout error:', error);
    } finally {
      dataStore.clearAuth();
    }
  }

  // =============================================
  // GET CURRENT USER
  // =============================================
  async function fetchProfile(): Promise<AuthUser | null> {
    try {
      const { data: response } = await apiFetch<AuthProfileResponse>(
        'AuthService',
        '/me',
        { method: 'GET' },
        true
      );

      if (response.success && response.data) {
        dataStore.setProfile(response.data);
        return response.data;
      }

      return null;
    } catch (error) {
      console.error('[useAuth] Fetch profile error:', error);
      return null;
    }
  }

  // =============================================
  // REFRESH TOKEN
  // =============================================
  async function refreshToken(): Promise<boolean> {
    const currentRefreshToken = dataStore.refreshToken;
    if (!currentRefreshToken) return false;

    try {
      const { data: response } = await apiFetch<AuthRefreshResponse>(
        'AuthService',
        '/refresh',
        {
          method: 'POST',
          data: { refreshToken: currentRefreshToken },
        },
        false
      );

      if (response.success && response.data) {
        dataStore.setToken(response.data.accessToken, '');
        dataStore.setRefreshToken(response.data.refreshToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('[useAuth] Refresh token error:', error);
      dataStore.clearAuth();
      return false;
    }
  }

  // =============================================
  // CHECK AUTH & INITIALIZE
  // =============================================
  async function checkAuth(): Promise<boolean> {
    dataStore.initializeFromLocalStorage();

    if (!dataStore.token) return false;

    const profile = await fetchProfile();
    return !!profile;
  }

  // =============================================
  // ROLE HELPERS
  // =============================================
  function hasRole(role: UserRole): boolean {
    return userRole.value === role;
  }

  function isAdmin(): boolean {
    return hasRole('admin');
  }

  function isGuru(): boolean {
    return hasRole('guru');
  }

  function isSiswa(): boolean {
    return hasRole('siswa');
  }

  function isMentor(): boolean {
    return hasRole('mentor');
  }

  // =============================================
  // GET DASHBOARD ROUTE BY ROLE
  // =============================================
  function getDashboardRoute(): string {
    switch (userRole.value) {
      case 'admin':
        return '/admin';
      case 'guru':
        return '/guru';
      case 'siswa':
        return '/siswa';
      case 'mentor':
        return '/mentor';
      default:
        return '/login';
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
    fetchProfile,
    refreshToken,
    checkAuth,

    // Role helpers
    hasRole,
    isAdmin,
    isGuru,
    isSiswa,
    isMentor,
    getDashboardRoute,
  };
}
