import { create } from 'zustand';

export type BusStatus = 'Active' | 'Delayed' | 'Offline' | 'En Route' | 'At School' | 'Standby';
export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';
export type EntryMethod = 'Bus' | 'Parent Pickup' | 'Self';
export type NotifCategory = 'bus_fleet' | 'parent_gate' | 'requests' | 'admin';
export type PickupStatus = 'Pending' | 'Verified' | 'Denied';
export type LogAction = 'APPROVED' | 'REJECTED' | 'AUTHORIZED' | 'DENIED' | 'ALERT_RESOLVED' | 'SOS_SENT' | 'BUS_OFFLINE' | 'OVERRIDE';
export type FleetStatus = 'Online' | 'Offline';
export type Coordinates = { lat: number; lng: number };
export type RunPhase = 'morning' | 'afternoon';
export type AuditCategory =
  | 'gate_entry'
  | 'bus_movement'
  | 'boarding'
  | 'off_location'
  | 'delay'
  | 'self_pickup'
  | 'visitor'
  | 'gate_control'
  | 'handover';
export type ReportSpan = '1d' | '7d' | '15d' | '30d';

export interface FleetBus {
  id: string;
  busNumber: string;
  routeName: string;
  conductorName: string;
  conductorPhone: string;
  status: FleetStatus;
  coordinates: Coordinates;
}

export interface ProfileApproval {
  id: string;
  studentName: string;
  parentName: string;
  phone: string;
  assignedStop: string;
  grade: string;
  address: string;
  emergencyContact: string;
}

export interface EditRequest {
  id: string;
  target: string;
  oldData: Record<string, string>;
  newData: Record<string, string>;
  newCoordinates: Coordinates;
}

export interface GeofenceAlert {
  id: string;
  conductorName: string;
  studentName: string;
  distanceAwayM: number;
  timestamp: string;
  stopCoordinates: Coordinates;
  pingedCoordinates: Coordinates;
}

export type AttendanceStatus = 'Pending' | 'Boarded' | 'Dropped' | 'Checked Out' | 'Absent';

export interface RosterEntry {
  id: string;
  busId: string;
  studentName: string;
  attendanceStatus: AttendanceStatus;
  statusUpdatedAt?: string;
}

export interface DirectoryContact {
  id: string;
  name: string;
  role: 'Conductor' | 'School Admin';
  phone: string;
}

export interface BusStats {
  totalStudents: number;
  boardedIn: number;
  droppedOut: number;
  absent: number;
}

export function getBusStats(roster: RosterEntry[], busId: string): BusStats {
  const rows = roster.filter((entry) => entry.busId === busId);
  return {
    totalStudents: rows.length,
    boardedIn: rows.filter((entry) => entry.attendanceStatus === 'Boarded').length,
    droppedOut: rows.filter((entry) => entry.attendanceStatus === 'Dropped' || entry.attendanceStatus === 'Checked Out').length,
    absent: rows.filter((entry) => entry.attendanceStatus === 'Absent').length,
  };
}

export interface GateBus {
  id: string;
  busNumber: string;
  routeName: string;
  areaName: string;
  conductorName: string;
  conductorPhone: string;
  status: BusStatus;
  coordinates: Coordinates;
  speedKmh: number;
  etaMinutes: number;
  departureTime: string;
  totalStudents: number;
  boardedCount: number;
  lastPing: string;
  delayReason?: string;
}

export interface GateStudent {
  id: string;
  name: string;
  grade: string;
  busId: string | null;
  currentStatus: 'On Bus' | 'At School' | 'Picked Up' | 'Absent' | 'In Transit';
  lastSeen?: string;
  parentName: string;
  parentPhone: string;
  assignedStop: string;
  absentToday?: boolean;
  selfDropOff?: boolean;
  earlyPickup?: boolean;
  boardedAt?: string;
  droppedAt?: string;
  offLocation?: boolean;
  offLocationKind?: 'boarding' | 'dropping';
  offLocationNote?: string;
  offLocationVerified?: boolean;
  siblingGroup?: string;
}

export interface GateEntry {
  id: string;
  studentName: string;
  studentId: string;
  type: 'Arrival' | 'Departure';
  method: EntryMethod;
  time: string;
  authorizedBy?: string;
  busNumber?: string;
  gatemanName?: string;
}

export interface EarlyPickup {
  id: string;
  studentName: string;
  studentId: string;
  grade: string;
  parentName: string;
  parentPhone: string;
  reason: string;
  status: PickupStatus;
  requestedAt: string;
  verifiedAt?: string;
  kind: 'Early Pickup' | 'Self Drop-off';
  siblingGroup?: string;
  gatemanName?: string;
}

export interface RoutingRequest {
  id: string;
  studentName: string;
  studentId: string;
  grade: string;
  parentName: string;
  parentPhone: string;
  requestType: 'Stop Change' | 'Bus Transfer';
  oldStop?: string;
  oldCoords?: Coordinates;
  newStop?: string;
  newCoords?: Coordinates;
  fromBusId?: string;
  fromBusNumber?: string;
  toBusId?: string;
  toBusNumber?: string;
  reason: string;
  status: RequestStatus;
  submittedAt: string;
}

export interface GateNotification {
  id: string;
  category: NotifCategory;
  title: string;
  body: string;
  read: boolean;
  timestamp: string;
  actionable: boolean;
  referenceId?: string;
  action?: 'bus' | 'pickup' | 'request' | 'directive' | 'student';
}

export interface ShiftLogEntry {
  id: string;
  action: LogAction;
  description: string;
  timestamp: string;
  gatemanName?: string;
}

export interface AdminContact {
  id: string;
  name: string;
  role: 'Conductor' | 'School Admin' | 'Principal' | 'Transport Office' | 'Reception';
  phone: string;
  available: boolean;
}

export interface FleetArea {
  id: string;
  name: string;
  busIds: string[];
}

export interface AuditLog {
  id: string;
  category: AuditCategory;
  title: string;
  detail: string;
  timestamp: string;
  gatemanName: string;
  subject?: string;
}

export interface VisitorPass {
  id: string;
  name: string;
  kind: 'Visitor' | 'Vendor' | 'Walk-in student';
  purpose: string;
  time: string;
  gatemanName: string;
  category?: string;
  destination?: string;
  phone?: string;
  badge?: string;
  exitedAt?: string;
}

export interface AdminDirective {
  id: string;
  title: string;
  body: string;
  from: string;
  acknowledged: boolean;
  timestamp: string;
}

export interface HandoverReport {
  id: string;
  gatemanName: string;
  incomingOfficer?: string;
  answers: string[];
  notes?: string;
  timestamp: string;
}

const DAY = 24 * 60 * 60 * 1000;
const RETENTION_MS = 30 * DAY;

export function isBusOnCampus(status: BusStatus) {
  return status === 'At School' || status === 'Standby';
}

export function minutesOfDay(clockOverride: number | null) {
  if (clockOverride != null) return clockOverride;
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function runPhaseOf(input: {
  morningArrivalsClosed: boolean;
  gateOpen: boolean;
  clockOverride: number | null;
  afternoonThresholdMinutes: number;
}): RunPhase {
  const now = minutesOfDay(input.clockOverride);
  if (input.morningArrivalsClosed && input.gateOpen && now >= input.afternoonThresholdMinutes) return 'afternoon';
  return 'morning';
}

let uniqueSeq = 0;
export function generateUniqueId(prefix: string): string {
  uniqueSeq += 1;
  return `${prefix}-${Date.now()}-${uniqueSeq}-${Math.random().toString(36).slice(2, 7)}`;
}

function retain<T extends { timestamp: string }>(rows: T[]) {
  const cutoff = Date.now() - RETENTION_MS;
  return rows.filter((row) => new Date(row.timestamp).getTime() >= cutoff);
}

function mulberry32(seed: number) {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Ishaan', 'Kabir', 'Anaya', 'Diya', 'Myra', 'Sara', 'Anika', 'Navya', 'Kiara', 'Meher', 'Riya', 'Saanvi', 'Pari', 'Rohan', 'Dev', 'Yash', 'Kunal', 'Neel', 'Tara', 'Ishita', 'Sanya', 'Kavya', 'Aanya', 'Reyansh', 'Zara'];
const LAST = ['Sharma', 'Verma', 'Nair', 'Kapoor', 'Iyer', 'Gupta', 'Malhotra', 'Reddy', 'Singh', 'Patel', 'Joshi', 'Mehta', 'Chaudhary', 'Agarwal', 'Bose', 'Khan', 'Das', 'Rao'];
const CONDUCTORS = ['Ramesh Yadav', 'Suresh Kumar', 'Deepak Chaudhary', 'Vikram Singh', 'Manoj Tiwari', 'Arvind Mehta', 'Imran Qureshi', 'Harish Pal', 'Nitin Joshi', 'Prakash Das', 'Sunil Rao', 'Ajay Khan'];
const AREAS = ['Sector 45', 'North Zone', 'Highway Route', 'Noida', 'Faridabad', 'South Delhi', 'Dwarka', 'Rohini'];
const GATEMEN = ['Sunita Devi', 'Rakesh Pal', 'Meena Joshi'];
const DELAYS = ['Mechanical fault', 'Heavy traffic on the approach', 'Flat tyre', 'Route blockage'];

function buildSchool() {
  const rand = mulberry32(45);
  const pick = <T,>(rows: T[]) => rows[Math.floor(rand() * rows.length)]!;
  const buses: GateBus[] = [];
  const plan: BusStatus[] = [
    ...Array(18).fill('En Route'),
    ...Array(14).fill('At School'),
    ...Array(6).fill('Delayed'),
    ...Array(5).fill('Offline'),
    ...Array(5).fill('Standby'),
  ] as BusStatus[];

  plan.forEach((status, index) => {
    const area = AREAS[index % AREAS.length]!;
    const moving = status === 'En Route' || status === 'Active';
    buses.push({
      id: `b${index + 1}`,
      busNumber: `DL-1P-${String(1200 + index)}`,
      routeName: `${area} Route ${index + 1}`,
      areaName: area,
      conductorName: CONDUCTORS[index % CONDUCTORS.length]!,
      conductorPhone: `+91981${String(1000000 + index * 97).slice(0, 7)}`,
      status,
      coordinates: { lat: 28.45 + (index % 8) * 0.03, lng: 77.02 + (index % 6) * 0.04 },
      speedKmh: moving ? 18 + (index % 25) : 0,
      etaMinutes: moving ? 4 + (index % 28) : status === 'Delayed' ? 20 + (index % 15) : 0,
      departureTime: `0${6 + (index % 2)}:${index % 2 === 0 ? '10' : '40'}`,
      totalStudents: 0,
      boardedCount: 0,
      lastPing: new Date(Date.now() - (status === 'Offline' ? 50 : 2) * 60000).toISOString(),
      delayReason: status === 'Delayed' ? DELAYS[index % DELAYS.length] : undefined,
    });
  });

  const students: GateStudent[] = [];
  const routeBuses = buses.filter((bus) => bus.status !== 'Standby');
  for (let index = 0; index < 720; index += 1) {
    const bus = routeBuses[index % routeBuses.length]!;
    const absent = index % 19 === 0;
    const selfDrop = !absent && index % 27 === 0;
    const early = !absent && !selfDrop && index % 31 === 0;
    const boarded = !absent && !selfDrop && !early && bus.status !== 'Offline' && index % 4 !== 0;
    const offLocation = boarded && index % 47 === 0;
    const boardedAt = boarded ? new Date(Date.now() - index * 20000).toISOString() : undefined;
    students.push({
      id: `s${index + 1}`,
      name: `${FIRST[index % FIRST.length]} ${LAST[index % LAST.length]}`,
      grade: `${1 + (index % 10)}-${['A', 'B', 'C'][index % 3]}`,
      busId: bus.id,
      currentStatus: absent ? 'Absent' : selfDrop || early ? 'Picked Up' : boarded ? 'On Bus' : 'In Transit',
      lastSeen: boardedAt,
      parentName: `${pick(FIRST)} ${LAST[index % LAST.length]}`,
      parentPhone: `+91982${String(2000000 + index).slice(0, 7)}`,
      assignedStop: `${bus.areaName} Stop ${(index % 6) + 1}`,
      absentToday: absent,
      selfDropOff: selfDrop,
      earlyPickup: early,
      boardedAt,
      offLocation,
      offLocationKind: offLocation ? 'boarding' : undefined,
      siblingGroup: index % 53 === 0 ? `fam-${index}` : index % 53 === 1 ? `fam-${index - 1}` : undefined,
    });
  }

  buses.forEach((bus) => {
    const mine = students.filter((student) => student.busId === bus.id);
    bus.totalStudents = mine.length;
    bus.boardedCount = mine.filter((student) => student.boardedAt).length;
  });

  const earlyPickups: EarlyPickup[] = students
    .filter((student) => student.earlyPickup || student.selfDropOff)
    .slice(0, 18)
    .map((student, index) => ({
      id: `ep${index + 1}`,
      studentName: student.name,
      studentId: student.id,
      grade: student.grade,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      reason: student.selfDropOff ? 'Parent is dropping the child at the gate' : 'Early pickup requested by the parent',
      status: index < 10 ? 'Pending' : 'Verified',
      requestedAt: new Date(Date.now() - (index + 3) * 60000).toISOString(),
      kind: student.selfDropOff ? 'Self Drop-off' : 'Early Pickup',
      siblingGroup: student.siblingGroup,
    }));
  if (earlyPickups[0] && earlyPickups[1]) {
    earlyPickups[0].siblingGroup = 'fam-gate';
    earlyPickups[1].siblingGroup = 'fam-gate';
  }

  const routingRequests: RoutingRequest[] = students.slice(0, 14).map((student, index) => {
    const bus = buses.find((item) => item.id === student.busId)!;
    const other = buses[(index + 3) % buses.length]!;
    const stopChange = index % 2 === 0;
    return {
      id: `rr${index + 1}`,
      studentName: student.name,
      studentId: student.id,
      grade: student.grade,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      requestType: stopChange ? 'Stop Change' : 'Bus Transfer',
      oldStop: student.assignedStop,
      oldCoords: bus.coordinates,
      newStop: stopChange ? `${bus.areaName} Stop 9` : undefined,
      newCoords: stopChange ? { lat: bus.coordinates.lat + 0.02, lng: bus.coordinates.lng + 0.02 } : undefined,
      fromBusId: stopChange ? undefined : bus.id,
      fromBusNumber: stopChange ? undefined : bus.busNumber,
      toBusId: stopChange ? undefined : other.id,
      toBusNumber: stopChange ? undefined : other.busNumber,
      reason: stopChange ? 'Family moved within the same zone' : 'Parent shift changed and the earlier bus is needed',
      status: index < 8 ? 'Pending' : 'Approved',
      submittedAt: new Date(Date.now() - (index + 8) * 60000).toISOString(),
    };
  });

  const gateEntries: GateEntry[] = students
    .filter((student) => student.boardedAt)
    .slice(0, 40)
    .map((student, index) => ({
      id: `ge${index + 1}`,
      studentName: student.name,
      studentId: student.id,
      type: 'Arrival' as const,
      method: 'Bus' as const,
      time: student.boardedAt!,
      busNumber: buses.find((bus) => bus.id === student.busId)?.busNumber,
      gatemanName: 'Sunita Devi',
    }));

  const notifications: GateNotification[] = [
    ...buses.filter((bus) => bus.status === 'Delayed' || bus.status === 'Offline').slice(0, 4).map((bus, index) => ({
      id: `n-bus-${bus.id}`,
      category: 'bus_fleet' as const,
      title: `${bus.status === 'Offline' ? 'No signal' : 'Delayed'} — ${bus.busNumber}`,
      body: bus.delayReason ?? 'Conductor phone stopped reporting on the way back.',
      read: false,
      timestamp: new Date(Date.now() - (index + 2) * 60000).toISOString(),
      actionable: true,
      referenceId: bus.id,
      action: 'bus' as const,
    })),
    ...earlyPickups.filter((item) => item.status === 'Pending').slice(0, 3).map((item, index) => ({
      id: `n-ep-${item.id}`,
      category: 'parent_gate' as const,
      title: `${item.kind} — ${item.studentName}`,
      body: item.reason,
      read: false,
      timestamp: item.requestedAt,
      actionable: true,
      referenceId: item.id,
      action: 'pickup' as const,
    })),
    ...students.filter((student) => student.offLocation).slice(0, 3).map((student) => ({
      id: `n-off-${student.id}`,
      category: 'parent_gate' as const,
      title: `Off-location boarding — ${student.name}`,
      body: `${student.name} was boarded away from ${student.assignedStop}.`,
      read: false,
      timestamp: student.boardedAt ?? new Date().toISOString(),
      actionable: true,
      referenceId: student.id,
      action: 'student' as const,
    })),
    ...routingRequests.filter((item) => item.status === 'Pending').slice(0, 3).map((item) => ({
      id: `n-rr-${item.id}`,
      category: 'requests' as const,
      title: `${item.requestType} — ${item.studentName}`,
      body: item.reason,
      read: false,
      timestamp: item.submittedAt,
      actionable: true,
      referenceId: item.id,
      action: 'request' as const,
    })),
    {
      id: 'n-admin-1',
      category: 'admin' as const,
      title: 'Afternoon gate opens at 13:00',
      body: 'School Admin: do not reopen the gate for dismissal before the threshold.',
      read: false,
      timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
      actionable: true,
      referenceId: 'd1',
      action: 'directive' as const,
    },
  ];

  const areas: FleetArea[] = AREAS.slice(0, 3).map((name) => ({
    id: `area-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    busIds: buses.filter((bus) => bus.areaName === name).map((bus) => bus.id),
  }));

  const auditLogs: AuditLog[] = [];
  const categories: AuditCategory[] = ['gate_entry', 'bus_movement', 'boarding', 'off_location', 'delay', 'self_pickup', 'visitor', 'gate_control', 'handover'];
  for (let index = 0; index < 90; index += 1) {
    const category = categories[index % categories.length]!;
    auditLogs.push({
      id: `log-${index + 1}`,
      category,
      title: category.replace('_', ' '),
      detail: `Recorded by the gate desk for ${buses[index % buses.length]!.busNumber}.`,
      subject: buses[index % buses.length]!.busNumber,
      timestamp: new Date(Date.now() - index * 6 * 60 * 60 * 1000).toISOString(),
      gatemanName: GATEMEN[index % GATEMEN.length]!,
    });
  }
  auditLogs.push({
    id: 'log-expired',
    category: 'gate_control',
    title: 'Expired sample',
    detail: 'This row is older than 30 days and must not remain.',
    timestamp: new Date(Date.now() - 40 * DAY).toISOString(),
    gatemanName: 'Rakesh Pal',
  });

  const visitors: VisitorPass[] = [
    { id: 'v1', name: 'Anil Books', kind: 'Vendor', purpose: 'Library delivery', time: new Date(Date.now() - 30 * 60000).toISOString(), gatemanName: 'Sunita Devi' },
    { id: 'v2', name: 'Parent of Riya Bose', kind: 'Visitor', purpose: 'Fee counter', time: new Date(Date.now() - 50 * 60000).toISOString(), gatemanName: 'Sunita Devi' },
  ];

  const directives: AdminDirective[] = [
    { id: 'd1', title: 'Afternoon gate opens at 13:00', body: 'Do not reopen the gate for dismissal before the configured threshold.', from: 'School Admin', acknowledged: false, timestamp: new Date(Date.now() - 20 * 60000).toISOString() },
    { id: 'd2', title: 'Hold highway buses', body: 'Heavy traffic on the main approach. Hold departure until the office confirms.', from: 'Principal Rao', acknowledged: true, timestamp: new Date(Date.now() - 80 * 60000).toISOString() },
  ];

  return {
    buses,
    students,
    earlyPickups,
    routingRequests,
    gateEntries,
    notifications,
    areas,
    auditLogs: retain(auditLogs),
    expiredLogCount: 1,
    visitors,
    directives,
  };
}

const SCHOOL = buildSchool();

const CONTACTS: AdminContact[] = [
  { id: 'c-reception', name: 'Reception', role: 'Reception', phone: '+911141230001', available: true },
  { id: 'c-principal', name: 'Principal Sunita Rao', role: 'Principal', phone: '+919900011122', available: true },
  { id: 'c-admin', name: 'Rajeev Bhatia', role: 'School Admin', phone: '+919900022233', available: true },
];

function audit(category: AuditCategory, title: string, detail: string, gatemanName: string, subject?: string): AuditLog {
  return { id: generateUniqueId('log'), category, title, detail, timestamp: new Date().toISOString(), gatemanName, subject };
}

export interface GatemanV2State {
  buses: GateBus[];
  students: GateStudent[];
  gateEntries: GateEntry[];
  earlyPickups: EarlyPickup[];
  routingRequests: RoutingRequest[];
  notifications: GateNotification[];
  shiftLog: ShiftLogEntry[];
  contacts: AdminContact[];
  gateOpen: boolean;
  gateLockedDown: boolean;
  adminOverride: { active: boolean; openedBy: string } | null;
  areas: FleetArea[];
  pinnedBusIds: string[];
  auditLogs: AuditLog[];
  expiredLogCount: number;
  visitors: VisitorPass[];
  directives: AdminDirective[];
  handovers: HandoverReport[];
  signedInGateman: string;
  morningArrivalsClosed: boolean;
  afternoonThresholdMinutes: number;
  clockOverride: number | null;
  fleet: FleetBus[];
  profileApprovals: ProfileApproval[];
  editRequests: EditRequest[];
  geofenceAlerts: GeofenceAlert[];
  roster: RosterEntry[];
  directory: DirectoryContact[];
  modificationRequests: string[];
  markNotifRead: (id: string) => void;
  markAllNotifsRead: () => void;
  verifyPickup: (id: string) => void;
  verifyMultiplePickups: (ids: string[]) => void;
  denyPickup: (id: string) => void;
  denyMultiplePickups: (ids: string[]) => void;
  verifySiblingGroup: (group: string) => void;
  approveRequest: (id: string) => void;
  rejectRequest: (id: string, reason?: string) => void;
  reopenRequest: (id: string) => void;
  openGate: () => void;
  closeGate: () => void;
  toggleGateLock: () => void;
  attemptCloseGate: () => GateBus[];
  forceRecoverAndClose: () => void;
  markBusAtSchool: (busId: string) => void;
  markBusesArrived: (busIds: string[]) => void;
  adminOverrideGate: (open: boolean, by?: string) => void;
  addShiftLog: (entry: { action: LogAction; description: string }) => void;
  forceBusOffline: (busId: string) => void;
  pingConductor: (busId: string) => void;
  verifyOffLocation: (studentId: string, note: string) => void;
  createArea: (name: string, busIds: string[]) => void;
  updateArea: (id: string, name: string, busIds: string[]) => void;
  togglePin: (busId: string) => void;
  logVisitor: (entry: { name: string; kind: VisitorPass['kind']; purpose: string; category?: string; destination?: string; phone?: string; badge?: string; time?: string }) => void;
  markVisitorExited: (id: string) => void;
  acknowledgeDirective: (id: string) => void;
  sendBroadcast: (message: string, areaId: string | 'all') => void;
  setAfternoonThreshold: (minutes: number) => void;
  setClockOverride: (minutes: number | null) => void;
  submitHandover: (answers: string[], notes?: string, incomingOfficer?: string) => void;
  canEndShift: () => { ok: boolean; reason: string };
  approveProfile: (id: string) => void;
  rejectProfile: (id: string) => void;
  resubmitProfile: (id: string) => void;
  approveEdit: (id: string) => void;
  rejectEdit: (id: string) => void;
  resolveGeofenceAlert: (id: string) => void;
  updateAttendanceStatus: (rosterId: string, status: AttendanceStatus) => void;
  submitModificationRequest: (text: string) => void;
}

export type GatemanState = GatemanV2State;

export const useGatemanStore = create<GatemanV2State>((set, get) => ({
  buses: SCHOOL.buses,
  students: SCHOOL.students,
  gateEntries: SCHOOL.gateEntries,
  earlyPickups: SCHOOL.earlyPickups,
  routingRequests: SCHOOL.routingRequests,
  notifications: SCHOOL.notifications,
  shiftLog: [{ id: 'sl1', action: 'AUTHORIZED', description: 'Shift opened at the main gate', timestamp: new Date().toISOString(), gatemanName: 'Sunita Devi' }],
  contacts: CONTACTS,
  gateOpen: true,
  gateLockedDown: false,
  adminOverride: null,
  areas: SCHOOL.areas,
  pinnedBusIds: [SCHOOL.buses[0]!.id],
  auditLogs: SCHOOL.auditLogs,
  expiredLogCount: SCHOOL.expiredLogCount,
  visitors: SCHOOL.visitors,
  directives: SCHOOL.directives,
  handovers: [],
  signedInGateman: 'Sunita Devi',
  morningArrivalsClosed: false,
  afternoonThresholdMinutes: 13 * 60,
  clockOverride: null,
  fleet: SCHOOL.buses.map((bus) => ({
    id: bus.id,
    busNumber: bus.busNumber,
    routeName: bus.routeName,
    conductorName: bus.conductorName,
    conductorPhone: bus.conductorPhone,
    status: bus.status === 'Offline' ? 'Offline' : 'Online',
    coordinates: bus.coordinates,
  })),
  profileApprovals: SCHOOL.students.slice(0, 4).map((student) => ({
    id: `approval-${student.id}`,
    studentName: student.name,
    parentName: student.parentName,
    phone: student.parentPhone,
    assignedStop: student.assignedStop,
    grade: student.grade,
    address: student.assignedStop,
    emergencyContact: student.parentPhone,
  })),
  editRequests: [],
  geofenceAlerts: [],
  roster: SCHOOL.students.slice(0, 24).map((student) => ({
    id: `roster-${student.id}`,
    busId: student.busId ?? 'b1',
    studentName: student.name,
    attendanceStatus: student.absentToday ? 'Absent' : student.boardedAt ? 'Boarded' : 'Pending',
    statusUpdatedAt: student.boardedAt,
  })),
  directory: [
    ...SCHOOL.buses.slice(0, 12).map((bus) => ({ id: `dir-${bus.id}`, name: bus.conductorName, role: 'Conductor' as const, phone: bus.conductorPhone })),
    { id: 'dir-admin', name: 'Rajeev Bhatia (School Admin)', role: 'School Admin' as const, phone: '+919900022233' },
  ],
  modificationRequests: [],

  markNotifRead: (id) => set((state) => ({ notifications: state.notifications.map((item) => item.id === id ? { ...item, read: true } : item) })),
  markAllNotifsRead: () => set((state) => ({ notifications: state.notifications.map((item) => ({ ...item, read: true })) })),

  verifyPickup: (id) => get().verifyMultiplePickups([id]),

  verifyMultiplePickups: (ids) => {
    const wanted = new Set(ids);
    const targets = get().earlyPickups.filter((item) => wanted.has(item.id) && item.status === 'Pending');
    if (targets.length === 0) return;
    const name = get().signedInGateman;
    const now = new Date().toISOString();
    set((state) => ({
      earlyPickups: state.earlyPickups.map((item) => wanted.has(item.id) && item.status === 'Pending' ? { ...item, status: 'Verified', verifiedAt: now, gatemanName: name } : item),
      gateEntries: [
        ...targets.map((pickup) => ({
          id: generateUniqueId('ge'),
          studentName: pickup.studentName,
          studentId: pickup.studentId,
          type: pickup.kind === 'Self Drop-off' ? 'Arrival' as const : 'Departure' as const,
          method: pickup.kind === 'Self Drop-off' ? 'Self' as const : 'Parent Pickup' as const,
          time: now,
          authorizedBy: name,
          gatemanName: name,
        })),
        ...state.gateEntries,
      ],
      auditLogs: retain([...targets.map((pickup) => audit('self_pickup', pickup.kind, `${name} verified ${pickup.studentName}`, name, pickup.studentName)), ...state.auditLogs]),
      shiftLog: [...targets.map((pickup) => ({ id: generateUniqueId('sl'), action: 'AUTHORIZED' as const, description: `Verified ${pickup.kind} for ${pickup.studentName}`, timestamp: now, gatemanName: name })), ...state.shiftLog],
    }));
  },

  denyPickup: (id) => get().denyMultiplePickups([id]),

  denyMultiplePickups: (ids) => {
    const wanted = new Set(ids);
    const targets = get().earlyPickups.filter((item) => wanted.has(item.id) && item.status === 'Pending');
    if (targets.length === 0) return;
    const name = get().signedInGateman;
    const now = new Date().toISOString();
    set((state) => ({
      earlyPickups: state.earlyPickups.map((item) => wanted.has(item.id) && item.status === 'Pending' ? { ...item, status: 'Denied', gatemanName: name } : item),
      auditLogs: retain([...targets.map((pickup) => audit('self_pickup', `Denied ${pickup.kind}`, `${name} denied ${pickup.studentName}`, name, pickup.studentName)), ...state.auditLogs]),
      shiftLog: [...targets.map((pickup) => ({ id: generateUniqueId('sl'), action: 'DENIED' as const, description: `Denied ${pickup.kind} for ${pickup.studentName}`, timestamp: now, gatemanName: name })), ...state.shiftLog],
    }));
  },

  verifySiblingGroup: (group) => {
    get().verifyMultiplePickups(get().earlyPickups.filter((item) => item.siblingGroup === group && item.status === 'Pending').map((item) => item.id));
  },

  approveRequest: (id) => {
    const req = get().routingRequests.find((item) => item.id === id);
    if (!req) return;
    const name = get().signedInGateman;
    set((state) => ({
      routingRequests: state.routingRequests.map((item) => item.id === id ? { ...item, status: 'Approved' } : item),
      students: state.students.map((student) => {
        if (student.id !== req.studentId) return student;
        if (req.requestType === 'Stop Change' && req.newStop) return { ...student, assignedStop: req.newStop };
        if (req.requestType === 'Bus Transfer' && req.toBusId) return { ...student, busId: req.toBusId };
        return student;
      }),
      notifications: state.notifications.map((item) => item.referenceId === id ? { ...item, read: true } : item),
      auditLogs: retain([audit('boarding', `Approved ${req.requestType}`, `${name} approved ${req.studentName}`, name), ...state.auditLogs]),
      shiftLog: [{ id: generateUniqueId('sl'), action: 'APPROVED', description: `Approved ${req.requestType} for ${req.studentName}`, timestamp: new Date().toISOString(), gatemanName: name }, ...state.shiftLog],
    }));
  },

  rejectRequest: (id, reason) => {
    const req = get().routingRequests.find((item) => item.id === id);
    if (!req) return;
    const name = get().signedInGateman;
    const why = reason ? ` Reason: ${reason}` : '';
    set((state) => ({
      routingRequests: state.routingRequests.map((item) => item.id === id ? { ...item, status: 'Rejected' } : item),
      notifications: state.notifications.map((item) => item.referenceId === id ? { ...item, read: true } : item),
      auditLogs: retain([audit('boarding', `Rejected ${req.requestType}`, `${name} rejected ${req.studentName}.${why}`, name, req.studentName), ...state.auditLogs]),
      shiftLog: [{ id: generateUniqueId('sl'), action: 'REJECTED', description: `Rejected ${req.requestType} for ${req.studentName}.${why}`, timestamp: new Date().toISOString(), gatemanName: name }, ...state.shiftLog],
    }));
  },

  reopenRequest: (id) => {
    const req = get().routingRequests.find((item) => item.id === id);
    if (!req || req.status === 'Pending') return;
    const name = get().signedInGateman;
    set((state) => ({
      routingRequests: state.routingRequests.map((item) => item.id === id ? { ...item, status: 'Pending' } : item),
      students: req.status === 'Approved'
        ? state.students.map((student) => {
            if (student.id !== req.studentId) return student;
            if (req.requestType === 'Stop Change' && req.oldStop) return { ...student, assignedStop: req.oldStop };
            if (req.requestType === 'Bus Transfer' && req.fromBusId) return { ...student, busId: req.fromBusId };
            return student;
          })
        : state.students,
      auditLogs: retain([audit('boarding', 'Decision reopened', `${name} reopened ${req.requestType} for ${req.studentName}`, name, req.studentName), ...state.auditLogs]),
    }));
  },

  openGate: () => {
    const name = get().signedInGateman;
    set((state) => ({
      gateOpen: true,
      gateLockedDown: false,
      auditLogs: retain([audit('gate_control', 'Gate opened', `${name} opened the campus gate`, name), ...state.auditLogs]),
      shiftLog: [{ id: generateUniqueId('sl'), action: 'OVERRIDE', description: 'Campus gate opened.', timestamp: new Date().toISOString(), gatemanName: name }, ...state.shiftLog],
    }));
  },

  closeGate: () => {
    get().attemptCloseGate();
  },

  toggleGateLock: () => {
    if (get().gateOpen) get().attemptCloseGate();
    else get().openGate();
  },

  attemptCloseGate: () => {
    const outside = get().buses.filter((bus) => !isBusOnCampus(bus.status));
    if (outside.length > 0) return outside;
    const name = get().signedInGateman;
    set((state) => ({
      gateOpen: false,
      gateLockedDown: true,
      morningArrivalsClosed: true,
      auditLogs: retain([audit('gate_control', 'Gate closed', `${name} closed the gate. Tracking paused.`, name), ...state.auditLogs]),
      shiftLog: [{ id: generateUniqueId('sl'), action: 'OVERRIDE', description: 'Campus gate closed. Tracking paused.', timestamp: new Date().toISOString(), gatemanName: name }, ...state.shiftLog],
    }));
    return [];
  },

  forceRecoverAndClose: () => {
    const name = get().signedInGateman;
    set((state) => ({
      buses: state.buses.map((bus) => isBusOnCampus(bus.status) ? bus : { ...bus, status: 'At School', speedKmh: 0, etaMinutes: 0 }),
      gateOpen: false,
      gateLockedDown: true,
      morningArrivalsClosed: true,
      auditLogs: retain([audit('gate_control', 'Buses placed at school', `${name} marked outstanding buses at school and closed the gate`, name), ...state.auditLogs]),
      shiftLog: [{ id: generateUniqueId('sl'), action: 'OVERRIDE', description: 'Outstanding buses marked at school and the gate closed.', timestamp: new Date().toISOString(), gatemanName: name }, ...state.shiftLog],
    }));
  },

  markBusAtSchool: (busId) => {
    const bus = get().buses.find((item) => item.id === busId);
    if (!bus) return;
    const name = get().signedInGateman;
    set((state) => ({
      buses: state.buses.map((item) => item.id === busId ? { ...item, status: 'At School', speedKmh: 0, etaMinutes: 0 } : item),
      auditLogs: retain([audit('bus_movement', 'Bus at school', `${name} marked ${bus.busNumber} at school`, name), ...state.auditLogs]),
      shiftLog: [{ id: generateUniqueId('sl'), action: 'OVERRIDE', description: `Marked ${bus.busNumber} at school.`, timestamp: new Date().toISOString(), gatemanName: name }, ...state.shiftLog],
    }));
  },

  markBusesArrived: (busIds) => {
    busIds.forEach((id) => get().markBusAtSchool(id));
  },

  adminOverrideGate: (open, by = 'School Admin') =>
    set((state) => ({
      gateOpen: open,
      gateLockedDown: !open,
      morningArrivalsClosed: open ? state.morningArrivalsClosed : true,
      adminOverride: { active: true, openedBy: by },
      auditLogs: retain([audit('gate_control', open ? 'Admin opened the gate' : 'Admin closed the gate', `${by} overrode the gateman`, state.signedInGateman), ...state.auditLogs]),
      shiftLog: [{ id: generateUniqueId('sl'), action: 'OVERRIDE', description: open ? `${by} override: gate opened.` : `${by} override: gate closed.`, timestamp: new Date().toISOString(), gatemanName: by }, ...state.shiftLog],
    })),

  addShiftLog: (entry) => {
    const name = get().signedInGateman;
    set((state) => ({
      shiftLog: [{ ...entry, id: generateUniqueId('sl'), timestamp: new Date().toISOString(), gatemanName: name }, ...state.shiftLog],
    }));
  },

  forceBusOffline: (busId) => {
    const bus = get().buses.find((item) => item.id === busId);
    if (!bus) return;
    const name = get().signedInGateman;
    set((state) => ({
      buses: state.buses.map((item) => item.id === busId ? { ...item, status: 'Offline', speedKmh: 0 } : item),
      fleet: state.fleet.map((item) => item.id === busId ? { ...item, status: 'Offline' } : item),
      auditLogs: retain([audit('delay', 'Bus offline', `${name} marked ${bus.busNumber} offline`, name), ...state.auditLogs]),
      shiftLog: [{ id: generateUniqueId('sl'), action: 'BUS_OFFLINE', description: `Marked ${bus.busNumber} offline`, timestamp: new Date().toISOString(), gatemanName: name }, ...state.shiftLog],
    }));
  },

  pingConductor: (busId) => {
    const bus = get().buses.find((item) => item.id === busId);
    if (!bus) return;
    const name = get().signedInGateman;
    set((state) => ({
      auditLogs: retain([audit('delay', 'Conductor pinged', `${name} pinged ${bus.conductorName} on ${bus.busNumber}`, name), ...state.auditLogs]),
      shiftLog: [{ id: generateUniqueId('sl'), action: 'OVERRIDE', description: `Pinged ${bus.conductorName} on ${bus.busNumber}`, timestamp: new Date().toISOString(), gatemanName: name }, ...state.shiftLog],
    }));
  },

  verifyOffLocation: (studentId, note) => {
    const student = get().students.find((item) => item.id === studentId);
    if (!student) return;
    const name = get().signedInGateman;
    set((state) => ({
      students: state.students.map((item) => item.id === studentId ? { ...item, offLocationVerified: true, offLocationNote: note } : item),
      notifications: state.notifications.map((item) => item.referenceId === studentId ? { ...item, read: true } : item),
      auditLogs: retain([audit('off_location', 'Off-location verified', `${name} verified ${student.name}: ${note}`, name), ...state.auditLogs]),
    }));
  },

  createArea: (name, busIds) =>
    set((state) => ({ areas: [...state.areas, { id: generateUniqueId('area'), name, busIds }] })),

  updateArea: (id, name, busIds) =>
    set((state) => ({ areas: state.areas.map((area) => area.id === id ? { ...area, name, busIds } : area) })),

  togglePin: (busId) =>
    set((state) => ({
      pinnedBusIds: state.pinnedBusIds.includes(busId)
        ? state.pinnedBusIds.filter((id) => id !== busId)
        : [busId, ...state.pinnedBusIds],
    })),

  logVisitor: (entry) => {
    const name = get().signedInGateman;
    const row: VisitorPass = { ...entry, id: generateUniqueId('v'), time: entry.time ?? new Date().toISOString(), gatemanName: name };
    const where = [entry.category, entry.destination, entry.badge].filter(Boolean).join(' · ');
    set((state) => ({
      visitors: [row, ...state.visitors],
      auditLogs: retain([audit('visitor', entry.kind, `${name} logged ${entry.name}: ${entry.purpose}${where ? ` · ${where}` : ''}`, name, entry.name), ...state.auditLogs]),
    }));
  },

  markVisitorExited: (id) => {
    const row = get().visitors.find((item) => item.id === id);
    if (!row || row.exitedAt) return;
    const name = get().signedInGateman;
    set((state) => ({
      visitors: state.visitors.map((item) => item.id === id ? { ...item, exitedAt: new Date().toISOString() } : item),
      auditLogs: retain([audit('visitor', 'Visitor exited', `${name} marked ${row.name} as exited`, name, row.name), ...state.auditLogs]),
    }));
  },

  acknowledgeDirective: (id) => {
    const name = get().signedInGateman;
    const row = get().directives.find((item) => item.id === id);
    set((state) => ({
      directives: state.directives.map((item) => item.id === id ? { ...item, acknowledged: true } : item),
      notifications: state.notifications.map((item) => item.referenceId === id ? { ...item, read: true } : item),
      auditLogs: retain([audit('gate_control', 'Directive acknowledged', `${name} acknowledged ${row?.title ?? 'a directive'}`, name), ...state.auditLogs]),
    }));
  },

  sendBroadcast: (message, areaId) => {
    const name = get().signedInGateman;
    const area = get().areas.find((item) => item.id === areaId);
    const target = area ? area.name : 'all conductors';
    set((state) => ({
      notifications: [{ id: generateUniqueId('n'), category: 'bus_fleet', title: 'Broadcast sent', body: `${message} → ${target}`, read: true, timestamp: new Date().toISOString(), actionable: false }, ...state.notifications],
      auditLogs: retain([audit('delay', 'Broadcast', `${name} sent "${message}" to ${target}`, name), ...state.auditLogs]),
    }));
  },

  setAfternoonThreshold: (minutes) => set({ afternoonThresholdMinutes: minutes }),
  setClockOverride: (minutes) => set({ clockOverride: minutes }),

  submitHandover: (answers, notes, incomingOfficer) => {
    const name = get().signedInGateman;
    const report: HandoverReport = { id: generateUniqueId('ho'), gatemanName: name, incomingOfficer, answers, notes, timestamp: new Date().toISOString() };
    const detail = `${name} handed the gate to ${incomingOfficer ?? 'the next officer'}. ${answers.join(' | ')}${notes ? ` Notes: ${notes}` : ''}`;
    set((state) => ({
      handovers: [report, ...state.handovers],
      auditLogs: retain([audit('handover', 'Shift handover', detail, name, incomingOfficer), ...state.auditLogs]),
    }));
  },

  canEndShift: () => {
    const state = get();
    if (state.gateOpen) return { ok: false, reason: 'Close the school gate before ending the shift.' };
    const outside = state.buses.filter((bus) => !isBusOnCampus(bus.status));
    if (outside.length > 0) return { ok: false, reason: `${outside.length} buses are still not marked at school.` };
    return { ok: true, reason: '' };
  },

  approveProfile: (id) => set((state) => ({ profileApprovals: state.profileApprovals.filter((item) => item.id !== id) })),
  rejectProfile: (id) => set((state) => ({ profileApprovals: state.profileApprovals.filter((item) => item.id !== id) })),
  resubmitProfile: (id) => set((state) => ({ profileApprovals: state.profileApprovals.filter((item) => item.id !== id) })),
  approveEdit: (id) => set((state) => ({ editRequests: state.editRequests.filter((item) => item.id !== id) })),
  rejectEdit: (id) => set((state) => ({ editRequests: state.editRequests.filter((item) => item.id !== id) })),
  resolveGeofenceAlert: (id) => set((state) => ({ geofenceAlerts: state.geofenceAlerts.filter((item) => item.id !== id) })),
  updateAttendanceStatus: (rosterId, status) =>
    set((state) => ({
      roster: state.roster.map((entry) => entry.id === rosterId ? { ...entry, attendanceStatus: status, statusUpdatedAt: new Date().toISOString() } : entry),
    })),
  submitModificationRequest: (text) => set((state) => ({ modificationRequests: [...state.modificationRequests, text] })),
}));
