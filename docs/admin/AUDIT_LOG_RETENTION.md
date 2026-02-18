# Audit Log Retention Policy & Cleanup

## Recommendation

- **Retention window:** 180 days (6 months)
- **Cleanup cadence:** nightly (off-hours)
- **Justification:** balances forensic value with storage cost

## Supabase SQL (manual / scheduled)

Run this periodically (e.g., nightly) to prune old entries:

```sql
-- Delete audit log entries older than 180 days
DELETE FROM audit_log
WHERE created_at < now() - interval '180 days';
```

## Optional: Keep Critical Events Longer

If you want to preserve certain actions longer (e.g., security-sensitive events),
add a clause like:

```sql
DELETE FROM audit_log
WHERE created_at < now() - interval '180 days'
  AND action NOT IN (
    'admin.user.suspend',
    'admin.user.reactivate',
    'admin.user.force_logout',
    'admin.user.role.update',
    'admin.user.role.bulk'
  );
```

## Notes

- Consider creating an index on `audit_log.created_at` for faster cleanup:

```sql
CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON audit_log (created_at);
```

- If using Supabase **Scheduled Functions**, place the cleanup SQL in a
  function and call it nightly.
