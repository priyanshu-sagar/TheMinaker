import {
  AttendanceStatus,
  AttendanceType,
  BusStatus,
  LoginMethod,
  NotificationChannel,
  NotificationType,
  StudentStatus,
  TenantPlan,
  TenantStatus,
  TripStatus,
  TripType,
  UserRole,
  UserStatus,
} from './enums.js';

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
  maxStudents: number;
  maxBuses: number;
}

// ─── User ─────────────────────────────────────────────────────────────────────
export interface User extends BaseEntity {
  tenantId: string;
  role: UserRole;
  fullName: string;
  email?: string;
  phone?: string;
  employeeId?: string;  // Conductor / Gatekeeper
  parentUid?: string;   // Parent — printed on school letter (e.g. "DPS-P-00123")
  fcmToken?: string;
  status: UserStatus;
  lastLoginAt?: string;
}

export interface AuthUser {
  id: string;
  tenantId: string;
  role: UserRole;
}

// ─── Auth — Multi-credential login ───────────────────────────────────────────

/**
 * Login payload varies by role:
 *
 * Parent:         { role: 'parent',     identifier: parentUid,    credential: otp }
 * Gatekeeper:     { role: 'gatekeeper', identifier: employeeId,   credential: pin }
 * Conductor:      { role: 'conductor',  identifier: employeeId,   credential: pin }
 * School Admin:   { role: 'school_admin', identifier: phone,      credential: otp }
 * Teacher:        { role: 'teacher',    identifier: phone,        credential: otp }
 */
export interface LoginRequest {
  role: UserRole;
  tenantSlug: string;    // School slug — user selects school first
  identifier: string;    // parentUid | employeeId | phone
  credential: string;    // OTP | PIN
  loginMethod: LoginMethod;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface SendOtpRequest {
  phone?: string;
  parentUid?: string;   // Parent: OTP sent to the registered phone on file
  tenantSlug: string;
}

// ─── Student ──────────────────────────────────────────────────────────────────
/**
 * No QR code. Students are identified by roll number or full name search
 * in the gatekeeper/conductor roster list.
 */
export interface Student extends BaseEntity {
  tenantId: string;
  rollNumber: string;
  studentUid?: string;         // Optional human-readable short ID for reports
  fullName: string;
  classSection: string;        // e.g. "10-A"
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  parentUserId?: string;
  photoUrl?: string;
  busRouteId?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  status: StudentStatus;
}

/**
 * Student with today's attendance status — used in gatekeeper/conductor list view.
 * The API pre-loads today's attendance so the app doesn't need a second request.
 */
export interface StudentWithAttendance extends Student {
  todayStatus?: AttendanceStatus;
  todayAttendanceType?: AttendanceType;
  markedAt?: string;
}

// ─── Gatekeeper Session ───────────────────────────────────────────────────────
export interface GatekeeperSessionSummary {
  date: string;
  mode: AttendanceType.SCHOOL_ENTRY | AttendanceType.SCHOOL_EXIT;
  classFilter?: string;
  totalStudents: number;
  markedPresent: number;
  markedAbsent: number;
  markedLate: number;
  unmarked: number;
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
  polyline?: string;
  status: 'active' | 'inactive';
}

export interface Bus extends BaseEntity {
  tenantId: string;
  numberPlate: string;
  makeModel?: string;
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
  studentCount: number;
}

// ─── GPS Telemetry ────────────────────────────────────────────────────────────
export interface GpsTelemetryPoint {
  time: string;
  tenantId: string;
  busId: string;
  conductorId: string;
  tripId?: string;
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

// ─── Attendance Events ────────────────────────────────────────────────────────
/**
 * Created when a gatekeeper or conductor marks a student.
 * No QR scan — manual tap/toggle from student roster.
 */
export interface AttendanceEvent extends BaseEntity {
  tenantId: string;
  studentId: string;
  studentName: string;      // Denormalized — avoids extra join on list render
  markedBy: string;         // User ID of gatekeeper or conductor
  tripId?: string;          // Present only for bus attendance events
  attendanceType: AttendanceType;
  status: AttendanceStatus;
  markedAt: string;
  gateLocation?: string;    // e.g. "Main Gate"
  notes?: string;
}

/** Payload to mark a single student */
export interface MarkAttendanceRequest {
  studentId: string;
  attendanceType: AttendanceType;
  status: AttendanceStatus;
  tripId?: string;
  gateLocation?: string;
  notes?: string;
}

/** Payload to mark multiple students at once (batch submit at session end) */
export interface MarkAttendanceBatchRequest {
  marks: Array<{
    studentId: string;
    status: AttendanceStatus;
    attendanceType: AttendanceType;
    notes?: string;
  }>;
  attendanceType: AttendanceType;
  tripId?: string;
  gateLocation?: string;
}

export interface DailyAttendanceSummary {
  date: string;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  unmarked: number;
  byClass: Record<string, {
    present: number;
    absent: number;
    late: number;
    total: number;
  }>;
}

// ─── Notifications ────────────────────────────────────────────────────────────
export interface Notification extends BaseEntity {
  tenantId: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  channel: NotificationChannel;
  sentAt?: string;
  readAt?: string;
}

// ─── Billing ──────────────────────────────────────────────────────────────────
export interface TenantBillingInfo {
  tenantId: string;
  plan: TenantPlan;
  studentCount: number;
  busCount: number;
  monthlyAmountInr: number;
  nextBillingDate: string;
  status: 'paid' | 'overdue' | 'trial';
}
