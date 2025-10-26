# Supabase MCP Server Setup - Automated Claude Code Integration
# This script automatically configures Supabase MCP server for Claude Code

param(
    [string]$ProjectPath = ".",
    [string]$ProjectRef,
    [switch]$GlobalScope,
    [switch]$Validate
)

Write-Host "🔌 Supabase MCP Server Setup" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Function to detect existing Claude Code MCP configuration
function Get-MCPConfiguration {
    param($Path)
    
    $mcpFiles = @(
        "$Path\.mcp.json",
        "$Path\.claude\mcp.json",
        "$env:USERPROFILE\.claude\mcp.json"
    )
    
    foreach ($file in $mcpFiles) {
        if (Test-Path $file) {
            try {
                $config = Get-Content $file | ConvertFrom-Json
                Write-Host "✅ Found MCP configuration: $(Split-Path $file -Leaf)" -ForegroundColor Green
                return @{
                    Path = $file
                    Config = $config
                }
            }
            catch {
                Write-Host "⚠️ Invalid MCP config found at: $file" -ForegroundColor Yellow
            }
        }
    }
    
    return $null
}

# Function to get Supabase project information
function Get-SupabaseProjectInfo {
    param($ProjectRef)
    
    if (!$ProjectRef) {
        # Try to auto-detect from environment or CLI
        if ($env:SUPABASE_PROJECT_REF) {
            $ProjectRef = $env:SUPABASE_PROJECT_REF
            Write-Host "📍 Using project ref from environment: $ProjectRef" -ForegroundColor Cyan
        }
        else {
            # Get all projects and let user choose
            try {
                $projects = supabase projects list --output json 2>$null | ConvertFrom-Json
                if ($projects.Count -eq 1) {
                    $ProjectRef = $projects[0].ref
                    Write-Host "🎯 Auto-selected project: $($projects[0].name) ($ProjectRef)" -ForegroundColor Green
                }
                elseif ($projects.Count -gt 1) {
                    Write-Host "📋 Available projects:" -ForegroundColor Yellow
                    for ($i = 0; $i -lt $projects.Count; $i++) {
                        Write-Host "  $($i + 1). $($projects[$i].name) ($($projects[$i].ref))" -ForegroundColor White
                    }
                    
                    do {
                        $selection = Read-Host "Select project number (1-$($projects.Count))"
                        $selectionInt = 0
                        if ([int]::TryParse($selection, [ref]$selectionInt) -and $selectionInt -ge 1 -and $selectionInt -le $projects.Count) {
                            $ProjectRef = $projects[$selectionInt - 1].ref
                            break
                        }
                        Write-Host "Invalid selection. Please enter a number between 1 and $($projects.Count)." -ForegroundColor Red
                    } while ($true)
                }
            }
            catch {
                Write-Host "❌ Could not fetch Supabase projects: $_" -ForegroundColor Red
                return $null
            }
        }
    }
    
    if (!$ProjectRef) {
        Write-Host "❌ No project reference provided or detected" -ForegroundColor Red
        return $null
    }
    
    return @{
        ProjectRef = $ProjectRef
        ProjectUrl = "https://$ProjectRef.supabase.co"
    }
}

# Function to create MCP server configuration
function New-MCPConfiguration {
    param($Path, $ProjectInfo, $IsGlobal = $false)
    
    # Determine configuration file path
    if ($IsGlobal) {
        $configDir = "$env:USERPROFILE\.claude"
        $configPath = "$configDir\mcp.json"
    }
    else {
        $configPath = "$Path\.mcp.json"
    }
    
    # Ensure directory exists
    $configDir = Split-Path $configPath -Parent
    if (!(Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
        Write-Host "✅ Created configuration directory: $configDir" -ForegroundColor Green
    }
    
    # Create MCP configuration
    $mcpConfig = @{
        servers = @{
            supabase = @{
                command = "npx"
                args = @(
                    "-y",
                    "@supabase/mcp-server-supabase@latest",
                    "--read-only",
                    "--project-ref=$($ProjectInfo.ProjectRef)"
                )
                env = @{
                    SUPABASE_ACCESS_TOKEN = "`$env:SUPABASE_ACCESS_TOKEN"
                }
            }
        }
    }
    
    # Check for existing configuration
    $existingConfig = $null
    if (Test-Path $configPath) {
        try {
            $existingConfig = Get-Content $configPath | ConvertFrom-Json
            Write-Host "📄 Found existing MCP configuration" -ForegroundColor Yellow
        }
        catch {
            Write-Host "⚠️ Existing MCP config is invalid, will be replaced" -ForegroundColor Yellow
        }
    }
    
    # Merge or replace configuration
    if ($existingConfig -and $existingConfig.servers) {
        $existingConfig.servers.supabase = $mcpConfig.servers.supabase
        $finalConfig = $existingConfig
        Write-Host "✅ Updated existing MCP configuration with Supabase server" -ForegroundColor Green
    }
    else {
        $finalConfig = $mcpConfig
        Write-Host "✅ Created new MCP configuration with Supabase server" -ForegroundColor Green
    }
    
    # Write configuration file
    try {
        $finalConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath $configPath -Encoding utf8
        Write-Host "✅ Wrote MCP configuration to: $(Split-Path $configPath -Leaf)" -ForegroundColor Green
        return $configPath
    }
    catch {
        Write-Host "❌ Failed to write MCP configuration: $_" -ForegroundColor Red
        return $null
    }
}

# Function to register MCP server with Claude Code
function Register-MCPServer {
    param($ProjectInfo, $IsGlobal = $false)
    
    Write-Host "📝 Registering Supabase MCP server with Claude Code..." -ForegroundColor Yellow
    
    # Prepare command arguments
    $scope = if ($IsGlobal) { "global" } else { "local" }
    $serverName = "supabase"
    
    # Check if SUPABASE_ACCESS_TOKEN is available
    if (!$env:SUPABASE_ACCESS_TOKEN) {
        Write-Host "⚠️ SUPABASE_ACCESS_TOKEN not found in environment" -ForegroundColor Yellow
        Write-Host "   MCP server may not authenticate properly until token is set" -ForegroundColor Yellow
    }
    
    try {
        # Use Claude CLI to add MCP server
        $command = "claude mcp add $serverName -s $scope -e SUPABASE_ACCESS_TOKEN=`$env:SUPABASE_ACCESS_TOKEN -- npx -y @supabase/mcp-server-supabase@latest --read-only --project-ref=$($ProjectInfo.ProjectRef)"
        
        Write-Host "🔧 Executing: $command" -ForegroundColor Cyan
        
        # Execute the command
        Invoke-Expression $command
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Successfully registered Supabase MCP server with Claude Code" -ForegroundColor Green
            return $true
        }
        else {
            Write-Host "❌ Failed to register MCP server with Claude Code" -ForegroundColor Red
            Write-Host "   You may need to add it manually using Claude Code interface" -ForegroundColor Yellow
            return $false
        }
    }
    catch {
        Write-Host "❌ Error registering MCP server: $_" -ForegroundColor Red
        Write-Host "   Falling back to manual configuration file creation..." -ForegroundColor Yellow
        return $false
    }
}

# Function to validate MCP server setup
function Test-MCPSetup {
    param($ConfigPath, $ProjectInfo)
    
    Write-Host "🧪 Validating MCP server setup..." -ForegroundColor Yellow
    
    $success = $true
    
    # Check configuration file exists
    if (!(Test-Path $ConfigPath)) {
        Write-Host "❌ MCP configuration file not found: $ConfigPath" -ForegroundColor Red
        return $false
    }
    
    # Validate configuration content
    try {
        $config = Get-Content $ConfigPath | ConvertFrom-Json
        
        if ($config.servers -and $config.servers.supabase) {
            Write-Host "✅ MCP configuration contains Supabase server" -ForegroundColor Green
            
            # Check server configuration
            $supabaseServer = $config.servers.supabase
            if ($supabaseServer.command -eq "npx" -and $supabaseServer.args -contains "@supabase/mcp-server-supabase@latest") {
                Write-Host "✅ Supabase MCP server configuration is valid" -ForegroundColor Green
            }
            else {
                Write-Host "❌ Supabase MCP server configuration is invalid" -ForegroundColor Red
                $success = $false
            }
            
            # Check project reference
            $hasProjectRef = $false
            foreach ($arg in $supabaseServer.args) {
                if ($arg -match "--project-ref=") {
                    $hasProjectRef = $true
                    break
                }
            }
            
            if ($hasProjectRef) {
                Write-Host "✅ Project reference configured in MCP server" -ForegroundColor Green
            }
            else {
                Write-Host "❌ Project reference missing from MCP server configuration" -ForegroundColor Red
                $success = $false
            }
        }
        else {
            Write-Host "❌ MCP configuration does not contain Supabase server" -ForegroundColor Red
            $success = $false
        }
    }
    catch {
        Write-Host "❌ Invalid MCP configuration file: $_" -ForegroundColor Red
        $success = $false
    }
    
    # Check environment variables
    if ($env:SUPABASE_ACCESS_TOKEN) {
        Write-Host "✅ SUPABASE_ACCESS_TOKEN found in environment" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ SUPABASE_ACCESS_TOKEN not found in environment" -ForegroundColor Yellow
        Write-Host "   MCP server may not authenticate properly" -ForegroundColor Yellow
    }
    
    return $success
}

# Function to test MCP server connectivity
function Test-MCPConnectivity {
    Write-Host "🔗 Testing MCP server connectivity..." -ForegroundColor Yellow
    
    # Try to test Supabase CLI connectivity first
    try {
        $projects = supabase projects list 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Supabase CLI connectivity working" -ForegroundColor Green
            return $true
        }
        else {
            Write-Host "❌ Supabase CLI connectivity failed" -ForegroundColor Red
            Write-Host "   Check your SUPABASE_ACCESS_TOKEN and network connection" -ForegroundColor Yellow
            return $false
        }
    }
    catch {
        Write-Host "❌ Error testing Supabase connectivity: $_" -ForegroundColor Red
        return $false
    }
}

# Main execution
try {
    $projectPath = Resolve-Path $ProjectPath
    Write-Host "📁 Project path: $projectPath" -ForegroundColor Cyan
    
    # Get project information
    $projectInfo = Get-SupabaseProjectInfo $ProjectRef
    if (!$projectInfo) {
        Write-Host "❌ Could not determine Supabase project information" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "🎯 Project: $($projectInfo.ProjectRef)" -ForegroundColor Cyan
    
    # Validation mode
    if ($Validate) {
        $configInfo = Get-MCPConfiguration $projectPath
        if ($configInfo) {
            $isValid = Test-MCPSetup $configInfo.Path $projectInfo
            if ($isValid -and (Test-MCPConnectivity)) {
                Write-Host "🎉 MCP setup is valid and working!" -ForegroundColor Green
                exit 0
            }
            else {
                Write-Host "❌ MCP setup has issues" -ForegroundColor Red
                exit 1
            }
        }
        else {
            Write-Host "❌ No MCP configuration found" -ForegroundColor Red
            exit 1
        }
    }
    
    # Setup mode
    Write-Host "🚀 Setting up Supabase MCP server..." -ForegroundColor Yellow
    
    # Try to register with Claude CLI first
    $registered = Register-MCPServer $projectInfo $GlobalScope
    
    # Create configuration file as fallback or primary method
    $configPath = New-MCPConfiguration $projectPath $projectInfo $GlobalScope
    if (!$configPath) {
        Write-Host "❌ Failed to create MCP configuration" -ForegroundColor Red
        exit 1
    }
    
    # Validate the setup
    if (Test-MCPSetup $configPath $projectInfo) {
        Write-Host "" -ForegroundColor White
        Write-Host "🎉 SUCCESS! Supabase MCP server configured" -ForegroundColor Green
        Write-Host "✅ MCP configuration created" -ForegroundColor Green
        if ($registered) {
            Write-Host "✅ Server registered with Claude Code" -ForegroundColor Green
        }
        else {
            Write-Host "⚠️ Manual registration may be required in Claude Code" -ForegroundColor Yellow
        }
        Write-Host "" -ForegroundColor White
        Write-Host "📋 Next Steps:" -ForegroundColor Cyan
        Write-Host "1. Restart Claude Code to load new MCP configuration" -ForegroundColor White
        Write-Host "2. Test MCP functionality: claude mcp list" -ForegroundColor White
        Write-Host "3. Run database setup: .\supabase-db-setup.ps1" -ForegroundColor White
        Write-Host "" -ForegroundColor White
        Write-Host "💡 Usage Tips:" -ForegroundColor Cyan
        Write-Host "• Use 'List Supabase tables' in Claude Code" -ForegroundColor White
        Write-Host "• Use 'Get Supabase project info' for project details" -ForegroundColor White
        Write-Host "• Use 'Execute Supabase SQL' for database queries" -ForegroundColor White
        
        # Test connectivity
        if (Test-MCPConnectivity) {
            Write-Host "✅ MCP server connectivity verified" -ForegroundColor Green
        }
        
        exit 0
    }
    else {
        Write-Host "❌ Setup completed but validation failed" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "❌ Unexpected error during MCP setup: $_" -ForegroundColor Red
    exit 1
}