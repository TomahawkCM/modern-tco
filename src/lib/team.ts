import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export type TeamSeatStatus = "invited" | "active" | "revoked";

export interface TeamSeat {
  id: string;
  email: string;
  status: TeamSeatStatus;
  invitedAt: string; // ISO
  acceptedAt?: string | null;
}

const STORAGE_KEY = "tco_team_seats_v1";
const LIMIT = parseInt(process.env.NEXT_PUBLIC_TEAM_SEAT_LIMIT || "5", 10) || 5;

function uuid(): string {
  if (typeof crypto !== "undefined" && (crypto as any).randomUUID) {
    return (crypto as any).randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function lsGet(): TeamSeat[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function lsSet(seats: TeamSeat[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(seats)); } catch {}
}

export const teamService = {
  getLimit(): number {
    return LIMIT;
  },

  async list(user?: User | null): Promise<TeamSeat[]> {
    const local = typeof window !== "undefined" ? lsGet() : [];
    if (!user?.id) return local;
    try {
      const { data, error } = await (supabase as any)
        .from("team_seats")
        .select("id,email,status,invited_at,accepted_at")
        .eq("owner_id", user.id)
        .order("invited_at", { ascending: false });
      if (error) throw error;
      const remote: TeamSeat[] = (data || []).map((r: any) => ({
        id: r.id,
        email: r.email,
        status: r.status as TeamSeatStatus,
        invitedAt: r.invited_at,
        acceptedAt: r.accepted_at,
      }));
      if (remote.length && typeof window !== "undefined") lsSet(remote);
      return remote.length ? remote : local;
    } catch {
      return local;
    }
  },

  async invite(email: string, user?: User | null): Promise<TeamSeat> {
    const newSeat: TeamSeat = {
      id: uuid(),
      email: email.trim().toLowerCase(),
      status: "invited",
      invitedAt: new Date().toISOString(),
      acceptedAt: null,
    };
    const cur = typeof window !== "undefined" ? lsGet() : [];
    const updated = [newSeat, ...cur];
    if (typeof window !== "undefined") lsSet(updated);
    if (user?.id) {
      try {
        await (supabase as any)
          .from("team_seats")
          .upsert({
            id: newSeat.id,
            owner_id: user.id,
            email: newSeat.email,
            status: newSeat.status,
            invited_at: newSeat.invitedAt,
            accepted_at: newSeat.acceptedAt,
          }, { onConflict: "id" });
      } catch {}
    }
    return newSeat;
  },

  async revoke(id: string, user?: User | null): Promise<void> {
    const cur = typeof window !== "undefined" ? lsGet() : [];
    const updated = cur.map((s) => (s.id === id ? { ...s, status: "revoked" as TeamSeatStatus } : s));
    if (typeof window !== "undefined") lsSet(updated);
    if (user?.id) {
      try {
        await (supabase as any)
          .from("team_seats")
          .update({ status: "revoked" })
          .eq("id", id)
          .eq("owner_id", user.id);
      } catch {}
    }
  },

  async activate(id: string, user?: User | null): Promise<void> {
    const cur = typeof window !== "undefined" ? lsGet() : [];
    const now = new Date().toISOString();
    const updated = cur.map((s) => (s.id === id ? { ...s, status: "active" as TeamSeatStatus, acceptedAt: now } : s));
    if (typeof window !== "undefined") lsSet(updated);
    if (user?.id) {
      try {
        await (supabase as any)
          .from("team_seats")
          .update({ status: "active", accepted_at: now })
          .eq("id", id)
          .eq("owner_id", user.id);
      } catch {}
    }
  },
};

