import { UserRole, UserStatus, type User } from '@minaker/shared-types';
import { useAuthStore } from '@/store/auth.store';

/**
 * Builds a mock signed-in User and stores it via the existing auth store.
 * The store already persists the token with expo-secure-store — this module
 * only supplies a fake token and a User shaped like the real API response.
 */
export async function saveMockSession(input: {
  role: UserRole;
  fullName: string;
  email?: string;
  phone?: string;
  employeeId?: string;
}): Promise<void> {
  const now = new Date().toISOString();
  const user: User = {
    id: `mock-${input.role}-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    tenantId: 'mock-tenant',
    role: input.role,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    employeeId: input.employeeId,
    status: UserStatus.ACTIVE,
  };
  await useAuthStore.getState().setAuth(`mock.${input.role}.${user.id}`, user);
}
