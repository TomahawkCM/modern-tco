# UX Strategy & Onboarding Design

## Design Philosophy

### Core Principles

1. **AI-first interaction**: The conversational AI assistant is the primary way users interact with their money. Every screen should have a path to "Ask AI."

2. **Progressive disclosure**: Simple by default, details on demand. The average person sees balances and a greeting. Power users drill into charts and reports.

3. **Zero financial jargon**: "How much can I spend this week?" not "What is my discretionary spending capacity after fixed obligations?" Every label, tooltip, and AI response uses plain language.

4. **Mobile-first, desktop-enhanced**: Design for phone screens first, then expand for desktop. 70%+ of budget app usage is mobile.

5. **Non-judgmental**: No shame UI. Overspending is shown as information, not failure. Celebration for progress, neutral tone for setbacks.

6. **Accessibility as default**: 18px base font, 48px touch targets, 4.5:1 contrast ratio, screen reader optimization, RTL support. Not a "mode" — the default design is accessible.

### Competitive UX Benchmarks

| Aspect         | Best-in-Class         | What They Do                             | Our Target              |
| -------------- | --------------------- | ---------------------------------------- | ----------------------- |
| Visual Design  | Copilot Money (4.8/5) | Polished, intentional, native feel       | Match or exceed         |
| Engagement     | Cleo (4.7/5)          | Personality, humor, gamification         | Adopt personality modes |
| AI Integration | Monarch               | Sparkle insights on every surface        | AI-first throughout     |
| Simplicity     | Simplifi              | Personalized spending plan, auto-adjusts | Progressive disclosure  |
| Accessibility  | None (gap!)           | No competitor targets WCAG 2.2 AA        | First-mover advantage   |

## Onboarding Flow (New Online Users)

### Design Goals

- Complete in **under 3 minutes**
- Every step skippable (except account creation)
- AI-assisted setup (smart defaults from imported data)
- Celebrate completion

### Step-by-Step Flow

#### Step 1: Welcome + Sign Up (30 seconds)

```
┌──────────────────────────────────────┐
│                                      │
│    [Logo]                            │
│                                      │
│    Your money. Your privacy.         │
│    Smart budgeting for everyone.     │
│                                      │
│    ┌──────────────────────────────┐  │
│    │ Continue with Google         │  │
│    └──────────────────────────────┘  │
│    ┌──────────────────────────────┐  │
│    │ Continue with Apple          │  │
│    └──────────────────────────────┘  │
│    ┌──────────────────────────────┐  │
│    │ Sign up with Email           │  │
│    └──────────────────────────────┘  │
│                                      │
│    Already have an account? Log in   │
│                                      │
│    Free forever · No credit card     │
│                                      │
└──────────────────────────────────────┘
```

#### Step 2: Privacy Choice (20 seconds)

```
┌──────────────────────────────────────┐
│                                      │
│    How secure should your data be?   │
│                                      │
│    ┌──────────────────────────┐      │
│    │ Standard (Recommended)   │      │
│    │ Bank-grade protection.   │      │
│    │ Full AI features.        │      │
│    │ ✓ Most popular           │      │
│    └──────────────────────────┘      │
│                                      │
│    ┌──────────────────────────┐      │
│    │ Extra Private            │      │
│    │ Your data encrypted       │      │
│    │ before it leaves your     │      │
│    │ device. Full AI features. │      │
│    └──────────────────────────┘      │
│                                      │
│    ┌──────────────────────────┐      │
│    │ Maximum Privacy           │      │
│    │ Zero-knowledge. We can't  │      │
│    │ see your data at all.     │      │
│    │ Requires your own AI key. │      │
│    └──────────────────────────┘      │
│                                      │
│    You can change this anytime       │
│                                      │
└──────────────────────────────────────┘
```

#### Step 3: Bank Connection (60 seconds)

```
┌──────────────────────────────────────┐
│                                      │
│    Connect your bank for             │
│    automatic imports                 │
│                                      │
│    ┌──────────────────────────┐      │
│    │ Connect via SimpleFIN    │      │
│    │ $1.50/month · Read-only  │      │
│    │ We never see your login  │      │
│    └──────────────────────────┘      │
│                                      │
│    ┌──────────────────────────┐      │
│    │ Import a CSV/PDF file    │      │
│    │ From your bank's website │      │
│    └──────────────────────────┘      │
│                                      │
│    [Skip — I'll add manually]        │
│                                      │
│    We support 71+ banks worldwide    │
│                                      │
└──────────────────────────────────────┘
```

#### Step 4: Smart Setup (30 seconds)

```
┌──────────────────────────────────────┐
│                                      │
│    Based on your data, here's a      │
│    suggested budget:                 │
│                                      │
│    Income:        $2,450/month       │
│    ─────────────────────────────     │
│    Housing:       $900    [edit]     │
│    Food:          $400    [edit]     │
│    Transport:     $200    [edit]     │
│    Entertainment: $150    [edit]     │
│    Savings:       $500    [edit]     │
│    Everything else: $300  [edit]     │
│                                      │
│    ┌──────────────────────────┐      │
│    │ Looks good!              │      │
│    └──────────────────────────┘      │
│    [Customize more]                  │
│                                      │
└──────────────────────────────────────┘
```

If no bank data imported, show a simpler setup: "What's your monthly income?" → suggest 50/30/20 split.

#### Step 5: Household Setup (20 seconds)

```
┌──────────────────────────────────────┐
│                                      │
│    Do you share finances with        │
│    someone?                          │
│                                      │
│    ┌──────────────────────────┐      │
│    │ Yes — invite them        │      │
│    │ Share budgets, split      │      │
│    │ expenses, track together  │      │
│    └──────────────────────────┘      │
│                                      │
│    ┌──────────────────────────┐      │
│    │ No — just me             │      │
│    └──────────────────────────┘      │
│                                      │
│    Family plan: up to 5 members     │
│                                      │
└──────────────────────────────────────┘
```

#### Step 6: Accessibility (20 seconds)

```
┌──────────────────────────────────────┐
│                                      │
│    Make it yours                     │
│                                      │
│    Language:  [English ▼]            │
│    Currency:  [USD ($) ▼]            │
│                                      │
│    ┌──────────────────────────┐      │
│    │ □ Larger text & buttons  │      │
│    │   (Seniors-friendly mode)│      │
│    └──────────────────────────┘      │
│                                      │
│    ┌──────────────────────────┐      │
│    │ □ High contrast          │      │
│    └──────────────────────────┘      │
│                                      │
│    ┌──────────────────────────┐      │
│    │ □ Reduce motion          │      │
│    └──────────────────────────┘      │
│                                      │
│    114 languages available           │
│                                      │
└──────────────────────────────────────┘
```

#### Step 7: Meet Your AI Assistant (20 seconds)

```
┌──────────────────────────────────────┐
│                                      │
│    Meet your financial assistant     │
│                                      │
│    ┌──────────────────────────┐      │
│    │ 🤖 Hi! I'm your budget  │      │
│    │ assistant. I can help you│      │
│    │ track spending, plan     │      │
│    │ budgets, and give you    │      │
│    │ insights about your      │      │
│    │ money.                   │      │
│    │                          │      │
│    │ Try asking me:           │      │
│    │ · "How much did I spend  │      │
│    │    this month?"          │      │
│    │ · "Am I on track for     │      │
│    │    my savings goal?"     │      │
│    └──────────────────────────┘      │
│                                      │
│    ┌──────────────────────────┐      │
│    │ Type a question...   🎤 │      │
│    └──────────────────────────┘      │
│                                      │
│    [Get started →]                   │
│                                      │
└──────────────────────────────────────┘
```

## Migration: Offline → Online

### Flow for Existing Users

1. User navigates to Settings → "Enable Cloud Sync"
2. Shown benefits: "Sync across devices, automatic backups, AI insights, family sharing"
3. Sign up / sign in to Supabase account
4. Choose encryption tier (same 3-card UI as onboarding)
5. **Migration preview**: "You have 1,247 transactions, 5 accounts, and 12 budgets. These will be uploaded to the cloud."
6. Upload with progress bar and cancel option
7. Post-upload integrity check (checksum comparison)
8. Success: "Cloud sync enabled! Your data is backed up and accessible from any device."

### Safety Guarantees

- Migration is **reversible**: "Disable Cloud Sync" deletes cloud data, local data stays
- No data is deleted from IndexedDB during migration
- User can verify data integrity post-migration
- 24-hour undo window for accidental migrations

## Dashboard Design

### Mobile Layout (Primary)

```
┌──────────────────────────────────────┐
│ Good morning, Rob         [🔔] [⚙️] │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ AI Summary                       │ │
│ │ You have $342 left to spend      │ │
│ │ this week. Your electric bill    │ │
│ │ of ~$145 is due Thursday.        │ │
│ │                         [Ask AI] │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌─────────┐┌─────────┐┌──────────┐  │
│ │Safe to  ││Total    ││Monthly   │  │
│ │Spend    ││Balance  ││Net       │  │
│ │$342     ││$12,450  ││+$1,203   │  │
│ └─────────┘└─────────┘└──────────┘  │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Budget Progress         Feb 2026 │ │
│ │ ████████████░░░░  72% used       │ │
│ │                                  │ │
│ │ Food:    ████████░░  80%  ⚠️     │ │
│ │ Housing: ████████████ 100% ✓     │ │
│ │ Fun:     ████░░░░░░  40%         │ │
│ │ Savings: ██████████░ 90%  ✨     │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Recent Transactions              │ │
│ │ Today                            │ │
│ │ Costco         Groceries  -$52   │ │
│ │ Spotify        Music      -$11   │ │
│ │ Yesterday                        │ │
│ │ Salary         Income   +$2,450  │ │
│ │                     [See all →]  │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Insights                    ✨    │ │
│ │ Groceries down 12% this week     │ │
│ │ New subscription: Disney+ $15/mo │ │
│ │                    [See all →]   │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ 🔥 14-day streak!               │ │
│ │ Keep logging to earn badges      │ │
│ └──────────────────────────────────┘ │
│                                      │
│ [🏠 Home] [💳 Tx] [➕] [📊 Budget] [👤] │
└──────────────────────────────────────┘
```

### Quick Action FAB

Floating action button in bottom-right corner expands to:

- Add expense (most common)
- Add income
- Ask AI
- Scan receipt

## Mobile Design Principles

- **18px base font**: Readable for all ages including seniors
- **48px touch targets**: All buttons, list items, and interactive elements
- **Bottom navigation**: 4 tabs maximum (Home, Transactions, Add, Budget)
- **Pull-to-refresh**: Triggers cloud sync
- **Swipe gestures**: Left to delete, right to categorize
- **One-handed operation**: All primary actions reachable with thumb
- **Dark mode**: System-aware theme switching with manual override
- **High contrast mode**: 7:1 contrast ratio for low vision users

## Accessibility (WCAG 2.2 AA)

### Already Built

- `SeniorsModeContext` with font scaling (14px → 18px/20px), touch target sizing (44px → 52px), high contrast, reduced motion, simplified mode

### Enhancements for Online

- ARIA live regions for real-time sync status and balance changes
- Full keyboard navigation with visible focus indicators
- Color contrast: 4.5:1 (AA) for all text, 3:1 for large text
- Focus management: When AI responds, focus moves to response
- Skip navigation links on every page
- Error identification in text, not just color
- RTL layout support for Arabic, Hebrew (9 of 114 locales)
- Screen reader testing with NVDA (Windows) and VoiceOver (Mac/iOS)

### Seniors Mode Enhancements

- 20px base font (instead of 18px)
- 52px touch targets (instead of 48px)
- Simplified navigation (fewer menu items)
- Larger icons with text labels
- Optional voice guidance for key actions
- Reduced cognitive load: fewer choices per screen
