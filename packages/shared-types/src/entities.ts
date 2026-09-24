import {
  AttendanceStatus,
  BusStatus,
  NotificationChannel,
  NotificationType,
  ScanType,
  StudentStatus,
  TenantPlan,
  TenantStatus,
  TripStatus,
  TripType,
  UserRole,
  UserStatus,
} from './enums';

// ─── Base ─────────────────────────────────────────────────────────────────────
export interface BaseEntity {
  id: string;
  createdAt: string; // ISO 8601
  updatedAt: string;
}

// ─── Tenant ───────────────────────────────────────────────────────────────────
export interface Tenant extends BaseEntity {
  name: string;
  slug: string;
  plan: TenantPlan;
  status: TenantStatus;
  dpdpRegion: string;
  logoUrl?: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────
export interface User extends BaseEntity {
  tenantId: string;
  role: UserRole;
  fullName: string;
  email?: string;
  phone?: string;
  fcmToken?: string;
  status: UserStatus;
}

export interface AuthUser {
  id: string;
  tenantId: string;
  role: UserRole;
}

// ─── Student ──────────────────────────────────────────────────────────────────
export interface Student extends BaseEntity {
  tenantId: string;
  rollNumber: string;
  fullName: string;
  classSection: string;
  parentUserId?: string;
  qrCodePayload: string;
  photoUrl?: string;
  busRouteId?: string;
  status: StudentStatus;
}

// ─── Routes & Buses ───────────────────────────────────────────────────────────
export interface RouteStop {
  name: string;
  lat: number;
  lng: number;
  order: number;
  estimatedMinutesFromStart?: number;
}

export interface Route extends BaseEntity {
  tenantId: string;
  name: string;
  stops: RouteStop[];
  status: string;
}

export interface Bus extends BaseEntity {
  tenantId: string;
  numberPlate: string;
  routeId?: string;
  conductorId?: string;
  capacity: number;
  status: BusStatus;
}

// ─── Trip ─────────────────────────────────────────────────────────────────────
export interface Trip extends BaseEntity {
  tenantId: string;
  busId: string;
  routeId: string;
  conductorId: string;
  tripType: TripType;
  status: TripStatus;
  startedAt?: string;
  completedAt?: string;
}

// ─── GPS Telemetry ────────────────────────────────────────────────────────────
export interface GpsTelemetryPoint {
  time: string;
  tenantId: string;
  busId: string;
  conductorId: string;
  lat: number;
  lng: number;
  speedKmh?: number;
  heading?: number;
  accuracyM?: number;
  batteryPct?: number;
}

export interface BusLastPosition {
  busId: string;
  numberPlate: string;
  lat: number;
  lng: number;
  speedKmh: number;
  heading: number;
  updatedAt: string;
  tripId?: string;
  tripStatus?: TripStatus;
}

// ─── Attendance ───────────────────────────────────────────────────────────────
export interface AttendanceEvent extends BaseEntity {
  tenantId: string;
  studentId: string;
  scannedBy: string;
  scanType: ScanType;
  scannedAt: string;
  gateLocation?: string;
  photoUrl?: string;
}

export interface DailyAttendanceSummary {
  date: string;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  byClass: Record<string, { present: number; absent: number; total: number }>;
}

// ─── Notifications ────────────────────────────────────────────────────────────
export interface Notification extends BaseEntity {
  tenantId: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  channel: NotificationChannel;
  sentAt?: string;
  readAt?: string;
}

// ─── Billing (Phase 1: manual) ───────────────────────────────────────────────
export interface TenantBillingInfo {
  tenantId: string;
  plan: TenantPlan;
  studentCount: number;
  busCount: number;
  monthlyAmountInr: number;
  nextBillingDate: string;
  status: 'paid' | 'overdue' | 'trial';
}
