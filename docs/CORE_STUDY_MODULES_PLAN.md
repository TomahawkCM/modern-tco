# Core Study Modules Implementation Plan (Modern TCO)

## 🪟 PowerShell Study Modules Development Environment

### PowerShell Setup for Core Study Modules

```powershell
# Core Study Modules - PowerShell Development Setup
Write-Host "📚 Core Study Modules Development Environment" -ForegroundColor Magenta

# Set development environment for study modules
$env:NODE_ENV = "development"
$env:FORCE_COLOR = "1"
$env:STUDY_MODULE_DEV = "true"

# Navigate to TCO project
if (Test-Path "modern-tco") {
    Set-Location "modern-tco"
    Write-Host "✅ Navigated to study modules directory" -ForegroundColor Green
} else {
    Write-Host "❌ TCO project directory not found" -ForegroundColor Red
    exit 1
}

# Verify core study module files
$moduleFiles = @(
    "src/content/modules/01-asking-questions.mdx",
    "src/content/modules/02-refining-questions-targeting.mdx",
    "src/content/modules/03-taking-action-packages-actions.mdx",
    "src/content/modules/04-navigation-basic-modules.mdx",
    "src/content/modules/05-reporting-data-export.mdx"
)

Write-Host "`n📋 Core Study Module Files Verification:" -ForegroundColor Blue
foreach ($module in $moduleFiles) {
    if (Test-Path $module) {
        $content = Get-Content $module -Raw -ErrorAction SilentlyContinue
        $lineCount = ($content -split "`n").Count
        Write-Host "✅ $($module.Split('/')[-1]): $lineCount lines" -ForegroundColor Green
    } else {
        Write-Host "❌ $($module.Split('/')[-1]): Missing" -ForegroundColor Red
    }
}
```

### PowerShell Module Development Commands

```powershell
# Study module development and testing pipeline
function Start-StudyModulePipeline {
    param(
        [string]$Module = "all",
        [switch]$ValidateOnly,
        [switch]$TestMDX,
        [switch]$GenerateReports
    )
    
    Write-Host "`n🚀 Study Module Development Pipeline" -ForegroundColor Magenta
    
    # Pipeline steps
    $pipeline = @(
        @{ Step = "Module Validation"; Action = { Test-StudyModules } },
        @{ Step = "MDX Structure Check"; Action = { Test-MDXStructure } },
        @{ Step = "Content Quality"; Action = { Test-ModuleContent } },
        @{ Step = "Domain Alignment"; Action = { Test-DomainAlignment } }
    )
    
    foreach ($step in $pipeline) {
        Write-Host "`n📋 $($step.Step)..." -ForegroundColor Blue
        try {
            & $step.Action
            Write-Host "✅ $($step.Step) completed" -ForegroundColor Green
        } catch {
            Write-Host "❌ $($step.Step) failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    if ($GenerateReports) {
        Export-StudyModuleReport
    }
}

# Study module validation functions
function Test-StudyModules {
    Write-Host "🔍 Validating study module structure..." -ForegroundColor Cyan
    
    $moduleDir = "src/content/modules"
    if (-not (Test-Path $moduleDir)) {
        Write-Host "❌ Module directory not found: $moduleDir" -ForegroundColor Red
        return
    }
    
    $modules = Get-ChildItem $moduleDir -Filter "*.mdx" -File
    
    if ($modules.Count -eq 0) {
        Write-Host "⚠️ No MDX modules found" -ForegroundColor Yellow
        return
    }
    
    Write-Host "📊 Found $($modules.Count) study modules:" -ForegroundColor Green
    foreach ($module in $modules) {
        Write-Host "  ✅ $($module.Name)" -ForegroundColor Green
    }
}

function Test-MDXStructure {
    Write-Host "🏗️ Testing MDX structure and frontmatter..." -ForegroundColor Cyan
    
    $modules = Get-ChildItem "src/content/modules" -Filter "*.mdx" -File -ErrorAction SilentlyContinue
    
    foreach ($module in $modules) {
        $content = Get-Content $module.FullName -Raw
        
        # Check frontmatter
        if ($content -match "^---\s*\n(.*?)\n---" -and $matches[1]) {
            Write-Host "  ✅ $($module.Name): Valid frontmatter" -ForegroundColor Green
            
            # Check required frontmatter fields
            $frontmatter = $matches[1]
            $requiredFields = @("title", "domain", "estimatedTime", "difficulty")
            
            foreach ($field in $requiredFields) {
                if ($frontmatter -match "$field\s*:") {
                    Write-Host "    ✅ $field found" -ForegroundColor Green
                } else {
                    Write-Host "    ⚠️ $field missing" -ForegroundColor Yellow
                }
            }
        } else {
            Write-Host "  ❌ $($module.Name): Invalid or missing frontmatter" -ForegroundColor Red
        }
        
        # Check Learn/Practice/Assess sections
        $sections = @("## Learn", "## Practice", "## Assess")
        foreach ($section in $sections) {
            if ($content -match [regex]::Escape($section)) {
                Write-Host "    ✅ $section section found" -ForegroundColor Green
            } else {
                Write-Host "    ⚠️ $section section missing" -ForegroundColor Yellow
            }
        }
    }
}

function Test-ModuleContent {
    Write-Host "✨ Testing module content quality..." -ForegroundColor Cyan
    
    $modules = Get-ChildItem "src/content/modules" -Filter "*.mdx" -File -ErrorAction SilentlyContinue
    
    foreach ($module in $modules) {
        $content = Get-Content $module.FullName -Raw
        $wordCount = ($content -split '\s+').Count
        $lineCount = ($content -split "`n").Count
        
        Write-Host "  📄 $($module.Name):" -ForegroundColor Cyan
        Write-Host "    📝 Word count: $wordCount" -ForegroundColor Gray
        Write-Host "    📏 Line count: $lineCount" -ForegroundColor Gray
        
        # Content quality checks
        if ($wordCount -lt 500) {
            Write-Host "    ⚠️ Content may be too short" -ForegroundColor Yellow
        } elseif ($wordCount -gt 5000) {
            Write-Host "    ⚠️ Content may be too long" -ForegroundColor Yellow
        } else {
            Write-Host "    ✅ Content length appropriate" -ForegroundColor Green
        }
    }
}

function Test-DomainAlignment {
    Write-Host "🎯 Testing TCO domain alignment..." -ForegroundColor Cyan
    
    # Expected domains and weights
    $domains = @{
        1 = @{ Name = "Asking Questions"; Weight = 22 }
        2 = @{ Name = "Refining Questions"; Weight = 23 }
        3 = @{ Name = "Taking Action"; Weight = 15 }
        4 = @{ Name = "Navigation"; Weight = 23 }
        5 = @{ Name = "Reporting"; Weight = 17 }
    }
    
    $modules = Get-ChildItem "src/content/modules" -Filter "*.mdx" -File -ErrorAction SilentlyContinue
    
    foreach ($domain in $domains.GetEnumerator()) {
        $domainModules = $modules | Where-Object { $_.Name -match "0$($domain.Key)-" }
        
        if ($domainModules) {
            Write-Host "  ✅ Domain $($domain.Key) ($($domain.Value.Name)): Module found" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Domain $($domain.Key) ($($domain.Value.Name)): No module found" -ForegroundColor Red
        }
    }
}

function Export-StudyModuleReport {
    $reportPath = "docs/study-modules-report.json"
    
    $modules = Get-ChildItem "src/content/modules" -Filter "*.mdx" -File -ErrorAction SilentlyContinue
    $moduleData = @()
    
    foreach ($module in $modules) {
        $content = Get-Content $module.FullName -Raw -ErrorAction SilentlyContinue
        $moduleData += @{
            Name = $module.Name
            WordCount = ($content -split '\s+').Count
            LineCount = ($content -split "`n").Count
            HasFrontmatter = $content -match "^---\s*\n.*?\n---"
            LastModified = $module.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
        }
    }
    
    $report = @{
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        TotalModules = $modules.Count
        Modules = $moduleData
        Status = "Generated via PowerShell pipeline"
    }
    
    $report | ConvertTo-Json -Depth 3 | Out-File $reportPath -Encoding UTF8
    Write-Host "📊 Study module report exported: $reportPath" -ForegroundColor Green
}

# Execute study module pipeline
Start-StudyModulePipeline -GenerateReports
```

### PowerShell Development Workflow

```powershell
# Development workflow for study modules
function Start-ModuleDevelopment {
    param(
        [string]$ModuleName,
        [int]$Domain = 1
    )
    
    Write-Host "`n🛠️ Starting Module Development Workflow" -ForegroundColor Blue
    
    # Development steps
    Write-Host "📋 Development Checklist:" -ForegroundColor Cyan
    Write-Host "  1. 📝 Create/Edit MDX content" -ForegroundColor Gray
    Write-Host "  2. 🔍 Validate frontmatter and structure" -ForegroundColor Gray
    Write-Host "  3. 🎯 Check domain alignment" -ForegroundColor Gray
    Write-Host "  4. ✨ Test content quality" -ForegroundColor Gray
    Write-Host "  5. 🚀 Run development server" -ForegroundColor Gray
    Write-Host "  6. 🌐 Test in browser" -ForegroundColor Gray
    
    # Quick validation
    if ($ModuleName) {
        $modulePath = "src/content/modules/$ModuleName"
        if (Test-Path $modulePath) {
            Write-Host "`n✅ Module found: $ModuleName" -ForegroundColor Green
            Test-StudyModules
        } else {
            Write-Host "`n❌ Module not found: $ModuleName" -ForegroundColor Red
        }
    }
    
    # Start dev server
    Write-Host "`n🚀 Starting development server..." -ForegroundColor Green
    Write-Host "💡 Run 'npm run dev' to start the development server" -ForegroundColor Cyan
    Write-Host "💡 Open http://localhost:3000/modules to test modules" -ForegroundColor Cyan
}

# Module development helper
Start-ModuleDevelopment
```

## Scope and Current Assets

- **Core MDX modules created** under `src/content/modules`:
  - `01-asking-questions.mdx`
  - `02-refining-questions-targeting.mdx`
  - `03-taking-action-packages-actions.mdx`
  - `04-navigation-basic-modules.mdx`
  - `05-reporting-data-export.mdx`
- **Goal**: Integrate these into a full Learn → Practice → Assess experience with progress tracking, analytics, offline support, and documentation.

### Milestones (p1–p12) with Subtasks

- **p1: MDX loader/renderer with typed frontmatter schema** [in_progress]
  - p1.1: Decide MDX pipeline (native MDX vs `next-mdx-remote`) and import strategy
  - p1.2: Define frontmatter schema (zod) and TypeScript types
  - p1.3: Specify content discovery (glob) and metadata aggregation
  - p1.4: Error handling for missing fields, bad slugs, schema violations
- **p2: Routes** `/modules` and `/modules/[slug]`
  - p2.1: Define slug rules and filename mapping
  - p2.2: Plan 404/redirect behavior and site map
  - p2.3: SEO metadata extraction from frontmatter
- **p3: Modules index page**
  - p3.1: Design card layout + sorting/filter (domain/difficulty/time)
  - p3.2: Accessibility and empty/error states
- **p4: Cross-linking domains ↔ modules**
  - p4.1: Central mapping utility for slugs/enums used by both sides
- **p5: Learn → Practice → Assess flow**
  - p5.1: Define state machine and gating rules
- **p6: Practice integration with QuestionsContext**
  - p6.1: Tag schema (domain, objectiveId, moduleId, difficulty)
- **p7: Assess engine + remediation**
  - p7.1: Scoring, remediation selection, review UX
- **p8: Persist progress to ModuleContext and Supabase**
  - p8.1: RLS policy review and `module_progress` needs
- **p9: Offline caching + resume**
  - p9.1: PWA/caching strategy; content versioning
- **p10: Analytics dashboards**
  - p10.1: Event taxonomy and KPIs
- **p11: Tests & CI**
  - p11.1: Test matrix and CI gating for content validity
- **p12: Docs/README**
  - p12.1: Authoring guidelines for MDX modules and labs

### Acceptance Criteria (Per Milestone)

- **p1**: zod schema validates required fields; CI fails on invalid content; all 5 modules load; duplicate/bad slugs error clearly.
- **p2**: `/modules` lists all modules with frontmatter metadata; `/modules/[slug]` renders content; invalid slugs 404; sitemap correct; SEO from frontmatter.
- **p3**: Filter by domain/difficulty/time; sort by time/title/difficulty; keyboard accessible; empty/error states defined.
- **p4**: Domain pages link to relevant modules via single mapping utility; module pages link back to domain hub; mapping tests pass.
- **p5**: State machine enforces Learn → Practice → Assess; resume works; boundary navigation safe; telemetry for start/complete/fail.
- **p6**: Practice pulls targeted questions by tags; safe fallback on small/empty pools; domain weight distribution maintained when feasible.
- **p7**: Deterministic scoring; passThreshold gating; wrong answers feed remediation; review mode shows explanations/references; telemetry captured.
- **p8**: Progress persists locally and to Supabase; offline queue with backoff; conflict resolution via “latest write wins”; RLS enforced; tests for serialization/merge.
- **p9**: MDX content cached; offline reading support; versioned invalidation; resume works offline → online.
- **p10**: Dashboard for mastery by domain/objective, time distribution, drop-offs; CSV export; render <200ms for 1k records.
- **p11**: CI validates frontmatter, links, duplicate slugs; unit + e2e tests pass; >90% coverage for module pipeline utilities.
- **p12**: Authoring and ops guides complete; README links to plan and guides.

### Dependencies and Sequencing

- p1 → p2 → (p3, p4)
- p5 depends on p1 & p2
- p6, p7, p8 depend on p5
- p9 depends on p1 & p2 (optionally p8 for sync)
- p10 depends on p5 & p8
- p11 depends on all; p12 runs alongside

### Risks and Mitigations

- **Schema churn**: Version the schema; CI checks; migration notes.
- **MDX performance**: Precompute metadata; lazy-load heavy components; perf budgets.
- **Tag consistency**: Central enums and zod validation; lint rule on tag usage.
- **Offline limits**: Compress/prune caches; versioned invalidation policy.
- **RLS issues**: Add integration test; local fallback if remote fails.

### Non-Functional Requirements

- **Accessibility**: Keyboard flows, focus management, live regions, contrast.
- **Performance**: TTI < 2.5s on `/modules`; LCP < 2.5s on module pages; page weight <300KB gzipped (excluding fonts).
- **Offline**: Read modules and resume offline; sync within 5s on reconnect.
- **Reliability**: No unhandled errors; retries with backoff; structured logs.

### Definition of Done

- All milestone acceptance criteria met.
- No TypeScript/linter errors.
- Tests and CI content validation green.
- Docs updated; blueprint domain distribution within ±2%.
- “Taking Action” pool meets target (domain 3 coverage uplift delivered).

### Timeline

- **Week 1**: p1 (loader/schema), p2 (routes)
- **Week 2**: p3 (index), p4 (cross-link), p5 (flow)
- **Week 3**: p6 (Practice with tags), p7 (Assess/remediation), p8 (persistence)
- **Week 4**: p9 (offline), p10 (analytics), p11 (tests/CI), p12 (docs)

### Resourcing and Ownership

- **Content pipeline (p1–p4)**: Frontend/Platform
- **Learning flows (p5–p7)**: Frontend + Product/UX
- **Persistence/Offline/Analytics (p8–p10)**: Frontend + Backend/Supabase
- **Tests/Docs (p11–p12)**: QA/Dev + Tech Writer

### Communication and Reviews

- Checkpoint at end of each week; daily async updates.
- Design review for p3/p5 UI/UX; security review for p8 (RLS).

### Rollout Plan

- Staging behind feature flag → dogfood → production ramp.
- Rollback: disable flag; revert to cached content-only mode; progress queue preserved.

### KPIs and Success Metrics

- Module completion rate; objective mastery uplift; time-on-task.
- Distribution compliance (domains ±2% of blueprint).
- Error rates (content validation, runtime); page performance targets.
