# Doc-Analyzer

Documentation-to-code alignment verification and gap analysis.

## Purpose

Analyze codebase against documentation to identify:
- Missing documentation for implemented features
- Stale documentation referencing removed/changed code
- Architecture claims vs. actual structure
- Actionable update recommendations

## Usage

```bash
/doc-analyzer                    # Full analysis
/doc-analyzer --scope src/lib    # Scoped analysis
/doc-analyzer --check features   # Specific check only
/doc-analyzer --check architecture
/doc-analyzer --check staleness
/doc-analyzer --check coverage
/doc-analyzer --output json      # JSON report
/doc-analyzer --create-tasks     # Create Archon tasks for gaps
```

## Analysis Phases

### Phase 1: Document Discovery
- Scan `.claude/*.md` (Tier 1 - Configuration)
- Scan `docs/**/*.md` (Tier 2 - Technical)
- Scan root `*.md` files (Tier 3 - Project)

### Phase 2: Code Inventory
- Map routes in `src/app/`
- Map components in `src/components/`
- Map utilities in `src/lib/`
- Map contexts in `src/contexts/`
- Map types in `src/types/`

### Phase 3: Cross-Reference Analysis
- Match documented features to code
- Verify architecture claims
- Detect stale references
- Calculate coverage score

### Phase 4: Report Generation
- Sort findings by severity
- Generate recommendations
- Output in requested format

## Core Checks

### 1. Feature Alignment
Verifies documented features exist in code.

### 2. Architecture Validation
Compares CLAUDE.md claims vs actual structure:
- Context count
- Route count
- Component inventory

### 3. Staleness Detection
Finds docs referencing removed code:
- Missing file references
- Outdated counts/statistics
- Broken internal links

### 4. Coverage Analysis
Identifies undocumented code:
- Contexts without docs
- API routes without docs
- Utilities without docs

## Output Format

```
DOC-ANALYZER REPORT
===================

SUMMARY
- Total Documents: 270
- Total Source Files: 485
- Coverage Score: 73%
- Staleness Score: 12%

GAPS FOUND (27)
[HIGH] src/contexts/ProfileContext.tsx - No documentation
[MED]  src/app/budget-app/calculators/ - Partial docs only

STALE DOCUMENTATION (8)
[STALE] docs/OLD_FEATURE.md - References removed routes

ARCHITECTURE MISMATCHES (3)
[MISMATCH] CLAUDE.md claims 11 contexts, found 14

RECOMMENDATIONS
1. Create docs for: ProfileContext, calculators/
2. Update: CLAUDE.md context count
3. Archive: OLD_FEATURE.md
```

## Integration

### With Archon
Use `--create-tasks` to auto-create tasks for gaps.

### With vibe-check
Runs vibe_check before analysis for error prevention.

## Token Budget
- Full analysis: ~20K tokens
- Scoped analysis: ~8K tokens

## See Also
- `/verify check` - Code verification
- `/swarm analysis` - General analysis swarm
