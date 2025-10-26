# KB Export Toolkit

This directory houses the assets required to deploy and synchronize the Knowledge Base (`kb_` tables) with Supabase.

## Files

| File | Purpose |
| ---- | ------- |
| `SCHEMA_SQL_SETUP_KB.sql` | Creates tables, indexes, and read-only policies for the KB schema. |
| `LESSON_EXPORT_TEMPLATE.json` | Canonical JSON layout that mirrors the structure produced by the exporter. |
| `out/kb-lessons.json` | Latest generated bundle from `npm run kb:export-lessons`. |
| `README.md` | You are here. |

## Usage

1. **Apply Schema**
   ```bash
   npm run kb:apply-schema
   ```
   - Preview the SQL without executing it: `npm run kb:apply-schema -- -- --dry-run`
   - Target a different schema (default `kb`): `npm run kb:apply-schema -- -- --schema custom_schema`

2. **Generate Lesson Payloads**
   ```bash
   npm run kb:export-lessons
   ```
   - Reads markdown from `docs/KB/lessons/`
   - Produces a JSON bundle shaped like `LESSON_EXPORT_TEMPLATE.json`
   - Saves output into `docs/KB/export/out/kb-lessons.json`
   - Use `npm run kb:export-lessons -- --compact` for minified JSON

3. **Load Into Supabase**
   ```bash
   npm run kb:import-lessons -- -- --dry-run  # inspect planned upserts
   npm run kb:import-lessons                  # apply modules + lessons
   ```
   - Respects `KB_SCHEMA` env var or `--schema` CLI flag (defaults to `kb`)
   - Requires `SUPABASE_DB_URL` / `DIRECT_DATABASE_URL` in `.env.local`

4. **Populate Questions (Temporary)**
   ```bash
   TABLE_PREFIX=kb_ node scripts/import-questions.ts ./docs/KB/export/out/questions.json
   ```
   - Until a dedicated KB question loader ships, reuse the existing exam importer with a `kb_` prefix.

## Operational Notes

- Exports are immutable; publish a new bundle rather than mutating prior payloads.
- Keep SQL idempotent; CI applies it in every environment.
- Downstream systems expect module IDs to match the slugs defined in lesson stubs.
- Document each export batch in `docs/KB/TODO.md` until the automation dashboard exists.

## Roadmap

- [ ] Replace temporary question importer with a KB-specific loader.
- [ ] Wire exports into nightly Supabase cron function and publish checksums.
- [ ] Surface exporter/importer health in CI status badges.
