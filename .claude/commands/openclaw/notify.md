# notify

Smart contextual notification — gathers relevant context, composes a Telegram-friendly message, and delivers it.

Unlike `/openclaw/send` which is a thin delivery wrapper, `/openclaw/notify` adds intelligence: it reads project state, formats output for Telegram, and picks the right level of detail.

## Usage

```
/openclaw/notify <description>
/openclaw/notify "build passed"
/openclaw/notify "PR merged for auth feature"
/openclaw/notify "error in production deploy"
```

## Arguments

- `$ARGUMENTS` - Natural language description of what to notify about (required)

---

## Workflow Instructions

When this command is invoked, execute the following phases:

### Phase 1: Gather Context

Parse the `$ARGUMENTS` to identify the trigger type and gather relevant context:

| Trigger Phrase | Context to Gather | Commands |
|---------------|-------------------|----------|
| build, deploy, production | Last commit, build status, deploy URL | `git log -1 --oneline`, `vercel ls --limit 1` |
| PR, pull request, merge | PR title, number, URL, status | `gh pr view --json title,number,url,state` |
| test, spec, e2e | Test results summary, pass/fail counts | Read from last test output |
| error, fail, crash | Error message, stack trace (truncated), file location | Read from recent terminal output |
| summary, done, finished | Session summary: files changed, commits made | `git diff --stat HEAD~3`, `git log --oneline -5` |
| release, version, tag | Version number, changelog highlights | `git describe --tags`, recent CHANGELOG |

If the trigger doesn't match any phrase, compose a simple notification with the raw description.

### Phase 2: Compose Message

Format for Telegram using HTML (Telegram's supported markup):

**Simple notifications** (<300 chars):
```html
<b>Build Passed</b>
abc123f — feat(budget): add CSV import
https://modern-tco.vercel.app
```

**Detailed notifications** (up to 4096 chars):
```html
<b>PR #142 Merged</b>

<b>Title:</b> Add bank sync error recovery
<b>Branch:</b> feature/bank-sync-recovery → main
<b>Files:</b> 12 changed (+340, -89)

<b>Key changes:</b>
<code>src/lib/plaid/error-recovery.ts</code> — new retry logic
<code>src/components/budget/ConnectionHealth.tsx</code> — status badges
```

**Telegram HTML formatting rules:**
- `<b>bold</b>` — headers and labels
- `<code>inline code</code>` — file paths, commands, short values
- `<pre>code block</pre>` — multi-line output (use sparingly)
- No `<h1>`, `<div>`, `<span>`, `<p>` — Telegram ignores these
- Escape `<`, `>`, `&` in user content as `&lt;`, `&gt;`, `&amp;`
- Max length: 4096 characters (Telegram hard limit)

**Composition rules:**
1. Lead with a bold summary line
2. Include only actionable/useful details
3. Use line breaks for readability (Telegram respects `\n`)
4. End with a URL if one is relevant (deploy URL, PR link, etc.)
5. Keep simple notifications under 300 chars
6. Never exceed 4000 chars (leave buffer for encoding)

### Phase 3: Send Message

Deliver using the same MCP-then-CLI pattern as [send.md](./send.md):

1. Use `openclaw_message_send` MCP tool with composed message
2. Fall back to CLI if MCP fails
3. Apply defaults from [README.md](./README.md)

### Phase 4: Report

Confirm to the user what was sent:

```
NOTIFICATION SENT
  Trigger:  build passed
  Context:  last commit + deploy URL
  Length:   187 chars
  Channel:  telegram
  Status:   delivered
```

---

## Examples

### After a successful deploy
```
/openclaw/notify "production deploy complete"
```
Gathers: last commit, deploy URL. Sends:
```
Build Passed
abc123f — feat(budget): add CSV import
https://modern-tco.vercel.app
```

### After merging a PR
```
/openclaw/notify "PR merged for the auth refactor"
```
Gathers: PR details via `gh pr view`. Sends formatted PR summary.

### After a build failure
```
/openclaw/notify "build failed with type errors"
```
Gathers: error output, file location. Sends truncated error with fix hint.

### End-of-session summary
```
/openclaw/notify "done for today"
```
Gathers: recent commits, files changed. Sends session summary.
