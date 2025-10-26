# Supabase JavaScript SDK Reference

## Overview

The Supabase JavaScript SDK provides a comprehensive client library for interacting with Supabase services including database operations, authentication, real-time subscriptions, and storage. This guide covers SDK usage patterns for the TCO application.

## Installation and Setup

### Installation

```bash
npm install @supabase/supabase-js
```

### Client Initialization

```typescript
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase"; // Generated types

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce", // Recommended for web apps
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
```

### TypeScript Configuration

```typescript
// types/supabase.ts - Generated from Supabase CLI
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          created_at: string;
          updated_at: string;
          last_login?: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          created_at?: string;
          updated_at?: string;
          last_login?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
          last_login?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          question: string;
          options: string[];
          correct_answer: string;
          explanation: string;
          difficulty: "easy" | "medium" | "hard";
          category: string;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question: string;
          options: string[];
          correct_answer: string;
          explanation: string;
          difficulty: "easy" | "medium" | "hard";
          category: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question?: string;
          options?: string[];
          correct_answer?: string;
          explanation?: string;
          difficulty?: "easy" | "medium" | "hard";
          category?: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      // ... other table definitions
    };
  };
}

// Utility types
export type Question = Database["public"]["Tables"]["questions"]["Row"];
export type UserProgress = Database["public"]["Tables"]["user_progress"]["Row"];
export type ExamSession = Database["public"]["Tables"]["exam_sessions"]["Row"];
```

## Database Operations

### Query Builder

```typescript
// Type-safe queries with query builder
const getQuestionsByCategory = async (category: string): Promise<Question[]> => {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch questions: ${error.message}`);
  }

  return data;
};

// Complex queries with joins
const getUserProgressWithQuestions = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_progress")
    .select(
      `
      *,
      questions!inner (
        question,
        correct_answer,
        explanation,
        difficulty,
        category
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch user progress: ${error.message}`);
  }

  return data;
};
```

### Insert Operations

```typescript
// Single insert with type safety
const saveUserProgress = async (progress: {
  user_id: string;
  question_id: string;
  is_correct: boolean;
  selected_answer: string;
  time_taken: number;
}) => {
  const { data, error } = await supabase.from("user_progress").insert(progress).select().single();

  if (error) {
    throw new Error(`Failed to save progress: ${error.message}`);
  }

  return data;
};

// Bulk insert
const saveBulkProgress = async (progressItems: any[]) => {
  const { data, error } = await supabase.from("user_progress").insert(progressItems).select();

  if (error) {
    throw new Error(`Failed to save bulk progress: ${error.message}`);
  }

  return data;
};
```

### Update Operations

```typescript
// Update with conditions
const updateUserStatistics = async (
  userId: string,
  category: string,
  updates: {
    total_questions?: number;
    correct_answers?: number;
    average_time?: number;
  }
) => {
  const { data, error } = await supabase
    .from("user_statistics")
    .update(updates)
    .eq("user_id", userId)
    .eq("category", category)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update statistics: ${error.message}`);
  }

  return data;
};

// Upsert operation
const upsertUserSettings = async (
  userId: string,
  settings: {
    theme?: "light" | "dark";
    sound_enabled?: boolean;
    difficulty_preference?: "easy" | "medium" | "hard";
  }
) => {
  const { data, error } = await supabase
    .from("user_settings")
    .upsert({ user_id: userId, ...settings }, { onConflict: "user_id" })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update settings: ${error.message}`);
  }

  return data;
};
```

### Advanced Query Patterns

```typescript
// Pagination
const getQuestionsPaginated = async (
  page: number = 1,
  pageSize: number = 20,
  category?: string
) => {
  let query = supabase
    .from("questions")
    .select("*", { count: "exact" })
    .range((page - 1) * pageSize, page * pageSize - 1)
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch questions: ${error.message}`);
  }

  return {
    data,
    count,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
};

// Text search
const searchQuestions = async (searchTerm: string) => {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .textSearch("question", searchTerm, {
      type: "websearch",
      config: "english",
    });

  if (error) {
    throw new Error(`Failed to search questions: ${error.message}`);
  }

  return data;
};

// Aggregation using RPC
const getUserStatsSummary = async (userId: string) => {
  const { data, error } = await supabase.rpc("get_user_stats_summary", { user_id: userId });

  if (error) {
    throw new Error(`Failed to get stats summary: ${error.message}`);
  }

  return data;
};
```

## Authentication Integration

### Auth State Management

```typescript
// Auth hooks with TypeScript
import { User, Session, AuthError } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export const useSupabaseAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
      });

      // Handle auth events
      switch (event) {
        case "SIGNED_IN":
          console.log("User signed in:", session?.user.email);
          break;
        case "SIGNED_OUT":
          console.log("User signed out");
          break;
        case "TOKEN_REFRESHED":
          console.log("Token refreshed");
          break;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return authState;
};
```

### Protected Queries

```typescript
// Queries that require authentication
const getProtectedUserData = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Authentication required");
  }

  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", session.user.id);

  if (error) {
    throw new Error(`Failed to fetch user data: ${error.message}`);
  }

  return data;
};
```

## Real-time Subscriptions

### Basic Subscription

```typescript
// Real-time progress tracking
export const useProgressSubscription = (userId: string) => {
  const [progress, setProgress] = useState<UserProgress[]>([]);

  useEffect(() => {
    if (!userId) return;

    const subscription = supabase
      .channel(`progress:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_progress",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Progress update:", payload);

          if (payload.eventType === "INSERT") {
            setProgress((prev) => [payload.new as UserProgress, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setProgress((prev) =>
              prev.map((item) =>
                item.id === payload.new.id ? (payload.new as UserProgress) : item
              )
            );
          } else if (payload.eventType === "DELETE") {
            setProgress((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return progress;
};
```

### Broadcast Messages

```typescript
// Real-time collaboration features
export const useExamRoomBroadcast = (roomId: string) => {
  const [participants, setParticipants] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const channel = supabase.channel(`exam-room:${roomId}`);

    channel
      .on("broadcast", { event: "participant-joined" }, (payload) => {
        setParticipants((prev) => [...prev, payload.participant]);
      })
      .on("broadcast", { event: "participant-left" }, (payload) => {
        setParticipants((prev) => prev.filter((p) => p.id !== payload.participantId));
      })
      .on("broadcast", { event: "message" }, (payload) => {
        setMessages((prev) => [...prev, payload.message]);
      })
      .subscribe();

    return () => channel.unsubscribe();
  }, [roomId]);

  const broadcastMessage = (message: string) => {
    supabase.channel(`exam-room:${roomId}`).send({
      type: "broadcast",
      event: "message",
      payload: {
        message: {
          id: Date.now(),
          text: message,
          timestamp: new Date().toISOString(),
        },
      },
    });
  };

  return { participants, messages, broadcastMessage };
};
```

## Error Handling Patterns

### Global Error Handler

```typescript
// Centralized error handling
class SupabaseError extends Error {
  code: string;
  details: string | null;
  hint: string | null;

  constructor(error: any) {
    super(error.message);
    this.name = "SupabaseError";
    this.code = error.code;
    this.details = error.details;
    this.hint = error.hint;
  }
}

export const handleSupabaseError = (error: any): never => {
  const supabaseError = new SupabaseError(error);

  // Log error for debugging
  console.error("Supabase Error:", {
    code: supabaseError.code,
    message: supabaseError.message,
    details: supabaseError.details,
    hint: supabaseError.hint,
  });

  // Handle specific error types
  switch (error.code) {
    case "PGRST116":
      throw new Error("Resource not found");
    case "23505":
      throw new Error("Duplicate entry - this record already exists");
    case "23503":
      throw new Error("Invalid reference - related record not found");
    case "PGRST301":
      throw new Error("Authentication required");
    default:
      throw supabaseError;
  }
};

// Usage in async functions
const safeQuery = async <T>(queryFn: () => Promise<{ data: T | null; error: any }>): Promise<T> => {
  const { data, error } = await queryFn();

  if (error) {
    handleSupabaseError(error);
  }

  if (!data) {
    throw new Error("No data returned from query");
  }

  return data;
};
```

### Retry Logic

```typescript
// Automatic retry for transient failures
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      const isRetryable = ["NETWORK_ERROR", "TIMEOUT", "CONNECTION_ERROR"].includes(error.code);

      if (attempt === maxAttempts || !isRetryable) {
        throw error;
      }

      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }

  throw new Error("Max retry attempts exceeded");
};

// Usage
const getQuestionsWithRetry = () =>
  withRetry(async () => {
    const { data, error } = await supabase.from("questions").select("*");

    if (error) {
      throw error;
    }

    return data;
  });
```

## Performance Optimization

### Query Optimization

```typescript
// Efficient queries with proper indexing
const getOptimizedUserProgress = async (userId: string) => {
  // Use composite index on (user_id, created_at)
  const { data, error } = await supabase
    .from("user_progress")
    .select(
      `
      id,
      is_correct,
      time_taken,
      created_at,
      questions!inner(
        id,
        difficulty,
        category
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50); // Limit results for performance

  if (error) {
    throw new Error(`Query failed: ${error.message}`);
  }

  return data;
};
```

### Connection Pooling

```typescript
// Connection pool configuration
const createOptimizedClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: {
        schema: "public",
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
      global: {
        headers: {
          "x-client-info": "tco-app@1.0.0",
        },
      },
    }
  );
};
```

### Caching Integration

```typescript
// React Query + Supabase integration
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useQuestions = (category?: string) => {
  return useQuery({
    queryKey: ["questions", category],
    queryFn: async () => {
      let query = supabase.from("questions").select("*").order("created_at", { ascending: false });

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (progress: any) => {
      const { data, error } = await supabase
        .from("user_progress")
        .insert(progress)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["user-progress"] });
      queryClient.invalidateQueries({ queryKey: ["user-statistics"] });
    },
  });
};
```

## Best Practices

### 1. Type Safety

- Always use generated TypeScript types
- Define proper interfaces for complex operations
- Use type guards for runtime validation

### 2. Error Handling

- Implement centralized error handling
- Use retry logic for transient failures
- Provide meaningful error messages to users

### 3. Performance

- Use select() to limit returned columns
- Implement proper caching strategies
- Optimize queries with appropriate filters

### 4. Security

- Never expose service role keys on client
- Use Row Level Security policies
- Validate all inputs before database operations

### 5. Real-time Features

- Clean up subscriptions properly
- Handle connection state changes
- Implement throttling for high-frequency updates
