param([string]$Prompt)
$ErrorActionPreference = "Stop"

if (-not $Prompt) { Write-Error "Usage: .\scripts\codex-run-mcp.ps1 -Prompt <path>"; exit 1 }
if (!(Test-Path $Prompt)) { Write-Error "Prompt not found: $Prompt"; exit 1 }

$mcpConfig = Join-Path (Get-Location) ".mcp.codex.json"
if (!(Test-Path $mcpConfig)) { Write-Error "Missing MCP config: $mcpConfig"; exit 1 }

# Backup env vars to avoid polluting the shell session
$backup = @{}
foreach ($k in @(
  'SUPABASE_URL','SUPABASE_ANON_KEY','SUPABASE_SERVICE_KEY','DATABASE_URL',
  'MCP_CONFIG_PATH','ANTHROPIC_MCP_CONFIG','CLAUDE_MCP_CONFIG'
)) { $backup[$k] = $env:$k }

# Populate missing vars from .env.local if available (non-destructive)
$dotenv = ".env.local"
if (Test-Path $dotenv) {
  $lines = Get-Content $dotenv
  function GetEnvFromDotenv([string]$name) {
    $line = $lines | Where-Object { $_ -match "^$name=" } | Select-Object -First 1
    if ($line) { return $line.Substring($name.Length+1).Trim('"') } else { return $null }
  }
  if (-not $env:SUPABASE_URL) { $env:SUPABASE_URL = GetEnvFromDotenv "SUPABASE_URL" }
  if (-not $env:SUPABASE_ANON_KEY) { $env:SUPABASE_ANON_KEY = GetEnvFromDotenv "SUPABASE_ANON_KEY" }
  if (-not $env:SUPABASE_SERVICE_KEY) { $env:SUPABASE_SERVICE_KEY = GetEnvFromDotenv "SUPABASE_SERVICE_KEY" }
  if (-not $env:DATABASE_URL) {
    $db = GetEnvFromDotenv "SUPABASE_DB_URL"
    if ($db) { $env:DATABASE_URL = $db }
  }
}

# Hint the Codex runtime about which MCP config to use
$env:MCP_CONFIG_PATH = $mcpConfig
$env:ANTHROPIC_MCP_CONFIG = $mcpConfig
$env:CLAUDE_MCP_CONFIG = $mcpConfig

Write-Host "Running Codex with MCP config: $mcpConfig"

# Prefer passing an explicit flag if supported
$globalArgs = @("-a","never")
$args = @(
  "--skip-git-repo-check",
  "--sandbox","danger-full-access",
  "--config","model=gpt-5",
  "--config","model_reasoning_effort=high"
)
try {
  $help = codex --help 2>$null
  if ($help -and ($help -match "mcp-config")) {
    $args = @("--mcp-config", $mcpConfig) + $args
  }
} catch { }

codex @globalArgs exec @args (Get-Content $Prompt -Raw)
$code = $LASTEXITCODE

# Restore prior env vars
foreach ($k in $backup.Keys) {
  $v = $backup[$k]
  if ($null -eq $v -or $v -eq '') { Remove-Item Env:$k -ErrorAction SilentlyContinue } else { $env:$k = $v }
}

exit $code
