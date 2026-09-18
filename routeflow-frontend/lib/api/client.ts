import { getToken, clearToken } from "@/lib/auth/token";
import { ApiError, type ApiErrorBody } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export interface RequestOptions {
  params?: object;
  signal?: AbortSignal;
}

function buildUrl(path: string, params?: RequestOptions["params"]): string {
  const url = new URL(`${API_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const token = getToken();
  const isFormData = body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(path, options?.params), {
    method,
    headers,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    signal: options?.signal,
    cache: "no-store",
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await res.json() : undefined;

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      clearToken();
      // Full navigation (not router.push) so the auth cookie state and
      // React Query cache both reset cleanly.
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    const body: ApiErrorBody = payload ?? { message: res.statusText };
    throw new ApiError(res.status, body);
  }

  return payload as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("POST", path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("PUT", path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("PATCH", path, body, options),
  delete: <T>(path: string, options?: RequestOptions) => request<T>("DELETE", path, undefined, options),
};

/**
 * For endpoints that stream a file (reports/deliveries/export) rather
 * than return JSON — resolves to a Blob the caller can turn into a
 * download link.
 */
export async function apiDownload(path: string, params?: RequestOptions["params"]): Promise<Blob> {
  const token = getToken();
  const res = await fetch(buildUrl(path, params), {
    headers: {
      Accept: "text/csv",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    throw new ApiError(res.status, { message: "Failed to download report." });
  }
  return res.blob();
}
