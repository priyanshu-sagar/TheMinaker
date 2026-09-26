import {
  ApiError,
  ApiResponse,
  AttendanceType,
  LoginRequest,
  LoginResponse,
  SendOtpRequest,
  Student,
  StudentWithAttendance,
  Tenant,
  TenantPlan,
} from '@minaker/shared-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const API_VERSION = 'v1';
const BASE = `${API_URL}/api/${API_VERSION}`;

type RequestOptions = {
  token?: string;
  params?: Record<string, string | number | boolean>;
};

export type AttendanceSummary = {
  present: number;
  absent: number;
  late: number;
  unmarked: number;
  total: number;
};

function errorMessage(payload: unknown, status: number): string {
  if (!payload || typeof payload !== 'object') return `HTTP ${status}`;
  const error = (payload as ApiError).error;
  const message = error?.message as unknown;
  if (Array.isArray(message)) return message.join(', ');
  if (typeof message === 'string' && message.length > 0) return message;
  return `HTTP ${status}`;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(`${BASE}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
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

    const text = await response.text();
    let json: unknown = null;
    if (text) {
      try {
        json = JSON.parse(text) as unknown;
      } catch {
        throw new Error(`HTTP ${response.status}`);
      }
    }

    if (!response.ok) {
      throw new Error(errorMessage(json, response.status));
    }

    if (json && typeof json === 'object' && 'success' in json) {
      const wrapped = json as ApiResponse<T> | ApiError;
      if (!wrapped.success) {
        throw new Error(errorMessage(wrapped, response.status));
      }
      return wrapped.data;
    }

    return json as T;
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

  auth = {
    sendOtp: (body: SendOtpRequest) =>
      this.post<{ message: string; devOtp?: string }>('/auth/send-otp', body),
    login: (body: LoginRequest) => this.post<LoginResponse>('/auth/login', body),
  };

  tenants = {
    list: () => this.get<Tenant[]>('/tenants'),
    get: (id: string) => this.get<Tenant>(`/tenants/${id}`),
    create: (data: { name: string; slug: string; plan?: TenantPlan }) =>
      this.post<Tenant>('/tenants', data),
    suspend: (id: string) => this.patch<void>(`/tenants/${id}/suspend`, {}),
    activate: (id: string) => this.patch<void>(`/tenants/${id}/activate`, {}),
  };

  users = {
    me: () => this.get<unknown>('/users/me'),
  };

  students = {
    list: () => this.get<Student[]>('/students'),
  };

  attendance = {
    summary: (attendanceType: AttendanceType, date?: string) =>
      this.get<AttendanceSummary>('/attendance/summary', {
        params: date ? { attendanceType, date } : { attendanceType },
      }),
    roster: (attendanceType: AttendanceType, classSection?: string) =>
      this.get<StudentWithAttendance[]>('/attendance/roster', {
        params: classSection ? { attendanceType, classSection } : { attendanceType },
      }),
  };

  health = {
    ready: () => this.get<{ status: string }>('/health/ready'),
  };
}

export const apiClient = new ApiClient();
export default apiClient;
