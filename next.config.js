/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Optimize for production
  experimental:
    process.env.NODE_ENV === 'production'
      ? {
          optimizePackageImports: [
            'lucide-react',
            'framer-motion',
            'recharts',
            '@supabase/supabase-js',
            'date-fns',
            'react-hook-form',
          ],
        }
      : {},

  async redirects() {
    return [
      {
        source: '/donor/dashboard',
        destination: '/donate',
        permanent: true,
      },
    ];
  },

  // Production performance optimizations
  poweredByHeader: false,
  generateEtags: true,
  compress: true,

  // Asset optimization
  assetPrefix: process.env.ASSET_PREFIX || '',

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vqtfcdnrgotgrnwwuryo.supabase.co',
        port: '',
        pathname: '**',
      },
    ],
    // Optimize image loading
    deviceSizes: [640, 768, 1024, 1280, 1600],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Headers for better caching (complementing middleware)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      // Optimize font loading
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
