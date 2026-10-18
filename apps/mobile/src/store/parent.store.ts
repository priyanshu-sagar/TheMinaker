import { create } from 'zustand';

export type TransitStatus = 'En route' | 'At school' | 'Not travelling';
export type AttendanceMark = 'Present' | 'Absent';
export type RequestAudience = 'Gateman' | 'School Admin';

export interface BoardingPoint {
  name: string;
  lat: number;
  lng: number;
}

export type ChildStatus = 'Pending' | 'Active';

export interface ParentChild {
  id: string;
  name: string;
  grade: string;
  assignedBusId: string;
  boardingPoint: BoardingPoint;
  parentPhone: string;
  parentEmail: string;
  absentToday: boolean;
  selfDropOff: boolean;
  earlyPickup: boolean;
  waitingAtStop: boolean;
  arrivalReminder: boolean;
  status: ChildStatus;
}

export type ExceptionKind = 'selfDropOff' | 'earlyPickup' | 'absent' | 'reminder';

export interface ExceptionLog {
  id: string;
  childId: string;
  kind: ExceptionKind;
  label: string;
  at: string;
}

export interface ParentNotice {
  id: string;
  channel: 'school' | 'transit';
  title: string;
  body: string;
  at: string;
  read: boolean;
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

export interface FleetBusOption {
  id: string;
  routeName: string;
  departs: string;
}

export interface ParentRequest {
  id: string;
  childId: string;
  kind: 'Boarding point' | 'Contact number' | 'Child details';
  audience: RequestAudience;
  currentValue: string;
  nextValue: string;
  detail: string;
  reason: string;
  createdAt: string;
}

export type ConductorPing = {
  id: string;
  conductorName: string;
  busNumber: string;
  studentName: string;
  message: string;
  sentAt: string;
  replied: boolean;
  reply: 'Coming' | 'NotComing' | 'AlreadyHome' | 'Other' | null;
  replyNote: string | null;
};

export type GatemanHomePing = {
  id: string;
  gatemanName: string;
  studentName: string;
  message: string;
  sentAt: string;
  replied: boolean;
  confirmed: boolean | null;
};

interface ParentState {
  children: ParentChild[];
  activeChildId: string;
  liveTransit: LiveTransit;
  attendanceHistory: AttendanceLog[];
  pendingRequests: ParentRequest[];
  availableBuses: FleetBusOption[];
  exceptionLogs: ExceptionLog[];
  notices: ParentNotice[];
  conductorPings: ConductorPing[];
  gatemanHomePings: GatemanHomePing[];
  setActiveChildId: (id: string) => void;
  addChild: (input: { name: string; grade: string }) => void;
  setAbsentToday: (childId: string, on: boolean) => void;
  setSelfDropOff: (childId: string, on: boolean) => void;
  setEarlyPickup: (childId: string, on: boolean) => void;
  setArrivalReminder: (childId: string, on: boolean) => void;
  confirmWaitingAtStop: (childId: string) => void;
  requestStopChange: (input: { lat: number; lng: number; flat: string; area: string; landmark: string; reason: string }) => void;
  requestContactUpdate: (input: { channel: 'phone' | 'email'; nextValue: string; reason: string }) => void;
  withdrawRequest: (id: string) => void;
  markNoticesRead: (channel: 'school' | 'transit') => void;
  replyToConductorPing: (pingId: string, reply: ConductorPing['reply'], note?: string) => void;
  replyToGatemanHomePing: (pingId: string, confirmed: boolean) => void;
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
    parentPhone: '+919820011122',
    parentEmail: 'rohan.sharma@example.in',
    absentToday: false,
    selfDropOff: false,
    earlyPickup: false,
    waitingAtStop: false,
    arrivalReminder: true,
    status: 'Active',
  },
  {
    id: 'child-meher',
    name: 'Meher Sharma',
    grade: 'Class 3-A',
    assignedBusId: 'MH-01-CD-9081',
    boardingPoint: { name: 'Khar Telephone Exchange', lat: 19.0688, lng: 72.8400 },
    parentPhone: '+919820077788',
    parentEmail: 'rohan.sharma@example.in',
    absentToday: false,
    selfDropOff: false,
    earlyPickup: false,
    waitingAtStop: false,
    arrivalReminder: false,
    status: 'Active',
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

const BUSES: FleetBusOption[] = [
  { id: 'MH-01-AB-2144', routeName: 'Andheri West — Route 4', departs: '6:30 AM' },
  { id: 'MH-01-CD-9081', routeName: 'Bandra East — Route 2', departs: '6:45 AM' },
  { id: 'MH-01-EF-3310', routeName: 'Juhu — Route 6', departs: '7:00 AM' },
  { id: 'MH-01-GH-5528', routeName: 'Versova — Route 1', departs: '7:15 AM' },
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
    ...state.pendingRequests,
  ];
}

export const useParentStore = create<ParentState>((set, get) => ({
  children: CHILDREN,
  activeChildId: CHILDREN[0]!.id,
  liveTransit: TRANSIT[CHILDREN[0]!.id]!,
  attendanceHistory: HISTORY,
  pendingRequests: [],
  availableBuses: BUSES,
  exceptionLogs: [
    { id: 'ex1', childId: 'child-aarav', kind: 'absent', label: 'Bus skipped for the day', at: '2026-10-10T07:02:00.000Z' },
    { id: 'ex2', childId: 'child-aarav', kind: 'earlyPickup', label: 'Early pick-up', at: '2026-10-09T12:10:00.000Z' },
    { id: 'ex3', childId: 'child-meher', kind: 'selfDropOff', label: 'Dropped at school by parent', at: '2026-10-08T07:40:00.000Z' },
  ],
  notices: [
    { id: 'n1', channel: 'school', title: 'Holiday on 20 Oct', body: 'School is closed for Diwali prep. No buses that morning.', at: '2026-10-12T09:00:00.000Z', read: false },
    { id: 'n2', channel: 'school', title: 'Transport fee reminder', body: 'October transport fee is due by the 18th.', at: '2026-10-11T08:00:00.000Z', read: true },
    { id: 'n3', channel: 'transit', title: 'Bus is 6 minutes out', body: 'Route 4 is approaching Lokhandwala Circle.', at: '2026-10-14T06:40:00.000Z', read: false },
  ],

  setActiveChildId: (id) => {
    const child = get().children.find((item) => item.id === id);
    const transit = TRANSIT[id];
    if (!child) return;
    if (!transit || child.status === 'Pending') {
      set({
        activeChildId: id,
        liveTransit: {
          busId: '—',
          routeName: 'Awaiting verification',
          conductorName: '—',
          conductorPhone: '',
          gatemanName: '—',
          gatemanPhone: '',
          officePhone: '+912226401100',
          status: 'Not travelling',
          eta: '—',
          currentLocation: child.boardingPoint,
          distanceToStop: 0,
        },
      });
      return;
    }
    set({
      activeChildId: id,
      liveTransit: child.absentToday ? { ...transit, status: 'Not travelling', eta: '—' } : transit,
    });
  },

  addChild: ({ name, grade }) =>
    set((state) => {
      const id = `child-${Date.now()}`;
      const child: ParentChild = {
        id,
        name: name.trim(),
        grade: grade.trim(),
        assignedBusId: 'Unassigned',
        boardingPoint: { name: 'Not set', lat: 19.076, lng: 72.8777 },
        parentPhone: '',
        parentEmail: '',
        absentToday: false,
        selfDropOff: false,
        earlyPickup: false,
        waitingAtStop: false,
        arrivalReminder: false,
        status: 'Pending',
      };
      return {
        children: [...state.children, child],
        pendingRequests: [
          {
            id: `req-${Date.now()}`,
            childId: id,
            kind: 'Child details',
            audience: 'School Admin',
            currentValue: 'No child on file',
            nextValue: `${name.trim()} · ${grade.trim()}`,
            detail: `${name.trim()} · ${grade.trim()}`,
            reason: 'New child added',
            createdAt: new Date().toISOString(),
          },
          ...state.pendingRequests,
        ],
        activeChildId: id,
        liveTransit: {
          busId: '—',
          routeName: 'Awaiting verification',
          conductorName: '—',
          conductorPhone: '',
          gatemanName: '—',
          gatemanPhone: '',
          officePhone: '+912226401100',
          status: 'Not travelling',
          eta: '—',
          currentLocation: child.boardingPoint,
          distanceToStop: 0,
        },
      };
    }),

  setAbsentToday: (childId, on) =>
    set((state) => ({
      children: state.children.map((child) =>
        child.id === childId ? { ...child, absentToday: on, waitingAtStop: on ? false : child.waitingAtStop, selfDropOff: on ? false : child.selfDropOff } : child,
      ),
      liveTransit: state.activeChildId === childId
        ? { ...state.liveTransit, status: on ? 'Not travelling' : 'En route', eta: on ? '—' : state.liveTransit.eta === '—' ? '6 min' : state.liveTransit.eta }
        : state.liveTransit,
      exceptionLogs: [
        { id: `ex-${Date.now()}`, childId, kind: 'absent', label: on ? 'Marked absent for the day' : 'Bus service resumed', at: new Date().toISOString() },
        ...state.exceptionLogs,
      ],
    })),

  confirmWaitingAtStop: (childId) =>
    set((state) => ({
      children: state.children.map((child) =>
        child.id === childId ? { ...child, waitingAtStop: true } : child,
      ),
    })),

  setSelfDropOff: (childId, on) =>
    set((state) => ({
      children: state.children.map((child) =>
        child.id === childId ? { ...child, selfDropOff: on, absentToday: on ? false : child.absentToday } : child,
      ),
      exceptionLogs: [
        { id: `ex-${Date.now()}`, childId, kind: 'selfDropOff', label: on ? 'Morning bus skipped' : 'Morning bus resumed', at: new Date().toISOString() },
        ...state.exceptionLogs,
      ],
    })),

  setEarlyPickup: (childId, on) =>
    set((state) => ({
      children: state.children.map((child) =>
        child.id === childId ? { ...child, earlyPickup: on } : child,
      ),
      exceptionLogs: [
        { id: `ex-${Date.now()}`, childId, kind: 'earlyPickup', label: on ? 'Early pick-up' : 'Afternoon bus resumed', at: new Date().toISOString() },
        ...state.exceptionLogs,
      ],
    })),

  setArrivalReminder: (childId, on) =>
    set((state) => ({
      children: state.children.map((child) =>
        child.id === childId ? { ...child, arrivalReminder: on } : child,
      ),
      exceptionLogs: [
        { id: `ex-${Date.now()}`, childId, kind: 'reminder', label: on ? 'Arrival reminder turned on' : 'Arrival reminder turned off', at: new Date().toISOString() },
        ...state.exceptionLogs,
      ],
    })),

  requestStopChange: ({ lat, lng, flat, area, landmark, reason }) =>
    set((state) => {
      const child = state.children.find((item) => item.id === state.activeChildId);
      const next = `${flat}, ${area}${landmark ? ` · ${landmark}` : ''} (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
      return {
        pendingRequests: pushRequest(state, {
          kind: 'Boarding point',
          audience: 'Gateman',
          currentValue: child?.boardingPoint.name ?? '—',
          nextValue: next,
          detail: next,
          reason,
        }),
      };
    }),

  requestContactUpdate: ({ channel, nextValue, reason }) =>
    set((state) => {
      const child = state.children.find((item) => item.id === state.activeChildId);
      const current = channel === 'phone' ? child?.parentPhone || 'No number' : child?.parentEmail || 'No email';
      return {
        pendingRequests: pushRequest(state, {
          kind: 'Contact number',
          audience: 'School Admin',
          currentValue: current,
          nextValue,
          detail: nextValue,
          reason,
        }),
      };
    }),

  withdrawRequest: (id) =>
    set((state) => ({
      pendingRequests: state.pendingRequests.filter((item) => item.id !== id),
    })),

  conductorPings: [
    { id: 'cp-1', conductorName: 'Ranjit Singh', busNumber: 'Bus 7', studentName: 'Arjun', message: 'Is Arjun coming to school today?', sentAt: new Date().toISOString(), replied: false, reply: null, replyNote: null },
  ],
  gatemanHomePings: [
    { id: 'gh-1', gatemanName: 'Ramesh Kumar', studentName: 'Arjun', message: 'Please confirm Arjun has arrived home safely after an off-route drop.', sentAt: new Date().toISOString(), replied: false, confirmed: null },
  ],

  markNoticesRead: (channel) =>
    set((state) => ({
      notices: state.notices.map((notice) => (notice.channel === channel ? { ...notice, read: true } : notice)),
    })),

  replyToConductorPing: (pingId, reply, note) => {
    set((state) => ({
      conductorPings: state.conductorPings.map((item) => item.id === pingId ? { ...item, replied: true, reply, replyNote: note ?? null } : item),
    }));
    if (pingId.startsWith('ping-')) {
      const conductor = require('@/store/conductor.store') as typeof import('@/store/conductor.store');
      conductor.useConductorStore.getState().receiveParentPingReply(pingId.slice('ping-'.length), reply, note);
    }
  },

  replyToGatemanHomePing: (pingId, confirmed) =>
    set((state) => ({
      gatemanHomePings: state.gatemanHomePings.map((item) => item.id === pingId ? { ...item, replied: true, confirmed } : item),
    })),
}));

export function useActiveChild(): ParentChild | undefined {
  const children = useParentStore((state) => state.children);
  const activeChildId = useParentStore((state) => state.activeChildId);
  return children.find((child) => child.id === activeChildId);
}
