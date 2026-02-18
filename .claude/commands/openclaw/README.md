# OpenClaw Commands

Messaging and notification commands via the OpenClaw AI gateway (Telegram delivery).

## Available Commands

- [send](./send.md) - Send a message to a channel
- [notify](./notify.md) - Smart contextual notification (gathers context, composes message)
- [status](./status.md) - Gateway health and channel diagnostics
- [cron](./cron.md) - Manage scheduled messages and tasks

## Shared Defaults

| Setting | Value | Notes |
|---------|-------|-------|
| Channel | `telegram` | Primary delivery channel |
| Target | `8546681904` | Rob's Telegram chat ID |
| Gateway | `http://127.0.0.1:18789` | Local OpenClaw gateway |
| Auth | `OPENCLAW_GATEWAY_TOKEN` env var | Set in `.claude/settings.local.json` |

All commands inherit these defaults. Override per-invocation with `--channel` / `--target` flags.

## Tool Priority

Use MCP tools when possible. Fall back to CLI for advanced features.

| Need | Tool | Why |
|------|------|-----|
| Ask OpenClaw a question | `openclaw_agent_ask` (MCP) | Returns response to Claude; set `deliver: true` to also send to Telegram |
| Send text message | `openclaw_message_send` (MCP) | Fast, structured, auto-confirmed |
| Send with media/buttons/silent | `openclaw` CLI via Bash | MCP tool only supports text |
| Gateway health check | `openclaw_status` (MCP) | Quick status |
| Deep diagnostics | `openclaw status --deep` CLI | Full connectivity report |
| Cron management | `openclaw` CLI via Bash | No MCP tools for cron |
| Long-running AI chat | `openclaw_chat_async` (MCP) | Non-blocking, use `openclaw_task_status` to poll |
| Task management | `openclaw_task_list` / `openclaw_task_cancel` (MCP) | List or cancel async tasks |

## Critical Warning

**`openclaw_chat` does NOT deliver messages to Telegram.** It is an AI-to-AI conversation tool (Claude talking to the OpenClaw agent). To send a message to a human on Telegram, always use `openclaw_message_send`.

| Tool | Delivers to Telegram? | Use for |
|------|----------------------|---------|
| `openclaw_message_send` | Yes | Sending messages to humans |
| `openclaw_agent_ask` | Only with `deliver: true` | Asking OpenClaw questions; response returns to Claude |
| `openclaw_chat` | No | AI-to-AI conversations with the gateway agent |
| `openclaw_chat_async` | No | Long-running AI-to-AI tasks |
