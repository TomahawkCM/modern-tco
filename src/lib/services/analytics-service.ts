import { supabase } from "@/lib/supabase";
import type { AnalyticsEvent, ContentAnalytics, UserAnalytics } from "@/types/assessment";
import type { TablesInsert } from "@/types/supabase";
import { v4 as uuidv4 } from "uuid";

export interface AnalyticsMetrics {
  totalSessions: number;
  totalQuestionsAnswered: number;
  averageSessionDuration: number;
  averageAccuracy: number;
  peakUsageHours: number[];
  userEngagementScore: number;
  contentEffectiveness: Record<string, number>;
  dropoffPoints: Array<{ point: string; percentage: number }>;
  learningPathOptimization: {
    mostEffectivePaths: string[];
    strugglingPoints: string[];
    recommendedAdjustments: string[];
  };
}

export interface PerformanceAnalytics {
  responseTime: number;
  errorRate: number;
  throughput: number;
  resourceUtilization: {
    cpu: number;
    memory: number;
    storage: number;
  };
  cacheHitRate: number;
  userSatisfactionScore: number;
}

class AnalyticsServiceClass {
  // Static signatures added for compatibility with call-sites that treat
  // the class as a static holder (e.g., `AnalyticsService.track(...)`).
  static track: (event: AnalyticsEvent) => Promise<void>;
  static getUserAnalytics: (userId: string, timeRange?: string) => Promise<UserAnalytics | null>;
  static getContentAnalytics: (contentId: string) => Promise<ContentAnalytics | null>;

  /**
   * Track analytics event
   */
  async track(event: AnalyticsEvent): Promise<void> {
    const payload = {
      event_id: uuidv4(),
      user_id: event.data?.userId || "anonymous",
      session_id: event.session_id,
      event_type: event.type,
      event_timestamp: event.timestamp.toISOString(),
      event_data: event.data, // Store entire data object as JSONB
    } as TablesInsert<'analytics_events'>;

    // Cast to any at call-site to avoid overly-strict generated Supabase insert overloads
    const { error } = await (supabase as any).from("analytics_events").insert(payload);

    if (error) {
      console.error("Failed to track analytics event:", error.message);
      throw new Error(`Failed to track analytics event: ${error.message}`);
    }
  }

  /**
   * Get comprehensive analytics dashboard data
   */
  async getDashboardMetrics(
    timeRange: "day" | "week" | "month" | "all" = "week"
  ): Promise<AnalyticsMetrics> {
    // This method would query Supabase for aggregated analytics data
    // For now, return mock data or an empty structure
    return {
      totalSessions: 0,
      totalQuestionsAnswered: 0,
      averageSessionDuration: 0,
      averageAccuracy: 0,
      peakUsageHours: [],
      userEngagementScore: 0,
      contentEffectiveness: {},
      dropoffPoints: [],
      learningPathOptimization: {
        mostEffectivePaths: [],
        strugglingPoints: [],
        recommendedAdjustments: [],
      },
    };
  }

  /**
   * Get user-specific analytics
   */
  async getUserAnalytics(userId: string, timeRange?: string): Promise<UserAnalytics | null> {
    // This method would query Supabase for user-specific analytics data
    return null;
  }

  /**
   * Get content performance analytics
   */
  async getContentAnalytics(contentId: string): Promise<ContentAnalytics | null> {
    // This method would query Supabase for content-specific analytics data
    return null;
  }

  /**
   * Get system performance metrics
   */
  async getPerformanceMetrics(): Promise<PerformanceAnalytics> {
    // This method would query Supabase or monitoring services for system performance metrics
    return {
      responseTime: 0,
      errorRate: 0,
      throughput: 0,
      resourceUtilization: { cpu: 0, memory: 0, storage: 0 },
      cacheHitRate: 0,
      userSatisfactionScore: 0,
    };
  }

  /**
   * Generate learning insights and recommendations
   */
  async generateInsights(userId?: string): Promise<{
    personalizedRecommendations: string[];
    contentImprovements: string[];
    systemOptimizations: string[];
    learningEfficiencyTips: string[];
  }> {
    // These insights would be generated based on querying and analyzing Supabase data
    return {
      personalizedRecommendations: [],
      contentImprovements: [],
      systemOptimizations: [],
      learningEfficiencyTips: [],
    };
  }

  /**
   * Export analytics data for reporting
   */
  async exportData(
    format: "json" | "csv" = "json",
    timeRange: "day" | "week" | "month" | "all" = "all"
  ): Promise<string> {
    // This would fetch data from Supabase and format it
    const exportData = {
      timestamp: new Date().toISOString(),
      timeRange,
      events: [], // Placeholder
      metrics: await this.getDashboardMetrics(timeRange),
      userMetrics: {}, // Placeholder
      contentMetrics: {}, // Placeholder
      performanceMetrics: await this.getPerformanceMetrics(),
    };

    if (format === "csv") {
      // Basic CSV conversion for demonstration
      const headers = ["timestamp", "type", "userId", "sessionId", "data"];
      const rows = exportData.events.map((event: AnalyticsEvent) => [
        event.timestamp.toISOString(),
        event.type,
        event.data?.userId || "",
        event.session_id || "",
        JSON.stringify(event.data || {}),
      ]);
      return [headers, ...rows].map((row) => row.join(",")).join("\n");
    }

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Set up real-time analytics streaming
   */
  setupRealTimeStream(callback: (event: AnalyticsEvent) => void): () => void {
    // In a real-time scenario, this would involve Supabase Realtime or websockets
    console.warn(
      "Real-time analytics streaming not fully implemented with direct Supabase integration."
    );
    return () => {}; // No-op cleanup
  }
}

export const analyticsService = new AnalyticsServiceClass();

// Provide static forwarding methods on the class so call-sites that import the
// exported `AnalyticsService` (the class alias) can call methods like
// `AnalyticsService.track(...)`. We bind the instance methods to the class
// constructor to preserve existing usage without refactoring callers.
(AnalyticsServiceClass as any).track = analyticsService.track.bind(analyticsService);
(AnalyticsServiceClass as any).getUserAnalytics = analyticsService.getUserAnalytics.bind(
  analyticsService
);
(AnalyticsServiceClass as any).getContentAnalytics = analyticsService.getContentAnalytics.bind(
  analyticsService
);

// Static signatures for compatibility with call-sites that use the class as a static holder
(AnalyticsServiceClass as any).track = analyticsService.track.bind(analyticsService);
(AnalyticsServiceClass as any).getUserAnalytics = analyticsService.getUserAnalytics.bind(
  analyticsService
);
(AnalyticsServiceClass as any).getContentAnalytics = analyticsService.getContentAnalytics.bind(
  analyticsService
);

export { AnalyticsServiceClass as AnalyticsService }; // Keep class alias export for tests/mocks
export default analyticsService;
