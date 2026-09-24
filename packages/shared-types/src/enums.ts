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
  STARTER = 'starter',       // Up to 500 students, 5 buses
  GROWTH = 'growth',         // Up to 2000 students, 20 buses
  ENTERPRISE = 'enterprise', // Unlimited
}

export enum TenantStatus {
  TRIAL = 'trial',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

// ─── User ─────────────────────────────────────────────────────────────────────
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

/**
 * How a user authenticates — depends on their role.
 *
 * Parent        → PARENT_ID_OTP   (Parent UID + phone OTP)
 * Conductor     → EMPLOYEE_PIN    (Employee ID + 4–6 digit PIN)
 * Gatekeeper    → EMPLOYEE_PIN    (Employee ID + PIN — no SIM required)
 * School Admin  → PHONE_OTP       (Phone + OTP)
 * Teacher       → PHONE_OTP       (Phone + OTP)
 */
export enum LoginMethod {
  PHONE_OTP = 'phone_otp',
  EMPLOYEE_PIN = 'employee_pin',
  PARENT_ID_OTP = 'parent_id_otp',
}

// ─── Student ──────────────────────────────────────────────────────────────────
export enum StudentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  GRADUATED = 'graduated',
}

// ─── Attendance ───────────────────────────────────────────────────────────────
/**
 * How attendance is recorded — manually from a student roster list.
 * All marks are made by a human (gatekeeper or conductor) tapping a name.
 */
export enum AttendanceType {
  SCHOOL_ENTRY = 'school_entry',     // Gatekeeper: student entered campus
  SCHOOL_EXIT = 'school_exit',       // Gatekeeper: student left campus
  BUS_BOARDING = 'bus_boarding',     // Conductor: student boarded bus
  BUS_ALIGHTING = 'bus_alighting',   // Conductor: student alighted from bus
  ABSENT = 'absent',                 // Explicitly marked absent
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
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

// ─── Mobile App Portal ────────────────────────────────────────────────────────
/**
 * Determines which portal/navigation tree is shown in the single unified app.
 * Maps directly to UserRole — separated to make the mobile routing intent clear.
 */
export enum AppPortal {
  PARENT = 'parent',
  GATEKEEPER = 'gatekeeper',
  CONDUCTOR = 'conductor',
  SCHOOL_ADMIN = 'school_admin',
}
