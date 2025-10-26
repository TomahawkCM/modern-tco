# Refining Questions & Targeting – Beginner Path Overview

This note captures the learning plan, interactive assets, and testing guidance for the **Refining Questions & Targeting** module. Share this file with any reviewer or learning-designer agent to quickly understand what changed and where to verify it.

---

## 1. Beginner Path (3–4 hours)

**Location:** `src/content/modules/02-refining-questions-targeting.mdx` (just below the “Key Concepts” section)  
**Structure:** Five units, each with:
- Friendly InfoBox (“Big idea”) for IT generalists.
- Three `<QueryPlayground>` drills (beginner difficulty).
- “Apply” mini-lab instructions guiding learners into the live simulator.

### Unit Breakdown
| Unit | Focus | Key Query Prompts | Mini-Lab |
| --- | --- | --- | --- |
| 1. Filters Without Jargon | Scoping first, equals vs contains, exclusions | Windows workstations, canary exclusion, EU scoping | Layer filters in the simulator |
| 2. Computer Groups 101 | Dynamic vs static vs hybrid, validation | `from group "Laptops"`, Windows servers via filters, remove DCs | Compare group vs filter, add `NOT "DC"` |
| 3. Targeting Safety (S.A.F.E.) | Dry-run workflows, rollback cohorts, evidence | Low disk servers, canary-safe lists, EU servers | Run a dry-run question, export evidence |
| 4. RBAC for Operators | Least privilege, content sets, scoping | Finance workspace, EU finance, data center view | Compare visibility for different scopes |
| 5. Performance Habits | Scope → filter → limit, minimal projection | Top 10 CPU laptops, low disk NA, minimal fields | Contrast broad query vs scoped/limited version |

Advanced material (Boolean mastery, regex, RBAC deep dives, performance metrics) sits behind `<details>` toggles labelled “Show advanced …” so beginners aren’t overwhelmed but experts can drill down immediately.

---

## 2. Simulator Alignment

**Location:** `src/app/api/sim-meta/route.ts`  
**IDs:** `rq-beginner-1a` through `rq-beginner-5c`  
Each QueryPlayground prompt has a matching simulator example learners can load from the Examples panel. Prompts cover scoping, group work, safety checks, RBAC views, and performance tuning.

---

## 3. Flashcard Seeds

**Location:** `flashcards-library.json` (appendix near line ~3957)  
**Count:** 30 cards (6 per unit) tagged with `["refining-targeting","beginner"]`
- Reinforces operator vocabulary, S.A.F.E. checklist, group strategies, RBAC contrasts, and performance habits.
- Automatically picked up by existing seeding workflows or on-demand via `/api/flashcards/seed`.

---

## 4. Domain Metadata Cleanup

**Location:** `src/data/study-content.ts`
- Removed duplicate Domain 2 entry.
- Normalized `getStudyModuleByDomain` to accept both “refining-questions-targeting” and similar synonyms by slugifying the request.

---

## 5. Testing Checklist

1. **Restart dev server**: `npm run dev -- -p 3000` (ensures MDX cache rebuilds).
2. **Module page**: http://localhost:3000/modules/refining-questions-targeting  
   - Confirm “Beginner Path (3–4 hours)” appears under Key Concepts.  
   - Expand “Show advanced …” toggles to verify deep-dive content is intact.
3. **Simulator**: http://localhost:3000/simulator  
   - In the Examples list, look for `rq-beginner-…` items and load a few.
4. **Flashcards** (optional):  
   - `POST /api/flashcards/seed` with target `user_id`.  
   - Visit http://localhost:3000/flashcards and filter by “Refining Questions & Targeting”.

---

## 6. Files Touched (for quick diff review)

- `src/content/modules/02-refining-questions-targeting.mdx`
- `src/app/api/sim-meta/route.ts`
- `flashcards-library.json`
- `src/data/study-content.ts`
- Experimental learn modules frontmatter (`02/03/04/05` + `MICROLEARNING_EXAMPLE`)
- Deleted stale cache entries in `.mdx-cache/` (regenerates on next dev start)

---

## 7. Next Ideas (optional)

- Add a “Beginner Mode” toggle on domain pages to auto-collapse advanced sections.
- Build microlevel tests for `getStudyModuleByDomain` normalization to prevent future slug drift.

---

Share this doc with any external reviewer or AI assistant to give them immediate context about the new learning path and how to verify it. If more automation hooks are needed (e.g., for MDX cache invalidation), append them here. 
