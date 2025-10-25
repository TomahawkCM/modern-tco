# PowerShell Script to Migrate TCO Study Content to Supabase
# This script reads MDX files and uploads them to the study_modules and study_sections tables

param(
    [string]$SupabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL,
    [string]$SupabaseKey = $env:SUPABASE_SERVICE_ROLE_KEY,
    [switch]$DryRun = $false
)

# Check for required environment variables
if (-not $SupabaseUrl -or -not $SupabaseKey) {
    Write-Error "Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    exit 1
}

# Set up paths
$ContentPath = Join-Path $PSScriptRoot "..\src\content"
$ModulesPath = Join-Path $ContentPath "modules"
$LabExercisesPath = Join-Path $ContentPath "lab-exercises"

Write-Host "🚀 Starting TCO Content Migration to Supabase..." -ForegroundColor Green
Write-Host "Content Path: $ContentPath" -ForegroundColor Cyan
Write-Host "Dry Run: $DryRun" -ForegroundColor Yellow

# Function to parse frontmatter from MDX files
function Get-FrontMatter {
    param([string]$FilePath)
    
    $content = Get-Content $FilePath -Raw
    if ($content -match '^---\s*\n(.*?)\n---\s*\n(.*)$') {
        $frontmatter = $matches[1]
        $body = $matches[2]
        
        # Parse YAML-like frontmatter
        $metadata = @{}
        $frontmatter -split '\n' | ForEach-Object {
            if ($_ -match '^(\w+):\s*"?([^"]*)"?$') {
                $metadata[$matches[1]] = $matches[2].Trim('"')
            } elseif ($_ -match '^(\w+):\s*\[(.*)\]$') {
                # Handle arrays
                $metadata[$matches[1]] = $matches[2] -split ',' | ForEach-Object { $_.Trim().Trim('"') }
            } elseif ($_ -match '^(\w+):\s*(\d+)$') {
                # Handle numbers
                $metadata[$matches[1]] = [int]$matches[2]
            }
        }
        
        return @{
            Metadata = $metadata
            Content = $body.Trim()
        }
    }
    
    return @{
        Metadata = @{}
        Content = $content
    }
}

# Function to make Supabase API calls
function Invoke-SupabaseAPI {
    param(
        [string]$Endpoint,
        [string]$Method = "GET",
        [hashtable]$Body = @{},
        [string]$Select = "*"
    )
    
    $headers = @{
        "apikey" = $SupabaseKey
        "Authorization" = "Bearer $SupabaseKey"
        "Content-Type" = "application/json"
        "Prefer" = "return=representation"
    }
    
    $uri = "$SupabaseUrl/rest/v1/$Endpoint"
    if ($Method -eq "GET" -and $Select) {
        $uri += "?select=$Select"
    }
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri $uri -Headers $headers -Method $Method
        } else {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            Write-Host "📤 API Request: $Method $uri" -ForegroundColor Blue
            if (-not $DryRun) {
                $response = Invoke-RestMethod -Uri $uri -Headers $headers -Method $Method -Body $jsonBody
            } else {
                Write-Host "🏃 DRY RUN - Would send: $jsonBody" -ForegroundColor Yellow
                return @{ success = $true }
            }
        }
        return $response
    } catch {
        Write-Error "❌ API Error: $($_.Exception.Message)"
        Write-Error "Response: $($_.Exception.Response)"
        return $null
    }
}

# Function to create or update study module
function Set-StudyModule {
    param(
        [hashtable]$ModuleData
    )
    
    Write-Host "📚 Processing module: $($ModuleData.title)" -ForegroundColor Green
    
    # Check if module exists
    $existingModule = Invoke-SupabaseAPI -Endpoint "study_modules" -Select "id,title,domain" | 
        Where-Object { $_.domain -eq $ModuleData.domain }
    
    if ($existingModule) {
        Write-Host "🔄 Updating existing module: $($existingModule.id)" -ForegroundColor Yellow
        $result = Invoke-SupabaseAPI -Endpoint "study_modules?id=eq.$($existingModule.id)" -Method "PATCH" -Body $ModuleData
    } else {
        Write-Host "➕ Creating new module" -ForegroundColor Green
        $result = Invoke-SupabaseAPI -Endpoint "study_modules" -Method "POST" -Body $ModuleData
    }
    
    return $result
}

# Function to create study sections
function Set-StudySections {
    param(
        [string]$ModuleId,
        [string]$Content
    )
    
    # Split content into logical sections
    $sections = @()
    $currentSection = ""
    $sectionTitle = ""
    $orderIndex = 0
    
    $Content -split '\n' | ForEach-Object {
        $line = $_
        
        # Detect section headers (## or ###)
        if ($line -match '^##\s+(.+)$') {
            # Save previous section if it exists
            if ($currentSection.Trim()) {
                $sections += @{
                    module_id = $ModuleId
                    title = $sectionTitle
                    content = $currentSection.Trim()
                    section_type = "overview"
                    order_index = $orderIndex++
                    estimated_time_minutes = 5
                }
            }
            
            # Start new section
            $sectionTitle = $matches[1]
            $currentSection = $line + "`n"
        } else {
            $currentSection += $line + "`n"
        }
    }
    
    # Add the last section
    if ($currentSection.Trim()) {
        $sections += @{
            module_id = $ModuleId
            title = $sectionTitle
            content = $currentSection.Trim()
            section_type = "overview"
            order_index = $orderIndex
            estimated_time_minutes = 5
        }
    }
    
    # Insert sections
    foreach ($section in $sections) {
        Write-Host "📝 Creating section: $($section.title)" -ForegroundColor Cyan
        $result = Invoke-SupabaseAPI -Endpoint "study_sections" -Method "POST" -Body $section
        if (-not $result) {
            Write-Warning "⚠️ Failed to create section: $($section.title)"
        }
    }
}

# Main migration logic
Write-Host "`n🔍 Scanning for MDX files..." -ForegroundColor Blue

if (Test-Path $ModulesPath) {
    $mdxFiles = Get-ChildItem -Path $ModulesPath -Filter "*.mdx"
    
    foreach ($file in $mdxFiles) {
        Write-Host "`n📄 Processing file: $($file.Name)" -ForegroundColor White
        
        $parsed = Get-FrontMatter -FilePath $file.FullName
        $metadata = $parsed.Metadata
        $content = $parsed.Content
        
        # Create module data structure
        $moduleData = @{
            domain = $metadata.domainSlug
            title = $metadata.title
            description = $metadata.description
            exam_weight = $metadata.blueprintWeight
            estimated_time_minutes = if ($metadata.estimatedTime -match '(\d+)') { [int]$matches[1] } else { 45 }
            learning_objectives = $metadata.learningObjectives
            references = @()
            exam_prep = @{
                difficulty = $metadata.difficulty
                tags = $metadata.tags
                practice_config = $metadata.practiceConfig
            }
            version = $metadata.version
        }
        
        # Create or update the module
        $moduleResult = Set-StudyModule -ModuleData $moduleData
        
        if ($moduleResult -and $moduleResult.id) {
            Write-Host "✅ Module created/updated: $($moduleResult.id)" -ForegroundColor Green
            
            # Create sections from content
            Set-StudySections -ModuleId $moduleResult.id -Content $content
        } else {
            Write-Warning "⚠️ Failed to create/update module for $($file.Name)"
        }
    }
} else {
    Write-Warning "⚠️ Modules path not found: $ModulesPath"
}

# Process lab exercises if they exist
if (Test-Path $LabExercisesPath) {
    Write-Host "`n🧪 Processing lab exercises..." -ForegroundColor Blue
    $labFiles = Get-ChildItem -Path $LabExercisesPath -Filter "*.ts"
    
    foreach ($labFile in $labFiles) {
        Write-Host "🔬 Processing lab file: $($labFile.Name)" -ForegroundColor Cyan
        # Lab exercises can be processed separately or integrated into existing modules
    }
}

Write-Host "`n✅ Migration completed!" -ForegroundColor Green
Write-Host "📊 Summary:" -ForegroundColor White
Write-Host "  • Processed $($mdxFiles.Count) module files" -ForegroundColor Gray
Write-Host "  • Dry run: $DryRun" -ForegroundColor Gray

if ($DryRun) {
    Write-Host "`n💡 This was a dry run. Use -DryRun:`$false to actually migrate the data." -ForegroundColor Yellow
}