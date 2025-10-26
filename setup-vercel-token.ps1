<# Persist Vercel auth for CLI + Codex
   - Scope: current user (default). Use -AllUsers to write to Machine (admin required).
   - Usage:
       .\setup-vercel-token.ps1           # uses default token & scope
       .\setup-vercel-token.ps1 -Token 'YOUR_TOKEN'
       .\setup-vercel-token.ps1 -AllUsers # admin: system-wide
#>

param(
  [string]$Token = 'JF1baYppKT77opeknnEZHDTt',     # default to your token
  [string]$Scope = 'robert-neveus-projects',
  [switch]$AllUsers
)

# If token was left blank, prompt (masked)
if ([string]::IsNullOrWhiteSpace($Token)) {
  $sec = Read-Host "Paste Vercel token" -AsSecureString
  $Token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
  )
}

# Normalize & validate
$Token = $Token.Trim()
if ([string]::IsNullOrWhiteSpace($Token)) {
  Write-Error "Vercel token is empty after trimming. Aborting."; exit 1
}
if ($Token -match '^\s|\s$') {
  Write-Warning "Token appears to have leading/trailing whitespace. It will be trimmed."
}

$target = if ($AllUsers) { 'Machine' } else { 'User' }

# Persist (future shells)
[Environment]::SetEnvironmentVariable('VERCEL_TOKEN', $Token, $target)
[Environment]::SetEnvironmentVariable('VERCEL_SCOPE', $Scope, $target)

# Set for current session
$env:VERCEL_TOKEN = $Token
$env:VERCEL_SCOPE = $Scope

Write-Host "Persisted [$target] environment variables:"
Write-Host "  VERCEL_TOKEN = ****"
Write-Host "  VERCEL_SCOPE = $env:VERCEL_SCOPE"

# Verify CLI auth
try {
  $out = vercel whoami --token $env:VERCEL_TOKEN --scope $env:VERCEL_SCOPE 2>$null
  if ($LASTEXITCODE -eq 0 -and $out) {
    Write-Host "Vercel CLI OK → $out" -ForegroundColor Green
  } else {
    Write-Warning "Vercel CLI did not confirm. Open a NEW PowerShell and run: vercel whoami"
  }
} catch {
  Write-Warning "Vercel CLI not found or token invalid. Ensure 'vercel' is installed (npm i -g vercel)."
}

Write-Host "Done. Open a NEW PowerShell window to inherit the persisted variables."
