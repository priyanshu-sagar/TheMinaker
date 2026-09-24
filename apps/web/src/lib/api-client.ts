import { ApiError, ApiResponse, PaginatedResponse } from '@minaker/shared-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const API_VERSION = 'v1';
const BASE = `${API_URL}/api/${API_VERSION}`;

type RequestOptions = {
  token?: string;
  params?: Record<string, string | number | boolean>;
};

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(`${BASE}${path}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    }
    return url.toString();
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    opts?: RequestOptions,
  ): Promise<T> {
    const token = opts?.token ?? this.token;
    const response = await fetch(this.buildUrl(path, opts?.params), {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = (await response.json()) as ApiResponse<T> | ApiError;

    if (!response.ok || !json.success) {
      const err = json as ApiError;
      throw new Error(err.error?.message ?? `HTTP ${response.status}`);
    }

    return (json as ApiResponse<T>).data;
  }

  get<T>(path: string, opts?: RequestOptions) {
    return this.request<T>('GET', path, undefined, opts);
  }

  post<T>(path: string, body: unknown, opts?: RequestOptions) {
    return this.request<T>('POST', path, body, opts);
  }

  patch<T>(path: string, body: unknown, opts?: RequestOptions) {
    return this.request<T>('PATCH', path, body, opts);
  }

  delete<T>(path: string, opts?: RequestOptions) {
    return this.request<T>('DELETE', path, undefined, opts);
  }

  // ─── Auth ─────────────────────────────────────────────────────
  auth = {
    sendOtp: (phone: string) =>
      this.post<{ message: string; devOtp?: string }>('/auth/send-otp', { phone }),
    verifyOtp: (phone: string, otp: string) =>
      this.post<{ accessToken: string }>('/auth/verify-otp', { phone, otp }),
  };

  // ─── Tenants (Super Admin) ─────────────────────────────────────
  tenants = {
    list: () => this.get<PaginatedResponse<unknown>>('/tenants'),
    get: (id: string) => this.get<unknown>(`/tenants/${id}`),
    create: (data: { name: string; slug: string }) =>
      this.post<unknown>('/tenants', data),
    suspend: (id: string) => this.patch<void>(`/tenants/${id}/suspend`, {}),
    activate: (id: string) => this.patch<void>(`/tenants/${id}/activate`, {}),
  };

  // ─── Users ─────────────────────────────────────────────────────
  users = {
    me: () => this.get<unknown>('/users/me'),
  };

  // ─── Health ────────────────────────────────────────────────────
  health = {
    ready: () => this.get<{ status: string }>('/health/ready'),
  };
}

export const apiClient = new ApiClient();
export default apiClient;
