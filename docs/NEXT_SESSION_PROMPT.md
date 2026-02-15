# Next Session Prompt - Bank Export Formats Implementation

**⚠️ CRITICAL: DO NOT START FROM SCRATCH - Continue from existing work**

---

## 📍 Current Status (as of November 15, 2025)

### ✅ Completed Work

1. **Bank Export Formats Research**
   - Researched CSV and OFX/QFX formats for North American banks
   - Documented findings in `/docs/BANK_EXPORT_FORMATS_RESEARCH.md` (500+ lines)
   - Key finding: CSV is universal (100% of Canadian banks), OFX is US-focused
   - Strategic decision: Build flexible CSV parser first, add OFX later for US expansion

2. **Archon Project Created**
   - Project Name: **"Bank Export Formats"**
   - Project ID: `50ef9223-c79b-46e2-a5b1-770398cdfda8`
   - GitHub Repo: https://github.com/TomahawkCM/modern-tco
   - **16 tasks created** across 4 phases (all ready to start)
   - All tasks have agent assignments and vibe-check requirements

3. **User Decisions Made**
   - ✅ Auto-categorize with OpenAI merchant intelligence
   - ✅ OFX/QFX support in Phase 2 (after CSV proven)
   - ✅ Support all 5 Canadian banks (BMO, RBC, TD, Scotia, CIBC)
   - ✅ Smart deduplication (prevent duplicate imports)

### 🚀 Ready to Start

**Implementation Phase 1** - CSV Import Foundation (6 tasks)

---

## 🎯 Your Mission

**Build a comprehensive CSV import system for Budget App that:**

- Supports all 5 major Canadian banks
- Auto-categorizes transactions using OpenAI merchant intelligence
- Prevents duplicate imports with smart deduplication
- Works 95%+ of the time with unknown bank formats (generic adapter)
- Processes 1,000 transactions in <5 seconds

---

## 📋 Immediate Next Steps (Start Here!)

### Step 1: Run Vibe Check (MANDATORY)

```
Run mcp__pv-bhat-vibe-check-mcp-server__vibe_check with:
- goal: "Implement CSV import system for Budget App starting with file upload UI"
- plan: "1) Get tasks from Archon 2) Start with Task #1 (File upload UI) 3) Assign react-specialist 4) Implement drag-and-drop upload 5) Mark as review when done"
- uncertainties: ["Best drag-and-drop library for React 19", "File validation approach", "Preview table performance with large CSVs"]
- userPrompt: "Continue Bank Export Formats project - implement Task #1"
```

### Step 2: Get Tasks from Archon

```typescript
// Get all tasks for the project
mcp__archon__find_tasks({
  project_id: "50ef9223-c79b-46e2-a5b1-770398cdfda8",
});

// Or get specific high-priority tasks
mcp__archon__find_tasks({
  project_id: "50ef9223-c79b-46e2-a5b1-770398cdfda8",
  filter_by: "status",
  filter_value: "todo",
});
```

### Step 3: Start with Task #1 (Highest Priority)

**Task**: Build file upload UI with drag-and-drop  
**Priority**: 100 (highest)  
**Agent**: `react-specialist`  
**Task ID**: `ad1e26d4-fc4f-4648-b11a-fc9254d8bedf`

**Mark as "doing"**:

```typescript
mcp__archon__manage_task({
  action: "update",
  task_id: "ad1e26d4-fc4f-4648-b11a-fc9254d8bedf",
  status: "doing",
  assignee: "react-specialist",
});
```

### Step 4: Implement Task #1

**Requirements**:

- Create `/src/app/budget-app/import/page.tsx`
- Drag-and-drop zone for CSV files
- Click-to-browse fallback
- File validation (CSV only, max 5MB)
- Preview first 10 rows before import

**Components to Create**:

```
/src/app/budget-app/import/page.tsx
/src/components/budget/FileUploadZone.tsx
/src/components/budget/CSVPreviewTable.tsx
```

**Reference**:

- Task description in Archon (contains full requirements)
- `/docs/BANK_EXPORT_FORMATS_RESEARCH.md` (context)
- shadcn/ui components (Button, Card, Alert)

### Step 5: Mark as Review When Done

```typescript
mcp__archon__manage_task({
  action: "update",
  task_id: "ad1e26d4-fc4f-4648-b11a-fc9254d8bedf",
  status: "review",
});
```

### Step 6: After Validation, Mark as Done

```typescript
mcp__archon__manage_task({
  action: "update",
  task_id: "ad1e26d4-fc4f-4648-b11a-fc9254d8bedf",
  status: "done",
});
```

---

## 📊 Project Structure

### Phase 1: CSV Import Foundation (6 tasks, priority 100-95)

1. **File upload UI** → react-specialist (YOU START HERE)
2. **CSV parser core** → backend-architect
3. **Generic adapter** → backend-architect
4. **Smart deduplication** → backend-architect
5. **Auto-categorization integration** → full-stack-specialist
6. **Import preview with bulk editing** → react-specialist

### Phase 2: Bank-Specific Adapters (4 tasks, priority 90-87)

7. **RBC adapter** → backend-architect
8. **TD Bank adapter** → backend-architect
9. **Scotiabank adapter** → backend-architect
10. **CIBC adapter** → backend-architect

### Phase 3: Testing & Polish (4 tasks, priority 80-77)

11. **E2E tests** → test-automator
12. **Error handling** → full-stack-specialist
13. **Import history tracking** → backend-architect
14. **Performance optimization** → performance-engineer

### Phase 4: OFX/QFX Support - Future Q2 2026 (2 tasks, priority 50-49)

15. **OFX/QFX parser** → backend-architect
16. **Format auto-detection** → backend-architect

---

## 🔑 Critical Information

### Project Details

- **Project ID**: `50ef9223-c79b-46e2-a5b1-770398cdfda8`
- **GitHub**: https://github.com/TomahawkCM/modern-tco
- **Research Doc**: `/docs/BANK_EXPORT_FORMATS_RESEARCH.md`
- **Merchant Intelligence**: `/docs/BUDGET_APP_MERCHANT_INTELLIGENCE.md`
- **Existing BMO Adapter**: `/src/lib/categorization/rules.ts` (pattern reference)

### Agent Assignment Matrix

| Task Type   | Best Agent(s)                                       |
| ----------- | --------------------------------------------------- |
| React/UI    | react-specialist, typescript-pro, shadcn-specialist |
| CSV Parsing | backend-architect, typescript-pro                   |
| Testing     | test-automator, playwright-specialist               |
| Performance | performance-engineer, bundle-analyzer               |
| Full-stack  | full-stack-specialist                               |

### Workflow Requirements (EVERY Task)

```
1. Vibe check (MANDATORY) - Run before starting ANY task
2. Get task details from Archon
3. Mark status as "doing" in Archon
4. Assign appropriate agent
5. Implement feature
6. Test/validate
7. Mark status as "review" in Archon
8. After validation, mark as "done"
```

---

## ❌ Common Mistakes to Avoid

### DO NOT:

- ❌ Create a new project (it already exists: `50ef9223-c79b-46e2-a5b1-770398cdfda8`)
- ❌ Research banks again (already done, see `/docs/BANK_EXPORT_FORMATS_RESEARCH.md`)
- ❌ Start from scratch (pick up from Task #1)
- ❌ Skip vibe checks (MANDATORY for every task)
- ❌ Forget to update Archon status (doing → review → done)
- ❌ Work on tasks out of order (follow priority: 100 → 49)
- ❌ Upload CSV files to server (client-side processing only!)

### DO:

- ✅ Run vibe_check before starting work
- ✅ Get tasks from Archon with project_id
- ✅ Update task status in Archon (doing/review/done)
- ✅ Assign correct agent from matrix
- ✅ Reference `/docs/BANK_EXPORT_FORMATS_RESEARCH.md` for context
- ✅ Use existing merchant intelligence APIs
- ✅ Follow shadcn/ui patterns (Budget App design system)

---

## 📚 Key Resources

### Documentation

1. **Bank Export Formats Research** (MUST READ FIRST)
   - Path: `/docs/BANK_EXPORT_FORMATS_RESEARCH.md`
   - 500+ lines covering CSV/OFX comparison, bank formats, implementation strategy
   - Includes technical specifications for parsers

2. **Merchant Intelligence Guide**
   - Path: `/docs/BUDGET_APP_MERCHANT_INTELLIGENCE.md`
   - How auto-categorization works
   - Merchant catalog and feedback loop

3. **Subscription Detection**
   - Path: `/docs/SUBSCRIPTION_DETECTION.md`
   - Pattern for analyzing recurring transactions

### Code References

1. **Existing BMO Adapter** (`/src/lib/categorization/rules.ts`)

   ```typescript
   function cleanBMODescription(description: string): string {
     // Handles [PR] physical and [OP] online purchases
     // Pattern to follow for other bank adapters
   }
   ```

2. **Merchant APIs**
   - `/src/app/api/merchants/resolve/route.ts` - Merchant classification
   - `/src/app/api/merchants/feedback/route.ts` - User feedback

3. **Budget App Patterns**
   - `/src/app/budget-app/transactions/page.tsx` - Transaction table UI
   - `/src/components/budget/TransactionModal.tsx` - Modal patterns

### Database

**Merchant Catalog** (Supabase):

- Migration: `/supabase/migrations/20251115000001_create_merchants_table.sql`
- Tables: `merchants`, `merchant_feedback`
- RPC: `increment_merchant_counters()`

---

## 🎯 Success Criteria

### Task #1 Complete When:

✅ `/src/app/budget-app/import/page.tsx` created  
✅ Drag-and-drop works for CSV files  
✅ Shows first 10 rows in preview  
✅ Validates file type and size  
✅ Accessible (keyboard navigation, screen reader support)  
✅ Task marked as "review" in Archon

### Phase 1 Complete When:

✅ Can import CSV from all 5 Canadian banks  
✅ Auto-categorization works with merchant intelligence  
✅ Smart deduplication prevents duplicates  
✅ <5 seconds to import 1,000 transactions  
✅ Generic adapter handles 95%+ of unknown formats

---

## 🚨 If You're Stuck

### Problem: Can't find tasks in Archon

**Solution**:

```typescript
// Get all project tasks
mcp__archon__find_tasks({
  project_id: "50ef9223-c79b-46e2-a5b1-770398cdfda8",
});
```

### Problem: Don't know which task to start

**Solution**: Start with highest priority (task_order = 100):

- Task #1: File upload UI
- Task ID: `ad1e26d4-fc4f-4648-b11a-fc9254d8bedf`
- Agent: `react-specialist`

### Problem: Unsure about implementation approach

**Solution**:

1. Run vibe_check to identify assumptions
2. Read task description in Archon (has full requirements)
3. Reference `/docs/BANK_EXPORT_FORMATS_RESEARCH.md`
4. Check existing code patterns in Budget App

### Problem: Task seems too big

**Solution**:

- Each task is scoped for 1-4 hours of work
- If overwhelmed, break into subtasks in local TodoWrite
- Follow the "Files to Create" section in task description

---

## 📝 Example First Session Workflow

```
1. Run vibe_check (identify assumptions about file upload)

2. Get tasks from Archon:
   mcp__archon__find_tasks({ project_id: "50ef9223-c79b-46e2-a5b1-770398cdfda8" })

3. Start Task #1 (File upload UI):
   mcp__archon__manage_task({
     action: "update",
     task_id: "ad1e26d4-fc4f-4648-b11a-fc9254d8bedf",
     status: "doing",
     assignee: "react-specialist"
   })

4. Create files:
   - /src/app/budget-app/import/page.tsx
   - /src/components/budget/FileUploadZone.tsx
   - /src/components/budget/CSVPreviewTable.tsx

5. Implement drag-and-drop:
   - Use shadcn/ui components
   - File validation (CSV only, max 5MB)
   - Preview first 10 rows

6. Test manually:
   - Upload a CSV file
   - Verify drag-and-drop works
   - Check file validation
   - Confirm preview shows

7. Mark as review:
   mcp__archon__manage_task({
     action: "update",
     task_id: "ad1e26d4-fc4f-4648-b11a-fc9254d8bedf",
     status: "review"
   })

8. After validation, mark done:
   mcp__archon__manage_task({
     action: "update",
     task_id: "ad1e26d4-fc4f-4648-b11a-fc9254d8bedf",
     status: "done"
   })

9. Move to Task #2 (CSV parser core)
```

---

## 🔍 Quick Reference

### Archon Commands

```typescript
// Get tasks
mcp__archon__find_tasks({ project_id: "50ef9223-c79b-46e2-a5b1-770398cdfda8" });

// Update task status
mcp__archon__manage_task({
  action: "update",
  task_id: "<task-id>",
  status: "doing" | "review" | "done",
  assignee: "<agent-name>",
});

// Get project details
mcp__archon__find_projects({ project_id: "50ef9223-c79b-46e2-a5b1-770398cdfda8" });
```

### Vibe Check Template

```typescript
mcp__pv -
  bhat -
  vibe -
  check -
  mcp -
  server__vibe_check({
    goal: "Implement [feature name]",
    plan: "1) [step 1] 2) [step 2] 3) [step 3]",
    uncertainties: ["[uncertainty 1]", "[uncertainty 2]"],
    userPrompt: "[original user request]",
  });
```

### Task Priorities

- **100-95**: Phase 1 - CSV Import Foundation (START HERE)
- **90-87**: Phase 2 - Bank Adapters
- **80-77**: Phase 3 - Testing & Polish
- **50-49**: Phase 4 - OFX Support (Future)

---

## 🎉 You're Ready!

**Start with**:

1. ✅ Run vibe_check
2. ✅ Get tasks from Archon (`project_id: "50ef9223-c79b-46e2-a5b1-770398cdfda8"`)
3. ✅ Implement Task #1: File upload UI (`task_id: "ad1e26d4-fc4f-4648-b11a-fc9254d8bedf"`)
4. ✅ Mark status in Archon (doing → review → done)
5. ✅ Move to Task #2

**Good luck! The project is ready and waiting for you to implement it.** 🚀

---

**Last Updated**: November 15, 2025  
**Project**: Bank Export Formats  
**Project ID**: `50ef9223-c79b-46e2-a5b1-770398cdfda8`  
**Phase**: Ready to start Phase 1 (Task #1)
