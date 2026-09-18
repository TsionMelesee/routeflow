"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, type LoginPayload, type RegisterPayload } from "@/lib/api/auth";
import { getToken, setToken, clearToken } from "@/lib/auth/token";
import type { User } from "@/lib/types";
import { ApiError } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const ME_QUERY_KEY = ["auth", "me"] as const;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const hasToken = typeof window !== "undefined" && Boolean(getToken());

  const {
    data: user,
    isLoading,
  } = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: async () => {
      const res = await authApi.me();
      return res.data;
    },
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60_000,
  });

  const login = useCallback(
    async (payload: LoginPayload) => {
      const result = await authApi.login(payload);
      setToken(result.token);
      queryClient.setQueryData(ME_QUERY_KEY, result.data);
      return result.data;
    },
    [queryClient],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const result = await authApi.register(payload);
      setToken(result.token);
      queryClient.setQueryData(ME_QUERY_KEY, result.data);
      return result.data;
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if the server call fails (token already expired, network
      // hiccup), we still clear local state — logging out should never
      // get "stuck" waiting on the network.
    } finally {
      clearToken();
      queryClient.setQueryData(ME_QUERY_KEY, null);
      queryClient.clear();
    }
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: user ?? null,
      isLoading: hasToken && isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, isLoading, hasToken, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
