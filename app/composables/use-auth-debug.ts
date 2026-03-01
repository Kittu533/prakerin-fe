/**
 * Auth Debug Composable
 * Provides debugging utilities for authentication issues
 */
import { useDataStore } from '~/stores/data-store'
import { useAuth } from '~/composables/auth/use-auth'

export function useAuthDebug() {
  const dataStore = useDataStore()
  const auth = useAuth()

  function debugAuthState() {
    console.group('[Auth Debug] Current State')
    
    // Store state
    console.log('Store token:', !!dataStore.token ? '✅ Present' : '❌ Missing')
    console.log('Store profile:', dataStore.profile ? '✅ Present' : '❌ Missing')
    console.log('Store refreshToken:', !!dataStore.refreshToken ? '✅ Present' : '❌ Missing')
    
    // LocalStorage state
    const localToken = localStorage.getItem('token')
    const localProfile = localStorage.getItem('profile')
    const localRefresh = localStorage.getItem('refreshToken')
    
    console.log('LocalStorage token:', !!localToken ? '✅ Present' : '❌ Missing')
    console.log('LocalStorage profile:', !!localProfile ? '✅ Present' : '❌ Missing')
    console.log('LocalStorage refreshToken:', !!localRefresh ? '✅ Present' : '❌ Missing')
    
    // Profile details
    if (dataStore.profile) {
      console.log('Profile details:', {
        id: dataStore.profile.id,
        role: dataStore.profile.role,
        entity_id: dataStore.profile.entity_id,
        entity_type: dataStore.profile.entity_type,
        identifier: dataStore.profile.identifier
      })
    }
    
    // Token details
    if (dataStore.token) {
      try {
        const tokenParts = dataStore.token.split('.');
        if (tokenParts.length === 3 && tokenParts[1]) {
          const payload = JSON.parse(atob(tokenParts[1])) as any;
          console.log('Token payload:', {
            role: payload.role,
            entity_id: payload.entity_id,
            entity_type: payload.entity_type,
            exp: new Date(payload.exp * 1000),
            isExpired: payload.exp * 1000 < Date.now()
          });
        }
      } catch (e) {
        console.error('Failed to decode token:', e);
      }
    }
    
    console.groupEnd()
  }

  async function fixAuthState() {
    console.log('[Auth Debug] Attempting to fix auth state...')
    
    // Step 1: Initialize from localStorage
    dataStore.initializeFromLocalStorage()
    
    // Step 2: If no token but have refresh token, try to refresh
    if (!dataStore.token && dataStore.refreshToken) {
      console.log('[Auth Debug] No token but have refresh token, attempting refresh...')
      const refreshSuccess = await auth.refreshToken()
      if (!refreshSuccess) {
        console.error('[Auth Debug] Token refresh failed')
        return false
      }
    }
    
    // Step 3: If have token but no profile, fetch profile
    if (dataStore.token && !dataStore.profile) {
      console.log('[Auth Debug] Have token but no profile, fetching...')
      const profile = await auth.fetchProfile()
      if (!profile) {
        console.error('[Auth Debug] Profile fetch failed')
        return false
      }
    }
    
    // Step 4: Verify everything is in sync
    debugAuthState()
    
    return !!(dataStore.token && dataStore.profile)
  }

  function clearAuthAndReload() {
    console.log('[Auth Debug] Clearing all auth data and reloading...')
    dataStore.clearAuth()
    window.location.reload()
  }

  return {
    debugAuthState,
    fixAuthState,
    clearAuthAndReload
  }
}