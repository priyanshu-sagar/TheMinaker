---
role: backend-developer
status: done
updated: 2026-09-24T20:47:11.389Z
source: supervisor
---

paths:
- apps/api/src/modules/attendance/attendance.module.ts
- apps/api/src/modules/attendance/attendance.entity.ts
- apps/api/src/modules/attendance/attendance.service.ts
- apps/api/src/modules/attendance/attendance.controller.ts
- apps/api/src/modules/students/students.module.ts
- apps/api/src/modules/students/student.entity.ts
- apps/api/src/modules/students/students.service.ts
- apps/api/src/modules/students/students.controller.ts
- Table: students (tenant_id, roll_number, full_name, class_section,
- Table: attendance_events (tenant_id, student_id, marked_by,
- No QR columns. No synchronize.
- All routes use JWT + Roles + Tenant guards.
- Tenant context is SET LOCAL inside the transaction.
- Mark endpoint must enforce the unique constraint
- Batch endpoint accepts up to 200 marks in one call.

Follow agents/backend-developer.md and AgentDirectory/backend-developer/standards.md.
Save web research in AgentDirectory/backend-developer/research/ and the chosen approach in AgentDirectory/backend-developer/preview/.
You may edit any file under the repository root except paths another session already changed.
When the root work for these paths is finished, set status to done in this file.
If this role changed product files, write AgentDirectory/bus/messages/ to quality-rater with needs_reply: yes.
