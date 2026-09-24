import { AttendanceStatus, AttendanceType, TripStatus } from './enums.js';
import { BusLastPosition, GpsTelemetryPoint, StudentWithAttendance } from './entities.js';

// ─── MQTT Events (conductor → broker → NestJS) ───────────────────────────────

/** Published by conductor app every 5 seconds during active trip */
export interface MqttLocationPayload {
  busId: string;
  tenantId: string;
  conductorId: string;
  tripId: string;
  lat: number;
  lng: number;
  speedKmh: number;
  heading: number;
  accuracyM: number;
  batteryPct: number;
  ts: number; // Unix timestamp ms
}

/** Published when conductor starts or ends a trip */
export interface MqttTripEventPayload {
  tripId: string;
  busId: string;
  tenantId: string;
  conductorId: string;
  event: 'trip_started' | 'trip_completed' | 'trip_cancelled';
  ts: number;
}

/**
 * Published when conductor marks a student boarding or alighting.
 * No QR — studentId is from the roster list tap.
 */
export interface MqttBoardingPayload {
  busId: string;
  tenantId: string;
  tripId: string;
  studentId: string;
  conductorId: string;
  attendanceType: AttendanceType.BUS_BOARDING | AttendanceType.BUS_ALIGHTING;
  status: AttendanceStatus;
  ts: number;
}

// ─── MQTT Topic Patterns ─────────────────────────────────────────────────────
export const MQTT_TOPICS = {
  busLocation: (tenantId: string, busId: string) =>
    `minaker/${tenantId}/bus/${busId}/location`,
  tripEvent: (tenantId: string, busId: string) =>
    `minaker/${tenantId}/bus/${busId}/trip`,
  boarding: (tenantId: string, busId: string) =>
    `minaker/${tenantId}/bus/${busId}/boarding`,
  // Wildcard subscriptions for NestJS server
  allLocations: (tenantId: string) => `minaker/${tenantId}/bus/+/location`,
  allBusEvents: (tenantId: string) => `minaker/${tenantId}/bus/#`,
} as const;

// ─── WebSocket Events (NestJS → client browsers & mobile apps) ───────────────

/** Emitted to parent's socket room when bus position updates */
export interface WsBusLocationUpdate {
  event: 'bus:location_updated';
  data: BusLastPosition;
}

/** Emitted when trip status changes */
export interface WsTripStatusUpdate {
  event: 'trip:status_changed';
  data: {
    tripId: string;
    busId: string;
    status: TripStatus;
    eta?: string; // ISO 8601 estimated arrival at next stop
  };
}

/**
 * Emitted to parent when their child's attendance is marked.
 * Replaces the old "student:scanned" event — no scanning anymore.
 */
export interface WsAttendanceMarked {
  event: 'attendance:marked';
  data: {
    studentId: string;
    studentName: string;
    attendanceType: AttendanceType;
    status: AttendanceStatus;
    markedAt: string;
    gateLocation?: string;
  };
}

/**
 * Emitted to school admin dashboard when aggregate attendance changes.
 * Used to update the live summary card without polling.
 */
export interface WsAttendanceSummaryUpdate {
  event: 'attendance:summary_updated';
  data: {
    date: string;
    classSection?: string;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    totalCount: number;
  };
}

/**
 * Emitted to gatekeeper app when another device marks the same student.
 * Keeps multiple devices at the same gate in sync.
 */
export interface WsStudentMarkedByOther {
  event: 'attendance:student_updated';
  data: StudentWithAttendance;
}

// ─── WebSocket Namespaces & Room Conventions ─────────────────────────────────
export const WS_NAMESPACES = {
  TRACKING: '/tracking',   // GPS bus tracking → parents
  SCHOOL: '/school',       // Attendance & admin events
  ADMIN: '/admin',         // Super-admin SaaS events
} as const;

export const WS_ROOMS = {
  parent: (userId: string) => `user:${userId}`,
  bus: (busId: string) => `bus:${busId}`,
  school: (tenantId: string) => `school:${tenantId}`,
  class: (tenantId: string, classSection: string) =>
    `class:${tenantId}:${classSection}`,
  gate: (tenantId: string) => `gate:${tenantId}`,
} as const;

// ─── API Response Wrappers ────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
  path: string;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ─── Re-exports ───────────────────────────────────────────────────────────────
export type { GpsTelemetryPoint };
