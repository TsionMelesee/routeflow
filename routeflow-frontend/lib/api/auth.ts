import { apiClient } from "./client";
import type { ApiResponse, User } from "@/lib/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  organization_name: string;
  organization_slug: string;
  admin_name: string;
  admin_email: string;
  admin_password: string;
  admin_password_confirmation: string;
}

export interface AuthResult {
  data: User;
  token: string;
}

export const authApi = {
  login: (payload: LoginPayload) => apiClient.post<AuthResult>("/auth/login", payload),

  register: (payload: RegisterPayload) => apiClient.post<AuthResult>("/auth/register", payload),

  logout: () => apiClient.post<{ message: string }>("/auth/logout"),

  me: () => apiClient.get<ApiResponse<User>>("/auth/me"),

  forgotPassword: (email: string) =>
    apiClient.post<{ message: string }>("/auth/forgot-password", { email }),

  resetPassword: (payload: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => apiClient.post<{ message: string }>("/auth/reset-password", payload),
};
