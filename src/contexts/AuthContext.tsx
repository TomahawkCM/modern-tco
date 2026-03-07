"use client";

import { isBudgetOffline } from "@/config/app-target";
import { createUserProfile } from "@/lib/profileService";
import { createClient } from "@/utils/supabase/client";
import type { AuthError, Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Offline mode flag - when true, use local user instead of Supabase auth
const isOfflineMode = isBudgetOffline;

// Create a singleton browser client that uses cookies for session storage
// This allows server actions to access the auth session
const supabase = createClient();

// Local user for offline mode - auto-created, no sign-in required
const LOCAL_USER: User = {
  id: "local-user-offline",
  aud: "authenticated",
  role: "authenticated",
  email: "local@budgetapp.local",
  email_confirmed_at: new Date().toISOString(),
  phone: "",
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: { provider: "local", providers: ["local"] },
  user_metadata: { first_name: "Local", last_name: "User" },
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const LOCAL_SESSION: Session = {
  access_token: "offline-mode-token",
  token_type: "bearer",
  expires_in: 31536000, // 1 year
  expires_at: Math.floor(Date.now() / 1000) + 31536000,
  refresh_token: "offline-mode-refresh",
  user: LOCAL_USER,
};

/** Minimal shape used to build payloads */
type UsersRow = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  updated_at: string; // ISO timestamp
};

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    options?: { firstName?: string; lastName?: string }
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: {
    firstName?: string;
    lastName?: string;
  }) => Promise<{ error: AuthError | null }>;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Security Fix: Removed client-side admin check
 * Admin status is now verified server-side via /api/auth/check-admin
 * This prevents exposing admin email list in browser JavaScript bundle
 */

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Hook to check if current user is an admin
 * Security Fix: Uses server-side API instead of client-side check
 */
export function useIsAdmin(): boolean {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function fetchAdminStatus() {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/check-admin");
        const data = await response.json();
        setIsAdmin(data.isAdmin || false);
      } catch (error) {
        console.error("Failed to check admin status:", error);
        setIsAdmin(false);
      }
    }

    fetchAdminStatus();
  }, [user]);

  return isAdmin;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // In offline mode, immediately set local user - no Supabase interaction
    if (isOfflineMode) {
      setState({
        user: LOCAL_USER,
        session: LOCAL_SESSION,
        loading: false,
        error: null,
      });
      return;
    }

    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting initial session:", error);
          setState((prev) => ({ ...prev, error, loading: false }));
          return;
        }

        setState((prev) => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false,
          error: null,
        }));
      } catch (error) {
        console.error("Unexpected error getting session:", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error as AuthError,
        }));
      }
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);

      setState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false,
        error: null,
      }));

      if (event === "SIGNED_IN" && session?.user) {
        // Create/sync user profile with trial initialization
        createUserProfile(session.user).then((result) => {
          if (!result.success) {
            console.warn("Profile sync failed:", result.error);
          }
        });
      } else if (event === "SIGNED_OUT") {
        // Clear cached app data when signing out
        localStorage.removeItem("tco-progress");
        localStorage.removeItem("tco-exam-session");
        localStorage.removeItem("tco-incorrect-answers");
        localStorage.removeItem("tco-settings");
        localStorage.removeItem("tco-search-history");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    // In offline mode, user is always "signed in" as local user
    if (isOfflineMode) {
      return { error: null };
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setState((prev) => ({ ...prev, error, loading: false }));
      return { error };
    } catch (error) {
      const authError = error as AuthError;
      setState((prev) => ({ ...prev, error: authError, loading: false }));
      return { error: authError };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    options?: { firstName?: string; lastName?: string }
  ) => {
    // In offline mode, user is always "signed in" as local user
    if (isOfflineMode) {
      return { error: null };
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: options?.firstName || "",
            last_name: options?.lastName || "",
          },
        },
      });
      if (error) setState((prev) => ({ ...prev, error, loading: false }));
      return { error };
    } catch (error) {
      const authError = error as AuthError;
      setState((prev) => ({ ...prev, error: authError, loading: false }));
      return { error: authError };
    }
  };

  const signOut = async () => {
    // In offline mode, can't sign out - always local user
    if (isOfflineMode) {
      return { error: null };
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { error } = await supabase.auth.signOut();
      if (error) setState((prev) => ({ ...prev, error, loading: false }));
      return { error };
    } catch (error) {
      const authError = error as AuthError;
      setState((prev) => ({ ...prev, error: authError, loading: false }));
      return { error: authError };
    }
  };

  const resetPassword = async (email: string) => {
    // In offline mode, no password to reset
    if (isOfflineMode) {
      return { error: null };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/budget-app/auth/reset-password`,
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const updateProfile = async (updates: { firstName?: string; lastName?: string }) => {
    // In offline mode, update the local user metadata
    if (isOfflineMode) {
      LOCAL_USER.user_metadata = {
        ...LOCAL_USER.user_metadata,
        first_name: updates.firstName ?? LOCAL_USER.user_metadata.first_name,
        last_name: updates.lastName ?? LOCAL_USER.user_metadata.last_name,
      };
      setState((prev) => ({ ...prev, user: { ...LOCAL_USER } }));
      return { error: null };
    }

    if (!state.user) {
      return { error: { message: "No user logged in" } as AuthError };
    }

    try {
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: updates.firstName,
          last_name: updates.lastName,
        },
      });
      if (authError) return { error: authError };

      // TODO: Implement user profile sync when users table is available
      // const users = supabase.from("users") as any;
      // const { error: dbError } = await users
      //   .update({
      //     first_name: updates.firstName ?? null,
      //     last_name: updates.lastName ?? null,
      //     updated_at: new Date().toISOString(),
      //   })
      //   .eq("id", state.user.id);

      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    // Security: Admin check moved to server-side API (use useIsAdmin() hook)
    isAdmin: false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
