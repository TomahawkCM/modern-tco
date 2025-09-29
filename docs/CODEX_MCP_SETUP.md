# Codex-Only MCP Configuration

This project includes a Codex-specific MCP config that does not touch or override any other AI tooling.

## Files

- `.mcp.codex.json` — Minimal MCP set: `supabase`, `shadcn`, `postgresql`.
- `scripts/codex-run-mcp.ps1` — PowerShell runner that uses the Codex MCP config.
- `scripts/codex-run-mcp.sh` — Bash/WSL runner that uses the Codex MCP config.

## Usage

PowerShell:

```
./scripts/codex-run-mcp.ps1 -Prompt docs/PROMPTS/some-task.md
```

Bash/WSL:

```
bash scripts/codex-run-mcp.sh docs/PROMPTS/some-task.md
```

NPM (cross-platform wrapper):

```
npm run codex:mcp -- docs/PROMPTS/CODEX/run-TASK-0001.md
```

To make these servers appear in `codex mcp list` (Codex’s global MCP registry), sync the project config:

```
npm run codex:mcp:sync
```

This imports servers from `.mcp.codex.json` into Codex’s global registry without persisting secrets. Ensure your environment has the required variables set when running Codex.

If this is a personal dev machine and you want Codex to always load MCPs (with secrets) whenever you run `codex` in WSL, persist env to the global registry:

```
npm run codex:mcp:sync:global
```

This writes the necessary `env` values into `~/.codex/config.toml` under each `[mcp_servers.<name>.env]`. You can verify with `codex mcp get supabase --json`.

Both scripts:
- Keep the working directory at the project root.
- Pass the MCP config to Codex via env vars and, when supported, the `--mcp-config` flag.
- Load required environment variables from your shell, falling back to `.env.local` for:
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`
  - `DATABASE_URL` (falls back to `SUPABASE_DB_URL` if not set)

## Why this approach

- No changes to `.mcp.json` or any existing AI configs.
- Env vars are scoped to the Codex process only; the shell session is restored after the run (PowerShell) or isolated to the child process (Bash).

## Notes

- Ensure your `.env.local` contains valid Supabase credentials. The scripts do not write or persist any secrets.
- If your `codex` binary supports `--mcp-config`, the scripts will use it; otherwise, they fall back to standard MCP config env vars.

Tip: `codex mcp list --json` shows what Codex has registered globally. Project-local `.mcp.codex.json` is not read by `codex mcp list` until you run the sync step above.
