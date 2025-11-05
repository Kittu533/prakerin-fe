/**
 * Interface untuk endpoint autentikasi (login, me, logout)
 * Mengikuti gaya penulisan seperti pada akun.interface.ts
 * @createdAt 05/11/2025
 */

export interface AuthLoginRequest {
  email: string;
  password: string;
}

/**
 * Response sukses dari POST /auth/login
 */
export interface AuthLoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      role: string;
      isEmailVerified: boolean;
    };
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * Response gagal dari POST /auth/login
 */
export interface AuthLoginError {
  success: boolean;
  message: string;
}

/**
 * Response dari GET /auth/me
 * Mengambil profil pengguna yang sedang login
 */
export interface AuthProfileResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Request body untuk POST /auth/logout
 */
export interface AuthLogoutRequest {
  refreshToken: string;
}

/**
 * Response dari POST /auth/logout
 */
export interface AuthLogoutResponse {
  success: boolean;
  message: string;
}
