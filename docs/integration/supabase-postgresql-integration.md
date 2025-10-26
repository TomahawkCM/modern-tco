# Supabase-PostgreSQL Integration Guide for TCO Application

## Overview

This document provides comprehensive guidance on integrating Supabase with PostgreSQL for the Tanium Certified Operator (TCO) exam preparation system, covering setup, configuration, advanced features, and best practices.

## Architecture Overview

### Integration Stack

```text
┌─────────────────────────────────────────────────────────┐
│                 Next.js Application                     │
│  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │  React Context  │    │     Supabase Client         │ │
│  │  - Auth Context │    │  - Database Operations     │ │
│  │  - Data Context │    │  - Real-time Subscriptions │ │
│  │  - Cache Layer  │    │  - Authentication          │ │
│  └─────────────────┘    └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                               │
                        ┌─────────────────┐
                        │   Supabase API  │
                        │  - REST API     │
                        │  - GraphQL      │
                        │  - Realtime     │
                        │  - Auth Service │
                        └─────────────────┘
                               │
┌─────────────────────────────────────────────────────────┐
│                PostgreSQL Database                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │
│  │   Tables    │ │ Extensions  │ │   Custom Functions  │ │
│  │ - questions │ │ - uuid-ossp │ │ - calculate_score() │ │
│  │ - users     │ │ - pg_trgm   │ │ - update_progress() │ │
│  │ - progress  │ │ - unaccent  │ │ - analytics()       │ │
│  └─────────────┘ └─────────────┘ └─────────────────────┘ │
│                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │
│  │   Indexes   │ │  Triggers   │ │     Security        │ │
│  │ - GIN/GiST  │ │ - Audit     │ │ - RLS Policies      │ │
│  │ - B-tree    │ │ - Progress  │ │ - JWT Integration   │ │
│  │ - Partial   │ │ - Timestamp │ │ - Role Management   │ │
│  └─────────────┘ └─────────────┘ └─────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Supabase Client Configuration

### Environment Setup

```typescript
// .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

// For local development
SUPABASE_LOCAL_URL=http://localhost:54321
SUPABASE_LOCAL_ANON_KEY=your-local-anon-key
```

### Advanced Client Configuration

```typescript
// lib/supabase/config.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side configuration with optimizations
export const supabase: SupabaseClient<Database> = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "tco-auth-token",
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
  db: {
    schema: "public",
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      "X-Application-Name": "tco-study-app",
      "X-Client-Version": process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
    },
  },
});

// Server-side client with service role
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: "public",
    },
  }
);

// Connection pool configuration for high-load scenarios
export const supabasePooled = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: "public",
    // Configure connection pooling
    max_connections: 20,
    idle_timeout: 300,
    statement_timeout: 30000,
  },
});
```

### Type-Safe Database Integration

```typescript
// types/supabase.ts - Generated types
export interface Database {
  public: {
    Tables: {
      questions: {
        Row: {
          id: string;
          title: string;
          content: string;
          correct_answer: string;
          options: string[];
          metadata: Json;
          tags: string[];
          domain: string;
          difficulty: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          correct_answer: string;
          options: string[];
          metadata?: Json;
          tags?: string[];
          domain: string;
          difficulty: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          correct_answer?: string;
          options?: string[];
          metadata?: Json;
          tags?: string[];
          domain?: string;
          difficulty?: string;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          domain: string;
          questions_answered: number;
          correct_answers: number;
          current_streak: number;
          longest_streak: number;
          last_activity: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          domain: string;
          questions_answered?: number;
          correct_answers?: number;
          current_streak?: number;
          longest_streak?: number;
          last_activity?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          questions_answered?: number;
          correct_answers?: number;
          current_streak?: number;
          longest_streak?: number;
          last_activity?: string;
          updated_at?: string;
        };
      };
      // ... other table types
    };
    Functions: {
      calculate_adaptive_difficulty: {
        Args: {
          user_id: string;
          domain: string;
          current_accuracy?: number;
        };
        Returns: {
          recommended_difficulty: string;
          confidence_score: number;
          next_question_ids: string[];
        }[];
      };
      analyze_user_performance: {
        Args: {
          user_id: string;
          analysis_period?: string;
        };
        Returns: Json;
      };
      search_questions: {
        Args: {
          search_query: string;
          domain_filter?: string;
          difficulty_filter?: string;
          limit_count?: number;
        };
        Returns: {
          question_id: string;
          title: string;
          content: string;
          domain: string;
          difficulty: string;
          rank: number;
          headline: string;
        }[];
      };
    };
  };
}

// Custom hook for type-safe operations
export function useSupabaseQuery<T>(
  queryFn: (supabase: SupabaseClient<Database>) => Promise<{ data: T | null; error: any }>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await queryFn(supabase);
        if (result.error) throw result.error;
        setData(result.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [queryFn]);

  return { data, loading, error, refetch: () => fetchData() };
}
```

## Advanced Database Operations

### Batch Operations and Transactions

```typescript
// lib/database/operations.ts
export class DatabaseOperations {
  private supabase: SupabaseClient<Database>;

  constructor(client?: SupabaseClient<Database>) {
    this.supabase = client || supabase;
  }

  // Batch insert questions with error handling
  async batchInsertQuestions(questions: Database["public"]["Tables"]["questions"]["Insert"][]) {
    try {
      // Split into smaller batches to avoid limits
      const batchSize = 100;
      const batches = [];

      for (let i = 0; i < questions.length; i += batchSize) {
        batches.push(questions.slice(i, i + batchSize));
      }

      const results = [];
      for (const batch of batches) {
        const { data, error } = await this.supabase.from("questions").insert(batch).select();

        if (error) throw error;
        results.push(...(data || []));
      }

      return { data: results, error: null };
    } catch (error) {
      console.error("Batch insert failed:", error);
      return { data: null, error };
    }
  }

  // Complex query with joins and aggregations
  async getUserAnalytics(userId: string) {
    const { data, error } = await this.supabase.rpc("analyze_user_performance", {
      user_id: userId,
      analysis_period: "30 days",
    });

    if (error) throw error;
    return data;
  }

  // Transaction-like operation using stored procedure
  async submitExamSession(
    userId: string,
    examData: {
      questions: Array<{
        question_id: string;
        user_answer: string;
        is_correct: boolean;
        time_taken: number;
      }>;
      total_score: number;
      time_taken: number;
    }
  ) {
    try {
      // Start with exam session creation
      const { data: examSession, error: examError } = await this.supabase
        .from("exam_sessions")
        .insert({
          user_id: userId,
          score: examData.total_score,
          time_taken: examData.time_taken,
          exam_data: examData,
          started_at: new Date(Date.now() - examData.time_taken * 1000).toISOString(),
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (examError) throw examError;

      // Insert individual answers
      const answerInserts = examData.questions.map((q) => ({
        user_id: userId,
        question_id: q.question_id,
        user_answer: q.user_answer,
        is_correct: q.is_correct,
        time_taken: q.time_taken,
        exam_session_id: examSession.id,
      }));

      const { error: answersError } = await this.supabase
        .from("user_answers")
        .insert(answerInserts);

      if (answersError) throw answersError;

      // Progress updates happen automatically via triggers
      return { data: examSession, error: null };
    } catch (error) {
      console.error("Exam submission failed:", error);
      return { data: null, error };
    }
  }

  // Optimized search with caching
  private searchCache = new Map<string, { data: any; timestamp: number }>();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async searchQuestions(
    query: string,
    filters: {
      domain?: string;
      difficulty?: string;
      limit?: number;
    } = {}
  ) {
    const cacheKey = `search:${query}:${JSON.stringify(filters)}`;
    const cached = this.searchCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return { data: cached.data, error: null, fromCache: true };
    }

    try {
      const { data, error } = await this.supabase.rpc("search_questions", {
        search_query: query,
        domain_filter: filters.domain || null,
        difficulty_filter: filters.difficulty || null,
        limit_count: filters.limit || 20,
      });

      if (error) throw error;

      // Cache successful results
      this.searchCache.set(cacheKey, { data, timestamp: Date.now() });

      return { data, error: null, fromCache: false };
    } catch (error) {
      console.error("Search failed:", error);
      return { data: null, error };
    }
  }
}

// Singleton instance
export const dbOps = new DatabaseOperations();
```

### Real-time Integration with PostgreSQL

```typescript
// lib/realtime/subscriptions.ts
export class RealtimeManager {
  private supabase: SupabaseClient<Database>;
  private subscriptions = new Map<string, any>();

  constructor(client?: SupabaseClient<Database>) {
    this.supabase = client || supabase;
  }

  // Subscribe to user progress updates
  subscribeToUserProgress(userId: string, callback: (payload: any) => void) {
    const subscriptionKey = `user_progress:${userId}`;

    const subscription = this.supabase
      .channel(subscriptionKey)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_progress",
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    this.subscriptions.set(subscriptionKey, subscription);
    return subscription;
  }

  // Subscribe to exam session updates for real-time monitoring
  subscribeToExamSession(sessionId: string, callback: (payload: any) => void) {
    const subscriptionKey = `exam_session:${sessionId}`;

    const subscription = this.supabase
      .channel(subscriptionKey)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "exam_sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          // Transform payload for better usability
          const transformedPayload = {
            type: payload.eventType,
            data: payload.new || payload.old,
            timestamp: new Date().toISOString(),
          };
          callback(transformedPayload);
        }
      )
      .subscribe();

    this.subscriptions.set(subscriptionKey, subscription);
    return subscription;
  }

  // Presence system for collaborative features
  async joinStudyRoom(roomId: string, userInfo: { id: string; name: string }) {
    const channel = this.supabase.channel(roomId);

    await channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        console.log("Study room participants:", state);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("User joined study room:", newPresences);
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("User left study room:", leftPresences);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track(userInfo);
        }
      });

    this.subscriptions.set(`study_room:${roomId}`, channel);
    return channel;
  }

  // Broadcast quiz questions for group study
  async broadcastQuizQuestion(roomId: string, questionData: any) {
    const channel = this.subscriptions.get(`study_room:${roomId}`);
    if (channel) {
      await channel.send({
        type: "broadcast",
        event: "quiz_question",
        payload: questionData,
      });
    }
  }

  // Clean up subscriptions
  unsubscribe(key: string) {
    const subscription = this.subscriptions.get(key);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(key);
    }
  }

  unsubscribeAll() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }
}

export const realtimeManager = new RealtimeManager();
```

## Authentication and Authorization Integration

### Advanced Auth Patterns

```typescript
// lib/auth/enhanced-auth.ts
export class EnhancedAuth {
  private supabase: SupabaseClient<Database>;

  constructor(client?: SupabaseClient<Database>) {
    this.supabase = client || supabase;
  }

  // Enhanced sign up with user metadata
  async signUpWithMetadata(
    email: string,
    password: string,
    metadata: {
      full_name: string;
      organization?: string;
      role: "student" | "instructor" | "admin";
      study_preferences?: {
        preferred_difficulty: string;
        study_goals: string[];
        time_per_session: number;
      };
    }
  ) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) return { data: null, error };

    // Create user profile with extended information
    if (data.user) {
      const { error: profileError } = await this.supabase.from("users").insert({
        id: data.user.id,
        email: data.user.email!,
        full_name: metadata.full_name,
        role: metadata.role,
        organization: metadata.organization,
        is_active: true,
        created_at: new Date().toISOString(),
      });

      if (profileError) {
        console.error("Profile creation failed:", profileError);
      }

      // Initialize user settings
      if (metadata.study_preferences) {
        await this.supabase.from("user_settings").insert({
          user_id: data.user.id,
          settings: metadata.study_preferences,
        });
      }
    }

    return { data, error };
  }

  // Role-based access control
  async checkUserRole(requiredRoles: string[]): Promise<boolean> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) return false;

    const { data: profile, error } = await this.supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || !profile) return false;

    return requiredRoles.includes(profile.role);
  }

  // Enhanced session management with activity tracking
  async trackUserActivity(activity: {
    action: string;
    context: Record<string, any>;
    timestamp?: string;
  }) {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) return;

    await this.supabase.from("user_activity_log").insert({
      user_id: user.id,
      action: activity.action,
      context: activity.context,
      timestamp: activity.timestamp || new Date().toISOString(),
      session_id: user.id, // Or generate unique session ID
    });
  }

  // Secure logout with cleanup
  async secureSignOut() {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (user) {
      // Track logout activity
      await this.trackUserActivity({
        action: "user_logout",
        context: { timestamp: new Date().toISOString() },
      });

      // Clear any active study sessions
      await this.supabase
        .from("exam_sessions")
        .update({
          ended_at: new Date().toISOString(),
          status: "interrupted",
        })
        .eq("user_id", user.id)
        .is("completed_at", null);
    }

    // Clean up realtime subscriptions
    realtimeManager.unsubscribeAll();

    // Sign out
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }
}

export const enhancedAuth = new EnhancedAuth();
```

### Row Level Security Integration

```sql
-- Enhanced RLS policies for TCO application
-- These policies integrate with Supabase Auth JWT tokens

-- Users can only access their own data
CREATE POLICY "users_own_data" ON user_progress
  FOR ALL USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role IN ('admin', 'instructor')
    )
  );

-- Dynamic policy based on user role
CREATE POLICY "role_based_question_access" ON questions
  FOR SELECT USING (
    is_active = true OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role IN ('admin', 'content_creator', 'instructor')
    )
  );

-- Time-based access control
CREATE POLICY "exam_session_time_access" ON exam_sessions
  FOR ALL USING (
    auth.uid() = user_id AND (
      completed_at IS NULL OR  -- Active sessions
      completed_at >= NOW() - INTERVAL '7 days'  -- Recent sessions
    )
  );

-- Organization-based isolation
CREATE POLICY "organization_isolation" ON users
  FOR SELECT USING (
    auth.uid() = id OR
    (SELECT organization FROM users WHERE id = auth.uid()) = organization OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

-- Function security
REVOKE EXECUTE ON FUNCTION analyze_user_performance FROM PUBLIC;
GRANT EXECUTE ON FUNCTION analyze_user_performance TO authenticated;

-- Create security definer function for admin operations
CREATE OR REPLACE FUNCTION admin_user_analytics(target_user_id UUID)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  RETURN analyze_user_performance(target_user_id);
END;
$$ LANGUAGE plpgsql;
```

## Performance Optimization Strategies

### Intelligent Caching Layer

```typescript
// lib/cache/intelligent-cache.ts
interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum cache size
  revalidateOnStale: boolean;
}

export class IntelligentCache {
  private cache = new Map<string, { data: any; timestamp: number; hits: number }>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: 5 * 60 * 1000, // 5 minutes default
      maxSize: 1000,
      revalidateOnStale: true,
      ...config,
    };
  }

  // Get with automatic revalidation
  async get<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: Partial<CacheConfig> = {}
  ): Promise<T> {
    const cached = this.cache.get(key);
    const ttl = options.ttl || this.config.ttl;

    // Cache hit and not stale
    if (cached && Date.now() - cached.timestamp < ttl) {
      cached.hits++;
      return cached.data;
    }

    // Cache miss or stale - fetch new data
    const data = await fetchFn();

    // Evict oldest if cache is full
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 1,
    });

    return data;
  }

  // Invalidate specific keys or patterns
  invalidate(pattern: string | RegExp) {
    if (typeof pattern === "string") {
      this.cache.delete(pattern);
    } else {
      const keysToDelete = Array.from(this.cache.keys()).filter((key) => pattern.test(key));
      keysToDelete.forEach((key) => this.cache.delete(key));
    }
  }

  // Get cache statistics
  getStats() {
    const entries = Array.from(this.cache.values());
    return {
      size: this.cache.size,
      totalHits: entries.reduce((sum, entry) => sum + entry.hits, 0),
      avgHits:
        entries.length > 0
          ? entries.reduce((sum, entry) => sum + entry.hits, 0) / entries.length
          : 0,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map((entry) => entry.timestamp)) : null,
    };
  }
}

// Specialized cache for different data types
export const questionCache = new IntelligentCache({
  ttl: 10 * 60 * 1000, // 10 minutes for questions
  maxSize: 500,
});

export const userProgressCache = new IntelligentCache({
  ttl: 2 * 60 * 1000, // 2 minutes for progress (more dynamic)
  maxSize: 200,
});

export const analyticsCache = new IntelligentCache({
  ttl: 15 * 60 * 1000, // 15 minutes for analytics
  maxSize: 100,
});
```

### Database Connection Optimization

```typescript
// lib/database/connection-pool.ts
import { createPool, Pool } from "generic-pool";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

class SupabaseConnectionPool {
  private pool: Pool<SupabaseClient>;

  constructor() {
    this.pool = createPool(
      {
        create: () => {
          return createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
              auth: { persistSession: false },
              global: {
                headers: {
                  Connection: "keep-alive",
                  "Keep-Alive": "timeout=30",
                },
              },
            }
          );
        },
        destroy: (client) => {
          // Cleanup if needed
          return Promise.resolve();
        },
        validate: (client) => {
          // Basic validation - could be enhanced
          return Promise.resolve(true);
        },
      },
      {
        max: 20, // Maximum connections
        min: 5, // Minimum connections
        acquireTimeoutMillis: 30000, // 30 seconds
        idleTimeoutMillis: 300000, // 5 minutes
        evictionRunIntervalMillis: 60000, // 1 minute
      }
    );
  }

  async execute<T>(operation: (client: SupabaseClient) => Promise<T>): Promise<T> {
    const client = await this.pool.acquire();
    try {
      return await operation(client);
    } finally {
      await this.pool.release(client);
    }
  }

  async getStats() {
    return {
      size: this.pool.size,
      available: this.pool.available,
      borrowed: this.pool.borrowed,
      pending: this.pool.pending,
      max: this.pool.max,
      min: this.pool.min,
    };
  }

  async drain() {
    await this.pool.drain();
    await this.pool.clear();
  }
}

export const connectionPool = new SupabaseConnectionPool();

// Usage in API routes
export async function optimizedQuery<T>(
  operation: (client: SupabaseClient) => Promise<T>
): Promise<T> {
  return connectionPool.execute(operation);
}
```

## Monitoring and Observability

### Comprehensive Monitoring Setup

```typescript
// lib/monitoring/database-monitor.ts
export class DatabaseMonitor {
  private supabase: SupabaseClient<Database>;
  private metrics = {
    queryCount: 0,
    errorCount: 0,
    avgResponseTime: 0,
    slowQueries: [] as Array<{ query: string; duration: number; timestamp: Date }>,
  };

  constructor(client?: SupabaseClient<Database>) {
    this.supabase = client || supabase;
  }

  // Wrap database operations with monitoring
  async monitoredQuery<T>(
    operation: () => Promise<{ data: T | null; error: any }>,
    context: { operation: string; table?: string }
  ): Promise<{ data: T | null; error: any }> {
    const startTime = performance.now();
    this.metrics.queryCount++;

    try {
      const result = await operation();
      const duration = performance.now() - startTime;

      // Update metrics
      this.updateMetrics(duration, context, result.error);

      // Log slow queries
      if (duration > 1000) {
        // 1 second threshold
        this.metrics.slowQueries.push({
          query: `${context.operation}${context.table ? ` on ${context.table}` : ""}`,
          duration,
          timestamp: new Date(),
        });
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.updateMetrics(duration, context, error);
      return { data: null, error };
    }
  }

  private updateMetrics(duration: number, context: any, error: any) {
    // Update average response time
    const totalTime = this.metrics.avgResponseTime * (this.metrics.queryCount - 1) + duration;
    this.metrics.avgResponseTime = totalTime / this.metrics.queryCount;

    if (error) {
      this.metrics.errorCount++;
      console.error("Database error:", {
        context,
        error,
        duration,
        timestamp: new Date().toISOString(),
      });
    }

    // Send metrics to monitoring service (e.g., DataDog, New Relic)
    this.sendMetrics({
      ...context,
      duration,
      error: !!error,
      timestamp: Date.now(),
    });
  }

  private async sendMetrics(metrics: any) {
    // Implementation would depend on monitoring service
    // This is a placeholder for actual monitoring integration
    if (process.env.NODE_ENV === "production") {
      // await monitoringService.send(metrics)
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      slowQueries: this.metrics.slowQueries.slice(-10), // Last 10 slow queries
    };
  }

  // Health check for the database connection
  async healthCheck(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    latency: number;
    details: any;
  }> {
    const startTime = performance.now();

    try {
      const { data, error } = await this.supabase.from("questions").select("id").limit(1);

      const latency = performance.now() - startTime;

      if (error) {
        return {
          status: "unhealthy",
          latency,
          details: { error: error.message },
        };
      }

      return {
        status: latency > 500 ? "degraded" : "healthy",
        latency,
        details: { connectionPool: await connectionPool.getStats() },
      };
    } catch (error) {
      return {
        status: "unhealthy",
        latency: performance.now() - startTime,
        details: { error: String(error) },
      };
    }
  }
}

export const dbMonitor = new DatabaseMonitor();

// Middleware for automatic monitoring in API routes
export function withDatabaseMonitoring<T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  context: { operation: string; table?: string }
) {
  return async (...args: T): Promise<R> => {
    return dbMonitor.monitoredQuery(() => operation(...args) as any, context) as any;
  };
}
```

This comprehensive integration guide provides the foundation for effectively combining Supabase and PostgreSQL in the TCO application, ensuring optimal performance, security, and maintainability.
