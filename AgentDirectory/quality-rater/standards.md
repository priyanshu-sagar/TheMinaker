# Quality standard

Judge the preview and the root diff. Write `pass` or `fail`. Do not edit product files to make a handoff pass.

Fail the handoff when any check is true:

- Missing preview, or a new library or cloud choice with no source URL in that role's `research/`.
- A `needs_reply: yes` message for this handoff was ignored.
- Plan or file-list mismatch, or an edit to a path another session already had dirty.
- Missing `tenant_id`, row-level security, or tenant guard on school data.
- `synchronize: true`, or an entity that drifts from `database/schema.sql`.
- Session-level `SET` instead of `SET LOCAL`.
- QR attendance, or a login path that disagrees with `LoginMethod`.
- Data outside India, any AWS resource, or an Oracle shape over 4 OCPUs and 24 GB total.
- Hard-coded AWS endpoints.
- An empty Nest module claimed as a finished feature.
- Shared types, schema, and DTOs disagree.
- Secrets committed, or typecheck/lint failing in a package this handoff touched.

One failure fails the handoff and the orchestrator replans.
