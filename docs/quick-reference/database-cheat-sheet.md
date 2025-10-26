# Database Quick Reference Cheat Sheet - TCO Application

## 🚀 Quick Commands

### Supabase Client Setup

```typescript
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Basic CRUD Operations

```typescript
// CREATE
const { data, error } = await supabase
  .from("questions")
  .insert({ title: "New Question", content: "..." })
  .select();

// READ
const { data, error } = await supabase
  .from("questions")
  .select("*")
  .eq("domain", "asking_questions")
  .order("created_at", { ascending: false });

// UPDATE
const { data, error } = await supabase
  .from("user_progress")
  .update({ correct_answers: 15 })
  .eq("user_id", userId)
  .select();

// DELETE (soft delete pattern)
const { data, error } = await supabase
  .from("questions")
  .update({ is_active: false })
  .eq("id", questionId);
```

## 📊 Database Schema Quick Reference

### Core Tables

| Table           | Primary Key | Key Columns                            | Purpose            |
| --------------- | ----------- | -------------------------------------- | ------------------ |
| `users`         | `id` (UUID) | `email`, `role`, `is_active`           | User management    |
| `questions`     | `id` (UUID) | `domain`, `difficulty`, `metadata`     | Question bank      |
| `user_progress` | `id` (UUID) | `user_id`, `domain`, `accuracy`        | Progress tracking  |
| `exam_sessions` | `id` (UUID) | `user_id`, `score`, `completed_at`     | Exam records       |
| `user_answers`  | `id` (UUID) | `user_id`, `question_id`, `is_correct` | Individual answers |

### Relationships

```sql
-- Foreign Key Relationships
user_progress.user_id → users.id
exam_sessions.user_id → users.id
user_answers.user_id → users.id
user_answers.question_id → questions.id
user_answers.exam_session_id → exam_sessions.id (optional)
```

## 🔍 Common Queries

### User Analytics

```typescript
// Get user progress summary
const { data } = await supabase
  .from("user_progress")
  .select(
    `
    domain,
    questions_answered,
    correct_answers,
    current_streak,
    last_activity
  `
  )
  .eq("user_id", userId);

// Calculate accuracy percentage
const accuracy = (correct_answers / questions_answered) * 100;
```

### Question Filtering

```typescript
// Filter by domain and difficulty
const { data } = await supabase
  .from("questions")
  .select("*")
  .eq("domain", "asking_questions")
  .eq("difficulty", "intermediate")
  .eq("is_active", true)
  .limit(20);

// Search questions with full-text search
const { data } = await supabase.rpc("search_questions", {
  search_query: "tanium sensor",
  domain_filter: "asking_questions",
  limit_count: 10,
});
```

### Real-time Subscriptions

```typescript
// Subscribe to progress updates
const subscription = supabase
  .channel("user_progress")
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "user_progress",
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      console.log("Progress updated:", payload.new);
    }
  )
  .subscribe();
```

## 🎯 TCO Domain Reference

### Certification Domains

| Domain               | Weight | Description                  | Question Count |
| -------------------- | ------ | ---------------------------- | -------------- |
| `asking_questions`   | 22%    | Query construction & sensors | ~25 questions  |
| `refining_questions` | 23%    | Targeting & computer groups  | ~25 questions  |
| `taking_action`      | 15%    | Package deployment & actions | ~18 questions  |
| `navigation_modules` | 23%    | Console navigation & modules | ~25 questions  |
| `reporting_data`     | 17%    | Reports & data export        | ~20 questions  |

### Difficulty Levels

- **`beginner`**: Basic concepts, 60-80% accuracy expected
- **`intermediate`**: Applied knowledge, 70-85% accuracy expected
- **`advanced`**: Complex scenarios, 80-95% accuracy expected

## 🔐 Authentication Quick Reference

### Auth Operations

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "password",
  options: {
    data: {
      full_name: "John Doe",
      role: "student",
    },
  },
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "password",
});

// Get current user
const {
  data: { user },
} = await supabase.auth.getUser();

// Sign out
const { error } = await supabase.auth.signOut();
```

### Row Level Security

```sql
-- User can only see own progress
CREATE POLICY "user_progress_isolation" ON user_progress
  FOR ALL USING (auth.uid() = user_id);

-- Questions visible to authenticated users
CREATE POLICY "questions_read_all" ON questions
  FOR SELECT USING (auth.role() = 'authenticated');
```

## ⚡ Performance Tips

### Indexing Strategy

```sql
-- Composite indexes for common queries
CREATE INDEX idx_questions_domain_difficulty
ON questions (domain, difficulty) WHERE is_active = true;

-- JSONB indexes for metadata queries
CREATE INDEX idx_questions_metadata_gin
ON questions USING gin (metadata);

-- Full-text search indexes
CREATE INDEX idx_questions_content_fts
ON questions USING gin (to_tsvector('english', title || ' ' || content));
```

### Query Optimization

```typescript
// Use select() to limit columns
const { data } = await supabase
  .from("questions")
  .select("id, title, difficulty") // Only needed columns
  .eq("domain", "asking_questions");

// Use limit() for pagination
const { data } = await supabase
  .from("questions")
  .select("*")
  .range(0, 19) // First 20 results
  .order("created_at", { ascending: false });

// Use single() for unique results
const { data } = await supabase
  .from("user_progress")
  .select("*")
  .eq("user_id", userId)
  .eq("domain", "asking_questions")
  .single();
```

## 🛠️ Utility Functions

### Custom PostgreSQL Functions

```sql
-- Calculate adaptive difficulty
SELECT * FROM calculate_adaptive_difficulty(
  'user-uuid',
  'asking_questions'
);

-- Analyze user performance
SELECT analyze_user_performance(
  'user-uuid',
  '30 days'::INTERVAL
);

-- Search questions with ranking
SELECT * FROM search_questions(
  'tanium sensor performance',
  'asking_questions',
  'intermediate',
  20
);
```

### TypeScript Helpers

```typescript
// Type-safe query builder
type QuestionFilters = {
  domain?: string;
  difficulty?: string;
  isActive?: boolean;
  limit?: number;
};

const buildQuestionQuery = (filters: QuestionFilters) => {
  let query = supabase.from("questions").select("*");

  if (filters.domain) query = query.eq("domain", filters.domain);
  if (filters.difficulty) query = query.eq("difficulty", filters.difficulty);
  if (filters.isActive !== undefined) query = query.eq("is_active", filters.isActive);
  if (filters.limit) query = query.limit(filters.limit);

  return query;
};
```

## 🚨 Error Handling

### Common Error Patterns

```typescript
// Handle auth errors
const handleAuthError = (error: any) => {
  switch (error?.message) {
    case "Invalid login credentials":
      return "Email or password is incorrect";
    case "Email not confirmed":
      return "Please check your email and confirm your account";
    default:
      return "Authentication failed. Please try again.";
  }
};

// Handle database errors
const handleDatabaseError = (error: any) => {
  if (error?.code === "PGRST116") {
    return "No data found";
  }
  if (error?.code === "23505") {
    return "This record already exists";
  }
  return "Database error occurred";
};

// Retry logic for network errors
const withRetry = async <T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error("Max retries exceeded");
};
```

## 📱 Environment Variables

### Required Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional for local development
SUPABASE_LOCAL_URL=http://localhost:54321
SUPABASE_LOCAL_ANON_KEY=your-local-anon-key

# Database direct connection (if needed)
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

## 🔄 Migration Commands

### Supabase CLI Commands

```bash
# Initialize Supabase
supabase init

# Start local development
supabase start

# Create new migration
supabase migration new create_questions_table

# Apply migrations
supabase db push

# Reset database
supabase db reset

# Generate TypeScript types
supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

## 📈 Monitoring Queries

### Performance Monitoring

```sql
-- Check slow queries
SELECT query, calls, total_time, mean_time, rows
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Check database size
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename) DESC;
```

### Application Metrics

```typescript
// Monitor query performance
const startTime = performance.now();
const { data, error } = await supabase.from("questions").select("*");
const duration = performance.now() - startTime;
console.log(`Query took ${duration}ms`);

// Track cache hit rates
const cacheStats = questionCache.getStats();
console.log(`Cache hit rate: ${((cacheStats.totalHits / cacheStats.size) * 100).toFixed(2)}%`);
```

## 🎛️ Configuration Presets

### Development Configuration

```typescript
const devConfig = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: { eventsPerSecond: 20 },
  },
};
```

### Production Configuration

```typescript
const prodConfig = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // Security improvement
  },
  realtime: {
    params: { eventsPerSecond: 10 }, // Rate limiting
  },
  global: {
    headers: {
      "X-Client-Info": "tco-study-app/1.0.0",
    },
  },
};
```

This cheat sheet provides quick access to the most commonly used database operations and configurations for the TCO application.
