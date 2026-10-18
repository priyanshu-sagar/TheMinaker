import { UserRole } from '@minaker/shared-types';
import { generateMockOtp, isFirstLoginId, isUnverifiedPhone, PHONE_NOT_VERIFIED_MESSAGE } from './mock-directory';

/**
 * Simulated backend for the auth module. No network calls — every function
 * resolves after a short delay so the UI feels real. Replace with real
 * `apiClient` calls in a later, isolated pass.
 */

export class AuthMockError extends Error {}

function delay<T>(value: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// ─── Parent — email OTP (sign-up + forgot password) ──────────────────────────

export async function sendEmailOtp(email: string): Promise<{ otp: string }> {
  const otp = generateMockOtp();
  return delay({ otp });
}

export async function verifyEmailOtp(input: { enteredOtp: string; expectedOtp: string }): Promise<void> {
  await delay(null, 400);
  if (input.enteredOtp.trim() !== input.expectedOtp) {
    throw new AuthMockError('Incorrect code. Please try again.');
  }
}

// ─── Parent — login ────────────────────────────────────────────────────────

export async function parentLogin(input: {
  method: 'email' | 'phone';
  value: string;
  password: string;
}): Promise<{ fullName: string }> {
  await delay(null);
  if (input.method === 'phone' && isUnverifiedPhone(input.value)) {
    throw new AuthMockError(PHONE_NOT_VERIFIED_MESSAGE);
  }
  if (input.password.trim().length < 4) {
    throw new AuthMockError('Enter your password.');
  }
  return { fullName: 'Parent User' };
}

export async function parentRequestPasswordReset(input: {
  method: 'email' | 'phone';
  value: string;
}): Promise<{ otp: string }> {
  await delay(null, 300);
  if (input.method === 'phone' && isUnverifiedPhone(input.value)) {
    throw new AuthMockError(PHONE_NOT_VERIFIED_MESSAGE);
  }
  return { otp: generateMockOtp() };
}

// ─── Provisioned staff (teacher, gateman, conductor, school admin) ──────────

export type ProvisionedRole =
  | UserRole.TEACHER
  | UserRole.GATEKEEPER
  | UserRole.CONDUCTOR
  | UserRole.SCHOOL_ADMIN;

export async function provisionedLogin(input: {
  role: ProvisionedRole;
  id: string;
  password: string;
}): Promise<{ firstLogin: boolean; fullName: string }> {
  await delay(null);
  if (input.password.trim().length < 4) {
    throw new AuthMockError('Enter your password.');
  }
  const fullName = input.role === UserRole.CONDUCTOR ? 'Ranjit Singh' : `${roleLabel(input.role)} ${input.id}`;
  return { firstLogin: isFirstLoginId(input.id), fullName };
}

export async function setNewPassword(input: {
  newPassword: string;
  confirmPassword: string;
}): Promise<void> {
  await delay(null, 400);
  if (input.newPassword.length < 8) {
    throw new AuthMockError('Password must be at least 8 characters.');
  }
  if (input.newPassword !== input.confirmPassword) {
    throw new AuthMockError('Passwords do not match.');
  }
}

export async function staffRequestPasswordResetOtp(): Promise<{ otp: string }> {
  return delay({ otp: generateMockOtp() }, 300);
}

function roleLabel(role: ProvisionedRole): string {
  switch (role) {
    case UserRole.TEACHER:
      return 'Teacher';
    case UserRole.GATEKEEPER:
      return 'Gateman';
    case UserRole.CONDUCTOR:
      return 'Conductor';
    case UserRole.SCHOOL_ADMIN:
      return 'Admin';
  }
}
