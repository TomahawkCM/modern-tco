# Database Troubleshooting Guide - TCO Application

## 🚨 Common Issues & Quick Fixes

### Connection Issues

#### **Issue**: "Failed to connect to Supabase"

```typescript
// ❌ Error symptoms
Error: fetch failed
TypeError: fetch failed
    at node:internal/deps/undici/undici:12345:11
```

**Quick Fixes**:

1. **Check environment variables**:

   **PowerShell:**

   ```powershell
   $env:NEXT_PUBLIC_SUPABASE_URL
   $env:NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

   **Unix/Linux:**

   ```bash
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

2. **Verify URL format**:

   ```typescript
   // ✅ Correct format
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

   // ❌ Common mistakes
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co/ // trailing slash
   NEXT_PUBLIC_SUPABASE_URL=your-project-id.supabase.co // missing https://
   ```

3. **Test connection manually**:

   ```typescript
   const testConnection = async () => {
     try {
       const { data, error } = await supabase
         .from("questions")
         .select("count", { count: "exact", head: true });

       console.log("Connection test:", { data, error });
     } catch (err) {
       console.error("Connection failed:", err);
     }
   };
   ```

#### **Issue**: "Invalid API key"

```typescript
// ❌ Error symptoms
{
  "code": 401,
  "message": "Invalid API key"
}
```

**Quick Fixes**:

1. **Regenerate API keys** in Supabase Dashboard → Settings → API
2. **Check key type**:

   ```typescript
   // ✅ Use anon key for client-side
   const supabase = createClient(url, anonKey);

   // ✅ Use service role for server-side admin operations
   const supabaseAdmin = createClient(url, serviceRoleKey);
   ```

---

### Authentication Issues

#### **Issue**: "User not authenticated" / RLS blocking queries

```typescript
// ❌ Error symptoms
{
  "code": "42501",
  "message": "new row violates row-level security policy"
}
```

**Diagnostic Steps**:

```typescript
// 1. Check auth state
const {
  data: { user },
} = await supabase.auth.getUser();
console.log("Current user:", user);

// 2. Check session
const {
  data: { session },
} = await supabase.auth.getSession();
console.log("Session valid:", !!session);

// 3. Test RLS policy
const { data, error } = await supabase.from("user_progress").select("*").eq("user_id", user?.id);
console.log("RLS test:", { data, error });
```

**Quick Fixes**:

1. **Ensure user is authenticated before queries**:

   ```typescript
   const requireAuth = async () => {
     const {
       data: { user },
     } = await supabase.auth.getUser();
     if (!user) {
       throw new Error("Authentication required");
     }
     return user;
   };
   ```

2. **Bypass RLS for admin operations**:

   ```typescript
   // Use service role client for admin operations
   const { data, error } = await supabaseAdmin.from("questions").select("*"); // Bypasses RLS
   ```

3. **Fix policy issues**:

   ```sql
   -- Check existing policies
   SELECT * FROM pg_policies WHERE tablename = 'user_progress';

   -- Temporarily disable RLS for debugging (DANGER: Don't use in production)
   ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;

   -- Re-enable after fixing
   ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
   ```

---

### Query Performance Issues

#### **Issue**: Slow query performance

```typescript
// ❌ Symptoms
Query taking > 5 seconds
High CPU usage
Browser hanging during queries
```

**Diagnostic Tools**:

```sql
-- 1. Check running queries
SELECT
  pid,
  now() - pg_stat_activity.query_start AS duration,
  query,
  state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 seconds';

-- 2. Analyze query plan
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM questions
WHERE metadata->>'domain' = 'asking_questions';

-- 3. Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

**Quick Fixes**:

1. **Add missing indexes**:

   ```sql
   -- For domain filtering
   CREATE INDEX idx_questions_domain ON questions ((metadata->>'domain'));

   -- For full-text search
   CREATE INDEX idx_questions_fts ON questions
   USING gin (to_tsvector('english', title || ' ' || content));
   ```

2. **Optimize queries**:

   ```typescript
   // ❌ Inefficient
   const { data } = await supabase
     .from("questions")
     .select("*") // Selects all columns
     .eq("is_active", true);

   // ✅ Optimized
   const { data } = await supabase
     .from("questions")
     .select("id, title, difficulty") // Only needed columns
     .eq("is_active", true)
     .limit(20); // Pagination
   ```

3. **Use database functions**:

   ```typescript
   // ❌ Multiple round trips
   const users = await supabase.from("users").select("*");
   for (const user of users) {
     const progress = await supabase.from("user_progress").select("*").eq("user_id", user.id);
   }

   // ✅ Single optimized query
   const { data } = await supabase.rpc("get_user_analytics", {
     user_ids: userIds,
   });
   ```

---

### Real-time Subscription Issues

#### **Issue**: Real-time updates not working

```typescript
// ❌ Symptoms
Subscriptions not triggering
Changes not reflected in real-time
Connection timeouts
```

**Diagnostic Steps**:

```typescript
// 1. Check subscription status
const channel = supabase.channel("test-channel");
channel.subscribe((status) => {
  console.log("Subscription status:", status);
});

// 2. Test basic subscription
const subscription = supabase
  .channel("user_progress_test")
  .on("postgres_changes", { event: "*", schema: "public", table: "user_progress" }, (payload) => {
    console.log("Change received:", payload);
  })
  .subscribe();

// 3. Check connection state
console.log("Realtime connection:", supabase.realtime.getConnections());
```

**Quick Fixes**:

1. **Enable realtime on table**:

   ```sql
   -- Enable realtime replication
   ALTER PUBLICATION supabase_realtime ADD TABLE user_progress;
   ALTER PUBLICATION supabase_realtime ADD TABLE exam_sessions;
   ```

2. **Fix subscription filters**:

   ```typescript
   // ❌ Too broad filter
   .on('postgres_changes', { event: '*', schema: 'public' }, callback)

   // ✅ Specific filter
   .on(
     'postgres_changes',
     {
       event: 'UPDATE',
       schema: 'public',
       table: 'user_progress',
       filter: `user_id=eq.${userId}`
     },
     callback
   )
   ```

3. **Handle connection issues**:

   ```typescript
   const createResilientSubscription = (userId: string) => {
     const channel = supabase.channel(`user-${userId}`);

     channel
       .on("presence", { event: "sync" }, () => {
         console.log("Presence synced");
       })
       .on("presence", { event: "join" }, ({ key, newPresences }) => {
         console.log("User joined:", newPresences);
       })
       .on(
         "postgres_changes",
         { event: "*", schema: "public", table: "user_progress" },
         (payload) => {
           console.log("Progress updated:", payload);
         }
       )
       .subscribe(async (status) => {
         if (status === "SUBSCRIBED") {
           console.log("Successfully subscribed");
         } else if (status === "CHANNEL_ERROR") {
           console.error("Subscription error, retrying in 5s...");
           setTimeout(() => {
             channel.subscribe();
           }, 5000);
         }
       });

     return channel;
   };
   ```

---

### Data Integrity Issues

#### **Issue**: Foreign key constraint violations

```sql
-- ❌ Error symptoms
ERROR: insert or update on table "user_answers" violates foreign key constraint
DETAIL: Key (question_id)=(non-existent-id) is not present in table "questions"
```

**Quick Fixes**:

1. **Validate references before insert**:

   ```typescript
   const createUserAnswer = async (questionId: string, userId: string, answer: string) => {
     // 1. Check if question exists
     const { data: question } = await supabase
       .from("questions")
       .select("id")
       .eq("id", questionId)
       .single();

     if (!question) {
       throw new Error(`Question ${questionId} does not exist`);
     }

     // 2. Create answer
     const { data, error } = await supabase.from("user_answers").insert({
       user_id: userId,
       question_id: questionId,
       user_answer: answer,
       is_correct: false, // Calculate this properly
     });

     return { data, error };
   };
   ```

2. **Use transactions for related inserts**:

   ```typescript
   const createExamSession = async (userId: string, answers: Array<any>) => {
     const { data: session, error: sessionError } = await supabase
       .from("exam_sessions")
       .insert({
         user_id: userId,
         started_at: new Date().toISOString(),
         status: "in_progress",
       })
       .select()
       .single();

     if (sessionError) throw sessionError;

     // Insert all answers with session reference
     const answerInserts = answers.map((answer) => ({
       ...answer,
       exam_session_id: session.id,
     }));

     const { error: answersError } = await supabase.from("user_answers").insert(answerInserts);

     if (answersError) {
       // Cleanup session if answers fail
       await supabase.from("exam_sessions").delete().eq("id", session.id);
       throw answersError;
     }

     return session;
   };
   ```

#### **Issue**: Duplicate key violations

```sql
-- ❌ Error symptoms
ERROR: duplicate key value violates unique constraint
DETAIL: Key (user_id, domain)=(user-id, asking_questions) already exists.
```

**Quick Fixes**:

1. **Use upsert operations**:

   ```typescript
   // ❌ Can cause duplicates
   const { data, error } = await supabase
     .from("user_progress")
     .insert({ user_id: userId, domain: "asking_questions" });

   // ✅ Upsert to handle duplicates
   const { data, error } = await supabase
     .from("user_progress")
     .upsert(
       { user_id: userId, domain: "asking_questions", questions_answered: 1 },
       { onConflict: "user_id,domain" }
     );
   ```

2. **Check existence before insert**:

   ```typescript
   const updateOrCreateProgress = async (userId: string, domain: string) => {
     const { data: existing } = await supabase
       .from("user_progress")
       .select("id")
       .eq("user_id", userId)
       .eq("domain", domain)
       .single();

     if (existing) {
       // Update existing record
       return await supabase
         .from("user_progress")
         .update({ questions_answered: supabase.sql("questions_answered + 1") })
         .eq("id", existing.id);
     } else {
       // Create new record
       return await supabase.from("user_progress").insert({ user_id: userId, domain: domain });
     }
   };
   ```

---

### Type Safety Issues

#### **Issue**: TypeScript type errors with Supabase

```typescript
// ❌ Type errors
Property 'metadata' does not exist on type 'Questions'
Argument of type 'string' is not assignable to parameter of type 'Json'
```

**Quick Fixes**:

1. **Regenerate types**:

   ```bash
   supabase gen types typescript --project-id your-project-id > types/supabase.ts
   ```

2. **Use proper type assertions**:

   ```typescript
   // ❌ Unsafe
   const metadata = question.metadata as any;

   // ✅ Type-safe
   interface QuestionMetadata {
     type: "multiple_choice" | "essay";
     difficulty: "beginner" | "intermediate" | "advanced";
     domain: string;
     weight: number;
   }

   const metadata = question.metadata as QuestionMetadata;
   ```

3. **Create type-safe helpers**:

   ```typescript
   // Type-safe query builder
   type QuestionSelect = Database["public"]["Tables"]["questions"]["Row"];

   const getQuestionsByDomain = async (domain: string): Promise<QuestionSelect[]> => {
     const { data, error } = await supabase
       .from("questions")
       .select("*")
       .eq("domain", domain)
       .returns<QuestionSelect[]>();

     if (error) throw error;
     return data || [];
   };
   ```

---

### Environment & Deployment Issues

#### **Issue**: Environment variables not loading

```typescript
// ❌ Symptoms
undefined environment variables
Connection fails in production
Works locally but not deployed
```

**Diagnostic Steps**:

```typescript
// Add to your app for debugging
console.log("Environment check:", {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing",
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Missing",
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_ENV: process.env.VERCEL_ENV, // If using Vercel
});
```

**Quick Fixes**:

1. **Check environment variable naming**:

   ```bash
   # ✅ Client-side variables need NEXT_PUBLIC_ prefix
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

   # ✅ Server-only variables don't need prefix
   SUPABASE_SERVICE_ROLE_KEY=your-service-key
   DATABASE_URL=postgresql://...
   ```

2. **Verify deployment environment**:
   - Vercel: Check Environment Variables in dashboard
   - Netlify: Check Site Settings → Environment Variables
   - Railway: Check Variables tab

3. **Create fallback configuration**:

   ```typescript
   const supabaseUrl =
     process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "http://localhost:54321"; // Local fallback

   const supabaseKey =
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
     process.env.SUPABASE_ANON_KEY ||
     "your-local-anon-key";
   ```

---

## 🛠️ Debug Tools & Scripts

### Connection Test Script

```typescript
// scripts/test-connection.ts
import { createClient } from "@supabase/supabase-js";

const testConnection = async () => {
  console.log("🔍 Testing Supabase connection...\n");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // Test 1: Basic connection
    console.log("1. Testing basic connection...");
    const { data, error } = await supabase
      .from("questions")
      .select("count", { count: "exact", head: true });

    if (error) throw error;
    console.log("✅ Connection successful");
    console.log(`📊 Questions count: ${data[0]?.count || 0}`);

    // Test 2: Authentication
    console.log("\n2. Testing authentication...");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log(user ? "✅ User authenticated" : "⚠️ No authenticated user");

    // Test 3: Real-time
    console.log("\n3. Testing real-time connection...");
    const channel = supabase.channel("test");
    const status = await new Promise((resolve) => {
      channel.subscribe(resolve);
      setTimeout(() => resolve("timeout"), 5000);
    });
    console.log(status === "SUBSCRIBED" ? "✅ Real-time connected" : "❌ Real-time failed");
  } catch (error) {
    console.error("❌ Connection failed:", error);
  }
};

testConnection();
```

### Performance Monitor

```typescript
// lib/debug/performance-monitor.ts
export class PerformanceMonitor {
  private queries: Array<{
    query: string;
    duration: number;
    timestamp: Date;
    success: boolean;
  }> = [];

  logQuery<T>(
    operation: () => Promise<T>,
    context: { operation: string; table?: string }
  ): Promise<T> {
    const start = performance.now();

    return operation()
      .then((result) => {
        const duration = performance.now() - start;
        this.queries.push({
          query: `${context.operation}${context.table ? ` on ${context.table}` : ""}`,
          duration,
          timestamp: new Date(),
          success: true,
        });

        if (duration > 1000) {
          console.warn(`🐌 Slow query (${duration.toFixed(2)}ms):`, context);
        }

        return result;
      })
      .catch((error) => {
        const duration = performance.now() - start;
        this.queries.push({
          query: `${context.operation}${context.table ? ` on ${context.table}` : ""}`,
          duration,
          timestamp: new Date(),
          success: false,
        });

        console.error("❌ Query failed:", { context, error, duration });
        throw error;
      });
  }

  getReport() {
    const successful = this.queries.filter((q) => q.success);
    const failed = this.queries.filter((q) => !q.success);
    const slow = this.queries.filter((q) => q.duration > 1000);

    return {
      total: this.queries.length,
      successful: successful.length,
      failed: failed.length,
      slow: slow.length,
      avgDuration: successful.reduce((sum, q) => sum + q.duration, 0) / successful.length,
      slowestQuery: this.queries.sort((a, b) => b.duration - a.duration)[0],
      recentErrors: failed.slice(-5),
    };
  }
}

export const perfMonitor = new PerformanceMonitor();
```

### Health Check Endpoint

```typescript
// pages/api/health.ts
import { supabase } from "@/lib/supabase";

export default async function handler(req: any, res: any) {
  const startTime = Date.now();

  try {
    // Database connectivity test
    const { data, error } = await supabase
      .from("questions")
      .select("count", { count: "exact", head: true });

    if (error) throw error;

    const responseTime = Date.now() - startTime;

    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: "ok",
          responseTime: `${responseTime}ms`,
          recordCount: data?.[0]?.count || 0,
        },
        environment: {
          SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          NODE_ENV: process.env.NODE_ENV,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: String(error),
    });
  }
}
```

This troubleshooting guide covers the most common database issues encountered in the TCO application and provides actionable solutions for quick resolution.
