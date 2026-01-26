---
allowed-tools: Bash(git *), Bash(npm run typecheck), Bash(npm run lint*), Bash(npm run build), Bash(gh *), Bash(vercel *), Bash(sleep *)
description: Deploy to production with GitHub Actions monitoring
---

## Context

- Current git status: !`git status --porcelain`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -5`
- Staged changes: !`git diff --cached --stat`
- Unstaged changes: !`git diff --stat`

## Arguments

The user may provide: $ARGUMENTS

- If a commit message is provided (e.g., "fix: resolve type error"), use it
- If `--dry-run` is included, preview all operations without executing
- If `--skip-typecheck` is included, skip the typecheck step

## Your Task

Deploy the current changes to production by following these phases:

### Phase 1: Pre-Flight Checks

1. **Check for changes**: If git status shows no changes, inform the user and stop
2. **Verify branch**: If not on `main`, warn the user and ask for confirmation before proceeding
3. **Run typecheck** (unless `--skip-typecheck`): Run `npm run typecheck`. If it fails, show the errors and ask the user how to proceed

### Phase 2: Git Operations (skip if --dry-run)

1. Stage all changes: `git add -A`
2. Create commit with message:
   - Use provided message if given, OR
   - Generate a conventional commit message based on the changes (feat/fix/chore/docs/refactor)
   - Always append the co-author line
3. Push to origin: `git push origin main`

Commit format:
```
<type>(<scope>): <description>

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Phase 3: Monitor GitHub Actions (skip if --dry-run)

1. Wait briefly: `sleep 5`
2. Get latest workflow run:
   ```bash
   gh run list --workflow="Production Pipeline" --limit 1 --json databaseId --jq '.[0].databaseId'
   ```
3. Watch the run: `gh run watch $RUN_ID --exit-status`

### Phase 4: Handle Results

**On Success**, display:
```
DEPLOYMENT SUCCESSFUL

Commit:  <commit message>
SHA:     <commit sha>
Branch:  main
Run:     <github actions url>

Production URL: https://modern-tco.vercel.app
```

**On Failure**, analyze the error:

1. Get failed logs: `gh run view $RUN_ID --log-failed | tail -200`
2. Get failure details: `gh run view $RUN_ID --json jobs --jq '.jobs[] | select(.conclusion == "failure")'`

Then analyze the error and provide:
- Error type (TypeScript, ESLint, Build, etc.)
- File and line number if available
- The actual error message
- A recommended fix with specific code changes if possible
- Quick commands to reproduce/fix locally

### Dry Run Mode

If `--dry-run` is specified:
1. Show what would be committed (files list)
2. Show the commit message that would be used
3. Show the commands that would be executed
4. Do NOT execute any git or deployment commands

## Output Format

Keep output concise and actionable. Use clear section headers. Show progress as each phase completes.
