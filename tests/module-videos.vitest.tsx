import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";

// Mock next/dynamic to load components synchronously in tests
vi.mock("next/dynamic", () => ({
  default: (fn: () => Promise<any>) => {
    const Component = React.lazy(fn);
    return (props: any) => (
      <React.Suspense fallback={<div>Loading...</div>}>
        <Component {...props} />
      </React.Suspense>
    );
  },
}));

import { ModuleVideos } from "@/components/videos/ModuleVideos";

describe("ModuleVideos", () => {
  it("renders videos section for a known module", () => {
    render(<ModuleVideos slug="asking-questions" />);

    // Verify the videos section renders
    expect(screen.getByRole("region", { name: /videos/i })).toBeInTheDocument();
    expect(screen.getByText("Videos")).toBeInTheDocument();

    // Verify grid container is present (videos will load dynamically)
    const section = screen.getByRole("region", { name: /videos/i });
    expect(section.querySelector(".grid")).toBeInTheDocument();
  });

  it("shows placeholder when no videos exist", () => {
    render(<ModuleVideos slug="non-existent-module" />);
    expect(screen.getByText(/No videos available/i)).toBeInTheDocument();
  });
});
