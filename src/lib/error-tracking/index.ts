/**
 * Error Tracking Module
 * Central export for all error tracking utilities
 */

export {
  errorTracker,
  trackError,
  trackWarning,
  trackInfo,
  trackCritical,
  ErrorSeverity,
  type ErrorContext
} from './error-tracker';

export {
  withErrorTracking,
  ApiError,
  apiSuccess,
  apiError,
  validateBody,
  type ApiHandler,
  type ApiErrorResponse,
  type ApiSuccessResponse
} from './api-handler';

export {
  maskString,
  maskObject,
  maskHeaders,
  maskUrl,
  createSafeError
} from './pii-masker';