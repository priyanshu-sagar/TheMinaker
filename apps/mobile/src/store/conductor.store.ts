import { create } from 'zustand';

export type StopStatus = 'Upcoming' | 'Current' | 'Completed' | 'Skipped';
export type RouteStop = {
  id: string;
  name: string;
  order: number;
  eta: string;
  status: StopStatus;
  studentCount: number;
  boardedCount: number;
  droppedCount: number;
  coordinates: { lat: number; lng: number };
  geofenceRadiusMeters: number;
};
export type ManifestStudent = {
  id: string;
  name: string;
  rollNumber: string;
  stopId: string;
  stopName: string;
  parentName: string;
  parentPhone: string;
  boardingStatus: 'Waiting' | 'Approaching' | 'Boarded' | 'Dropped' | 'Absent' | 'Pinged';
  lastUpdated: string | null;
  distanceMeters: number;
  grade: string;
  orderIndex: number;
  scheduledTime: string;
  stopAddress: string;
  specialNote?: string;
};
export type BusChangeRequest = {
  id: string;
  fromBusId: string;
  fromBusNumber: string;
  toBusId: string;
  toBusNumber: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'AutoRejected';
  requestedAt: string;
  expiresAt?: string;
  resolvedAt: string | null;
  gatemanNote: string | null;
  acknowledged?: boolean;
};
export type PingRecord = {
  id: string;
  studentId: string;
  studentName: string;
  stopName: string;
  parentPhone: string;
  pingType: 'IsComingQuery' | 'NotAtStop' | 'OffLocationVerify';
  conductorMessage: string;
  parentReply: 'Coming' | 'NotComing' | 'AlreadyHome' | 'Other' | null;
  parentReplyNote: string | null;
  status: 'Pending' | 'Replied' | 'Escalated';
  sentAt: string;
  repliedAt: string | null;
};
export type OffLocationFlag = {
  id: string;
  studentId: string;
  studentName: string;
  stopId: string;
  stopName: string;
  conductorCoordinates: { lat: number; lng: number };
  stopCoordinates: { lat: number; lng: number };
  distanceMeters: number;
  status: 'Flagged' | 'GatemanVerifying' | 'ParentConfirming' | 'Verified' | 'Rejected';
  flaggedAt: string;
  verifiedAt: string | null;
  gatemanNote: string | null;
  parentConfirmed: boolean;
};
export type ConductorShiftLog = {
  id: string;
  action: string;
  studentName?: string;
  stopName?: string;
  timestamp: string;
  note?: string;
};
export type ConductorBus = {
  id: string;
  busNumber: string;
  routeName: string;
  routeId: string;
  conductorName: string;
  totalStops: number;
  totalStudents: number;
  currentStopIndex: number;
  status: 'PreShift' | 'OnRoute' | 'Returning' | 'Completed';
};
export type ConductorNotification = {
  id: string;
  category: 'Parent' | 'Gateman' | 'Admin' | 'System';
  title: string;
  body: string;
  isRead: boolean;
  actionable: boolean;
  actionType?: 'PingReply' | 'OffLocationVerified' | 'BusChangeApproved' | 'BusChangeRejected' | 'AdminBroadcast';
  refId?: string;
  timestamp: string;
};
export type ConductorBroadcast = {
  id: string;
  from: 'Admin' | 'Gateman';
  title: string;
  body: string;
  sentAt: string;
  isRead: boolean;
};

let seq = 0;
export function generateUniqueId(prefix: string) {
  seq += 1;
  return `${prefix}-${Date.now()}-${seq}-${Math.random().toString(36).slice(2, 7)}`;
}

const FIRST = ['Rohan', 'Priya', 'Arjun', 'Anaya', 'Kabir', 'Meher', 'Dev', 'Saanvi', 'Ishaan', 'Kiara'];
const LAST = ['Gupta', 'Mehta', 'Sharma', 'Nair', 'Singh', 'Kapoor', 'Iyer', 'Das'];
const STOPS: Array<Omit<RouteStop, 'boardedCount' | 'droppedCount'>> = [
  { id: 'stop-1', name: 'Sector 12', order: 1, eta: '06:30 AM', status: 'Completed', studentCount: 5, coordinates: { lat: 28.592, lng: 77.047 }, geofenceRadiusMeters: 600 },
  { id: 'stop-2', name: 'Sector 14', order: 2, eta: '06:45 AM', status: 'Completed', studentCount: 5, coordinates: { lat: 28.586, lng: 77.058 }, geofenceRadiusMeters: 600 },
  { id: 'stop-3', name: 'Sector 15 Gate', order: 3, eta: '07:00 AM', status: 'Completed', studentCount: 5, coordinates: { lat: 28.578, lng: 77.066 }, geofenceRadiusMeters: 600 },
  { id: 'stop-4', name: 'Sector 17', order: 4, eta: '07:15 AM', status: 'Current', studentCount: 6, coordinates: { lat: 28.569, lng: 77.074 }, geofenceRadiusMeters: 600 },
  { id: 'stop-5', name: 'DLF Phase 2', order: 5, eta: '07:30 AM', status: 'Upcoming', studentCount: 5, coordinates: { lat: 28.492, lng: 77.088 }, geofenceRadiusMeters: 600 },
  { id: 'stop-6', name: 'Sector 21', order: 6, eta: '07:45 AM', status: 'Upcoming', studentCount: 5, coordinates: { lat: 28.512, lng: 77.072 }, geofenceRadiusMeters: 600 },
  { id: 'stop-7', name: 'Sector 23', order: 7, eta: '08:00 AM', status: 'Upcoming', studentCount: 5, coordinates: { lat: 28.505, lng: 77.061 }, geofenceRadiusMeters: 600 },
  { id: 'stop-8', name: 'School (Final)', order: 8, eta: '08:15 AM', status: 'Upcoming', studentCount: 4, coordinates: { lat: 28.548, lng: 77.122 }, geofenceRadiusMeters: 600 },
];

function clock(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

function buildStudents(): ManifestStudent[] {
  return Array.from({ length: 52 }, (_, index) => {
    const order = index + 1;
    const status = order <= 15 ? 'Boarded' : order === 16 ? 'Approaching' : 'Waiting';
    const far = order === 18 || order === 22;
    return {
      id: `stu-${order}`,
      name: `${FIRST[index % FIRST.length]} ${LAST[index % LAST.length]}`,
      rollNumber: String(200 + order),
      stopId: `stop-${order}`,
      stopName: `Stop ${order}`,
      parentName: `${FIRST[(index + 3) % FIRST.length]} ${LAST[(index + 1) % LAST.length]}`,
      parentPhone: `+9198100${String(10000 + order).slice(0, 5)}`,
      boardingStatus: status as ManifestStudent['boardingStatus'],
      lastUpdated: status === 'Boarded' ? new Date(Date.now() - (52 - order) * 60000).toISOString() : null,
      distanceMeters: far ? (order === 18 ? 720 : 810) : 140,
      grade: `${1 + (index % 10)}-${['A', 'B', 'C'][index % 3]}`,
      orderIndex: order,
      scheduledTime: clock(6 * 60 + 32 + order * 2),
      stopAddress: `Lane ${order}, en route to school`,
      specialNote: order === 4 ? 'Carries an inhaler' : undefined,
    };
  });
}

const STUDENTS = buildStudents();
const ROUTE_STOPS: RouteStop[] = STOPS.map((stop) => ({
  ...stop,
  boardedCount: STUDENTS.filter((student) => student.stopId === stop.id && student.boardingStatus === 'Boarded').length,
  droppedCount: 0,
}));

function log(action: string, extra?: Partial<ConductorShiftLog>): ConductorShiftLog {
  return { id: generateUniqueId('csl'), action, timestamp: new Date().toISOString(), ...extra };
}

type ConductorState = {
  assignedBus: ConductorBus;
  routeStops: RouteStop[];
  studentManifest: ManifestStudent[];
  busChangeRequests: BusChangeRequest[];
  pingRecords: PingRecord[];
  offLocationFlags: OffLocationFlag[];
  shiftLogs: ConductorShiftLog[];
  notifications: ConductorNotification[];
  broadcasts: ConductorBroadcast[];
  soundAlertsEnabled: boolean;
  vibrationEnabled: boolean;
  routeChangeModeActive: boolean;
  detourNote: string | null;
  tripLive: boolean;
  tripLeg: 'Morning pickup' | 'Afternoon drop';
  assignmentSource: 'Default route' | 'Swapped by gateman';
  pendingSwap: { toBusNumber: string; routeName: string; gatemanName: string } | null;
  shiftStarted: boolean;
  shiftEnded: boolean;
  startShift: () => void;
  endShift: () => void;
  markBoarded: (studentId: string) => void;
  markAbsent: (studentId: string) => void;
  markDropped: (studentId: string) => void;
  pingParent: (studentId: string, message: string) => void;
  escalatePing: (id: string) => void;
  submitBusChangeRequest: (toBusId: string, toBusNumber: string, reason: string) => void;
  flagOffLocation: (studentId: string, conductorCoords: { lat: number; lng: number }) => void;
  advanceToNextStop: () => void;
  toggleRouteChangeMode: () => void;
  submitDetour: (note: string) => void;
  clearDetour: () => void;
  setTripLive: (on: boolean) => void;
  setTripLeg: (leg: 'Morning pickup' | 'Afternoon drop') => void;
  toggleSoundAlerts: () => void;
  toggleVibration: () => void;
  toggleAlerts: () => void;
  receiveParentPingReply: (pingId: string, reply: PingRecord['parentReply'], note?: string) => void;
  offerSwap: (toBusNumber: string, routeName: string, gatemanName: string) => void;
  acceptPendingSwap: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  markBroadcastRead: (id: string) => void;
  receiveGatemanVerification: (flagId: string, note: string) => void;
  receiveBusChangeDecision: (requestId: string, approved: boolean, note?: string) => void;
  acknowledgeBusChange: (id: string) => void;
  expireStaleBusRequests: () => void;
  fleetBuses: Array<{ id: string; busNumber: string; routeName: string; status: 'At School' | 'En Route' | 'Standby' | 'Maintenance'; conductorName: string | null; rosterCount: number; comingToday: number }>;
  setRouteOrder: (orderedIds: string[]) => void;
};

export const useConductorStore = create<ConductorState>((set, get) => ({
  assignedBus: {
    id: 'b-c1',
    busNumber: 'Bus 7',
    routeName: 'Route A: Sector 12 → School',
    routeId: 'route-a',
    conductorName: 'Ranjit Singh',
    totalStops: 52,
    totalStudents: 52,
    currentStopIndex: 16,
    status: 'OnRoute',
  },
  routeStops: ROUTE_STOPS,
  studentManifest: STUDENTS,
  busChangeRequests: [
    { id: 'bcr-1', fromBusId: 'b-c1', fromBusNumber: 'Bus 7', toBusId: 'b-12', toBusNumber: 'Bus 12', reason: 'Bus 12 is closer to my home route', status: 'AutoRejected', requestedAt: new Date(Date.now() - 20 * 60000).toISOString(), expiresAt: new Date(Date.now() - 18 * 60000).toISOString(), resolvedAt: new Date(Date.now() - 18 * 60000).toISOString(), gatemanNote: 'No gateman response within 2 minutes', acknowledged: false },
    { id: 'bcr-2', fromBusId: 'b-c1', fromBusNumber: 'Bus 7', toBusId: 'b-9', toBusNumber: 'Bus 9', reason: 'Route overlap', status: 'Rejected', requestedAt: new Date(Date.now() - 2 * 3600000).toISOString(), resolvedAt: new Date(Date.now() - 90 * 60000).toISOString(), gatemanNote: 'Bus 9 is already at capacity', acknowledged: true },
  ],
  pingRecords: [
    { id: 'ping-1', studentId: STUDENTS[15]!.id, studentName: STUDENTS[15]!.name, stopName: 'Sector 17', parentPhone: STUDENTS[15]!.parentPhone, pingType: 'IsComingQuery', conductorMessage: 'Is your child coming today?', parentReply: 'Coming', parentReplyNote: 'At the gate in 5 minutes', status: 'Replied', sentAt: new Date(Date.now() - 18 * 60000).toISOString(), repliedAt: new Date(Date.now() - 12 * 60000).toISOString() },
    { id: 'ping-2', studentId: STUDENTS[16]!.id, studentName: STUDENTS[16]!.name, stopName: 'Sector 17', parentPhone: STUDENTS[16]!.parentPhone, pingType: 'NotAtStop', conductorMessage: 'Child not at stop', parentReply: null, parentReplyNote: null, status: 'Pending', sentAt: new Date(Date.now() - 8 * 60000).toISOString(), repliedAt: null },
    { id: 'ping-3', studentId: STUDENTS[10]!.id, studentName: STUDENTS[10]!.name, stopName: STUDENTS[10]!.stopAddress, parentPhone: STUDENTS[10]!.parentPhone, pingType: 'OffLocationVerify', conductorMessage: 'Please confirm pickup', parentReply: null, parentReplyNote: null, status: 'Escalated', sentAt: new Date(Date.now() - 40 * 60000).toISOString(), repliedAt: null },
    { id: 'ping-4', studentId: STUDENTS[20]!.id, studentName: STUDENTS[20]!.name, stopName: STUDENTS[20]!.stopAddress, parentPhone: STUDENTS[20]!.parentPhone, pingType: 'IsComingQuery', conductorMessage: 'Bus arriving in 2 mins', parentReply: 'AlreadyHome', parentReplyNote: 'Collected by family', status: 'Replied', sentAt: new Date(Date.now() - 3 * 3600000).toISOString(), repliedAt: new Date(Date.now() - 2 * 3600000).toISOString() },
    { id: 'ping-5', studentId: STUDENTS[21]!.id, studentName: STUDENTS[21]!.name, stopName: STUDENTS[21]!.stopAddress, parentPhone: STUDENTS[21]!.parentPhone, pingType: 'NotAtStop', conductorMessage: 'Child not at the stop', parentReply: null, parentReplyNote: null, status: 'Pending', sentAt: new Date(Date.now() - 6 * 60000).toISOString(), repliedAt: null },
    { id: 'ping-6', studentId: STUDENTS[22]!.id, studentName: STUDENTS[22]!.name, stopName: STUDENTS[22]!.stopAddress, parentPhone: STUDENTS[22]!.parentPhone, pingType: 'OffLocationVerify', conductorMessage: 'Confirm the afternoon drop', parentReply: null, parentReplyNote: null, status: 'Escalated', sentAt: new Date(Date.now() - 55 * 60000).toISOString(), repliedAt: null },
  ],
  offLocationFlags: [
    { id: 'olf-1', studentId: STUDENTS[6]!.id, studentName: STUDENTS[6]!.name, stopId: 'stop-2', stopName: 'Sector 14', conductorCoordinates: { lat: 28.59, lng: 77.06 }, stopCoordinates: STOPS[1]!.coordinates, distanceMeters: 720, status: 'Verified', flaggedAt: new Date(Date.now() - 50 * 60000).toISOString(), verifiedAt: new Date(Date.now() - 40 * 60000).toISOString(), gatemanNote: 'Parent confirmed the child boarded one stop early', parentConfirmed: true },
    { id: 'olf-2', studentId: STUDENTS[15]!.id, studentName: STUDENTS[15]!.name, stopId: STUDENTS[15]!.stopId, stopName: STUDENTS[15]!.stopAddress, conductorCoordinates: { lat: 28.572, lng: 77.077 }, stopCoordinates: { lat: 28.569, lng: 77.074 }, distanceMeters: 340, status: 'GatemanVerifying', flaggedAt: new Date(Date.now() - 9 * 60000).toISOString(), verifiedAt: null, gatemanNote: null, parentConfirmed: false },
    { id: 'olf-3', studentId: STUDENTS[17]!.id, studentName: STUDENTS[17]!.name, stopId: STUDENTS[17]!.stopId, stopName: STUDENTS[17]!.stopAddress, conductorCoordinates: { lat: 28.58, lng: 77.08 }, stopCoordinates: { lat: 28.56, lng: 77.07 }, distanceMeters: 720, status: 'Flagged', flaggedAt: new Date(Date.now() - 4 * 60000).toISOString(), verifiedAt: null, gatemanNote: null, parentConfirmed: false },
  ],
  shiftLogs: Array.from({ length: 25 }, (_, index) => {
    const student = STUDENTS[index % STUDENTS.length]!;
    const kind = index % 4;
    const action = kind === 0 ? `Marked ${student.name} as boarded` : kind === 1 ? `Marked ${student.name} as dropped` : kind === 2 ? `Detour noted near stop ${student.orderIndex}` : `Flagged ${student.name} off location`;
    return log(action, { studentName: student.name, stopName: student.stopAddress, timestamp: new Date(Date.now() - index * 26 * 60 * 60 * 1000).toISOString() });
  }),
  notifications: [
    { id: 'cn-1', category: 'Parent', title: 'Parent replied', body: 'Coming — at the gate in 5 minutes', isRead: false, actionable: true, actionType: 'PingReply', refId: 'ping-1', timestamp: new Date(Date.now() - 12 * 60000).toISOString() },
    { id: 'cn-2', category: 'Gateman', title: 'Off-location under review', body: 'Priya Mehta at Sector 17 is with the gateman', isRead: false, actionable: true, actionType: 'OffLocationVerified', refId: 'olf-2', timestamp: new Date(Date.now() - 9 * 60000).toISOString() },
    { id: 'cn-3', category: 'Admin', title: 'Route diversion', body: 'Route A will use NH-48 from tomorrow', isRead: false, actionable: true, actionType: 'AdminBroadcast', timestamp: new Date(Date.now() - 2 * 3600000).toISOString() },
    { id: 'cn-4', category: 'System', title: 'Shift is live', body: 'Bus 7 is on Route A', isRead: true, actionable: false, timestamp: new Date(Date.now() - 3 * 3600000).toISOString() },
    { id: 'cn-5', category: 'Gateman', title: 'Bus change rejected', body: 'Bus 9 is at capacity', isRead: true, actionable: true, actionType: 'BusChangeRejected', refId: 'bcr-2', timestamp: new Date(Date.now() - 90 * 60000).toISOString() },
    { id: 'cn-6', category: 'Parent', title: 'Waiting on a reply', body: 'Ping is still open for the current stop', isRead: false, actionable: false, timestamp: new Date(Date.now() - 8 * 60000).toISOString() },
    { id: 'cn-7', category: 'Admin', title: 'Early close', body: 'School closes at 1 PM today', isRead: true, actionable: false, timestamp: new Date(Date.now() - 3 * 3600000).toISOString() },
    { id: 'cn-8', category: 'System', title: 'Geofence ready', body: 'Each stop allows 600 metres', isRead: true, actionable: false, timestamp: new Date(Date.now() - 4 * 3600000).toISOString() },
  ],
  broadcasts: [
    { id: 'br-1', from: 'Admin', title: 'Route diversion', body: 'Route A will be diverted via NH-48 from tomorrow', sentAt: new Date(Date.now() - 2 * 3600000).toISOString(), isRead: false },
    { id: 'br-2', from: 'Gateman', title: 'Use Gate B', body: 'Gate B is now open. Proceed to Gate B for student drop.', sentAt: new Date(Date.now() - 45 * 60000).toISOString(), isRead: false },
    { id: 'br-3', from: 'Admin', title: 'Early close', body: 'School closes at 1 PM today. Adjust the afternoon route.', sentAt: new Date(Date.now() - 3 * 3600000).toISOString(), isRead: true },
    { id: 'br-4', from: 'Gateman', title: 'Confirm a student', body: 'Bus 7 please confirm Arjun Sharma is on board.', sentAt: new Date(Date.now() - 20 * 60000).toISOString(), isRead: false },
    { id: 'br-5', from: 'Admin', title: 'New student', body: 'Divya added to Route A at Sector 21.', sentAt: new Date(Date.now() - 26 * 3600000).toISOString(), isRead: true },
  ],
  soundAlertsEnabled: true,
  vibrationEnabled: true,
  routeChangeModeActive: false,
  detourNote: null,
  tripLive: false,
  tripLeg: 'Morning pickup',
  assignmentSource: 'Default route',
  pendingSwap: null,
  fleetBuses: [
    { id: 'fb-1', busNumber: 'Bus 1', routeName: 'Route G', status: 'Standby', conductorName: null, rosterCount: 40, comingToday: 36 },
    { id: 'fb-3', busNumber: 'Bus 3', routeName: 'Route B', status: 'En Route', conductorName: 'Vikram Singh', rosterCount: 48, comingToday: 44 },
    { id: 'fb-4', busNumber: 'Bus 4', routeName: 'Route C', status: 'Maintenance', conductorName: null, rosterCount: 36, comingToday: 0 },
    { id: 'fb-7', busNumber: 'Bus 7', routeName: 'Route A', status: 'En Route', conductorName: 'Ranjit Singh', rosterCount: 52, comingToday: 52 },
    { id: 'fb-8', busNumber: 'Bus 8', routeName: 'Route E', status: 'At School', conductorName: 'Manoj Tiwari', rosterCount: 44, comingToday: 40 },
    { id: 'fb-12', busNumber: 'Bus 12', routeName: 'Route D', status: 'At School', conductorName: 'Suresh Kumar', rosterCount: 54, comingToday: 48 },
    { id: 'fb-15', busNumber: 'Bus 15', routeName: 'Route H', status: 'At School', conductorName: 'Arvind Mehta', rosterCount: 42, comingToday: 39 },
    { id: 'fb-19', busNumber: 'Bus 19', routeName: 'Route F', status: 'Standby', conductorName: null, rosterCount: 30, comingToday: 30 },
  ],
  shiftStarted: true,
  shiftEnded: false,

  startShift: () => set((state) => ({ shiftStarted: true, shiftEnded: false, shiftLogs: [log('Shift started'), ...state.shiftLogs] })),
  endShift: () => set((state) => ({ shiftEnded: true, assignedBus: { ...state.assignedBus, status: 'Completed' }, shiftLogs: [log('Shift ended'), ...state.shiftLogs] })),

  markBoarded: (studentId) => {
    const student = get().studentManifest.find((item) => item.id === studentId);
    if (!student || student.boardingStatus === 'Boarded') return;
    const now = new Date().toISOString();
    set((state) => {
      const next = state.studentManifest
        .filter((item) => item.orderIndex > student.orderIndex && item.boardingStatus === 'Waiting')
        .sort((a, b) => a.orderIndex - b.orderIndex)[0];
      return {
        studentManifest: state.studentManifest.map((item) => {
          if (item.id === studentId) return { ...item, boardingStatus: 'Boarded', lastUpdated: now };
          if (next && item.id === next.id && item.boardingStatus !== 'Approaching') return { ...item, boardingStatus: 'Approaching' };
          if (item.boardingStatus === 'Approaching' && item.id !== studentId) return { ...item, boardingStatus: 'Waiting' };
          return item;
        }),
        assignedBus: { ...state.assignedBus, currentStopIndex: student.orderIndex },
        shiftLogs: [log(`Marked ${student.name} as boarded`, { studentName: student.name, stopName: student.stopAddress, timestamp: now }), ...state.shiftLogs],
      };
    });
  },

  markAbsent: (studentId) => {
    const student = get().studentManifest.find((item) => item.id === studentId);
    if (!student) return;
    const now = new Date().toISOString();
    set((state) => {
      const next = student.boardingStatus === 'Approaching'
        ? state.studentManifest.filter((item) => item.orderIndex > student.orderIndex && item.boardingStatus === 'Waiting').sort((a, b) => a.orderIndex - b.orderIndex)[0]
        : undefined;
      return {
        studentManifest: state.studentManifest.map((item) => {
          if (item.id === studentId) return { ...item, boardingStatus: 'Absent', lastUpdated: now };
          if (next && item.id === next.id) return { ...item, boardingStatus: 'Approaching' };
          return item;
        }),
        assignedBus: student.boardingStatus === 'Approaching' ? { ...state.assignedBus, currentStopIndex: next?.orderIndex ?? student.orderIndex } : state.assignedBus,
        shiftLogs: [log(`Marked ${student.name} as absent`, { studentName: student.name, stopName: student.stopAddress, timestamp: now }), ...state.shiftLogs],
      };
    });
  },

  markDropped: (studentId) => {
    const student = get().studentManifest.find((item) => item.id === studentId);
    if (!student) return;
    const now = new Date().toISOString();
    set((state) => ({
      studentManifest: state.studentManifest.map((item) => item.id === studentId ? { ...item, boardingStatus: 'Dropped', lastUpdated: now } : item),
      routeStops: state.routeStops.map((stop) => stop.id === student.stopId ? { ...stop, droppedCount: stop.droppedCount + 1 } : stop),
      shiftLogs: [log(`Marked ${student.name} as dropped`, { studentName: student.name, stopName: student.stopName }), ...state.shiftLogs],
    }));
  },

  escalatePing: (id) => {
    const ping = get().pingRecords.find((item) => item.id === id);
    if (!ping || ping.status !== 'Pending') return;
    const now = new Date().toISOString();
    set((state) => ({
      pingRecords: state.pingRecords.map((item) => item.id === id ? { ...item, status: 'Escalated' } : item),
      notifications: [{ id: generateUniqueId('cn'), category: 'Gateman', title: 'Ping escalated', body: `${ping.studentName} has not replied. The gateman has this ping.`, isRead: false, actionable: false, timestamp: now }, ...state.notifications],
      shiftLogs: [log(`Escalated ping for ${ping.studentName}`, { studentName: ping.studentName, stopName: ping.stopName }), ...state.shiftLogs],
    }));
  },

  pingParent: (studentId, message) => {
    const student = get().studentManifest.find((item) => item.id === studentId);
    if (!student) return;
    const now = new Date().toISOString();
    const ping: PingRecord = { id: generateUniqueId('ping'), studentId, studentName: student.name, stopName: student.stopName, parentPhone: student.parentPhone, pingType: 'IsComingQuery', conductorMessage: message, parentReply: null, parentReplyNote: null, status: 'Pending', sentAt: now, repliedAt: null };
    set((state) => ({
      pingRecords: [ping, ...state.pingRecords],
      studentManifest: state.studentManifest.map((item) => item.id === studentId ? { ...item, boardingStatus: 'Pinged', lastUpdated: now } : item),
      notifications: [{ id: generateUniqueId('cn'), category: 'System', title: 'Parent pinged', body: `Ping sent for ${student.name}`, isRead: false, actionable: false, timestamp: now }, ...state.notifications],
      shiftLogs: [log(`Pinged parent of ${student.name}`, { studentName: student.name, stopName: student.stopName, note: message }), ...state.shiftLogs],
    }));
    const parent = require('@/store/parent.store') as typeof import('@/store/parent.store');
    const bus = get().assignedBus;
    parent.useParentStore.setState((current) => ({
      conductorPings: [{ id: `ping-${ping.id}`, conductorName: bus.conductorName, busNumber: bus.busNumber, studentName: student.name, message, sentAt: now, replied: false, reply: null, replyNote: null }, ...current.conductorPings],
    }));
  },

  receiveParentPingReply: (pingId, reply, note) => {
    const now = new Date().toISOString();
    const ping = get().pingRecords.find((item) => item.id === pingId);
    if (!ping || ping.status === 'Replied') return;
    set((state) => ({
      pingRecords: state.pingRecords.map((item) => item.id === pingId ? { ...item, status: 'Replied', parentReply: reply, parentReplyNote: note ?? null, repliedAt: now } : item),
      notifications: [{ id: generateUniqueId('cn'), category: 'Parent', title: 'Parent replied', body: `${ping.studentName}: ${reply ?? 'Replied'}${note ? ` — ${note}` : ''}`, isRead: false, actionable: true, actionType: 'PingReply', refId: pingId, timestamp: now }, ...state.notifications],
      shiftLogs: [log(`Parent of ${ping.studentName} replied`, { studentName: ping.studentName, note: note ?? reply ?? undefined }), ...state.shiftLogs],
    }));
  },

  submitBusChangeRequest: (toBusId, toBusNumber, reason) => {
    const bus = get().assignedBus;
    const now = new Date().toISOString();
    const request: BusChangeRequest = { id: generateUniqueId('bcr'), fromBusId: bus.id, fromBusNumber: bus.busNumber, toBusId, toBusNumber, reason, status: 'Pending', requestedAt: now, expiresAt: new Date(Date.now() + 120000).toISOString(), resolvedAt: null, gatemanNote: null };
    set((state) => ({
      busChangeRequests: [request, ...state.busChangeRequests],
      notifications: [{ id: generateUniqueId('cn'), category: 'Gateman', title: 'Bus change sent', body: `${bus.busNumber} to ${toBusNumber} is waiting on the gateman`, isRead: false, actionable: true, actionType: 'BusChangeApproved', refId: request.id, timestamp: now }, ...state.notifications],
      shiftLogs: [log(`Bus change requested to ${toBusNumber}`, { note: reason }), ...state.shiftLogs],
    }));
    const gateman = require('@/store/gateman.store') as typeof import('@/store/gateman.store');
    gateman.useGatemanStore.getState().enqueueConductorBusRequest({
      id: request.id,
      conductorName: bus.conductorName,
      busNumber: bus.busNumber,
      fromBusId: bus.id,
      fromBusNumber: bus.busNumber,
      toBusId,
      toBusNumber,
      reason,
      status: 'Pending',
      requestedAt: now,
      resolvedAt: null,
    });
    setTimeout(() => {
      const current = get().busChangeRequests.find((item) => item.id === request.id);
      if (!current || current.status !== 'Pending') return;
      const expiredAt = new Date().toISOString();
      set((state) => ({
        busChangeRequests: state.busChangeRequests.map((item) => item.id === request.id ? { ...item, status: 'AutoRejected', resolvedAt: expiredAt, gatemanNote: 'No gateman response within 2 minutes' } : item),
        shiftLogs: [log(`Bus change to ${toBusNumber} auto-rejected`, { note: 'Gateman did not respond within 2 minutes', timestamp: expiredAt }), ...state.shiftLogs],
        notifications: [{ id: generateUniqueId('cn'), category: 'System', title: 'Bus change auto-rejected', body: `Your request to move to ${toBusNumber} was rejected automatically. The gateman did not respond within 2 minutes.`, isRead: false, actionable: false, timestamp: expiredAt }, ...state.notifications],
      }));
      const gateman = require('@/store/gateman.store') as typeof import('@/store/gateman.store');
      gateman.useGatemanStore.getState().dropConductorBusRequest(request.id);
    }, 120000);
  },

  flagOffLocation: (studentId, conductorCoords) => {
    const student = get().studentManifest.find((item) => item.id === studentId);
    if (!student) return;
    const now = new Date().toISOString();
    const flag: OffLocationFlag = { id: generateUniqueId('olf'), studentId, studentName: student.name, stopId: student.stopId, stopName: student.stopAddress, conductorCoordinates: conductorCoords, stopCoordinates: { lat: conductorCoords.lat - 0.004, lng: conductorCoords.lng - 0.004 }, distanceMeters: student.distanceMeters, status: 'Flagged', flaggedAt: now, verifiedAt: null, gatemanNote: null, parentConfirmed: false };
    set((state) => ({
      offLocationFlags: [flag, ...state.offLocationFlags],
      notifications: [{ id: generateUniqueId('cn'), category: 'Gateman', title: 'Off-location flagged', body: `${student.name} is ${student.distanceMeters}m from ${student.stopAddress}`, isRead: false, actionable: true, actionType: 'OffLocationVerified', refId: flag.id, timestamp: now }, ...state.notifications],
      shiftLogs: [log(`Flagged ${student.name} off location`, { studentName: student.name, stopName: student.stopAddress, note: `${student.distanceMeters}m` }), ...state.shiftLogs],
    }));
    const bus = get().assignedBus;
    const gateman = require('@/store/gateman.store') as typeof import('@/store/gateman.store');
    gateman.useGatemanStore.setState((current) => ({
      offLocationFlags: [{ id: flag.id, conductorName: bus.conductorName, busNumber: bus.busNumber, studentName: student.name, stopName: student.stopAddress, distanceMeters: student.distanceMeters, status: 'Pending' as const, flaggedAt: now, verifiedAt: null, gatemanNote: null }, ...current.offLocationFlags],
    }));
  },

  advanceToNextStop: () => set((state) => {
    const next = Math.min(state.assignedBus.currentStopIndex + 1, state.routeStops.length - 1);
    return {
      assignedBus: { ...state.assignedBus, currentStopIndex: next, status: next === state.routeStops.length - 1 ? 'Returning' : 'OnRoute' },
      routeStops: state.routeStops.map((stop, index) => ({ ...stop, status: index < next ? 'Completed' : index === next ? 'Current' : 'Upcoming' })),
      shiftLogs: [log(`Advanced to ${state.routeStops[next]?.name ?? 'the next stop'}`), ...state.shiftLogs],
    };
  }),

  toggleRouteChangeMode: () => set((state) => ({ routeChangeModeActive: !state.routeChangeModeActive, detourNote: state.routeChangeModeActive ? null : state.detourNote })),
  submitDetour: (note) => set((state) => ({ routeChangeModeActive: true, detourNote: note, shiftLogs: [log('Detour started', { note }), ...state.shiftLogs], notifications: [{ id: generateUniqueId('cn'), category: 'Gateman', title: 'Detour reported', body: note, isRead: false, actionable: false, timestamp: new Date().toISOString() }, ...state.notifications] })),
  clearDetour: () => set({ routeChangeModeActive: false, detourNote: null }),
  setTripLive: (on) => {
    if (!on && get().studentManifest.some((item) => item.boardingStatus === 'Boarded')) return;
    set((state) => ({
      tripLive: on,
      shiftStarted: on || state.shiftStarted,
      assignedBus: { ...state.assignedBus, status: on ? 'OnRoute' : 'PreShift' },
      shiftLogs: [log(on ? 'Trip went live. GPS broadcasting started.' : 'Trip paused. GPS broadcasting stopped.'), ...state.shiftLogs],
    }));
  },
  toggleAlerts: () => set((state) => {
    const next = !(state.soundAlertsEnabled && state.vibrationEnabled);
    return { soundAlertsEnabled: next, vibrationEnabled: next };
  }),
  setTripLeg: (leg) => set({ tripLeg: leg }),
  toggleSoundAlerts: () => set((state) => ({ soundAlertsEnabled: !state.soundAlertsEnabled })),
  toggleVibration: () => set((state) => ({ vibrationEnabled: !state.vibrationEnabled })),
  offerSwap: (toBusNumber, routeName, gatemanName) => set({ pendingSwap: { toBusNumber, routeName, gatemanName } }),
  acceptPendingSwap: () => set((state) => {
    if (!state.pendingSwap) return state;
    const nextBus = state.pendingSwap.toBusNumber;
    const fromBus = state.assignedBus.busNumber;
    return {
      assignedBus: { ...state.assignedBus, busNumber: nextBus, routeName: state.pendingSwap.routeName },
      assignmentSource: 'Swapped by gateman',
      pendingSwap: null,
      fleetBuses: state.fleetBuses.map((item) => {
        if (item.busNumber === fromBus) return { ...item, conductorName: null, status: 'At School' as const };
        if (item.busNumber === nextBus) return { ...item, conductorName: state.assignedBus.conductorName, status: 'En Route' as const };
        return item;
      }),
      busChangeRequests: state.busChangeRequests.map((item) => item.status === 'Approved' && item.toBusNumber === nextBus ? { ...item, acknowledged: true } : item),
      shiftLogs: [log(`Accepted swap to ${nextBus}`), ...state.shiftLogs],
      notifications: [{ id: generateUniqueId('cn'), category: 'Gateman', title: 'Bus change applied', body: `You are now on ${nextBus}.`, isRead: false, actionable: false, timestamp: new Date().toISOString() }, ...state.notifications],
    };
  }),
  markNotificationRead: (id) => set((state) => ({ notifications: state.notifications.map((item) => item.id === id ? { ...item, isRead: true } : item) })),
  markAllNotificationsRead: () => set((state) => ({ notifications: state.notifications.map((item) => ({ ...item, isRead: true })) })),
  markBroadcastRead: (id) => set((state) => ({ broadcasts: state.broadcasts.map((item) => item.id === id ? { ...item, isRead: true } : item) })),

  receiveGatemanVerification: (flagId, note) => {
    const now = new Date().toISOString();
    set((state) => ({
      offLocationFlags: state.offLocationFlags.map((item) => item.id === flagId ? { ...item, status: 'Verified', gatemanNote: note, verifiedAt: now, parentConfirmed: true } : item),
      notifications: [{ id: generateUniqueId('cn'), category: 'Gateman', title: 'Off-location verified', body: note, isRead: false, actionable: false, timestamp: now }, ...state.notifications],
    }));
  },

  setRouteOrder: (orderedIds) => set((state) => ({
    studentManifest: orderedIds.map((id, index) => {
      const student = state.studentManifest.find((item) => item.id === id);
      return student ? { ...student, orderIndex: index + 1 } : student;
    }).filter((item): item is ManifestStudent => Boolean(item)),
  })),

  receiveBusChangeDecision: (requestId, approved, note) => {
    const now = new Date().toISOString();
    const request = get().busChangeRequests.find((item) => item.id === requestId);
    const fleet = get().fleetBuses.find((item) => item.busNumber === request?.toBusNumber);
    set((state) => ({
      busChangeRequests: state.busChangeRequests.map((item) => item.id === requestId ? { ...item, status: approved ? 'Approved' : 'Rejected', resolvedAt: now, gatemanNote: note ?? null, acknowledged: false } : item),
      pendingSwap: approved && request ? { toBusNumber: request.toBusNumber, routeName: fleet?.routeName ?? request.toBusNumber, gatemanName: 'Gate desk' } : state.pendingSwap,
      notifications: [{ id: generateUniqueId('cn'), category: 'Gateman', title: approved ? 'Bus change approved' : 'Bus change rejected', body: note ?? (approved ? `The gateman approved ${request?.toBusNumber ?? 'the bus'}. Tap the banner to switch.` : 'The gateman rejected the bus change'), isRead: false, actionable: true, actionType: approved ? 'BusChangeApproved' : 'BusChangeRejected', refId: requestId, timestamp: now }, ...state.notifications],
      shiftLogs: [log(approved ? `Bus change to ${request?.toBusNumber ?? 'the new bus'} approved` : `Bus change to ${request?.toBusNumber ?? 'the new bus'} rejected`, { note }), ...state.shiftLogs],
    }));
  },
  acknowledgeBusChange: (id) => set((state) => ({ busChangeRequests: state.busChangeRequests.map((item) => item.id === id ? { ...item, acknowledged: true } : item) })),
  expireStaleBusRequests: () => {
    const nowMs = Date.now();
    const stale = get().busChangeRequests.filter((item) => {
      if (item.status !== 'Pending') return false;
      const expires = item.expiresAt ? new Date(item.expiresAt).getTime() : new Date(item.requestedAt).getTime() + 120000;
      return expires <= nowMs;
    });
    if (stale.length === 0) return;
    const expiredAt = new Date().toISOString();
    set((state) => ({
      busChangeRequests: state.busChangeRequests.map((item) => stale.some((row) => row.id === item.id) ? { ...item, status: 'AutoRejected', resolvedAt: expiredAt, gatemanNote: 'No gateman response within 2 minutes', acknowledged: false } : item),
      shiftLogs: [...stale.map((item) => log(`Bus change to ${item.toBusNumber} auto-rejected`, { note: 'Gateman did not respond within 2 minutes', timestamp: expiredAt })), ...state.shiftLogs],
      notifications: [...stale.map((item) => ({ id: generateUniqueId('cn'), category: 'System' as const, title: 'Bus change auto-rejected', body: `Your request to move to ${item.toBusNumber} was rejected automatically. The gateman did not respond within 2 minutes.`, isRead: false, actionable: false, timestamp: expiredAt })), ...state.notifications],
    }));
    const gateman = require('@/store/gateman.store') as typeof import('@/store/gateman.store');
    stale.forEach((item) => gateman.useGatemanStore.getState().dropConductorBusRequest(item.id));
  },
}));
