// composables/consume-api-auth/auth-login.api.ts
import { apiFetch } from '~/composables/api-fetch'
import type { AuthLoginRequest, AuthLoginResponse } from '~/composables/types-auth/auth.interface'

export async function loginUser(payload: AuthLoginRequest) {
  return await apiFetch<AuthLoginResponse>('AuthService', '/auth/login', {
    method: 'POST',
    data: payload
  }, false)
}
