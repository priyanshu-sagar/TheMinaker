import { create } from 'zustand';

/**
 * Local mock database for the V3 Teacher portal.
 *
 * A teacher can be attached to many classes. One of those may be their
 * "class teacher" homeroom, which unlocks the Class Roster tab, Comms
 * "Class Announcements", and settings management. Non-homeroom classes
 * only appear in scheduling, materials, targeted tests, and direct
 * parent reports — never in roster or announcements.
 *
 * The `selectedClassId` is the reactive scope for every tab. Changing
 * it filters schedule, materials, tests, and announcements.
 *
 * Everything here stands in for future NestJS responses.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TeacherClass {
    id: string;
    name: string;
    /** True only for the teacher's homeroom class (unlocks roster / class announcements). */
    isClassTeacher: boolean;
}

export interface SchedulePeriod {
    id: string;
    classId: string;
    period: number;
    subject: string;
    time: string; // "H:MM AM/PM"
    endTime: string;
    room: string;
}

export type CampusStatus = 'At Gate' | 'Not Arrived' | 'Parent Excused';
export type ClassAttendance = 'Pending' | 'Present' | 'Absent';

export interface StudentPastScore {
    testTitle: string;
    subject: string;
    score: number;
    maxMarks: number;
    date: string;
}

export interface RosterStudent {
    id: string;
    classId: string;
    name: string;
    rollNumber: string;
    campusStatus: CampusStatus;
    campusStatusAt?: string;
    classAttendance: ClassAttendance;
    parentName: string;
    parentPhone: string;
    parentEmail: string;
    /** Rolling academic average — 0-100. */
    progressPercent: number;
    pastScores: StudentPastScore[];
}

export interface TestScore {
    studentId: string;
    score: number | null;
}

export interface MarkedTest {
    id: string;
    classId: string;
    title: string;
    subject: string;
    maxMarks: number;
    date: string; // ISO date
    /** Which students in the class are graded. Empty means "whole class". */
    targetStudentIds: string[];
    scores: TestScore[];
}

export type MaterialType = 'PDF' | 'Note' | 'Link' | 'Image';

export interface ClassMaterial {
    id: string;
    classId: string;
    title: string;
    type: MaterialType;
    date: string; // ISO
}

export type CommsChannel = 'Announcement' | 'DirectReport';
export type DirectReportRoute = 'SchoolAdmin' | 'Parent';

export interface ClassAnnouncement {
    id: string;
    channel: 'Announcement';
    classId: string;
    title: string;
    body: string;
    date: string;
}

export interface DirectReport {
    id: string;
    channel: 'DirectReport';
    classId: string;
    title: string;
    body: string;
    date: string;
    /** Which parent this concerns — required. */
    targetStudentId: string;
    /** Whether we notified the school admin or messaged the parent directly. */
    route: DirectReportRoute;
}

export type CommsMessage = ClassAnnouncement | DirectReport;

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_CLASSES: TeacherClass[] = [
    { id: 'cls-6b', name: 'Class 6-B (Homeroom)', isClassTeacher: true },
    { id: 'cls-7a', name: 'Class 7-A Maths', isClassTeacher: false },
    { id: 'cls-8c', name: 'Class 8-C Maths', isClassTeacher: false },
];

const INITIAL_SCHEDULE: SchedulePeriod[] = [
    { id: 'p1', classId: 'cls-6b', period: 1, subject: 'English', time: '8:00 AM', endTime: '8:45 AM', room: 'Room 12' },
    { id: 'p2', classId: 'cls-6b', period: 2, subject: 'Mathematics', time: '8:50 AM', endTime: '9:35 AM', room: 'Room 12' },
    { id: 'p3', classId: 'cls-7a', period: 3, subject: 'Mathematics', time: '9:40 AM', endTime: '10:25 AM', room: 'Room 21' },
    { id: 'p4', classId: 'cls-6b', period: 4, subject: 'Social Studies', time: '11:00 AM', endTime: '11:45 AM', room: 'Room 12' },
    { id: 'p5', classId: 'cls-8c', period: 5, subject: 'Mathematics', time: '11:50 AM', endTime: '12:35 PM', room: 'Room 33' },
    { id: 'p6', classId: 'cls-6b', period: 6, subject: 'Class Activity', time: '1:15 PM', endTime: '2:00 PM', room: 'Room 12' },
];

const HOMEROOM_ROSTER: RosterStudent[] = [
    {
        id: 'stu-1', classId: 'cls-6b', name: 'Aarav Sharma', rollNumber: '6B-01',
        campusStatus: 'At Gate', campusStatusAt: '8:05 AM', classAttendance: 'Present',
        parentName: 'Rohan Sharma', parentPhone: '+919820011122', parentEmail: 'rohan.sharma@example.in',
        progressPercent: 82,
        pastScores: [
            { testTitle: 'Unit Test 1', subject: 'Mathematics', score: 21, maxMarks: 25, date: '2026-08-14' },
            { testTitle: 'Grammar Quiz', subject: 'English', score: 9, maxMarks: 10, date: '2026-09-24' },
        ],
    },
    {
        id: 'stu-2', classId: 'cls-6b', name: 'Sanya Malhotra', rollNumber: '6B-02',
        campusStatus: 'Not Arrived', classAttendance: 'Pending',
        parentName: 'Preeti Malhotra', parentPhone: '+919820044455', parentEmail: 'preeti.m@example.in',
        progressPercent: 68,
        pastScores: [{ testTitle: 'Unit Test 1', subject: 'Mathematics', score: 15, maxMarks: 25, date: '2026-08-14' }],
    },
    {
        id: 'stu-3', classId: 'cls-6b', name: 'Riya Kapoor', rollNumber: '6B-03',
        campusStatus: 'At Gate', campusStatusAt: '7:58 AM', classAttendance: 'Present',
        parentName: 'Manav Kapoor', parentPhone: '+919820055566', parentEmail: 'manav.k@example.in',
        progressPercent: 91,
        pastScores: [
            { testTitle: 'Unit Test 1', subject: 'Mathematics', score: 24, maxMarks: 25, date: '2026-08-14' },
            { testTitle: 'Grammar Quiz', subject: 'English', score: 8, maxMarks: 10, date: '2026-09-24' },
        ],
    },
    {
        id: 'stu-4', classId: 'cls-6b', name: 'Arjun Nair', rollNumber: '6B-04',
        campusStatus: 'Parent Excused', classAttendance: 'Absent',
        parentName: 'Latha Nair', parentPhone: '+919820066677', parentEmail: 'latha.nair@example.in',
        progressPercent: 55,
        pastScores: [{ testTitle: 'Unit Test 1', subject: 'Mathematics', score: 12, maxMarks: 25, date: '2026-08-14' }],
    },
    {
        id: 'stu-5', classId: 'cls-6b', name: 'Meher Kapoor', rollNumber: '6B-05',
        campusStatus: 'At Gate', campusStatusAt: '8:10 AM', classAttendance: 'Present',
        parentName: 'Kabir Kapoor', parentPhone: '+919820077788', parentEmail: 'kabir.k@example.in',
        progressPercent: 77,
        pastScores: [
            { testTitle: 'Unit Test 1', subject: 'Mathematics', score: 19, maxMarks: 25, date: '2026-08-14' },
            { testTitle: 'Grammar Quiz', subject: 'English', score: 7, maxMarks: 10, date: '2026-09-24' },
        ],
    },
    {
        id: 'stu-6', classId: 'cls-6b', name: 'Dev Agarwal', rollNumber: '6B-06',
        campusStatus: 'At Gate', campusStatusAt: '8:02 AM', classAttendance: 'Present',
        parentName: 'Anita Agarwal', parentPhone: '+919820088899', parentEmail: 'anita.a@example.in',
        progressPercent: 84,
        pastScores: [{ testTitle: 'Unit Test 1', subject: 'Mathematics', score: 21, maxMarks: 25, date: '2026-08-14' }],
    },
    {
        id: 'stu-7', classId: 'cls-6b', name: 'Ananya Gupta', rollNumber: '6B-07',
        campusStatus: 'Not Arrived', classAttendance: 'Pending',
        parentName: 'Neha Gupta', parentPhone: '+919820099900', parentEmail: 'neha.g@example.in',
        progressPercent: 63,
        pastScores: [{ testTitle: 'Unit Test 1', subject: 'Mathematics', score: 14, maxMarks: 25, date: '2026-08-14' }],
    },
    {
        id: 'stu-8', classId: 'cls-6b', name: 'Vivaan Nair', rollNumber: '6B-08',
        campusStatus: 'At Gate', campusStatusAt: '7:55 AM', classAttendance: 'Present',
        parentName: 'Suresh Nair', parentPhone: '+919820010011', parentEmail: 'suresh.n@example.in',
        progressPercent: 88,
        pastScores: [
            { testTitle: 'Unit Test 1', subject: 'Mathematics', score: 23, maxMarks: 25, date: '2026-08-14' },
            { testTitle: 'Grammar Quiz', subject: 'English', score: 9, maxMarks: 10, date: '2026-09-24' },
        ],
    },
];

const CLASS_7A_ROSTER: RosterStudent[] = [
    { id: 'stu-7a-1', classId: 'cls-7a', name: 'Ishaan Verma', rollNumber: '7A-05', campusStatus: 'At Gate', campusStatusAt: '7:50 AM', classAttendance: 'Present', parentName: 'Rakesh Verma', parentPhone: '+919820200111', parentEmail: 'rakesh.v@example.in', progressPercent: 79, pastScores: [] },
    { id: 'stu-7a-2', classId: 'cls-7a', name: 'Zara Sheikh', rollNumber: '7A-12', campusStatus: 'At Gate', campusStatusAt: '7:52 AM', classAttendance: 'Present', parentName: 'Farah Sheikh', parentPhone: '+919820200222', parentEmail: 'farah.s@example.in', progressPercent: 86, pastScores: [] },
    { id: 'stu-7a-3', classId: 'cls-7a', name: 'Kabir Menon', rollNumber: '7A-18', campusStatus: 'Not Arrived', classAttendance: 'Pending', parentName: 'Divya Menon', parentPhone: '+919820200333', parentEmail: 'divya.m@example.in', progressPercent: 71, pastScores: [] },
];

const CLASS_8C_ROSTER: RosterStudent[] = [
    { id: 'stu-8c-1', classId: 'cls-8c', name: 'Nikhil Rao', rollNumber: '8C-02', campusStatus: 'At Gate', campusStatusAt: '7:48 AM', classAttendance: 'Present', parentName: 'Sunita Rao', parentPhone: '+919820300111', parentEmail: 'sunita.r@example.in', progressPercent: 74, pastScores: [] },
    { id: 'stu-8c-2', classId: 'cls-8c', name: 'Aditi Joshi', rollNumber: '8C-09', campusStatus: 'At Gate', campusStatusAt: '7:53 AM', classAttendance: 'Present', parentName: 'Vikas Joshi', parentPhone: '+919820300222', parentEmail: 'vikas.j@example.in', progressPercent: 90, pastScores: [] },
];

const INITIAL_STUDENTS: RosterStudent[] = [...HOMEROOM_ROSTER, ...CLASS_7A_ROSTER, ...CLASS_8C_ROSTER];

const INITIAL_MATERIALS: ClassMaterial[] = [
    { id: 'mat-1', classId: 'cls-6b', title: 'Ch 4 — Ecosystems Notes', type: 'PDF', date: '2026-09-22' },
    { id: 'mat-2', classId: 'cls-6b', title: 'Grammar Reference Sheet', type: 'PDF', date: '2026-09-20' },
    { id: 'mat-3', classId: 'cls-7a', title: 'Algebra Cheatsheet', type: 'Note', date: '2026-09-19' },
    { id: 'mat-4', classId: 'cls-8c', title: 'Geometry Video (Khan Academy)', type: 'Link', date: '2026-09-18' },
];

const INITIAL_TESTS: MarkedTest[] = [
    {
        id: 'test-1', classId: 'cls-6b', title: 'Unit Test 2', subject: 'Mathematics', maxMarks: 25, date: '2026-09-20',
        targetStudentIds: [],
        scores: [
            { studentId: 'stu-1', score: 22 }, { studentId: 'stu-2', score: 18 },
            { studentId: 'stu-3', score: 24 }, { studentId: 'stu-4', score: null },
            { studentId: 'stu-5', score: 19 }, { studentId: 'stu-6', score: 21 },
            { studentId: 'stu-7', score: null }, { studentId: 'stu-8', score: 23 },
        ],
    },
    {
        id: 'test-2', classId: 'cls-6b', title: 'Grammar Quiz', subject: 'English', maxMarks: 10, date: '2026-09-24',
        targetStudentIds: [],
        scores: [
            { studentId: 'stu-1', score: 9 }, { studentId: 'stu-2', score: null },
            { studentId: 'stu-3', score: 8 }, { studentId: 'stu-4', score: null },
            { studentId: 'stu-5', score: 7 }, { studentId: 'stu-6', score: 10 },
            { studentId: 'stu-7', score: null }, { studentId: 'stu-8', score: 9 },
        ],
    },
    {
        id: 'test-3', classId: 'cls-6b', title: 'Chapter 4 — Ecosystems', subject: 'Science', maxMarks: 20, date: '2026-10-02',
        targetStudentIds: [],
        scores: HOMEROOM_ROSTER.map((student) => ({ studentId: student.id, score: null })),
    },
    {
        id: 'test-4', classId: 'cls-7a', title: 'Algebra Retest', subject: 'Mathematics', maxMarks: 15, date: '2026-09-25',
        targetStudentIds: ['stu-7a-3'],
        scores: [{ studentId: 'stu-7a-3', score: null }],
    },
];

const INITIAL_COMMS: CommsMessage[] = [
    { id: 'comm-1', channel: 'Announcement', classId: 'cls-6b', title: 'Homework — Chapter 4 exercises', body: 'Please complete Chapter 4 exercises 1–5 by Monday.', date: '2026-09-24T10:15:00.000Z' },
    { id: 'comm-2', channel: 'Announcement', classId: 'cls-6b', title: 'Unit Test 2 results shared', body: 'Unit Test 2 marks have been entered. Please check the report card.', date: '2026-09-21T09:00:00.000Z' },
    { id: 'comm-3', channel: 'DirectReport', classId: 'cls-6b', title: 'Disruptive behavior in class', body: 'Arjun was repeatedly talking during today\'s lesson. Please follow up at home.', date: '2026-09-23T13:30:00.000Z', targetStudentId: 'stu-4', route: 'SchoolAdmin' },
    { id: 'comm-4', channel: 'DirectReport', classId: 'cls-7a', title: 'Missed weekend homework', body: 'Kabir did not submit the weekend algebra sheet.', date: '2026-09-22T11:15:00.000Z', targetStudentId: 'stu-7a-3', route: 'Parent' },
];

// ─── State ────────────────────────────────────────────────────────────────────

interface TeacherState {
    classes: TeacherClass[];
    selectedClassId: string;
    schedule: SchedulePeriod[];
    students: RosterStudent[];
    materials: ClassMaterial[];
    tests: MarkedTest[];
    communications: CommsMessage[];
    modificationRequests: string[];

    setSelectedClassId: (id: string) => void;

    // Class management (Settings hub).
    addClass: (name: string, isClassTeacher: boolean) => void;
    removeClass: (id: string) => void;

    // Roster management (Settings hub).
    addStudent: (classId: string, input: { name: string; rollNumber: string; parentName: string; parentPhone: string; parentEmail: string }) => void;
    removeStudent: (id: string) => void;

    // Timetable management (Settings hub).
    addSchedulePeriod: (input: Omit<SchedulePeriod, 'id'>) => void;
    removeSchedulePeriod: (id: string) => void;

    // Roster ops (Homeroom only, from the Roster tab).
    markClassAttendance: (id: string, status: ClassAttendance) => void;
    saveClassAttendance: (classId: string) => void;

    // Materials (Dashboard upload flow).
    uploadMaterial: (input: Omit<ClassMaterial, 'id' | 'date'>) => void;
    removeMaterial: (id: string) => void;

    // Academics.
    logTestScore: (testId: string, studentId: string, score: number | null) => void;
    createTest: (input: { classId: string; title: string; subject: string; maxMarks: number; targetStudentIds: string[] }) => void;

    // Comms.
    sendAnnouncement: (input: { classId: string; title: string; body: string }) => void;
    sendDirectReport: (input: { classId: string; title: string; body: string; targetStudentId: string; route: DirectReportRoute }) => void;

    submitModificationRequest: (text: string) => void;
}

export const useTeacherStore = create<TeacherState>((set, get) => ({
    classes: INITIAL_CLASSES,
    selectedClassId: INITIAL_CLASSES[0]!.id,
    schedule: INITIAL_SCHEDULE,
    students: INITIAL_STUDENTS,
    materials: INITIAL_MATERIALS,
    tests: INITIAL_TESTS,
    communications: INITIAL_COMMS,
    modificationRequests: [],

    setSelectedClassId: (id) => {
        if (!get().classes.some((cls) => cls.id === id)) return;
        set({ selectedClassId: id });
    },

    addClass: (name, isClassTeacher) =>
        set((state) => ({
            classes: [...state.classes, { id: `cls-${Date.now()}`, name: name.trim(), isClassTeacher }],
        })),

    removeClass: (id) =>
        set((state) => {
            const remaining = state.classes.filter((cls) => cls.id !== id);
            if (remaining.length === 0) return state;
            return {
                classes: remaining,
                selectedClassId: state.selectedClassId === id ? remaining[0]!.id : state.selectedClassId,
                students: state.students.filter((student) => student.classId !== id),
                schedule: state.schedule.filter((period) => period.classId !== id),
                materials: state.materials.filter((material) => material.classId !== id),
                tests: state.tests.filter((test) => test.classId !== id),
                communications: state.communications.filter((message) => message.classId !== id),
            };
        }),

    addStudent: (classId, input) =>
        set((state) => ({
            students: [
                ...state.students,
                {
                    id: `stu-${Date.now()}`,
                    classId,
                    name: input.name.trim(),
                    rollNumber: input.rollNumber.trim(),
                    campusStatus: 'Not Arrived',
                    classAttendance: 'Pending',
                    parentName: input.parentName.trim(),
                    parentPhone: input.parentPhone.trim(),
                    parentEmail: input.parentEmail.trim(),
                    progressPercent: 0,
                    pastScores: [],
                },
            ],
        })),

    removeStudent: (id) =>
        set((state) => ({
            students: state.students.filter((student) => student.id !== id),
            tests: state.tests.map((test) => ({
                ...test,
                scores: test.scores.filter((entry) => entry.studentId !== id),
                targetStudentIds: test.targetStudentIds.filter((sid) => sid !== id),
            })),
        })),

    addSchedulePeriod: (input) =>
        set((state) => ({
            schedule: [...state.schedule, { ...input, id: `p-${Date.now()}` }],
        })),

    removeSchedulePeriod: (id) =>
        set((state) => ({
            schedule: state.schedule.filter((period) => period.id !== id),
        })),

    markClassAttendance: (id, status) =>
        set((state) => ({
            students: state.students.map((student) =>
                student.id === id ? { ...student, classAttendance: status } : student,
            ),
        })),

    // The V3 roster has an explicit "Save" — for the mocked backend this is
    // a no-op that just returns; it exists so the UI can flash a toast.
    saveClassAttendance: () => {
        /* mocked network commit */
    },

    uploadMaterial: (input) =>
        set((state) => ({
            materials: [
                { id: `mat-${Date.now()}`, ...input, date: new Date().toISOString().slice(0, 10) },
                ...state.materials,
            ],
        })),

    removeMaterial: (id) =>
        set((state) => ({
            materials: state.materials.filter((material) => material.id !== id),
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

    createTest: ({ classId, title, subject, maxMarks, targetStudentIds }) =>
        set((state) => {
            const classStudents = state.students.filter((student) => student.classId === classId);
            const targetIds =
                targetStudentIds.length > 0
                    ? targetStudentIds
                    : classStudents.map((student) => student.id);
            return {
                tests: [
                    {
                        id: `test-${Date.now()}`,
                        classId,
                        title,
                        subject,
                        maxMarks,
                        date: new Date().toISOString().slice(0, 10),
                        targetStudentIds: targetStudentIds.length > 0 ? [...targetStudentIds] : [],
                        scores: targetIds.map((studentId) => ({ studentId, score: null })),
                    },
                    ...state.tests,
                ],
            };
        }),

    sendAnnouncement: ({ classId, title, body }) =>
        set((state) => ({
            communications: [
                {
                    id: `comm-${Date.now()}`,
                    channel: 'Announcement',
                    classId,
                    title,
                    body,
                    date: new Date().toISOString(),
                },
                ...state.communications,
            ],
        })),

    sendDirectReport: ({ classId, title, body, targetStudentId, route }) =>
        set((state) => ({
            communications: [
                {
                    id: `comm-${Date.now()}`,
                    channel: 'DirectReport',
                    classId,
                    title,
                    body,
                    targetStudentId,
                    route,
                    date: new Date().toISOString(),
                },
                ...state.communications,
            ],
        })),

    submitModificationRequest: (text) =>
        set((state) => ({ modificationRequests: [...state.modificationRequests, text] })),
}));

// ─── Selectors / helpers ──────────────────────────────────────────────────────

/**
 * Reactive helpers scoped to the currently selected class. Every V3 tab reads
 * from these so switching the class selector instantly refreshes the UI.
 */
export function useSelectedClass(): TeacherClass | undefined {
    const classes = useTeacherStore((state) => state.classes);
    const selectedClassId = useTeacherStore((state) => state.selectedClassId);
    return classes.find((cls) => cls.id === selectedClassId);
}

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
