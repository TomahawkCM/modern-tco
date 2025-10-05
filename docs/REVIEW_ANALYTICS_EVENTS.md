# Review System Analytics Events

## PostHog Integration - Phase 2 Spaced Repetition

This document outlines all analytics events tracked for the unified review system (flashcards + questions).

## Event Taxonomy

All review events follow the naming convention: `review_*` or `*_reviewed`

## Session Events

### `review_session_started`

**Trigger**: User initiates a review session

**Properties**:
```typescript
{
  sessionType: 'flashcards' | 'questions' | 'mixed',
  targetDuration?: number,     // minutes (undefined for untimed)
  queueSize: number,            // total items in queue
  timestamp: string             // ISO timestamp
}
```

**Example**:
```json
{
  "sessionType": "mixed",
  "targetDuration": 15,
  "queueSize": 25,
  "timestamp": "2025-01-03T10:30:00.000Z"
}
```

---

### `review_session_completed`

**Trigger**: User completes or submits a review session

**Properties**:
```typescript
{
  sessionId: string,
  sessionType: 'flashcards' | 'questions' | 'mixed',
  duration: number,              // actual seconds
  itemsReviewed: number,
  accuracy: number,              // 0-100
  flashcardsReviewed: number,
  questionsReviewed: number,
  timestamp: string
}
```

**Example**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "sessionType": "mixed",
  "duration": 900,
  "itemsReviewed": 25,
  "accuracy": 84,
  "flashcardsReviewed": 15,
  "questionsReviewed": 10,
  "timestamp": "2025-01-03T10:45:00.000Z"
}
```

---

### `review_session_completed_ui`

**Trigger**: User clicks "Complete Session" button from session summary screen

**Properties**:
```typescript
{
  itemsReviewed: number,
  accuracy: number,              // 0-100
  timestamp: string
}
```

**Example**:
```json
{
  "itemsReviewed": 25,
  "accuracy": 84,
  "timestamp": "2025-01-03T10:45:30.000Z"
}
```

---

## Flashcard Review Events

### `flashcard_reviewed`

**Trigger**: User rates a flashcard (again/hard/good/easy)

**Properties**:
```typescript
{
  flashcardId: string,
  rating: 'again' | 'hard' | 'good' | 'easy',
  timeSpent: number,             // seconds
  newInterval: number,           // days until next review
  timestamp: string
}
```

**Example**:
```json
{
  "flashcardId": "fc_123abc",
  "rating": "good",
  "timeSpent": 12,
  "newInterval": 7,
  "timestamp": "2025-01-03T10:32:00.000Z"
}
```

---

## Question Review Events

### `question_reviewed`

**Trigger**: User submits an answer to a practice question

**Properties**:
```typescript
{
  questionId: string,
  isCorrect: boolean,
  timeSpent: number,             // seconds
  masteryLevel: number,          // 0.0 to 1.0
  newInterval: number,           // days until next review
  timestamp: string
}
```

**Example**:
```json
{
  "questionId": "q_456def",
  "isCorrect": true,
  "timeSpent": 45,
  "masteryLevel": 0.85,
  "newInterval": 14,
  "timestamp": "2025-01-03T10:33:00.000Z"
}
```

---

## Analytics Implementation

### ReviewContext Integration

All events are tracked through the `trackReviewEvent` method in `ReviewContext`:

```typescript
const trackReviewEvent = useCallback((eventType: string, data?: Record<string, any>) => {
  analytics.capture(eventType, {
    ...data,
    timestamp: new Date().toISOString(),
  });
}, []);
```

### Analytics Library

Uses the lightweight PostHog-compatible analytics wrapper at `/src/lib/analytics.ts`:

```typescript
import { analytics } from "@/lib/analytics";

// Capture custom event
analytics.capture('review_session_started', {
  sessionType: 'mixed',
  targetDuration: 15,
  queueSize: 25
});
```

### Environment Variables

**Required**:
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog project API key

**Optional**:
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog host (defaults to `https://us.i.posthog.com`)
- `NEXT_PUBLIC_ANALYTICS_DEBUG` - Enable console.debug for analytics events (set to `"true"`)

### Local Development

Enable debug mode to see analytics events in console:

```bash
NEXT_PUBLIC_ANALYTICS_DEBUG=true npm run dev
```

Example console output:
```
[analytics] review_session_started {
  sessionType: 'mixed',
  targetDuration: 15,
  queueSize: 25,
  distinct_id: 'abc123',
  timestamp: '2025-01-03T10:30:00.000Z'
}
```

---

## Dashboard Queries

### PostHog SQL Queries for Common Metrics

#### Average Session Completion Rate

```sql
SELECT
  DATE(timestamp) as date,
  COUNT(DISTINCT properties.sessionId) FILTER (WHERE event = 'review_session_completed') as completed_sessions,
  COUNT(DISTINCT properties.sessionId) FILTER (WHERE event = 'review_session_started') as started_sessions,
  (completed_sessions::float / started_sessions::float * 100) as completion_rate
FROM events
WHERE event IN ('review_session_started', 'review_session_completed')
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY date
ORDER BY date DESC;
```

#### Average Session Accuracy by Type

```sql
SELECT
  properties.sessionType as session_type,
  AVG(properties.accuracy) as avg_accuracy,
  COUNT(*) as total_sessions
FROM events
WHERE event = 'review_session_completed'
  AND timestamp >= NOW() - INTERVAL '7 days'
GROUP BY properties.sessionType;
```

#### Flashcard Rating Distribution

```sql
SELECT
  properties.rating,
  COUNT(*) as count,
  (COUNT(*)::float / SUM(COUNT(*)) OVER () * 100) as percentage
FROM events
WHERE event = 'flashcard_reviewed'
  AND timestamp >= NOW() - INTERVAL '7 days'
GROUP BY properties.rating
ORDER BY count DESC;
```

#### Question Accuracy by Time Spent

```sql
SELECT
  CASE
    WHEN properties.timeSpent < 15 THEN '< 15s'
    WHEN properties.timeSpent < 30 THEN '15-30s'
    WHEN properties.timeSpent < 60 THEN '30-60s'
    ELSE '> 60s'
  END as time_bucket,
  AVG(CASE WHEN properties.isCorrect THEN 1.0 ELSE 0.0 END) * 100 as accuracy
FROM events
WHERE event = 'question_reviewed'
  AND timestamp >= NOW() - INTERVAL '7 days'
GROUP BY time_bucket
ORDER BY accuracy DESC;
```

---

## User Properties

### Automatically Tracked

PostHog automatically tracks:
- `distinct_id` - Unique user identifier (localStorage-based)
- `$user_id` - Authenticated user ID (from Supabase auth)
- `$current_url` - Page URL when event occurred
- `timestamp` - ISO timestamp of event

### Custom User Properties

Set via `analytics.identify()` in `AnalyticsClient`:

```typescript
analytics.identify(user.id, {
  email: user.email || undefined
});
```

---

## Funnel Analysis

### Review Completion Funnel

1. **Dashboard View** → `$pageview` (`/review`)
2. **Session Started** → `review_session_started`
3. **First Item Reviewed** → `flashcard_reviewed` OR `question_reviewed`
4. **Session Completed** → `review_session_completed`

### Expected Drop-off Points

- Dashboard → Start Session: ~60% conversion
- Start Session → First Review: ~95% conversion
- First Review → Completion: ~70% conversion (varies by session type/duration)

---

## A/B Testing Recommendations

### Potential Experiments

1. **Session Duration Options**
   - Test: 5/10/15 vs 10/15/30 minute presets
   - Metric: Completion rate, items reviewed per session

2. **Rating System UI**
   - Test: 4-button (current) vs 3-button (remove "hard")
   - Metric: Rating distribution, time per flashcard

3. **Mixed Queue Ratio**
   - Test: 50/50 vs 60/40 vs 70/30 (flashcards/questions)
   - Metric: Accuracy, user engagement, streak maintenance

4. **High-Priority Alerts**
   - Test: Urgency thresholds (10+ vs 15+ vs 20+)
   - Metric: Click-through rate, session start rate

---

## Privacy & GDPR Compliance

- All analytics events are **anonymized** (no PII in event properties)
- User email is stored in PostHog only if user is authenticated
- `distinct_id` is a random UUID (not linked to email/username in events)
- Users can opt-out via browser settings (localStorage-based)

---

## Event Versioning

**Current Version**: v1 (Phase 2 implementation)

### Version History

- **v1 (2025-01-03)**: Initial implementation with flashcard + question review tracking
- **Future v2**: Planned addition of remediation plan events, learning path events

### Backwards Compatibility

All future event changes will maintain backwards compatibility:
- New properties added as **optional**
- Property renames handled via dual tracking
- Deprecated events marked in documentation with 6-month sunset period

---

## Testing & Validation

### Manual Testing Checklist

- [ ] Start a review session → Verify `review_session_started` event
- [ ] Review a flashcard → Verify `flashcard_reviewed` event with correct rating
- [ ] Answer a question → Verify `question_reviewed` event with correctness
- [ ] Complete session → Verify `review_session_completed` event with accurate stats
- [ ] Check PostHog dashboard → Confirm events appear with correct properties

### Automated Testing

Event tracking is validated in integration tests:

```typescript
// Example test (to be implemented in Phase 2)
test('tracks flashcard review event', async () => {
  const mockAnalytics = jest.spyOn(analytics, 'capture');

  await reviewFlashcard('fc_123', 'good', 15);

  expect(mockAnalytics).toHaveBeenCalledWith('flashcard_reviewed', {
    flashcardId: 'fc_123',
    rating: 'good',
    timeSpent: 15,
    newInterval: expect.any(Number),
    timestamp: expect.any(String)
  });
});
```

---

## Support & Troubleshooting

### Events Not Appearing in PostHog

1. **Check environment variable**: Ensure `NEXT_PUBLIC_POSTHOG_KEY` is set
2. **Enable debug mode**: Set `NEXT_PUBLIC_ANALYTICS_DEBUG=true` and check console
3. **Verify network requests**: Check browser DevTools → Network → `us.i.posthog.com/e/`
4. **Check PostHog data pipeline**: Events may take 1-2 minutes to appear

### Debug Mode Output

```javascript
// Example debug output
[analytics] review_session_started {
  sessionType: 'mixed',
  targetDuration: 15,
  queueSize: 25,
  distinct_id: 'abc123',
  $current_url: 'http://localhost:3000/review',
  timestamp: '2025-01-03T10:30:00.000Z'
}
```

---

**Last Updated**: 2025-01-03
**Maintainer**: TCO Development Team
**Related**: `docs/PHASE_1_COMPLETION_HANDOFF.md`, `src/contexts/ReviewContext.tsx`
