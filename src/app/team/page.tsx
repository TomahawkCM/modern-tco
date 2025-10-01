"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { teamService, type TeamSeat } from "@/lib/team";
import { useAuth } from "@/contexts/AuthContext";
import { analytics } from "@/lib/analytics";

export default function TeamPage() {
  const { user } = useAuth();
  const [seats, setSeats] = useState<TeamSeat[]>([]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const limit = teamService.getLimit();

  useEffect(() => {
    let active = true;
    (async () => {
      const list = await teamService.list(user);
      if (active) setSeats(list);
    })();
    return () => { active = false; };
  }, [user?.id]);

  const used = seats.filter((s) => s.status !== "revoked").length;
  const remaining = Math.max(0, limit - used);

  function validEmail(e: string) {
    return /.+@.+\..+/.test(e);
  }

  async function handleInvite() {
    setError(null);
    const e = email.trim().toLowerCase();
    if (!validEmail(e)) {
      setError("Enter a valid email address");
      return;
    }
    if (remaining <= 0) {
      setError("Seat limit reached");
      return;
    }
    if (seats.some((s) => s.email === e && s.status !== "revoked")) {
      setError("This email already has a seat");
      return;
    }
    const seat = await teamService.invite(e, user);
    void analytics.capture("team_invite", { email: e });
    setSeats((prev) => [seat, ...prev]);
    setEmail("");
  }

  async function handleRevoke(id: string) {
    await teamService.revoke(id, user);
    void analytics.capture("team_revoke", { id });
    setSeats((prev) => prev.map((s) => (s.id === id ? { ...s, status: "revoked" } : s)));
  }

  async function handleActivate(id: string) {
    await teamService.activate(id, user);
    void analytics.capture("team_activate", { id });
    setSeats((prev) => prev.map((s) => (s.id === id ? { ...s, status: "active", acceptedAt: new Date().toISOString() } : s)));
  }

  const sorted = useMemo(() => {
    return [...seats].sort((a, b) => (a.invitedAt < b.invitedAt ? 1 : -1));
  }, [seats]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-3xl font-bold text-white">Team Seats (Beta)</h1>
      <p className="mb-6 text-gray-300">Invite teammates to use your Team plan. This MVP stores seats in your account with Supabase when available, with a local fallback for development.</p>

      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Seat Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between text-sm text-gray-200">
          <div>
            <div><span className="font-medium">Limit:</span> {limit}</div>
            <div><span className="font-medium">Used:</span> {used}</div>
          </div>
          <Badge variant={remaining > 0 ? "secondary" : "outline"}>
            {remaining} seats remaining
          </Badge>
        </CardContent>
      </Card>

      <Card className="mt-6 glass border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Invite a teammate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <Label htmlFor="invite-email" className="text-gray-300">Email</Label>
              <Input id="invite-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@company.com" disabled={!user} />
            </div>
            <Button onClick={handleInvite} disabled={!email.trim() || !user} className="sm:ml-2">Invite</Button>
          </div>
          {!user && <div className="text-sm text-yellow-300">Sign in to invite and manage seats.</div>}
          {error && <div className="text-sm text-red-400">{error}</div>}
        </CardContent>
      </Card>

      <Card className="mt-6 glass border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Seats</CardTitle>
        </CardHeader>
        <CardContent>
          {sorted.length === 0 ? (
            <div className="text-sm text-gray-300">No seats yet. Invite your first teammate above.</div>
          ) : (
            <ul className="divide-y divide-white/10">
              {sorted.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-white">{s.email}</div>
                    <div className="text-xs text-gray-400">
                      Invited {new Date(s.invitedAt).toLocaleString()} • Status: {s.status}
                      {s.acceptedAt ? ` • Activated ${new Date(s.acceptedAt).toLocaleString()}` : ""}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {s.status === "invited" && (
                      <Button size="sm" variant="outline" onClick={() => handleActivate(s.id)}>Mark Active</Button>
                    )}
                    {s.status !== "revoked" && (
                      <Button size="sm" variant="destructive" onClick={() => handleRevoke(s.id)}>Revoke</Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
