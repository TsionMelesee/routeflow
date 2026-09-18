import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse, User, UserStatus } from "@/lib/types";

export interface UserListParams {
  page?: number;
  per_page?: number;
  search?: string;
  role?: string;
  status?: UserStatus | "";
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  role_slugs: string[];
}

export interface UpdateUserPayload {
  name?: string;
  phone?: string | null;
  status?: UserStatus;
  role_slugs?: string[];
}

export const usersApi = {
  list: (params: UserListParams) => apiClient.get<PaginatedResponse<User>>("/users", { params }),

  get: (id: number) => apiClient.get<ApiResponse<User>>(`/users/${id}`),

  create: (payload: CreateUserPayload) => apiClient.post<ApiResponse<User>>("/users", payload),

  update: (id: number, payload: UpdateUserPayload) => apiClient.put<ApiResponse<User>>(`/users/${id}`, payload),

  delete: (id: number) => apiClient.delete<{ message: string }>(`/users/${id}`),
};
