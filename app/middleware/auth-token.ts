import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useAuth } from '~/composables/auth/use-auth';

/**
 * Auth Middleware
 * - Checks if user is authenticated
 * - Redirects to login if not authenticated
 * - Fetches user profile if token exists
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // Only run on client side
  if (!import.meta.client) return;

  const { isAuthenticated, checkAuth, userRole, getDashboardRoute } = useAuth();

  // Check authentication
  const isAuth = await checkAuth();

  // If not authenticated, redirect to login
  if (!isAuth) {
    return navigateTo('/login');
  }

  // Optional: Check role-based access
  const path = to.path;
  const role = userRole.value;

  // Role-based route protection
  if (path.startsWith('/admin') && role !== 'admin') {
    return navigateTo(getDashboardRoute());
  }
  if (path.startsWith('/guru') && role !== 'guru') {
    return navigateTo(getDashboardRoute());
  }
  if (path.startsWith('/siswa') && role !== 'siswa') {
    return navigateTo(getDashboardRoute());
  }
  if (path.startsWith('/mentor') && role !== 'mentor') {
    return navigateTo(getDashboardRoute());
  }
});
