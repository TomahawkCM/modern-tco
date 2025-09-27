"use client";

import { useEffect } from 'react';
import { initClientMonitoring } from '@/lib/monitoring';

function loadSentry(dsn: string, environment?: string) {
  if (typeof window === 'undefined') return;
  if ((window as any).__sentry_init) return;
  const script = document.createElement('script');
  script.src = 'https://browser.sentry-cdn.com/7.120.1/bundle.tracing.min.js';
  script.crossOrigin = 'anonymous';
  script.onload = () => {
    try {
      const Sentry = (window as any).Sentry;
      if (Sentry && !((window as any).__sentry_init)) {
        Sentry.init({
          dsn,
          tracesSampleRate: 0.05,
          environment: environment || process.env.NODE_ENV || 'production',
          integrations: [new Sentry.BrowserTracing()],
        });
        (window as any).__sentry_init = true;
      }
    } catch {
      // ignore
    }
  };
  document.head.appendChild(script);
}

export function MonitoringClient() {
  useEffect(() => {
    initClientMonitoring();
    const dsn = (process.env.NEXT_PUBLIC_SENTRY_DSN || '').toString();
    // Defer Sentry bundle load until the browser is idle for better TTI
    if (dsn) {
      const idle = (window as any).requestIdleCallback as undefined | ((cb: any) => void);
      const start = () => loadSentry(dsn, (process.env.NEXT_PUBLIC_ENV || '').toString());
      if (idle) idle(start); else setTimeout(start, 300);
    }
  }, []);
  return null;
}
