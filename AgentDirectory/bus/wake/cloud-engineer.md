---
role: cloud-engineer
status: pending
updated: 2026-09-25T10:42:23.034Z
source: supervisor
---

paths:
- docker-compose.override.yml
- infra/docker/mosquitto/mosquitto.conf
- infra/docker/mosquitto/mosquitto.dev.conf
- infra/terraform/oracle/outputs.tf
- infra/terraform/oracle/main.tf
- .github/workflows/ci.yml
- infra/terraform/oracle/variables.tf
- docker-compose.yml

Follow agents/cloud-engineer.md and AgentDirectory/cloud-engineer/standards.md.
Save web research in AgentDirectory/cloud-engineer/research/ and the chosen approach in AgentDirectory/cloud-engineer/preview/.
You may edit any file under the repository root except paths another session already changed.
When the root work for these paths is finished, set status to done in this file.
If this role changed product files, write AgentDirectory/bus/messages/ to quality-rater with needs_reply: yes.
