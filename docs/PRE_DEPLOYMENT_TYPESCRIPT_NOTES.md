# Pre-Deployment TypeScript Notes

**Status**: ⚠️ Expected TypeScript Errors Until Migrations Are Applied

---

## Overview

The Phase 2 implementation is complete and ready for deployment. However, **TypeScript compilation will show errors until the database migrations are applied** to the production Supabase instance.

---

## Expected TypeScript Errors

### 1. Missing Table Types

**Error Pattern:**
```
Argument of type '"flashcards"' is not assignable to parameter...
Argument of type '"flashcard_reviews"' is not assignable to parameter...
Argument of type '"question_reviews"' is not assignable to parameter...
Argument of type '"review_sessions"' is not assignable to parameter...
```

**Cause**: The Supabase type definitions haven't been regenerated since Phase 2 migrations were created.

**Resolution**: After applying migrations, regenerate types:
```bash
npx supabase gen types typescript --project-id qnwcwoutgarhqxlgsjzs > src/lib/database.types.ts
```

### 2. Missing Database Functions

**Error Pattern:**
```
Argument of type '"get_review_stats"' is not assignable...
Argument of type '"get_unified_review_queue_fast"' is not assignable...
Argument of type '"calculate_review_streak"' is not assignable...
```

**Cause**: PostgreSQL functions defined in Phase 2 migrations don't exist in type definitions yet.

**Resolution**: Same as above - regenerate types after applying migrations.

---

## Deployment Order (Critical!)

**Follow this exact sequence to avoid type errors:**

### Step 1: Apply Database Migrations
```bash
# Connect to production Supabase
npx supabase link --project-ref qnwcwoutgarhqxlgsjzs

# Apply Phase 2 schema
npx supabase migration up 20251002000002_add_question_reviews

# Apply performance optimizations
npx supabase migration up 20251003000001_performance_optimizations

# Verify tables created
npx supabase db execute "
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('flashcards', 'flashcard_reviews', 'question_reviews', 'review_sessions');
"
```

### Step 2: Regenerate Supabase Types
```bash
# Generate fresh types from production schema
npx supabase gen types typescript --project-id qnwcwoutgarhqxlgsjzs > src/lib/database.types.ts

# Verify no TypeScript errors
npm run typecheck
```

### Step 3: Build and Deploy
```bash
# Production build (should pass now)
npm run build

# Deploy to Vercel
vercel --prod
```

---

## Current Build Status

### ✅ Fixed Issues
- [x] StudySession.tsx `answers` → `choices` property (fixed 2025-01-03)

### ⚠️ Pending Issues (Resolved After Migrations)
- [ ] Supabase table types (flashcards, flashcard_reviews, question_reviews, review_sessions)
- [ ] Database function types (get_review_stats, get_unified_review_queue_fast, etc.)
- [ ] Related type inference errors in service layer

**These are NOT code errors** - they are expected until migrations are applied.

---

## Verification Checklist

After migrations are applied and types are regenerated:

```bash
# 1. Check TypeScript compilation
npm run typecheck
# Expected: 0 errors

# 2. Run production build
npm run build
# Expected: Successful build

# 3. Check bundle size
# Expected: ~45KB additional (Phase 2 components)

# 4. Lint check
npm run lint
# Expected: 0 errors
```

---

## Alternative: Deploy Without TypeScript Strict Mode (NOT Recommended)

If you need to deploy immediately without applying migrations first (for testing), you can temporarily disable strict type checking:

**WARNING: This is NOT recommended for production deployment!**

```typescript
// tsconfig.json (temporary workaround)
{
  "compilerOptions": {
    "skipLibCheck": true,  // Skip type checking for node_modules
    // DO NOT disable "strict" mode for application code
  }
}
```

**Better approach**: Apply migrations first, then deploy. This ensures type safety.

---

## Contact

If you encounter unexpected TypeScript errors after following the deployment sequence, check:

1. Migration files applied in correct order
2. Type generation command succeeded
3. No syntax errors in migration SQL files

**Last Updated**: 2025-01-03
**Version**: Phase 2 Pre-Deployment
