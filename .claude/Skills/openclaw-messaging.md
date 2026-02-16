---
name: openclaw-messaging
description: Use when deciding whether to send a Telegram notification via OpenClaw, composing messages for delivery, or selecting the right OpenClaw tool. Triggers on messaging, notification, Telegram, OpenClaw, or "tell Rob" contexts.
---

# OpenClaw Messaging

Reference skill for autonomous messaging decisions via the OpenClaw gateway.

## When to Use

- After completing a long-running task (deploy, migration, large refactor)
- On build or test failure that blocks progress
- When the user explicitly asks to be notified
- After creating or merging a pull request
- When a background task finishes (async chat, scheduled job)

## When NOT to Use

- Routine file edits or small fixes (too noisy)
- When the user is actively engaged in conversation (they can see the output)
- For questions that need an answer before proceeding (use `AskUserQuestion` instead)

## Tool Selection

| Need | Tool | MCP Name |
|------|------|----------|
| Ask OpenClaw a question | MCP | `openclaw_agent_ask` (`deliver: true` to also send to Telegram) |
| Send text to Telegram | MCP | `openclaw_message_send` |
| Send media/silent/reply | CLI | `openclaw message send --media ...` |
| AI-to-AI gateway conversation | MCP | `openclaw_chat` |
| Long-running async task | MCP | `openclaw_chat_async` |
| Check gateway health | MCP | `openclaw_status` |
| Poll async task result | MCP | `openclaw_task_status` |
| Cron scheduling | CLI | `openclaw cron add ...` |

**`openclaw_agent_ask`** returns the response to Claude by default. Set `deliver: true` only when the user also wants the answer sent to Telegram.

**`openclaw_chat` does NOT deliver to Telegram.** Always use `openclaw_message_send` for human-facing messages.

## Conversational Relay

Use this pattern when the user wants to interact with OpenClaw as a remote collaborator — asking questions, reviewing answers, and sending follow-up instructions.

**Tool**: `openclaw_agent_ask`

**Flow**:

1. **Ask** — Call `openclaw_agent_ask` with the user's question. The response comes back to Claude (not Telegram).
2. **Show** — Present OpenClaw's response to the user.
3. **Direction** — The user decides on next steps (approve, reject, modify, ask follow-up).
4. **Relay** — Call `openclaw_agent_ask` again with follow-up instructions based on the user's direction.
5. **Repeat** steps 2–4 as needed.

**When to use**:

- User asks "What is OpenClaw working on?" or "Ask OpenClaw about X"
- User wants to review OpenClaw's output before deciding next steps
- Coordinating between Claude and OpenClaw on a shared task

**`deliver` parameter**: Leave unset (defaults to `false`) for conversational relay. Only set `deliver: true` when the user explicitly wants the response pushed to Telegram as well.

## Defaults

- **Channel**: `telegram`
- **Target**: `8546681904`
- **Gateway**: `http://127.0.0.1:18789`

## Message Formatting

Telegram supports HTML: `<b>`, `<code>`, `<pre>`. No markdown. Max 4096 chars.

Keep notifications concise: bold summary line, key details, relevant URL. Under 300 chars for simple status updates.

## Commands Reference

For full workflows, see the command files:

- `/openclaw/send` — direct message delivery
- `/openclaw/notify` — context-aware smart notifications
- `/openclaw/status` — gateway health checks
- `/openclaw/cron` — scheduled messages
