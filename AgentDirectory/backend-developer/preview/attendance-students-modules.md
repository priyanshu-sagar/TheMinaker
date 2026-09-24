# Backend Developer Preview — Attendance + Students Modules

**Date:** 2026-09-25  
**Wake ticket:** `AgentDirectory/bus/wake/backend-developer.md`  
**Status:** executing

---

## What will change in the root

### New files
| File | Purpose |
|---|---|
| `apps/api/src/modules/students/student.entity.ts` | TypeORM entity matching `students` table |
| `apps/api/src/modules/students/students.service.ts` | `findByTenant`, `getRosterWithAttendance` |
| `apps/api/src/modules/students/students.controller.ts` | `GET /students` |
| `apps/api/src/modules/attendance/attendance.entity.ts` | TypeORM entity matching `attendance_events` |
| `apps/api/src/modules/attendance/attendance.service.ts` | `getRoster`, `mark`, `markBatch` |
| `apps/api/src/modules/attendance/attendance.controller.ts` | `GET /roster`, `POST /mark`, `POST /mark-batch` |

### Modified files
| File | Change |
|---|---|
| `apps/api/src/modules/students/students.module.ts` | Register entity, service, controller |
| `apps/api/src/modules/attendance/attendance.module.ts` | Register entities, service, controller; import StudentsModule |

---

## Key design decisions

### Roster endpoint — single query with LEFT JOIN
Rather than two round trips (fetch students, then fetch today's attendance),
one query with a LEFT JOIN on `attendance_events` for today's date returns
`StudentWithAttendance[]` in one call. The mobile app renders immediately.

### Mark endpoint — INSERT ... ON CONFLICT DO UPDATE
Schema has `UNIQUE (student_id, attendance_type, marked_date)`.
An upsert (`INSERT ... ON CONFLICT (student_id, attendance_type, marked_date) DO UPDATE SET status = EXCLUDED.status, marked_by = EXCLUDED.marked_by`)
handles the gatekeeper tapping a student multiple times (toggle) without
throwing a conflict error.

### Tenant isolation
All queries filter by `tenant_id` extracted from the JWT (via `@TenantId()` decorator).
`SET LOCAL app.current_tenant_id` is set by `TenantGuard` before the query runs.

### Batch endpoint — max 200 marks
Validated with `@ArrayMaxSize(200)`. Runs marks in a single transaction.

---

## Why this is the best option
- No N+1: roster + attendance in one SQL join
- Upsert handles toggle idempotently — same result whether called once or 10 times
- Batch reduces mobile → server round trips during busy morning arrival
- Matches `StudentWithAttendance` type exactly — mobile needs no adapter
