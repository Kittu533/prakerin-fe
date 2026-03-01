import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { useAuth } from "~/composables/auth/use-auth";

/**
 * Auth Middleware (Alternative)
 * - Checks if user is authenticated
 * - Redirects to login if not authenticated
 * - Uses JWT validation (no API calls)
 */
export default defineNuxtRouteMiddleware((to) => {
  // Only run on client side
  if (!import.meta.client) return;

  const { isAuthenticated, userRole, getDashboardRoute } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated.value) {
    return navigateTo("/login");
  }

  // Role-based route protection
  const path = to.path;
  const role = userRole.value;

  if (path.startsWith("/admin") && role !== "admin") {
    return navigateTo(getDashboardRoute());
  }
  if (path.startsWith("/guru") && role !== "guru") {
    return navigateTo(getDashboardRoute());
  }
  if (path.startsWith("/siswa") && role !== "siswa") {
    return navigateTo(getDashboardRoute());
  }
  if (path.startsWith("/mentor") && role !== "mentor") {
    return navigateTo(getDashboardRoute());
  }
});
