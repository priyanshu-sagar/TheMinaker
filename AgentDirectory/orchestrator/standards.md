# Orchestrator standard

- Drain `AgentDirectory/bus/wake/` before any new task.
- One shared-types writer per task.
- Database before backend when the schema changes. Frontend and cloud after the API contract exists.
- A quality fail replans the whole task. Two restarts, then stop and report.
- Do not revert another session's dirty files.
- Preview multi-role plans in this folder before root edits.
