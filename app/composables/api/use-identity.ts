/**
 * Identity Service API Composable
 * Handles: User management, authentication
 */
import { apiFetch } from "~/composables/api-fetch";

// =============================================
// TYPES
// =============================================
export interface User {
  id: string;
  identifier: string;
  role: "admin" | "guru" | "siswa";
  entity_id: string;
  entity_type: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  nama?: string;
  additionalInfo?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// =============================================
// USER API
// =============================================
export function useUserApi() {
  async function getAll(params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.role) query.append("role", params.role);
    if (params?.search) query.append("search", params.search);

    const { data } = await apiFetch<PaginatedResponse<User>>(
      "AuthService",
      `/users?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  async function getById(id: string) {
    const { data } = await apiFetch<SingleResponse<User>>(
      "AuthService",
      `/users/${id}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  async function create(payload: {
    identifier: string;
    password: string;
    role: string;
    entity_id: string;
    entity_type: string;
  }) {
    const { data } = await apiFetch<SingleResponse<User>>(
      "AuthService",
      "/users",
      { method: "POST", data: payload },
      true,
    );
    return data;
  }

  async function update(
    id: string,
    payload: Partial<{
      identifier: string;
      role: string;
      is_active: boolean;
    }>,
  ) {
    const { data } = await apiFetch<SingleResponse<User>>(
      "AuthService",
      `/users/${id}`,
      { method: "PUT", data: payload },
      true,
    );
    return data;
  }

  async function remove(id: string) {
    const { data } = await apiFetch<SingleResponse<null>>(
      "AuthService",
      `/users/${id}`,
      { method: "DELETE" },
      true,
    );
    return data;
  }

  async function resetPassword(id: string) {
    const { data } = await apiFetch<
      SingleResponse<{ generated_password: string; newPassword?: string }>
    >("AuthService", `/users/${id}/reset-password`, { method: "POST" }, true);
    return data;
  }

  async function toggleStatus(id: string, is_active: boolean) {
    const { data } = await apiFetch<SingleResponse<User>>(
      "AuthService",
      `/users/${id}/status`,
      { method: "PATCH", data: { is_active } },
      true,
    );
    return data;
  }

  return {
    getAll,
    getById,
    create,
    update,
    remove,
    resetPassword,
    toggleStatus,
  };
}
