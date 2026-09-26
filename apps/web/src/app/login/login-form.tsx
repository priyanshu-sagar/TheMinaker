'use client';

import { LoginMethod, UserRole } from '@minaker/shared-types';
import { FormEvent, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { portalPath, saveSession, type SessionUser } from '@/lib/session';

const ROLES = [
  { value: UserRole.SCHOOL_ADMIN, label: 'School admin' },
  { value: UserRole.TEACHER, label: 'Teacher' },
  { value: UserRole.SUPER_ADMIN, label: 'Super admin' },
] as const;

function roleFromQuery(value: string | null): UserRole {
  if (value === UserRole.TEACHER || value === UserRole.SUPER_ADMIN) return value;
  return UserRole.SCHOOL_ADMIN;
}

export function LoginForm() {
  const params = useSearchParams();
  const initialRole = useMemo(() => roleFromQuery(params.get('role')), [params]);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [tenantSlug, setTenantSlug] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, setPending] = useState<'otp' | 'login' | null>(null);

  async function onSendOtp(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setDevOtp(null);
    setPending('otp');
    try {
      const result = await apiClient.auth.sendOtp({ tenantSlug: tenantSlug.trim(), phone: phone.trim() });
      setInfo(result.message);
      if (result.devOtp) {
        setDevOtp(result.devOtp);
        setOtp(result.devOtp);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send OTP');
    } finally {
      setPending(null);
    }
  }

  async function onLogin(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending('login');
    try {
      const result = await apiClient.auth.login({
        role,
        tenantSlug: tenantSlug.trim(),
        identifier: phone.trim(),
        credential: otp.trim(),
        loginMethod: LoginMethod.PHONE_OTP,
      });
      const user: SessionUser = {
        id: result.user.id,
        role: result.user.role,
        fullName: result.user.fullName,
        tenantId: result.user.tenantId,
        phone: result.user.phone,
      };
      saveSession(result.accessToken, user);
      window.location.href = portalPath(user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setPending(null);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
        <p className="mt-1 text-sm text-gray-600">Phone OTP for the school dashboard.</p>

        <form className="mt-6 space-y-4" onSubmit={onLogin}>
          <label className="block text-sm font-medium text-gray-700">
            Portal
            <select
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
            >
              {ROLES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-gray-700">
            School slug
            <input
              required
              minLength={2}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              value={tenantSlug}
              onChange={(event) => setTenantSlug(event.target.value)}
              placeholder="dps-north"
              autoComplete="organization"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Phone
            <input
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+9198XXXXXXXX"
              autoComplete="tel"
            />
          </label>

          <button
            type="button"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
            disabled={pending !== null}
            onClick={onSendOtp}
          >
            {pending === 'otp' ? 'Sending OTP…' : 'Send OTP'}
          </button>

          <label className="block text-sm font-medium text-gray-700">
            OTP
            <input
              required
              minLength={4}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 tracking-widest"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          </label>

          {info ? <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">{info}</p> : null}
          {devOtp ? (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Development OTP: {devOtp}
            </p>
          ) : null}
          {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
          {role === UserRole.SUPER_ADMIN ? (
            <p className="text-sm text-gray-600">
              Super admin still sends the school slug the API requires today. A tenant-less super-admin
              account cannot finish this login until the API accepts it.
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-3 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            disabled={pending !== null}
          >
            {pending === 'login' ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  );
}
