"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Shield } from "lucide-react";
import { useState, type ReactNode } from "react";
import { SignInForm } from "./SignInForm";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, fallback, requireAuth = true }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!requireAuth) {
    return <>{children}</>;
  }

  if (!user) {
    return (
      <>
        {fallback || (
          <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Authentication Required</CardTitle>
                <CardDescription>
                  Please sign in to access your Tanium TCO exam progress and continue your
                  certification journey.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => setShowAuthModal(true)} className="w-full">
                  Sign In
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Don&rsquo;t have an account?{" "}
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="text-primary hover:underline"
                  >
                    Create one now
                  </button>
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-slate-800">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Sign In</h2>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </div>
              <SignInForm onSuccess={() => setShowAuthModal(false)} />
            </div>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
}
