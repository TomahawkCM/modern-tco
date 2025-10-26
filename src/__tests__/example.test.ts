/**
 * Simple test to verify Jest configuration works with Next.js 15.5.2
 */
describe('Jest Configuration Test', () => {
  it('should run basic tests without worker exceptions', () => {
    expect(true).toBe(true);
  });

  it('should have access to DOM APIs', () => {
    expect(document).toBeDefined();
    expect(window).toBeDefined();
  });

  it('should support TypeScript', () => {
    const message: string = 'TypeScript works';
    expect(message).toBe('TypeScript works');
  });

  it('should have Next.js mocks available', () => {
    // Test that our jest.setup.js mocks are working
    expect(window.matchMedia).toBeDefined();
    expect(global.IntersectionObserver).toBeDefined();
    expect(global.ResizeObserver).toBeDefined();
  });
});