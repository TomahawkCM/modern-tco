# 🔐 RLS Migration Required - Enable Anonymous Flashcard Browsing

**Date**: October 11, 2025
**Status**: ⏸️ Waiting for Manual Migration
**Issue**: Anonymous users cannot see flashcards due to RLS policy

---

## 📋 Summary

The flashcard browse mode UI is fully implemented and working, but **one database security policy needs to be updated** to allow anonymous users to read the flashcard library.

**Current Status**:
- ✅ Browse mode UI complete (FlashcardDashboard + FlashcardLibrary)
- ✅ 157 AI-curated flashcards in database
- ✅ Migration file created
- ⏸️ **Manual SQL execution required** (cannot be automated without psql/Docker)

---

## 🎯 The Problem

**Root Cause**: The `flashcard_library` table has an RLS policy that restricts SELECT to authenticated users only:

```sql
-- Current policy (line 52-55 in migration file)
CREATE POLICY "Flashcard library is readable by all authenticated users"
  ON public.flashcard_library FOR SELECT
  TO authenticated  -- ⚠️ BLOCKS ANONYMOUS USERS
  USING (true);
```

**User Impact**: Visiting `/flashcards` → "Library (AI)" tab shows "No flashcards found" despite 157 cards existing in the database.

---

## ✅ The Solution

Add a **new PERMISSIVE policy** that allows anonymous users to read flashcards (browse-only mode):

```sql
CREATE POLICY IF NOT EXISTS "Flashcard library is publicly readable"
  ON public.flashcard_library FOR SELECT
  TO anon
  USING (true);
```

**Why This is Safe**:
1. ✅ **Read-only**: Only grants SELECT (no INSERT/UPDATE/DELETE)
2. ✅ **Library content only**: Progress tracking remains authenticated-only
3. ✅ **PERMISSIVE policy**: Works alongside existing authenticated policy
4. ✅ **Follows least privilege**: Minimal access for browse mode

---

## 🚀 How to Apply (3 Minutes)

### Option 1: Supabase Dashboard (Recommended) ⭐

1. **Open Supabase SQL Editor**:
   ```
   https://qnwcwoutgarhqxlgsjzs.supabase.co/project/qnwcwoutgarhqxlgsjzs/sql
   ```

2. **Paste this SQL**:
   ```sql
   CREATE POLICY IF NOT EXISTS "Flashcard library is publicly readable"
     ON public.flashcard_library FOR SELECT
     TO anon
     USING (true);
   ```

3. **Click "RUN"** button

4. **Expected result**: "Success. No rows returned"

### Option 2: Using psql (If Installed)

```bash
PGPASSWORD='<service-role-key>' psql \
  -h db.qnwcwoutgarhqxlgsjzs.supabase.co \
  -U postgres \
  -d postgres \
  -c "CREATE POLICY IF NOT EXISTS \"Flashcard library is publicly readable\" ON public.flashcard_library FOR SELECT TO anon USING (true);"
```

### Option 3: Using Supabase CLI (If Docker Running)

```bash
npx supabase db push
```

---

## 🧪 Verification Steps

After applying the migration:

1. **Visit**: http://localhost:3000/flashcards
2. **Click**: "Library (AI)" tab
3. **Expected**: 157 flashcards displayed in grid
4. **Verify**: Blue "Browse Mode" banner showing
5. **Test**: Domain filters (6 options)
6. **Test**: Difficulty filters (easy, medium, hard)
7. **Test**: Search functionality

---

## 📊 Expected Behavior

### Anonymous Users (Browse Mode)
- ✅ Browse all 157 AI-curated flashcards
- ✅ Filter by domain (asking_questions, refining_targeting, etc.)
- ✅ Filter by difficulty (easy, medium, hard)
- ✅ Search questions and answers
- ✅ View flashcard content
- ❌ Progress tracking (requires authentication)
- ❌ Statistics dashboard (requires authentication)
- ❌ Review sessions (requires authentication)

### Authenticated Users (Future)
- ✅ All browse features PLUS
- ✅ SuperMemo2 spaced repetition tracking
- ✅ Statistics dashboard
- ✅ Due/new card indicators
- ✅ Review sessions
- ✅ Accuracy tracking

---

## 📁 Files Created/Modified

### Migration Files
- ✅ **Created**: `supabase/migrations/20251010000006_enable_anonymous_flashcard_library_access.sql`

### Helper Scripts
- ✅ **Created**: `scripts/apply-rls-migration.ts` (displays instructions)
- ✅ **Created**: `scripts/apply-migration-direct.ts` (checks policy status)

### UI Components (Previously Implemented)
- ✅ **Modified**: `src/components/flashcards/FlashcardDashboard.tsx` (removed auth gate)
- ✅ **Modified**: `src/components/flashcards/FlashcardLibrary.tsx` (browse mode support)

---

## 🔍 Technical Details

### RLS Policy Mechanics

**Before Migration** (1 policy):
```
authenticated users → CAN read flashcard_library ✅
anonymous users    → CANNOT read flashcard_library ❌
```

**After Migration** (2 policies):
```
authenticated users → CAN read flashcard_library ✅ (policy #1)
anonymous users    → CAN read flashcard_library ✅ (policy #2)
```

**Why 2 Policies?**
- Supabase RLS policies are PERMISSIVE by default
- Multiple policies = OR logic (if ANY policy grants access, access is allowed)
- Safer than modifying existing policy (no risk to authenticated users)

### Security Boundaries

| Table | Anonymous Access | Authenticated Access |
|-------|-----------------|---------------------|
| `flashcard_library` | ✅ SELECT (read-only) | ✅ SELECT (read-only) |
| `flashcard_library_progress` | ❌ No access | ✅ Full access (own data) |
| `content_import_logs` | ❌ No access | ❌ No access (admin only) |

---

## 🐛 Troubleshooting

### "Policy already exists" Error
This is actually good! It means the policy was created. Verify by:
```sql
SELECT * FROM pg_policies
WHERE tablename = 'flashcard_library'
AND policyname = 'Flashcard library is publicly readable';
```

### Still Seeing "No flashcards found"
1. Check policy was applied: Run verification query above
2. Clear Next.js cache: `rm -rf .next && npm run dev`
3. Hard refresh browser: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
4. Check browser console for errors

### Policy Not Showing in Supabase Dashboard
- Wait 10-30 seconds for cache refresh
- Refresh the Supabase Dashboard page
- Check Authentication → Policies section

---

## 📚 Documentation References

- **Full Implementation**: See `FLASHCARD_BROWSE_MODE_IMPLEMENTATION.md`
- **AI Addon Details**: See `AI_FLASHCARD_ADDON_COMPLETE.md`
- **Supabase RLS Docs**: https://supabase.com/docs/guides/auth/row-level-security

---

## ✨ What Happens Next

Once the migration is applied:

1. **Immediate**: Anonymous users can browse flashcards
2. **No impact**: Existing authenticated functionality unchanged
3. **Future-proof**: When authentication is added, progress tracking automatically enables
4. **Scalable**: Ready for 500+ flashcard goal (currently 157)

---

## 🎯 Quick Commands

**Check if migration was applied**:
```bash
npx tsx scripts/apply-migration-direct.ts
```

**Generate more flashcards** (after migration):
```bash
npm run content:generate-flashcards -- --domain troubleshooting --difficulty easy --count 30
npm run content:import-flashcards
```

**Verify flashcard count**:
```bash
npx tsx scripts/verify-flashcard-import.ts
```

---

**Status**: Ready for manual SQL execution
**Impact**: 1 SQL statement, ~10 seconds to apply
**Risk**: Minimal (read-only access, PERMISSIVE policy)

🚀 **Apply the migration above and flashcards will be immediately browsable!**
