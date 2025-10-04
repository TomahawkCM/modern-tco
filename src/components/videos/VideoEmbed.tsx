"use client";

import { useEffect, useRef } from "react";
import { analytics } from "@/lib/analytics";
import {
  trackVideoImpression,
  startVideoSession,
  updateVideoProgress,
  endVideoSession,
} from "@/lib/videoAnalytics";

interface VideoEmbedProps {
  youtubeId: string;
  title: string;
  start?: number;
  moduleSlug?: string;
}

export default function VideoEmbed({ youtubeId, title, start, moduleSlug }: VideoEmbedProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);

  // Load YouTube IFrame API once
  function loadYT(): Promise<void> {
    if (typeof window === "undefined") return Promise.resolve();
    const w = window as any;
    if (w.YT?.Player) return Promise.resolve();
    if (w.__ytApiPromise) return w.__ytApiPromise as Promise<void>;
    w.__ytApiPromise = new Promise<void>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
      const prev = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = function () {
        if (typeof prev === "function") try { prev(); } catch {}
        resolve();
      };
    });
    return w.__ytApiPromise as Promise<void>;
  }

  // Global attach queue: create players sequentially to avoid race/concurrency issues
  function enqueueAttach(task: () => void) {
    if (typeof window === "undefined") return task();
    const w = window as any;
    w.__ytAttachQueue = w.__ytAttachQueue ?? [];
    w.__ytAttachRunning = w.__ytAttachRunning ?? false;
    w.__ytAttachQueue.push(task);
    const run = () => {
      if (w.__ytAttachRunning) return;
      w.__ytAttachRunning = true;
      const step = () => {
        const fn = w.__ytAttachQueue.shift();
        if (fn) {
          try { fn(); } catch {}
          // Generous spacing reduces flakiness when many players initialize together
          setTimeout(step, 500);
        } else {
          w.__ytAttachRunning = false;
        }
      };
      step();
    };
    run();
  }

  // Impression/visibility analytics
  useEffect(() => {
    void analytics.capture("video_impression", { provider: "youtube", youtubeId, title, moduleSlug });
    trackVideoImpression(youtubeId, title, moduleSlug);

    const el = containerRef.current!;
    if (!el || typeof window === "undefined") return;
    let seen = false;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!seen && entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            void analytics.capture("video_visible", { provider: "youtube", youtubeId, title, moduleSlug });
            seen = true;
            try { io.disconnect(); } catch {}
            break;
          }
        }
      },
      { threshold: [0.5] }
    );
    io.observe(el as Element);
    return () => { try { io.disconnect(); } catch {} };
  }, [youtubeId, title, moduleSlug]);

  // Create player using API (no pre-rendered iframe)
  useEffect(() => {
    let interval: any = null;
    let sessionId: string | null = null;
    let sessionStartTime: number = 0;
    let totalWatchTime: number = 0;
    const milestones: Record<number, boolean> = { 25: false, 50: false, 75: false, 100: false };

    const attach = async () => {
      await loadYT();
      const w = window as any;
      const el = containerRef.current!;
      if (!el) return;

      const doCreate = () => {
        // Avoid duplicate creation
        if (playerRef.current?.destroy) {
          try { playerRef.current.destroy(); } catch {}
          playerRef.current = null;
        }
        let ready = false;
        let attempts = 0;

        const createOnce = () => {
          attempts += 1;
          // Safety timeout: if onReady doesn't fire, retry
          const watchdog = setTimeout(() => {
            if (!ready) {
              try { playerRef.current?.destroy?.(); } catch {}
              if (attempts <= 3) {
                setTimeout(createOnce, 800);
              }
            }
          }, 7000);

          playerRef.current = new w.YT.Player(el, {
            host: 'https://www.youtube-nocookie.com',
            videoId: youtubeId,
            playerVars: {
              origin: window.location.origin,
              rel: 0,
              modestbranding: 1,
              playsinline: 1,
              start: start && start > 0 ? start : undefined,
            },
            events: {
              onReady: () => {
                ready = true;
                try { clearTimeout(watchdog); } catch {}
              },
              onStateChange: (e: any) => {
                const state = e.data; // 0 ended, 1 playing, 2 paused
                if (state === 1) {
                  void analytics.capture("video_play", { provider: "youtube", youtubeId, title, moduleSlug });

                  // Start video session if not already started
                  if (!sessionId) {
                    sessionId = startVideoSession(youtubeId, title, moduleSlug);
                    sessionStartTime = Date.now();
                  }

                  if (!interval) {
                    interval = setInterval(() => {
                      try {
                        const dur = playerRef.current?.getDuration?.() || 0;
                        const cur = playerRef.current?.getCurrentTime?.() || 0;
                        if (dur > 0) {
                          const p = Math.round((cur / dur) * 100);
                          [25, 50, 75, 100].forEach((m) => {
                            if (!milestones[m] && p >= m) {
                              milestones[m] = true;
                              void analytics.capture("video_progress", { provider: "youtube", youtubeId, title, moduleSlug, milestone: m });

                              // Track milestone in video analytics
                              if (sessionId) {
                                updateVideoProgress(youtubeId, sessionId, cur, m);
                              }
                            }
                          });
                        }
                      } catch {}
                    }, 1000);
                  }
                } else if (state === 2) {
                  try {
                    const dur = playerRef.current?.getDuration?.() || 0;
                    const cur = playerRef.current?.getCurrentTime?.() || 0;
                    const percent = dur ? Math.round((cur / dur) * 100) : 0;
                    void analytics.capture("video_pause", { provider: "youtube", youtubeId, title, moduleSlug, position: Math.floor(cur), percent });

                    // Update watch time
                    if (sessionStartTime > 0) {
                      totalWatchTime += (Date.now() - sessionStartTime) / 1000;
                      sessionStartTime = 0;
                    }
                  } catch {}
                  if (interval) { clearInterval(interval); interval = null; }
                } else if (state === 0) {
                  try {
                    const dur = playerRef.current?.getDuration?.() || 0;
                    const cur = playerRef.current?.getCurrentTime?.() || 0;
                    void analytics.capture("video_complete", { provider: "youtube", youtubeId, title, moduleSlug, duration: Math.floor(dur) });

                    // End video session
                    if (sessionId) {
                      if (sessionStartTime > 0) {
                        totalWatchTime += (Date.now() - sessionStartTime) / 1000;
                      }
                      endVideoSession(youtubeId, sessionId, cur, totalWatchTime);
                      sessionId = null;
                      sessionStartTime = 0;
                      totalWatchTime = 0;
                    }
                  } catch {}
                  if (interval) { clearInterval(interval); interval = null; }
                }
              },
              onError: () => {
                try { clearTimeout(watchdog); } catch {}
                try { playerRef.current?.destroy?.(); } catch {}
                if (attempts <= 3) {
                  setTimeout(createOnce, 800);
                }
              },
            },
          });
        };

        createOnce();
      };

      enqueueAttach(doCreate);
    };

    void attach();

    return () => {
      try { if (interval) clearInterval(interval); } catch {}
      try { playerRef.current?.destroy?.(); } catch {}
    };
  }, [youtubeId, start, title, moduleSlug]);

  return (
    <div
      ref={containerRef}
      className="w-full aspect-video overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-black"
      aria-label={title}
    />
  );
}
