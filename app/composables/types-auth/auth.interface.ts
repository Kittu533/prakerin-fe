/**
 * Auth Types - Match dengan Identity Service Backend
 * @updated untuk Prakerin Microservices
 */

// =============================================
// USER ROLES
// =============================================
export type UserRole = 'admin' | 'guru' | 'siswa' | 'mentor';

// =============================================
// LOGIN
// =============================================
export interface AuthLoginRequest {
  identifier: string;  // email, NIP, atau NIS
  password: string;
  role?: UserRole;     // optional - backend auto-detect dari identifier
}

export interface AuthUser {
  id: number;
  role: UserRole;
  entity_id: number;
  entity_type: string;
  identifier: string;
}

export interface AuthLoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  };
}

// =============================================
// PROFILE (GET /auth/me)
// =============================================
export interface AuthProfileResponse {
  success: boolean;
  message: string;
  data: AuthUser;
}

// =============================================
// REFRESH TOKEN
// =============================================
export interface AuthRefreshRequest {
  refreshToken: string;
}

export interface AuthRefreshResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

// =============================================
// LOGOUT
// =============================================
export interface AuthLogoutResponse {
  success: boolean;
  message: string;
  data: null;
}

// =============================================
// VERIFY TOKEN
// =============================================
export interface AuthVerifyResponse {
  success: boolean;
  valid: boolean;
  payload?: AuthUser;
  message?: string;
}
