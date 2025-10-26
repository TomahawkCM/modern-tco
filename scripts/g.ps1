# g.ps1 — 1-letter alias for go.ps1
param(
  [switch]$DryRun,
  [string]$Id
)
& (Join-Path $PSScriptRoot "go.ps1") @PSBoundParameters
