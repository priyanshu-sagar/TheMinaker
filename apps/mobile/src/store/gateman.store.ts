import { create } from 'zustand';

export type BusStatus = 'Active' | 'Delayed' | 'Offline' | 'En Route' | 'At School';
export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';
export type EntryMethod = 'Bus' | 'Parent Pickup' | 'Self';
export type NotifCategory = 'critical' | 'parent_action' | 'admin';
export type PickupStatus = 'Pending' | 'Verified' | 'Denied';
export type LogAction = 'APPROVED' | 'REJECTED' | 'AUTHORIZED' | 'DENIED' | 'ALERT_RESOLVED' | 'SOS_SENT' | 'BUS_OFFLINE' | 'OVERRIDE';

export type FleetStatus = 'Online' | 'Offline';
export type Coordinates = { lat: number; lng: number };

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
  conductorName: string;
  conductorPhone: string;
  status: BusStatus;
  coordinates: { lat: number; lng: number };
  speedKmh: number;
  etaMinutes: number;
  departureTime: string; // e.g. '07:15'
  totalStudents: number;
  boardedCount: number;
  lastPing: string; // ISO timestamp
}

export interface GateStudent {
  id: string;
  name: string;
  grade: string;
  busId: string | null;
  currentStatus: 'On Bus' | 'At School' | 'Picked Up' | 'Absent' | 'In Transit';
  lastSeen?: string; // ISO
  parentName: string;
  parentPhone: string;
  assignedStop: string;
}

export interface GateEntry {
  id: string;
  studentName: string;
  studentId: string;
  type: 'Arrival' | 'Departure';
  method: EntryMethod;
  time: string; // ISO
  authorizedBy?: string;
  busNumber?: string;
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
  requestedAt: string; // ISO
  verifiedAt?: string;
}

export interface RoutingRequest {
  id: string;
  studentName: string;
  studentId: string;
  grade: string;
  parentName: string;
  parentPhone: string;
  requestType: 'Stop Change' | 'Bus Transfer';
  // Stop change
  oldStop?: string;
  oldCoords?: { lat: number; lng: number };
  newStop?: string;
  newCoords?: { lat: number; lng: number };
  // Bus transfer
  fromBusId?: string;
  fromBusNumber?: string;
  toBusId?: string;
  toBusNumber?: string;
  reason: string;
  status: RequestStatus;
  submittedAt: string; // ISO
}

export interface GateNotification {
  id: string;
  category: NotifCategory;
  title: string;
  body: string;
  read: boolean;
  timestamp: string; // ISO
  actionable: boolean;
  referenceId?: string;
}

export interface ShiftLogEntry {
  id: string;
  action: LogAction;
  description: string;
  timestamp: string; // ISO
}

export interface AdminContact {
  id: string;
  name: string;
  role: 'Conductor' | 'School Admin' | 'Principal' | 'Transport Office';
  phone: string;
  available: boolean;
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
  gateLockedDown: boolean;

  // Legacy compatibility fields
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
  denyPickup: (id: string) => void;
  approveRequest: (id: string) => void;
  rejectRequest: (id: string) => void;
  toggleGateLock: () => void;
  addShiftLog: (entry: { action: LogAction; description: string }) => void;
  forceBusOffline: (busId: string) => void;
  pingConductor: (busId: string) => void;

  approveProfile: (id: string) => void;
  rejectProfile: (id: string) => void;
  resubmitProfile: (id: string) => void;
  approveEdit: (id: string) => void;
  rejectEdit: (id: string) => void;
  resolveGeofenceAlert: (id: string) => void;
  updateAttendanceStatus: (rosterId: string, status: AttendanceStatus) => void;
  submitModificationRequest: (text: string) => void;
}

// ─── Mock data — Delhi-NCR region ────────────────────────────────
function minsAgo(m: number) { return new Date(Date.now() - m * 60000).toISOString(); }

const BUSES: GateBus[] = [
  { id: 'b1', busNumber: 'DL-1PC-4521', routeName: 'Gurugram Sector 45 Loop', conductorName: 'Ramesh Yadav',    conductorPhone: '+919810022334', status: 'En Route',  coordinates: { lat: 28.4595, lng: 77.0266 }, speedKmh: 32, etaMinutes: 8,  departureTime: '07:00', totalStudents: 24, boardedCount: 21, lastPing: minsAgo(1) },
  { id: 'b2', busNumber: 'UP-80-BT-3312',routeName: 'Agra Cantt – Sadar Route', conductorName: 'Suresh Kumar',  conductorPhone: '+919811044556', status: 'Active',    coordinates: { lat: 27.1767, lng: 78.0081 }, speedKmh: 28, etaMinutes: 14, departureTime: '07:15', totalStudents: 18, boardedCount: 18, lastPing: minsAgo(2) },
  { id: 'b3', busNumber: 'UP-85-CN-1187',routeName: 'Mathura Junction – Vrindavan', conductorName: 'Deepak Chaudhary', conductorPhone: '+919812066778', status: 'Delayed',   coordinates: { lat: 27.4924, lng: 77.6737 }, speedKmh: 0,  etaMinutes: 22, departureTime: '07:10', totalStudents: 20, boardedCount: 17, lastPing: minsAgo(8) },
  { id: 'b4', busNumber: 'DL-1PB-9087',  routeName: 'Noida Sector 62 Express',  conductorName: 'Vikram Singh',   conductorPhone: '+919813088990', status: 'At School', coordinates: { lat: 28.5355, lng: 77.3910 }, speedKmh: 0,  etaMinutes: 0,  departureTime: '06:45', totalStudents: 22, boardedCount: 22, lastPing: minsAgo(3) },
  { id: 'b5', busNumber: 'HR-51-DE-2245',routeName: 'Faridabad NIT Route',       conductorName: 'Manoj Tiwari',  conductorPhone: '+919814099001', status: 'Offline',   coordinates: { lat: 28.4089, lng: 77.3178 }, speedKmh: 0,  etaMinutes: 0,  departureTime: '07:30', totalStudents: 16, boardedCount: 0,  lastPing: minsAgo(45) },
  { id: 'b6', busNumber: 'DL-1RT-7734',  routeName: 'South Delhi Ring Route',    conductorName: 'Arvind Mehta',  conductorPhone: '+919815011223', status: 'En Route',  coordinates: { lat: 28.6139, lng: 77.2090 }, speedKmh: 41, etaMinutes: 5,  departureTime: '06:50', totalStudents: 19, boardedCount: 19, lastPing: minsAgo(1) },
];

const STUDENTS: GateStudent[] = [
  { id: 's1', name: 'Aarav Sharma',   grade: '6-B', busId: 'b1', currentStatus: 'On Bus',    lastSeen: minsAgo(5),  parentName: 'Neha Sharma',    parentPhone: '+919820011122', assignedStop: 'Sector 45, Gurugram' },
  { id: 's2', name: 'Ishita Verma',   grade: '4-A', busId: 'b2', currentStatus: 'On Bus',    lastSeen: minsAgo(12), parentName: 'Rohit Verma',    parentPhone: '+919820022233', assignedStop: 'Sadar Bazaar, Agra' },
  { id: 's3', name: 'Kabir Chaudhary',grade: '8-C', busId: 'b3', currentStatus: 'In Transit', lastSeen: minsAgo(22), parentName: 'Priya Chaudhary',parentPhone: '+919820033344', assignedStop: 'Vrindavan Road, Mathura' },
  { id: 's4', name: 'Sanya Malhotra', grade: '3-B', busId: 'b1', currentStatus: 'On Bus',    lastSeen: minsAgo(5),  parentName: 'Amit Malhotra',  parentPhone: '+919820044455', assignedStop: 'Sector 45, Gurugram' },
  { id: 's5', name: 'Vivaan Nair',    grade: '7-A', busId: 'b4', currentStatus: 'At School', lastSeen: minsAgo(0),  parentName: 'Renu Nair',      parentPhone: '+919820055566', assignedStop: 'Sector 62, Noida' },
  { id: 's6', name: 'Riya Kapoor',    grade: '5-C', busId: null, currentStatus: 'Picked Up', lastSeen: minsAgo(15), parentName: 'Suneel Kapoor',  parentPhone: '+919820066677', assignedStop: 'South Delhi Ring' },
  { id: 's7', name: 'Arjun Nair',     grade: '9-A', busId: 'b1', currentStatus: 'Absent',    lastSeen: undefined,   parentName: 'Deepa Nair',     parentPhone: '+919820077788', assignedStop: 'Sector 45, Gurugram' },
  { id: 's8', name: 'Dev Agarwal',    grade: '2-B', busId: 'b2', currentStatus: 'At School', lastSeen: minsAgo(3),  parentName: 'Sumit Agarwal',  parentPhone: '+919820088899', assignedStop: 'Sadar Bazaar, Agra' },
];

const GATE_ENTRIES: GateEntry[] = [
  { id: 'ge1', studentName: 'Vivaan Nair',  studentId: 's5', type: 'Arrival',   method: 'Bus',           time: minsAgo(3),  busNumber: 'DL-1PB-9087' },
  { id: 'ge2', studentName: 'Dev Agarwal',  studentId: 's8', type: 'Arrival',   method: 'Bus',           time: minsAgo(5),  busNumber: 'UP-80-BT-3312' },
  { id: 'ge3', studentName: 'Riya Kapoor',  studentId: 's6', type: 'Departure', method: 'Parent Pickup', time: minsAgo(15), authorizedBy: 'Gate Sunita' },
  { id: 'ge4', studentName: 'Ananya Mehta', studentId: 's9', type: 'Arrival',   method: 'Self',          time: minsAgo(20) },
];

const EARLY_PICKUPS: EarlyPickup[] = [
  { id: 'ep1', studentName: 'Aarav Sharma',    studentId: 's1', grade: '6-B', parentName: 'Neha Sharma',   parentPhone: '+919820011122', reason: 'Medical appointment at 11 AM', status: 'Pending', requestedAt: minsAgo(8) },
  { id: 'ep2', studentName: 'Sanya Malhotra',  studentId: 's4', grade: '3-B', parentName: 'Amit Malhotra', parentPhone: '+919820044455', reason: 'Family emergency', status: 'Pending', requestedAt: minsAgo(3) },
  { id: 'ep3', studentName: 'Kabir Chaudhary', studentId: 's3', grade: '8-C', parentName: 'Priya Chaudhary', parentPhone: '+919820033344', reason: 'Already picked up — notifying school', status: 'Verified', requestedAt: minsAgo(30), verifiedAt: minsAgo(25) },
];

const ROUTING_REQUESTS: RoutingRequest[] = [
  { id: 'rr1', studentName: 'Aarav Sharma',    studentId: 's1', grade: '6-B', parentName: 'Neha Sharma',    parentPhone: '+919820011122', requestType: 'Stop Change',  oldStop: 'Sector 45, Gurugram', oldCoords: { lat: 28.4595, lng: 77.0266 }, newStop: 'Sector 50, Gurugram', newCoords: { lat: 28.4382, lng: 77.0723 }, reason: 'Moved to new apartment', status: 'Pending', submittedAt: minsAgo(12) },
  { id: 'rr2', studentName: 'Ishita Verma',    studentId: 's2', grade: '4-A', parentName: 'Rohit Verma',    parentPhone: '+919820022233', requestType: 'Bus Transfer', fromBusId: 'b2', fromBusNumber: 'UP-80-BT-3312', toBusId: 'b1', toBusNumber: 'DL-1PC-4521', reason: 'New shift timings at work, need earlier bus', status: 'Pending', submittedAt: minsAgo(35) },
  { id: 'rr3', studentName: 'Dev Agarwal',     studentId: 's8', grade: '2-B', parentName: 'Sumit Agarwal',  parentPhone: '+919820088899', requestType: 'Stop Change',  oldStop: 'Sadar Bazaar, Agra', oldCoords: { lat: 27.1767, lng: 78.0081 }, newStop: 'Civil Lines, Agra', newCoords: { lat: 27.1892, lng: 78.0051 }, reason: 'Grandmother lives nearby, easier pickup', status: 'Approved', submittedAt: minsAgo(120) },
];

const NOTIFICATIONS: GateNotification[] = [
  { id: 'n1', category: 'critical',      title: 'Bus Delayed — DL-1PC-4521',         body: 'Ramesh Yadav reports 15-min delay due to traffic near NH-48.',          read: false, timestamp: minsAgo(4),  actionable: true,  referenceId: 'b1' },
  { id: 'n2', category: 'critical',      title: 'Geofence Breach — UP-85-CN-1187',   body: 'Bus is 1.8 km off designated route near Mathura bypass.',               read: false, timestamp: minsAgo(9),  actionable: true,  referenceId: 'b3' },
  { id: 'n3', category: 'parent_action', title: 'Early Pickup — Aarav Sharma',        body: 'Neha Sharma requesting early pickup at 10:30 AM. Reason: Medical.',     read: false, timestamp: minsAgo(8),  actionable: true,  referenceId: 'ep1' },
  { id: 'n4', category: 'parent_action', title: 'Parent Arriving — Sanya Malhotra',   body: 'Amit Malhotra is 5 minutes away for emergency early pickup.',          read: false, timestamp: minsAgo(3),  actionable: true,  referenceId: 'ep2' },
  { id: 'n5', category: 'admin',         title: 'Admin Broadcast — Early Dismissal',  body: 'School closing at 1 PM today. All buses depart by 1:15 PM. — Principal Rao.', read: true, timestamp: minsAgo(45), actionable: false },
  { id: 'n6', category: 'admin',         title: 'Transport Circular — Bus 5 Off-Duty',body: 'HR-51-DE-2245 under maintenance today. Students rerouted to DL-1PC-4521.',read: true, timestamp: minsAgo(90), actionable: false },
];

const SHIFT_LOG: ShiftLogEntry[] = [
  { id: 'sl1', action: 'AUTHORIZED',     description: 'Authorized early pickup for Riya Kapoor — Parent: Suneel Kapoor', timestamp: minsAgo(15) },
  { id: 'sl2', action: 'APPROVED',       description: 'Approved stop change request for Dev Agarwal — Sadar Bazaar → Civil Lines', timestamp: minsAgo(50) },
  { id: 'sl3', action: 'ALERT_RESOLVED', description: 'Resolved geofence alert — Bus UP-85-CN-1187 back on route', timestamp: minsAgo(60) },
  { id: 'sl4', action: 'BUS_OFFLINE',    description: 'Marked HR-51-DE-2245 (Bus 5) offline — maintenance', timestamp: minsAgo(95) },
];

const CONTACTS: AdminContact[] = [
  { id: 'c1', name: 'Transport Office',      role: 'Transport Office', phone: '+911141234567', available: true },
  { id: 'c2', name: 'Principal Sunita Rao', role: 'Principal',        phone: '+919900011122', available: true },
  { id: 'c3', name: 'Rajeev Bhatia (Admin)',role: 'School Admin',     phone: '+919900022233', available: false },
  { id: 'c4', name: 'Ramesh Yadav',         role: 'Conductor',        phone: '+919810022334', available: true },
  { id: 'c5', name: 'Suresh Kumar',         role: 'Conductor',        phone: '+919811044556', available: true },
  { id: 'c6', name: 'Deepak Chaudhary',     role: 'Conductor',        phone: '+919812066778', available: false },
  { id: 'c7', name: 'Vikram Singh',         role: 'Conductor',        phone: '+919813088990', available: true },
  { id: 'c8', name: 'Manoj Tiwari',         role: 'Conductor',        phone: '+919814099001', available: false },
  { id: 'c9', name: 'Arvind Mehta',         role: 'Conductor',        phone: '+919815011223', available: true },
];

const INITIAL_FLEET: FleetBus[] = [
  { id: 'b1', busNumber: 'DL-1PC-4521', routeName: 'Gurugram Sector 45 Loop', conductorName: 'Ramesh Yadav', conductorPhone: '+919810022334', status: 'Online', coordinates: { lat: 28.4595, lng: 77.0266 } },
  { id: 'b2', busNumber: 'UP-80-BT-3312', routeName: 'Agra Cantt – Sadar Route', conductorName: 'Suresh Kumar', conductorPhone: '+919811044556', status: 'Online', coordinates: { lat: 27.1767, lng: 78.0081 } },
  { id: 'b3', busNumber: 'UP-85-CN-1187', routeName: 'Mathura Junction – Vrindavan Route', conductorName: 'Deepak Chaudhary', conductorPhone: '+919812066778', status: 'Offline', coordinates: { lat: 27.4924, lng: 77.6737 } },
  { id: 'b4', busNumber: 'DL-1PB-9087', routeName: 'Noida Sector 62 Express', conductorName: 'Vikram Singh', conductorPhone: '+919813088990', status: 'Online', coordinates: { lat: 28.5355, lng: 77.3910 } },
  { id: 'b5', busNumber: 'HR-51-DE-2245', routeName: 'Faridabad NIT Route', conductorName: 'Manoj Tiwari', conductorPhone: '+919814099001', status: 'Offline', coordinates: { lat: 28.4089, lng: 77.3178 } },
  { id: 'b6', busNumber: 'DL-1RT-7734', routeName: 'South Delhi Ring Route', conductorName: 'Arvind Mehta', conductorPhone: '+919815011223', status: 'Online', coordinates: { lat: 28.6139, lng: 77.2090 } },
];

const INITIAL_APPROVALS: ProfileApproval[] = [
  { id: 'approval-1', studentName: 'Aarav Sharma', parentName: 'Neha Sharma', phone: '+919820011122', assignedStop: 'Sector 45, Gurugram', grade: '6-B', address: 'H-204, Sector 45, Gurugram', emergencyContact: '+919820011199' },
  { id: 'approval-2', studentName: 'Ishita Verma', parentName: 'Rohit Verma', phone: '+919820022233', assignedStop: 'Sadar Bazaar, Agra', grade: '4-A', address: '12, Sadar Bazaar, Agra', emergencyContact: '+919820022299' },
  { id: 'approval-3', studentName: 'Kabir Chaudhary', parentName: 'Priya Chaudhary', phone: '+919820033344', assignedStop: 'Vrindavan Road, Mathura', grade: '8-C', address: '45, Vrindavan Road, Mathura', emergencyContact: '+919820033399' },
  { id: 'approval-4', studentName: 'Sanya Malhotra', parentName: 'Amit Malhotra', phone: '+919820044455', assignedStop: 'Sector 62, Noida', grade: '3-B', address: 'B-88, Sector 62, Noida', emergencyContact: '+919820044499' },
];

const INITIAL_EDITS: EditRequest[] = [
  {
    id: 'edit-1',
    target: 'Aarav Sharma — Pickup Address',
    oldData: { Address: 'Sector 45, Gurugram', Landmark: 'Near City Park' },
    newData: { Address: 'Sector 50, Gurugram', Landmark: 'Near Metro Station' },
    newCoordinates: { lat: 28.4382, lng: 77.0723 },
  },
  {
    id: 'edit-2',
    target: 'Ishita Verma — Emergency Contact',
    oldData: { Phone: '+919820022233' },
    newData: { Phone: '+919820099887' },
    newCoordinates: { lat: 27.1767, lng: 78.0081 },
  },
  {
    id: 'edit-3',
    target: 'Kabir Chaudhary — Assigned Stop',
    oldData: { Stop: 'Vrindavan Road, Mathura' },
    newData: { Stop: 'Krishna Nagar, Mathura' },
    newCoordinates: { lat: 27.5023, lng: 77.6836 },
  },
];

const INITIAL_ALERTS: GeofenceAlert[] = [
  {
    id: 'alert-1',
    conductorName: 'Suresh Kumar',
    studentName: 'Ishita Verma',
    distanceAwayM: 640,
    timestamp: minsAgo(6),
    stopCoordinates: { lat: 27.1767, lng: 78.0081 },
    pingedCoordinates: { lat: 27.1822, lng: 78.0134 },
  },
  {
    id: 'alert-2',
    conductorName: 'Deepak Chaudhary',
    studentName: 'Kabir Chaudhary',
    distanceAwayM: 1180,
    timestamp: minsAgo(22),
    stopCoordinates: { lat: 27.4924, lng: 77.6737 },
    pingedCoordinates: { lat: 27.5041, lng: 77.6602 },
  },
];

const INITIAL_ROSTER: RosterEntry[] = [
  { id: 'roster-1', busId: 'b1', studentName: 'Aarav Sharma', attendanceStatus: 'Boarded', statusUpdatedAt: minsAgo(45) },
  { id: 'roster-2', busId: 'b1', studentName: 'Sanya Malhotra', attendanceStatus: 'Pending' },
  { id: 'roster-3', busId: 'b1', studentName: 'Riya Kapoor', attendanceStatus: 'Dropped', statusUpdatedAt: minsAgo(10) },
  { id: 'roster-4', busId: 'b1', studentName: 'Arjun Nair', attendanceStatus: 'Absent' },
  { id: 'roster-5', busId: 'b2', studentName: 'Ishita Verma', attendanceStatus: 'Boarded', statusUpdatedAt: minsAgo(30) },
  { id: 'roster-6', busId: 'b2', studentName: 'Dev Agarwal', attendanceStatus: 'Checked Out', statusUpdatedAt: minsAgo(5) },
  { id: 'roster-7', busId: 'b2', studentName: 'Meher Kapoor', attendanceStatus: 'Absent' },
  { id: 'roster-8', busId: 'b3', studentName: 'Kabir Chaudhary', attendanceStatus: 'Pending' },
  { id: 'roster-9', busId: 'b3', studentName: 'Ananya Gupta', attendanceStatus: 'Pending' },
  { id: 'roster-10', busId: 'b4', studentName: 'Vivaan Nair', attendanceStatus: 'Boarded', statusUpdatedAt: minsAgo(50) },
];

const INITIAL_DIRECTORY: DirectoryContact[] = [
  { id: 'contact-b1', name: 'Ramesh Yadav', role: 'Conductor', phone: '+919810022334' },
  { id: 'contact-b2', name: 'Suresh Kumar', role: 'Conductor', phone: '+919811044556' },
  { id: 'contact-b3', name: 'Deepak Chaudhary', role: 'Conductor', phone: '+919812066778' },
  { id: 'contact-b4', name: 'Vikram Singh', role: 'Conductor', phone: '+919813088990' },
  { id: 'contact-b5', name: 'Manoj Tiwari', role: 'Conductor', phone: '+919814099001' },
  { id: 'contact-b6', name: 'Arvind Mehta', role: 'Conductor', phone: '+919815011223' },
  { id: 'contact-admin-1', name: 'Sunita Rao (School Admin)', role: 'School Admin', phone: '+919900011122' },
  { id: 'contact-admin-2', name: 'Rajeev Bhatia (School Admin)', role: 'School Admin', phone: '+919900022233' },
];

export const useGatemanStore = create<GatemanV2State>((set, get) => ({
  buses: BUSES,
  students: STUDENTS,
  gateEntries: GATE_ENTRIES,
  earlyPickups: EARLY_PICKUPS,
  routingRequests: ROUTING_REQUESTS,
  notifications: NOTIFICATIONS,
  shiftLog: SHIFT_LOG,
  contacts: CONTACTS,
  gateLockedDown: false,

  fleet: INITIAL_FLEET,
  profileApprovals: INITIAL_APPROVALS,
  editRequests: INITIAL_EDITS,
  geofenceAlerts: INITIAL_ALERTS,
  roster: INITIAL_ROSTER,
  directory: INITIAL_DIRECTORY,
  modificationRequests: [],

  markNotifRead: (id) =>
    set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) })),

  markAllNotifsRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

  verifyPickup: (id) => {
    const pickup = get().earlyPickups.find((p) => p.id === id);
    if (!pickup) return;
    set((s) => ({
      earlyPickups: s.earlyPickups.map((p) => p.id === id ? { ...p, status: 'Verified', verifiedAt: new Date().toISOString() } : p),
      gateEntries: [{ id: `ge-${Date.now()}`, studentName: pickup.studentName, studentId: pickup.studentId, type: 'Departure', method: 'Parent Pickup', time: new Date().toISOString(), authorizedBy: 'Gateman' }, ...s.gateEntries],
      shiftLog: [{ id: `sl-${Date.now()}`, action: 'AUTHORIZED', description: `Authorized early pickup for ${pickup.studentName} — Parent: ${pickup.parentName}`, timestamp: new Date().toISOString() }, ...s.shiftLog],
    }));
  },

  denyPickup: (id) => {
    const pickup = get().earlyPickups.find((p) => p.id === id);
    if (!pickup) return;
    set((s) => ({
      earlyPickups: s.earlyPickups.map((p) => p.id === id ? { ...p, status: 'Denied' } : p),
      shiftLog: [{ id: `sl-${Date.now()}`, action: 'DENIED', description: `Denied early pickup for ${pickup.studentName}`, timestamp: new Date().toISOString() }, ...s.shiftLog],
    }));
  },

  approveRequest: (id) => {
    const req = get().routingRequests.find((r) => r.id === id);
    if (!req) return;
    set((s) => ({
      routingRequests: s.routingRequests.map((r) => r.id === id ? { ...r, status: 'Approved' } : r),
      shiftLog: [{ id: `sl-${Date.now()}`, action: 'APPROVED', description: `Approved ${req.requestType} for ${req.studentName}`, timestamp: new Date().toISOString() }, ...s.shiftLog],
    }));
  },

  rejectRequest: (id) => {
    const req = get().routingRequests.find((r) => r.id === id);
    if (!req) return;
    set((s) => ({
      routingRequests: s.routingRequests.map((r) => r.id === id ? { ...r, status: 'Rejected' } : r),
      shiftLog: [{ id: `sl-${Date.now()}`, action: 'REJECTED', description: `Rejected ${req.requestType} for ${req.studentName}`, timestamp: new Date().toISOString() }, ...s.shiftLog],
    }));
  },

  toggleGateLock: () =>
    set((s) => ({ gateLockedDown: !s.gateLockedDown })),

  addShiftLog: (entry) =>
    set((s) => ({ shiftLog: [{ ...entry, id: `sl-${Date.now()}`, timestamp: new Date().toISOString() }, ...s.shiftLog] })),

  forceBusOffline: (busId) => {
    const bus = get().buses.find((b) => b.id === busId);
    if (!bus) return;
    set((s) => ({
      buses: s.buses.map((b) => b.id === busId ? { ...b, status: 'Offline' } : b),
      fleet: s.fleet.map((b) => b.id === busId ? { ...b, status: 'Offline' } : b),
      shiftLog: [{ id: `sl-${Date.now()}`, action: 'BUS_OFFLINE', description: `Forced ${bus.busNumber} offline`, timestamp: new Date().toISOString() }, ...s.shiftLog],
    }));
  },

  pingConductor: (busId) => {
    const bus = get().buses.find((b) => b.id === busId);
    if (!bus) return;
    set((s) => ({ shiftLog: [{ id: `sl-${Date.now()}`, action: 'OVERRIDE', description: `Pinged conductor ${bus.conductorName} on ${bus.busNumber}`, timestamp: new Date().toISOString() }, ...s.shiftLog] }));
  },

  approveProfile: (id) =>
    set((state) => ({ profileApprovals: state.profileApprovals.filter((item) => item.id !== id) })),
  rejectProfile: (id) =>
    set((state) => ({ profileApprovals: state.profileApprovals.filter((item) => item.id !== id) })),
  resubmitProfile: (id) =>
    set((state) => ({ profileApprovals: state.profileApprovals.filter((item) => item.id !== id) })),

  approveEdit: (id) => set((state) => ({ editRequests: state.editRequests.filter((item) => item.id !== id) })),
  rejectEdit: (id) => set((state) => ({ editRequests: state.editRequests.filter((item) => item.id !== id) })),

  resolveGeofenceAlert: (id) =>
    set((state) => ({ geofenceAlerts: state.geofenceAlerts.filter((item) => item.id !== id) })),

  updateAttendanceStatus: (rosterId, status) =>
    set((state) => ({
      roster: state.roster.map((entry) =>
        entry.id === rosterId
          ? { ...entry, attendanceStatus: status, statusUpdatedAt: new Date().toISOString() }
          : entry,
      ),
    })),

  submitModificationRequest: (text) =>
    set((state) => ({ modificationRequests: [...state.modificationRequests, text] })),
}));
