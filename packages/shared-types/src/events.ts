import { BusLastPosition, GpsTelemetryPoint } from './entities';
import { ScanType, TripStatus } from './enums';

// ─── MQTT Events (conductor → broker → NestJS) ───────────────────────────────

/** Published by conductor app every 5 seconds during active trip */
export interface MqttLocationPayload {
  busId: string;
  tenantId: string;
  conductorId: string;
  lat: number;
  lng: number;
  speedKmh: number;
  heading: number;
  accuracyM: number;
  batteryPct: number;
  ts: number; // Unix timestamp ms
}

/** Published when conductor starts/ends a trip */
export interface MqttTripEventPayload {
  tripId: string;
  busId: string;
  tenantId: string;
  conductorId: string;
  event: 'trip_started' | 'trip_completed' | 'trip_cancelled';
  ts: number;
}

/** Published when conductor marks student boarding/alighting */
export interface MqttBoardingPayload {
  busId: string;
  tenantId: string;
  studentId: string;
  conductorId: string;
  scanType: ScanType.BUS_BOARDING | ScanType.BUS_ALIGHTING;
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
  // Wildcard subscription for NestJS server
  allLocations: (tenantId: string) => `minaker/${tenantId}/bus/+/location`,
  allBusEvents: (tenantId: string) => `minaker/${tenantId}/bus/#`,
} as const;

// ─── WebSocket Events (NestJS → Parent/Admin browser) ───────────────────────

/** NestJS emits this to parent's socket room when bus position updates */
export interface WsBusLocationUpdate {
  event: 'bus:location_updated';
  data: BusLastPosition;
}

/** NestJS emits this when trip status changes */
export interface WsTripStatusUpdate {
  event: 'trip:status_changed';
  data: {
    tripId: string;
    busId: string;
    status: TripStatus;
    eta?: string; // ISO 8601 estimated arrival at next stop
  };
}

/** NestJS emits this to parent when their student is scanned at gate */
export interface WsStudentScanned {
  event: 'student:scanned';
  data: {
    studentId: string;
    studentName: string;
    scanType: ScanType;
    scannedAt: string;
    gateLocation?: string;
  };
}

/** NestJS emits attendance updates to school admin dashboard */
export interface WsAttendanceUpdate {
  event: 'attendance:updated';
  data: {
    date: string;
    classSection?: string;
    presentCount: number;
    absentCount: number;
    totalCount: number;
  };
}

// ─── WebSocket Namespaces & Room Conventions ─────────────────────────────────
export const WS_NAMESPACES = {
  TRACKING: '/tracking',   // Bus GPS tracking → parents
  SCHOOL: '/school',       // Attendance + admin events
  ADMIN: '/admin',         // Super-admin SaaS events
} as const;

export const WS_ROOMS = {
  parent: (userId: string) => `user:${userId}`,
  bus: (busId: string) => `bus:${busId}`,
  school: (tenantId: string) => `school:${tenantId}`,
  class: (tenantId: string, classSection: string) =>
    `class:${tenantId}:${classSection}`,
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

// ─── Re-export from entities and enums for convenience ───────────────────────
export type { GpsTelemetryPoint };
