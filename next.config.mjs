import createMDX from "@next/mdx";
// import withPWA from "next-pwa";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["ts", "tsx", "mdx"],

  // Disable static optimization for error pages to avoid build issues
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  
  // Optimize CSS and imports
  experimental: {
    optimizeCss: true,
    // Disable static generation for error pages to avoid Html import bug
    staticGenerationRetryCount: 0,
    staticGenerationMaxConcurrency: 1,
    optimizePackageImports: [
      "@radix-ui/react-icons",
      "lucide-react",
      "@supabase/supabase-js",
      "framer-motion",
      "date-fns",
      "recharts",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-slot",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-label",
      "@radix-ui/react-popover",
      "@radix-ui/react-progress",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-separator",
      "@radix-ui/react-switch",
      "@radix-ui/react-toast",
      "class-variance-authority",
      "tailwind-merge",
      "clsx"
    ],
  },
  
  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Turbopack Configuration (Next.js 16+)
  // Turbopack is now stable and the default bundler
  // Provides 5-10x faster Fast Refresh and 2-5x faster builds
  // Custom webpack config removed in favor of Turbopack defaults
  turbopack: {
    rules: {
      // Configure MDX loader for Turbopack
      '*.mdx': {
        loaders: ['@mdx-js/loader'],
        as: '*.js',
      },
    },
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.youtube-nocookie.com https://app.posthog.com https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://i.ytimg.com https://img.youtube.com https://*.supabase.co",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co https://app.posthog.com wss://*.supabase.co",
              "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
              "media-src 'self' https://www.youtube.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
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

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    // Use MDX provider for global component registration (via src/mdx-components.tsx)
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: { className: "anchor" },
        },
      ],
      [
        rehypePrettyCode,
        {
          theme: "github-dark",
          keepBackground: true,
        },
      ],
    ],
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

// Disable PWA temporarily to avoid build issues
const config = withMDX(nextConfig);

export default config;