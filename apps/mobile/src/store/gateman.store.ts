import { create } from 'zustand';

/**
 * Local mock database for the Gateman portal. Every array here stands in
 * for a future NestJS response — actions only filter/update these arrays,
 * matching the "frontend only, mocked data" directive for this pass.
 */

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

// ─── Mock data — Delhi-NCR, Agra, and Mathura region ──────────────────────────

const INITIAL_FLEET: FleetBus[] = [
  { id: 'bus-1', busNumber: 'DL-1PC-4521', routeName: 'Gurugram Sector 45 Loop', conductorName: 'Ramesh Yadav', conductorPhone: '+919810022334', status: 'Online', coordinates: { lat: 28.4595, lng: 77.0266 } },
  { id: 'bus-2', busNumber: 'UP-80-BT-3312', routeName: 'Agra Cantt – Sadar Route', conductorName: 'Suresh Kumar', conductorPhone: '+919811044556', status: 'Online', coordinates: { lat: 27.1767, lng: 78.0081 } },
  { id: 'bus-3', busNumber: 'UP-85-CN-1187', routeName: 'Mathura Junction – Vrindavan Route', conductorName: 'Deepak Chaudhary', conductorPhone: '+919812066778', status: 'Offline', coordinates: { lat: 27.4924, lng: 77.6737 } },
  { id: 'bus-4', busNumber: 'DL-1PB-9087', routeName: 'Noida Sector 62 Express', conductorName: 'Vikram Singh', conductorPhone: '+919813088990', status: 'Online', coordinates: { lat: 28.5355, lng: 77.391 } },
  { id: 'bus-5', busNumber: 'HR-51-DE-2245', routeName: 'Faridabad NIT Route', conductorName: 'Manoj Tiwari', conductorPhone: '+919814099001', status: 'Offline', coordinates: { lat: 28.4089, lng: 77.3178 } },
  { id: 'bus-6', busNumber: 'DL-1RT-7734', routeName: 'South Delhi Ring Route', conductorName: 'Arvind Mehta', conductorPhone: '+919815011223', status: 'Online', coordinates: { lat: 28.6139, lng: 77.209 } },
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
    timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    stopCoordinates: { lat: 27.1767, lng: 78.0081 },
    pingedCoordinates: { lat: 27.1822, lng: 78.0134 },
  },
  {
    id: 'alert-2',
    conductorName: 'Deepak Chaudhary',
    studentName: 'Kabir Chaudhary',
    distanceAwayM: 1180,
    timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    stopCoordinates: { lat: 27.4924, lng: 77.6737 },
    pingedCoordinates: { lat: 27.5041, lng: 77.6602 },
  },
];

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

const INITIAL_ROSTER: RosterEntry[] = [
  { id: 'roster-1', busId: 'bus-1', studentName: 'Aarav Sharma', attendanceStatus: 'Boarded', statusUpdatedAt: minutesAgo(45) },
  { id: 'roster-2', busId: 'bus-1', studentName: 'Sanya Malhotra', attendanceStatus: 'Pending' },
  { id: 'roster-3', busId: 'bus-1', studentName: 'Riya Kapoor', attendanceStatus: 'Dropped', statusUpdatedAt: minutesAgo(10) },
  { id: 'roster-4', busId: 'bus-1', studentName: 'Arjun Nair', attendanceStatus: 'Absent' },
  { id: 'roster-5', busId: 'bus-2', studentName: 'Ishita Verma', attendanceStatus: 'Boarded', statusUpdatedAt: minutesAgo(30) },
  { id: 'roster-6', busId: 'bus-2', studentName: 'Dev Agarwal', attendanceStatus: 'Checked Out', statusUpdatedAt: minutesAgo(5) },
  { id: 'roster-7', busId: 'bus-2', studentName: 'Meher Kapoor', attendanceStatus: 'Absent' },
  { id: 'roster-8', busId: 'bus-3', studentName: 'Kabir Chaudhary', attendanceStatus: 'Pending' },
  { id: 'roster-9', busId: 'bus-3', studentName: 'Ananya Gupta', attendanceStatus: 'Pending' },
  { id: 'roster-10', busId: 'bus-4', studentName: 'Vivaan Nair', attendanceStatus: 'Boarded', statusUpdatedAt: minutesAgo(50) },
];

const INITIAL_DIRECTORY: DirectoryContact[] = [
  ...INITIAL_FLEET.map((bus) => ({
    id: `contact-${bus.id}`,
    name: bus.conductorName,
    role: 'Conductor' as const,
    phone: bus.conductorPhone,
  })),
  { id: 'contact-admin-1', name: 'Sunita Rao (School Admin)', role: 'School Admin', phone: '+919900011122' },
  { id: 'contact-admin-2', name: 'Rajeev Bhatia (School Admin)', role: 'School Admin', phone: '+919900022233' },
];

interface GatemanState {
  fleet: FleetBus[];
  profileApprovals: ProfileApproval[];
  editRequests: EditRequest[];
  geofenceAlerts: GeofenceAlert[];
  roster: RosterEntry[];
  directory: DirectoryContact[];
  modificationRequests: string[];

  approveProfile: (id: string) => void;
  rejectProfile: (id: string) => void;
  resubmitProfile: (id: string) => void;
  approveEdit: (id: string) => void;
  rejectEdit: (id: string) => void;
  resolveGeofenceAlert: (id: string) => void;
  updateAttendanceStatus: (rosterId: string, status: AttendanceStatus) => void;
  submitModificationRequest: (text: string) => void;
}

export const useGatemanStore = create<GatemanState>((set) => ({
  fleet: INITIAL_FLEET,
  profileApprovals: INITIAL_APPROVALS,
  editRequests: INITIAL_EDITS,
  geofenceAlerts: INITIAL_ALERTS,
  roster: INITIAL_ROSTER,
  directory: INITIAL_DIRECTORY,
  modificationRequests: [],

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

export function getBusStats(roster: RosterEntry[], busId: string): BusStats {
  const rows = roster.filter((entry) => entry.busId === busId);
  return {
    totalStudents: rows.length,
    boardedIn: rows.filter((entry) => entry.attendanceStatus === 'Boarded').length,
    droppedOut: rows.filter((entry) => entry.attendanceStatus === 'Dropped' || entry.attendanceStatus === 'Checked Out').length,
    absent: rows.filter((entry) => entry.attendanceStatus === 'Absent').length,
  };
}
