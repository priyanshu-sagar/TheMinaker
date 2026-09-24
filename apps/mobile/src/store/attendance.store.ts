import {
  AttendanceStatus,
  AttendanceType,
  MarkAttendanceBatchRequest,
} from '@minaker/shared-types';
import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { apiClient } from '../api/client';

const storage = new MMKV({ id: 'attendance-store' });
const QUEUE_KEY = 'attendance_queue';

interface PendingMark {
  id: string; // local UUID
  studentId: string;
  studentName: string;
  attendanceType: AttendanceType;
  status: AttendanceStatus;
  gateLocation?: string;
  tripId?: string;
  markedBy: string;
  markedAt: number; // Unix ms
}

interface AttendanceState {
  /** Local in-memory map of studentId → status (for instant UI) */
  localMarks: Record<string, AttendanceStatus>;
  /** Queue of marks not yet synced to server */
  pendingQueue: PendingMark[];
  /** Number of pending marks */
  pendingCount: number;
  /** Mark a student (optimistic + queue for sync) */
  markStudent: (mark: Omit<PendingMark, 'id' | 'markedAt'>) => void;
  /** Sync all pending marks to server — call when network available */
  syncPending: () => Promise<void>;
  /** Reset local state (e.g. on logout or new day) */
  reset: () => void;
}

function loadQueue(): PendingMark[] {
  try {
    const raw = storage.getString(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as PendingMark[]) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: PendingMark[]) {
  storage.set(QUEUE_KEY, JSON.stringify(queue));
}

export const useAttendanceStore = create<AttendanceState>((set, get) => {
  const initialQueue = loadQueue();

  return {
    localMarks: {},
    pendingQueue: initialQueue,
    pendingCount: initialQueue.length,

    markStudent: (mark) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const pending: PendingMark = { ...mark, id, markedAt: Date.now() };

      const queue = [...get().pendingQueue, pending];
      saveQueue(queue);

      set((state) => ({
        localMarks: { ...state.localMarks, [mark.studentId]: mark.status },
        pendingQueue: queue,
        pendingCount: queue.length,
      }));

      // Attempt immediate sync — if it fails, the queue persists
      get().syncPending().catch(() => {
        // Will retry on next sync call
      });
    },

    syncPending: async () => {
      const queue = get().pendingQueue;
      if (queue.length === 0) return;

      // Group by attendanceType + tripId for batch submission
      const grouped = queue.reduce<Record<string, PendingMark[]>>((acc, m) => {
        const key = `${m.attendanceType}:${m.tripId ?? ''}:${m.gateLocation ?? ''}`;
        if (!acc[key]) acc[key] = [];
        acc[key]!.push(m);
        return acc;
      }, {});

      const synced: string[] = [];

      for (const [, marks] of Object.entries(grouped)) {
        const first = marks[0]!;
        const payload: MarkAttendanceBatchRequest = {
          attendanceType: first.attendanceType,
          tripId: first.tripId,
          gateLocation: first.gateLocation,
          marks: marks.map((m) => ({
            studentId: m.studentId,
            status: m.status,
            attendanceType: m.attendanceType,
          })),
        };

        try {
          await apiClient.post('/attendance/mark-batch', payload);
          synced.push(...marks.map((m) => m.id));
        } catch {
          // Keep failed marks in queue for retry
        }
      }

      if (synced.length > 0) {
        const remaining = get().pendingQueue.filter((m) => !synced.includes(m.id));
        saveQueue(remaining);
        set({ pendingQueue: remaining, pendingCount: remaining.length });
      }
    },

    reset: () => {
      storage.delete(QUEUE_KEY);
      set({ localMarks: {}, pendingQueue: [], pendingCount: 0 });
    },
  };
});
