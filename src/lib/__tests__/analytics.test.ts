/**
 * Analytics wrapper smoke tests
 */

describe('analytics wrapper', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('capture is a no-op without key', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = '';
    const { analytics } = await import('@/lib/analytics');
    // Should not throw
    await expect(analytics.capture('test_event', { a: 1 })).resolves.toBeUndefined();
  });

  test('pageview is callable', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = '';
    const { analytics } = await import('@/lib/analytics');
    await expect(analytics.pageview('/x')).resolves.toBeUndefined();
  });
});

