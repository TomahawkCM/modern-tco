# cron

Manage scheduled messages and tasks via the OpenClaw CLI.

This command is **CLI-only** — there are no MCP tools for cron management.

## Usage

```
/openclaw/cron list
/openclaw/cron add "<message>" --cron "<schedule>" [--channel telegram] [--target <id>]
/openclaw/cron disable <job_id>
/openclaw/cron enable <job_id>
/openclaw/cron rm <job_id>
/openclaw/cron run <job_id>
```

## Subcommands

| Subcommand | Description |
|-----------|-------------|
| `list` | Show all scheduled jobs with status |
| `add` | Create a new scheduled job |
| `disable` | Pause a job (keeps config) |
| `enable` | Resume a paused job |
| `rm` | Delete a job permanently |
| `run` | Trigger a job immediately (one-off) |

## Key Options for `add`

| Option | Description | Example |
|--------|-------------|---------|
| `--cron "<expr>"` | Standard cron expression | `--cron "0 8 * * *"` (daily 8am) |
| `--every "<interval>"` | Human-readable interval | `--every "30m"`, `--every "2h"` |
| `--at "<time>"` | One-shot scheduled time | `--at "2024-03-15 14:00"` |
| `--tz "<timezone>"` | Timezone for schedule | `--tz "America/Toronto"` |
| `--announce` | Send confirmation when job is created | (flag, no value) |
| `--channel` | Override default channel | `--channel telegram` |
| `--target` | Override default target | `--target 8546681904` |

---

## Workflow Instructions

When this command is invoked, execute the following:

### For `list`

```bash
openclaw cron list
```

Format output as a table:

```
SCHEDULED JOBS
  ID    Schedule          Status    Message
  c01   0 8 * * *        active    Daily standup reminder
  c02   0 18 * * 5       active    Weekly summary
  c03   */30 * * * *     paused    Health check ping
```

### For `add`

1. Parse the user's intent from `$ARGUMENTS`
2. Translate natural language to cron if needed:

| User says | Cron expression |
|-----------|----------------|
| "every morning at 8" | `0 8 * * *` |
| "every hour" | `0 * * * *` |
| "weekdays at 9am" | `0 9 * * 1-5` |
| "every Friday at 5pm" | `0 17 * * 5` |
| "every 30 minutes" | `*/30 * * * *` |
| "first of each month" | `0 9 1 * *` |

3. Confirm the schedule with the user before creating
4. Execute:

```bash
openclaw cron add \
  --message "<message>" \
  --cron "<expression>" \
  --channel telegram \
  --target 8546681904 \
  --tz "America/Toronto" \
  --announce
```

### For `disable` / `enable` / `rm` / `run`

```bash
openclaw cron <subcommand> <job_id>
```

Confirm destructive operations (`rm`) with the user before executing.

---

## Examples

### List all cron jobs
```
/openclaw/cron list
```

### Add a daily reminder
```
/openclaw/cron add "Good morning! Time to review PRs." --cron "0 8 * * 1-5"
```

### Add with natural language
```
/openclaw/cron add "Weekly budget review reminder" every Friday at 5pm
```
Translates to: `openclaw cron add --message "Weekly budget review reminder" --cron "0 17 * * 5" --tz "America/Toronto"`

### Pause a job
```
/openclaw/cron disable c03
```

### Trigger a job now
```
/openclaw/cron run c01
```
