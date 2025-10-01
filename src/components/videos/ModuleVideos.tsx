'use client';

import videoManifest from "@/content/videos/manifest.json";
import type { ModuleManifest } from "@/types/manifest";
import VideoEmbed from "@/components/videos/VideoEmbed";

function toEnvKey(slug: string) {
  return `NEXT_PUBLIC_VIDEOS_${slug.replace(/[^a-z0-9]/gi, "_").toUpperCase()}`;
}

function parseYouTubeId(token: string): string | null {
  const t = token.trim();
  if (!t) return null;
  // Full watch URL
  const watch = t.match(/v=([a-zA-Z0-9_-]{6,})/);
  if (watch) return watch[1];
  // youtu.be short URL
  const short = t.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (short) return short[1];
  // Embed URL
  const embed = t.match(/embed\/([a-zA-Z0-9_-]{6,})/);
  if (embed) return embed[1];
  // Raw ID
  if (/^[a-zA-Z0-9_-]{6,}$/.test(t)) return t;
  return null;
}

interface ModuleVideosProps {
  slug: string;
}

export function ModuleVideos({ slug }: ModuleVideosProps) {
  const data = videoManifest as unknown as {
    modules: Array<{ slug: string; videos: Array<{ id: string; title: string; youtubeId: string; start?: number }> }>;
  };
  const entry = data.modules.find((m) => m.slug === slug);

  // Environment override: comma-separated YouTube IDs or URLs
  const envKey = toEnvKey(slug);
  const envValue = process.env[envKey];
  let videos = entry?.videos ?? [];
  if (envValue && envValue.trim().length > 0) {
    const ids = envValue.split(",").map((s) => parseYouTubeId(s)).filter(Boolean) as string[];
    if (ids.length > 0) {
      videos = ids.map((id, i) => ({ id: `${slug}-${i + 1}`, title: `Training Video ${i + 1}`, youtubeId: id }));
    }
  }

  // Client-side local override via localStorage (set by /videos/admin)
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('tco-videos-override');
      if (raw) {
        const map = JSON.parse(raw) as Record<string, string[]>;
        const arr = map[slug] || [];
        const ids = arr.map(parseYouTubeId).filter(Boolean) as string[];
        if (ids.length > 0) {
          videos = ids.map((id, i) => ({ id: `${slug}-ls-${i + 1}`, title: `Training Video ${i + 1}`, youtubeId: id }));
        }
      }
    } catch {}
  }

  if (!videos || videos.length === 0) {
    return (
      <section aria-labelledby="videos-title" className="rounded border p-4">
        <h2 id="videos-title" className="text-lg font-semibold">
          Videos
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          No videos available yet for this module.
          {envValue ? (
            <>
              {" "}A videos override was provided but could not be parsed. Ensure values are comma‑separated YouTube
              URLs or IDs.
            </>
          ) : null}
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="videos-title" className="space-y-3">
      <h2 id="videos-title" className="text-lg font-semibold">
        Videos
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {videos.map((v) => (
          <div key={v.id} className="space-y-2">
            <VideoEmbed youtubeId={v.youtubeId} title={v.title} start={v.start} moduleSlug={slug} />
            <div className="text-sm text-slate-700 dark:text-slate-300">{v.title}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
