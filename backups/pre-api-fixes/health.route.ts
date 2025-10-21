import { apiSuccess, withErrorTracking } from '@/lib/error-tracking';

export const GET = withErrorTracking(
  () =>
    apiSuccess({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV ?? 'development',
    }),
  { endpoint: '/api/health' }
);
