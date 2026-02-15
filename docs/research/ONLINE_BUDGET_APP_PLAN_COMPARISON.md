# ONLINE / Cloud App Planned Features — Scan

Repo: /home/robne/projects/active/tanium-tco/modern-tco
Scan date: 2026-02-15

## Summary

This document extracts planned online/cloud features from the repo and compares them to the baseline best-in-class online feature set. Evidence (path + snippet) is provided. Items are categorized: Implemented now (enabled), Planned (flagged but disabled), and Nice-to-have (mentioned in docs or TODOs).

## Evidence: Planned / online features (from src/config/features.json)

- Cloud & sync feature flags (planned, disabled)
  - src/config/features.json — featureFlags.cloudSync (mode: online, enabled: false)
    - snippet: "\"cloudSync\": { \"mode\": \"online\", \"enabled\": false }"
  - src/config/features.json — featureFlags.cloudBackup (enabled: false), familyInvites (enabled: false), realTimeCollab (enabled: false)
- Auth & server-side tech
  - src/config/features.json — security.authentication includes "Supabase Auth with Row Level Security"
    - snippet: "\"Supabase Auth with Row Level Security\""
  - techStack.database: "Supabase PostgreSQL + IndexedDB"
- Bank linking & direct sync
  - src/config/features.json — offlineSync.simplefin references SimpleFIN Bridge for direct bank connection
    - snippet: "Direct bank connection via SimpleFIN Bridge"
  - No explicit Plaid/TrueLayer references found in features.json
- AI (online) features
  - src/config/features.json — ai smartImport, ai vendor matcher, chatbot modules; aiFeatures featureFlag mode=online enabled=false
    - snippet: "AI Features... mode: \"online\", enabled: false"
  - src/lib/ai/\* modules referenced (smart-bank-detection.ts, ai-vendor-matcher.ts)
- Collaboration & multi-user
  - features.json — featureFlags.familyInvites, realTimeCollab (both online, disabled)
  - features.json — features.privatePublicBudgets enabled in standalone mode (local sharing)
- Server endpoints / APIs
  - Project includes src/app/api/import/pdf-extract/ (serverless API route for PDF processing)
  - No obvious server repo for central sync in this workspace; techStack points to Supabase as backend choice

## UX & Mobile Analysis (Online / Cloud)

- Onboarding & account linking: Online mode requires clear migration flows from standalone to cloud. Add a "Migrate to cloud" wizard that previews what will be uploaded and which features change (AI, backups).
- Mobile consistency: Ensure cloud features honor offline-first UX; show per-device sync status and data usage warnings.
- Authentication UX: Supabase Auth integration must provide social OAuth (Apple, Google), email/password, and device-recovery options. Add clear session management UI (list devices, revoke sessions).

## Admin Dashboard Requirements & Research

Best-in-class admin dashboards (reference patterns):

- Supabase Dashboard: user/session lists, SQL editor, RLS policies, audit logs
- Stripe: subscription metrics, revenue, billing failures, customer lifecycle
- Vercel: deployments, logs, team permissions, usage
- Plaid: institution coverage, partner onboarding metrics

Recommended admin features for this app:

- User management: list, filter, impersonate, disable accounts
- Sync health & device metrics: per-user last sync, conflict rate, pending items
- Activity & audit logs: per-action logs with read-only timeline, exportable
- Error monitoring: top errors, stack traces, affected users, frequency
- Usage & analytics: DAU/MAU, retention cohorts, conversion funnel, feature usage
- Billing & subscriptions: plans, cancellations, dunning, revenue
- Integrations & connectors: status of bank-link providers, SimpleFIN health
- Data storage metrics: total DB size, per-user storage, backup health
- Admin UX: role-based access, safe impersonation (consent), rate-limited actions

Suggested stack & implementation notes:

- Supabase for Auth + Postgres + Realtime (logical fit with techStack)
- PostHog or Segment for product analytics (events)
- Sentry for errors and performance monitoring
- Stripe for billing; connect admin console to Stripe webhooks and reconcile

## Signup / Login / Auth Audit

(Findings from repo)

- featureFlags.pinAuthentication enabled for standalone PINs (local)
- security.authentication mentions Supabase Auth (planned for online)

Assessment & gaps:

- No clear account recovery or MFA flows in repo — implement email recovery, OTP, and WebAuthn for advanced users
- PIN auth needs secure local storage and optional binding to device; present migration path when enabling cloud accounts
- Session persistence: ensure sessions expire, allow device revocation, and surface active sessions in settings

Recommended auth upgrades:

- P0: Implement Supabase Auth integration with email+OAuth and session device listing
- P0: Add account migration wizard with clear consent and audit trail
- P1: Add MFA support and WebAuthn
- P1: Implement passwordless magic links for lower friction

## Reliability & Trust UX (Online)

- Provide clear sync status, per-item sync error details, and one-click retry for failed items
- For destructive online actions (e.g., account delete, sync reset), require secondary confirmation and log the action
- Ensure backups are visible and restorable from admin console and user settings

## Roadmap — Online feature priority (summary)

P0

- Supabase auth + secure cloud sync with E2E option
- Migration tooling and user-facing migration wizard
- Sync health dashboard in admin panel
  P1
- Bank linking via SimpleFIN + optional Plaid/TrueLayer adapters
- Family invites + real-time collaboration
- AI features behind opt-in subscription
  P2
- Billing, automation marketplace, OpenAPI for partners

## Summary — UX/Admin/Auth Maturity (online)

- Strong foundation exists (features.json points to Supabase + SimpleFIN), but core online plumbing (auth migration, sync, admin visibility, billing) needs implementation before shipping cloud features at scale.

---

Prepared by: OpenClaw assistant
