const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const supabaseHost = (() => {
  try {
    const u = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "");
    return u.hostname;
  } catch {
    return undefined;
  }
})();

const nextConfig = {
  // Serve at '/tanium' in production, root in dev.
  // TEMPORARILY DISABLED basePath to fix build error - re-enable after Next.js fix
  trailingSlash: false,
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  reactStrictMode: true,
  // ...(isProd ? { basePath: '/tanium' } : {}),
  skipTrailingSlashRedirect: true,
  generateEtags: false,
  eslint: {
    dirs: ["src"],
    // Allow production builds to succeed even if there are ESLint errors.
    // Run `npm run lint` locally to address issues incrementally.
    ignoreDuringBuilds: true,
  },
  // Enforce type safety in CI/build
  typescript: {
    ignoreBuildErrors: false,
  },

  // Force dynamic rendering for pages with Client Components
  // This prevents static generation errors with React hooks
  ...(isProd ? {} : {}),

  // Turbopack root note
  turbopack: {
    root: __dirname,
  },

  experimental: {
    optimizeCss: true,
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'help.tanium.com' },
      ...(supabaseHost ? [{ protocol: 'https', hostname: supabaseHost }] : []),
    ],
  },

  webpack: (config, { isServer }) => {
    // ✅ Neutralize the conflict: ensure cacheUnaffected isn't on
    if (!config.experiments) config.experiments = {};
    if ("cacheUnaffected" in config.experiments) {
      config.experiments.cacheUnaffected = false;
    }

    if (!isServer) {
      // Keep safe fallbacks for browser bundles
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };

      // ❌ REMOVE usedExports (this caused the crash)
      // Let Next/Webpack decide tree-shaking; avoid forcing it here.
      if (config.optimization) {
        const { usedExports, ...rest } = config.optimization;
        config.optimization = {
          ...rest,
          // Optional: you can keep these, but they’re usually best left to Next
          // sideEffects: false,
          // concatenateModules: true,
        };
      }

      // Parallelism is safe to keep if you like
      config.parallelism = Math.max(4, require("os").cpus().length);
    }

    return config;
  },

  async headers() {
    // Build CSP (enabled only in production to reduce DX friction)
    const cspDirectives = [];
    if (isProd) {
      const connectSupabase = supabaseHost ? `https://${supabaseHost}` : '';
      const parts = [
        "default-src 'self'",
        "base-uri 'self'",
        "frame-ancestors 'self'",
        "object-src 'none'",
        "form-action 'self'",
        // Next inline hydration is generally safe; we avoid 'unsafe-eval'
        // Add 'unsafe-inline' for Next.js hydration scripts - necessary for production
        // Add YouTube for iframe API loading
        "script-src 'self' 'unsafe-inline' https://browser.sentry-cdn.com https://www.youtube.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https://i.ytimg.com https://img.youtube.com",
        [
          "connect-src 'self'",
          connectSupabase,
          "https://*.supabase.co",
          "wss://*.supabase.co",
          "https://us.i.posthog.com",
          "https://*.posthog.com",
          "https://sentry.io",
          "https://*.sentry.io",
        ].filter(Boolean).join(' '),
        "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
        "font-src 'self' data:",
        "worker-src 'self' blob:",
      ];
      const csp = parts.join('; ');
      cspDirectives.push({ key: 'Content-Security-Policy', value: csp });
    }

    const commonSecurity = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "no-referrer-when-downgrade" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
      ...cspDirectives,
    ];

    return [
      { source: "/(.*)", headers: commonSecurity },
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }] },
    ];
  },
  async redirects() {
    // When basePath is '/tanium' in production, avoid conflicting redirects.
    const devRedirects = [
      { source: "/tanium", destination: "/", permanent: true },
      { source: "/tanium/:path*", destination: "/:path*", permanent: true },
      // Handle legacy capitalized path variants
      { source: "/Tanium", destination: "/", permanent: true },
      { source: "/Tanium/:path*", destination: "/:path*", permanent: true },
    ];

    const common = [
      { source: "/exam", destination: "/mock", permanent: true },
      // DISABLED: basePath redirects (basePath temporarily disabled)
      // ...(isProd ? [{ source: "/tanium/exam", destination: "/tanium/mock", permanent: true }] : []),
    ];

    if (isProd) return common;
    return [...devRedirects, ...common];
  },
};

module.exports = withMDX(nextConfig);

