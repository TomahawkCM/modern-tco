# GitHub Actions Workflows

This directory contains automated workflows for the Budget App project.

## Available Workflows

### 🌍 i18n-translation.yml

**Auto-translate i18n Messages**

Automatically translates changes to `src/i18n/messages/en-US.json` into all 113 supported locales when a PR is opened or updated.

#### Trigger Conditions

- **Event**: Pull request (opened, synchronize, reopened)
- **Path**: `src/i18n/messages/en-US.json`
- **Exclusion**: Skips if PR branch starts with `i18n/auto-translate-`

#### What It Does

1. **Detects Changes**: Identifies modified/added keys in `en-US.json`
2. **Runs Translation**: Uses `npm run translate:incremental` with Claude AI
3. **Validates Quality**: Checks terminology against glossaries
4. **Commits Results**: Pushes translations back to the same PR
5. **Posts Comment**: Adds a summary comment to the PR

#### Setup Requirements

**Required Secret:**

```
ANTHROPIC_API_KEY
```

To configure:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `ANTHROPIC_API_KEY`
4. Value: Your Anthropic API key from https://console.anthropic.com/

#### Workflow Steps

1. ✅ **Checkout**: Fetches PR branch
2. ✅ **Setup**: Installs Node.js 20 and dependencies
3. 🔑 **API Key Check**: Verifies `ANTHROPIC_API_KEY` is configured
4. 🌍 **Translate**: Runs incremental translation (skipped if no API key)
5. 📝 **Commit**: Commits translated files to PR
6. 💬 **Comment**: Posts completion summary to PR
7. 📊 **Quality Check**: Runs coverage report (non-blocking)

#### Output Files

The workflow updates:

- `src/i18n/messages/*.json` (113 locale files)
- `scripts/.translation-cache.json` (translation cache)

#### Example PR Comment

```markdown
## 🌍 Auto-translation Complete

I've automatically translated the updated keys in `en-US.json` to **113 locales**.

### What was translated

- ✅ All changed/added keys in `en-US.json`
- ✅ Glossary-validated terminology
- ✅ Quality checks passed

### Files updated

- `src/i18n/messages/*.json` (113 locale files)
- `scripts/.translation-cache.json` (translation cache)

### Review checklist

- [ ] Verify translations in key locales (es-MX, fr-FR, de-DE, pt-BR, ja-JP)
- [ ] Check RTL languages if applicable (ar-SA, he-IL, fa-IR, ur-PK)
- [ ] Run `npm run coverage:report` to verify coverage increased
```

#### Security Features

- ✅ **No Command Injection**: Uses environment variables for untrusted input
- ✅ **Minimal Permissions**: Only `contents: write` and `pull-requests: write`
- ✅ **Concurrency Control**: One workflow per PR
- ✅ **Bot Detection**: Skips auto-translation PRs to prevent loops

#### Manual Override

If the workflow fails or you need to translate locally:

```bash
# Set API key
export ANTHROPIC_API_KEY="your-key-here"

# Run translation
npm run translate:incremental

# Commit changes
git add src/i18n/messages/*.json scripts/.translation-cache.json
git commit -m "chore(i18n): manual translation update"
git push
```

#### Troubleshooting

**Problem**: Workflow skipped with "ANTHROPIC_API_KEY not configured"

- **Solution**: Add the API key secret (see Setup Requirements)

**Problem**: Translation quality issues

- **Solution**: Check `/src/i18n/glossaries/` for terminology standards

**Problem**: Workflow doesn't trigger

- **Solution**: Ensure `en-US.json` was modified in the PR

**Problem**: Workflow runs in a loop

- **Solution**: Verify PR branch doesn't start with `i18n/auto-translate-`

#### Performance

- **Average runtime**: 2-5 minutes (depends on number of changed keys)
- **API cost**: ~$0.01-0.10 per run (Claude API pricing)
- **Cache efficiency**: 90%+ cache hit rate for unchanged keys

#### Related Scripts

- `scripts/translate-incremental.ts`: Core translation logic
- `scripts/lib/key-differ.ts`: Git diff key detection
- `scripts/lib/translation-quality.ts`: Quality validation
- `src/i18n/glossaries/*.json`: Terminology standards

---

**Created**: 2025-12-30
**Task**: 65 - CI/CD auto-translation workflow
**Status**: Active ✅
