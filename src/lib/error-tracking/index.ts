/**
 * Error Tracking Module
 * Central export for all error tracking utilities
 */

export {
  ApiError,
  type ApiErrorResponse,
  type ApiHandler,
  type ApiSuccessResponse,
  apiError,
  apiSuccess,
  validateBody,
  withErrorTracking,
} from './api-handler';
export {
  type ErrorContext,
  ErrorSeverity,
  errorTracker,
  trackCritical,
  trackError,
  trackInfo,
  trackWarning,
} from './error-tracker';

export {
  createSafeError,
  maskHeaders,
  maskObject,
  maskString,
  maskUrl,
} from './pii-masker';
