/**
 * Global Auth Middleware
 * Ensures authentication state is properly synchronized
 * Uses JWT token validation instead of API calls
 */
import { useDataStore } from "~/stores/data-store";

export default defineNuxtRouteMiddleware((to) => {
  // Skip middleware for login and public pages
  const publicPages = ["/login", "/register", "/", "/about", "/storage-health"];
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

  const getDashboardRoute = () => {
    switch (role) {
      case "admin":
        return "/admin";
      case "guru":
        return "/guru";
      case "siswa":
        return "/siswa";
      case "tata_usaha":
        return "/tata-usaha";
      default:
        return "/login";
    }
  };

  if (path.startsWith("/admin") && role !== "admin") {
    console.warn("[Auth Middleware] Admin access denied for role:", role);
    return navigateTo(getDashboardRoute());
  }
  if (path.startsWith("/guru") && role !== "guru") {
    console.warn("[Auth Middleware] Guru access denied for role:", role);
    return navigateTo(getDashboardRoute());
  }
  if (path.startsWith("/siswa") && role !== "siswa") {
    console.warn("[Auth Middleware] Siswa access denied for role:", role);
    return navigateTo(getDashboardRoute());
  }
  if (path.startsWith("/tata-usaha") && role !== "tata_usaha") {
    console.warn("[Auth Middleware] Tata Usaha access denied for role:", role);
    return navigateTo(getDashboardRoute());
  }
});
