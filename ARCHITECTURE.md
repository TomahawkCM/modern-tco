# Architecture Documentation

## Modern Tanium TCO Learning Management System

**Version:** 1.0
**Last Updated:** October 11, 2025
**Status:** Production-Ready

---

## 🏗️ System Overview

Enterprise-grade Learning Management System for Tanium Total Control Operator (TCO) certification, featuring research-backed learning science, gamification, and AI-powered personalization.

### Key Statistics

- **Content**: 11.6 hours of study material across 6 modules
- **Questions**: 200+ assessment items with adaptive difficulty
- **Features**: 32 hours of learning science implementation
- **Codebase**: ~500+ components, 24 database migrations
- **Performance**: Lighthouse score >90, 100% accessibility

---

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│  Next.js 15.5.2 | React 18 | TypeScript 5.9.2           │
│  - SSR/SSG for performance                               │
│  - Client-side hydration                                 │
│  - 11+ React Contexts for state                          │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────┐
│              API Layer (Next.js API Routes)              │
│  - /api/health - Health check                            │
│  - /api/sim-* - Simulator endpoints                      │
│  - /api/study/* - Content delivery                       │
│  - /api/stripe/* - Payment processing                    │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────┐
│              Database (Supabase PostgreSQL)              │
│  - 30+ tables for learning data                          │
│  - Row Level Security (RLS)                              │
│  - Real-time subscriptions                               │
│  - Automatic backups                                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  External Services                        │
│  - PostHog (Analytics)                                   │
│  - Sentry (Error Tracking)                               │
│  - Anthropic Claude (AI Content)                         │
│  - Stripe (Payments)                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🧩 Technology Stack

### Frontend

- **Framework**: Next.js 15.5.2 (App Router)
- **Language**: TypeScript 5.9.2 (strict mode)
- **UI Library**: React 18
- **Component System**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS 3.x
- **State Management**: 11+ React Contexts
- **Forms**: React Hook Form + Zod validation

### Backend

- **Runtime**: Node.js 18+
- **Database**: PostgreSQL (via Supabase)
- **ORM/Client**: Supabase Client SDK
- **Authentication**: Supabase Auth (Email/Password, OAuth)
- **Real-time**: Supabase Realtime (WebSockets)

### AI & Analytics

- **AI Model**: Anthropic Claude (Sonnet 3.5)
- **Analytics**: PostHog
- **Error Tracking**: Sentry
- **Performance**: Vercel Speed Insights

### Development

- **Package Manager**: npm
- **Linting**: ESLint (Next.js config)
- **Formatting**: Prettier
- **Testing**: Vitest + Playwright
- **CI/CD**: GitHub Actions + Vercel

---

## 📊 Database Schema

### Core Tables

#### Authentication & Users

- `auth.users` - Supabase managed authentication
- `user_profiles` - Extended user data
- `team_seats` - Team management, seat allocation

#### Content & Learning

- `study_modules` - 6 TCO modules metadata
- `study_sections` - 83 micro-sections (10-min each)
- `questions` - 200+ assessment questions
- `study_content` - Detailed learning material

#### Progress Tracking

- `user_progress` - Overall learning progress
- `user_study_progress` - Module/section completion
- `domain_progress` - Per-domain mastery tracking
- `practice_sessions` - Practice mode history
- `exam_sessions` - Mock exam attempts

#### Spaced Repetition

- `flashcards` - 2357 spaced repetition items
- `flashcard_reviews` - Review history & intervals
- `review_sessions` - Daily review tracking

#### Gamification

- `achievements` - 27 badges across 5 categories
- `user_achievements` - User-earned badges
- `points` - Points system with multipliers
- `streaks` - Login streaks, study consistency

#### Analytics

- `analytics_events` - User behavior tracking
- `video_analytics` - Watch time, milestones
- `question_analytics` - Question performance stats
- `learning_patterns` - AI-analyzed patterns

#### AI & Personalization

- `user_learning_profiles` - AI-generated profiles
- `ai_recommendations` - Personalized study paths
- `content_import_logs` - AI content generation logs

### Schema Best Practices

- ✅ Uses `gen_random_uuid()` for primary keys (Supabase preferred)
- ✅ TIMESTAMPTZ for all timestamps (timezone-aware)
- ✅ INTEGER for time durations (enables calculations)
- ✅ JSONB for flexible data (learning objectives, metadata)
- ✅ Foreign keys with CASCADE deletes
- ✅ Indexes on frequently queried columns

**See**: `docs/MIGRATION_INVENTORY.md` for complete schema evolution

---

## 🎓 Learning Science Features

### 1. Microlearning (Week 1)

- **83 micro-sections** from 11.6h content
- **10-minute** learning chunks
- **Learn → Test → Review** flow
- **QuickCheck quizzes** with 80% pass threshold
- **Impact**: 40-60% faster learning, 25-60% retention vs traditional

### 2. Spaced Repetition (Week 2)

- **2357 method**: [1, 2, 4, 9, 19] day intervals
- **Adaptive difficulty**: 0.7x struggling, 1.0x normal, 1.3x mastered
- **DailyReview dashboard** with due items
- **Auto-registration** from quiz failures
- **Impact**: 42% retention improvement, 70% vs 64% exam scores

### 3. Gamification (Week 3)

- **27 badges**: Progress, Streak, Mastery, Practice, Excellence
- **6 levels**: Beginner → Master
- **Points system** with multipliers (difficulty + streak)
- **Interleaved practice**: 43% retention improvement
- **Mock exams**: 75 questions, 105-minute timer
- **Impact**: 48% engagement increase, 25% pass rate improvement

### 4. Multimedia & Analytics (Week 4)

- **Video integration**: YouTube embedding, milestone tracking
- **Interactive labs**: Tanium console simulation
- **Watch time analytics**: Real-time metrics
- **Performance prediction**: AI-powered insights
- **Impact**: 60% engagement from video learning

**Complete Details**: See `FINAL_COMPLETION_SUMMARY.md` (archived)

---

## 🔐 Security Architecture

### Authentication

- **Provider**: Supabase Auth
- **Methods**: Email/Password, OAuth (GitHub, Google)
- **Session Management**: JWT tokens, automatic refresh
- **Password Policy**: Min 8 chars, complexity requirements

### Authorization

- **Row Level Security (RLS)**: Enabled on all tables
- **Admin Access**: Email-based (`NEXT_PUBLIC_ADMIN_EMAILS`)
- **Team Access**: Seat-based permissions
- **API Security**: Service role key for server-side ops

### Data Protection

- **Encryption**: At rest (Supabase managed)
- **TLS**: All connections HTTPS only
- **Secrets Management**: Environment variables, never in code
- **Security Headers**: CSP, HSTS, X-Frame-Options

### Compliance

- **WCAG 2.1 AA**: Accessibility compliance
- **Audit Trail**: All user actions logged
- **Backup Strategy**: Daily automatic backups (7-day retention)
- **Data Privacy**: User data isolation via RLS

---

## ⚡ Performance Optimization

### Server-Side Rendering (SSR)

- **Static Generation** for content pages
- **Incremental Static Regeneration** for dynamic content
- **Edge Functions** for API routes (low latency)

### Code Splitting

- **Route-based** splitting (automatic)
- **Component-level** lazy loading
- **Dynamic imports** for heavy components

### Caching Strategy

- **CDN Caching**: Vercel Edge Network
- **Browser Caching**: Aggressive for static assets
- **API Response Caching**: Stale-while-revalidate
- **Database Caching**: Supabase connection pooling

### Bundle Optimization

- **Tree Shaking**: Remove unused code
- **Minification**: Terser for JS, cssnano for CSS
- **Image Optimization**: Next.js Image component
- **Font Optimization**: Next.js Font optimization

### Performance Targets

- **Lighthouse Performance**: >90
- **First Contentful Paint**: <1.8s
- **Time to Interactive**: <3.8s
- **Cumulative Layout Shift**: <0.1

**Optimization Guides**: See `archive/reports/CLS_OPTIMIZATION_GUIDE.md`

---

## 🔄 State Management

### React Context Architecture

**11+ Contexts for Domain Separation:**

1. **AuthContext** - User authentication state
2. **ProgressContext** - Learning progress tracking
3. **ExamContext** - Mock exam state
4. **PracticeContext** - Practice mode state
5. **ReviewContext** - Spaced repetition state
6. **AchievementContext** - Gamification state
7. **AnalyticsContext** - Event tracking
8. **VideoContext** - Video playback state
9. **LabContext** - Interactive lab state
10. **SettingsContext** - User preferences
11. **NotificationContext** - UI notifications

### Dual Persistence

- **Primary**: Supabase (server-side)
- **Fallback**: localStorage (offline support)
- **Sync Strategy**: Optimistic updates + reconciliation

---

## 🧪 Testing Strategy

### Unit Testing (Vitest)

- **Coverage Target**: >80%
- **Test Files**: `__tests__/*.test.ts(x)`
- **Focus**: Business logic, utils, hooks

### Integration Testing

- **API Routes**: `/api/__tests__/`
- **Database**: Test DB with migrations
- **Authentication**: Mock Supabase client

### E2E Testing (Playwright)

- **Critical Paths**: Auth flow, learning flow, exam flow
- **Browser Coverage**: Chromium, Firefox, WebKit
- **Visual Regression**: Screenshot comparison

### Performance Testing

- **Lighthouse CI**: Automated on PR
- **Bundle Analysis**: Next.js Bundle Analyzer
- **Load Testing**: Artillery (for API endpoints)

**Test Reports**: See `archive/reports/`

---

## 📁 Project Structure

```
modern-tco/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth routes
│   │   ├── (dashboard)/       # Protected routes
│   │   ├── modules/           # Learning modules
│   │   ├── practice/          # Practice mode
│   │   ├── exam/              # Mock exams
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── learning/          # Learning components
│   │   ├── gamification/      # Badges, points, levels
│   │   └── shared/            # Reusable components
│   ├── contexts/              # React Contexts (11+)
│   ├── lib/                   # Utility functions
│   │   ├── supabase/          # DB client
│   │   ├── analytics/         # PostHog wrapper
│   │   └── learning-science/  # SR algorithms
│   ├── content/
│   │   ├── modules/           # MDX learning content
│   │   └── questions/         # Question banks
│   └── types/                 # TypeScript types
├── supabase/
│   ├── migrations/            # Database migrations (24 files)
│   └── seed.sql              # Seed data
├── docs/                      # Documentation
│   ├── MIGRATION_INVENTORY.md
│   ├── MIGRATION_LINEAGE.md
│   └── PRODUCTION_DEPLOYMENT_GUIDE.md
├── archive/                   # Historical docs
│   ├── deployment/
│   ├── reports/
│   └── summaries/
├── .claude/                   # Claude Code config
│   ├── CLAUDE.md              # Project instructions
│   ├── agent-routing-config.json
│   └── commands/              # Slash commands
├── DEPLOYMENT.md              # This deployment guide
├── ARCHITECTURE.md            # This architecture doc
└── README.md                  # Project overview
```

---

## 🔌 API Endpoints

### Public Endpoints

- `GET /api/health` - Health check
- `GET /api/study/content` - Study content (requires auth)

### Simulator Endpoints

- `GET /api/sim-meta` - Simulator metadata
- `POST /api/sim-run` - Execute simulation
- `POST /api/sim-save` - Save simulation state
- `GET /api/sim-saved` - Retrieve saved simulations
- `POST /api/sim-eval` - Evaluate simulation

### Payment Endpoints (if enabled)

- `POST /api/stripe/create-checkout-session` - Stripe checkout

### Analytics Endpoints (Internal)

- PostHog events sent client-side
- Sentry errors sent automatically

---

## 🚀 Deployment Architecture

### Vercel Platform

- **Region**: Auto (closest to user)
- **Edge Network**: Global CDN
- **Serverless Functions**: API routes
- **Build**: Next.js optimized builds

### Database (Supabase)

- **Region**: US West (configurable)
- **Connection Pooling**: Enabled
- **Backups**: Daily, 7-day retention
- **Monitoring**: Built-in dashboard

### CI/CD Pipeline

1. **GitHub Push** → Trigger Vercel build
2. **Vercel Build** → Next.js production build
3. **Deployment** → Edge network deployment
4. **Health Check** → `/api/health` verification
5. **Monitoring** → Sentry + PostHog active

---

## 📈 Scalability Considerations

### Current Capacity

- **Users**: 10,000+ concurrent (Vercel limit)
- **Database**: 100GB storage, 10,000 connections (Supabase)
- **API**: Unlimited requests (Vercel Pro)

### Scaling Strategy

1. **Horizontal**: Edge functions auto-scale
2. **Database**: Supabase connection pooling
3. **CDN**: Vercel Edge Network (global)
4. **Caching**: Aggressive static asset caching

### Future Enhancements

- Multi-region database (read replicas)
- Advanced caching (Redis)
- Queue system (for AI jobs)
- Microservices (if needed)

---

## 📚 Additional Resources

### Documentation

- **Migration Docs**: `docs/MIGRATION_INVENTORY.md`, `docs/MIGRATION_LINEAGE.md`
- **Deployment Guide**: `DEPLOYMENT.md`
- **Project Instructions**: `.claude/CLAUDE.md`

### External Docs

- **Next.js**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com/docs

### Historical Docs

- **Archived Reports**: `archive/reports/`
- **Deployment History**: `archive/deployment/`
- **Fix Summaries**: `archive/summaries/`

---

## 🔧 Development Setup

See `README.md` for complete setup instructions.

**Quick Start:**

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Add Supabase credentials

# Run database migrations
npx supabase db push

# Start development server
npm run dev
```

---

**Document Version:** 1.0
**Last Updated:** October 11, 2025
**Maintained By:** Technical Architecture Team
