/**
 * Test Utilities - Provides mock context providers for component testing
 *
 * This file exports:
 * - MockAuthProvider: Wraps components with a mock AuthContext
 * - renderWithAuth: Helper function to render components with all necessary providers
 * - mockUser: Default test user object
 * - mockSession: Default test session object
 */

import { AuthContext } from "@/contexts/AuthContext";
import { render, type RenderOptions } from "@testing-library/react";
import React, { type ReactElement } from "react";
import { vi } from "vitest";

/**
 * Mock User object for testing
 */
export const mockUser = {
  id: "test-user-id-123",
  email: "test@example.com",
  user_metadata: {
    first_name: "Test",
    last_name: "User",
  },
  app_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as any;

/**
 * Mock Session object for testing
 */
export const mockSession = {
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  token_type: "bearer",
  user: mockUser,
} as any;

/**
 * Mock AuthContext value with all required methods and properties
 */
export const mockAuthContext = {
  user: mockUser,
  session: mockSession,
  loading: false,
  error: null,
  isAdmin: false,
  signIn: vi.fn().mockResolvedValue({ error: null }),
  signUp: vi.fn().mockResolvedValue({ error: null }),
  signOut: vi.fn().mockResolvedValue({ error: null }),
  resetPassword: vi.fn().mockResolvedValue({ error: null }),
  updateProfile: vi.fn().mockResolvedValue({ error: null }),
};

/**
 * MockAuthProvider - Provides a mock AuthContext for testing
 *
 * @param children - Child components to wrap
 * @param value - Optional custom AuthContext value (defaults to mockAuthContext)
 *
 * @example
 * ```tsx
 * render(
 *   <MockAuthProvider>
 *     <ComponentThatUsesAuth />
 *   </MockAuthProvider>
 * );
 * ```
 */
export function MockAuthProvider({
  children,
  value = mockAuthContext,
}: {
  children: React.ReactNode;
  value?: typeof mockAuthContext;
}) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * MockAuthProvider for unauthenticated state (no user logged in)
 */
export function MockUnauthenticatedProvider({ children }: { children: React.ReactNode }) {
  const unauthenticatedContext = {
    ...mockAuthContext,
    user: null,
    session: null,
  };
  return <AuthContext.Provider value={unauthenticatedContext}>{children}</AuthContext.Provider>;
}

/**
 * MockAuthProvider for loading state
 */
export function MockLoadingAuthProvider({ children }: { children: React.ReactNode }) {
  const loadingContext = {
    ...mockAuthContext,
    loading: true,
  };
  return <AuthContext.Provider value={loadingContext}>{children}</AuthContext.Provider>;
}

/**
 * MockAuthProvider for admin user
 */
export function MockAdminAuthProvider({ children }: { children: React.ReactNode }) {
  const adminContext = {
    ...mockAuthContext,
    isAdmin: true,
    user: {
      ...mockUser,
      email: "admin@example.com",
    },
  };
  return <AuthContext.Provider value={adminContext}>{children}</AuthContext.Provider>;
}

/**
 * AllProvidersWrapper - Wraps components with all necessary providers
 * Add additional providers here as needed (PracticeContext, ProgressContext, etc.)
 */
export function AllProvidersWrapper({
  children,
  authValue,
}: {
  children: React.ReactNode;
  authValue?: typeof mockAuthContext;
}) {
  return <MockAuthProvider value={authValue}>{children}</MockAuthProvider>;
}

/**
 * Custom render function that wraps components with all necessary providers
 *
 * @param ui - Component to render
 * @param options - Optional render options including custom auth context value
 *
 * @example
 * ```tsx
 * renderWithAuth(<MyComponent />);
 *
 * // With custom auth context
 * renderWithAuth(<MyComponent />, {
 *   authValue: { ...mockAuthContext, user: null }
 * });
 * ```
 */
export function renderWithAuth(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & { authValue?: typeof mockAuthContext }
) {
  const { authValue, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: ({ children }) => (
      <AllProvidersWrapper authValue={authValue}>{children}</AllProvidersWrapper>
    ),
    ...renderOptions,
  });
}

/**
 * Export all testing library utilities for convenience
 */
export { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
