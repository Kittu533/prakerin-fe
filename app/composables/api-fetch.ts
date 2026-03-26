import axios, { type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';
import { useRuntimeConfig, createError } from '#imports';
import { useDataStore } from '~/stores/data-store';
import { useErrorService } from './handling-response/service-error';
import type { ResponseApi } from './response.interface';

/**
 * API Fetch Wrapper
 * - Uses Gateway URL as single entry point
 * - Auto token injection
 * - Centralized error handling
 */
export async function apiFetch<T>(
  service: string,
  endpoint: string,
  options: AxiosRequestConfig = {},
  withToken: boolean = true
): Promise<AxiosResponse<T>> {
  const config = useRuntimeConfig();
  const dataStore = useDataStore();
  const { setServiceError } = useErrorService();

  // Gateway URL from runtime config
  const baseURL = config.public.apiUrl as string;

  // Map service to API path prefix
  // Gateway routes all to /api/* directly (no service prefix needed)
  // Base URL already includes /api, so service paths should not duplicate it
  const servicePathMap: Record<string, string> = {
    AuthService: '/auth',
    CoreService: '',          // Master data: siswa, guru, kelas, jurusan, etc.
    PartnerService: '',       // Perusahaan, mentor
    PlacementService: '',     // Pengajuan, penempatan, absensi, logbook
    ReportingService: '',     // Dashboard, reports
  };

  // Get path prefix for service
  const pathPrefix = servicePathMap[service] || '';

  // Build full URL
  const fullEndpoint = endpoint.startsWith('/') 
    ? `${pathPrefix}${endpoint}` 
    : `${pathPrefix}/${endpoint}`;

  // Create axios instance
  const instance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add auth token if required
  if (withToken) {
    // Try store first, fallback to localStorage
    let token = dataStore.token;
    if (!token && import.meta.client) {
      token = localStorage.getItem('token');
    }
    if (token) {
      instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.debug(`[API Debug] Token added to request: ${service} → ${fullEndpoint}`);
      
      // Debug token payload (decode JWT for debugging)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.debug('[API Debug] Token payload:', {
          role: payload.role,
          entity_id: payload.entity_id,
          entity_type: payload.entity_type,
          exp: new Date(payload.exp * 1000)
        });
      } catch (e) {
        console.warn('[API Debug] Could not decode token payload');
      }
    } else {
      console.warn(`[API Warning] No token found for authenticated request: ${service} → ${fullEndpoint}`);
    }
  }

  // Add response interceptor to handle 401/403 errors
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If 401 or 403 and hasn't already tried to refresh
      if (
        (error.response?.status === 401 || error.response?.status === 403) &&
        withToken &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;
        
        console.warn('[API Interceptor] 401/403 detected, attempting token refresh...');
        
        try {
          // Try to refresh token (browser will send refreshToken cookie automatically)
          const { data: refreshResponse } = await instance.post('/auth/refresh');
          
          if (refreshResponse.success && refreshResponse.data) {
            // Update access token in store
            dataStore.setToken(refreshResponse.data.accessToken);
            
            // Retry original request with new token
            originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.data.accessToken}`;
            return instance(originalRequest);
          }
        } catch (refreshError) {
          console.error('[API Interceptor] Token refresh failed:', refreshError);
        }
        
        // If refresh failed, clear auth and redirect to login
        dataStore.clearAuth();
        if (import.meta.client) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
      
      return Promise.reject(error);
    }
  );

  try {
    const response = await instance.request<T>({ 
      url: fullEndpoint, 
      ...options 
    });
    return response;
  } catch (error) {
    const axiosError = error as AxiosError<ResponseApi>;
    console.error(`[API Error] ${service} → ${fullEndpoint}`, {
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
      data: axiosError.response?.data,
      headers: axiosError.response?.headers,
      message: axiosError.message,
    });

    if (axiosError.response) {
      // Server responded with error status
      if (axiosError.response.status === 403) {
        console.error(`[Authorization Error] 403 Forbidden - Check token validity and permissions for ${service} → ${fullEndpoint}`);
      }
      return axiosError.response as AxiosResponse<T>;
    } else {
      // Network error or server unreachable
      setServiceError(true);
      throw createError({
        statusCode: 500,
        statusMessage: 'Koneksi ke server gagal atau layanan tidak tersedia',
      });
    }
  }
}
