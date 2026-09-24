#!/usr/bin/env node
/**
 * Writes AgentDirectory wake tickets and Cursor follow-ups.
 * Modes: afterFileEdit | stop | sessionStart | watch --path <rel>
 * Stdout is JSON for Cursor modes. Diagnostics go to stderr.
 */
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const wakeDir = path.join(root, 'AgentDirectory', 'bus', 'wake');
const mode = process.argv[2] || 'afterFileEdit';

function emit(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

function normalize(filePath) {
  if (!filePath) return '';
  let rel = filePath;
  if (path.isAbsolute(filePath)) rel = path.relative(root, filePath);
  return rel.split(path.sep).join('/').replace(/^\.\//, '');
}

function roleForProductPath(rel) {
  if (!rel || rel.startsWith('AgentDirectory/')) return null;
  if (rel.startsWith('.cursor/')) return null;
  if (rel.startsWith('apps/api/') || rel.startsWith('packages/shared-types/')) {
    return 'backend-developer';
  }
  if (rel.startsWith('database/')) return 'database-manager';
  if (
    rel.startsWith('apps/web/') ||
    rel.startsWith('apps/mobile/') ||
    rel.startsWith('packages/ui-kit/')
  ) {
    return 'frontend-developer';
  }
  if (
    rel.startsWith('infra/') ||
    rel.startsWith('.github/') ||
    rel === 'docker-compose.yml' ||
    rel === 'docker-compose.override.yml'
  ) {
    return 'cloud-engineer';
  }
  return null;
}

function readStdin() {
  return new Promise((resolve) => {
    if (mode === 'watch' || process.stdin.isTTY) {
      resolve('');
      return;
    }
    const chunks = [];
    process.stdin.on('data', (chunk) => chunks.push(chunk));
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    process.stdin.on('error', () => resolve(''));
  });
}

function extractPaths(raw) {
  if (!raw || !raw.trim()) return [];
  try {
    const payload = JSON.parse(raw);
    const candidates = [
      payload.file_path,
      payload.filePath,
      payload.path,
      payload.uri,
      payload.file && payload.file.path,
    ];
    if (Array.isArray(payload.file_paths)) candidates.push(...payload.file_paths);
    if (Array.isArray(payload.files)) candidates.push(...payload.files);
    return candidates.filter((value) => typeof value === 'string' && value.length > 0);
  } catch {
    return [];
  }
}

function messageRecipient(rel) {
  if (!rel.startsWith('AgentDirectory/bus/messages/') || !rel.endsWith('.md')) return null;
  const absolute = path.join(root, rel);
  if (!fs.existsSync(absolute)) return null;
  const text = fs.readFileSync(absolute, 'utf8');
  const match = text.match(/^to:\s*([a-z0-9-]+)\s*$/m);
  if (!match) return null;
  const to = match[1];
  if (to === 'all') return 'orchestrator';
  const known = new Set([
    'orchestrator',
    'ideas',
    'database-manager',
    'backend-developer',
    'frontend-developer',
    'cloud-engineer',
    'quality-rater',
  ]);
  return known.has(to) ? to : null;
}

function listPending() {
  if (!fs.existsSync(wakeDir)) return [];
  return fs
    .readdirSync(wakeDir)
    .filter((name) => name.endsWith('.md') && name !== 'README.md')
    .map((name) => {
      const text = fs.readFileSync(path.join(wakeDir, name), 'utf8');
      const role = (text.match(/^role:\s*(\S+)\s*$/m) || [])[1];
      const status = (text.match(/^status:\s*(\S+)\s*$/m) || [])[1];
      return { role, status };
    })
    .filter((ticket) => ticket.status === 'pending' && ticket.role);
}

function upsertTicket(role, relPath, source) {
  fs.mkdirSync(wakeDir, { recursive: true });
  const file = path.join(wakeDir, `${role}.md`);
  let paths = [];
  if (fs.existsSync(file)) {
    const text = fs.readFileSync(file, 'utf8');
    if (text.includes('status: pending')) {
      const section = text.split(/^paths:\s*$/m)[1] || '';
      paths = section
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.startsWith('- '))
        .map((line) => line.slice(2).trim())
        .filter((line) => line && !line.startsWith('(message'));
    }
  }
  if (relPath && !paths.includes(relPath)) paths.push(relPath);
  const pathBlock = paths.length > 0 ? paths.map((item) => `- ${item}`).join('\n') : '- (message or manual wake)';
  const body = `---
role: ${role}
status: pending
updated: ${new Date().toISOString()}
source: ${source}
---

paths:
${pathBlock}

Follow agents/${role}.md and AgentDirectory/${role}/standards.md.
Save web research in AgentDirectory/${role}/research/ and the chosen approach in AgentDirectory/${role}/preview/.
You may edit any file under the repository root except paths another session already changed.
When the root work for these paths is finished, set status to done in this file.
If this role changed product files, write AgentDirectory/bus/messages/ to quality-rater with needs_reply: yes.
`;
  fs.writeFileSync(file, body);
}

function consider(rel, source) {
  const normalized = normalize(rel);
  const recipient = messageRecipient(normalized);
  if (recipient) {
    upsertTicket(recipient, normalized, source);
    return recipient;
  }
  const role = roleForProductPath(normalized);
  if (!role) return null;
  upsertTicket(role, normalized, source);
  return role;
}

async function main() {
  if (mode === 'watch') {
    const index = process.argv.indexOf('--path');
    const rel = index >= 0 ? process.argv[index + 1] : '';
    const role = consider(rel, 'supervisor');
    if (role) process.stderr.write(`wake ${role} ${normalize(rel)}\n`);
    return;
  }

  if (mode === 'stop') {
    const pending = listPending();
    if (pending.length === 0) {
      emit({});
      return;
    }
    const roles = pending.map((ticket) => ticket.role).join(', ');
    emit({
      followup_message: `Drain AgentDirectory/bus/wake before going idle. Pending roles: ${roles}. Read AGENTS.md and agents/orchestrator.md. Run each pending role now, then the quality rater if product files changed. Mark a ticket status done only after that role finishes. Do not leave pending tickets.`,
    });
    return;
  }

  if (mode === 'sessionStart') {
    const pending = listPending();
    const pendingLine =
      pending.length === 0
        ? 'No wake tickets are pending.'
        : `Pending wake tickets: ${pending.map((ticket) => ticket.role).join(', ')}. Drain them before any new task.`;
    emit({
      additional_context: `TheMinaker agents are file-triggered. First read AGENTS.md. ${pendingLine} Specialists save research and previews under AgentDirectory/<role>/ and may edit the repository root. They share thoughts in AgentDirectory/bus/messages/.`,
    });
    return;
  }

  const raw = await readStdin();
  const paths = extractPaths(raw);
  paths.forEach((filePath) => consider(filePath, 'hook'));
  emit({});
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  if (mode === 'stop' || mode === 'sessionStart' || mode === 'afterFileEdit') emit({});
  process.exit(0);
});
