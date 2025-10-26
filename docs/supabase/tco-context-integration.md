# TCO Context Integration with Supabase

## Overview

The Modern TCO application implements a sophisticated context architecture that seamlessly integrates with Supabase for real-time data synchronization, offline support, and optimal user experience. This document details the 9 integrated contexts and their Supabase interactions.

## Architecture Pattern

### Dual Storage Strategy

- **Primary Storage**: Supabase database for authenticated users with real-time sync
- **Fallback Storage**: localStorage for unauthenticated users and offline scenarios
- **Automatic Migration**: Data seamlessly transfers from localStorage to Supabase upon authentication

### Context Hierarchy

```
App
├── AuthProvider (Supabase Auth integration)
├── DatabaseProvider (Connection management)
├── QuestionsProvider (Content delivery)
├── ExamProvider (Session management)
├── ProgressProvider (User progress tracking)
├── SettingsProvider (User preferences)
├── IncorrectAnswersProvider (Review system)
├── ModuleProvider (Learning paths)
└── SearchProvider (Content discovery)
```

## 1. AuthContext - Authentication Integration

### Purpose

Manages user authentication state and session persistence using Supabase Auth.

### Supabase Integration

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Error getting session:', error)
      }

      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)

        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Handle auth events
        switch (event) {
          case 'SIGNED_IN':
            // Trigger data migration from localStorage
            await migrateLocalData(session!.user.id)
            break
          case 'SIGNED_OUT':
            // Clear any cached user data
            clearUserData()
            break
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{
      user, session, loading, signIn, signUp, signOut, resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// Data migration helper
const migrateLocalData = async (userId: string) => {
  // Migrate progress data
  const localProgress = localStorage.getItem('tco_progress')
  if (localProgress) {
    try {
      const progress = JSON.parse(localProgress)
      await supabase.from('user_progress').upsert(
        progress.map((p: any) => ({ ...p, user_id: userId }))
      )
      localStorage.removeItem('tco_progress')
    } catch (error) {
      console.error('Failed to migrate progress:', error)
    }
  }

  // Migrate settings
  const localSettings = localStorage.getItem('tco_settings')
  if (localSettings) {
    try {
      const settings = JSON.parse(localSettings)
      await supabase.from('user_settings').upsert({
        user_id: userId,
        ...settings
      })
      localStorage.removeItem('tco_settings')
    } catch (error) {
      console.error('Failed to migrate settings:', error)
    }
  }
}
```

### Key Features

- Automatic session management and token refresh
- Data migration from localStorage on sign-in
- Real-time auth state updates
- Error handling for auth operations

## 2. DatabaseContext - Connection Management

### Purpose

Manages Supabase database connections, monitors online status, and handles sync operations.

### Supabase Integration

```typescript
// contexts/DatabaseContext.tsx
interface DatabaseContextType {
  isOnline: boolean
  syncStatus: 'idle' | 'syncing' | 'error'
  lastSync: Date | null
  pendingOperations: number
  sync: () => Promise<void>
  getConnectionHealth: () => Promise<boolean>
}

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle')
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [pendingOperations, setPendingOperations] = useState(0)

  // Monitor connection health
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('users').select('id').limit(1)
        setIsOnline(!error)
      } catch {
        setIsOnline(false)
      }
    }

    const interval = setInterval(checkConnection, 30000) // Check every 30s
    return () => clearInterval(interval)
  }, [])

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (user) sync() // Auto-sync when coming online
    }

    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [user])

  const sync = async () => {
    if (!user || !isOnline) return

    setSyncStatus('syncing')
    try {
      // Sync pending operations from localStorage
      await syncPendingOperations()
      setLastSync(new Date())
      setSyncStatus('idle')
    } catch (error) {
      console.error('Sync failed:', error)
      setSyncStatus('error')
    }
  }

  const getConnectionHealth = async (): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('users')
        .select('id')
        .eq('id', user?.id)
        .limit(1)

      return !error
    } catch {
      return false
    }
  }

  return (
    <DatabaseContext.Provider value={{
      isOnline, syncStatus, lastSync, pendingOperations, sync, getConnectionHealth
    }}>
      {children}
    </DatabaseContext.Provider>
  )
}
```

### Key Features

- Real-time connection monitoring
- Automatic sync on reconnection
- Pending operations tracking
- Connection health checks

## 3. QuestionsContext - Content Delivery

### Purpose

Manages exam questions with intelligent caching and real-time updates.

### Supabase Integration

```typescript
// contexts/QuestionsContext.tsx
interface QuestionsContextType {
  questions: Question[]
  loading: boolean
  error: string | null
  getQuestionsByCategory: (category: string) => Question[]
  searchQuestions: (query: string) => Question[]
  refreshQuestions: () => Promise<void>
}

export function QuestionsProvider({ children }: { children: React.ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isOnline } = useDatabase()

  // Cache management
  const CACHE_KEY = 'tco_questions'
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  useEffect(() => {
    loadQuestions()
  }, [isOnline])

  const loadQuestions = async () => {
    setLoading(true)
    setError(null)

    try {
      // Try cache first
      const cached = getCachedQuestions()
      if (cached) {
        setQuestions(cached)
        setLoading(false)
        // Still fetch fresh data in background if online
        if (isOnline) {
          fetchFreshQuestions()
        }
        return
      }

      // Fetch from database or fallback
      if (isOnline) {
        await fetchFreshQuestions()
      } else {
        // Use static fallback questions
        const fallback = await import('@/data/fallback-questions.json')
        setQuestions(fallback.default)
      }
    } catch (err) {
      console.error('Failed to load questions:', err)
      setError('Failed to load questions')
      // Load static fallback
      try {
        const fallback = await import('@/data/fallback-questions.json')
        setQuestions(fallback.default)
      } catch {
        setError('No questions available offline')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchFreshQuestions = async () => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    if (data) {
      setQuestions(data)
      setCachedQuestions(data)
    }
  }

  const getCachedQuestions = (): Question[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return null

      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY)
        return null
      }

      return data
    } catch {
      return null
    }
  }

  const setCachedQuestions = (data: Question[]) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.warn('Failed to cache questions:', error)
    }
  }

  const getQuestionsByCategory = (category: string): Question[] => {
    return questions.filter(q => q.category === category)
  }

  const searchQuestions = (query: string): Question[] => {
    const lowerQuery = query.toLowerCase()
    return questions.filter(q =>
      q.question.toLowerCase().includes(lowerQuery) ||
      q.explanation.toLowerCase().includes(lowerQuery) ||
      q.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  return (
    <QuestionsContext.Provider value={{
      questions, loading, error, getQuestionsByCategory, searchQuestions, refreshQuestions: loadQuestions
    }}>
      {children}
    </QuestionsContext.Provider>
  )
}
```

### Key Features

- 5-minute intelligent caching
- Offline fallback with static questions
- Background refresh when online
- Category and search filtering

## 4. ExamContext - Session Management

### Purpose

Manages exam sessions with real-time progress tracking and automatic persistence.

### Supabase Integration

```typescript
// contexts/ExamContext.tsx
interface ExamContextType {
  currentSession: ExamSession | null
  loading: boolean
  startSession: (type: SessionType, questionIds: string[]) => Promise<void>
  submitAnswer: (questionId: string, answer: string, timeSpent: number) => Promise<void>
  completeSession: () => Promise<void>
  pauseSession: () => Promise<void>
  resumeSession: () => Promise<void>
}

export function ExamProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { isOnline } = useDatabase()
  const [currentSession, setCurrentSession] = useState<ExamSession | null>(null)
  const [loading, setLoading] = useState(false)

  // Auto-save session every 30 seconds
  useEffect(() => {
    if (currentSession && user) {
      const interval = setInterval(() => {
        saveSessionProgress(currentSession)
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [currentSession, user])

  const startSession = async (type: SessionType, questionIds: string[]) => {
    setLoading(true)

    const session: ExamSession = {
      id: crypto.randomUUID(),
      user_id: user?.id || 'anonymous',
      session_type: type,
      question_ids: questionIds,
      current_question_index: 0,
      answers: {},
      started_at: new Date().toISOString(),
      status: 'in_progress'
    }

    try {
      if (user && isOnline) {
        const { error } = await supabase
          .from('exam_sessions')
          .insert({
            id: session.id,
            user_id: session.user_id,
            session_type: session.session_type,
            total_questions: questionIds.length,
            status: 'in_progress'
          })

        if (error) {
          console.error('Failed to save session to database:', error)
        }
      }

      setCurrentSession(session)
      // Also save to localStorage for offline access
      localStorage.setItem('tco_current_session', JSON.stringify(session))
    } catch (error) {
      console.error('Failed to start session:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitAnswer = async (questionId: string, answer: string, timeSpent: number) => {
    if (!currentSession) return

    const updatedSession = {
      ...currentSession,
      answers: {
        ...currentSession.answers,
        [questionId]: { answer, timeSpent, timestamp: new Date().toISOString() }
      },
      current_question_index: currentSession.current_question_index + 1
    }

    setCurrentSession(updatedSession)

    // Save progress
    try {
      if (user && isOnline) {
        // Save individual progress
        const { error: progressError } = await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            question_id: questionId,
            selected_answer: answer,
            is_correct: await checkAnswer(questionId, answer),
            time_taken: timeSpent
          })

        if (progressError) {
          console.error('Failed to save progress:', progressError)
        }

        // Update session
        await saveSessionProgress(updatedSession)
      } else {
        // Save to localStorage for offline
        const localProgress = JSON.parse(localStorage.getItem('tco_offline_progress') || '[]')
        localProgress.push({
          question_id: questionId,
          selected_answer: answer,
          time_taken: timeSpent,
          timestamp: new Date().toISOString()
        })
        localStorage.setItem('tco_offline_progress', JSON.stringify(localProgress))
      }

      // Update localStorage session
      localStorage.setItem('tco_current_session', JSON.stringify(updatedSession))
    } catch (error) {
      console.error('Failed to save answer:', error)
    }
  }

  const completeSession = async () => {
    if (!currentSession) return

    const completedSession = {
      ...currentSession,
      completed_at: new Date().toISOString(),
      status: 'completed' as const
    }

    setCurrentSession(completedSession)

    try {
      if (user && isOnline) {
        const { error } = await supabase
          .from('exam_sessions')
          .update({
            completed_at: completedSession.completed_at,
            status: 'completed',
            questions_answered: Object.keys(currentSession.answers).length,
            // Calculate score and other metrics
          })
          .eq('id', currentSession.id)

        if (error) {
          console.error('Failed to complete session:', error)
        }
      }

      // Clear current session
      localStorage.removeItem('tco_current_session')
      setCurrentSession(null)
    } catch (error) {
      console.error('Failed to complete session:', error)
    }
  }

  return (
    <ExamContext.Provider value={{
      currentSession, loading, startSession, submitAnswer, completeSession, pauseSession, resumeSession
    }}>
      {children}
    </ExamContext.Provider>
  )
}
```

### Key Features

- Auto-save every 30 seconds
- Offline session support
- Real-time progress tracking
- Automatic session recovery

## 5. ProgressContext - Performance Tracking

### Purpose

Tracks user progress with real-time statistics and performance analytics.

### Supabase Integration

```typescript
// contexts/ProgressContext.tsx
interface ProgressContextType {
  statistics: UserStatistics[]
  progress: UserProgress[]
  loading: boolean
  getStatsByCategory: (category: string) => UserStatistics | null
  getProgressByQuestion: (questionId: string) => UserProgress[]
  refreshStats: () => Promise<void>
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { isOnline } = useDatabase()
  const [statistics, setStatistics] = useState<UserStatistics[]>([])
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [loading, setLoading] = useState(true)

  // Real-time subscription for statistics updates
  useEffect(() => {
    if (!user || !isOnline) return

    const subscription = supabase
      .channel('user_statistics_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_statistics',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Statistics updated:', payload)

          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setStatistics(current => {
              const updated = [...current]
              const index = updated.findIndex(s => s.category === payload.new.category)

              if (index !== -1) {
                updated[index] = payload.new as UserStatistics
              } else {
                updated.push(payload.new as UserStatistics)
              }

              return updated
            })
          }
        }
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [user, isOnline])

  // Load initial data
  useEffect(() => {
    if (user) {
      loadProgressData()
    } else {
      loadLocalProgressData()
    }
  }, [user, isOnline])

  const loadProgressData = async () => {
    if (!user) return

    setLoading(true)
    try {
      if (isOnline) {
        const [statsResult, progressResult] = await Promise.all([
          supabase.from('user_statistics').select('*').eq('user_id', user.id),
          supabase.from('user_progress').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100)
        ])

        if (statsResult.data) setStatistics(statsResult.data)
        if (progressResult.data) setProgress(progressResult.data)
      } else {
        loadLocalProgressData()
      }
    } catch (error) {
      console.error('Failed to load progress data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadLocalProgressData = () => {
    try {
      const localStats = localStorage.getItem('tco_statistics')
      const localProgress = localStorage.getItem('tco_progress')

      if (localStats) setStatistics(JSON.parse(localStats))
      if (localProgress) setProgress(JSON.parse(localProgress))
    } catch (error) {
      console.error('Failed to load local progress data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatsByCategory = (category: string): UserStatistics | null => {
    return statistics.find(s => s.category === category) || null
  }

  return (
    <ProgressContext.Provider value={{
      statistics, progress, loading, getStatsByCategory, getProgressByQuestion, refreshStats: loadProgressData
    }}>
      {children}
    </ProgressContext.Provider>
  )
}
```

### Key Features

- Real-time statistics updates via Supabase subscriptions
- Performance analytics and success rates
- Category-based progress tracking
- Offline statistics caching

## Integration Best Practices

### 1. Error Handling Strategy

```typescript
const handleSupabaseError = (error: any, fallback: () => void) => {
  console.error("Supabase error:", error);

  // Try fallback strategy
  try {
    fallback();
  } catch (fallbackError) {
    console.error("Fallback failed:", fallbackError);
    // Show user-friendly error message
  }
};
```

### 2. Optimistic Updates

```typescript
const updateWithOptimism = async (
  optimisticUpdate: () => void,
  serverUpdate: () => Promise<void>
) => {
  // Apply optimistic update immediately
  optimisticUpdate();

  try {
    // Sync with server
    await serverUpdate();
  } catch (error) {
    // Revert optimistic update on error
    console.error("Server update failed, reverting:", error);
    // Implement revert logic
  }
};
```

### 3. Caching Strategy

- **Questions**: 5-minute cache with background refresh
- **User Data**: Real-time sync with localStorage backup
- **Settings**: Immediate sync with debounced saves
- **Statistics**: Real-time subscriptions with local caching

### 4. Offline Support

- All contexts gracefully degrade to localStorage
- Automatic sync when connection restored
- Queue operations for later sync
- User feedback for offline status

### 5. Performance Optimization

- Subscription cleanup on unmount
- Batch operations where possible
- Lazy loading for non-critical data
- Connection health monitoring

This integrated context architecture provides a seamless, performant, and reliable user experience while maintaining data consistency across online and offline scenarios.
