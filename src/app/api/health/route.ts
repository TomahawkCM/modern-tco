import { NextRequest } from 'next/server';
import { withErrorTracking, apiSuccess } from '@/lib/error-tracking';

export const GET = withErrorTracking(
  async (request: NextRequest) => {
    // Could add more health checks here (database, external services, etc.)
    return apiSuccess({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  },
  { endpoint: '/api/health' }
);

