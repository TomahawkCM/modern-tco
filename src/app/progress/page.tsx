"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import BlueprintMeter from "@/components/BlueprintMeter";
import { getAttemptHistory, type AttemptRecord } from "@/lib/progress";

export default function ProgressPage() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<AttemptRecord[] | null>(null);

  useEffect(() => {
    (async () => {
      if (!user?.id) return setAttempts([]);
      const data = await getAttemptHistory(user.id, 20);
      setAttempts(data);
    })();
  }, [user?.id]);

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Progress</h1>

      <Card>
        <CardHeader>
          <CardTitle>Attempt History</CardTitle>
        </CardHeader>
        <CardContent>
          {attempts === null ? (
            <div className="text-sm text-slate-600 dark:text-muted-foreground">Loading…</div>
          ) : attempts.length === 0 ? (
            <div className="text-sm text-slate-600 dark:text-muted-foreground">No attempts recorded.</div>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {attempts.map((a) => (
                <li key={a.id} className="py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{a.type}</div>
                      <div className="text-muted-foreground dark:text-muted-foreground">{new Date(a.date).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      {typeof a.score === "number" && <div className="font-medium">{Math.round(a.score * 100)}%</div>}
                      {typeof a.questions === "number" && <div className="text-muted-foreground dark:text-muted-foreground">{a.questions} questions</div>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blueprint Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <BlueprintMeter source="content" />
        </CardContent>
      </Card>
    </main>
  );
}

