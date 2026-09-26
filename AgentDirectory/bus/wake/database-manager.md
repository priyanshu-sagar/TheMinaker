---
role: database-manager
status: pending
updated: 2026-09-26T08:25:48.498Z
source: supervisor
---

paths:
- database/pg_hba.conf
- database/seeds/001-demo-schools.sql

Follow agents/database-manager.md and AgentDirectory/database-manager/standards.md.
Save web research in AgentDirectory/database-manager/research/ and the chosen approach in AgentDirectory/database-manager/preview/.
You may edit any file under the repository root except paths another session already changed.
When the root work for these paths is finished, set status to done in this file.
If this role changed product files, write AgentDirectory/bus/messages/ to quality-rater with needs_reply: yes.
