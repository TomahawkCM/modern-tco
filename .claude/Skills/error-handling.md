---
name: error-handling
description: Use when implementing error boundaries, API error handling, user-facing error states, or offline error recovery patterns.
---

# Error Handling

## Overview

Standardized error handling patterns for the budget app — React error boundaries, API route error responses, Supabase error mapping, offline error queuing, import error recovery, and user-friendly error messages with i18n support. Errors should inform, not frighten.

## When to Use

- Adding error boundaries to new page sections
- Implementing API route error responses
- Handling Supabase/database errors
- Building offline-aware error handling
- Implementing import error recovery
- Creating user-friendly error messages

## Core Principles

- **User-friendly messages** — Technical errors → human-readable messages via i18n
- **Never expose internals** — No stack traces, SQL errors, or API keys in user-facing errors
- **Recoverable by default** — Provide retry, dismiss, or alternative action for every error
- **Offline-aware** — Queue failed operations for retry when back online
- **Log for debugging** — Send errors to PostHog/Sentry with context, not to user

## Workflow

### Step 1: React Error Boundaries

```tsx
// Generic error boundary for page sections
import { ErrorBoundary } from 'react-error-boundary';

function BudgetPageSection({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-muted-foreground">
              {t('errors.sectionFailed')}
            </p>
            <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
              {t('errors.tryAgain')}
            </Button>
          </CardContent>
        </Card>
      )}
      onError={(error, info) => {
        // Log to PostHog/Sentry
        captureError(error, { componentStack: info.componentStack });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

### Step 2: API Route Error Responses

```ts
// Standardized API error response format
interface APIError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Error factory
function apiError(code: string, message: string, status: number, details?: Record<string, unknown>) {
  return Response.json(
    { error: { code, message, details } } satisfies APIError,
    { status }
  );
}

// Usage in API routes
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', 'Invalid input', 400, {
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    const result = await processData(parsed.data);
    return Response.json(result);
  } catch (error) {
    // Log full error server-side
    console.error('API error:', error);

    // Return generic error to client (never expose internals)
    return apiError('INTERNAL_ERROR', 'Something went wrong. Please try again.', 500);
  }
}
```

### Step 3: Error Code Mapping

```ts
// Map technical errors to user-friendly i18n keys
const ERROR_MAP: Record<string, string> = {
  // Supabase errors
  'PGRST116': 'errors.notFound',
  'PGRST301': 'errors.unauthorized',
  '23505': 'errors.duplicateRecord',
  '23503': 'errors.relatedRecordNotFound',

  // Plaid errors
  'ITEM_LOGIN_REQUIRED': 'errors.bankReconnectRequired',
  'INSTITUTION_NOT_RESPONDING': 'errors.bankTemporarilyUnavailable',
  'RATE_LIMIT_EXCEEDED': 'errors.tooManyRequests',

  // App errors
  'ENCRYPTION_FAILED': 'errors.encryptionFailed',
  'DECRYPTION_FAILED': 'errors.decryptionFailed',
  'IMPORT_PARSE_ERROR': 'errors.importParseError',
  'QUOTA_EXCEEDED': 'errors.storageQuotaExceeded',

  // Generic
  'NETWORK_ERROR': 'errors.networkError',
  'TIMEOUT': 'errors.timeout',
  'UNKNOWN': 'errors.generic',
};

function getUserMessage(errorCode: string, t: TranslateFunction): string {
  const key = ERROR_MAP[errorCode] || ERROR_MAP['UNKNOWN'];
  return t(key);
}
```

### Step 4: Offline Error Queuing

```ts
class OfflineErrorQueue {
  private queue: FailedOperation[] = [];

  async add(operation: FailedOperation): Promise<void> {
    this.queue.push({
      ...operation,
      failedAt: new Date().toISOString(),
      retryCount: 0,
    });
    await this.persist();
  }

  async retryAll(): Promise<RetryResult[]> {
    const results: RetryResult[] = [];

    for (const op of this.queue) {
      try {
        await op.execute();
        results.push({ id: op.id, success: true });
        this.queue = this.queue.filter(q => q.id !== op.id);
      } catch (error) {
        op.retryCount++;
        results.push({ id: op.id, success: false, error });

        if (op.retryCount >= 3) {
          // Give up after 3 retries — notify user
          this.queue = this.queue.filter(q => q.id !== op.id);
          notifyUser('errors.operationFailed', op.description);
        }
      }
    }

    await this.persist();
    return results;
  }
}

// Auto-retry when coming back online
window.addEventListener('online', () => {
  offlineQueue.retryAll();
});
```

### Step 5: Import Error Recovery

```ts
// Graceful import error handling with partial success
interface ImportResult {
  total: number;
  successful: number;
  failed: number;
  errors: ImportError[];
  partialData: Transaction[];  // Successfully parsed transactions
}

async function importWithRecovery(
  file: File,
  parser: Parser
): Promise<ImportResult> {
  const lines = await readFileLines(file);
  const results: ImportResult = {
    total: lines.length,
    successful: 0,
    failed: 0,
    errors: [],
    partialData: [],
  };

  for (let i = 0; i < lines.length; i++) {
    try {
      const transaction = parser.parseLine(lines[i]);
      results.partialData.push(transaction);
      results.successful++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        line: i + 1,
        content: lines[i].substring(0, 100), // Truncate for display
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}
```

### Step 6: User-Facing Error UI

```tsx
// Toast for recoverable errors
function showErrorToast(message: string, action?: { label: string; onClick: () => void }) {
  toast.error(message, {
    duration: 5000,
    action: action ? {
      label: action.label,
      onClick: action.onClick,
    } : undefined,
  });
}

// Inline error for form fields
function FormFieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="mt-1 text-sm text-destructive" role="alert">
      {error}
    </p>
  );
}

// Full-page error state
function ErrorPage({ error, onRetry }: Props) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <AlertTriangle className="h-12 w-12 text-muted-foreground" />
      <h2 className="text-lg font-semibold">{t('errors.pageError')}</h2>
      <p className="text-sm text-muted-foreground max-w-md">{error}</p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => window.location.reload()}>
          {t('errors.refresh')}
        </Button>
        {onRetry && (
          <Button onClick={onRetry}>{t('errors.tryAgain')}</Button>
        )}
      </div>
    </div>
  );
}
```

## Key Files

| File | Role |
|------|------|
| `src/lib/ai/smart-error-recovery.ts` | Import error recovery |
| `src/app/api/` | API route error patterns |
| `src/components/budget/` | Error UI components |
| `src/i18n/messages/en.json` | Error message translations |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Showing raw error.message to user | Map to i18n key via ERROR_MAP |
| `catch (e) {}` — swallowing errors | Always log + show user-friendly message |
| Stack traces in production | Only log to monitoring service |
| No retry option for network errors | Always offer retry button |
| All-or-nothing import | Use partial success with error report |
| Not handling offline state | Queue operations and retry when online |

## Validation Checklist

- [ ] Error boundaries wrap independent page sections
- [ ] API routes return standardized error format
- [ ] No internal error details exposed to users
- [ ] All error messages use i18n
- [ ] Offline operations queued for retry
- [ ] Import errors show partial success + error details
- [ ] Error toast includes retry action when applicable
- [ ] Errors logged to PostHog/Sentry with context

## Related Skills

- `test-patterns` — testing error scenarios
- `code-review-budget` — error handling in code review
- `real-time-sync` — sync error recovery
- `plaid-integration` — Plaid error handling
