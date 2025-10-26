# Supabase Database Guide

## Overview

Supabase provides a PostgreSQL database with real-time capabilities, automatic API generation, and built-in authentication. This guide covers essential database operations for the TCO application.

## Database Connection

### Client Setup

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Core Database Operations

### Select Data

```typescript
// Basic select
const { data, error } = await supabase.from("questions").select("*");

// Select specific columns
const { data, error } = await supabase.from("questions").select("id, question, difficulty");

// Select with filters
const { data, error } = await supabase
  .from("questions")
  .select("*")
  .eq("difficulty", "easy")
  .order("created_at", { ascending: false });
```

### Insert Data

```typescript
// Single insert
const { data, error } = await supabase.from("questions").insert({
  question: "What is Tanium?",
  difficulty: "easy",
  category: "overview",
});

// Multiple insert
const { data, error } = await supabase.from("questions").insert([
  { question: "Question 1", difficulty: "easy" },
  { question: "Question 2", difficulty: "medium" },
]);
```

### Update Data

```typescript
// Update with filter
const { data, error } = await supabase
  .from("user_progress")
  .update({ is_correct: true, time_taken: 45 })
  .eq("user_id", userId)
  .eq("question_id", questionId);
```

### Upsert (Insert or Update)

```typescript
// Upsert operation
const { data, error } = await supabase.from("user_statistics").upsert(
  {
    user_id: userId,
    category: "asking-questions",
    total_questions: 50,
    correct_answers: 42,
  },
  { onConflict: "user_id,category" }
);
```

### Delete Data

```typescript
const { error } = await supabase
  .from("exam_sessions")
  .delete()
  .eq("user_id", userId)
  .eq("session_type", "practice");
```

## Advanced Queries

### Filtering and Sorting

```typescript
// Multiple filters
const { data, error } = await supabase
  .from("questions")
  .select("*")
  .eq("difficulty", "medium")
  .in("category", ["asking-questions", "taking-action"])
  .order("created_at", { ascending: false })
  .limit(20);

// Text search
const { data, error } = await supabase
  .from("questions")
  .select("*")
  .textSearch("question", "Tanium", { type: "websearch" });
```

### Joins and Relations

```typescript
// Join with user progress
const { data, error } = await supabase
  .from("questions")
  .select(
    `
    *,
    user_progress!inner(
      is_correct,
      time_taken,
      selected_answer
    )
  `
  )
  .eq("user_progress.user_id", userId);
```

### Aggregation

```typescript
// Count records
const { count, error } = await supabase
  .from("questions")
  .select("*", { count: "exact", head: true })
  .eq("difficulty", "hard");

// Group by and aggregate
const { data, error } = await supabase.rpc("get_category_stats", { user_id: userId });
```

## Error Handling

### Standard Error Handling

```typescript
const handleDatabaseOperation = async () => {
  try {
    const { data, error } = await supabase.from("questions").select("*");

    if (error) {
      console.error("Database error:", error);
      throw new Error(`Database operation failed: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error("Operation failed:", err);
    // Fallback to localStorage or show user-friendly message
    return null;
  }
};
```

### Common Error Codes

- `PGRST116`: Table or view not found
- `PGRST201`: Authorization required
- `PGRST204`: Invalid query parameters
- `23505`: Unique constraint violation
- `23503`: Foreign key violation

## Performance Optimization

### Query Optimization

```typescript
// Use select() to limit columns
const { data } = await supabase
  .from("questions")
  .select("id, question") // Only fetch needed columns
  .limit(10);

// Use indexes effectively
const { data } = await supabase
  .from("user_progress")
  .select("*")
  .eq("user_id", userId) // user_id should be indexed
  .eq("question_id", questionId); // question_id should be indexed
```

### Caching Strategy

```typescript
class QuestionCache {
  private cache = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  async getQuestions(category?: string) {
    const key = category || "all";
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    // Fetch from database
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq(category ? "category" : undefined, category);

    if (!error) {
      this.cache.set(key, { data, timestamp: Date.now() });
    }

    return data;
  }
}
```

## Database Schema for TCO App

### Core Tables

1. **users** - Extended user profiles
2. **questions** - Exam questions with metadata
3. **user_progress** - Individual question responses
4. **exam_sessions** - User exam sessions
5. **user_statistics** - Aggregated performance metrics
6. **incorrect_answers** - Mistake tracking
7. **module_progress** - Module-specific progress
8. **user_settings** - User preferences

### Key Relationships

- `users.id` → `user_progress.user_id`
- `questions.id` → `user_progress.question_id`
- `users.id` → `exam_sessions.user_id`
- `users.id` → `user_statistics.user_id`

## Best Practices

1. **Always handle errors** - Check for `error` in every response
2. **Use TypeScript** - Generate types for better development experience
3. **Implement caching** - Cache frequently accessed data
4. **Optimize queries** - Select only needed columns, use proper indexes
5. **Use transactions** - For related operations that must succeed together
6. **Monitor performance** - Use Supabase dashboard to track query performance
7. **Implement retry logic** - Handle temporary network issues gracefully
