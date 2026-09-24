// ─── Roles ────────────────────────────────────────────────────────────────────
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  SCHOOL_ADMIN = 'school_admin',
  TEACHER = 'teacher',
  CONDUCTOR = 'conductor',
  GATEKEEPER = 'gatekeeper',
  PARENT = 'parent',
}

// ─── Tenant / Plan ────────────────────────────────────────────────────────────
export enum TenantPlan {
  STARTER = 'starter',      // Up to 500 students, 5 buses
  GROWTH = 'growth',        // Up to 2000 students, 20 buses
  ENTERPRISE = 'enterprise', // Unlimited
}

export enum TenantStatus {
  TRIAL = 'trial',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

// ─── User / Auth ──────────────────────────────────────────────────────────────
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

// ─── Student ──────────────────────────────────────────────────────────────────
export enum StudentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  GRADUATED = 'graduated',
}

// ─── Attendance ───────────────────────────────────────────────────────────────
export enum ScanType {
  ENTRY = 'entry',
  EXIT = 'exit',
  BUS_BOARDING = 'bus_boarding',
  BUS_ALIGHTING = 'bus_alighting',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  HALF_DAY = 'half_day',
}

// ─── Fleet ────────────────────────────────────────────────────────────────────
export enum BusStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

export enum TripType {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  CUSTOM = 'custom',
}

export enum TripStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// ─── Notifications ────────────────────────────────────────────────────────────
export enum NotificationType {
  STUDENT_ARRIVED = 'student_arrived',
  STUDENT_DEPARTED = 'student_departed',
  BUS_ARRIVING = 'bus_arriving',
  BUS_DELAYED = 'bus_delayed',
  ATTENDANCE_MARKED = 'attendance_marked',
  REPORT_READY = 'report_ready',
}

export enum NotificationChannel {
  FCM = 'fcm',
  SMS = 'sms',
  IN_APP = 'in_app',
}
