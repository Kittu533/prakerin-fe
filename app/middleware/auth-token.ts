import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { useDataStore } from '~/stores/data-store'
import { apiFetch } from '~/composables/api-fetch'
import type { AuthProfileResponse } from '~/composables/types-auth/auth.interface'

export default defineNuxtRouteMiddleware(async () => {
  if (!import.meta.client) return // middleware hanya berjalan di client

  const dataStore = useDataStore()
  dataStore.initializeFromLocalStorage()

  // Jika belum login → arahkan ke /login
  if (!dataStore.token) {
    return navigateTo('/login')
  }

  try {
    // Ambil ulang profil pengguna (GET /auth/me)
    const { data: profileResponse } = await apiFetch<AuthProfileResponse>(
      'AuthService',
      '/auth/me',
      { method: 'GET' },
      true
    )

    // Simpan profil user
    if (profileResponse?.data) {
      dataStore.setProfile(profileResponse.data)
    } else {
      // Jika gagal ambil profil → arahkan ke login
      dataStore.clearToken()
      return navigateTo('/login')
    }
  } catch (error) {
    console.error('[Auth Middleware] Error:', error)
    // Jika token expired / tidak valid → hapus data & redirect
    dataStore.clearToken()
    dataStore.clearRefreshToken()
    dataStore.clearProfile()
    return navigateTo('/login')
  }
})