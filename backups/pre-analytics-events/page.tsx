"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type EventRow = {
  event_id: string;
  event_type: string;
  event_timestamp: string;
  session_id?: string | null;
  user_id?: string | null;
  event_data?: Record<string, unknown> | null;
};

export default function AnalyticsEventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return events;
    const q = query.toLowerCase();
    return events.filter((e) =>
      [
        e.event_type,
        e.session_id ?? "",
        e.user_id ?? "",
        e.event_timestamp,
        JSON.stringify(e.event_data ?? {}),
      ]
        .join("\n")
        .toLowerCase()
        .includes(q)
    );
  }, [events, query]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await (supabase as any)
        .from("analytics_events")
        .select("event_id,event_type,event_timestamp,session_id,user_id,event_data")
        .order("event_timestamp", { ascending: false })
        .limit(100);
      if (error) throw error;
      setEvents((data as EventRow[]) ?? []);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Analytics Events</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Search events (type, text, session, user)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-80 bg-white/5 text-white placeholder:text-white/40"
          />
          <Button onClick={load} disabled={loading} className="bg-tanium-accent">
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-500/30 bg-red-500/10 p-3 text-red-300">
          {error}
        </div>
      )}

      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recent Events ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full table-fixed border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-sm text-white/70">
                  <th className="w-40 px-2">Timestamp</th>
                  <th className="w-40 px-2">Type</th>
                  <th className="w-40 px-2">Session</th>
                  <th className="w-40 px-2">User</th>
                  <th className="px-2">Data</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.event_id} className="text-sm text-white/90">
                    <td className="whitespace-nowrap px-2 align-top">
                      {new Date(e.event_timestamp).toLocaleString()}
                    </td>
                    <td className="px-2 align-top">
                      <span className="rounded bg-white/10 px-2 py-1 text-white">
                        {e.event_type}
                      </span>
                    </td>
                    <td className="px-2 align-top">{e.session_id ?? ""}</td>
                    <td className="px-2 align-top">{e.user_id ?? ""}</td>
                    <td className="px-2 align-top">
                      <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded bg-black/20 p-2 text-xs text-white/70">
                        {JSON.stringify(e.event_data ?? {}, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
