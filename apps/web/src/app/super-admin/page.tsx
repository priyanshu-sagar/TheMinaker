'use client';

import { TenantPlan, TenantStatus, UserRole, type Tenant } from '@minaker/shared-types';
import { FormEvent, useEffect, useState } from 'react';
import { PortalFrame, StatusBanner } from '@/components/portal-frame';
import { apiClient } from '@/lib/api-client';
import { readSession, type SessionUser } from '@/lib/session';

const PLANS = [TenantPlan.STARTER, TenantPlan.GROWTH, TenantPlan.ENTERPRISE] as const;

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function SuperAdminPage() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [plan, setPlan] = useState<TenantPlan>(TenantPlan.STARTER);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const current = readSession();
    if (!current) {
      window.location.href = '/login?role=super_admin';
      return;
    }
    if (current.user.role !== UserRole.SUPER_ADMIN) {
      window.location.href = '/school-admin';
      return;
    }
    setSession(current.user);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiClient.tenants
      .list()
      .then((rows) => {
        if (!cancelled) setTenants(Array.isArray(rows) ? rows : []);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load schools');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ready]);

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const created = await apiClient.tenants.create({
        name: name.trim(),
        slug: slug.trim(),
        plan,
      });
      setTenants((current) => [created, ...current]);
      setName('');
      setSlug('');
      setPlan(TenantPlan.STARTER);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not onboard school');
    } finally {
      setCreating(false);
    }
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-600">
        Checking session…
      </main>
    );
  }

  return (
    <PortalFrame title="Schools" subtitle={session.fullName}>
      <form onSubmit={onCreate} className="mb-6 grid gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-4">
        <label className="text-sm font-medium text-gray-700 md:col-span-1">
          School name
          <input
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={name}
            onChange={(event) => {
              const next = event.target.value;
              setName(next);
              setSlug(slugify(next));
            }}
          />
        </label>
        <label className="text-sm font-medium text-gray-700">
          Slug
          <input
            required
            minLength={2}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
          />
        </label>
        <label className="text-sm font-medium text-gray-700">
          Plan
          <select
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={plan}
            onChange={(event) => setPlan(event.target.value as TenantPlan)}
          >
            {PLANS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={creating}
            className="w-full rounded-lg bg-blue-600 px-3 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {creating ? 'Saving…' : 'Onboard school'}
          </button>
        </div>
      </form>

      {error ? <StatusBanner tone="error">{error}</StatusBanner> : null}
      {loading ? <p className="text-sm text-gray-600">Loading schools…</p> : null}
      {!loading && !error && tenants.length === 0 ? (
        <StatusBanner tone="empty">No schools yet. Onboard the first one above.</StatusBanner>
      ) : null}

      {tenants.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">School</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-900">{tenant.name}</td>
                  <td className="px-4 py-3 text-gray-700">{tenant.slug}</td>
                  <td className="px-4 py-3 text-gray-700">{tenant.plan}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        tenant.status === TenantStatus.SUSPENDED
                          ? 'text-red-700'
                          : tenant.status === TenantStatus.ACTIVE
                            ? 'text-green-700'
                            : 'text-amber-700'
                      }
                    >
                      {tenant.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </PortalFrame>
  );
}
