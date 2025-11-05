import axios, { type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'
import { useRuntimeConfig, createError } from '#imports'
import { useDataStore } from '~/stores/data-store'
import { useErrorService } from './handling-response/service-error'
import type { ResponseApi } from './response.interface'

/**
 * Wrapper API untuk mengakses berbagai service backend
 * - Auto baseURL selection (gateway / non-gateway)
 * - Auto token injection (store token / runtime token)
 * - Error handling terpusat
 */
export async function apiFetch<T>(
  service: string,
  endpoint: string,
  options: AxiosRequestConfig = {},
  withToken: boolean = true
): Promise<AxiosResponse<T>> {
  const config = useRuntimeConfig()
  const dataStore = useDataStore()
  const { setServiceError } = useErrorService()

  // Ambil konfigurasi environment dari runtime config Nuxt
  const API_TYPE = config.public.API_TYPE as string
  const API_TOKEN = config.API_TOKEN as string

  // Service URLs dari runtime config
  const SERVICE_AUTH = config.public.SERVICE_AUTH as string
  const SERVICE_USER = config.public.SERVICE_USER as string
  const SERVICE_INTERNSHIP = config.public.SERVICE_INTERNSHIP as string
  const SERVICE_ACTIVITY = config.public.SERVICE_ACTIVITY as string
  const SERVICE_DOCUMENT = config.public.SERVICE_DOCUMENT as string
  const SERVICE_REPORT = config.public.SERVICE_REPORT as string

  // Tentukan baseURL sesuai service
  let baseURL = ''
  switch (service) {
    case 'AuthService':
      baseURL = SERVICE_AUTH
      break
    case 'UserService':
      baseURL = SERVICE_USER
      break
    case 'InternshipService':
      baseURL = SERVICE_INTERNSHIP
      break
    case 'ActivityService':
      baseURL = SERVICE_ACTIVITY
      break
    case 'DocumentService':
      baseURL = SERVICE_DOCUMENT
      break
    case 'ReportingService':
      baseURL = SERVICE_REPORT
      break
    default:
      baseURL = SERVICE_AUTH
      break
  }

  // Buat instance Axios dengan baseURL
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  // Token dari dataStore atau fallback dari .env
  if (withToken) {
    const token = dataStore.token || API_TOKEN
    if (token) {
      instance.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    if (dataStore.tokenSignature) {
      instance.defaults.headers.common['x-signature'] = `${dataStore.tokenSignature}`
    }
  }

  try {
    const response = await instance.request<T>({ url: endpoint, ...options })
    return response
  } catch (error) {
    const axiosError = error as AxiosError<ResponseApi>
    console.error(`[API Error] ${service} → ${endpoint}`, axiosError)

    if (axiosError.response) {
      // Bila response error tersedia (status 4xx/5xx)
      return axiosError.response as AxiosResponse<T>
    } else {
      // Bila server tidak merespons sama sekali (timeout/offline)
      setServiceError(true)
      throw createError({
        statusCode: 500,
        statusMessage: 'Koneksi ke server gagal atau layanan tidak tersedia'
      })
    }
  }
}
