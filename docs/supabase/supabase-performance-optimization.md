# Supabase Performance Optimization

## Overview

This guide covers performance optimization strategies for Supabase applications, focusing on database queries, real-time subscriptions, authentication, and overall application architecture for the TCO application.

## Database Query Optimization

### Indexing Strategies

#### Primary Indexes

```sql
-- Essential indexes for TCO application
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_question_id ON user_progress(question_id);
CREATE INDEX idx_user_progress_created_at ON user_progress(created_at DESC);

-- Composite indexes for common query patterns
CREATE INDEX idx_user_progress_user_question ON user_progress(user_id, question_id);
CREATE INDEX idx_user_progress_user_created ON user_progress(user_id, created_at DESC);

-- Statistics table indexes
CREATE INDEX idx_user_statistics_user_category ON user_statistics(user_id, category);

-- Exam sessions indexes
CREATE INDEX idx_exam_sessions_user_type ON exam_sessions(user_id, session_type);
CREATE INDEX idx_exam_sessions_created ON exam_sessions(created_at DESC);

-- Questions table indexes
CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_category_difficulty ON questions(category, difficulty);

-- Full-text search index
CREATE INDEX idx_questions_search ON questions USING gin(to_tsvector('english', question));
```

#### Partial Indexes

```sql
-- Index only active sessions
CREATE INDEX idx_active_exam_sessions ON exam_sessions(user_id, created_at DESC)
WHERE completed_at IS NULL;

-- Index only incorrect answers for review
CREATE INDEX idx_incorrect_answers_review ON user_progress(user_id, question_id)
WHERE is_correct = false;
```

### Query Optimization Patterns

#### Efficient SELECT Operations

```typescript
// BAD: Select all columns when only few are needed
const getAllData = async () => {
  const { data } = await supabase.from("questions").select("*"); // Fetches all columns unnecessarily
  return data;
};

// GOOD: Select only required columns
const getQuestionList = async () => {
  const { data } = await supabase
    .from("questions")
    .select("id, question, difficulty, category") // Only needed columns
    .limit(20);
  return data;
};

// EXCELLENT: Use specific indexes and limit results
const getOptimizedQuestions = async (category: string, limit: number = 20) => {
  const { data } = await supabase
    .from("questions")
    .select("id, question, difficulty")
    .eq("category", category) // Uses idx_questions_category
    .order("created_at", { ascending: false })
    .limit(limit);

  return data;
};
```

#### JOIN Optimization

```typescript
// BAD: Multiple round-trip queries
const getProgressWithQuestions = async (userId: string) => {
  const { data: progress } = await supabase.from("user_progress").select("*").eq("user_id", userId);

  const questionIds = progress?.map((p) => p.question_id) || [];
  const { data: questions } = await supabase.from("questions").select("*").in("id", questionIds);

  return { progress, questions };
};

// GOOD: Single query with JOIN
const getOptimizedProgressWithQuestions = async (userId: string) => {
  const { data } = await supabase
    .from("user_progress")
    .select(
      `
      id,
      is_correct,
      selected_answer,
      time_taken,
      created_at,
      questions!inner(
        id,
        question,
        correct_answer,
        difficulty,
        category
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  return data;
};
```

#### Aggregation Optimization

```sql
-- Create stored procedures for complex aggregations
CREATE OR REPLACE FUNCTION get_user_stats_summary(user_id UUID)
RETURNS TABLE(
  total_questions INTEGER,
  correct_answers INTEGER,
  average_score NUMERIC,
  time_spent INTEGER,
  categories_completed INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_questions,
    SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::INTEGER as correct_answers,
    ROUND(AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END) * 100, 2) as average_score,
    SUM(time_taken)::INTEGER as time_spent,
    COUNT(DISTINCT q.category)::INTEGER as categories_completed
  FROM user_progress up
  JOIN questions q ON up.question_id = q.id
  WHERE up.user_id = $1;
END;
$$ LANGUAGE plpgsql;
```

```typescript
// Use stored procedure for complex calculations
const getUserStatsSummary = async (userId: string) => {
  const { data, error } = await supabase.rpc("get_user_stats_summary", { user_id: userId });

  if (error) {
    throw new Error(`Failed to get stats: ${error.message}`);
  }

  return data?.[0] || null;
};
```

## Caching Strategies

### React Query Integration

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Question caching with stale-while-revalidate
export const useQuestions = (category?: string) => {
  return useQuery({
    queryKey: ["questions", category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("id, question, options, correct_answer, difficulty, category")
        .eq(category ? "category" : undefined, category)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
};

// User progress with optimistic updates
export const useUserProgress = (userId: string) => {
  return useQuery({
    queryKey: ["user-progress", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_progress")
        .select(
          `
          id,
          question_id,
          is_correct,
          selected_answer,
          time_taken,
          created_at
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!userId,
  });
};

export const useCreateProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (progress: {
      user_id: string;
      question_id: string;
      is_correct: boolean;
      selected_answer: string;
      time_taken: number;
    }) => {
      const { data, error } = await supabase
        .from("user_progress")
        .insert(progress)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newProgress) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["user-progress", newProgress.user_id] });

      const previousData = queryClient.getQueryData(["user-progress", newProgress.user_id]);

      queryClient.setQueryData(["user-progress", newProgress.user_id], (old: any) => {
        return [
          { ...newProgress, id: "temp-" + Date.now(), created_at: new Date().toISOString() },
          ...(old || []),
        ];
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(["user-progress", variables.user_id], context.previousData);
      }
    },
    onSuccess: (data, variables) => {
      // Update cache with server response
      queryClient.setQueryData(["user-progress", variables.user_id], (old: any) => {
        return [data, ...(old?.filter((item: any) => !item.id.startsWith("temp-")) || [])];
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["user-statistics", variables.user_id] });
    },
  });
};
```

### Local Storage Caching

```typescript
// Persistent cache with expiration
class PersistentCache {
  private prefix = "tco_cache_";
  private defaultTTL = 10 * 60 * 1000; // 10 minutes

  set(key: string, data: any, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    const cacheItem = {
      data,
      expiry,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn("Failed to cache data:", error);
    }
  }

  get(key: string): any | null {
    try {
      const cached = localStorage.getItem(this.prefix + key);
      if (!cached) return null;

      const cacheItem = JSON.parse(cached);

      if (Date.now() > cacheItem.expiry) {
        this.delete(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn("Failed to retrieve cached data:", error);
      return null;
    }
  }

  delete(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  clear(): void {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(this.prefix))
      .forEach((key) => localStorage.removeItem(key));
  }
}

export const cache = new PersistentCache();

// Usage in service layer
export class QuestionService {
  static async getQuestions(category?: string): Promise<Question[]> {
    const cacheKey = `questions_${category || "all"}`;

    // Try cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq(category ? "category" : undefined, category);

    if (error) {
      throw new Error(`Failed to fetch questions: ${error.message}`);
    }

    // Cache the result
    cache.set(cacheKey, data, 5 * 60 * 1000); // 5 minutes

    return data;
  }
}
```

## Real-time Performance

### Subscription Management

```typescript
class SubscriptionManager {
  private subscriptions = new Map<string, any>();
  private maxSubscriptions = 5;
  private cleanupInterval = 30 * 1000; // 30 seconds

  constructor() {
    // Periodic cleanup of inactive subscriptions
    setInterval(() => {
      this.cleanupInactive();
    }, this.cleanupInterval);
  }

  subscribe(
    key: string,
    config: any,
    callback: (payload: any) => void,
    options: { priority?: "high" | "normal"; ttl?: number } = {}
  ) {
    // Check subscription limit
    if (this.subscriptions.size >= this.maxSubscriptions) {
      this.removeLowestPriority();
    }

    // Clean up existing subscription with same key
    this.unsubscribe(key);

    const subscription = supabase.channel(key).on("postgres_changes", config, callback).subscribe();

    this.subscriptions.set(key, {
      subscription,
      priority: options.priority || "normal",
      createdAt: Date.now(),
      lastActivity: Date.now(),
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes default
    });

    return subscription;
  }

  unsubscribe(key: string) {
    const item = this.subscriptions.get(key);
    if (item) {
      item.subscription.unsubscribe();
      this.subscriptions.delete(key);
    }
  }

  updateActivity(key: string) {
    const item = this.subscriptions.get(key);
    if (item) {
      item.lastActivity = Date.now();
    }
  }

  private removeLowestPriority() {
    let lowestPriorityKey = null;
    let oldestTimestamp = Date.now();

    for (const [key, item] of this.subscriptions) {
      if (item.priority === "normal" && item.createdAt < oldestTimestamp) {
        oldestTimestamp = item.createdAt;
        lowestPriorityKey = key;
      }
    }

    if (lowestPriorityKey) {
      this.unsubscribe(lowestPriorityKey);
    }
  }

  private cleanupInactive() {
    const now = Date.now();
    const toRemove: string[] = [];

    for (const [key, item] of this.subscriptions) {
      if (now - item.lastActivity > item.ttl) {
        toRemove.push(key);
      }
    }

    toRemove.forEach((key) => this.unsubscribe(key));
  }

  unsubscribeAll() {
    for (const [key] of this.subscriptions) {
      this.unsubscribe(key);
    }
  }
}

export const subscriptionManager = new SubscriptionManager();
```

### Throttled Updates

```typescript
import { throttle, debounce } from "lodash-es";

// Throttle real-time UI updates
export const useThrottledRealtimeUpdates = (userId: string) => {
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [pendingUpdates, setPendingUpdates] = useState<UserProgress[]>([]);

  // Throttled update function - max once per second
  const throttledUpdate = useCallback(
    throttle((updates: UserProgress[]) => {
      setProgress((current) => {
        const newProgress = [...current];

        updates.forEach((update) => {
          const index = newProgress.findIndex((item) => item.id === update.id);
          if (index !== -1) {
            newProgress[index] = update;
          } else {
            newProgress.unshift(update);
          }
        });

        return newProgress.slice(0, 100); // Keep only recent 100 items
      });

      setPendingUpdates([]);
    }, 1000),
    []
  );

  useEffect(() => {
    if (!userId) return;

    const subscription = subscriptionManager.subscribe(
      `progress_${userId}`,
      {
        event: "*",
        schema: "public",
        table: "user_progress",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        subscriptionManager.updateActivity(`progress_${userId}`);

        if (payload.eventType === "INSERT") {
          setPendingUpdates((current) => [...current, payload.new as UserProgress]);
        }
      },
      { priority: "high" }
    );

    return () => {
      subscriptionManager.unsubscribe(`progress_${userId}`);
    };
  }, [userId]);

  // Apply throttled updates
  useEffect(() => {
    if (pendingUpdates.length > 0) {
      throttledUpdate(pendingUpdates);
    }
  }, [pendingUpdates, throttledUpdate]);

  return progress;
};
```

## Connection Optimization

### Connection Pooling

```typescript
// Connection pool configuration for server-side operations
import { createClient } from "@supabase/supabase-js";

class SupabaseConnectionPool {
  private pools = new Map<string, any>();
  private maxConnections = 10;

  getClient(type: "read" | "write" = "read") {
    const key = `${type}_pool`;

    if (!this.pools.has(key)) {
      const client = createClient(
        process.env.SUPABASE_URL!,
        type === "write" ? process.env.SUPABASE_SERVICE_ROLE_KEY! : process.env.SUPABASE_ANON_KEY!,
        {
          db: {
            schema: "public",
          },
          auth: {
            autoRefreshToken: type === "read",
            persistSession: type === "read",
          },
        }
      );

      this.pools.set(key, client);
    }

    return this.pools.get(key);
  }

  closeAll() {
    this.pools.clear();
  }
}

export const connectionPool = new SupabaseConnectionPool();
```

### Batch Operations

```typescript
// Batch multiple operations for efficiency
export class BatchProcessor {
  private batches = new Map<string, any[]>();
  private batchTimeout = 100; // ms
  private maxBatchSize = 50;

  async addToBatch(operation: string, data: any, processor: (batch: any[]) => Promise<void>) {
    if (!this.batches.has(operation)) {
      this.batches.set(operation, []);

      // Schedule batch processing
      setTimeout(() => {
        this.processBatch(operation, processor);
      }, this.batchTimeout);
    }

    const batch = this.batches.get(operation)!;
    batch.push(data);

    // Process immediately if batch is full
    if (batch.length >= this.maxBatchSize) {
      this.processBatch(operation, processor);
    }
  }

  private async processBatch(operation: string, processor: (batch: any[]) => Promise<void>) {
    const batch = this.batches.get(operation);
    if (!batch || batch.length === 0) return;

    this.batches.delete(operation);

    try {
      await processor(batch);
    } catch (error) {
      console.error(`Batch processing failed for ${operation}:`, error);
      // Could implement retry logic here
    }
  }
}

export const batchProcessor = new BatchProcessor();

// Usage example
export const batchSaveProgress = async (progressData: any) => {
  await batchProcessor.addToBatch("user_progress", progressData, async (batch) => {
    const { error } = await supabase.from("user_progress").insert(batch);

    if (error) {
      throw new Error(`Batch insert failed: ${error.message}`);
    }
  });
};
```

## Monitoring and Debugging

### Performance Monitoring

```typescript
class PerformanceMonitor {
  private metrics = new Map<string, any>();

  startTimer(operation: string) {
    this.metrics.set(operation, {
      startTime: performance.now(),
      operation,
    });
  }

  endTimer(operation: string, additionalData?: any) {
    const metric = this.metrics.get(operation);
    if (!metric) return;

    const duration = performance.now() - metric.startTime;

    const result = {
      operation,
      duration,
      timestamp: Date.now(),
      ...additionalData,
    };

    // Log slow operations (>1s)
    if (duration > 1000) {
      console.warn("Slow operation detected:", result);
    }

    // Store metrics for analysis
    this.storeMetric(result);

    this.metrics.delete(operation);

    return result;
  }

  private storeMetric(metric: any) {
    // In production, send to analytics service
    if (process.env.NODE_ENV === "development") {
      console.log("Performance metric:", metric);
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Usage wrapper for database operations
export const withPerformanceMonitoring = async <T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> => {
  performanceMonitor.startTimer(operation);

  try {
    const result = await fn();
    performanceMonitor.endTimer(operation, { success: true });
    return result;
  } catch (error) {
    performanceMonitor.endTimer(operation, {
      success: false,
      error: error.message,
    });
    throw error;
  }
};

// Usage in service methods
export const getQuestionsWithMonitoring = async (category?: string) => {
  return withPerformanceMonitoring("get_questions", async () => {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq(category ? "category" : undefined, category);

    if (error) throw error;
    return data;
  });
};
```

### Query Analysis

```typescript
// Development helper for query analysis
export const analyzeQuery = async (queryFn: () => Promise<any>) => {
  if (process.env.NODE_ENV !== "development") {
    return queryFn();
  }

  const startTime = performance.now();
  const startMemory = (performance as any).memory?.usedJSHeapSize || 0;

  try {
    const result = await queryFn();

    const endTime = performance.now();
    const endMemory = (performance as any).memory?.usedJSHeapSize || 0;

    console.log("Query Analysis:", {
      duration: `${(endTime - startTime).toFixed(2)}ms`,
      memoryDelta: `${((endMemory - startMemory) / 1024).toFixed(2)}KB`,
      resultSize: result?.length || "N/A",
    });

    return result;
  } catch (error) {
    console.error("Query failed:", error);
    throw error;
  }
};
```

## Best Practices Summary

### Database Optimization

1. **Create proper indexes** for all frequently queried columns
2. **Use composite indexes** for multi-column WHERE clauses
3. **Limit SELECT columns** to only what's needed
4. **Implement pagination** for large result sets
5. **Use stored procedures** for complex aggregations

### Caching Strategy

1. **Cache at multiple levels** (browser, React Query, localStorage)
2. **Implement cache invalidation** strategies
3. **Use stale-while-revalidate** patterns
4. **Set appropriate TTLs** based on data volatility

### Real-time Optimization

1. **Limit concurrent subscriptions** to prevent resource exhaustion
2. **Use throttling** for high-frequency updates
3. **Implement subscription cleanup** to prevent memory leaks
4. **Filter subscriptions** to relevant data only

### Connection Management

1. **Reuse client instances** instead of creating new ones
2. **Implement connection pooling** for server-side operations
3. **Use batch operations** for bulk data operations
4. **Monitor connection health** and implement reconnection logic

### Monitoring

1. **Track query performance** in development and production
2. **Monitor resource usage** (memory, network, CPU)
3. **Set up alerts** for performance degradation
4. **Analyze slow queries** and optimize accordingly
