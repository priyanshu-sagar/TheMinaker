# Leaves a watcher running for CLIs that do not use Cursor hooks.
# Writes the same wake tickets as .cursor/hooks/wake-agents.js.
# Does not start a second coding agent.

$ErrorActionPreference = 'Stop'
$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

$StatePath = Join-Path $PSScriptRoot 'bus\.watch-state.json'
$Watched = @(
  'apps\api',
  'apps\web',
  'apps\mobile',
  'packages\shared-types',
  'packages\ui-kit',
  'database',
  'infra',
  '.github',
  'docker-compose.yml',
  'docker-compose.override.yml',
  'AgentDirectory\bus\messages'
)

function Get-Snapshot {
  $files = @{}
  foreach ($entry in $Watched) {
    $full = Join-Path $Root $entry
    if (-not (Test-Path $full)) { continue }
    $item = Get-Item $full
    if (-not $item.PSIsContainer) {
      $rel = $entry.Replace('\', '/')
      $files[$rel] = $item.LastWriteTimeUtc.Ticks
      continue
    }
    Get-ChildItem $full -Recurse -File -ErrorAction SilentlyContinue |
      Where-Object {
        $_.FullName -notmatch '\\node_modules\\|\\\.git\\|\\dist\\|\\\.next\\|\\\.expo\\|\\coverage\\'
      } |
      ForEach-Object {
        $rel = $_.FullName.Substring($Root.Length).TrimStart('\', '/').Replace('\', '/')
        $files[$rel] = $_.LastWriteTimeUtc.Ticks
      }
  }
  return $files
}

function Save-State($files) {
  $dir = Split-Path $StatePath -Parent
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  ($files | ConvertTo-Json -Compress) | Set-Content -Path $StatePath -Encoding utf8
}

Write-Host "TheMinaker agent supervisor watching $Root"
Write-Host "Wake tickets: AgentDirectory/bus/wake . This process does not launch an LLM."

$previous = Get-Snapshot
Save-State $previous

while ($true) {
  Start-Sleep -Seconds 3
  $current = Get-Snapshot
  $savedRaw = Get-Content $StatePath -Raw -ErrorAction SilentlyContinue
  $saved = @{}
  if ($savedRaw) {
    ($savedRaw | ConvertFrom-Json).PSObject.Properties | ForEach-Object { $saved[$_.Name] = $_.Value }
  }
  foreach ($rel in $current.Keys) {
    $prior = $saved[$rel]
    if ($null -eq $prior -or "$prior" -ne "$($current[$rel])") {
      & node .cursor/hooks/wake-agents.js watch --path $rel
    }
  }
  Save-State $current
}
