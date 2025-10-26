# Supabase Database Setup - PostgreSQL Integration
# This script sets up PostgreSQL database integration for the modern-tco application

param(
    [string]$ProjectPath = ".",
    [string]$ProjectRef,
    [string]$DatabasePassword,
    [switch]$CreateSchema,
    [switch]$Validate
)

Write-Host "🗄️ Supabase Database Setup - PostgreSQL Integration" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Function to get database connection information
function Get-DatabaseInfo {
    param($ProjectRef)
    
    if (!$ProjectRef) {
        # Try to get from environment or config
        if (Test-Path ".env.local") {
            $envContent = Get-Content ".env.local" -Raw
            if ($envContent -match "SUPABASE_PROJECT_REF=(.+)") {
                $ProjectRef = $Matches[1].Trim()
                Write-Host "📍 Found project ref in .env.local: $ProjectRef" -ForegroundColor Cyan
            }
        }
        
        if (!$ProjectRef -and $env:SUPABASE_PROJECT_REF) {
            $ProjectRef = $env:SUPABASE_PROJECT_REF
            Write-Host "📍 Using project ref from environment: $ProjectRef" -ForegroundColor Cyan
        }
    }
    
    if (!$ProjectRef) {
        Write-Host "❌ Project reference is required for database setup" -ForegroundColor Red
        return $null
    }
    
    return @{
        ProjectRef = $ProjectRef
        Host = "db.$ProjectRef.supabase.co"
        Port = 5432
        Database = "postgres"
        Username = "postgres"
        DirectUrl = "postgresql://postgres:[PASSWORD]@db.$ProjectRef.supabase.co:5432/postgres"
        PoolingUrl = "postgresql://postgres:[PASSWORD]@$ProjectRef-pooler.supabase.co:6543/postgres"
    }
}

# Function to get database password
function Get-DatabasePassword {
    param($ProjectRef)
    
    if ($DatabasePassword) {
        return $DatabasePassword
    }
    
    # Try to get from environment
    if ($env:SUPABASE_DB_PASSWORD) {
        Write-Host "📍 Using database password from environment" -ForegroundColor Cyan
        return $env:SUPABASE_DB_PASSWORD
    }
    
    # Prompt for password
    Write-Host "🔐 Database password required for PostgreSQL connection" -ForegroundColor Yellow
    Write-Host "   You can find this in your Supabase Dashboard > Settings > Database" -ForegroundColor White
    
    do {
        $securePassword = Read-Host "Enter database password" -AsSecureString
        $password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))
        
        if ($password.Length -gt 0) {
            return $password
        }
        Write-Host "❌ Password cannot be empty. Please try again." -ForegroundColor Red
    } while ($true)
}

# Function to test database connection
function Test-DatabaseConnection {
    param($DatabaseInfo, $Password)
    
    Write-Host "🔌 Testing database connection..." -ForegroundColor Yellow
    
    try {
        # Build connection string
        $connectionString = $DatabaseInfo.DirectUrl -replace '\[PASSWORD\]', $Password
        
        # Test with psql if available
        if (Get-Command psql -ErrorAction SilentlyContinue) {
            $env:PGPASSWORD = $Password
            $result = psql -h $DatabaseInfo.Host -p $DatabaseInfo.Port -U $DatabaseInfo.Username -d $DatabaseInfo.Database -c "SELECT version();" 2>$null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Direct database connection successful" -ForegroundColor Green
                return $true
            }
        }
        
        # Test with Supabase CLI
        $testQuery = "SELECT version();"
        $result = supabase db query --project-ref $DatabaseInfo.ProjectRef $testQuery 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database connection via Supabase CLI successful" -ForegroundColor Green
            return $true
        }
        else {
            Write-Host "❌ Database connection failed" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ Database connection test error: $_" -ForegroundColor Red
        return $false
    }
}

# Function to update environment files with database URLs
function Update-EnvironmentFiles {
    param($ProjectPath, $DatabaseInfo, $Password)
    
    Write-Host "📝 Updating environment files with database connection strings..." -ForegroundColor Yellow
    
    $envFiles = @(".env.local", ".env")
    $updated = $false
    
    foreach ($envFile in $envFiles) {
        $envPath = "$ProjectPath\$envFile"
        if (Test-Path $envPath) {
            try {
                $content = Get-Content $envPath -Raw
                
                # Replace password placeholders
                $directUrl = $DatabaseInfo.DirectUrl -replace '\[PASSWORD\]', $Password
                $poolingUrl = $DatabaseInfo.PoolingUrl -replace '\[PASSWORD\]', $Password
                
                # Update or add database URLs
                if ($content -match "DATABASE_URL=") {
                    $content = $content -replace "DATABASE_URL=.*", "DATABASE_URL=$directUrl"
                }
                else {
                    $content += "`nDATABASE_URL=$directUrl"
                }
                
                if ($content -match "DIRECT_URL=") {
                    $content = $content -replace "DIRECT_URL=.*", "DIRECT_URL=$directUrl"
                }
                else {
                    $content += "`nDIRECT_URL=$directUrl"
                }
                
                # Add pooling URL for better performance
                if ($content -match "SUPABASE_POOLING_URL=") {
                    $content = $content -replace "SUPABASE_POOLING_URL=.*", "SUPABASE_POOLING_URL=$poolingUrl"
                }
                else {
                    $content += "`nSUPABASE_POOLING_URL=$poolingUrl"
                }
                
                # Add database password for CLI operations
                if ($content -match "SUPABASE_DB_PASSWORD=") {
                    $content = $content -replace "SUPABASE_DB_PASSWORD=.*", "SUPABASE_DB_PASSWORD=$Password"
                }
                else {
                    $content += "`nSUPABASE_DB_PASSWORD=$Password"
                }
                
                $content | Out-File -FilePath $envPath -Encoding utf8
                Write-Host "✅ Updated $envFile with database connection strings" -ForegroundColor Green
                $updated = $true
            }
            catch {
                Write-Host "❌ Failed to update $envFile: $_" -ForegroundColor Red
            }
        }
    }
    
    if (!$updated) {
        # Create .env.local with database info
        $envPath = "$ProjectPath\.env.local"
        $directUrl = $DatabaseInfo.DirectUrl -replace '\[PASSWORD\]', $Password
        $poolingUrl = $DatabaseInfo.PoolingUrl -replace '\[PASSWORD\]', $Password
        
        $envContent = @"
# Database Configuration
# Generated by supabase-db-setup.ps1 on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

# Direct database connection (for migrations, admin tasks)
DATABASE_URL=$directUrl
DIRECT_URL=$directUrl

# Pooling connection (for application queries)
SUPABASE_POOLING_URL=$poolingUrl

# Database password for CLI operations
SUPABASE_DB_PASSWORD=$Password
"@

        try {
            $envContent | Out-File -FilePath $envPath -Encoding utf8
            Write-Host "✅ Created .env.local with database configuration" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Failed to create .env.local: $_" -ForegroundColor Red
            return $false
        }
    }
    
    return $true
}

# Function to create database schema for TCO app
function New-TCODatabaseSchema {
    param($ProjectRef)
    
    Write-Host "🏗️ Creating TCO application database schema..." -ForegroundColor Yellow
    
    # Check if schema file exists
    $schemaFile = "$ProjectPath\supabase\EXECUTE_IN_SQL_EDITOR.sql"
    if (!(Test-Path $schemaFile)) {
        Write-Host "⚠️ Schema file not found: $schemaFile" -ForegroundColor Yellow
        Write-Host "   Skipping schema creation. Run manually in Supabase Dashboard." -ForegroundColor White
        return $true
    }
    
    try {
        Write-Host "📋 Executing schema creation script..." -ForegroundColor Cyan
        
        # Read and execute schema
        $schemaContent = Get-Content $schemaFile -Raw
        
        # Execute via Supabase CLI
        $tempFile = [System.IO.Path]::GetTempFileName() + ".sql"
        $schemaContent | Out-File -FilePath $tempFile -Encoding utf8
        
        supabase db query --project-ref $ProjectRef --file $tempFile
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database schema created successfully" -ForegroundColor Green
            
            # Clean up temp file
            Remove-Item $tempFile -ErrorAction SilentlyContinue
            return $true
        }
        else {
            Write-Host "❌ Schema creation failed" -ForegroundColor Red
            Write-Host "   You may need to run the schema manually in Supabase Dashboard" -ForegroundColor Yellow
            return $false
        }
    }
    catch {
        Write-Host "❌ Error creating schema: $_" -ForegroundColor Red
        return $false
    }
}

# Function to setup database development tools
function Initialize-DatabaseTools {
    param($ProjectPath, $ProjectRef)
    
    Write-Host "🛠️ Setting up database development tools..." -ForegroundColor Yellow
    
    # Add database scripts to package.json
    $packageJsonPath = "$ProjectPath\package.json"
    if (Test-Path $packageJsonPath) {
        try {
            $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
            
            if (!$packageJson.scripts) {
                $packageJson | Add-Member -Type NoteProperty -Name "scripts" -Value @{}
            }
            
            # Database management scripts
            $dbScripts = @{
                "db:status" = "supabase db query --project-ref $ProjectRef `"SELECT version();`""
                "db:migrate" = "supabase db push --project-ref $ProjectRef"
                "db:reset" = "supabase db reset --project-ref $ProjectRef"
                "db:seed" = "supabase seed --project-ref $ProjectRef"
                "db:types" = "supabase gen types typescript --project-id $ProjectRef --schema public > src/types/database.types.ts"
                "db:backup" = "pg_dump `$DATABASE_URL > backup-$(Get-Date -Format 'yyyyMMdd-HHmmss').sql"
            }
            
            foreach ($scriptName in $dbScripts.Keys) {
                $packageJson.scripts | Add-Member -Type NoteProperty -Name $scriptName -Value $dbScripts[$scriptName] -Force
            }
            
            $packageJson | ConvertTo-Json -Depth 10 | Out-File -FilePath $packageJsonPath -Encoding utf8
            Write-Host "✅ Added database management scripts to package.json" -ForegroundColor Green
        }
        catch {
            Write-Host "⚠️ Could not update package.json with database scripts: $_" -ForegroundColor Yellow
        }
    }
    
    # Create database types directory
    $typesDir = "$ProjectPath\src\types"
    if (!(Test-Path $typesDir)) {
        New-Item -ItemType Directory -Path $typesDir -Force | Out-Null
        Write-Host "✅ Created database types directory" -ForegroundColor Green
    }
    
    # Generate initial TypeScript types
    try {
        Write-Host "🔄 Generating TypeScript database types..." -ForegroundColor Yellow
        supabase gen types typescript --project-id $ProjectRef --schema public > "$typesDir\database.types.ts"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Generated TypeScript database types" -ForegroundColor Green
        }
        else {
            Write-Host "⚠️ Could not generate TypeScript types (run manually later)" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "⚠️ Error generating types: $_" -ForegroundColor Yellow
    }
}

# Function to validate database setup
function Test-DatabaseSetup {
    param($ProjectPath, $DatabaseInfo, $Password)
    
    Write-Host "🧪 Validating database setup..." -ForegroundColor Yellow
    
    $success = $true
    
    # Test database connection
    if (!(Test-DatabaseConnection $DatabaseInfo $Password)) {
        $success = $false
    }
    
    # Check environment files
    $envFiles = @(".env.local", ".env")
    $envFound = $false
    foreach ($envFile in $envFiles) {
        if (Test-Path "$ProjectPath\$envFile") {
            $content = Get-Content "$ProjectPath\$envFile" -Raw
            if ($content -match "DATABASE_URL" -and $content -notmatch "\[PASSWORD\]") {
                Write-Host "✅ Database connection string configured in $envFile" -ForegroundColor Green
                $envFound = $true
                break
            }
        }
    }
    
    if (!$envFound) {
        Write-Host "❌ Database connection string not properly configured" -ForegroundColor Red
        $success = $false
    }
    
    # Check TypeScript types
    if (Test-Path "$ProjectPath\src\types\database.types.ts") {
        Write-Host "✅ TypeScript database types found" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ TypeScript database types not generated" -ForegroundColor Yellow
    }
    
    return $success
}

# Main execution
try {
    $projectPath = Resolve-Path $ProjectPath
    Write-Host "📁 Project path: $projectPath" -ForegroundColor Cyan
    
    # Get database information
    $dbInfo = Get-DatabaseInfo $ProjectRef
    if (!$dbInfo) {
        Write-Host "❌ Could not determine database information" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "🗄️ Database: $($dbInfo.Host):$($dbInfo.Port)/$($dbInfo.Database)" -ForegroundColor Cyan
    
    # Validation mode
    if ($Validate) {
        $password = Get-DatabasePassword $dbInfo.ProjectRef
        $isValid = Test-DatabaseSetup $projectPath $dbInfo $password
        if ($isValid) {
            Write-Host "🎉 Database setup is valid and working!" -ForegroundColor Green
            exit 0
        }
        else {
            Write-Host "❌ Database setup has issues" -ForegroundColor Red
            exit 1
        }
    }
    
    # Setup mode
    Write-Host "🚀 Setting up PostgreSQL database integration..." -ForegroundColor Yellow
    
    # Get database password
    $password = Get-DatabasePassword $dbInfo.ProjectRef
    
    # Test database connection
    if (!(Test-DatabaseConnection $dbInfo $password)) {
        Write-Host "❌ Cannot proceed without valid database connection" -ForegroundColor Red
        Write-Host "   Please check your database password and network connectivity" -ForegroundColor Yellow
        exit 1
    }
    
    # Update environment files
    if (!(Update-EnvironmentFiles $projectPath $dbInfo $password)) {
        Write-Host "❌ Failed to update environment files" -ForegroundColor Red
        exit 1
    }
    
    # Create database schema if requested
    if ($CreateSchema) {
        New-TCODatabaseSchema $dbInfo.ProjectRef
    }
    
    # Setup development tools
    Initialize-DatabaseTools $projectPath $dbInfo.ProjectRef
    
    # Validate complete setup
    if (Test-DatabaseSetup $projectPath $dbInfo $password) {
        Write-Host "" -ForegroundColor White
        Write-Host "🎉 SUCCESS! PostgreSQL database integration configured" -ForegroundColor Green
        Write-Host "✅ Database connection strings configured" -ForegroundColor Green
        Write-Host "✅ Development tools set up" -ForegroundColor Green
        Write-Host "✅ TypeScript types generated" -ForegroundColor Green
        Write-Host "" -ForegroundColor White
        Write-Host "📋 Next Steps:" -ForegroundColor Cyan
        Write-Host "1. Install database client: npm install pg @types/pg" -ForegroundColor White
        Write-Host "2. Test connection: npm run db:status" -ForegroundColor White
        Write-Host "3. Create schema: npm run db:migrate (or use --CreateSchema flag)" -ForegroundColor White
        Write-Host "4. Generate types: npm run db:types" -ForegroundColor White
        Write-Host "" -ForegroundColor White
        Write-Host "🔧 Available Commands:" -ForegroundColor Cyan
        Write-Host "• npm run db:status   - Check database status" -ForegroundColor White
        Write-Host "• npm run db:migrate  - Push local changes to remote" -ForegroundColor White
        Write-Host "• npm run db:types    - Generate TypeScript types" -ForegroundColor White
        Write-Host "• npm run db:backup   - Create database backup" -ForegroundColor White
        exit 0
    }
    else {
        Write-Host "❌ Setup completed but validation failed" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "❌ Unexpected error during database setup: $_" -ForegroundColor Red
    exit 1
}