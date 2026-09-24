import { LoginRequest, LoginResponse } from '@minaker/shared-types';
import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000'; // Android emulator → localhost
const API_VERSION = 'v1';
const BASE = `${API_URL}/api/${API_VERSION}`;

class MobileApiClient {
  private http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: BASE,
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    });

    // Request interceptor — inject JWT from secure store
    this.http.interceptors.request.use(async (config) => {
      const token = await SecureStore.getItemAsync('minaker_access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor — normalize errors
    this.http.interceptors.response.use(
      (res) => res,
      (err) => {
        const msg =
          err?.response?.data?.error?.message ??
          err?.message ??
          'Something went wrong';
        return Promise.reject(new Error(msg));
      },
    );
  }

  async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    const res = await this.http.get<{ success: true; data: T }>(path, { params });
    return res.data.data;
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await this.http.post<{ success: true; data: T }>(path, body);
    return res.data.data;
  }

  async patch<T>(path: string, body: unknown): Promise<T> {
    const res = await this.http.patch<{ success: true; data: T }>(path, body);
    return res.data.data;
  }

  // ─── Auth ─────────────────────────────────────────────────────
  async login(payload: LoginRequest): Promise<LoginResponse> {
    return this.post<LoginResponse>('/auth/login', payload);
  }

  async sendOtp(body: { phone?: string; parentUid?: string; tenantSlug: string }): Promise<{ message: string }> {
    return this.post('/auth/send-otp', body);
  }

  // ─── Attendance ────────────────────────────────────────────────
  attendance = {
    getRoster: (params: { date?: string; classSection?: string; attendanceType?: string }) =>
      this.get('/attendance/roster', params as Record<string, unknown>),
    mark: (body: unknown) => this.post('/attendance/mark', body),
    markBatch: (body: unknown) => this.post('/attendance/mark-batch', body),
  };
}

export const apiClient = new MobileApiClient();
