# scripts/common.ps1
# Provides Get-AppDir which resolves the Next.js app folder (modern-tco).

function Get-AppDir {
  param([string]$Hint)
  $repoRoot = Split-Path $PSScriptRoot -Parent

  # Optional local override
  $overridePath = Join-Path $PSScriptRoot "local.config.ps1"
  if (Test-Path $overridePath) {
    . $overridePath
    if ($AppDirOverride) {
      if (Test-Path $AppDirOverride) { return $AppDirOverride }
      $candidate = Join-Path $repoRoot $AppDirOverride
      if (Test-Path $candidate) { return $candidate }
    }
  }

  # Candidate locations (fast)
  $cands = @(
    (Join-Path $repoRoot "modern-tco"),
    (Join-Path $repoRoot "app\modern-tco"),
    (Join-Path $repoRoot "src\modern-tco")
  )
  foreach ($c in $cands) { if (Test-Path $c) { return $c } }

  throw "Could not locate the 'modern-tco' app directory. Create scripts\local.config.ps1 with: ``$AppDirOverride = 'modern-tco'`` or an absolute path."
}
