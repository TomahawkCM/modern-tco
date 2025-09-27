# KB App Integration Plan

## Purpose

This plan documents how the read-only Knowledge Base (KB) integrates with the modern TCO application, covers the Supabase schema required for `kb_` tables, and provides the automation needed to ingest lesson content, generate exports, and validate the `/kb` experience.

## Current Status Snapshot

- **Frontend**: `src/app/kb/page.tsx` renders KB metrics using `getKbModules()` and `getKbSummary()`.
- **Service Layer**: `src/lib/kb-service.ts` queries `kb_modules` and `kb_questions` tables via Supabase.
- **Automation**: `npm run kb:apply-schema`, `npm run kb:import-lessons`, and `npm run kb:export-lessons` wire the docs-driven workflow into the database.
- **Content Source**: Lesson stubs live under `docs/KB/lessons/` and are transformed into structured rows via the importer; JSON bundles land in `docs/KB/export/out/`.

## Data Model

### Tables

| Table | Purpose | Key Columns |
| ----- | ------- | ----------- |
| `kb_modules` | Master list of KB lesson modules displayed in the UI | `id`, `title`, `domain`, `status`, `metadata`, `order_index` |
| `kb_lessons` | Structured lesson pages mapped to modules | `id`, `module_id`, `slug`, `title`, `summary`, `duration_minutes`, `contributors`, `status`, `content` |
| `kb_questions` | Question bank aligned with KB domains | `id`, `module_id`, `domain`, `question`, `answer`, `choices`, `difficulty`, `tags`, `metadata` |
| `kb_exports` | Tracks export batches pushed to downstream systems | `id`, `batch_type`, `status`, `started_at`, `completed_at`, `payload_path`, `metadata` |

### Relationships

- `kb_lessons.module_id` -> `kb_modules.id`
- `kb_questions.module_id` -> `kb_modules.id`
- Domain codes follow `AQ`, `RQ`, `TA`, `NB`, `RD` and map through `mapKbDomain()` in the UI.

### Required SQL

1. Run `npm run kb:apply-schema` (or `npm run kb:apply-schema -- --dry-run` to preview) to create tables, indexes, and read-only RLS policies defined in `docs/KB/export/SCHEMA_SQL_SETUP_KB.sql`.
2. (Optional) Seed demo questions by reusing `scripts/import-questions.ts` with `TABLE_PREFIX=kb_` until the dedicated KB question loader ships.

## Integration Workflow

1. **Prepare Environment**
   - Copy `.env.example` -> `.env.local` and ensure Supabase keys for both REST and direct Postgres connections are configured.
   - Enable Database Admin access in the Supabase project.

2. **Provision Schema**
   - Apply the KB schema with `npm run kb:apply-schema` (supports `--dry-run` and custom `--schema` overrides).
   - Verify tables with `npm run check:tables` (expects `kb_` schema objects once the apply step succeeds).

3. **Populate Modules & Lessons**
   - Author markdown lesson stubs in `docs/KB/lessons/`.
   - Inspect planned mutations via `npm run kb:import-lessons -- --dry-run`.
   - Execute the import with `npm run kb:import-lessons` to upsert `kb_modules` and `kb_lessons`.

4. **Generate Export Bundles**
   - Produce JSON payloads with `npm run kb:export-lessons` (writes to `docs/KB/export/out/kb-lessons.json`).
   - Attach the export artifact to downstream review or Supabase storage as needed.

5. **Validate**
   - Visit `/kb`; cards should show counts > 0 when tables are populated.
   - `getKbSummary()` should return `{ hasKbTables: true }` once the schema exists.
   - RLS permits anonymous `SELECT` but blocks `INSERT/UPDATE`; service account mutations should flow through the importer.

## Testing Strategy

- **Unit**: Extend `src/lib/kb-service.test.ts` (to be created) targeting domain mapping, error fallbacks, and importer regression coverage.
- **API**: Add Supabase PostgREST smoke checks once `kb_` tables are populated.
- **E2E**: Playwright spec can assert that `/kb` renders module cards in alphabetical order with non-zero metrics when seed data exists.

## Release Checklist

- [ ] Schema applied in Supabase environments (dev/stage/prod).
- [ ] Lessons authoring process documented in `docs/KB/TODO.md` and shared with content editors.
- [ ] Export README reflects automation commands and bundle locations.
- [ ] `/kb` route exhibits non-zero metrics in production analytics.
- [ ] Data catalog updated with KB module descriptions and status values.

## Open Questions

1. Should KB lessons power in-app MDX pages or remain external references?
2. Do we expose KB data through the public API for partner portals?
3. What is the retention policy for `kb_exports` artifacts?

## Next Steps

- Plumb the KB importer into CI (invoke `npm run kb:import-lessons -- --dry-run`) ahead of Playwright smoke tests.
- Implement a dedicated `kb_questions` loader and align `/kb` metrics with production Supabase row counts.
- Backfill historical KB questions once legal review clears redistribution.
- Schedule nightly lesson exports and publish checksum manifests for downstream consumers.