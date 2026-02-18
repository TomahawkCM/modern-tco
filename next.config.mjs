import createMDX from "@next/mdx";
// import withPWA from "next-pwa";
import analyzer from "@next/bundle-analyzer";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Offline Mode Feature Flag
// When NEXT_PUBLIC_OFFLINE_MODE=true, cloud features are compiled out:
// - Auth flows (Supabase login/signup)
// - Admin dashboard
// - Analytics (PostHog)
// - AI Chatbot (shown as "Premium Feature")
const isOfflineMode = process.env.NEXT_PUBLIC_OFFLINE_MODE === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["ts", "tsx", "mdx"],

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_OFFLINE_MODE: process.env.NEXT_PUBLIC_OFFLINE_MODE || "false",
  },

  // Set output file tracing root to project directory to silence workspace warning
  outputFileTracingRoot: resolve(__dirname),

  // Disable static optimization for error pages to avoid build issues
  generateBuildId: async () => {
    return "build-" + Date.now();
  },

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Production optimizations
  poweredByHeader: false,
  generateEtags: true,
  compress: true,

  // Webpack configuration for code splitting and offline mode
  webpack: (config, { isServer, webpack }) => {
    // Define constants for tree-shaking cloud features in offline builds
    config.plugins.push(
      new webpack.DefinePlugin({
        "process.env.ENABLE_CLOUD_AUTH": JSON.stringify(!isOfflineMode),
        "process.env.ENABLE_ADMIN": JSON.stringify(!isOfflineMode),
        "process.env.ENABLE_CLOUD_ANALYTICS": JSON.stringify(!isOfflineMode),
      })
    );

    // Fix pdfjs-dist webpack bundling: mark the worker as external to prevent
    // __webpack_require__.r from calling Object.defineProperty on non-object
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        alias: {
          ...(config.resolve?.alias || {}),
          // Ensure pdfjs-dist resolves to the legacy CJS build for webpack compat
          "pdfjs-dist": resolve(__dirname, "node_modules/pdfjs-dist/legacy/build/pdf.mjs"),
        },
      };

      // Split large dependencies into separate chunks
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...(config.optimization.splitChunks?.cacheGroups || {}),
            // PDF.js - async chunk for PDF import pages only
            pdfjs: {
              test: /[\\/]node_modules[\\/]pdfjs-dist[\\/]/,
              name: "pdfjs",
              chunks: "async",
              priority: 10,
            },
            // Recharts (2.6MB) - Only load on chart pages
            recharts: {
              test: /[\\/]node_modules[\\/]recharts[\\/]/,
              name: "recharts",
              chunks: "async",
              priority: 10,
            },
            // TensorFlow.js (37MB) - Lazy loaded on demand
            tensorflow: {
              test: /[\\/]node_modules[\\/]@tensorflow[\\/]/,
              name: "tensorflow",
              chunks: "async",
              priority: 10,
            },
          },
        },
      };
    }
    return config;
  },

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Headers for caching and security
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://www.youtube.com https://www.youtube-nocookie.com https://app.posthog.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://vercel.live https://*.vercel.live",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
              "img-src 'self' data: blob: https://i.ytimg.com https://img.youtube.com https://*.supabase.co",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' data: blob: https://*.supabase.co https://app.posthog.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com wss://*.supabase.co https://vercel.live https://*.vercel.live wss://ws-us3.pusher.com",
              "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://vercel.live https://*.vercel.live",
              "media-src 'self' https://www.youtube.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

// MDX configuration for Webpack (production builds use --webpack flag)
// Webpack has stable support for MDX plugins, unlike Turbopack
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings, rehypePrettyCode],
  },
});

// PWA configuration for production only (temporarily disabled)
// const pwaConfig = {
//   dest: "public",
//   disable: process.env.NODE_ENV === "development",
//   register: true,
//   skipWaiting: true,
//   runtimeCaching: [
//     {
//       urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
//       handler: "CacheFirst",
//       options: {
//         cacheName: "google-fonts",
//         expiration: {
//           maxEntries: 4,
//           maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
//         },
//       },
//     },
//     {
//       urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
//       handler: "CacheFirst",
//       options: {
//         cacheName: "cdn-jsdelivr",
//         expiration: {
//           maxEntries: 10,
//           maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
//         },
//       },
//     },
//   ],
// };

// Bundle analyzer configuration (enable with ANALYZE=true)
const withBundleAnalyzer = analyzer({
  enabled: process.env.ANALYZE === "true",
});

// Disable PWA temporarily to avoid build issues
const config = withBundleAnalyzer(withMDX(nextConfig));

export default config;
