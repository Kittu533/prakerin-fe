// composables/consume-api-auth/auth-logout.api.ts
import { apiFetch } from '~/composables/api-fetch'
import type { AuthLogoutRequest, AuthLogoutResponse } from '~/composables/types-auth/auth.interface'

export async function logoutUser(payload: AuthLogoutRequest) {
  return await apiFetch<AuthLogoutResponse>('AuthService', '/auth/logout', {
    method: 'POST',
    data: payload
  }, true)
}
