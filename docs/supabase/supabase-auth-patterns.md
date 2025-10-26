# Supabase Authentication Patterns

## Overview

Supabase Auth provides secure user authentication with built-in support for email/password, OAuth providers, and Row Level Security (RLS). This guide covers authentication patterns used in the TCO application.

## Authentication Setup

### Auth Client Configuration

```typescript
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
```

### Auth Context Pattern

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, name: string) => Promise<any>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        }
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}
```

## Authentication Methods

### Email/Password Authentication

```typescript
// Sign Up
const signUp = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
        role: "student",
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Sign In
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Sign Out
const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
};
```

### Session Management

```typescript
// Get current session
const getCurrentSession = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Error getting session:", error);
    return null;
  }

  return session;
};

// Refresh session
const refreshSession = async () => {
  const { data, error } = await supabase.auth.refreshSession();

  if (error) {
    console.error("Error refreshing session:", error);
    return null;
  }

  return data.session;
};

// Check if user is authenticated
const isAuthenticated = () => {
  const session = supabase.auth.getSession();
  return session !== null;
};
```

### User Profile Management

```typescript
// Get user profile
const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return data;
};

// Update user profile
const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  return data;
};
```

## Row Level Security (RLS)

### RLS Policies for TCO App

#### Users Table

```sql
-- Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

#### User Progress Table

```sql
-- Users can only access their own progress
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);
```

#### Exam Sessions Table

```sql
-- Users can only access their own exam sessions
CREATE POLICY "Users can view own sessions" ON exam_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON exam_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON exam_sessions
  FOR UPDATE USING (auth.uid() = user_id);
```

#### Questions Table (Public Read)

```sql
-- Questions are public, but only admins can modify
CREATE POLICY "Anyone can view questions" ON questions
  FOR SELECT USING (true);

-- Only service role can modify questions
-- (handled through service role key, not RLS)
```

## Protected Routes Pattern

### Route Protection Hook

```typescript
// hooks/useProtectedRoute.ts
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useProtectedRoute = (redirectTo = "/auth/login") => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  return { user, loading };
};
```

### Protected Page Component

```typescript
// components/ProtectedRoute.tsx
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return fallback || <div>Redirecting...</div>
  }

  return <>{children}</>
}
```

## Authentication Error Handling

### Common Auth Errors

```typescript
const handleAuthError = (error: any) => {
  switch (error.message) {
    case "Invalid login credentials":
      return "Invalid email or password. Please try again.";
    case "Email not confirmed":
      return "Please check your email and confirm your account.";
    case "User already registered":
      return "An account with this email already exists.";
    case "Password should be at least 6 characters":
      return "Password must be at least 6 characters long.";
    case "Signup disabled":
      return "Account registration is currently disabled.";
    default:
      return "An error occurred. Please try again later.";
  }
};

// Usage in components
const handleSignIn = async (email: string, password: string) => {
  try {
    setLoading(true);
    const { error } = await signIn(email, password);

    if (error) {
      setError(handleAuthError(error));
      return;
    }

    // Success - redirect handled by AuthContext
  } catch (err) {
    setError("An unexpected error occurred");
  } finally {
    setLoading(false);
  }
};
```

## Security Best Practices

### 1. Environment Variables

```env
# Public (exposed to client)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Private (server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Client-Side Security

```typescript
// Never expose service role key on client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Server-side only
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
```

### 3. Input Validation

```typescript
import { z } from "zod";

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).max(50),
});

const validateSignUp = (data: any) => {
  try {
    return signUpSchema.parse(data);
  } catch (error) {
    throw new Error("Invalid input data");
  }
};
```

### 4. Rate Limiting

```typescript
// Implement client-side rate limiting for auth attempts
class AuthRateLimit {
  private attempts = new Map<string, number>();
  private lockouts = new Map<string, number>();

  canAttempt(email: string): boolean {
    const now = Date.now();
    const lockoutTime = this.lockouts.get(email);

    if (lockoutTime && now < lockoutTime) {
      return false;
    }

    return true;
  }

  recordAttempt(email: string, success: boolean) {
    if (success) {
      this.attempts.delete(email);
      this.lockouts.delete(email);
      return;
    }

    const current = this.attempts.get(email) || 0;
    const newCount = current + 1;
    this.attempts.set(email, newCount);

    if (newCount >= 5) {
      // 15 minute lockout after 5 failed attempts
      this.lockouts.set(email, Date.now() + 15 * 60 * 1000);
    }
  }
}
```

## Integration with TCO App

### User Onboarding Flow

1. User signs up with email/password
2. Automatic user profile creation via database trigger
3. Initialize user statistics and preferences
4. Redirect to onboarding tutorial

### Data Migration on Authentication

```typescript
// Migrate localStorage data to user account on sign in
const migrateLocalData = async (userId: string) => {
  const localProgress = localStorage.getItem("tco_progress");
  const localSettings = localStorage.getItem("tco_settings");

  if (localProgress) {
    try {
      const progress = JSON.parse(localProgress);
      // Batch insert progress to database
      await supabase
        .from("user_progress")
        .upsert(progress.map((p: any) => ({ ...p, user_id: userId })));

      localStorage.removeItem("tco_progress");
    } catch (error) {
      console.error("Failed to migrate progress data:", error);
    }
  }

  if (localSettings) {
    try {
      const settings = JSON.parse(localSettings);
      await supabase.from("user_settings").upsert({ user_id: userId, ...settings });

      localStorage.removeItem("tco_settings");
    } catch (error) {
      console.error("Failed to migrate settings:", error);
    }
  }
};
```
