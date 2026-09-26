import { create } from 'zustand';

/**
 * Local mock database for the Teacher portal. Every array here stands in
 * for a future NestJS response — actions only filter/update these arrays,
 * matching the "frontend only, mocked data" directive for this pass.
 */

export interface SchedulePeriod {
  id: string;
  period: number;
  subject: string;
  time: string; // "HH:MM AM/PM"
  endTime: string;
  room: string;
}

export type CampusStatus = 'At Gate' | 'Not Arrived' | 'Parent Excused';
export type ClassAttendance = 'Pending' | 'Present' | 'Absent' | 'Late';

export interface RosterStudent {
  id: string;
  name: string;
  rollNumber: string;
  campusStatus: CampusStatus;
  campusStatusAt?: string;
  classAttendance: ClassAttendance;
  behaviorPoints: number;
  parentPhone: string;
}

export interface TestScore {
  studentId: string;
  score: number | null;
}

export interface MarkedTest {
  id: string;
  title: string;
  subject: string;
  maxMarks: number;
  date: string; // ISO date
  scores: TestScore[];
}

export type CommsType = 'Broadcast' | 'Complaint';

export interface CommsMessage {
  id: string;
  type: CommsType;
  title: string;
  body: string;
  date: string; // ISO
  targetStudentId?: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_SCHEDULE: SchedulePeriod[] = [
  { id: 'p1', period: 1, subject: 'English', time: '8:00 AM', endTime: '8:45 AM', room: 'Room 12' },
  { id: 'p2', period: 2, subject: 'Mathematics', time: '8:50 AM', endTime: '9:35 AM', room: 'Room 12' },
  { id: 'p3', period: 3, subject: 'Science', time: '9:40 AM', endTime: '10:25 AM', room: 'Lab 3' },
  { id: 'p4', period: 4, subject: 'Social Studies', time: '11:00 AM', endTime: '11:45 AM', room: 'Room 12' },
  { id: 'p5', period: 5, subject: 'Mathematics', time: '11:50 AM', endTime: '12:35 PM', room: 'Room 12' },
  { id: 'p6', period: 6, subject: 'Class Activity', time: '1:15 PM', endTime: '2:00 PM', room: 'Room 12' },
];

const INITIAL_ROSTER: RosterStudent[] = [
  { id: 'stu-1', name: 'Aarav Sharma', rollNumber: '6B-01', campusStatus: 'At Gate', campusStatusAt: '8:05 AM', classAttendance: 'Present', behaviorPoints: 12, parentPhone: '+919820011122' },
  { id: 'stu-2', name: 'Sanya Malhotra', rollNumber: '6B-02', campusStatus: 'Not Arrived', classAttendance: 'Pending', behaviorPoints: 8, parentPhone: '+919820044455' },
  { id: 'stu-3', name: 'Riya Kapoor', rollNumber: '6B-03', campusStatus: 'At Gate', campusStatusAt: '7:58 AM', classAttendance: 'Present', behaviorPoints: 15, parentPhone: '+919820055566' },
  { id: 'stu-4', name: 'Arjun Nair', rollNumber: '6B-04', campusStatus: 'Parent Excused', classAttendance: 'Absent', behaviorPoints: 6, parentPhone: '+919820066677' },
  { id: 'stu-5', name: 'Meher Kapoor', rollNumber: '6B-05', campusStatus: 'At Gate', campusStatusAt: '8:10 AM', classAttendance: 'Late', behaviorPoints: 10, parentPhone: '+919820077788' },
  { id: 'stu-6', name: 'Dev Agarwal', rollNumber: '6B-06', campusStatus: 'At Gate', campusStatusAt: '8:02 AM', classAttendance: 'Present', behaviorPoints: 14, parentPhone: '+919820088899' },
  { id: 'stu-7', name: 'Ananya Gupta', rollNumber: '6B-07', campusStatus: 'Not Arrived', classAttendance: 'Pending', behaviorPoints: 9, parentPhone: '+919820099900' },
  { id: 'stu-8', name: 'Vivaan Nair', rollNumber: '6B-08', campusStatus: 'At Gate', campusStatusAt: '7:55 AM', classAttendance: 'Present', behaviorPoints: 13, parentPhone: '+919820010011' },
];

const INITIAL_TESTS: MarkedTest[] = [
  {
    id: 'test-1',
    title: 'Unit Test 2',
    subject: 'Mathematics',
    maxMarks: 25,
    date: '2026-09-20',
    scores: [
      { studentId: 'stu-1', score: 22 },
      { studentId: 'stu-2', score: 18 },
      { studentId: 'stu-3', score: 24 },
      { studentId: 'stu-4', score: null },
      { studentId: 'stu-5', score: 19 },
      { studentId: 'stu-6', score: 21 },
      { studentId: 'stu-7', score: null },
      { studentId: 'stu-8', score: 23 },
    ],
  },
  {
    id: 'test-2',
    title: 'Grammar Quiz',
    subject: 'English',
    maxMarks: 10,
    date: '2026-09-24',
    scores: [
      { studentId: 'stu-1', score: 9 },
      { studentId: 'stu-2', score: null },
      { studentId: 'stu-3', score: 8 },
      { studentId: 'stu-4', score: null },
      { studentId: 'stu-5', score: 7 },
      { studentId: 'stu-6', score: 10 },
      { studentId: 'stu-7', score: null },
      { studentId: 'stu-8', score: 9 },
    ],
  },
  {
    id: 'test-3',
    title: 'Chapter 4 — Ecosystems',
    subject: 'Science',
    maxMarks: 20,
    date: '2026-10-02',
    scores: [
      { studentId: 'stu-1', score: null },
      { studentId: 'stu-2', score: null },
      { studentId: 'stu-3', score: null },
      { studentId: 'stu-4', score: null },
      { studentId: 'stu-5', score: null },
      { studentId: 'stu-6', score: null },
      { studentId: 'stu-7', score: null },
      { studentId: 'stu-8', score: null },
    ],
  },
];

const INITIAL_COMMS: CommsMessage[] = [
  { id: 'comm-1', type: 'Broadcast', title: 'Homework — Chapter 4 exercises', body: 'Please complete Chapter 4 exercises 1–5 by Monday.', date: '2026-09-24T10:15:00.000Z' },
  { id: 'comm-2', type: 'Broadcast', title: 'Unit Test 2 results shared', body: 'Unit Test 2 marks have been entered. Please check the report card.', date: '2026-09-21T09:00:00.000Z' },
  { id: 'comm-3', type: 'Complaint', title: 'Disruptive behavior in class', body: 'Arjun was repeatedly talking during the lesson today. Please follow up at home.', date: '2026-09-23T13:30:00.000Z', targetStudentId: 'stu-4' },
];

interface TeacherState {
  schedule: SchedulePeriod[];
  myClass: RosterStudent[];
  tests: MarkedTest[];
  communications: CommsMessage[];
  modificationRequests: string[];

  markClassAttendance: (id: string, status: ClassAttendance) => void;
  awardBehaviorPoint: (id: string, amount: number) => void;
  logTestScore: (testId: string, studentId: string, score: number | null) => void;
  createTest: (input: { title: string; subject: string; maxMarks: number }) => void;
  sendNotification: (payload: Omit<CommsMessage, 'id' | 'date'>) => void;
  submitModificationRequest: (text: string) => void;
}

export const useTeacherStore = create<TeacherState>((set) => ({
  schedule: INITIAL_SCHEDULE,
  myClass: INITIAL_ROSTER,
  tests: INITIAL_TESTS,
  communications: INITIAL_COMMS,
  modificationRequests: [],

  markClassAttendance: (id, status) =>
    set((state) => ({
      myClass: state.myClass.map((student) => (student.id === id ? { ...student, classAttendance: status } : student)),
    })),

  awardBehaviorPoint: (id, amount) =>
    set((state) => ({
      myClass: state.myClass.map((student) =>
        student.id === id ? { ...student, behaviorPoints: Math.max(0, student.behaviorPoints + amount) } : student,
      ),
    })),

  logTestScore: (testId, studentId, score) =>
    set((state) => ({
      tests: state.tests.map((test) =>
        test.id === testId
          ? {
              ...test,
              scores: test.scores.some((entry) => entry.studentId === studentId)
                ? test.scores.map((entry) => (entry.studentId === studentId ? { ...entry, score } : entry))
                : [...test.scores, { studentId, score }],
            }
          : test,
      ),
    })),

  createTest: ({ title, subject, maxMarks }) =>
    set((state) => ({
      tests: [
        {
          id: `test-${Date.now()}`,
          title,
          subject,
          maxMarks,
          date: new Date().toISOString().slice(0, 10),
          scores: state.myClass.map((student) => ({ studentId: student.id, score: null })),
        },
        ...state.tests,
      ],
    })),

  sendNotification: (payload) =>
    set((state) => ({
      communications: [{ ...payload, id: `comm-${Date.now()}`, date: new Date().toISOString() }, ...state.communications],
    })),

  submitModificationRequest: (text) =>
    set((state) => ({ modificationRequests: [...state.modificationRequests, text] })),
}));

/** Parses "H:MM AM/PM" against today's date for schedule comparisons. */
export function parsePeriodTime(time: string, base: Date = new Date()): Date {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim());
  if (!match) return base;
  let hours = parseInt(match[1]!, 10);
  const minutes = parseInt(match[2]!, 10);
  const meridiem = match[3]!.toUpperCase();
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  const result = new Date(base);
  result.setHours(hours, minutes, 0, 0);
  return result;
}
