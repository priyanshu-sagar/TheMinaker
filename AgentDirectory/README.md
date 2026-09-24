# AgentDirectory

Each specialist has a folder for standards, web research, and previews. The bus is how they wake each other.

- `bus/wake/` — one `<role>.md` ticket. `status: pending` means that role must run. The role sets `status: done` when it finishes.
- `bus/messages/` — one file per thought. Never edit a message someone else wrote. Reply with a new file.
- `<role>/research/` — sources and the date, after a web search.
- `<role>/preview/` — the approach that will be applied to the repository root.
- `<role>/inbox/` — optional copies. The bus is the source of truth.

Cursor writes wake tickets from `.cursor/hooks/wake-agents.js`. Other CLIs use `node AgentDirectory/supervisor.js`. The supervisor does not start an LLM.

Protocol: [AGENTS.md](../AGENTS.md).
