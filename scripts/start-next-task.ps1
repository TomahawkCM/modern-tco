param([switch]$DryRun)
$ErrorActionPreference = "Stop"
$tasksPath = "docs\TRACKING\TASKS.json"
if (!(Test-Path $tasksPath)) { Write-Error "Missing $tasksPath"; exit 1 }
$data = Get-Content $tasksPath -Raw | ConvertFrom-Json
$tasks = $data.tasks

function DepDone($id){ ($tasks | Where-Object id -eq $id).status -eq 'done' }

$eligible = @()
foreach ($t in $tasks) {
  if ($t.status -ne 'todo') { continue }
  $deps = @($t.dependencies)
  if ($deps.Count -eq 0 -or ($deps | ForEach-Object { DepDone($_) } | Where-Object {$_ -eq $false} | Measure-Object).Count -eq 0) {
    $eligible += $t
  }
}
if ($eligible.Count -eq 0) { Write-Host "No eligible TODO tasks. You're done!"; exit 0 }
$next = $eligible | Sort-Object priority | Select-Object -First 1

Write-Host "Next task:" $next.id "-" $next.title
$prompt = $next.prompt_path
if (!(Test-Path $prompt)) { Write-Error "Prompt not found: $prompt"; exit 1 }

$stamp = Get-Date -Format "yyyy-MM-dd-HHmm"
$sessionPath = "docs\SESSIONS\SESSION-$stamp-$($next.id).md"
${sessionDir} = Split-Path -Path $sessionPath -Parent
if (!(Test-Path ${sessionDir})) { New-Item -ItemType Directory -Force -Path ${sessionDir} | Out-Null }
@"
# Session $stamp - $($next.id) $($next.title)

## Intent
Implement acceptance criteria for $($next.id).

## Actions
- Ran Codex: $prompt
- Validated per commands in prompt

## Results
<fill after run>

"@ | Out-File -Encoding utf8 $sessionPath

if ($DryRun) { Write-Host "[DryRun] Would run Codex with $prompt"; exit 0 }

codex --config model="gpt-5" --config model_reasoning_effort="high" exec (Get-Content $prompt -Raw)

# run validation
. (Join-Path $PSScriptRoot "common.ps1")
$appDir = Get-AppDir
if ($next.validate -and $next.validate.Count -gt 0) {
  Push-Location .
  try {
    foreach ($cmd in $next.validate) {
      Write-Host ">> $cmd"
      if ($cmd -like "npm*") {
        Push-Location $appDir
        cmd /c $cmd
        $code = $LASTEXITCODE
        Pop-Location
      } else {
        cmd /c $cmd
        $code = $LASTEXITCODE
      }
      if ($code -ne 0) { throw "Validation failed: $cmd (exit $code)" }
    }
  } finally { Pop-Location }
}

# mark complete
foreach ($i in 0..($tasks.Count-1)) {
  if ($tasks[$i].id -eq $next.id) {
    $tasks[$i].status = "done"
    $tasks[$i].updated_at = (Get-Date).ToString("s")
  }
}
$payload = @{ tasks = $tasks } | ConvertTo-Json -Depth 8
$payload | Out-File -Encoding utf8 $tasksPath

$entry = "`n- $(Get-Date -Format 'yyyy-MM-dd HH:mm') - Completed $($next.id) - $($next.title)"
Add-Content -Path "docs\TRACKING\CHANGELOG.md" -Value $entry -Encoding UTF8

.\scripts\update-main-md.ps1

Write-Host "Completed:" $next.id
Write-Host "Session log:" $sessionPath
