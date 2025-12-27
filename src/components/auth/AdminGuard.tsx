"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useMemo, type ReactNode } from "react";

function getAdminSet(): Set<string> {
  const raw = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").trim();
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function AdminGuard({
  children,
  loginUrl = "/auth/signin",
}: {
  children: ReactNode;
  loginUrl?: string;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const admins = useMemo(() => getAdminSet(), []);
  const email = (user?.email ?? "").toLowerCase();

  // Debug logging
  console.log("AdminGuard Debug:");
  console.log("- Current User:", email);
  console.log("- Allowed Admins:", Array.from(admins));
  console.log("- Is Authorized:", admins.has(email));

  const allowed = !!email && (admins.size === 0 ? false : admins.has(email));

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-foreground">Sign in required</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-muted-foreground">
            <div>Sign in with an admin account to access this page.</div>
            <Button onClick={() => router.push(loginUrl)}>Sign in</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-foreground">Access denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Your account <strong className="text-foreground">({email ?? "unknown"})</strong> is
              not authorized to access admin tools.
            </p>
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
              <p className="mb-2 text-sm font-medium text-yellow-400">Admin Access Setup</p>
              <p className="text-sm text-muted-foreground">
                To grant admin access, add your email to the{" "}
                <code className="rounded bg-black/30 px-1 py-0.5 text-xs">
                  NEXT_PUBLIC_ADMIN_EMAILS
                </code>{" "}
                environment variable in{" "}
                <code className="rounded bg-black/30 px-1 py-0.5 text-xs">.env.local</code>
              </p>
              <p className="mt-2 text-xs text-muted-foreground/70">
                Example:{" "}
                <code className="rounded bg-black/30 px-1 py-0.5 text-xs">
                  NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,user@example.com
                </code>
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="border-white/20 text-foreground hover:bg-white/10"
              >
                Return to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/profile")}
                className="border-white/20 text-foreground hover:bg-white/10"
              >
                View Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
