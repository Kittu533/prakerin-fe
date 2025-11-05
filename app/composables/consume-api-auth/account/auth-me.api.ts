// composables/consume-api-auth/auth-me.api.ts
import { apiFetch } from '~/composables/api-fetch'
import type { AuthProfileResponse } from '~/composables/types-auth/auth.interface'

export async function getCurrentUser() {
  return await apiFetch<AuthProfileResponse>('AuthService', '/auth/me', {
    method: 'GET'
  }, true)
}
