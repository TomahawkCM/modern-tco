# Server-Side Error Tracking

## Overview

The Tanium TCO LMS now includes comprehensive server-side error tracking for all API routes with PII (Personally Identifiable Information) masking to ensure compliance and security.

## Features

### 🔒 PII Masking
- **Automatic Detection**: Identifies and masks sensitive data patterns including:
  - Email addresses (preserves domain for debugging)
  - IP addresses (IPv4 and IPv6)
  - Phone numbers
  - Social Security Numbers
  - Credit card numbers
  - JWT tokens
  - API keys
  - UUIDs
  - Sensitive field names (password, token, auth, etc.)

### 📊 Error Tracking
- **Severity Levels**: DEBUG, INFO, WARNING, ERROR, CRITICAL
- **Context Capture**: Request method, endpoint, headers, timing
- **Request IDs**: Unique ID for each request for tracing
- **PostHog Integration**: Production errors sent to PostHog analytics
- **Structured Logging**: JSON format for log aggregation

### 🛡️ API Handler Wrapper
- **Consistent Error Responses**: Standardized error format
- **Automatic Error Catching**: All uncaught errors are tracked
- **Performance Monitoring**: Tracks slow API calls (>3s)
- **Validation Helpers**: Built-in request body validation

## Usage

### Basic API Route with Error Tracking

```typescript
import { NextRequest } from 'next/server';
import { withErrorTracking, apiSuccess } from '@/lib/error-tracking';

export const GET = withErrorTracking(
  async (request: NextRequest) => {
    // Your API logic here
    return apiSuccess({ data: 'response' });
  },
  { endpoint: '/api/example' }
);
```

### API Route with Validation

```typescript
import { NextRequest } from 'next/server';
import {
  withErrorTracking,
  ApiError,
  apiSuccess,
  validateBody
} from '@/lib/error-tracking';

type RequestPayload = {
  name: string;
  email: string;
};

export const POST = withErrorTracking(
  async (request: NextRequest) => {
    const payload = await request.json();

    // Validate request body
    const validated = validateBody<RequestPayload>(payload, {
      name: {
        required: true,
        type: 'string',
        validate: (v) => v.length > 0 && v.length <= 100
      },
      email: {
        required: true,
        type: 'string',
        validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      }
    });

    // Process request
    try {
      // Your business logic here
      return apiSuccess({ message: 'Success' });
    } catch (error) {
      throw new ApiError('Processing failed', 500, 'PROCESS_ERROR');
    }
  },
  { endpoint: '/api/example' }
);
```

### Manual Error Tracking

```typescript
import { trackError, trackWarning, ErrorSeverity } from '@/lib/error-tracking';

// Track an error
try {
  // Some operation
} catch (error) {
  await trackError(error, {
    userId: 'user123',
    endpoint: '/api/custom',
    statusCode: 500
  });
}

// Track a warning
await trackWarning('Slow database query', {
  query: 'SELECT * FROM large_table',
  duration: 5000
});
```

## Response Formats

### Success Response
```json
{
  "ok": true,
  "data": {},
  "requestId": "abc123"
}
```

### Error Response
```json
{
  "ok": false,
  "error": "Error message",
  "requestId": "abc123",
  "timestamp": "2024-12-26T10:00:00.000Z"
}
```

In development, additional fields are included:
- `stack`: Error stack trace
- `code`: Error code for debugging

## Configuration

### Environment Variables

```env
# PostHog (for production error tracking)
NEXT_PUBLIC_POSTHOG_KEY=your_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Optional: Enable file logging in development
ERROR_LOG_FILE=true
```

### Log Output

- **Development**: Pretty-printed to console with colors
- **Production**: JSON format for log aggregation services
- **File Logging**: Optional in development (writes to `logs/` directory)

## PII Masking Examples

### Before Masking
```json
{
  "email": "john.doe@example.com",
  "password": "secret123",
  "ip": "192.168.1.100",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWI..."
}
```

### After Masking
```json
{
  "email": "j***@example.com",
  "password": "[REDACTED:password]",
  "ip": "***.***.***,***",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.*****,***"
}
```

## API Routes Updated

The following API routes have been updated with error tracking:

1. ✅ `/api/health` - Health check endpoint
2. ✅ `/api/sim-save` - Simulator save endpoint
3. ⏳ `/api/sim-run` - Simulator run endpoint
4. ⏳ `/api/sim-eval` - Simulator evaluation endpoint
5. ⏳ `/api/sim-meta` - Simulator metadata endpoint
6. ⏳ `/api/sim-saved` - Saved simulations endpoint
7. ⏳ `/api/study/content` - Study content endpoint
8. ⏳ `/api/stripe/create-checkout-session` - Stripe checkout endpoint

## Best Practices

1. **Always use the wrapper**: Use `withErrorTracking` for all API routes
2. **Throw ApiError**: Use `ApiError` class for expected errors with proper status codes
3. **Add context**: Include relevant context when tracking errors manually
4. **Validate inputs**: Use `validateBody` for request validation
5. **Avoid logging PII**: The system automatically masks PII, but avoid logging it explicitly

## Security Considerations

- All PII is automatically masked before logging
- Sensitive headers (Authorization, Cookie, etc.) are redacted
- Error messages in production are generic to avoid information leakage
- Request IDs enable tracing without exposing sensitive data

## Monitoring

### Development
- Check console for error logs
- Optional file logging in `logs/` directory

### Production
- PostHog events under `api_error` event type
- Structured logs for aggregation services
- Request IDs for tracing across services

## Future Enhancements

- [ ] Sentry integration for advanced error tracking
- [ ] Rate limiting per endpoint
- [ ] Error alerting thresholds
- [ ] Custom error dashboards
- [ ] Error recovery strategies