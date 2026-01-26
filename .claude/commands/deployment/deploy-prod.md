# deploy-prod

Automated production deployment with error analysis.

Stages, commits, and pushes changes to GitHub, monitors the GitHub Actions workflow, and provides actionable error analysis if the build fails.

## Usage

```
/deploy-prod                           # Auto-generated commit message
/deploy-prod "fix: resolve type error" # Custom commit message
/deploy-prod --dry-run                 # Preview without executing
/deploy-prod --skip-typecheck          # Skip local type validation
```

## Arguments

- `$ARGUMENTS` - Optional commit message (defaults to auto-generated based on changes)

## Flags

- `--dry-run` - Preview all operations without executing
- `--skip-typecheck` - Skip running `npm run typecheck` before commit

---

## Workflow Instructions

When this skill is invoked, execute the following phases:

### Phase 1: Pre-Flight Checks

Run these checks before proceeding:

```bash
# Check for uncommitted changes
git status --porcelain

# Verify current branch
git branch --show-current

# Run type checking (unless --skip-typecheck)
npm run typecheck
```

**Decision Points:**
- If no changes exist, inform user and exit
- If typecheck fails, show errors and ask user how to proceed
- If not on `main` branch, warn user and ask for confirmation

### Phase 2: Git Operations

Stage, commit, and push:

```bash
# Stage all changes
git add -A

# Create commit with message
# Use $ARGUMENTS if provided, otherwise generate from changes
git commit -m "$MESSAGE

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# Push to origin
git push origin main
```

**Commit Message Generation (if no message provided):**
- Analyze staged changes using `git diff --cached --stat`
- Generate conventional commit format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore

### Phase 3: Monitor GitHub Actions

Watch the production workflow:

```bash
# Wait for workflow to register
sleep 5

# Get the latest workflow run ID
RUN_ID=$(gh run list --workflow="Production Pipeline" --limit 1 --json databaseId --jq '.[0].databaseId')

# If no "Production Pipeline", try common alternatives
# gh run list --limit 1 --json databaseId --jq '.[0].databaseId'

# Watch the run until completion
gh run watch $RUN_ID --exit-status
```

**If workflow not found:**
- List available workflows: `gh workflow list`
- Use the appropriate workflow name
- If no workflows, inform user that manual verification is needed

### Phase 4: Handle Results

#### On Success:

Display deployment summary:
```
DEPLOYMENT SUCCESSFUL

Commit:  $COMMIT_MESSAGE
SHA:     $COMMIT_SHA
Branch:  main
Run:     https://github.com/$REPO/actions/runs/$RUN_ID

Production URL: https://modern-tco.vercel.app
```

#### On Failure:

Fetch and analyze errors:

```bash
# Get failed job logs (last 200 lines)
gh run view $RUN_ID --log-failed | tail -200

# Get job failure details
gh run view $RUN_ID --json jobs --jq '.jobs[] | select(.conclusion == "failure")'

# Try to get Vercel deployment logs if available
vercel logs --prod 2>&1 | tail -100
```

**Error Analysis Patterns:**

| Error Pattern | Detection Regex | Recommended Fix |
|---------------|-----------------|-----------------|
| TypeScript | `error TS\d+:` | Run `npm run typecheck` locally, fix type errors |
| Module Not Found | `Can't resolve '.*'` | Check import paths, run `npm install` |
| ESLint | `eslint.*error` | Run `npm run lint:fix` |
| Build OOM | `heap out of memory` | Add `NODE_OPTIONS=--max-old-space-size=4096` |
| Next.js Config | `Error:.*next build` | Check `next.config.mjs` for issues |
| Vercel Timeout | `Function.*timeout` | Optimize API route or increase timeout |
| Missing Env | `process.env\.\w+.*undefined` | Check Vercel environment variables |

**Error Report Format:**
```
DEPLOYMENT FAILED

Error Type: [Detected Type]
Location:   [File:Line if available]

--- Error Details ---
[Relevant error output]

--- Recommended Fix ---
[Actionable steps to resolve]

--- Quick Commands ---
npm run typecheck    # Verify types locally
npm run lint         # Check linting
npm run build        # Test build locally
```

### Dry Run Mode

When `--dry-run` is specified:
1. Show all commands that would be executed
2. Display the commit message that would be used
3. List files that would be committed
4. Do NOT execute any git or deployment commands

---

## Examples

### Successful Deployment
```
> /deploy-prod "feat: add guided tour feature"

PRE-FLIGHT CHECKS
 Branch: main
 Changes: 5 files modified
 Typecheck: Passed

GIT OPERATIONS
 Staged: 5 files
 Committed: feat: add guided tour feature
 Pushed to: origin/main

GITHUB ACTIONS
 Workflow: Production Pipeline
 Run ID: 12345678
 Status: Watching...

 Build: success (2m 15s)
 Deploy: success (1m 30s)

DEPLOYMENT SUCCESSFUL
Commit:  feat: add guided tour feature
SHA:     abc123def456...
Production URL: https://modern-tco.vercel.app
```

### Failed Deployment with Analysis
```
> /deploy-prod

PRE-FLIGHT CHECKS
 Branch: main
 Typecheck: Passed

GITHUB ACTIONS
 Status: Watching...
 Build: failed

DEPLOYMENT FAILED

Error Type: TypeScript Compilation Error
Location:   src/hooks/useGuidedTour.ts:47:23

error TS2345: Argument of type 'string | undefined' is not
assignable to parameter of type 'string'.

RECOMMENDED FIX:
The variable `step.target` may be undefined. Add a null check:

  if (step.target) {
    highlightElement(step.target);
  }

Or use optional chaining with a fallback:

  highlightElement(step.target ?? '');

QUICK COMMANDS:
  npm run typecheck    # Reproduce error locally
  code src/hooks/useGuidedTour.ts:47  # Open file at error line
```

---

## Notes

- This skill requires `gh` CLI to be authenticated (`gh auth status`)
- Vercel CLI is optional but helpful for deployment logs (`vercel --version`)
- The skill monitors the GitHub Actions workflow in real-time
- Error analysis uses pattern matching to provide actionable fixes
