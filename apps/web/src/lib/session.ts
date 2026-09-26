import { UserRole } from '@minaker/shared-types';
import { apiClient } from './api-client';

const TOKEN_KEY = 'minaker.accessToken';
const USER_KEY = 'minaker.user';

export type SessionUser = {
  id: string;
  role: UserRole;
  fullName: string;
  tenantId?: string | null;
  phone?: string;
};

export function readSession(): { token: string; user: SessionUser } | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(TOKEN_KEY);
  const raw = localStorage.getItem(USER_KEY);
  if (!token || !raw) return null;
  try {
    const user = JSON.parse(raw) as SessionUser;
    apiClient.setToken(token);
    return { token, user };
  } catch {
    return null;
  }
}

export function saveSession(token: string, user: SessionUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  apiClient.setToken(token);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  apiClient.setToken(null);
}

export function portalPath(role: UserRole): string {
  if (role === UserRole.SUPER_ADMIN) return '/super-admin';
  if (role === UserRole.SCHOOL_ADMIN || role === UserRole.TEACHER) return '/school-admin';
  return '/login';
}
