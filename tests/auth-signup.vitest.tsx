import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import SignUpPage from '@/app/auth/signup/page';

// Use the mocked AuthContext from vitest.setup.ts
import * as AuthCtx from '@/contexts/AuthContext';

describe('Auth Signup Page', () => {
  it('renders sign up form and submits successfully', async () => {
    const spy = vi.fn(async () => ({ error: null }));
    vi.spyOn(AuthCtx, 'useAuth').mockReturnValue({
      user: null as any,
      session: null as any,
      loading: false,
      error: null as any,
      signIn: vi.fn(),
      signUp: spy as any,
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      updateProfile: vi.fn(),
    } as any);

    render(<SignUpPage />);

    // Fill fields
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Abcd1234' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'Abcd1234' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => expect(spy).toHaveBeenCalled());

    // Success UI appears
    expect(await screen.findByText(/Check Your Email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Back to Sign In/i })).toBeInTheDocument();
  });
});

