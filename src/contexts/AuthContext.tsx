"use client";

import { supabase } from "@/lib/supabase";
import type { AuthError, Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
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
        // TODO: Implement user profile sync when users table is available
        // await syncUserProfile(session.user);
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

  // TODO: Implement user profile sync when users table is available
  // const syncUserProfile = async (user: User) => {
  //   try {
  //     const rows: UsersRow[] = [
  //       {
  //         id: user.id,
  //         email: user.email ?? null,
  //         first_name: (user as any)?.user_metadata?.first_name ?? null,
  //         last_name: (user as any)?.user_metadata?.last_name ?? null,
  //         updated_at: new Date().toISOString(),
  //       },
  //     ];

  //     const { error } = await supabase.from("users").upsert(rows, { onConflict: "id" });

  //     if (error) console.error("Error syncing user profile:", error);
  //   } catch (error) {
  //     console.error("Unexpected error syncing user profile:", error);
  //   }
  // };

  const signIn = async (email: string, password: string) => {
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
    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${basePath}/auth/reset-password`,
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const updateProfile = async (updates: { firstName?: string; lastName?: string }) => {
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
