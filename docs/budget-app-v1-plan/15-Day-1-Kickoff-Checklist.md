# Day-1 Kickoff Checklist - Budget App v1 Modernization

## Pre-Kickoff (Before Day 1)

### Team & Access

- [ ] Confirm all team members have access to Archon MCP project (`5b93c0bb-2bb5-4af3-b646-f7540a612dee`)
- [ ] Verify GitHub repository access (https://github.com/TomahawkCM/modern-tco)
- [ ] Set up communication channels (Slack/Discord/Teams)
- [ ] Schedule weekly milestone demo meetings (Weeks 1-4)

### Environment Setup

- [ ] Clone repository: `git clone https://github.com/TomahawkCM/modern-tco.git`
- [ ] Install dependencies: `npm install`
- [ ] Verify dev server runs: `npm run dev` (should open on `localhost:3000`)
- [ ] Run existing tests: `npx playwright test` (verify all pass)
- [ ] Confirm budget app accessible at `/budget-app`

### Tool Access

- [ ] OpenAI API key configured (for chatbot integration)
- [ ] Supabase project access (if using hosted Postgres)
- [ ] Figma access (if design mockups exist)
- [ ] Storybook setup (optional, for component playground)
- [ ] Error tracking (Sentry account if using)

---

## Day 1 Kickoff Meeting (90 minutes)

### Agenda

**1. Project Overview (15 min)**

- Review Vision & Non-Goals doc
- Clarify success metrics
- Confirm 2-4 week timeline

**2. Codebase Walkthrough (20 min)**

- Demonstrate existing budget app features
- Review folder structure (`/src/app/budget-app/`, `/src/components/budget/`)
- Show IndexedDB schema (Dexie v9)
- Highlight CSV/PDF import flows

**3. Archon Task Review (30 min)**

- Walk through 8 epics and 60 tasks
- Confirm agent assignments
- Identify dependencies and blockers
- Set initial task statuses (mark Week 1 tasks as "todo")

**4. Week 1 Focus Areas (15 min)**

- **Epic 1**: UI/UX Research (competitive analysis, seniors patterns)
- **Epic 2**: Design System (audit, tokens, theme modes)
- **Deliverables**: Research report, design token spec, IA sitemap
- **Demo**: Friday Week 1 - Present findings and design direction

**5. Q&A & Action Items (10 min)**

- Clarify any confusion
- Assign Day 1 tasks to specific team members
- Set next sync (daily standup time?)

---

## Day 1 Execution Tasks

### For Researcher (Epic 1)

- [ ] Start task: "Research leading budget apps (Mint, YNAB, Monarch, Copilot, Simplifi)"
- [ ] Create comparison spreadsheet (navigation, dashboard, accessibility features)
- [ ] Take screenshots of seniors-friendly UI patterns
- [ ] Document findings in `/docs/research/competitive-analysis.md`

### For UX Specialist (Epic 1)

- [ ] Start task: "Analyze mobile-first navigation patterns for 9-section apps"
- [ ] Study Notion, Todoist, banking apps (tab bar vs hamburger vs hybrid)
- [ ] Sketch 3 navigation concepts for budget app
- [ ] Recommend optimal pattern with rationale

### For Accessibility Engineer (Epic 1)

- [ ] Start task: "Study seniors-friendly UI patterns and accessibility best practices"
- [ ] Research AARP apps, GoodRx, Medisafe
- [ ] Compile pattern library (dos/don'ts for seniors UX)
- [ ] Document WCAG 2.2 Level AA requirements

### For Design System Architect (Epic 2)

- [ ] Start task: "Audit current design system (colors, typography, spacing, components)"
- [ ] Document existing tokens (teal #14b8a6, grayscale, spacing scale)
- [ ] Inventory all shadcn/ui components in use
- [ ] Identify inconsistencies and missing tokens

### For Product Designer (Epic 1 + Planning)

- [ ] Review all 14 planning documents in `/docs/budget-app-v1-plan/`
- [ ] Create Week 1 milestone checklist
- [ ] Draft UX principles based on research direction
- [ ] Prepare demo template for Friday

---

## Day 1 Deliverables (End of Day)

### Completed

- [ ] Kickoff meeting notes published
- [ ] All Week 1 tasks assigned in Archon (status="todo" or "doing")
- [ ] Research workstreams initiated (competitive analysis underway)
- [ ] Design audit started (token inventory begun)

### Confirmed

- [ ] Daily standup time set (e.g., 10am daily)
- [ ] Friday Week 1 demo scheduled
- [ ] Communication channel active
- [ ] No blockers preventing Week 1 work

---

## Daily Standup Template (Use Starting Day 2)

### Format (15 minutes max)

**Each person shares:**

1. **Yesterday**: What I completed
2. **Today**: What I'm working on
3. **Blockers**: What's preventing progress

**Example**:

- **Yesterday**: Completed competitive analysis of Mint and YNAB, documented navigation patterns
- **Today**: Starting seniors UI pattern research (AARP apps, GoodRx)
- **Blockers**: None, have everything I need

---

## Week 1 Success Criteria

**By Friday Week 1 Demo**:

- [ ] Competitive analysis complete (5+ apps researched)
- [ ] Seniors UI pattern library created
- [ ] Current design system fully audited
- [ ] Mobile navigation recommendation ready
- [ ] UX principles defined (5-7 core principles)
- [ ] Theme token architecture designed (light/dark/high-contrast)

**Demo Deliverables**:

- Research findings presentation (15 min)
- Design system audit report (10 min)
- IA/navigation recommendation (10 min)
- Q&A and next steps (5 min)

---

## Troubleshooting

### Common Day 1 Issues

**"npm install fails"**

- Check Node version: `node -v` (need v18+)
- Clear cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, retry

**"Can't access budget app at /budget-app"**

- Verify dev server running: `npm run dev`
- Check console for errors
- Confirm Next.js 16.0.0 installed

**"Archon tasks not showing"**

- Verify project ID: `5b93c0bb-2bb5-4af3-b646-f7540a612dee`
- Use Archon MCP tool: `find_tasks(project_id="...")`
- Check MCP server connection

**"Don't have OpenAI API key"**

- Not needed for Week 1 (research & design only)
- Required for Week 3 (chatbot integration)
- Coordinate with project lead for API access

---

## End of Day 1 Checklist

- [ ] All team members completed environment setup
- [ ] Week 1 tasks assigned and started
- [ ] No critical blockers identified
- [ ] Communication channels working
- [ ] Next standup scheduled
- [ ] Excited about the project! 🚀

**Ready for Day 2!**
