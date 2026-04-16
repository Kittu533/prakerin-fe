/**
 * Global Auth Middleware
 * Ensures authentication state is properly synchronized
 * Uses JWT token validation instead of API calls
 */
import { useDataStore } from "~/stores/data-store";

export default defineNuxtRouteMiddleware((to) => {
  // Skip middleware for login and public pages
  const publicPages = ["/login", "/register", "/", "/about"];
  if (publicPages.includes(to.path) || !import.meta.client) {
    return;
  }

  const dataStore = useDataStore();

  // Initialize auth state from localStorage if not already done
  if (!dataStore.token) {
    dataStore.initializeFromLocalStorage();
  }

  // Log current auth state for debugging
  console.debug("[Auth Middleware] Current state:", {
    hasToken: !!dataStore.token,
    hasJwtPayload: !!dataStore.jwtPayload,
    userRole: dataStore.userRole,
    userId: dataStore.userId,
    path: to.path,
  });

  // If no token, redirect to login
  if (!dataStore.token || !dataStore.jwtPayload) {
    console.warn("[Auth Middleware] No token found, redirecting to login");
    return navigateTo("/login");
  }

  // Check if token is expired
  if (dataStore.jwtPayload.exp) {
    const now = Math.floor(Date.now() / 1000);
    if (now >= dataStore.jwtPayload.exp) {
      console.warn(
        "[Auth Middleware] Token expired, clearing auth and redirecting to login",
      );
      dataStore.clearAuth();
      return navigateTo("/login");
    }
  }

  // Role-based route protection
  const role = dataStore.userRole;
  const path = to.path;

  if (path.startsWith("/admin") && role !== "admin") {
    console.warn("[Auth Middleware] Admin access denied for role:", role);
    return navigateTo("/siswa");
  }
  if (path.startsWith("/guru") && role !== "guru") {
    console.warn("[Auth Middleware] Guru access denied for role:", role);
    return navigateTo("/siswa");
  }
  if (path.startsWith("/siswa") && role !== "siswa") {
    console.warn("[Auth Middleware] Siswa access denied for role:", role);
    return navigateTo("/login");
  }
});
