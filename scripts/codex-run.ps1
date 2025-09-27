param([string]$Prompt)
if (-not $Prompt) { Write-Error "Usage: .\scripts\codex-run.ps1 -Prompt <path>"; exit 1 }
if (!(Test-Path $Prompt)) { Write-Error "Prompt not found: $Prompt"; exit 1 }
Write-Host "Running Codex with $Prompt"
codex --config model="gpt-5" --config model_reasoning_effort="high" exec (Get-Content $Prompt -Raw)
