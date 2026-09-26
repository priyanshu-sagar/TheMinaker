'use client';

import {
  AttendanceStatus,
  AttendanceType,
  UserRole,
  type StudentWithAttendance,
} from '@minaker/shared-types';
import { FormEvent, useEffect, useState } from 'react';
import { PortalFrame, StatusBanner } from '@/components/portal-frame';
import { apiClient, type AttendanceSummary } from '@/lib/api-client';
import { readSession, type SessionUser } from '@/lib/session';

const TYPES = [
  AttendanceType.SCHOOL_ENTRY,
  AttendanceType.SCHOOL_EXIT,
  AttendanceType.BUS_BOARDING,
  AttendanceType.BUS_ALIGHTING,
] as const;

const SUMMARY_CARDS: Array<{ key: keyof AttendanceSummary; label: string }> = [
  { key: 'total', label: 'Students' },
  { key: 'present', label: 'Present' },
  { key: 'late', label: 'Late' },
  { key: 'absent', label: 'Absent' },
  { key: 'unmarked', label: 'Unmarked' },
];

function statusLabel(student: StudentWithAttendance) {
  return student.todayStatus ?? 'unmarked';
}

export default function SchoolAdminPage() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);
  const [attendanceType, setAttendanceType] = useState<AttendanceType>(AttendanceType.SCHOOL_ENTRY);
  const [classSection, setClassSection] = useState('');
  const [appliedClass, setAppliedClass] = useState('');
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [roster, setRoster] = useState<StudentWithAttendance[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const current = readSession();
    if (!current) {
      window.location.href = '/login?role=school_admin';
      return;
    }
    if (current.user.role === UserRole.SUPER_ADMIN) {
      window.location.href = '/super-admin';
      return;
    }
    if (current.user.role !== UserRole.SCHOOL_ADMIN && current.user.role !== UserRole.TEACHER) {
      window.location.href = '/login';
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
    const section = appliedClass.trim() || undefined;
    Promise.all([
      apiClient.attendance.summary(attendanceType),
      apiClient.attendance.roster(attendanceType, section),
    ])
      .then(([nextSummary, nextRoster]) => {
        if (cancelled) return;
        setSummary(nextSummary);
        setRoster(Array.isArray(nextRoster) ? nextRoster : []);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setSummary(null);
          setRoster([]);
          setError(err instanceof Error ? err.message : 'Could not load attendance');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, attendanceType, appliedClass]);

  function onFilter(event: FormEvent) {
    event.preventDefault();
    setAppliedClass(classSection.trim());
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-600">
        Checking session…
      </main>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <PortalFrame title="Today's attendance" subtitle={`${session.fullName} · ${today}`}>
      <form onSubmit={onFilter} className="mb-6 flex flex-wrap items-end gap-3">
        <label className="text-sm font-medium text-gray-700">
          Mark type
          <select
            className="mt-1 block rounded-lg border border-gray-300 bg-white px-3 py-2"
            value={attendanceType}
            onChange={(event) => setAttendanceType(event.target.value as AttendanceType)}
          >
            {TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-gray-700">
          Class
          <input
            className="mt-1 block rounded-lg border border-gray-300 px-3 py-2"
            value={classSection}
            onChange={(event) => setClassSection(event.target.value)}
            placeholder="10-A"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          Filter roster
        </button>
      </form>

      {error ? <StatusBanner tone="error">{error}</StatusBanner> : null}
      {loading ? <p className="mb-4 text-sm text-gray-600">Loading attendance…</p> : null}

      {summary ? (
        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          {SUMMARY_CARDS.map((card) => (
            <article key={card.key} className="rounded-xl border border-gray-200 bg-white px-4 py-3">
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-2xl font-semibold text-gray-900">{summary[card.key]}</p>
            </article>
          ))}
        </section>
      ) : null}

      {!loading && !error && roster.length === 0 ? (
        <StatusBanner tone="empty">No students on this roster.</StatusBanner>
      ) : null}

      {roster.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Roll</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Class</th>
                <th className="px-4 py-3 font-medium">Today</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((student) => {
                const status = statusLabel(student);
                return (
                  <tr key={student.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 text-gray-700">{student.rollNumber}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{student.fullName}</td>
                    <td className="px-4 py-3 text-gray-700">{student.classSection}</td>
                    <td
                      className={`px-4 py-3 capitalize ${
                        status === AttendanceStatus.PRESENT
                          ? 'text-green-700'
                          : status === AttendanceStatus.ABSENT
                            ? 'text-red-700'
                            : status === AttendanceStatus.LATE
                              ? 'text-amber-700'
                              : 'text-gray-500'
                      }`}
                    >
                      {status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </PortalFrame>
  );
}
