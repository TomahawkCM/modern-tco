# Budget App v1 - Vision & Non-Goals

## Vision

Create a **world-class, local-first home budget application** that empowers users—especially seniors—to manage their finances with confidence. The app prioritizes **clarity, accessibility, and intuitive design** over complex features, making personal finance management approachable for users of all technical abilities.

### Core Principles

1. **Seniors-First Design**: Large touch targets (48px+), readable typography (18px+ base), plain language, reduced cognitive load
2. **Local-First Privacy**: All data stays on the user's device; no cloud dependency, no tracking
3. **Progressive Enhancement**: Advanced features available but never overwhelming; clear pathways from simple to complex
4. **Accessibility by Default**: WCAG 2.2 AA compliance in all theme modes (light, dark, high-contrast)
5. **Mobile-First Always**: Optimized for thumb access, native input types, touch-friendly interactions

### Success Metrics (v1)

- **Onboarding**: 90% of users complete first transaction entry within 90 seconds
- **Accessibility**: 95+ Lighthouse accessibility score across all pages and theme modes
- **Usability**: Add transaction flow completes in ≤2 taps on mobile
- **Performance**: Time to Interactive <3s on 3G networks
- **Accuracy**: Import duplicate false-positive rate <2% on sample data

---

## Non-Goals (v1)

### Explicitly Out of Scope

1. **Live Bank Integrations**
   - **Why**: Requires complex API partnerships (Plaid, Flinks), introduces security/privacy concerns
   - **Alternative**: Robust CSV/PDF/OFX import flows (already implemented)
   - **Future**: Consider for v2+ with user demand validation

2. **Real-Time Market Data for Investments**
   - **Why**: Requires third-party data subscriptions, adds performance overhead
   - **Alternative**: Manual entry, CSV imports for investment tracking
   - **Future**: Optional integration if users request

3. **Advanced OCR Automation Pipeline**
   - **Why**: Complex ML infrastructure, unpredictable accuracy, not a blocker for core functionality
   - **Alternative**: Basic receipt attachment/viewing (keep Tesseract.js for optional manual OCR)
   - **Future**: Enhance accuracy with user feedback loop in v1.1+

4. **Complex Predictive Analytics / ML Features**
   - **Why**: Over-engineering for v1; seniors prefer simple, understandable insights
   - **Alternative**: Rule-based insights ("You spent 20% more on dining this month")
   - **Future**: Introduce gradually with clear explanations and user control

5. **Multi-User / Household Sharing**
   - **Why**: Adds authentication complexity, permission models, sync conflicts
   - **Alternative**: Single-user per device; export/share via CSV/JSON
   - **Future**: v2 feature with proper access controls

6. **Cryptocurrency / DeFi Wallet Integration**
   - **Why**: Niche use case, high volatility, regulatory uncertainty
   - **Alternative**: Manual entry as "Investment" account type
   - **Future**: Evaluate based on user demand

7. **Tax Preparation Integration**
   - **Why**: Complex legal/regulatory requirements, country-specific rules
   - **Alternative**: Export CSV for import into tax software (TurboTax, H&R Block)
   - **Future**: Partner integrations if demand justifies

8. **Server-Side Sync / Cloud Backup**
   - **Why**: Privacy-first principle; adds hosting costs, security surface
   - **Alternative**: Local JSON export/import, browser localStorage sync
   - **Future**: Optional encrypted cloud backup with user consent

---

## v1 Scope Summary

**What We're Building**:

- Modern UI/UX upgrade (research-driven, seniors-optimized)
- 3 theme modes (light, dark, high-contrast) + reduced motion
- Reorganized navigation (mobile-first hybrid: tab bar + hamburger)
- AI chatbot (OpenAI-powered financial assistant)
- Accessibility compliance (WCAG 2.2 AA)
- Polish existing features (dashboard, transactions, budgets, loans, imports)
- Comprehensive documentation (user guides + developer docs)

**What We're NOT Building** (defer to v1.1+):

- Live bank connections
- Advanced ML/AI predictions
- Multi-user household accounts
- Real-time market data feeds
- Tax preparation tools
- Cloud sync infrastructure
- Full OCR automation pipeline

---

## Timeline & Milestones

- **Week 1**: Research, design system, IA planning
- **Week 2**: Navigation + accessibility modes implementation
- **Week 3**: UI polish + chatbot integration
- **Week 4**: QA, testing, documentation, launch

**Target Release**: 2-4 weeks from kickoff, with weekly milestone demos

---

## Alignment with Existing Codebase

**Current State (Before v1)**:

- ✅ 9 major sections (Dashboard, Transactions, Budgets, Loans, Investments, Future Plans, Retirement, Reports, OCR)
- ✅ CSV/PDF/OFX imports with duplicate detection
- ✅ Full loan amortization with extra payment calc
- ✅ IndexedDB local-first storage
- ✅ PWA support (offline, installable)
- ✅ Basic accessibility (keyboard nav, ARIA labels)

**v1 Enhancements**:

- 🎨 UI/UX modernization (not rebuilding features!)
- ♿ Accessibility modes (dark/high-contrast/reduced motion)
- 🗺️ Navigation reorganization (better discoverability)
- 🤖 AI chatbot (new feature)
- 📚 Documentation overhaul

**Philosophy**: **Polish, don't rebuild**. Preserve all existing functionality while dramatically improving user experience.
