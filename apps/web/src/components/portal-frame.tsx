'use client';

import type { ReactNode } from 'react';
import { clearSession } from '@/lib/session';

export function PortalFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-sm font-medium text-gray-500">TheMinaker</p>
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            {subtitle ? <p className="text-sm text-gray-600">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            onClick={() => {
              clearSession();
              window.location.href = '/login';
            }}
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}

export function StatusBanner({
  tone,
  children,
}: {
  tone: 'error' | 'empty' | 'info';
  children: ReactNode;
}) {
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-800',
    empty: 'border-gray-200 bg-white text-gray-600',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
  } as const;
  return <p className={`rounded-lg border px-4 py-3 text-sm ${styles[tone]}`}>{children}</p>;
}
