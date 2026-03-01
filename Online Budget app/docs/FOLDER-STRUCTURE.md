# Online Budget App — Folder Structure

## Design Principles

1. **Same codebase, feature-flagged** — Online code lives alongside offline code in `src/`. No separate project.
2. **Additive, not destructive** — New files are added; existing files are extended, never replaced.
3. **Mirror existing patterns** — Follow the same conventions already established (contexts in `src/contexts/`, hooks in `src/hooks/`, etc.).
4. **Cloud code is clearly identifiable** — New directories use descriptive names. Files that extend existing modules are annotated.
5. **Supabase migrations are versioned** — All schema changes tracked in `supabase/migrations/`.

---

## New & Modified Files Overview

```
Legend:
  [NEW]      — New file or directory
  [EXTEND]   — Existing file that gets modified
  [EXISTING] — Existing file, no changes needed (reference only)
```

---

## Complete Structure

```
modern-tco/
├── supabase/                                          [NEW] Supabase project root
│   ├── config.toml                                    [NEW] Supabase local config
│   ├── seed.sql                                       [NEW] Development seed data
│   └── migrations/                                    [NEW] Versioned SQL migrations
│       ├── 00001_households.sql                       [NEW] households + household_members tables
│       ├── 00002_billing.sql                          [NEW] billing_subscriptions table
│       ├── 00003_sync_metadata.sql                    [NEW] sync_metadata table
│       ├── 00004_budget_accounts.sql                  [NEW] budget_accounts (cloud mirror)
│       ├── 00005_budget_transactions.sql              [NEW] budget_transactions (cloud mirror)
│       ├── 00006_budget_categories.sql                [NEW] budget_categories (cloud mirror)
│       ├── 00007_budget_budgets.sql                   [NEW] budget_budgets (cloud mirror)
│       ├── 00008_budget_subscriptions.sql             [NEW] budget_subscriptions (cloud mirror)
│       ├── 00009_budget_receipts.sql                  [NEW] budget_receipts (cloud mirror)
│       ├── 00010_budget_loans.sql                     [NEW] budget_loans + loan_payments (cloud mirror)
│       ├── 00011_budget_investments.sql               [NEW] budget_investments + portfolios + holdings (cloud mirror)
│       ├── 00012_budget_properties.sql                [NEW] budget_properties (cloud mirror)
│       ├── 00013_budget_supporting_tables.sql         [NEW] profiles, activity_log, merchant_rules, etc.
│       ├── 00014_budget_planning_tables.sql           [NEW] paycheck_plans, event_budgets, scenarios, splits
│       ├── 00015_budget_tracking_tables.sql           [NEW] net_worth_snapshots, gamification, rollovers, notifications
│       ├── 00016_rls_policies.sql                     [NEW] RLS policies for all budget_* tables
│       ├── 00017_rls_functions.sql                    [NEW] user_household_ids() security definer function
│       ├── 00018_indexes.sql                          [NEW] Performance indexes (household_id, updated_at)
│       ├── 00019_realtime_config.sql                  [NEW] Enable Realtime on sync-relevant tables
│       └── 00020_storage_buckets.sql                  [NEW] Supabase Storage buckets (receipts, exports)
│
├── src/
│   ├── config/
│   │   └── features.ts                                [EXTEND] Add new online feature flags
│   │
│   ├── types/
│   │   ├── budget.ts                                  [EXTEND] Add household_id, device_id to entity types
│   │   ├── household.ts                               [NEW] Household, HouseholdMember, Role types
│   │   ├── billing.ts                                 [NEW] Subscription, Plan, BillingStatus types
│   │   ├── cloud-sync.ts                              [NEW] CloudSyncState, SyncProgress, SyncCheckpoint
│   │   ├── insights.ts                                [NEW] Insight, InsightType, WeeklyRecap types
│   │   ├── ai-tools.ts                                [NEW] 21 AI tool parameter/response schemas
│   │   └── supabase.ts                                [EXTEND] Add generated types for new tables
│   │
│   │
│   │   ═══════════════════════════════════════════════
│   │   CONTEXTS — New React context providers
│   │   ═══════════════════════════════════════════════
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx                             [EXTEND] Add household role, member list
│   │   ├── LANSyncContext.tsx                          [EXTEND] Add cloud transport support
│   │   ├── ChatbotContext.tsx                          [EXTEND] Add tool calling, personality, voice
│   │   ├── NotificationContext.tsx                     [EXTEND] Add push notifications, insights
│   │   ├── PrivacyContext.tsx                          [EXTEND] Add encryption tier selection
│   │   ├── CloudSyncContext.tsx                        [NEW] Cloud sync state, progress, status
│   │   ├── HouseholdContext.tsx                       [NEW] Household membership, roles, invites
│   │   ├── BillingContext.tsx                          [NEW] Stripe subscription state
│   │   └── InsightsContext.tsx                         [NEW] Proactive insights, weekly recap
│   │
│   │
│   │   ═══════════════════════════════════════════════
│   │   HOOKS — New custom React hooks
│   │   ═══════════════════════════════════════════════
│   │
│   ├── hooks/
│   │   ├── useOfflineSync.ts                          [EXTEND] Support cloud transport
│   │   ├── useWeeklyRecap.ts                          [EXTEND] AI-generated recap
│   │   ├── useCloudSync.ts                            [NEW] Cloud sync operations
│   │   ├── useHousehold.ts                            [NEW] Household operations
│   │   ├── useBilling.ts                              [NEW] Billing & plan management
│   │   ├── useInsights.ts                             [NEW] Insight retrieval & dismissal
│   │   ├── useSpeechRecognition.ts                    [NEW] Web Speech API for voice input
│   │   ├── usePresence.ts                             [NEW] Supabase Realtime device presence
│   │   ├── useConflictResolution.ts                   [NEW] Sync conflict UI state
│   │   └── webmcp/                                    [EXISTING] WebMCP hooks (extend with new tools)
│   │       ├── useGetProperties.ts                    [NEW] Properties tool
│   │       ├── useGetExpenseSplits.ts                  [NEW] Expense splits tool
│   │       ├── useGetEventBudgets.ts                   [NEW] Event budgets tool
│   │       ├── useGetLoanDetails.ts                    [NEW] Loan details tool
│   │       ├── useGetRefunds.ts                        [NEW] Refund tracking tool
│   │       ├── useCreateSplit.ts                       [NEW] Split creation tool
│   │       └── useAllocatePaycheck.ts                  [NEW] Paycheck allocation tool
│   │
│   │
│   │   ═══════════════════════════════════════════════
│   │   LIB — Core library modules
│   │   ═══════════════════════════════════════════════
│   │
│   ├── lib/
│   │   ├── budget-db.ts                               [EXTEND] Add Dexie change hooks for cloud sync
│   │   ├── encryption.ts                              [EXTEND] Add E2E + Zero-Knowledge tiers
│   │   │
│   │   ├── sync/                                      [EXTEND] Cloud sync transport
│   │   │   ├── sync-engine.ts                         [EXISTING] Core sync (no changes needed)
│   │   │   ├── offline-manager.ts                     [EXISTING] Offline queue (no changes needed)
│   │   │   ├── device-discovery.ts                    [EXISTING] LAN discovery (no changes)
│   │   │   ├── types.ts                               [EXTEND] Add cloud-specific message types
│   │   │   ├── cloud-transport.ts                     [NEW] Supabase REST + Realtime transport
│   │   │   ├── cloud-presence.ts                      [NEW] Device presence via Supabase Realtime
│   │   │   ├── sync-checkpoint.ts                     [NEW] Checkpoint tracking for resumable sync
│   │   │   ├── tab-coordinator.ts                     [NEW] BroadcastChannel multi-tab coordination
│   │   │   └── migration-upload.ts                    [NEW] Offline-to-online data migration logic
│   │   │
│   │   ├── ai/                                        [EXTEND] Enhanced AI modules
│   │   │   ├── openai-service.ts                      [EXISTING] Base OpenAI integration
│   │   │   ├── anomaly-detection.ts                   [EXISTING] Z-score analysis
│   │   │   ├── predictive-spending.ts                 [EXISTING] Spending predictions
│   │   │   ├── smart-transaction-enrichment.ts        [EXISTING] Merchant enrichment
│   │   │   ├── financial-context.ts                   [NEW] FinancialContext snapshot assembly
│   │   │   ├── insights-engine.ts                     [NEW] 8 proactive insight types
│   │   │   ├── weekly-recap.ts                        [NEW] AI-generated weekly summary
│   │   │   ├── personality.ts                         [NEW] 3 personality mode system prompts
│   │   │   ├── year-in-review.ts                      [NEW] Annual financial review generator
│   │   │   └── tools/                                 [NEW] AI tool definitions & handlers
│   │   │       ├── index.ts                           [NEW] Tool registry & exports
│   │   │       ├── tool-schemas.ts                    [NEW] OpenAI function schemas (strict: true)
│   │   │       ├── read-tools.ts                      [NEW] get_accounts, get_transactions, etc.
│   │   │       ├── write-tools.ts                     [NEW] create_transaction, update_budget, etc.
│   │   │       ├── analysis-tools.ts                  [NEW] compare_periods, forecast_cashflow, etc.
│   │   │       └── tool-executor.ts                   [NEW] Client-side tool execution layer
│   │   │
│   │   ├── household/                                 [NEW] Household management
│   │   │   ├── household-service.ts                   [NEW] CRUD for households
│   │   │   ├── invitation-service.ts                  [NEW] Invite flow (email, link, QR)
│   │   │   ├── role-permissions.ts                    [NEW] Role-based permission checks
│   │   │   ├── activity-feed.ts                       [NEW] Activity feed generation
│   │   │   └── types.ts                               [NEW] Household-specific types
│   │   │
│   │   ├── billing/                                   [NEW] Stripe billing
│   │   │   ├── stripe-client.ts                       [NEW] Stripe SDK wrapper
│   │   │   ├── plan-manager.ts                        [NEW] Plan upgrade/downgrade logic
│   │   │   ├── usage-tracker.ts                       [NEW] AI message limits, feature gating
│   │   │   └── types.ts                               [NEW] Billing types
│   │   │
│   │   ├── banking/                                   [NEW] Open banking adapters (Phase 3)
│   │   │   ├── adapter-interface.ts                   [NEW] Common adapter interface
│   │   │   ├── plaid/                                 [NEW] Plaid adapter (US)
│   │   │   │   ├── client.ts
│   │   │   │   ├── sync.ts
│   │   │   │   └── types.ts
│   │   │   ├── gocardless/                            [NEW] goCardless adapter (EU/UK)
│   │   │   │   ├── client.ts
│   │   │   │   ├── sync.ts
│   │   │   │   └── types.ts
│   │   │   └── truelayer/                             [NEW] TrueLayer adapter (UK/EU)
│   │   │       ├── client.ts
│   │   │       ├── sync.ts
│   │   │       └── types.ts
│   │   │
│   │   ├── bnpl/                                      [NEW] Buy Now Pay Later tracking (Phase 3)
│   │   │   ├── bnpl-tracker.ts                        [NEW] BNPL obligation tracking
│   │   │   ├── bnpl-detector.ts                       [NEW] Auto-detect BNPL in transactions
│   │   │   └── types.ts                               [NEW] BNPL types
│   │   │
│   │   ├── simplefin/                                 [EXISTING] SimpleFIN integration
│   │   │   ├── client.ts                              [EXISTING]
│   │   │   ├── sync.ts                                [EXTEND] Wire into cloud sync
│   │   │   ├── encryption.ts                          [EXISTING]
│   │   │   └── types.ts                               [EXISTING]
│   │   │
│   │   ├── encryption/                                [EXTEND] E2E + Zero-Knowledge
│   │   │   ├── budget-encryption.ts                   [EXISTING]
│   │   │   ├── encrypted-db-wrapper.ts                [EXISTING]
│   │   │   ├── encrypted-transactions.ts              [EXISTING]
│   │   │   ├── migrate-to-encryption.ts               [EXISTING]
│   │   │   ├── key-management.ts                      [NEW] Master key, DEK wrapping, PBKDF2
│   │   │   ├── key-sharing.ts                         [NEW] ECDH device key exchange for E2E
│   │   │   ├── recovery-key.ts                        [NEW] BIP39 mnemonic recovery key
│   │   │   └── zero-knowledge.ts                      [NEW] Zero-knowledge field encryption
│   │   │
│   │   ├── analytics/                                 [EXTEND] Online analytics
│   │   │   ├── health-score.ts                        [EXISTING]
│   │   │   ├── anomaly-detector.ts                    [EXISTING]
│   │   │   ├── spending-insights.ts                   [EXISTING]
│   │   │   ├── trend-forecasting.ts                   [EXISTING]
│   │   │   ├── cashflow-forecast.ts                   [NEW] 30/60/90-day projections
│   │   │   ├── subscription-optimizer.ts              [NEW] Optimization recommendations
│   │   │   └── bill-predictor.ts                      [NEW] Upcoming bill predictions
│   │   │
│   │   ├── budget/                                    [EXTEND] Budget extensions
│   │   │   ├── paycheck-planner.ts                    [EXISTING]
│   │   │   ├── rollover-engine.ts                     [EXISTING]
│   │   │   ├── safe-to-spend.ts                       [EXISTING]
│   │   │   └── shared-budget.ts                       [NEW] Household shared budget logic
│   │   │
│   │   ├── refunds/                                   [EXTEND] Enhanced refund tracking
│   │   │   ├── refund-tracker.ts                      [EXISTING]
│   │   │   └── refund-matcher.ts                      [NEW] Auto-match refunds to transactions
│   │   │
│   │   ├── event-budgets/                             [EXTEND]
│   │   │   ├── event-budget-engine.ts                 [EXISTING]
│   │   │   ├── seasonal-templates.ts                  [EXISTING]
│   │   │   └── collaborative-events.ts                [NEW] Multi-member event budgeting
│   │   │
│   │   ├── expense-splits/                            [EXTEND]
│   │   │   ├── split-engine.ts                        [EXISTING]
│   │   │   └── settlement-tracker.ts                  [NEW] Running balances, settlements
│   │   │
│   │   ├── scenarios/                                 [EXTEND]
│   │   │   ├── scenario-engine.ts                     [EXISTING]
│   │   │   ├── scenario-types.ts                      [EXISTING]
│   │   │   └── ai-scenario-advisor.ts                 [NEW] AI-powered what-if analysis
│   │   │
│   │   ├── notifications/                             [EXTEND]
│   │   │   ├── notification-scheduler.ts              [EXISTING]
│   │   │   ├── notification-settings.ts               [EXISTING]
│   │   │   └── push-notifications.ts                  [NEW] PWA push via Supabase (Phase 4)
│   │   │
│   │   ├── categorization/                            [EXTEND]
│   │   │   ├── ml-categorizer.ts                      [EXISTING]
│   │   │   ├── rules.ts                               [EXISTING]
│   │   │   ├── training-data-generator.ts             [EXISTING]
│   │   │   └── cloud-ml-trainer.ts                    [NEW] Cloud model training (Phase 3)
│   │   │
│   │   ├── financial-engine/                          [EXISTING] No changes needed
│   │   ├── calculators/                               [EXISTING] No changes needed
│   │   ├── parsers/                                   [EXISTING] No changes needed
│   │   ├── import/                                    [EXISTING] No changes needed
│   │   ├── export/                                    [EXISTING] Minor extend for cloud exports
│   │   ├── search/                                    [EXISTING] No changes needed
│   │   ├── loans/                                     [EXISTING] No changes needed
│   │   ├── net-worth/                                 [EXISTING] No changes needed
│   │   ├── property/                                  [EXISTING] No changes needed
│   │   └── subscriptions/                             [EXISTING] No changes needed
│   │
│   │
│   │   ═══════════════════════════════════════════════
│   │   API ROUTES — Server-side endpoints
│   │   ═══════════════════════════════════════════════
│   │
│   ├── app/api/
│   │   ├── chat/
│   │   │   └── route.ts                               [EXTEND] Add 21 tool defs, streaming, personality
│   │   │
│   │   ├── v1/stripe/
│   │   │   ├── create-checkout-session/
│   │   │   │   └── route.ts                           [EXISTING]
│   │   │   ├── webhook/                               [NEW] Stripe webhook handler
│   │   │   │   └── route.ts                           [NEW]
│   │   │   ├── portal/                                [NEW] Customer portal session
│   │   │   │   └── route.ts                           [NEW]
│   │   │   └── subscription/                          [NEW] Subscription status
│   │   │       └── route.ts                           [NEW]
│   │   │
│   │   ├── v1/household/                              [NEW] Household management API
│   │   │   ├── route.ts                               [NEW] Create/get household
│   │   │   ├── invite/
│   │   │   │   └── route.ts                           [NEW] Send/accept invitations
│   │   │   ├── members/
│   │   │   │   └── route.ts                           [NEW] List/update/remove members
│   │   │   └── activity/
│   │   │       └── route.ts                           [NEW] Activity feed endpoint
│   │   │
│   │   ├── v1/sync/                                   [NEW] Cloud sync API
│   │   │   ├── push/
│   │   │   │   └── route.ts                           [NEW] Upload changes to cloud
│   │   │   ├── pull/
│   │   │   │   └── route.ts                           [NEW] Download changes from cloud
│   │   │   ├── full/
│   │   │   │   └── route.ts                           [NEW] Full sync (migration upload)
│   │   │   └── status/
│   │   │       └── route.ts                           [NEW] Sync status & device presence
│   │   │
│   │   ├── v1/insights/                               [NEW] AI insights API
│   │   │   ├── route.ts                               [NEW] Get insights for dashboard
│   │   │   └── recap/
│   │   │       └── route.ts                           [NEW] Generate weekly recap
│   │   │
│   │   ├── v1/backup/                                 [NEW] Cloud backup API
│   │   │   └── route.ts                               [NEW] Trigger/restore backup
│   │   │
│   │   ├── v2/                                        [NEW] Public API (Pro users, Phase 3)
│   │   │   ├── accounts/
│   │   │   │   └── route.ts                           [NEW]
│   │   │   ├── transactions/
│   │   │   │   └── route.ts                           [NEW]
│   │   │   ├── budgets/
│   │   │   │   └── route.ts                           [NEW]
│   │   │   └── webhooks/
│   │   │       └── route.ts                           [NEW]
│   │   │
│   │   ├── cron/                                      [NEW] Scheduled jobs
│   │   │   ├── nightly-backup/
│   │   │   │   └── route.ts                           [NEW] Nightly cloud backup
│   │   │   ├── weekly-recap/
│   │   │   │   └── route.ts                           [NEW] Sunday recap generation
│   │   │   ├── insight-refresh/
│   │   │   │   └── route.ts                           [NEW] Periodic insight computation
│   │   │   └── tombstone-cleanup/
│   │   │       └── route.ts                           [NEW] Remove old soft-deleted records
│   │   │
│   │   └── banking/                                   [NEW] Open banking (Phase 3)
│   │       ├── plaid/
│   │       │   ├── link/route.ts                      [NEW] Plaid Link token
│   │       │   ├── exchange/route.ts                  [NEW] Token exchange
│   │       │   └── webhook/route.ts                   [NEW] Plaid webhooks
│   │       └── gocardless/
│   │           ├── connect/route.ts                   [NEW] goCardless connect
│   │           └── webhook/route.ts                   [NEW] goCardless webhooks
│   │
│   │
│   │   ═══════════════════════════════════════════════
│   │   PAGES — New budget app pages
│   │   ═══════════════════════════════════════════════
│   │
│   ├── app/budget-app/
│   │   ├── page.tsx                                   [EXTEND] Add AI summary, insights, sync status
│   │   ├── layout.tsx                                 [EXTEND] Add CloudSyncProvider, HouseholdProvider
│   │   │
│   │   ├── settings/
│   │   │   ├── page.tsx                               [EXTEND] Add online settings sections
│   │   │   ├── billing/                               [NEW] Subscription management
│   │   │   │   └── page.tsx                           [NEW] Plan, payment, invoices
│   │   │   ├── household/                             [NEW] Household settings
│   │   │   │   └── page.tsx                           [NEW] Members, roles, invites
│   │   │   ├── sync/                                  [NEW] Sync configuration
│   │   │   │   └── page.tsx                           [NEW] Devices, sync mode, status
│   │   │   ├── encryption/                            [NEW] Encryption tier management
│   │   │   │   └── page.tsx                           [NEW] Tier selection, key management
│   │   │   └── api-keys/                              [NEW] API access (Phase 3)
│   │   │       └── page.tsx                           [NEW] API key management
│   │   │
│   │   ├── migration/                                 [NEW] Offline-to-online migration
│   │   │   └── page.tsx                               [NEW] Migration wizard with progress
│   │   │
│   │   ├── year-in-review/                            [NEW] Annual financial review (Phase 3)
│   │   │   └── page.tsx                               [NEW] Spotify Wrapped-style review
│   │   │
│   │   ├── bnpl/                                      [NEW] BNPL tracking (Phase 3)
│   │   │   └── page.tsx                               [NEW] BNPL obligations dashboard
│   │   │
│   │   ├── activity/                                  [NEW] Household activity feed (Phase 2)
│   │   │   └── page.tsx                               [NEW] Activity feed page
│   │   │
│   │   ├── onboarding/
│   │   │   └── page.tsx                               [EXTEND] Add 7-step online onboarding flow
│   │   │
│   │   └── auth/                                      [EXISTING] Already built
│   │       ├── login/page.tsx                         [EXISTING]
│   │       ├── signup/page.tsx                        [EXISTING]
│   │       └── ...                                    [EXISTING]
│   │
│   │
│   │   ═══════════════════════════════════════════════
│   │   COMPONENTS — New and extended UI components
│   │   ═══════════════════════════════════════════════
│   │
│   ├── components/budget/
│   │   ├── Chatbot.tsx                                [EXTEND] Add tool rendering, voice, personality
│   │   ├── SpendingHeatMap.tsx                         [EXTEND] Enhanced interactive heatmap
│   │   │
│   │   ├── chatbot/                                   [EXTEND] Enhanced AI chatbot UI
│   │   │   ├── ChatbotPanel.tsx                       [EXTEND] Add tool result cards
│   │   │   ├── ChatbotInput.tsx                       [EXTEND] Add voice button
│   │   │   ├── ChatbotMessages.tsx                    [EXTEND] Add tool call rendering
│   │   │   ├── ToolResultCard.tsx                     [NEW] Render AI tool results
│   │   │   ├── TransactionConfirmCard.tsx             [NEW] Confirm NL transaction creation
│   │   │   ├── SpendingSummaryCard.tsx                [NEW] Spending breakdown card
│   │   │   ├── BudgetStatusCard.tsx                   [NEW] Budget status card
│   │   │   ├── InsightCard.tsx                        [NEW] AI insight card
│   │   │   ├── PersonalitySelector.tsx                [NEW] Tone mode picker
│   │   │   ├── VoiceInputButton.tsx                   [NEW] Microphone button
│   │   │   └── WeeklyRecapCard.tsx                    [NEW] Weekly recap display
│   │   │
│   │   ├── sync/                                      [NEW] Cloud sync UI
│   │   │   ├── SyncStatusIndicator.tsx                [NEW] Header sync badge
│   │   │   ├── SyncStatusPanel.tsx                    [NEW] Detailed sync status drawer
│   │   │   ├── DeviceList.tsx                         [NEW] Online devices display
│   │   │   ├── ConflictResolutionDialog.tsx           [NEW] Conflict resolution modal
│   │   │   ├── SyncProgressBar.tsx                    [NEW] Migration/full sync progress
│   │   │   └── index.ts                               [NEW]
│   │   │
│   │   ├── household/                                 [NEW] Family/household UI
│   │   │   ├── HouseholdSetup.tsx                     [NEW] Create household wizard
│   │   │   ├── MemberList.tsx                         [NEW] Member list with roles
│   │   │   ├── InvitationDialog.tsx                   [NEW] Send invite (email/link/QR)
│   │   │   ├── InvitationAccept.tsx                   [NEW] Accept invite flow
│   │   │   ├── RoleSelector.tsx                       [NEW] Role assignment dropdown
│   │   │   ├── PrivacyToggleCard.tsx                  [NEW] Per-transaction privacy toggle
│   │   │   └── index.ts                               [NEW]
│   │   │
│   │   ├── activity-feed/                             [NEW] Activity feed components
│   │   │   ├── ActivityFeed.tsx                        [NEW] Main feed component
│   │   │   ├── ActivityItem.tsx                        [NEW] Single activity entry
│   │   │   ├── ActivityFilters.tsx                     [NEW] Filter by member/type
│   │   │   └── index.ts                               [NEW]
│   │   │
│   │   ├── migration/                                 [NEW] Migration wizard UI
│   │   │   ├── MigrationWizard.tsx                    [NEW] Step-by-step migration flow
│   │   │   ├── EncryptionTierPicker.tsx               [NEW] 3-card tier selection
│   │   │   ├── MigrationProgress.tsx                  [NEW] Upload progress with per-entity status
│   │   │   ├── IntegrityCheck.tsx                     [NEW] Post-migration verification
│   │   │   └── index.ts                               [NEW]
│   │   │
│   │   ├── billing/                                   [NEW] Billing UI
│   │   │   ├── PlanComparison.tsx                     [NEW] Free/Pro/Family comparison
│   │   │   ├── SubscriptionStatus.tsx                 [NEW] Current plan status
│   │   │   ├── UpgradePrompt.tsx                      [NEW] Contextual upgrade CTA
│   │   │   ├── InvoiceHistory.tsx                     [NEW] Past invoices list
│   │   │   └── index.ts                               [NEW]
│   │   │
│   │   ├── insights/                                  [NEW] AI insights UI
│   │   │   ├── InsightsDashboard.tsx                  [NEW] Dashboard insights section
│   │   │   ├── InsightCard.tsx                        [NEW] Individual insight card
│   │   │   ├── SparkleInsight.tsx                     [NEW] Inline AI annotation
│   │   │   ├── WeeklyRecapView.tsx                    [NEW] Full weekly recap page
│   │   │   ├── YearInReviewSlides.tsx                 [NEW] Animated year review (Phase 3)
│   │   │   └── index.ts                               [NEW]
│   │   │
│   │   ├── bnpl/                                      [NEW] BNPL tracking UI (Phase 3)
│   │   │   ├── BNPLDashboard.tsx                      [NEW] BNPL obligations overview
│   │   │   ├── BNPLModal.tsx                          [NEW] Add/edit BNPL plan
│   │   │   ├── BNPLTimeline.tsx                       [NEW] Payment timeline visualization
│   │   │   └── index.ts                               [NEW]
│   │   │
│   │   ├── visualizations/                            [NEW] Advanced data viz (Phase 3)
│   │   │   ├── SankeyDiagram.tsx                      [NEW] Money flow Sankey
│   │   │   ├── SpendingCalendar.tsx                   [NEW] Interactive calendar view
│   │   │   ├── GeoSpendingMap.tsx                     [NEW] Map-based spending (Phase 4)
│   │   │   └── index.ts                               [NEW]
│   │   │
│   │   ├── onboarding/                                [EXTEND] Online onboarding steps
│   │   │   ├── OnboardingWizard.tsx                   [EXTEND] Add online steps
│   │   │   ├── PrivacyChoiceStep.tsx                  [NEW] Encryption tier selection
│   │   │   ├── BankConnectionStep.tsx                 [NEW] SimpleFIN setup step
│   │   │   ├── SmartSetupStep.tsx                     [NEW] AI-suggested budget setup
│   │   │   ├── HouseholdStep.tsx                      [NEW] Family invite step
│   │   │   ├── MeetAIStep.tsx                         [NEW] AI assistant introduction
│   │   │   └── index.ts                               [EXISTING]
│   │   │
│   │   ├── gamification/                              [EXTEND] Online gamification
│   │   │   ├── AchievementToast.tsx                   [EXISTING]
│   │   │   ├── BadgeGrid.tsx                          [EXISTING]
│   │   │   ├── StreakCounter.tsx                       [EXISTING]
│   │   │   ├── XPProgressBar.tsx                      [NEW] XP & level display
│   │   │   ├── ChallengeCard.tsx                      [NEW] Financial challenge card
│   │   │   ├── Leaderboard.tsx                        [NEW] Household leaderboard (Phase 3)
│   │   │   └── index.ts                               [NEW]
│   │   │
│   │   ├── settings/                                  [EXTEND] Online settings panels
│   │   │   ├── OnlineFeaturesPanel.tsx                [EXTEND] Expand feature toggles
│   │   │   ├── SyncSettingsPanel.tsx                   [NEW] Cloud sync configuration
│   │   │   ├── HouseholdSettingsPanel.tsx              [NEW] Household management
│   │   │   ├── BillingSettingsPanel.tsx                [NEW] Subscription management
│   │   │   ├── EncryptionSettingsPanel.tsx             [NEW] Encryption tier config
│   │   │   └── APISettingsPanel.tsx                    [NEW] API key management (Phase 3)
│   │   │
│   │   ├── landing/                                   [EXTEND] Updated landing page
│   │   │   └── PricingSection.tsx                     [EXTEND] Add online pricing tiers
│   │   │
│   │   ├── layout/                                    [EXTEND]
│   │   │   ├── Sidebar.tsx                            [EXTEND] Add sync indicator, household
│   │   │   └── MobileNav.tsx                          [EXTEND] Add sync status badge
│   │   │
│   │   └── lan-sync/                                  [EXISTING] No changes (LAN sync preserved)
│   │
│   │
│   │   ═══════════════════════════════════════════════
│   │   UTILITIES
│   │   ═══════════════════════════════════════════════
│   │
│   └── utils/
│       ├── supabase/
│       │   ├── client.ts                              [EXISTING] Browser Supabase client
│       │   ├── server.ts                              [EXISTING] Server Supabase client
│       │   └── middleware.ts                           [EXTEND] Add household role checks
│       └── rate-limiter.ts                            [NEW] Tier-aware rate limiting
│
│
│   ═══════════════════════════════════════════════════
│   TESTS — New test files
│   ═══════════════════════════════════════════════════
│
├── tests/
│   ├── unit/
│   │   ├── cloud-transport.test.ts                    [NEW]
│   │   ├── sync-checkpoint.test.ts                    [NEW]
│   │   ├── tab-coordinator.test.ts                    [NEW]
│   │   ├── migration-upload.test.ts                   [NEW]
│   │   ├── financial-context.test.ts                  [NEW]
│   │   ├── insights-engine.test.ts                    [NEW]
│   │   ├── weekly-recap.test.ts                       [NEW]
│   │   ├── ai-tools.test.ts                           [NEW]
│   │   ├── tool-executor.test.ts                      [NEW]
│   │   ├── household-service.test.ts                  [NEW]
│   │   ├── invitation-service.test.ts                 [NEW]
│   │   ├── role-permissions.test.ts                   [NEW]
│   │   ├── key-management.test.ts                     [NEW]
│   │   ├── key-sharing.test.ts                        [NEW]
│   │   ├── zero-knowledge.test.ts                     [NEW]
│   │   ├── stripe-client.test.ts                      [NEW]
│   │   ├── plan-manager.test.ts                       [NEW]
│   │   ├── usage-tracker.test.ts                      [NEW]
│   │   ├── bnpl-tracker.test.ts                       [NEW]
│   │   ├── bnpl-detector.test.ts                      [NEW]
│   │   ├── refund-matcher.test.ts                     [NEW]
│   │   ├── settlement-tracker.test.ts                 [NEW]
│   │   ├── cashflow-forecast.test.ts                  [NEW]
│   │   ├── subscription-optimizer.test.ts             [NEW]
│   │   └── bill-predictor.test.ts                     [NEW]
│   │
│   ├── integration/
│   │   ├── cloud-sync-roundtrip.test.ts               [NEW] Full sync via Supabase local
│   │   ├── rls-policies.test.ts                       [NEW] RLS policy verification
│   │   ├── concurrent-writes.test.ts                  [NEW] Conflict detection
│   │   ├── offline-reconnect.test.ts                  [NEW] Offline queue drain
│   │   ├── encryption-roundtrip.test.ts               [NEW] E2E encrypt/decrypt cycle
│   │   ├── household-permissions.test.ts              [NEW] Role-based access
│   │   └── stripe-webhook.test.ts                     [NEW] Webhook signature verify
│   │
│   └── e2e/
│       ├── migration-flow.spec.ts                     [NEW] Offline → online migration
│       ├── multi-device-sync.spec.ts                  [NEW] Two browser contexts syncing
│       ├── ai-chatbot.spec.ts                         [NEW] AI tool calling flow
│       ├── household-invite.spec.ts                   [NEW] Invite + accept flow
│       ├── billing-upgrade.spec.ts                    [NEW] Free → Pro upgrade
│       ├── conflict-resolution.spec.ts                [NEW] Sync conflict UI
│       ├── offline-mode.spec.ts                       [NEW] Offline changes + reconnect
│       └── onboarding-online.spec.ts                  [NEW] 7-step online onboarding
│
│
│   ═══════════════════════════════════════════════════
│   DOCUMENTATION & RESEARCH
│   ═══════════════════════════════════════════════════
│
├── Online Budget app/
│   ├── docs/
│   │   ├── ONLINE-BUDGET-APP-MASTER-PLAN.md           [EXISTING]
│   │   └── FOLDER-STRUCTURE.md                        [THIS FILE]
│   └── research/
│       ├── 01-competitive-analysis.md                 [EXISTING]
│       ├── 02-ai-strategy.md                          [EXISTING]
│       ├── 03-architecture-deep-dive.md               [EXISTING]
│       ├── 04-open-banking-and-bank-sync.md           [EXISTING]
│       ├── 05-monetization-and-pricing.md             [EXISTING]
│       ├── 06-ux-and-onboarding.md                    [EXISTING]
│       ├── 07-phased-rollout.md                       [EXISTING]
│       ├── 08-multi-device-sync-deep-dive.md          [EXISTING]
│       ├── 09-family-household-deep-dive.md           [EXISTING]
│       └── 10-missing-features-gap-analysis.md        [EXISTING]
```

---

## File Counts by Phase

### Phase 1: Cloud Foundation

| Category            | New Files | Extended Files |
| ------------------- | --------- | -------------- |
| Supabase migrations | 20        | —              |
| Types               | 3         | 2              |
| Contexts            | 2         | 3              |
| Hooks               | 4         | 1              |
| Lib modules         | 10        | 4              |
| API routes          | 8         | 1              |
| Pages               | 3         | 3              |
| Components          | 17        | 6              |
| Tests (unit)        | 8         | —              |
| Tests (integration) | 5         | —              |
| Tests (e2e)         | 4         | —              |
| **Total**           | **84**    | **20**         |

### Phase 2: AI + Family

| Category    | New Files | Extended Files |
| ----------- | --------- | -------------- |
| Types       | 1         | —              |
| Contexts    | 1         | —              |
| Hooks       | 1         | 1              |
| Lib modules | 15        | 3              |
| API routes  | 5         | 1              |
| Pages       | 1         | 1              |
| Components  | 22        | 4              |
| Tests       | 10        | —              |
| **Total**   | **56**    | **10**         |

### Phase 3: Competitive Edge

| Category    | New Files | Extended Files |
| ----------- | --------- | -------------- |
| Lib modules | 14        | 1              |
| API routes  | 6         | —              |
| Pages       | 2         | —              |
| Components  | 12        | —              |
| Tests       | 8         | —              |
| **Total**   | **42**    | **1**          |

### Phase 4: Scale

| Category    | New Files |
| ----------- | --------- |
| Lib modules | 3         |
| API routes  | 2         |
| Components  | 3         |
| Tests       | 4         |
| **Total**   | **12**    |

---

## Grand Total

| Metric              | Count |
| ------------------- | ----- |
| New files           | ~194  |
| Extended files      | ~31   |
| Supabase migrations | 20    |
| New API routes      | ~21   |
| New pages           | ~6    |
| New components      | ~54   |
| New lib modules     | ~42   |
| New hooks           | ~12   |
| New contexts        | 4     |
| New type files      | 4     |
| New test files      | ~50   |

---

## Key Architecture Decisions

### 1. No Separate Project

The online version is NOT a separate project. It lives in the same `src/` directory, gated by `APP_MODE` in `src/config/features.ts`. This ensures:

- Single deployment pipeline
- Shared component library
- No code duplication
- Offline mode is always available

### 2. Supabase Migrations at Project Root

`supabase/` lives at the project root (standard Supabase CLI convention). Migrations are versioned with sequential numbers and descriptive names. Run via `supabase db push` in development and `supabase db migrate` in production.

### 3. AI Tools in Dedicated Directory

AI tool definitions live in `src/lib/ai/tools/` — separate from the chat route handler. This keeps tool schemas, handlers, and execution logic cleanly separated. The chat route imports tools from this directory.

### 4. Cloud Transport as Single Module

`src/lib/sync/cloud-transport.ts` is the only new sync module that plugs into the existing `SyncEngine`. It implements the same interface as the LAN transport. Supporting modules (checkpoint, presence, tab coordination) are kept in the same directory.

### 5. Test Organization

Tests follow the existing pattern with `tests/unit/`, `tests/integration/`, and `tests/e2e/` directories. Integration tests require Supabase local (Docker). E2E tests use Playwright with two browser contexts to simulate multi-device scenarios.
