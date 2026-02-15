/**
 * Budget App Analytics & Error Tracking
 *
 * Privacy-compliant event tracking for budget app features
 * Integrates with PostHog (analytics) and Sentry (error tracking)
 *
 * Privacy Policy:
 * - No transaction amounts or descriptions tracked
 * - No account numbers or bank names
 * - Only feature usage and performance metrics
 * - User can opt-out via Settings → Privacy
 */

import { analytics } from "./analytics";
import { trackEvent } from "./monitoring";
import { isAnalyticsEnabled as checkAnalyticsEnabled } from "./budget-privacy-settings";

/**
 * Budget App Event Types
 */
export type BudgetAnalyticsEvent =
  // Transaction Events (no amounts/descriptions)
  | "transaction_added"
  | "transaction_edited"
  | "transaction_deleted"
  | "transaction_search"
  | "split_transaction_created"

  // Budget Events
  | "budget_created"
  | "budget_edited"
  | "budget_deleted"
  | "budget_exceeded"
  | "budget_progress_viewed"

  // Import Events
  | "csv_import_started"
  | "csv_import_completed"
  | "csv_import_failed"
  | "pdf_import_started"
  | "ofx_import_completed"

  // Loan Events
  | "loan_created"
  | "loan_payment_added"
  | "extra_payment_calculated"
  | "amortization_viewed"

  // Investment Events
  | "investment_account_added"
  | "holding_added"
  | "portfolio_viewed"

  // OCR Events
  | "receipt_scanned"
  | "ocr_success"
  | "ocr_failed"

  // AI Events
  | "ai_duplicate_detection"
  | "ai_anomaly_detected"
  | "ai_spending_prediction"
  | "chatbot_query"
  | "chatbot_action"

  // Navigation Events
  | "page_view"
  | "section_changed"
  | "report_generated"

  // Feature Discovery
  | "onboarding_started"
  | "onboarding_completed"
  | "feature_tour_viewed"
  | "shortcuts_modal_opened"

  // PWA Events
  | "pwa_installed"
  | "pwa_prompt_shown"
  | "offline_mode_entered"

  // Settings Events
  | "theme_changed"
  | "privacy_settings_changed"
  | "data_exported"
  | "encryption_enabled";

/**
 * Event Properties (all privacy-safe)
 */
export interface BudgetEventProperties {
  // Feature metadata (no PII)
  feature?: string;
  section?:
    | "transactions"
    | "budgets"
    | "loans"
    | "investments"
    | "reports"
    | "import"
    | "settings"
    | "chatbot";

  // Action context
  action?: string;
  method?: string;

  // Counts (no amounts)
  count?: number;
  itemCount?: number;

  // Success/failure
  success?: boolean;
  errorType?: string;
  errorCode?: string;

  // Performance
  duration?: number; // milliseconds
  loadTime?: number;

  // Import metadata
  importFormat?: "csv" | "ofx" | "pdf";
  rowCount?: number;
  duplicatesFound?: number;

  // AI usage
  aiEnabled?: boolean;
  aiModel?: string;

  // Theme/settings
  theme?: "light" | "dark" | "high-contrast";
  privacyMode?: "public" | "private";

  // Custom properties
  [key: string]: string | number | boolean | undefined;
}

/**
 * Check if analytics is enabled (respects privacy settings)
 */
function isAnalyticsEnabled(): boolean {
  try {
    return checkAnalyticsEnabled();
  } catch {
    return false;
  }
}

/**
 * Track budget app event
 *
 * @param event - Event name from BudgetAnalyticsEvent type
 * @param properties - Privacy-safe event properties
 */
export async function trackBudgetEvent(
  event: BudgetAnalyticsEvent,
  properties?: BudgetEventProperties
) {
  if (!isAnalyticsEnabled()) {
    return; // User opted out
  }

  try {
    // Clean properties to ensure no PII
    const cleanProps = sanitizeProperties(properties);

    // Send to PostHog
    await analytics.capture(event, {
      app: "budget",
      ...cleanProps,
      timestamp: new Date().toISOString(),
    });

    // For errors, also send to monitoring
    if (!cleanProps.success && cleanProps.errorType) {
      await trackEvent({
        type: "custom",
        data: {
          event,
          ...cleanProps,
        },
      });
    }
  } catch (error) {
    // Silent fail - don't break app for analytics
    console.warn("[BudgetAnalytics] Failed to track event:", error);
  }
}

/**
 * Sanitize properties to remove any potential PII
 */
function sanitizeProperties(props?: BudgetEventProperties): BudgetEventProperties {
  if (!props) return {};

  const clean: BudgetEventProperties = {};

  // Allowlist safe properties
  const safeKeys: Array<keyof BudgetEventProperties> = [
    "feature",
    "section",
    "action",
    "method",
    "count",
    "itemCount",
    "success",
    "errorType",
    "errorCode",
    "duration",
    "loadTime",
    "importFormat",
    "rowCount",
    "duplicatesFound",
    "aiEnabled",
    "aiModel",
    "theme",
    "privacyMode",
  ];

  for (const key of safeKeys) {
    if (props[key] !== undefined) {
      clean[key] = props[key];
    }
  }

  return clean;
}

/**
 * Track page view with budget app context
 */
export async function trackBudgetPageView(path: string, properties?: BudgetEventProperties) {
  const section = extractSection(path);
  return trackBudgetEvent("page_view", {
    section,
    ...properties,
  });
}

/**
 * Extract section from path
 */
function extractSection(path: string): BudgetEventProperties["section"] {
  if (path.includes("/transactions")) return "transactions";
  if (path.includes("/budgets")) return "budgets";
  if (path.includes("/loans")) return "loans";
  if (path.includes("/investments")) return "investments";
  if (path.includes("/reports")) return "reports";
  if (path.includes("/import")) return "import";
  if (path.includes("/settings")) return "settings";
  return undefined;
}

/**
 * Track error with context
 */
export async function trackBudgetError(
  error: Error,
  context?: {
    feature?: string;
    action?: string;
    section?: BudgetEventProperties["section"];
  }
) {
  if (!isAnalyticsEnabled()) return;

  try {
    await trackEvent({
      type: "client_error",
      data: {
        app: "budget",
        message: error.message,
        stack: error.stack?.split("\n").slice(0, 3).join("\n"), // First 3 lines only
        ...context,
      },
    });

    // Also send to PostHog for aggregate analysis
    await analytics.capture("budget_error", {
      app: "budget",
      errorType: error.name,
      errorMessage: error.message.substring(0, 100), // Truncate to avoid PII
      ...context,
    });
  } catch {
    // Silent fail
  }
}

/**
 * Track performance metric
 */
export async function trackBudgetPerformance(
  metric: string,
  value: number,
  properties?: BudgetEventProperties
) {
  if (!isAnalyticsEnabled()) return;

  try {
    await trackEvent({
      type: "performance",
      data: {
        app: "budget",
        metric,
        value,
        ...properties,
      },
    });
  } catch {
    // Silent fail
  }
}

/**
 * Key Metrics to Track (define once, use everywhere)
 */
export const BUDGET_METRICS = {
  // User Engagement
  DAU: "daily_active_users",
  WAU: "weekly_active_users",
  MAU: "monthly_active_users",
  sessionDuration: "session_duration",

  // Feature Usage
  transactionCount: "transaction_count",
  budgetCount: "budget_count",
  loanCount: "loan_count",
  importCount: "import_count",
  ocrUsage: "ocr_usage",
  aiFeatureUsage: "ai_feature_usage",
  chatbotQueries: "chatbot_queries",

  // Performance
  pageLoadTime: "page_load_time",
  transactionListLoadTime: "transaction_list_load_time",
  databaseQueryTime: "database_query_time",
  importProcessingTime: "import_processing_time",

  // Errors
  errorRate: "error_rate",
  importFailureRate: "import_failure_rate",
  ocrFailureRate: "ocr_failure_rate",

  // PWA
  pwaInstallRate: "pwa_install_rate",
  offlineUsage: "offline_usage",

  // Business Metrics
  avgTransactionsPerUser: "avg_transactions_per_user",
  avgBudgetsPerUser: "avg_budgets_per_user",
  retentionRate: "retention_rate",
} as const;

/**
 * Example Usage:
 *
 * // Track transaction added
 * trackBudgetEvent('transaction_added', {
 *   section: 'transactions',
 *   method: 'manual', // or 'import' or 'ocr'
 *   success: true,
 * });
 *
 * // Track import completed
 * trackBudgetEvent('csv_import_completed', {
 *   section: 'import',
 *   importFormat: 'csv',
 *   rowCount: 150,
 *   duplicatesFound: 5,
 *   duration: 3200, // ms
 *   success: true,
 * });
 *
 * // Track error
 * try {
 *   await db.transactions.add(transaction);
 * } catch (error) {
 *   trackBudgetError(error, {
 *     feature: 'transaction',
 *     action: 'add',
 *     section: 'transactions',
 *   });
 * }
 *
 * // Track performance
 * const start = performance.now();
 * const transactions = await db.transactions.toArray();
 * trackBudgetPerformance('transaction_list_load', performance.now() - start, {
 *   count: transactions.length,
 * });
 */
