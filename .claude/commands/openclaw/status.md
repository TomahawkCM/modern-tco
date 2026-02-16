# status

Check OpenClaw gateway health and channel connectivity.

## Usage

```
/openclaw/status
/openclaw/status --deep
```

## Flags

- `--deep` - Run full diagnostics including channel connectivity tests

---

## Workflow Instructions

When this command is invoked, execute the following phases:

### Phase 1: Quick Health Check (MCP)

Use the `openclaw_status` MCP tool:

```
Tool: openclaw_status
Parameters: (none)
```

Report the result:

```
OPENCLAW GATEWAY STATUS
  Gateway:    http://127.0.0.1:18789
  Status:     online / offline / degraded
  Uptime:     <if available>
  Version:    <if available>
```

If gateway is offline, skip to Phase 3.

### Phase 2: Deep Diagnostics (if `--deep` or issues detected)

Run CLI diagnostics:

```bash
openclaw status --deep
```

This tests:
- Gateway process health
- Telegram bot token validity
- Channel delivery (sends a test ping)
- Webhook configuration
- Cron scheduler status

Report findings in a summary table.

### Phase 3: Auto-Fix Suggestions

If any issues are detected, suggest remediation:

| Issue | Suggested Fix |
|-------|--------------|
| Gateway offline | `openclaw start` or check if port 18789 is in use |
| Telegram bot token invalid | Verify `OPENCLAW_GATEWAY_TOKEN` in `.claude/settings.local.json` |
| Channel unreachable | Check internet connectivity, verify bot has chat access |
| Cron scheduler stopped | `openclaw cron enable` |

For automated repair, suggest:

```bash
openclaw doctor
```

This runs OpenClaw's built-in diagnostic and repair tool.

---

## Examples

### Quick check
```
/openclaw/status

OPENCLAW GATEWAY STATUS
  Gateway:    http://127.0.0.1:18789
  Status:     online
  Channels:   telegram (connected)
  Tasks:      2 running, 0 queued
```

### Deep diagnostics
```
/openclaw/status --deep

OPENCLAW DEEP DIAGNOSTICS
  Gateway:        online (uptime: 4d 12h)
  Telegram Bot:   connected (bot: @tanium_tco_bot)
  Channel Test:   delivered (latency: 230ms)
  Webhooks:       configured (2 active)
  Cron:           running (3 scheduled jobs)
  Memory:         124MB / 512MB
```
