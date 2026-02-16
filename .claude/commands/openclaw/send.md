# send

Send a message to a Telegram channel via OpenClaw.

## Usage

```
/openclaw/send <message>
/openclaw/send <message> --channel <channel> --target <id>
/openclaw/send <message> --media <path> --silent --reply-to <msg_id>
```

## Arguments

- `$ARGUMENTS` - The message text to send (required)

## Flags

- `--channel <name>` - Override default channel (default: `telegram`)
- `--target <id>` - Override default target chat ID (default: `8546681904`)
- `--media <path>` - Attach file (image, document, video) — forces CLI mode
- `--silent` - Send without notification sound — forces CLI mode
- `--reply-to <msg_id>` - Reply to a specific message — forces CLI mode

---

## Workflow Instructions

When this command is invoked, execute the following phases:

### Phase 1: Resolve Parameters

1. Extract message text from `$ARGUMENTS`
2. Apply defaults from [README.md](./README.md) for any missing parameters
3. Determine delivery method:
   - **MCP** if text-only with no advanced flags
   - **CLI** if `--media`, `--silent`, or `--reply-to` are present

### Phase 2: Send via MCP (Primary)

Use the `openclaw_message_send` MCP tool:

```
Tool: openclaw_message_send
Parameters:
  channel: "telegram"
  target: "8546681904"
  message: "<the message text>"
```

If MCP succeeds, skip to Phase 4.

### Phase 3: CLI Fallback

If MCP fails or advanced options are needed:

```bash
openclaw message send \
  --channel telegram \
  --target 8546681904 \
  --message "<the message text>" \
  [--media <path>] \
  [--silent] \
  [--reply-to <msg_id>]
```

### Phase 4: Confirm Delivery

Report the result to the user:

```
MESSAGE SENT
  Channel:  telegram
  Target:   8546681904
  Method:   MCP / CLI
  Status:   delivered / failed
  Message:  <first 100 chars>...
```

If delivery failed, suggest running `/openclaw/status` to diagnose.

---

## Examples

### Simple text message
```
/openclaw/send "Build deployed successfully to production"
```

### With media attachment
```
/openclaw/send "Here's the coverage report" --media ./coverage/report.png
```

### Silent notification
```
/openclaw/send "Background task complete" --silent
```

---

## Common Mistakes

| Mistake | What happens | Fix |
|---------|-------------|-----|
| Using `openclaw_chat` to send a message | Message goes to AI agent, not Telegram | Use `openclaw_message_send` |
| Forgetting quotes around message | Arguments parsed incorrectly | Always quote the message text |
| Sending very long messages | Telegram truncates at 4096 chars | Split into multiple messages if >4000 chars |
| Using `--media` with MCP | MCP tool doesn't support media | Command auto-detects and uses CLI |
