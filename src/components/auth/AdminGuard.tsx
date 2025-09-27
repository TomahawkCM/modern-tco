"use client";

import { ReactNode, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

function getAdminSet(): Set<string> {
  const raw = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").trim();
  if (!raw) return new Set();
  return new Set(raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean));
}

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const admins = useMemo(() => getAdminSet(), []);
  const email = (user?.email || "").toLowerCase();
  const allowed = !!email && (admins.size === 0 ? false : admins.has(email));

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Sign in required</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-gray-200">
            <div>Sign in with an admin account to access this page.</div>
            <Button onClick={() => router.push("/auth/signin")}>Sign in</Button>
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
            <CardTitle className="text-white">Access denied</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-200">
            Your account ({email || "unknown"}) is not authorized to access admin tools.
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

