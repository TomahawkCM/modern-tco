$tasksPath = "docs\TRACKING\TASKS.json"
if (!(Test-Path $tasksPath)) { Write-Error "Missing $tasksPath"; exit 1 }
$data = Get-Content $tasksPath -Raw | ConvertFrom-Json
$lines = @("# Project Main — Tanium TCO Study App", "", "## Status Snapshot", "")
$lines += "| ID | Title | P | Status |"
$lines += "|----|-------|---|--------|"
foreach ($t in $data.tasks) {
  $lines += "| {0} | {1} | {2} | {3} |" -f $t.id, $t.title, $t.priority, $t.status
}
$lines += "", "## Next Step", "", "Run:", "", "````powershell", ".\scripts\start-next-task.ps1", "````", "", "## All Tasks", "", "- See `docs/TRACKING/TASKS.json` for canonical data", "- See `docs/TASKS/` for human-readable specs"
$lines -join "`n" | Out-File -Encoding utf8 "docs\TRACKING\MAIN.md"
Write-Host "Updated docs\TRACKING\MAIN.md"
