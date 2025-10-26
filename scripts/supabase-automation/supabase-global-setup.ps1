# Supabase Global Setup - Permanent CLI Authentication
# This script sets up Supabase CLI with persistent authentication across all sessions

param(
    [string]$AccessToken,
    [switch]$Validate
)

Write-Host "🚀 Supabase Global Setup - Permanent Authentication" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Function to set permanent environment variable
function Set-PermanentEnvironmentVariable {
    param($Name, $Value, $Scope = "User")
    
    try {
        [Environment]::SetEnvironmentVariable($Name, $Value, $Scope)
        Write-Host "✅ Set $Name environment variable" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Failed to set $Name environment variable: $_" -ForegroundColor Red
        return $false
    }
}

# Function to validate Supabase CLI installation
function Test-SupabaseCLI {
    try {
        $version = supabase --version 2>$null
        if ($version) {
            Write-Host "✅ Supabase CLI found: $version" -ForegroundColor Green
            return $true
        }
    }
    catch {
        Write-Host "❌ Supabase CLI not found" -ForegroundColor Red
        return $false
    }
}

# Function to install Supabase CLI if missing
function Install-SupabaseCLI {
    Write-Host "📦 Installing Supabase CLI..." -ForegroundColor Yellow
    
    try {
        # Install via npm (most reliable cross-platform method)
        npm install -g supabase
        
        if (Test-SupabaseCLI) {
            Write-Host "✅ Supabase CLI installed successfully" -ForegroundColor Green
            return $true
        }
        else {
            Write-Host "❌ Supabase CLI installation failed" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ Failed to install Supabase CLI: $_" -ForegroundColor Red
        return $false
    }
}

# Function to configure global authentication
function Set-GlobalAuthentication {
    param($Token)
    
    Write-Host "🔐 Setting up global authentication..." -ForegroundColor Yellow
    
    # Set environment variable permanently
    if (Set-PermanentEnvironmentVariable "SUPABASE_ACCESS_TOKEN" $Token) {
        # Also set for current session
        $env:SUPABASE_ACCESS_TOKEN = $Token
        
        # Create global config directory
        $configDir = "$env:USERPROFILE\.supabase"
        if (!(Test-Path $configDir)) {
            New-Item -ItemType Directory -Path $configDir -Force | Out-Null
            Write-Host "✅ Created global config directory: $configDir" -ForegroundColor Green
        }
        
        # Test authentication
        try {
            $projects = supabase projects list 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Authentication successful - CLI can access projects" -ForegroundColor Green
                return $true
            }
            else {
                Write-Host "❌ Authentication failed - invalid token or API error" -ForegroundColor Red
                return $false
            }
        }
        catch {
            Write-Host "❌ Authentication test failed: $_" -ForegroundColor Red
            return $false
        }
    }
    else {
        return $false
    }
}

# Function to validate complete setup
function Test-GlobalSetup {
    Write-Host "🧪 Validating global setup..." -ForegroundColor Yellow
    
    $success = $true
    
    # Check CLI installation
    if (!(Test-SupabaseCLI)) {
        $success = $false
    }
    
    # Check environment variable
    $tokenFromEnv = [Environment]::GetEnvironmentVariable("SUPABASE_ACCESS_TOKEN", "User")
    if (!$tokenFromEnv) {
        Write-Host "❌ SUPABASE_ACCESS_TOKEN not found in environment variables" -ForegroundColor Red
        $success = $false
    }
    else {
        Write-Host "✅ SUPABASE_ACCESS_TOKEN found in environment" -ForegroundColor Green
    }
    
    # Test API access
    try {
        $projects = supabase projects list 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ API access working - found projects" -ForegroundColor Green
        }
        else {
            Write-Host "❌ API access failed" -ForegroundColor Red
            $success = $false
        }
    }
    catch {
        Write-Host "❌ API test failed: $_" -ForegroundColor Red
        $success = $false
    }
    
    return $success
}

# Main execution
try {
    # Validation mode
    if ($Validate) {
        $isValid = Test-GlobalSetup
        if ($isValid) {
            Write-Host "🎉 Global Supabase setup is valid and working!" -ForegroundColor Green
            exit 0
        }
        else {
            Write-Host "❌ Global Supabase setup has issues" -ForegroundColor Red
            exit 1
        }
    }
    
    # Setup mode
    if (!$AccessToken) {
        Write-Host "❌ Access Token required. Get it from: https://supabase.com/dashboard/account/tokens" -ForegroundColor Red
        Write-Host "Usage: .\supabase-global-setup.ps1 -AccessToken 'your_token_here'" -ForegroundColor Yellow
        exit 1
    }
    
    # Step 1: Ensure Supabase CLI is installed
    if (!(Test-SupabaseCLI)) {
        if (!(Install-SupabaseCLI)) {
            Write-Host "❌ Setup failed - could not install Supabase CLI" -ForegroundColor Red
            exit 1
        }
    }
    
    # Step 2: Configure global authentication
    if (!(Set-GlobalAuthentication $AccessToken)) {
        Write-Host "❌ Setup failed - could not configure authentication" -ForegroundColor Red
        exit 1
    }
    
    # Step 3: Validate complete setup
    if (Test-GlobalSetup) {
        Write-Host "" -ForegroundColor White
        Write-Host "🎉 SUCCESS! Supabase is now configured globally" -ForegroundColor Green
        Write-Host "✅ CLI authentication will persist across all terminal sessions" -ForegroundColor Green
        Write-Host "✅ All Supabase commands will work without manual login" -ForegroundColor Green
        Write-Host "" -ForegroundColor White
        Write-Host "📋 Next Steps:" -ForegroundColor Cyan
        Write-Host "1. Restart your terminal to ensure environment variables are loaded" -ForegroundColor White
        Write-Host "2. Run project-specific setup: .\supabase-project-setup.ps1" -ForegroundColor White
        Write-Host "3. Set up MCP integration: .\supabase-mcp-setup.ps1" -ForegroundColor White
        exit 0
    }
    else {
        Write-Host "❌ Setup completed but validation failed" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "❌ Unexpected error during setup: $_" -ForegroundColor Red
    exit 1
}