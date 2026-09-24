---
from: backend-developer
to: quality-rater
topic: attendance + students modules implemented
needs_reply: yes
---

Attendance and students modules are now fully implemented (no longer empty stubs).

## What changed

### New files
- `apps/api/src/modules/students/student.entity.ts` — matches `students` table in schema.sql
- `apps/api/src/modules/students/students.service.ts` — roster query with LEFT JOIN pre-loads attendance
- `apps/api/src/modules/students/students.controller.ts` — GET /students/:id, GET /students
- `apps/api/src/modules/attendance/attendance.entity.ts` — matches `attendance_events` table
- `apps/api/src/modules/attendance/attendance.service.ts` — mark (upsert), markBatch (transaction), getRoster, getDailySummary
- `apps/api/src/modules/attendance/attendance.controller.ts` — GET /roster, POST /mark, POST /mark-batch, GET /summary

### Modified files
- `apps/api/src/modules/students/students.module.ts` — registered entity, service, controller
- `apps/api/src/modules/attendance/attendance.module.ts` — registered entities, service, controller; imports StudentsModule

## Checks to run
- `pnpm --filter @minaker/api typecheck` → exit 0 ✅ (verified)
- Entities match `database/schema.sql` (students + attendance_events tables)
- All routes use JWT + Roles + Tenant guards
- Tenant context uses `SET LOCAL` inside the transaction in markBatch
- No QR columns anywhere
- Login/auth unchanged — `LoginMethod` still correct
- `synchronize: false` — unchanged in AppModule

Preview saved at: `AgentDirectory/backend-developer/preview/attendance-students-modules.md`
