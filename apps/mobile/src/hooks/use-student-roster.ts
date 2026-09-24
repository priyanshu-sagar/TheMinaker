import { AttendanceType, StudentWithAttendance } from '@minaker/shared-types';
import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useAttendanceStore } from '../store/attendance.store';

interface UseStudentRosterOptions {
  attendanceType: AttendanceType;
  classSection?: string;
  date?: string;
}

interface RosterResult {
  students: StudentWithAttendance[];
  classSections: string[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetches the student roster with pre-loaded today's attendance status.
 * Merges server data with local optimistic updates from the attendance store.
 */
export function useStudentRoster(opts: UseStudentRosterOptions): RosterResult {
  const [students, setStudents] = useState<StudentWithAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const localMarks = useAttendanceStore((s) => s.localMarks);

  const fetchRoster = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.attendance.getRoster({
        attendanceType: opts.attendanceType,
        classSection: opts.classSection,
        date: opts.date ?? new Date().toISOString().split('T')[0],
      }) as StudentWithAttendance[];

      // Merge local optimistic marks over server data
      const merged = data.map((s) => ({
        ...s,
        todayStatus: localMarks[s.id] ?? s.todayStatus,
      }));

      setStudents(merged);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load roster'));
    } finally {
      setLoading(false);
    }
  }, [opts.attendanceType, opts.classSection, opts.date]);

  useEffect(() => {
    void fetchRoster();
  }, [fetchRoster]);

  // Re-merge when local marks change (after a toggle tap)
  const mergedStudents = students.map((s) => ({
    ...s,
    todayStatus: localMarks[s.id] ?? s.todayStatus,
  }));

  // Extract unique class sections for filter pills
  const classSections = [...new Set(students.map((s) => s.classSection))].sort();

  return {
    students: mergedStudents,
    classSections,
    loading,
    error,
    refetch: fetchRoster,
  };
}
