# Weekly Demo Scripts - Budget App v1 Modernization

## Milestone 1 Demo - End of Week 1

**Goal**: Demonstrate research findings, design direction, and initial planning

### Agenda (40 minutes)

**1. Competitive Analysis Findings (10 min)** - Researcher

- Present comparison matrix of 5+ budget apps
- Highlight best-in-class patterns:
  - Navigation: How do Mint, YNAB handle 9+ sections on mobile?
  - Dashboard: What metrics/charts do top apps prioritize?
  - Accessibility: Which apps have seniors-friendly features?
- Show screenshots with annotations
- **Key Takeaway**: "We learned X pattern works best for Y reason"

**2. Seniors UI Pattern Library (8 min)** - Accessibility Engineer

- Present dos/don'ts for seniors UX
- Show examples from AARP, GoodRx apps
- Highlight critical patterns:
  - Touch targets: 48px+ minimum
  - Typography: 18px+ base, high contrast
  - Language: Plain labels, no jargon
- **Demo**: Side-by-side current budget app vs recommended changes

**3. Design System Audit (10 min)** - Design System Architect

- Present token inventory (colors, typography, spacing)
- Identify inconsistencies found
- Propose theme architecture (light/dark/high-contrast)
- Show token structure:
  ```css
  --color-background: #ffffff (light) | #0a0a0a (dark) --color-text: #1a1a1a (light) | #f5f5f5
    (dark);
  ```
- **Deliverable**: Token specification document

**4. IA & Navigation Recommendation (10 min)** - UX Specialist

- Present new information architecture for 9 sections
- Show mobile navigation concept (tab bar + hamburger hybrid)
- Walk through user flows:
  - How does user navigate from Dashboard → Loans → Mortgage Details?
  - Where does OCR/Scan Receipt fit?
- **Demo**: Figma mockup or wireframe

**5. Q&A & Week 2 Preview (2 min)**

- Open floor for questions
- Preview Week 2 focus: Implementing navigation + accessibility modes

---

## Milestone 2 Demo - End of Week 2

**Goal**: Demonstrate new navigation working + theme modes functional

### Agenda (40 minutes)

**1. New Navigation Live Demo (12 min)** - React Specialist + Frontend Specialist

- **Desktop**: Show redesigned sidebar
  - Grouped sections (Core, Planning, Wealth, Tools)
  - Collapsible advanced features
  - Active state indicators
- **Mobile**: Show hybrid navigation
  - Bottom tab bar (Dashboard, Transactions, Budgets, More)
  - "More" menu expands to remaining sections
  - 48px+ touch targets verified
- **Command Palette**: Demo Cmd/Ctrl+K quick navigation
- **Key Metrics**: 3-tap maximum to any feature ✓

**2. Theme Modes Demonstration (10 min)** - Design System Architect + Frontend Architect

- **Light Mode**: Default, current design with improvements
- **Dark Mode**: Show color palette, contrast ratios (4.5:1+ verified)
- **High-Contrast Mode**: Black/white base, 7:1+ contrast
- Toggle between modes live
- **Charts**: Show Recharts color palettes optimized for each mode

**3. Accessibility Features (10 min)** - Accessibility Engineer + React Specialist

- **Reduced Motion**: Demo prefers-reduced-motion detection
  - Show animations vs instant transitions
  - Manual toggle in settings
- **Settings Panel**: Walkthrough accessibility preferences
  - Theme mode selector
  - Font size adjustment (16px/18px/20px)
  - Reduced motion toggle
  - localStorage persistence
- **Touch Targets**: Show measurement tool (all ≥48px)

**4. Keyboard Navigation & Screen Reader (6 min)** - Accessibility Tester

- **Keyboard-Only Navigation**: Tab through entire budget app
  - Focus indicators visible
  - Skip links present
  - All features accessible
- **Screen Reader Demo**: Brief VoiceOver/NVDA demonstration
  - Navigation announces correctly
  - Form labels descriptive
  - Chart text alternatives present

**5. Q&A & Week 3 Preview (2 min)**

- Preview Week 3: Dashboard polish + feature UI updates + chatbot

---

## Milestone 3 Demo - End of Week 3

**Goal**: Demonstrate polished UI, improved features, and functional chatbot

### Agenda (45 minutes)

**1. Dashboard Modernization (8 min)** - React Specialist

- **Metric Cards**: Show redesigned cards with visual hierarchy
  - Larger numbers, clearer labels
  - Trend indicators (↑↓ arrows)
  - Color-coded with non-color alternatives
- **Charts**: Improved accessibility
  - Text alternatives ("Spending breakdown: Food 30%, Transport 20%...")
  - Keyboard navigation
  - Data table toggle
- **Customization**: Demo widget visibility and drag-and-drop reordering

**2. Feature UI Improvements (12 min)** - Multiple specialists

- **Transactions** (3 min):
  - Redesigned list (18px typography, visual separators)
  - Enhanced filters (date range, categories, amount)
  - Simplified add/edit form (reduced cognitive load)
- **Budgets** (3 min):
  - Progress bars with percentage labels
  - Warning states (80%, 100%, over budget)
  - Monthly rollover UI
- **Loans** (3 min):
  - Polished amortization chart
  - Extra payment calculator with plain language
  - "Payoff in X years" projection
- **Import Flows** (3 min):
  - Better CSV preview table
  - Clearer duplicate indicators
  - Improved error messages

**3. AI Chatbot Integration (15 min)** - API Specialist + React Specialist

- **UI Demo**: Show chatbot widget
  - Floating button (bottom-right)
  - Expandable panel
  - Message bubbles (user/assistant)
- **Sample Queries**:
  1. "How much did I spend this month?"
     - Chatbot: "You spent $1,245.67 in November. That's 8% more than October."
  2. "Am I over budget in any categories?"
     - Chatbot: "Yes, you're over budget in Dining ($215/$200, 108%). All other categories are on track."
  3. "Add $50 coffee expense"
     - Chatbot: "Added $50.00 to Coffee category. Your balance is now $2,450.00."
- **Privacy Controls**: Show opt-in dialog and settings
- **Context Management**: Demonstrate conversation history persistence

**4. Mobile Experience Walkthrough (8 min)** - QA Engineer

- **Device Demo**: Live testing on iPhone/Android
  - Bottom navigation smooth
  - Forms use native inputs
  - Theme modes work correctly
  - Offline functionality verified
- **Touch Interactions**: Show tap targets, gestures
- **Performance**: Lighthouse mobile score (target 90+)

**5. Q&A & Week 4 Preview (2 min)**

- Preview Week 4: Final QA, user testing, documentation, launch prep

---

## Milestone 4 Demo - End of Week 4 (Launch Ready)

**Goal**: Demonstrate production-ready app, testing results, and launch plan

### Agenda (50 minutes)

**1. End-to-End User Flow Demo (10 min)** - Product Designer

- **Scenario**: New user (Margaret, 68-year-old retiree)
  - Opens app, dismisses welcome screen
  - Adds first account ("Checking")
  - Adds first transaction ("-$23.45, Groceries")
  - Explores dashboard
  - Switches to dark mode
  - Asks chatbot: "What's my balance?"
  - Completes in <90 seconds ✓

**2. Testing Results (12 min)** - QA Team

- **Playwright E2E Tests** (3 min):
  - Show test suite running
  - Coverage: Navigation, transactions, budgets, imports, themes, chatbot
  - All tests passing ✓
- **Accessibility Audit** (4 min):
  - Lighthouse scores (all 95+) ✓
  - axe-core violations (0 critical) ✓
  - Screen reader testing (NVDA/VoiceOver/JAWS) ✓
  - Touch target audit (100% ≥48px) ✓
- **Performance Audit** (3 min):
  - Bundle size: 285KB (target <300KB) ✓
  - Time to Interactive: 2.8s on 3G ✓
  - Lighthouse Performance: 92 ✓
- **Device Testing** (2 min):
  - Matrix: iOS (Safari), Android (Chrome), Desktop (Chrome/Firefox/Edge)
  - All platforms working ✓

**3. User Acceptance Testing Findings (10 min)** - Product Designer

- **Participants**: 5 seniors (ages 62-74)
- **Tasks Tested**:
  1. Add transaction
  2. Create budget
  3. Import CSV
  4. Use chatbot
  5. Switch to dark mode
- **Results**:
  - Task completion: 96% average ✓
  - Avg. transaction entry time: 78 seconds ✓ (target <90s)
  - Satisfaction: 4.6/5.0
  - Top feedback: "Much easier than other apps", "Love dark mode", "Chatbot is helpful"
- **Issues Found**: 2 minor UI tweaks (already fixed)

**4. Documentation & Deployment (8 min)** - Documentation Specialist + DevOps

- **User Documentation** (3 min):
  - Getting Started guide
  - Feature walkthroughs
  - FAQ
  - Chatbot example queries
- **Developer Documentation** (2 min):
  - Architecture overview
  - Deployment guide (Vercel)
  - CONTRIBUTING.md
  - README.md updated
- **Production Deployment** (3 min):
  - Deployed to: [production-url]
  - PWA installation verified (iOS/Android/Desktop)
  - Error monitoring active (Sentry)
  - Analytics configured (PostHog)

**5. Launch Plan & Rollback Strategy (8 min)** - Project Manager

- **Pre-Launch Checklist**:
  - [ ] All tests passing
  - [ ] Accessibility audit complete (95+ scores)
  - [ ] Performance targets met (<3s TTI)
  - [ ] Docs published
  - [ ] Error monitoring active
  - [ ] Rollback plan documented
- **Launch Timeline**:
  - **Today**: Final production verification
  - **Tomorrow**: Soft launch (share with beta testers)
  - **+3 days**: Monitor error rates, fix critical issues
  - **+7 days**: Public announcement
- **Success Metrics (First Week)**:
  - PWA install rate >30%
  - Return rate >60% within 7 days
  - Error rate <0.1%
  - Lighthouse scores maintain 95+

**6. Retrospective & Next Steps (2 min)**

- **Wins**: What went well?
- **Challenges**: What was difficult?
- **v1.1 Preview**: What features to prioritize next?

---

## Demo Best Practices

### Preparation

- [ ] Record demo walkthrough video (backup if live demo fails)
- [ ] Test on clean browser profile (no extensions, cache cleared)
- [ ] Have sample data loaded (transactions, budgets, loans)
- [ ] Prepare 2-3 user scenarios
- [ ] Test all theme modes work

### Presentation

- **Show, don't tell**: Live demos > screenshots
- **Focus on user value**: "This means Margaret can now..." not "We implemented..."
- **Acknowledge issues**: "We found X bug, already fixed"
- **Keep it short**: 40-50 min max, respect people's time
- **Record for absent team members**

### Follow-Up

- Publish demo recording within 24 hours
- Share slides/notes in project channel
- Update Archon task statuses based on feedback
- Document action items for next week

**Ready to ship! 🚀**
