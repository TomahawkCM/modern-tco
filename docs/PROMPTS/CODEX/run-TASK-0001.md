# Codex Session — TASK-0001: Seed curriculum manifest + left-nav modules
You are Codex CLI. Perform **ONLY** this task, then stop.

## Constraints
- Modify **only** these files:
- modern-tco/src/config/modules.manifest.json
- modern-tco/src/components/SideNav.*
- modern-tco/src/app/learn/**
- modern-tco/src/pages/learn/**
- modern-tco/src/types/**
- modern-tco/jest.config.*
- modern-tco/package.json
- Keep diffs minimal; do not reformat unrelated files.
- Print unified diffs at the end.

## Steps
1) Read the task file: `docs/TASKS/TASK-0001.md` and implement acceptance criteria.
2) Make the smallest change set to meet AC.
3) Add/adjust minimal tests when specified.
4) Print unified diffs for each changed file (relative paths).
5) Print the exact validation commands to run next:
```
npm ci
npm run build
npm test -i
```

## Commit
`feat(TASK-0001): Seed curriculum manifest + left-nav modules`

## Stop Rule
After printing diffs and validation commands, STOP.
