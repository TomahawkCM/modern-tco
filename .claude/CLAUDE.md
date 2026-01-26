# Claude Code Configuration - Modern Tanium TCO & Budget App

## Quick Navigation

| Document | Purpose |
| -------- | ------- |
| **[AGENTS.md](./AGENTS.md)** | Agent system, Modern UI Agent, assignment matrix |
| **[TOOLS.md](./TOOLS.md)** | MCP servers, tool selection protocol, token budgets |
| **[WORKFLOWS.md](./WORKFLOWS.md)** | Archon task management, Docker workflows |

---

## Dual-Application Architecture

This repository contains two integrated applications:

### 1. Enterprise LMS for Tanium TCO Certification

- **Status**: Learning science complete (32h), content needs population
- **Routes**: 59 pages in `src/app/` (non-budget)
- **Content**: 11.6h MDX modules (6 modules, 16,849 lines) + 200+ questions
- **Features**: Spaced repetition, gamification, video analytics, interactive labs, mock exams

**Key Assets**:

- 83 micro-sections with Learn→Test→Review flow
- Spaced repetition system with adaptive difficulty
- 27 badges, 6 levels, points system
- Video milestone tracking, interactive labs
- Full mock exams (105 questions, 105min timer)

**Production Priorities**:

1. Content population (videos, questions, lab certificates)
2. Integration testing & performance optimization
3. Deployment & monitoring setup

See `FINAL_COMPLETION_SUMMARY.md` for complete implementation details.

### 2. Budget App (Personal Finance Management)

- **Status**: Feature-complete with advanced capabilities
- **Routes**: 36 pages in `src/app/budget-app/`
- **Components**: 50+ dedicated budget components

**Key Features**:

- Transaction management with smart categorization
- Bank statement import (CSV, OCR support)
- AI-powered merchant matching
- Multiple account types (checking, savings, investments, loans)
- Financial calculators (retirement, debt payoff, emergency fund, etc.)
- Reports and analytics with trend forecasting
- Encrypted local storage with migration support
- 113 locale support (i18n)

**Budget App Routes**:
- `/budget-app` - Dashboard
- `/budget-app/transactions` - Transaction list
- `/budget-app/accounts` - Account management
- `/budget-app/budgets` - Budget planning
- `/budget-app/reports` - Financial reports
- `/budget-app/calculators` - Financial calculators
- `/budget-app/import` - Bank statement import
- `/budget-app/export` - Data export
- `/budget-app/settings` - App settings
- `/budget-app/admin` - Admin panel

---

## Enterprise Architecture

### Core Infrastructure

- **Next.js 16.0.0** with App Router
- **React 19.2.0** with automatic runtime
- **TypeScript 5.9.3** with strict type safety
- **Bundler**: Webpack (switching to Turbopack after content-parser.ts refactoring)
- **Supabase PostgreSQL** with RLS & real-time
- **shadcn/ui + Radix UI** for accessible components
- **PostHog Analytics** for user behavior tracking

### React Contexts (18 Total)

**LMS Core Contexts (10)**:
- `AssessmentContext` - Quiz/assessment state
- `AuthContext` - Authentication & user session
- `DatabaseContext` - IndexedDB operations
- `ExamContext` - Mock exam management
- `ModuleContext` - Learning module state
- `PracticeContext` - Practice mode state
- `ProgressContext` - Learning progress tracking
- `QuestionsContext` - Question bank management
- `ReviewContext` - Review session state
- `StudySessionContext` - Active study session

**Navigation & Search (3)**:
- `GlobalNavContext` - App-wide navigation state
- `SearchContext` - Search functionality
- `SettingsContext` - User preferences

**Advanced Features (5)**:
- `ChatbotContext` - AI tutor integration (13KB)
- `IncorrectAnswersContext` - Spaced repetition for wrong answers
- `LANSyncContext` - Offline peer-to-peer sync (21KB)
- `ProfileContext` - User profiles & preferences (24KB)
- `SeniorsModeContext` - Accessibility enhancements (8KB)

### API Endpoints (22 Routes)

**LMS Endpoints** (`src/app/api/`):
- `/api/flashcards/*` - Flashcard operations
- `/api/simulator/*` - Lab simulator
- `/api/study/*` - Study content
- `/api/questions/*` - Question management

**Budget App Endpoints**:
- `/api/bank/detect` - Bank statement detection
- `/api/import/analyze-columns` - CSV column analysis
- `/api/chat` - AI chatbot
- `/api/merchant/*` - Merchant resolution

### Security & Data Layer

**Encryption**:
- `src/lib/encryption/budget-encryption.ts` - Data encryption
- `src/lib/encryption/encrypted-db-wrapper.ts` - Encrypted IndexedDB
- Migration utilities for encryption upgrades

**Data Processing**:
- `src/lib/parsers/csv-parser.ts` - CSV import
- `src/lib/ai/smart-bank-detection.ts` - Bank format detection
- `src/lib/ai/smart-column-mapper.ts` - Column auto-mapping
- `src/lib/ai/smart-duplicate-detection.ts` - Duplicate transaction detection
- `bank-statement-ocr.ts` - OCR for bank statements
- `ai-vendor-matcher.ts` - AI merchant matching

### Analytics & ML

- `budget-analytics.ts` - Financial analytics
- `trend-forecasting.ts` - Spending trends
- `anomaly-detector.ts` - Unusual transaction detection
- `lstm-predictive-spending.ts` - ML-based predictions
- `collective-learning-service.ts` - Community learning

### Activity & Logging

- `activity-logger.ts` - User activity tracking
- Integration with PostHog for analytics

### Internationalization

- **113 locales** supported in `src/i18n/messages/`
- RTL support for Arabic, Hebrew, etc.
- Currency formatting per locale

### Anthropic AI Integration

- @anthropic-ai/sdk (v0.60.0) for Claude API
- Dynamic question generation from Tanium docs
- Personalized learning paths
- Performance prediction & content optimization

---

## Critical Rules (Summary)

### 1. Always Start with vibe-check

Every task begins with `vibe_check` to prevent errors and identify assumptions.

### 2. Use Archon for Task Management

- **Project ID**: `9c56f01c-759a-42b1-bad4-06b71f2c4db9`
- Always update task status: todo → doing → review → done

### 3. Minimum Viable Toolset

- Use pre-approved Bash commands when possible (0K tokens)
- Check [TOOLS.md](./TOOLS.md) for tool selection guidance

### 4. Agent Selection

- UI work → modern-ui-agent
- Database → database-architect
- Testing → test-automator
- See [AGENTS.md](./AGENTS.md) for full matrix

---

## MCP Servers (12 Active)

| Server | Purpose |
| ------ | ------- |
| shadcn | UI components |
| filesystem | File operations |
| sqlite-tanium | Local database |
| github | Remote Git |
| firecrawl | Web scraping |
| playwright | Browser automation |
| agent-browser | CLI browser (scraping, visual tests) |
| supabase | PostgREST API |
| vibe-check | Error prevention |
| context7 | Library docs |
| docker | Container management |
| archon | Task management |
| postgresql | Production database |

**Full details**: [TOOLS.md](./TOOLS.md)

---

## Browser Automation Quick Reference

```bash
# Content scraping (populate LMS)
npm run browser:scrape -- --url "https://docs.tanium.com" --output ./scraped.json

# Visual regression testing
npm run browser:visual-test

# Interactive exploration
npx agent-browser open "https://example.com"
npx agent-browser snapshot -i   # Get element refs
npx agent-browser click @e3     # Interact by ref
npx agent-browser close
```

See [TOOLS.md](./TOOLS.md) for full agent-browser documentation.

---

## Complete Documentation

| File | Contents |
| ---- | -------- |
| `.claude/AGENTS.md` | Agent documentation, Modern UI Agent, assignment matrix |
| `.claude/TOOLS.md` | MCP servers, tool selection, token budgets |
| `.claude/WORKFLOWS.md` | Archon protocol, Docker workflows |
| `.claude/agent-routing-config.json` | Agent routing configuration |
| `.claude/COMPLETE_TOOL_MATRIX.md` | Full tool matrix with task mappings |
| `FINAL_COMPLETION_SUMMARY.md` | Complete LMS implementation details |
| `docs/BUDGET_APP_FEATURES.md` | Budget app feature documentation |
| `docs/PRIVACY.md` | Privacy and encryption documentation |
