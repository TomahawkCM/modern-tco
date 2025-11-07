# Budget App Complete Improvement - START HERE

**Created:** 2025-01-02
**Status:** Ready for Archon execution
**PRD:** [BUDGET_APP_COMPLETE_PRD.md](./BUDGET_APP_COMPLETE_PRD.md)

---

## 🎯 What is This?

This is a comprehensive 55-task improvement plan for the Budget App covering:

- ✅ **Design System Compliance** (remove gradients, single accent color)
- ✅ **WCAG 2.2 AA Accessibility** (legal requirement, EU EAA June 2025)
- ✅ **Mobile-First Experience** (71% users prefer mobile)
- ✅ **Modern UX Patterns** (microinteractions, AI insights, PWA)
- ✅ **Smart Features** (split transactions, receipts, investment tracking)

**Timeline:** 25 days across 8 phases
**Total Tasks:** 55 (ranging from 30 min to 6 hours each)

---

## 🚀 Quick Start (3 Steps)

### Step 1: Read the PRD

**MANDATORY:** Every agent MUST read the complete PRD before starting ANY task.

```bash
# Read the comprehensive PRD (38KB, ~660 lines)
cat BUDGET_APP_COMPLETE_PRD.md
```

**What's in the PRD:**
- Complete project overview and problem statement
- All 55 tasks with detailed specifications
- Mandatory design standards (colors, spacing, typography)
- WCAG 2.2 AA accessibility requirements  
- Success criteria and validation methods
- Agent assignments and coordination strategies

---

### Step 2: Use Existing Archon Project

According to `.claude/CLAUDE.md`, you already have an Archon project configured:

**Project ID:** `9c56f01c-759a-42b1-bad4-06b71f2c4db9`

You can add tasks to this existing project OR create a new dedicated project for budget app improvements.

---

### Step 3: Start Phase 1

Once project is set up, begin with Phase 1 (Design System Compliance):

**Phase 1 Tasks (12 tasks, 3 days):**
1. Remove gradients (4 tasks)
2. Consolidate to single accent color (4 tasks)  
3. Implement spacing & typography standards (4 tasks)

---

## ⚠️ CRITICAL: Mandatory Vibe-Check Protocol

**EVERY task MUST start with vibe-check** (2K tokens, ~30 seconds)

**Why mandatory:**
- Catches assumptions before they become problems
- Prevents cascading errors (fix one thing, break another)
- Builds cross-session learning database
- 2K investment saves 10-50K in rework

---

## 📋 All 55 Tasks Overview

### Phase 1: Design System Compliance (3 days)
- 1.1: Remove gradient overload (4 tasks, 6h total)
- 1.2: Single accent color (teal #14b8a6) (4 tasks, 9h total)
- 1.3: Spacing & typography (4 tasks, 10h total)

### Phase 2: WCAG 2.2 AA Accessibility (2 days)
- 2.1: ARIA & semantic HTML (3 tasks, 7h total)
- 2.2: Keyboard & focus (3 tasks, 6h total)
- 2.3: Automated testing (2 tasks, 3h total)

### Phase 3: Mobile-First Experience (4 days)
- 3.1: Responsive layout (5 tasks, 18h total)
- 3.2: PWA implementation (3 tasks, 7h total)
- 3.3: Mobile gestures (3 tasks, 9h total)

### Phase 4: Modern UX Patterns (4 days)
- 4.1: Microinteractions (5 tasks, 12h total)
- 4.2: Predictive insights (3 tasks, 10h total)
- 4.3: Data visualization (2 tasks, 6h total)

### Phase 5: Smart Features (4 days)
- 5.1: Onboarding tour (3 tasks, 8h total)
- 5.2: Smart categorization (3 tasks, 12h total)
- 5.3: Keyboard shortcuts (2 tasks, 4h total)

### Phase 6: Split Transactions (3 days)
- 6.1: Split transaction UI (3 tasks, 10h total)
- 6.2: Database schema (2 tasks, 6h total)
- 6.3: Testing & validation (1 task, 4h total)

### Phase 7: Receipt Attachments (2 days)
- 7.1: Upload interface (2 tasks, 6h total)
- 7.2: IndexedDB storage (2 tasks, 6h total)
- 7.3: OCR optional (1 task, 4h total)

### Phase 8: Investment Tracking (3 days)
- 8.1: API integration (2 tasks, 8h total)
- 8.2: Portfolio UI (2 tasks, 8h total)
- 8.3: Performance calculations (2 tasks, 8h total)

---

## 🎨 Design Standards (Strictly Enforced)

### Color Palette

**FORBIDDEN:** Purple, orange, cyan, ANY gradients

```css
/* PRIMARY ACCENT (use ONLY for CTAs and key actions) */
--accent: #14b8a6;              /* Teal */

/* GRAY SCALE (use for EVERYTHING else) */
--gray-50: #fafafa;             /* Page background */
--gray-700: #404040;            /* Body text */
--gray-900: #171717;            /* Headings */

/* SEMANTIC COLORS (ONLY for their specific meaning) */
--success: #10b981;             /* Green - income */
--error: #ef4444;               /* Red - expenses */
--warning: #f59e0b;             /* Yellow - alerts */
```

### Spacing (8px Grid)

Use ONLY: `8, 16, 24, 32, 48, 64px` (Tailwind: `2, 4, 6, 8, 12, 16`)

---

## 📚 Essential Reading

**Before starting ANY task:**

1. [BUDGET_APP_COMPLETE_PRD.md](./BUDGET_APP_COMPLETE_PRD.md) - Complete specifications
2. [.claude/Skills/design-guide.md](./.claude/Skills/design-guide.md) - Design standards
3. [BUDGET_APP_AGENT_ASSIGNMENTS.md](./BUDGET_APP_AGENT_ASSIGNMENTS.md) - Agent matrix

---

## 🚦 Ready to Start?

**First Command:**

```bash
# Read the PRD overview
head -100 BUDGET_APP_COMPLETE_PRD.md
```

---

**🎉 Transform the Budget App into a world-class, accessible, mobile-first experience!**
