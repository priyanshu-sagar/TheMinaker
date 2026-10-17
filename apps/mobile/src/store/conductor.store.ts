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
  boardingStatus: 'Waiting' | 'Boarded' | 'Dropped' | 'Absent' | 'Pinged';
  lastUpdated: string | null;
  distanceMeters: number;
};
export type BusChangeRequest = {
  id: string;
  fromBusId: string;
  fromBusNumber: string;
  toBusId: string;
  toBusNumber: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: string;
  resolvedAt: string | null;
  gatemanNote: string | null;
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

function buildStudents(): ManifestStudent[] {
  const rows: ManifestStudent[] = [];
  let roll = 201;
  STOPS.forEach((stop, stopIndex) => {
    for (let index = 0; index < stop.studentCount; index += 1) {
      const far = stop.id === 'stop-4' && index < 2;
      const boarded = stopIndex < 3 ? index !== stop.studentCount - 1 : stopIndex === 3 ? index < 3 : false;
      rows.push({
        id: `stu-${stop.id}-${index}`,
        name: `${FIRST[(stopIndex + index) % FIRST.length]} ${LAST[(stopIndex * 2 + index) % LAST.length]}`,
        rollNumber: String(roll),
        stopId: stop.id,
        stopName: stop.name,
        parentName: `${FIRST[(index + 3) % FIRST.length]} ${LAST[(stopIndex + index) % LAST.length]}`,
        parentPhone: `+9198100${String(10000 + roll).slice(0, 5)}`,
        boardingStatus: boarded ? 'Boarded' : 'Waiting',
        lastUpdated: boarded ? new Date(Date.now() - (stopIndex + 1) * 600000).toISOString() : null,
        distanceMeters: far ? (index === 0 ? 720 : 800) : 180,
      });
      roll += 1;
    }
  });
  return rows;
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
  routeChangeModeActive: boolean;
  shiftStarted: boolean;
  shiftEnded: boolean;
  startShift: () => void;
  endShift: () => void;
  markBoarded: (studentId: string) => void;
  markAbsent: (studentId: string) => void;
  markDropped: (studentId: string) => void;
  pingParent: (studentId: string, message: string) => void;
  submitBusChangeRequest: (toBusId: string, toBusNumber: string, reason: string) => void;
  flagOffLocation: (studentId: string, conductorCoords: { lat: number; lng: number }) => void;
  advanceToNextStop: () => void;
  toggleRouteChangeMode: () => void;
  toggleSoundAlerts: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  markBroadcastRead: (id: string) => void;
  receiveGatemanVerification: (flagId: string, note: string) => void;
  receiveBusChangeDecision: (requestId: string, approved: boolean, note?: string) => void;
};

export const useConductorStore = create<ConductorState>((set, get) => ({
  assignedBus: {
    id: 'b-c1',
    busNumber: 'Bus 7',
    routeName: 'Route A: Sector 12 → School',
    routeId: 'route-a',
    conductorName: 'Ranjit Singh',
    totalStops: 8,
    totalStudents: 40,
    currentStopIndex: 3,
    status: 'OnRoute',
  },
  routeStops: ROUTE_STOPS,
  studentManifest: STUDENTS,
  busChangeRequests: [
    { id: 'bcr-1', fromBusId: 'b-c1', fromBusNumber: 'Bus 7', toBusId: 'b-12', toBusNumber: 'Bus 12', reason: 'Bus 12 is closer to my home route', status: 'Pending', requestedAt: new Date(Date.now() - 20 * 60000).toISOString(), resolvedAt: null, gatemanNote: null },
    { id: 'bcr-2', fromBusId: 'b-c1', fromBusNumber: 'Bus 7', toBusId: 'b-9', toBusNumber: 'Bus 9', reason: 'Route overlap', status: 'Rejected', requestedAt: new Date(Date.now() - 2 * 3600000).toISOString(), resolvedAt: new Date(Date.now() - 90 * 60000).toISOString(), gatemanNote: 'Bus 9 is already at capacity' },
  ],
  pingRecords: [
    { id: 'ping-1', studentId: STUDENTS[15]!.id, studentName: STUDENTS[15]!.name, stopName: 'Sector 17', parentPhone: STUDENTS[15]!.parentPhone, pingType: 'IsComingQuery', conductorMessage: 'Is your child coming today?', parentReply: 'Coming', parentReplyNote: 'At the gate in 5 minutes', status: 'Replied', sentAt: new Date(Date.now() - 18 * 60000).toISOString(), repliedAt: new Date(Date.now() - 12 * 60000).toISOString() },
    { id: 'ping-2', studentId: STUDENTS[16]!.id, studentName: STUDENTS[16]!.name, stopName: 'Sector 17', parentPhone: STUDENTS[16]!.parentPhone, pingType: 'NotAtStop', conductorMessage: 'Child not at stop', parentReply: null, parentReplyNote: null, status: 'Pending', sentAt: new Date(Date.now() - 8 * 60000).toISOString(), repliedAt: null },
    { id: 'ping-3', studentId: STUDENTS[10]!.id, studentName: STUDENTS[10]!.name, stopName: 'Sector 15 Gate', parentPhone: STUDENTS[10]!.parentPhone, pingType: 'OffLocationVerify', conductorMessage: 'Please confirm pickup', parentReply: null, parentReplyNote: null, status: 'Escalated', sentAt: new Date(Date.now() - 40 * 60000).toISOString(), repliedAt: null },
  ],
  offLocationFlags: [
    { id: 'olf-1', studentId: STUDENTS[6]!.id, studentName: STUDENTS[6]!.name, stopId: 'stop-2', stopName: 'Sector 14', conductorCoordinates: { lat: 28.59, lng: 77.06 }, stopCoordinates: STOPS[1]!.coordinates, distanceMeters: 720, status: 'Verified', flaggedAt: new Date(Date.now() - 50 * 60000).toISOString(), verifiedAt: new Date(Date.now() - 40 * 60000).toISOString(), gatemanNote: 'Parent confirmed the child boarded one stop early', parentConfirmed: true },
    { id: 'olf-2', studentId: STUDENTS[15]!.id, studentName: 'Priya Mehta', stopId: 'stop-4', stopName: 'Sector 17', conductorCoordinates: { lat: 28.572, lng: 77.077 }, stopCoordinates: STOPS[3]!.coordinates, distanceMeters: 340, status: 'GatemanVerifying', flaggedAt: new Date(Date.now() - 9 * 60000).toISOString(), verifiedAt: null, gatemanNote: null, parentConfirmed: false },
  ],
  shiftLogs: Array.from({ length: 12 }, (_, index) => log(
    index % 3 === 0 ? `Marked ${STUDENTS[index]!.name} as Boarded at ${STUDENTS[index]!.stopName}` : index % 3 === 1 ? `Bus change note ${index + 1}` : `Stop check ${index + 1}`,
    { studentName: STUDENTS[index]?.name, stopName: STUDENTS[index]?.stopName, timestamp: new Date(Date.now() - index * 8 * 60000).toISOString() },
  )),
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
  routeChangeModeActive: false,
  shiftStarted: true,
  shiftEnded: false,

  startShift: () => set((state) => ({ shiftStarted: true, shiftEnded: false, shiftLogs: [log('Shift started'), ...state.shiftLogs] })),
  endShift: () => set((state) => ({ shiftEnded: true, assignedBus: { ...state.assignedBus, status: 'Completed' }, shiftLogs: [log('Shift ended'), ...state.shiftLogs] })),

  markBoarded: (studentId) => {
    const student = get().studentManifest.find((item) => item.id === studentId);
    if (!student || student.boardingStatus === 'Boarded') return;
    const now = new Date().toISOString();
    set((state) => ({
      studentManifest: state.studentManifest.map((item) => item.id === studentId ? { ...item, boardingStatus: 'Boarded', lastUpdated: now } : item),
      routeStops: state.routeStops.map((stop) => stop.id === student.stopId ? { ...stop, boardedCount: stop.boardedCount + (student.boardingStatus === 'Boarded' ? 0 : 1) } : stop),
      shiftLogs: [log(`Marked ${student.name} as boarded`, { studentName: student.name, stopName: student.stopName }), ...state.shiftLogs],
    }));
  },

  markAbsent: (studentId) => {
    const student = get().studentManifest.find((item) => item.id === studentId);
    if (!student) return;
    const now = new Date().toISOString();
    set((state) => ({
      studentManifest: state.studentManifest.map((item) => item.id === studentId ? { ...item, boardingStatus: 'Absent', lastUpdated: now } : item),
      routeStops: state.routeStops.map((stop) => stop.id === student.stopId && student.boardingStatus === 'Boarded' ? { ...stop, boardedCount: Math.max(0, stop.boardedCount - 1) } : stop),
      shiftLogs: [log(`Marked ${student.name} as absent`, { studentName: student.name, stopName: student.stopName }), ...state.shiftLogs],
    }));
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
  },

  submitBusChangeRequest: (toBusId, toBusNumber, reason) => {
    const bus = get().assignedBus;
    const now = new Date().toISOString();
    const request: BusChangeRequest = { id: generateUniqueId('bcr'), fromBusId: bus.id, fromBusNumber: bus.busNumber, toBusId, toBusNumber, reason, status: 'Pending', requestedAt: now, resolvedAt: null, gatemanNote: null };
    set((state) => ({
      busChangeRequests: [request, ...state.busChangeRequests],
      notifications: [{ id: generateUniqueId('cn'), category: 'Gateman', title: 'Bus change sent', body: `${bus.busNumber} to ${toBusNumber} is waiting on the gateman`, isRead: false, actionable: true, actionType: 'BusChangeApproved', refId: request.id, timestamp: now }, ...state.notifications],
      shiftLogs: [log(`Bus change requested to ${toBusNumber}`, { note: reason }), ...state.shiftLogs],
    }));
  },

  flagOffLocation: (studentId, conductorCoords) => {
    const student = get().studentManifest.find((item) => item.id === studentId);
    const stop = get().routeStops.find((item) => item.id === student?.stopId);
    if (!student || !stop) return;
    const now = new Date().toISOString();
    const flag: OffLocationFlag = { id: generateUniqueId('olf'), studentId, studentName: student.name, stopId: stop.id, stopName: stop.name, conductorCoordinates: conductorCoords, stopCoordinates: stop.coordinates, distanceMeters: student.distanceMeters, status: 'Flagged', flaggedAt: now, verifiedAt: null, gatemanNote: null, parentConfirmed: false };
    set((state) => ({
      offLocationFlags: [flag, ...state.offLocationFlags],
      notifications: [{ id: generateUniqueId('cn'), category: 'Gateman', title: 'Off-location flagged', body: `${student.name} is ${student.distanceMeters}m from ${stop.name}`, isRead: false, actionable: true, actionType: 'OffLocationVerified', refId: flag.id, timestamp: now }, ...state.notifications],
      shiftLogs: [log(`Flagged ${student.name} off location`, { studentName: student.name, stopName: stop.name, note: `${student.distanceMeters}m` }), ...state.shiftLogs],
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

  toggleRouteChangeMode: () => set((state) => ({ routeChangeModeActive: !state.routeChangeModeActive })),
  toggleSoundAlerts: () => set((state) => ({ soundAlertsEnabled: !state.soundAlertsEnabled })),
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

  receiveBusChangeDecision: (requestId, approved, note) => {
    const now = new Date().toISOString();
    set((state) => ({
      busChangeRequests: state.busChangeRequests.map((item) => item.id === requestId ? { ...item, status: approved ? 'Approved' : 'Rejected', resolvedAt: now, gatemanNote: note ?? null } : item),
      notifications: [{ id: generateUniqueId('cn'), category: 'Gateman', title: approved ? 'Bus change approved' : 'Bus change rejected', body: note ?? (approved ? 'The gateman approved the bus change' : 'The gateman rejected the bus change'), isRead: false, actionable: true, actionType: approved ? 'BusChangeApproved' : 'BusChangeRejected', refId: requestId, timestamp: now }, ...state.notifications],
    }));
  },
}));
