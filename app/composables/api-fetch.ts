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
  const servicePathMap: Record<string, string> = {
    AuthService: '/api/auth',
    CoreService: '/api',      // Master data: siswa, guru, kelas, jurusan, etc.
    PartnerService: '/api',   // Perusahaan, mentor
    PlacementService: '/api', // Pengajuan, penempatan, absensi, logbook
    ReportingService: '/api', // Dashboard, reports
  };

  // Get path prefix for service
  const pathPrefix = servicePathMap[service] || '/api';

  // Build full URL
  const fullEndpoint = endpoint.startsWith('/') 
    ? `${pathPrefix}${endpoint}` 
    : `${pathPrefix}/${endpoint}`;

  // Create axios instance
  const instance = axios.create({
    baseURL,
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
    }
  }

  try {
    const response = await instance.request<T>({ 
      url: fullEndpoint, 
      ...options 
    });
    return response;
  } catch (error) {
    const axiosError = error as AxiosError<ResponseApi>;
    console.error(`[API Error] ${service} → ${fullEndpoint}`, axiosError);

    if (axiosError.response) {
      // Server responded with error status
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
