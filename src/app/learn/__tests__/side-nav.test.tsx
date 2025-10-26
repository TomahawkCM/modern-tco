/**
 * TASK-0001: Seed curriculum manifest + left-nav modules
 * Minimal test to verify SideNav renders modules from the manifest
 */

import { render, screen } from "@testing-library/react";
import SideNav from "@/components/SideNav";
import manifest from "@/config/modules.manifest.json";

// Mock AuthContext to provide a user id (avoids provider requirement)
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "test-user" } }),
}));

// Mock progress function to avoid Supabase calls
jest.mock("@/lib/progress", () => ({
  getModuleProgress: async () => ({ moduleId: "x", percentage: 0 }),
}));

describe("SideNav (Learn)", () => {
  it("renders curriculum nav and all modules from manifest", () => {
    render(<SideNav />);

    // Navigation landmark
    expect(
      screen.getByRole("navigation", { name: /study modules navigation/i })
    ).toBeInTheDocument();

    const data = manifest as unknown as {
      modules: Array<{ id: string; title: string; slug: string }>;
    };

    // Ensure each module title appears
    for (const m of data.modules) {
      expect(screen.getByText(m.title)).toBeInTheDocument();
    }
  });
});

