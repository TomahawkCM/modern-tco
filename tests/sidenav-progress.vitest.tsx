import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import React from 'react';

// Mock next/navigation to provide a stable pathname
vi.mock('next/navigation', async (orig) => {
  const actual = await (orig as any)();
  return {
    ...actual,
    usePathname: () => '/learn/asking-questions',
  };
});

// Mock progress utility to return deterministic values
vi.mock('@/lib/progress', () => {
  return {
    getModuleProgress: vi.fn(async (_userId: string, moduleId: string) => {
      const map: Record<string, number> = {
        'asking-questions': 0.6,
        'taking-action': 0.2,
      };
      return { moduleId, percentage: map[moduleId] ?? 0 };
    }),
  };
});

// Auth context is already mocked in vitest.setup.ts to return a test user

import SideNav from '@/components/SideNav';

describe('SideNav progress dots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders progress dots reflecting per-module progress', async () => {
    render(<SideNav />);

    // Asking Questions should have about 60% => ~3/5 dots filled
    const asking = await screen.findByRole('link', { name: /Asking Questions/i });
    const progress = within(asking).getByTestId('progress');
    const dots = within(progress).getAllByTestId('progress-dot');
    const filled = dots.filter((d) => d.getAttribute('data-filled') === 'true');
    expect(dots).toHaveLength(5);
    expect(filled.length).toBe(3);

    // Taking Action should have about 20% => ~1/5 filled
    const taking = screen.getByRole('link', { name: /Taking Action/i });
    const tProgress = within(taking).getByTestId('progress');
    const tDots = within(tProgress).getAllByTestId('progress-dot');
    const tFilled = tDots.filter((d) => d.getAttribute('data-filled') === 'true');
    expect(tFilled.length).toBe(1);
  });
});

