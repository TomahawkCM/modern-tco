import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';

import { ModuleVideos } from '@/components/videos/ModuleVideos';

describe('ModuleVideos', () => {
  it('renders video embeds for a known module', () => {
    render(<ModuleVideos slug="asking-questions" />);
    const iframes = screen.getAllByTitle(/Asking Questions: Fundamentals|Interpreting Results Quickly/);
    expect(iframes.length).toBeGreaterThan(0);
    const frame = screen.getByTitle('Asking Questions: Fundamentals') as HTMLIFrameElement;
    expect(frame).toBeInTheDocument();
    expect(frame.getAttribute('src')).toMatch(/youtube-nocookie\.com\/embed\//);
    expect(frame.hasAttribute('allowfullscreen')).toBe(true);
  });

  it('shows placeholder when no videos exist', () => {
    render(<ModuleVideos slug="non-existent-module" />);
    expect(screen.getByText(/No videos available/i)).toBeInTheDocument();
  });
});

