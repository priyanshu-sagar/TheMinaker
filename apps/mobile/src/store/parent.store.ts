import { create } from 'zustand';

export type TransitStatus = 'En route' | 'At school' | 'Not travelling';
export type AttendanceMark = 'Present' | 'Absent';
export type RequestAudience = 'Gateman' | 'School Admin';

export interface BoardingPoint {
  name: string;
  lat: number;
  lng: number;
}

export interface ParentChild {
  id: string;
  name: string;
  grade: string;
  assignedBusId: string;
  boardingPoint: BoardingPoint;
  absentToday: boolean;
  waitingAtStop: boolean;
}

export interface LiveTransit {
  busId: string;
  routeName: string;
  conductorName: string;
  conductorPhone: string;
  gatemanName: string;
  gatemanPhone: string;
  officePhone: string;
  status: TransitStatus;
  eta: string;
  currentLocation: { lat: number; lng: number };
  /** Metres from the child's boarding point. */
  distanceToStop: number;
}

export interface AttendanceLog {
  id: string;
  childId: string;
  date: string;
  boardedTime: string | null;
  droppedTime: string | null;
  status: AttendanceMark;
}

export interface ParentRequest {
  id: string;
  childId: string;
  kind: 'Bus change' | 'Boarding point' | 'Contact number' | 'Child details';
  audience: RequestAudience;
  detail: string;
  reason: string;
  createdAt: string;
}

interface ParentState {
  children: ParentChild[];
  activeChildId: string;
  liveTransit: LiveTransit;
  attendanceHistory: AttendanceLog[];
  requests: ParentRequest[];
  /** One-time code a trusted adult can quote at the gate. */
  pickupCode: string;
  setActiveChildId: (id: string) => void;
  markAbsentToday: (childId: string) => void;
  confirmWaitingAtStop: (childId: string) => void;
  requestBusChange: (newBus: string, reason: string) => void;
  requestStopChange: (newStop: string, reason: string) => void;
  requestProfileUpdate: (data: { kind: 'Contact number' | 'Child details'; detail: string; reason: string }) => void;
}

const TRANSIT: Record<string, LiveTransit> = {
  'child-aarav': {
    busId: 'MH-01-AB-2144',
    routeName: 'Andheri West — Route 4',
    conductorName: 'Ramesh Patil',
    conductorPhone: '+919820011100',
    gatemanName: 'Suresh Kamble',
    gatemanPhone: '+919820022200',
    officePhone: '+912226401100',
    status: 'En route',
    eta: '6 min',
    currentLocation: { lat: 19.1197, lng: 72.8468 },
    distanceToStop: 480,
  },
  'child-meher': {
    busId: 'MH-01-CD-9081',
    routeName: 'Bandra East — Route 2',
    conductorName: 'Imran Shaikh',
    conductorPhone: '+919820033300',
    gatemanName: 'Suresh Kamble',
    gatemanPhone: '+919820022200',
    officePhone: '+912226401100',
    status: 'En route',
    eta: '18 min',
    currentLocation: { lat: 19.0544, lng: 72.8402 },
    distanceToStop: 2400,
  },
};

const CHILDREN: ParentChild[] = [
  {
    id: 'child-aarav',
    name: 'Aarav Sharma',
    grade: 'Class 6-B',
    assignedBusId: 'MH-01-AB-2144',
    boardingPoint: { name: 'Lokhandwala Circle', lat: 19.1307, lng: 72.8296 },
    absentToday: false,
    waitingAtStop: false,
  },
  {
    id: 'child-meher',
    name: 'Meher Sharma',
    grade: 'Class 3-A',
    assignedBusId: 'MH-01-CD-9081',
    boardingPoint: { name: 'Khar Telephone Exchange', lat: 19.0688, lng: 72.8400 },
    absentToday: false,
    waitingAtStop: false,
  },
];

const HISTORY: AttendanceLog[] = [
  { id: 'a1', childId: 'child-aarav', date: '2026-10-13', boardedTime: '7:12 AM', droppedTime: '2:40 PM', status: 'Present' },
  { id: 'a2', childId: 'child-aarav', date: '2026-10-12', boardedTime: '7:08 AM', droppedTime: '2:36 PM', status: 'Present' },
  { id: 'a3', childId: 'child-aarav', date: '2026-10-10', boardedTime: null, droppedTime: null, status: 'Absent' },
  { id: 'a4', childId: 'child-aarav', date: '2026-10-09', boardedTime: '7:15 AM', droppedTime: '2:41 PM', status: 'Present' },
  { id: 'a5', childId: 'child-aarav', date: '2026-10-08', boardedTime: '7:11 AM', droppedTime: '2:38 PM', status: 'Present' },
  { id: 'm1', childId: 'child-meher', date: '2026-10-13', boardedTime: '7:22 AM', droppedTime: '1:10 PM', status: 'Present' },
  { id: 'm2', childId: 'child-meher', date: '2026-10-12', boardedTime: '7:19 AM', droppedTime: '1:08 PM', status: 'Present' },
  { id: 'm3', childId: 'child-meher', date: '2026-10-09', boardedTime: '7:25 AM', droppedTime: '1:12 PM', status: 'Present' },
  { id: 'm4', childId: 'child-meher', date: '2026-10-08', boardedTime: null, droppedTime: null, status: 'Absent' },
];

function pushRequest(
  state: ParentState,
  input: Omit<ParentRequest, 'id' | 'childId' | 'createdAt'>,
): ParentRequest[] {
  return [
    {
      ...input,
      id: `req-${Date.now()}`,
      childId: state.activeChildId,
      createdAt: new Date().toISOString(),
    },
    ...state.requests,
  ];
}

export const useParentStore = create<ParentState>((set, get) => ({
  children: CHILDREN,
  activeChildId: CHILDREN[0]!.id,
  liveTransit: TRANSIT[CHILDREN[0]!.id]!,
  attendanceHistory: HISTORY,
  requests: [],
  pickupCode: '4821',

  setActiveChildId: (id) => {
    const transit = TRANSIT[id];
    const child = get().children.find((item) => item.id === id);
    if (!transit || !child) return;
    set({
      activeChildId: id,
      liveTransit: child.absentToday ? { ...transit, status: 'Not travelling', eta: '—' } : transit,
    });
  },

  markAbsentToday: (childId) =>
    set((state) => {
      const children = state.children.map((child) =>
        child.id === childId ? { ...child, absentToday: true, waitingAtStop: false } : child,
      );
      const liveTransit =
        state.activeChildId === childId
          ? { ...state.liveTransit, status: 'Not travelling' as const, eta: '—' }
          : state.liveTransit;
      return { children, liveTransit };
    }),

  confirmWaitingAtStop: (childId) =>
    set((state) => ({
      children: state.children.map((child) =>
        child.id === childId ? { ...child, waitingAtStop: true } : child,
      ),
    })),

  requestBusChange: (newBus, reason) =>
    set((state) => ({
      requests: pushRequest(state, {
        kind: 'Bus change',
        audience: 'Gateman',
        detail: newBus,
        reason,
      }),
    })),

  requestStopChange: (newStop, reason) =>
    set((state) => ({
      requests: pushRequest(state, {
        kind: 'Boarding point',
        audience: 'Gateman',
        detail: newStop,
        reason,
      }),
    })),

  requestProfileUpdate: ({ kind, detail, reason }) =>
    set((state) => ({
      requests: pushRequest(state, {
        kind,
        audience: 'School Admin',
        detail,
        reason,
      }),
    })),
}));

export function useActiveChild(): ParentChild | undefined {
  const children = useParentStore((state) => state.children);
  const activeChildId = useParentStore((state) => state.activeChildId);
  return children.find((child) => child.id === activeChildId);
}
