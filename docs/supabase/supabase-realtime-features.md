# Supabase Real-time Features

## Overview

Supabase provides real-time functionality through PostgreSQL's built-in LISTEN/NOTIFY and WebSocket connections. This enables live updates across connected clients for collaborative and dynamic applications.

## Real-time Setup

### Enable Real-time for Tables

```sql
-- Enable real-time for specific tables
ALTER TABLE user_progress REPLICA IDENTITY FULL;
ALTER TABLE exam_sessions REPLICA IDENTITY FULL;
ALTER TABLE user_statistics REPLICA IDENTITY FULL;

-- Enable real-time replication
ALTER PUBLICATION supabase_realtime ADD TABLE user_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE exam_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE user_statistics;
```

### Client Configuration

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    realtime: {
      params: {
        eventsPerSecond: 10, // Rate limiting
      },
    },
  }
);
```

## Real-time Subscriptions

### Basic Subscription Pattern

```typescript
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface UserProgress {
  id: string;
  user_id: string;
  question_id: string;
  is_correct: boolean;
  selected_answer: string;
  time_taken: number;
  created_at: string;
}

export function useRealtimeProgress(userId: string) {
  const [progress, setProgress] = useState<UserProgress[]>([]);

  useEffect(() => {
    // Initial data fetch
    const fetchProgress = async () => {
      const { data } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (data) setProgress(data);
    };

    fetchProgress();

    // Set up real-time subscription
    const subscription = supabase
      .channel("user_progress_changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "user_progress",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Real-time update:", payload);

          if (payload.eventType === "INSERT") {
            setProgress((current) => [payload.new as UserProgress, ...current]);
          } else if (payload.eventType === "UPDATE") {
            setProgress((current) =>
              current.map((item) =>
                item.id === payload.new.id ? (payload.new as UserProgress) : item
              )
            );
          } else if (payload.eventType === "DELETE") {
            setProgress((current) => current.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return progress;
}
```

### Real-time Statistics Updates

```typescript
export function useRealtimeStats(userId: string) {
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    const subscription = supabase
      .channel("user_stats_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_statistics",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            setStats((current) => {
              const existing = current.find((item) => item.category === payload.new.category);

              if (existing) {
                return current.map((item) =>
                  item.category === payload.new.category ? payload.new : item
                );
              } else {
                return [...current, payload.new];
              }
            });
          }
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [userId]);

  return stats;
}
```

## Advanced Real-time Patterns

### Presence System

```typescript
// Track online users in real-time
export function usePresence(userId: string, userName: string) {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  useEffect(() => {
    const channel = supabase.channel("online_users", {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const newState = channel.presenceState();
        const users = Object.keys(newState).map((key) => ({
          id: key,
          ...newState[key][0],
        }));
        setOnlineUsers(users);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("User joined:", key, newPresences);
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("User left:", key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: userId,
            name: userName,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [userId, userName]);

  return onlineUsers;
}
```

### Collaborative Features

```typescript
// Real-time collaborative exam sessions
export function useCollaborativeExam(sessionId: string) {
  const [participants, setParticipants] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);

  useEffect(() => {
    const channel = supabase.channel(`exam_session_${sessionId}`);

    // Listen for question changes
    channel
      .on("broadcast", { event: "question_change" }, (payload) => {
        setCurrentQuestion(payload.questionIndex);
      })
      .on("broadcast", { event: "participant_joined" }, (payload) => {
        setParticipants((current) => [...current, payload.participant]);
      })
      .on("broadcast", { event: "participant_answer" }, (payload) => {
        console.log("Participant answered:", payload);
        // Update participant status
      })
      .subscribe();

    return () => channel.unsubscribe();
  }, [sessionId]);

  const broadcastQuestionChange = (questionIndex: number) => {
    supabase.channel(`exam_session_${sessionId}`).send({
      type: "broadcast",
      event: "question_change",
      payload: { questionIndex },
    });
  };

  const broadcastAnswer = (answer: string, timeSpent: number) => {
    supabase.channel(`exam_session_${sessionId}`).send({
      type: "broadcast",
      event: "participant_answer",
      payload: { answer, timeSpent, timestamp: Date.now() },
    });
  };

  return {
    participants,
    currentQuestion,
    broadcastQuestionChange,
    broadcastAnswer,
  };
}
```

## Real-time Context Integration

### Database Context with Real-time

```typescript
// contexts/DatabaseContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'

interface DatabaseContextType {
  progress: any[]
  statistics: any[]
  isOnline: boolean
  syncStatus: 'idle' | 'syncing' | 'error'
}

const DatabaseContext = createContext<DatabaseContextType>({} as DatabaseContextType)

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [progress, setProgress] = useState<any[]>([])
  const [statistics, setStatistics] = useState<any[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle')

  useEffect(() => {
    if (!user) return

    let progressSubscription: any
    let statsSubscription: any

    const setupRealtimeSubscriptions = async () => {
      setSyncStatus('syncing')

      try {
        // Initial data fetch
        const [progressResult, statsResult] = await Promise.all([
          supabase.from('user_progress').select('*').eq('user_id', user.id),
          supabase.from('user_statistics').select('*').eq('user_id', user.id)
        ])

        if (progressResult.data) setProgress(progressResult.data)
        if (statsResult.data) setStatistics(statsResult.data)

        // Set up real-time subscriptions
        progressSubscription = supabase
          .channel('progress_realtime')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'user_progress',
              filter: `user_id=eq.${user.id}`,
            },
            handleProgressChange
          )
          .subscribe()

        statsSubscription = supabase
          .channel('stats_realtime')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'user_statistics',
              filter: `user_id=eq.${user.id}`,
            },
            handleStatsChange
          )
          .subscribe()

        setSyncStatus('idle')
        setIsOnline(true)

      } catch (error) {
        console.error('Failed to set up real-time subscriptions:', error)
        setSyncStatus('error')
        setIsOnline(false)
      }
    }

    const handleProgressChange = (payload: any) => {
      if (payload.eventType === 'INSERT') {
        setProgress((current) => [payload.new, ...current])
      } else if (payload.eventType === 'UPDATE') {
        setProgress((current) =>
          current.map((item) =>
            item.id === payload.new.id ? payload.new : item
          )
        )
      }
    }

    const handleStatsChange = (payload: any) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        setStatistics((current) => {
          const existing = current.find(
            (item) => item.category === payload.new.category
          )

          if (existing) {
            return current.map((item) =>
              item.category === payload.new.category ? payload.new : item
            )
          } else {
            return [...current, payload.new]
          }
        })
      }
    }

    setupRealtimeSubscriptions()

    return () => {
      if (progressSubscription) progressSubscription.unsubscribe()
      if (statsSubscription) statsSubscription.unsubscribe()
    }
  }, [user])

  return (
    <DatabaseContext.Provider value={{
      progress,
      statistics,
      isOnline,
      syncStatus
    }}>
      {children}
    </DatabaseContext.Provider>
  )
}

export const useDatabase = () => useContext(DatabaseContext)
```

## Performance Optimization

### Subscription Management

```typescript
class SubscriptionManager {
  private subscriptions = new Map<string, any>();
  private cleanupTimeouts = new Map<string, NodeJS.Timeout>();

  subscribe(key: string, config: any, callback: any) {
    // Clean up existing subscription
    this.unsubscribe(key);

    const subscription = supabase.channel(key).on("postgres_changes", config, callback).subscribe();

    this.subscriptions.set(key, subscription);

    // Auto cleanup after 5 minutes of inactivity
    const timeout = setTimeout(
      () => {
        this.unsubscribe(key);
      },
      5 * 60 * 1000
    );

    this.cleanupTimeouts.set(key, timeout);

    return subscription;
  }

  unsubscribe(key: string) {
    const subscription = this.subscriptions.get(key);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(key);
    }

    const timeout = this.cleanupTimeouts.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.cleanupTimeouts.delete(key);
    }
  }

  unsubscribeAll() {
    for (const [key] of this.subscriptions) {
      this.unsubscribe(key);
    }
  }
}

export const subscriptionManager = new SubscriptionManager();
```

### Rate Limiting and Throttling

```typescript
import { throttle, debounce } from "lodash";

// Throttle real-time updates to prevent UI thrashing
const throttledUpdateProgress = throttle((updates: any[]) => {
  setProgress((current) => {
    // Batch apply updates
    let newProgress = [...current];
    updates.forEach((update) => {
      const index = newProgress.findIndex((item) => item.id === update.id);
      if (index !== -1) {
        newProgress[index] = update;
      } else {
        newProgress.unshift(update);
      }
    });
    return newProgress;
  });
}, 1000); // Update at most once per second

// Debounce database writes
const debouncedSaveProgress = debounce(async (progressData: any) => {
  try {
    await supabase.from("user_progress").upsert(progressData);
  } catch (error) {
    console.error("Failed to save progress:", error);
  }
}, 2000); // Save 2 seconds after last change
```

## Error Handling and Reconnection

### Connection Monitoring

```typescript
export function useRealtimeConnection() {
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "reconnecting"
  >("connected");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const handleConnectionChange = () => {
      if (navigator.onLine) {
        setConnectionStatus("reconnecting");
        // Attempt to reconnect
        setTimeout(() => {
          setConnectionStatus("connected");
          setRetryCount(0);
        }, 1000);
      } else {
        setConnectionStatus("disconnected");
      }
    };

    window.addEventListener("online", handleConnectionChange);
    window.addEventListener("offline", handleConnectionChange);

    return () => {
      window.removeEventListener("online", handleConnectionChange);
      window.removeEventListener("offline", handleConnectionChange);
    };
  }, []);

  const reconnect = () => {
    if (retryCount < 3) {
      setConnectionStatus("reconnecting");
      setRetryCount((prev) => prev + 1);

      setTimeout(
        () => {
          setConnectionStatus("connected");
        },
        Math.pow(2, retryCount) * 1000
      ); // Exponential backoff
    }
  };

  return { connectionStatus, retryCount, reconnect };
}
```

## Best Practices

### 1. Subscription Lifecycle Management

- Always unsubscribe when components unmount
- Use dependency arrays carefully in useEffect
- Implement cleanup for inactive subscriptions

### 2. Data Consistency

- Handle potential race conditions with optimistic updates
- Implement conflict resolution for concurrent updates
- Use database constraints to maintain integrity

### 3. Performance Considerations

- Limit the number of active subscriptions
- Use filters to reduce unnecessary updates
- Implement throttling for high-frequency updates
- Consider pagination for large datasets

### 4. Error Recovery

- Implement exponential backoff for reconnection
- Handle network interruptions gracefully
- Provide offline functionality when possible

### 5. Security

- Use Row Level Security for all real-time tables
- Validate real-time payloads on the client
- Monitor for suspicious activity patterns
