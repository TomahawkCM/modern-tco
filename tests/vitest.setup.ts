// Extend expect with Testing Library and DOM matchers for Vitest
import '@testing-library/jest-dom/vitest';

// Minimal env for modules that initialize Supabase on import
process.env.NEXT_PUBLIC_SUPABASE_URL ||= 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= 'anon-test-key';

// Silence Next.js SWC install patch notice in tests
process.env.__NEXT_DISABLE_SWC_WARNING__ = '1';

// Provide a lightweight mock for the Auth context used by UI components
import { vi } from 'vitest';
vi.mock('@/contexts/AuthContext', () => {
  return {
    AuthProvider: ({ children }: any) => children,
    useAuth: () => ({
      user: { id: 'test-user', email: 'user@example.com' },
      isAuthenticated: true,
      signIn: vi.fn(),
      signUp: vi.fn(async () => ({ error: null })),
      signOut: vi.fn(),
    }),
  };
});
