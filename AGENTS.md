# TheMinaker agent pipeline

Any coding CLI in this repository follows this file. Cursor, Antigravity, Claude Code, Codex, and others use the same role prompts in `agents/` and the same folders in `AgentDirectory/`.

The product is a hardware-free, multi-tenant school bus and attendance SaaS for India. Demo hosting is Oracle Cloud Always Free in Mumbai (`ap-mumbai-1`). AWS Mumbai (`ap-south-1`) waits until a human explicitly starts that migration.

## First action every turn

1. Read every file in `AgentDirectory/bus/wake/` whose `status` is `pending`.
2. Read new files in `AgentDirectory/bus/messages/` addressed to the role you are running, or to `all`.
3. Run each pending role before starting unrelated work. Open `agents/<role>.md` and `AgentDirectory/<role>/standards.md`.

Cursor also does this from hooks: a save writes a wake ticket, and a stop with tickets still pending continues the session. Other CLIs get the same tickets from `node AgentDirectory/supervisor.js`.

Start the watcher once from the repo root and leave it running:

```powershell
node AgentDirectory/supervisor.js
```

The watcher only writes tickets. It does not launch a second coding agent.

## Authority

Every role may create, edit, and delete files anywhere under the repository root.

- Save web research in `AgentDirectory/<role>/research/`.
- Save the chosen approach in `AgentDirectory/<role>/preview/` before or as you edit the root.
- Ideas only writes proposals under `AgentDirectory/ideas/`. It does not implement them.
- The quality rater does not patch product code to force a pass. It may write under `AgentDirectory/quality-rater/` and in the message bus.
- Leave files another session already changed. Never revert, stash, or overwrite that work.

## When a specialist is woken

1. Read `AgentDirectory/<role>/standards.md`, the wake ticket, and inbox messages.
2. Search the web before locking a non-obvious NestJS, Next.js, Expo, PostgreSQL, Timescale, MQTT, or Oracle Always Free choice. Save the source URL and the date under `research/`.
3. Write the best approach under `preview/`: what will change in the root, and why it is the best option.
4. If the change needs another role, write a new file in `AgentDirectory/bus/messages/`. Do not edit someone else's message.
5. Edit the repository root until it meets the standard.
6. Set the wake ticket `status` to `done`.
7. If product files changed, message `quality-rater` with `needs_reply: yes`.

A quality `fail` sends the work back to a new plan. The required roles run again, including roles that passed earlier. Two full restarts maximum. A third failure stops and reports the defects.

## How agents talk

Create a new markdown file in `AgentDirectory/bus/messages/`. Do not append to an existing message.

```markdown
---
from: backend-developer
to: database-manager
topic: student roster column
needs_reply: yes
---

Need a nullable `notes` column on students. Schema change belongs to you. Paths: database/schema.sql.
```

`to` is one role name or `all`. A message to a role wakes that role. A message to `all` wakes the orchestrator, who fans it out.

## Roles

| Role | Prompt | Folder |
|---|---|---|
| Orchestrator | [agents/orchestrator.md](agents/orchestrator.md) | [AgentDirectory/orchestrator](AgentDirectory/orchestrator) |
| Ideas | [agents/ideas.md](agents/ideas.md) | [AgentDirectory/ideas](AgentDirectory/ideas) |
| Database manager | [agents/database-manager.md](agents/database-manager.md) | [AgentDirectory/database-manager](AgentDirectory/database-manager) |
| Backend developer | [agents/backend-developer.md](agents/backend-developer.md) | [AgentDirectory/backend-developer](AgentDirectory/backend-developer) |
| Frontend developer | [agents/frontend-developer.md](agents/frontend-developer.md) | [AgentDirectory/frontend-developer](AgentDirectory/frontend-developer) |
| Cloud engineer | [agents/cloud-engineer.md](agents/cloud-engineer.md) | [AgentDirectory/cloud-engineer](AgentDirectory/cloud-engineer) |
| Quality rater | [agents/quality-rater.md](agents/quality-rater.md) | [AgentDirectory/quality-rater](AgentDirectory/quality-rater) |

## Product rules

- `database/schema.sql` wins over `README.md` when they disagree. Attendance is a roster. Do not add student QR codes.
- Roles: `super_admin`, `school_admin`, `teacher`, `conductor`, `gatekeeper`, `parent`. Login methods live in `packages/shared-types/src/enums.ts`.
- School-scoped data needs `tenant_id`, a row-level security policy, and a request guard. Tenant context is `SET LOCAL` inside the transaction.
- TypeORM `synchronize` stays false.
- Demo cloud is Oracle Always Free in India. Both ARM VMs together stay inside 4 OCPUs and 24 GB RAM.
- `DATABASE_URL`, `REDIS_URL`, the MQTT URL, and the object-storage endpoint stay in environment variables.
- Do not commit secrets.
