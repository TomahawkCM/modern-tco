# go.ps1 — one-command launcher for a Codex session
param(
  [switch]$DryRun,
  [string]$Id # optional: run a specific TASK ID instead of picking the next
)
$ErrorActionPreference = "Stop"

# Ensure helper exists
$start = Join-Path $PSScriptRoot "start-next-task.ps1"
if (!(Test-Path $start)) { Write-Error "Missing scripts\start-next-task.ps1"; exit 1 }

if ($PSBoundParameters.ContainsKey('Id') -and $Id) {
  # Run a specific prompt by ID
  $tasksPath = Join-Path (Split-Path $PSScriptRoot -Parent) "docs\TRACKING\TASKS.json"
  if (!(Test-Path $tasksPath)) { Write-Error "Missing $tasksPath"; exit 1 }
  $data = Get-Content $tasksPath -Raw | ConvertFrom-Json
  $task = $data.tasks | Where-Object id -eq $Id
  if (!$task) { Write-Error "Task not found: $Id"; exit 1 }
  $prompt = $task.prompt_path
  if (!(Test-Path $prompt)) { Write-Error "Prompt not found: $prompt"; exit 1 }
  Write-Host "Running specific task $Id via Codex..."
  & (Join-Path $PSScriptRoot "codex-run.ps1") -Prompt $prompt
  exit $LASTEXITCODE
}

# Default: pick next eligible task and run a full session
& $start @PSBoundParameters
exit $LASTEXITCODE
