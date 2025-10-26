"use client";

import { useEffect, useState } from "react";
import videoManifest from "@/content/videos/manifest.json";

type MapType = Record<string, string[]>;

export default function VideosAdminPage() {
  const data = videoManifest as unknown as { modules: Array<{ slug: string }> };
  const [map, setMap] = useState<MapType>({});
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("tco-videos-override");
      if (raw) setMap(JSON.parse(raw));
    } catch {}
  }, []);

  const save = () => {
    try {
      localStorage.setItem("tco-videos-override", JSON.stringify(map));
      setStatus("Saved");
      setTimeout(() => setStatus(""), 1500);
    } catch (e) {
      setStatus("Failed to save");
    }
  };

  const setFor = (slug: string, value: string) => {
    const lines = value
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    setMap((prev) => ({ ...prev, [slug]: lines }));
  };

  const getFor = (slug: string) => (map[slug] || []).join("\n");

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Videos Admin (local override)</h1>
        <button
          onClick={save}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-foreground hover:bg-blue-700"
        >
          Save
        </button>
      </div>
      {status && <div className="text-[#22c55e]">{status}</div>}
      <p className="text-muted-foreground">
        Paste YouTube links or IDs per module (one per line). This stores locally in your browser and overrides the
        default manifest. For production-wide changes, set NEXT_PUBLIC_VIDEOS_&lt;SLUG&gt; env vars in Vercel.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        {data.modules.map((m) => (
          <div key={m.slug} className="space-y-2 rounded border border-white/10 p-4">
            <div className="text-foreground">{m.slug}</div>
            <textarea
              className="h-40 w-full rounded border border-white/10 bg-card p-2 text-sm text-foreground"
              placeholder="https://www.youtube.com/watch?v=...\nhttps://youtu.be/...\n<videoId>"
              value={getFor(m.slug)}
              onChange={(e) => setFor(m.slug, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

