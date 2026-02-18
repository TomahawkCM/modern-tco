/**
 * Unit Tests for Merchant Feedback API
 * Tests validation, feedback storage, counter updates, and privacy compliance
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "@/app/api/merchants/feedback/route";
import { NextRequest } from "next/server";

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(),
  rpc: vi.fn(),
};

// Mock createClient to return our mock
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

// Helper to create mock NextRequest
function createMockRequest(body: any): NextRequest {
  return {
    json: async () => body,
  } as unknown as NextRequest;
}

describe("POST /api/merchants/feedback", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Set up environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";
  });

  // ========================================
  // Input Validation
  // ========================================
  describe("Input Validation", () => {
    it("should reject request with missing merchant_token", async () => {
      const body = {
        chosen_category: "Food & Dining",
        accepted_suggestion: true,
      };

      const request = createMockRequest(body);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain("merchant_token");
    });

    it("should reject request with missing chosen_category", async () => {
      const body = {
        merchant_token: "NETFLIX",
        accepted_suggestion: true,
      };

      const request = createMockRequest(body);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain("chosen_category");
    });

    it("should reject request with missing accepted_suggestion", async () => {
      const body = {
        merchant_token: "NETFLIX",
        chosen_category: "Entertainment",
      };

      const request = createMockRequest(body);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain("accepted_suggestion");
    });

    it("should reject merchant_token shorter than 3 characters", async () => {
      const body = {
        merchant_token: "AB",
        chosen_category: "Food & Dining",
        accepted_suggestion: true,
      };

      const request = createMockRequest(body);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain("too short");
    });

    it("should reject empty chosen_category", async () => {
      const body = {
        merchant_token: "NETFLIX",
        chosen_category: "",
        accepted_suggestion: true,
      };

      const request = createMockRequest(body);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain("cannot be empty");
    });

    it("should reject invalid country code format", async () => {
      const body = {
        merchant_token: "NETFLIX",
        chosen_category: "Entertainment",
        accepted_suggestion: true,
        country: "USA", // Should be 2 letters
      };

      const request = createMockRequest(body);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain("2-letter ISO code");
    });

    it("should normalize merchant_token to uppercase", async () => {
      const body = {
        merchant_token: "netflix",
        chosen_category: "Entertainment",
        accepted_suggestion: true,
      };

      // Mock merchant lookup to return existing merchant
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({
              data: {
                id: "merchant-123",
                merchant_token: "NETFLIX",
                canonical_name: "Netflix",
                default_category: "Entertainment",
                default_subcategory: "Streaming Services",
              },
              error: null,
            }),
          }),
        }),
      });

      // Mock feedback insert
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({
              data: { id: "feedback-123" },
              error: null,
            }),
          }),
        }),
      });

      // Mock counter update
      mockSupabaseClient.rpc.mockResolvedValueOnce({
        error: null,
      });

      const request = createMockRequest(body);
      const response = await POST(request);

      expect(response.status).toBe(200);
      // Verify merchant lookup used uppercase token
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("merchants");
    });
  });

  // ========================================
  // Successful Feedback Submission
  // ========================================
  describe("Successful Feedback Submission", () => {
    it("should accept valid feedback with accepted suggestion", async () => {
      const body = {
        merchant_token: "NETFLIX",
        chosen_category: "Entertainment",
        chosen_subcategory: "Streaming Services",
        previous_category: "Entertainment",
        previous_subcategory: "Streaming Services",
        accepted_suggestion: true,
        country: "CA",
      };

      // Mock merchant lookup
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({
              data: {
                id: "merchant-123",
                merchant_token: "NETFLIX",
                canonical_name: "Netflix",
                default_category: "Entertainment",
                default_subcategory: "Streaming Services",
              },
              error: null,
            }),
          }),
        }),
      });

      // Mock feedback insert
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({
              data: { id: "feedback-123" },
              error: null,
            }),
          }),
        }),
      });

      // Mock counter update
      mockSupabaseClient.rpc.mockResolvedValueOnce({
        error: null,
      });

      const request = createMockRequest(body);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.message).toContain("accepted");
      expect(json.feedback_id).toBe("feedback-123");
      expect(json.merchant_id).toBe("merchant-123");
    });

    it("should accept valid feedback with user correction", async () => {
      const body = {
        merchant_token: "SKIPTHEDISHES",
        chosen_category: "Food & Dining",
        chosen_subcategory: "Delivery",
        previous_category: "Transportation",
        previous_subcategory: null,
        accepted_suggestion: false,
      };

      // Mock merchant lookup
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({
              data: {
                id: "merchant-456",
                merchant_token: "SKIPTHEDISHES",
                canonical_name: "SkipTheDishes",
                default_category: "Transportation",
                default_subcategory: null,
              },
              error: null,
            }),
          }),
        }),
      });

      // Mock feedback insert
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({
              data: { id: "feedback-456" },
              error: null,
            }),
          }),
        }),
      });

      // Mock counter update
      mockSupabaseClient.rpc.mockResolvedValueOnce({
        error: null,
      });

      const request = createMockRequest(body);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.message).toContain("correction");
      expect(json.feedback_id).toBe("feedback-456");
    });

    it("should handle optional fields (user_or_tenant_key, country)", async () => {
      const body = {
        merchant_token: "OPENAI",
        chosen_category: "AI & Developer Tools",
        accepted_suggestion: true,
        user_or_tenant_key: "user-abc-123",
        country: "US",
      };

      // Mock merchant lookup
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({
              data: {
                id: "merchant-789",
                merchant_token: "OPENAI",
                canonical_name: "OpenAI",
                default_category: "AI & Developer Tools",
                default_subcategory: "Subscriptions",
              },
              error: null,
            }),
          }),
        }),
      });

      // Mock feedback insert
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({
              data: { id: "feedback-789" },
              error: null,
            }),
          }),
        }),
      });

      // Mock counter update
      mockSupabaseClient.rpc.mockResolvedValueOnce({
        error: null,
      });

      const request = createMockRequest(body);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
    });
  });

  // ========================================
  // Merchant Lookup & Placeholder Creation
  // ========================================
  describe("Merchant Lookup & Placeholder Creation", () => {
    it("should create placeholder merchant if not found", async () => {
      const body = {
        merchant_token: "NEWMERCHANT",
        chosen_category: "Retail",
        chosen_subcategory: "Clothing",
        accepted_suggestion: false,
      };

      // Mock merchant lookup (not found)
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({
              data: null,
              error: { message: "Not found" },
            }),
          }),
        }),
      });

      // Mock placeholder merchant creation
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({
              data: {
                id: "new-merchant-123",
                merchant_token: "NEWMERCHANT",
                canonical_name: "NEWMERCHANT",
                default_category: "Retail",
                default_subcategory: "Clothing",
              },
              error: null,
            }),
          }),
        }),
      });

      // Mock feedback insert
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({
              data: { id: "feedback-new-123" },
              error: null,
            }),
          }),
        }),
      });

      // Mock counter update
      mockSupabaseClient.rpc.mockResolvedValueOnce({
        error: null,
      });

      const request = createMockRequest(body);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.merchant_id).toBe("new-merchant-123");
    });
  });

  // ========================================
  // Counter Updates
  // ========================================
  describe("Counter Updates", () => {
    it("should increment agreement count when suggestion accepted", async () => {
      const body = {
        merchant_token: "NETFLIX",
        chosen_category: "Entertainment",
        accepted_suggestion: true,
      };

      // Mock merchant lookup
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({
              data: {
                id: "merchant-123",
                merchant_token: "NETFLIX",
                canonical_name: "Netflix",
                default_category: "Entertainment",
                default_subcategory: null,
              },
              error: null,
            }),
          }),
        }),
      });

      // Mock feedback insert
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({
              data: { id: "feedback-123" },
              error: null,
            }),
          }),
        }),
      });

      // Mock counter update
      mockSupabaseClient.rpc.mockResolvedValueOnce({
        error: null,
      });

      const request = createMockRequest(body);
      await POST(request);

      // Verify increment_merchant_counters called with correct params
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
        "increment_merchant_counters",
        expect.objectContaining({
          p_merchant_id: "merchant-123",
          p_increment_classification: true,
          p_increment_agreement: true,
          p_increment_correction: false,
        })
      );
    });

    it("should increment correction count when suggestion rejected", async () => {
      const body = {
        merchant_token: "NETFLIX",
        chosen_category: "Food & Dining",
        accepted_suggestion: false,
      };

      // Mock merchant lookup
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({
              data: {
                id: "merchant-123",
                merchant_token: "NETFLIX",
                canonical_name: "Netflix",
                default_category: "Entertainment",
                default_subcategory: null,
              },
              error: null,
            }),
          }),
        }),
      });

      // Mock feedback insert
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({
              data: { id: "feedback-456" },
              error: null,
            }),
          }),
        }),
      });

      // Mock counter update
      mockSupabaseClient.rpc.mockResolvedValueOnce({
        error: null,
      });

      const request = createMockRequest(body);
      await POST(request);

      // Verify increment_merchant_counters called with correct params
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
        "increment_merchant_counters",
        expect.objectContaining({
          p_merchant_id: "merchant-123",
          p_increment_classification: true,
          p_increment_agreement: false,
          p_increment_correction: true,
        })
      );
    });
  });

  // ========================================
  // Error Handling
  // ========================================
  describe("Error Handling", () => {
    it("should return 500 if database configuration missing", async () => {
      // Remove environment variables
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      const body = {
        merchant_token: "NETFLIX",
        chosen_category: "Entertainment",
        accepted_suggestion: true,
      };

      const request = createMockRequest(body);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toContain("Database configuration");

      // Restore environment variables
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
      process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";
    });

    it("should handle database errors gracefully", async () => {
      const body = {
        merchant_token: "NETFLIX",
        chosen_category: "Entertainment",
        accepted_suggestion: true,
      };

      // Mock merchant lookup with database error
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockRejectedValueOnce(new Error("Database connection failed")),
          }),
        }),
      });

      const request = createMockRequest(body);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toBeTruthy();
    });
  });

  // ========================================
  // Privacy & Security
  // ========================================
  describe("Privacy & Security", () => {
    it("should hash user_or_tenant_key before storing", async () => {
      const body = {
        merchant_token: "NETFLIX",
        chosen_category: "Entertainment",
        accepted_suggestion: true,
        user_or_tenant_key: "user-sensitive-id-12345",
      };

      // Mock merchant lookup
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({
              data: {
                id: "merchant-123",
                merchant_token: "NETFLIX",
                canonical_name: "Netflix",
                default_category: "Entertainment",
                default_subcategory: null,
              },
              error: null,
            }),
          }),
        }),
      });

      // Mock feedback insert
      const mockInsert = vi.fn().mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({
            data: { id: "feedback-123" },
            error: null,
          }),
        }),
      });
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: mockInsert,
      });

      // Mock counter update
      mockSupabaseClient.rpc.mockResolvedValueOnce({
        error: null,
      });

      const request = createMockRequest(body);
      await POST(request);

      // Verify insert was called with hashed key (not raw key)
      const insertCall = mockInsert.mock.calls[0][0];
      expect(insertCall.user_or_tenant_key).not.toBe("user-sensitive-id-12345");
      expect(insertCall.user_or_tenant_key).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex
    });

    it('should use "anonymous" when user_or_tenant_key not provided', async () => {
      const body = {
        merchant_token: "NETFLIX",
        chosen_category: "Entertainment",
        accepted_suggestion: true,
      };

      // Mock merchant lookup
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({
              data: {
                id: "merchant-123",
                merchant_token: "NETFLIX",
                canonical_name: "Netflix",
                default_category: "Entertainment",
                default_subcategory: null,
              },
              error: null,
            }),
          }),
        }),
      });

      // Mock feedback insert
      const mockInsert = vi.fn().mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({
            data: { id: "feedback-123" },
            error: null,
          }),
        }),
      });
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: mockInsert,
      });

      // Mock counter update
      mockSupabaseClient.rpc.mockResolvedValueOnce({
        error: null,
      });

      const request = createMockRequest(body);
      await POST(request);

      // Verify insert was called with "anonymous"
      const insertCall = mockInsert.mock.calls[0][0];
      expect(insertCall.user_or_tenant_key).toBe("anonymous");
    });
  });
});
