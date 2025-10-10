# Backup Manifest

**Created:** Fri Oct 10 00:56:26 MDT 2025
**Backup ID:** 20251010_005626
**Purpose:** Pre-deployment backup before hybrid model migration

## What Was Backed Up

### Database

- Schema dump: schema_backup.sql
- Table inventory: existing_tables.txt

### Migrations

- All existing migrations: migrations_backup/

### Generated Content

- All generated files: generated_content_backup/

### Configuration

- Environment files: config_backup/.env\*
- Package config: config_backup/package.json
- TypeScript config: config_backup/tsconfig.json
- Next.js config: config_backup/next.config.mjs
- Supabase config: config_backup/config.toml

## Restoration Instructions

If you need to restore from this backup:

### Restore Database Schema

```bash
supabase db reset
psql -h localhost -U postgres -d postgres -f backups/pre-deploy-20251010_005626/schema_backup.sql
```

### Restore Migrations

```bash
cp -r backups/pre-deploy-20251010_005626/migrations_backup/* supabase/migrations/
```

### Restore Configuration

```bash
cp backups/pre-deploy-20251010_005626/config_backup/.env.local .env.local
cp backups/pre-deploy-20251010_005626/config_backup/package.json package.json
```

### Restore Generated Content

```bash
cp -r backups/pre-deploy-20251010_005626/generated_content_backup/* src/data/generated/
```

## Verification

Run verification script:

```bash
bash scripts/verify-backup.sh backups/pre-deploy-20251010_005626
```

## Notes

- This backup was created automatically before hybrid model deployment
- All existing tables should remain unchanged
- New tables: flashcard_library, flashcard_library_progress, content_import_logs
- Migration: 20251010000003_add_content_population_tables.sql
