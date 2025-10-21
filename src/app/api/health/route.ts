import { apiSuccess, withErrorTracking } from '@/lib/error-tracking';

export const GET = withErrorTracking(
  async () => {
    // Could add more health checks here (database, external services, etc.)
    return apiSuccess({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: (process.env.NODE_ENV as string | undefined) ?? 'development',
    });
  },
  { endpoint: '/api/health' }
);
