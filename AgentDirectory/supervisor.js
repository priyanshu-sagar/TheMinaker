/**
 * File watcher for CLIs that do not load Cursor hooks.
 * Does not launch a second coding agent. Writes wake tickets only.
 *
 *   node AgentDirectory/supervisor.js
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = path.join(__dirname, '..');
const statePath = path.join(__dirname, 'bus', '.watch-state.json');
const watched = [
  'apps/api',
  'apps/web',
  'apps/mobile',
  'packages/shared-types',
  'packages/ui-kit',
  'database',
  'infra',
  '.github',
  'docker-compose.yml',
  'docker-compose.override.yml',
  'AgentDirectory/bus/messages',
];
const skip = /[\\/](node_modules|\.git|dist|\.next|\.expo|coverage)[\\/]/;

function snapshot() {
  const files = {};
  for (const entry of watched) {
    const full = path.join(root, entry);
    if (!fs.existsSync(full)) continue;
    const stat = fs.statSync(full);
    if (!stat.isDirectory()) {
      files[entry] = stat.mtimeMs;
      continue;
    }
    walk(full, files);
  }
  return files;
}

function walk(dir, files) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (skip.test(full)) continue;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full, files);
      continue;
    }
    const rel = path.relative(root, full).split(path.sep).join('/');
    files[rel] = stat.mtimeMs;
  }
}

function save(files) {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify(files));
}

function load() {
  if (!fs.existsSync(statePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(statePath, 'utf8'));
  } catch {
    return {};
  }
}

function wake(rel) {
  const child = spawn(process.execPath, ['.cursor/hooks/wake-agents.js', 'watch', '--path', rel], {
    cwd: root,
    stdio: 'inherit',
  });
  child.on('error', (error) => process.stderr.write(`${error.message}\n`));
}

process.stdout.write(`TheMinaker agent supervisor watching ${root}\n`);
process.stdout.write('Wake tickets: AgentDirectory/bus/wake. This process does not launch an LLM.\n');

save(snapshot());

setInterval(() => {
  const current = snapshot();
  const saved = load();
  for (const rel of Object.keys(current)) {
    if (saved[rel] !== current[rel]) wake(rel);
  }
  save(current);
}, 3000);
