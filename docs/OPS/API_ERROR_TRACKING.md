# API Error Tracking Implementation

## Overview

Server-side error tracking has been implemented for API routes with automatic PII masking and integration with analytics.

## Implementation

### Error Handler Module

Created `/src/lib/api-error-handler.ts` with:

1. **PII Masking** - Automatically masks sensitive data:
   - Email addresses
   - Phone numbers
   - Credit card numbers
   - SSNs
   - API keys
   - Password/token/secret fields

2. **Error Logging** - Logs to multiple destinations:
   - Console (development only)
   - PostHog analytics
   - Sentry (if configured)
   - External logging services (extensible)

3. **Error Context** - Captures:
   - Endpoint name
   - HTTP method
   - User ID (if available)
   - Request metadata
   - Timestamp
   - Environment

## Usage in API Routes

### Method 1: Using the Wrapper Function

```typescript
import { withErrorHandling } from '@/lib/api-error-handler';

async function handler(request: Request) {
  // Your API logic here
  const data = await fetchSomeData();
  return NextResponse.json({ ok: true, data });
}

// Wrap with error handling
export const GET = withErrorHandling(handler, '/api/your-endpoint');
```

### Method 2: Manual Error Handling

```typescript
import { handleApiError } from '@/lib/api-error-handler';

export async function POST(request: Request) {
  try {
    // Your API logic here
    const body = await request.json();
    const result = await processData(body);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return handleApiError(error, {
      endpoint: '/api/your-endpoint',
      method: 'POST',
      metadata: { /* additional context */ }
    });
  }
}
```

### Method 3: Throwing Custom Errors

```typescript
export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      throw {
        message: 'User not found',
        status: 404,
        code: 'USER_NOT_FOUND'
      };
    }
    return NextResponse.json({ ok: true, user });
  } catch (error) {
    return handleApiError(error, {
      endpoint: '/api/user',
      method: 'GET'
    });
  }
}
```

## Example Implementation

Here's a complete example for a protected API route:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api-error-handler';
import { supabase } from '@/lib/supabase';

async function updateProgressHandler(request: NextRequest) {
  // Validate auth
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    throw {
      message: 'Authentication required',
      status: 401,
      code: 'AUTH_REQUIRED'
    };
  }

  // Parse request body
  const body = await request.json();
  const { moduleId, sectionId, completed } = body;

  // Validate input
  if (!moduleId || !sectionId) {
    throw {
      message: 'Missing required fields',
      status: 400,
      code: 'VALIDATION_ERROR',
      details: { moduleId, sectionId }
    };
  }

  // Update database
  const { data, error } = await supabase
    .from('user_progress')
    .upsert({
      module_id: moduleId,
      section_id: sectionId,
      completed,
      updated_at: new Date().toISOString()
    });

  if (error) {
    throw {
      message: 'Database update failed',
      status: 500,
      code: 'DB_ERROR',
      details: error
    };
  }

  return NextResponse.json({ ok: true, data });
}

export const POST = withErrorHandling(updateProgressHandler, '/api/study/progress');
```

## Testing Error Handling

1. **Simulate Errors**:
   ```bash
   # Missing auth
   curl -X POST http://localhost:3002/api/study/progress

   # Invalid data
   curl -X POST http://localhost:3002/api/study/progress \
     -H "Authorization: Bearer token" \
     -H "Content-Type: application/json" \
     -d '{}'

   # Database error (use invalid table)
   curl -X POST http://localhost:3002/api/study/progress \
     -H "Authorization: Bearer token" \
     -H "Content-Type: application/json" \
     -d '{"moduleId": "test", "sectionId": "test", "completed": true}'
   ```

2. **Check Logs**:
   - Development: Check console for `[API Error]` messages
   - Production: Check PostHog events for `api_error` events
   - Sentry: Check Sentry dashboard for exceptions

## PII Masking Examples

Before masking:
```json
{
  "email": "user@example.com",
  "phone": "+1-555-123-4567",
  "password": "secretpass123",
  "creditCard": "4532-1234-5678-9012",
  "apiKey": "sk_test_4eC39HqLyjWDarjtT1zdp7dc"
}
```

After masking:
```json
{
  "email": "***@***.***",
  "phone": "***-***-****",
  "password": "***REDACTED***",
  "creditCard": "****-****-****-****",
  "apiKey": "***API_KEY***"
}
```

## Integration with Monitoring Services

### PostHog Analytics

Errors are automatically tracked as `api_error` events with:
- Endpoint name
- HTTP method
- Status code
- Error message (masked)
- Custom metadata

### Sentry (Optional)

To enable Sentry:

1. Install Sentry SDK:
   ```bash
   npm install @sentry/nextjs
   ```

2. Initialize in `instrumentation.ts`:
   ```typescript
   import * as Sentry from '@sentry/nextjs';

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
     tracesSampleRate: 0.1,
   });

   global.Sentry = Sentry;
   ```

3. Errors will automatically be sent to Sentry with context

## Best Practices

1. **Always use error handling** for all API routes
2. **Throw meaningful errors** with appropriate status codes
3. **Include error codes** for client-side handling
4. **Add metadata** for debugging (will be masked automatically)
5. **Test error scenarios** during development
6. **Monitor error rates** in production
7. **Set up alerts** for critical errors

## Migration Guide

To add error handling to existing API routes:

1. Import the error handler:
   ```typescript
   import { withErrorHandling } from '@/lib/api-error-handler';
   ```

2. Wrap your handler:
   ```typescript
   export const GET = withErrorHandling(yourHandler, '/api/endpoint-name');
   ```

3. Or add try-catch with manual handling:
   ```typescript
   try {
     // existing code
   } catch (error) {
     return handleApiError(error, { endpoint, method });
   }
   ```

## Performance Impact

The error handling adds minimal overhead:
- PII masking: <1ms for typical payloads
- Analytics tracking: Async, non-blocking
- Sentry reporting: Async, non-blocking
- Console logging: Development only

## Security Considerations

1. **PII is automatically masked** before logging
2. **Sensitive fields are redacted** based on key names
3. **Stack traces are masked** for PII
4. **Error details only shown in development**
5. **Production responses are sanitized**