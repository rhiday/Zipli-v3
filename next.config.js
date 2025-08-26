/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Optimize for production
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
    optimizeCss: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Simplified webpack config for faster builds
  webpack: (config) => {
    // Basic optimization without complex splitting
    if (!config.resolve) config.resolve = {};
    if (!config.resolve.alias) config.resolve.alias = {};

    // Optimize for faster builds
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    };

    return config;
  },

  async redirects() {
    return [
      {
        source: '/donor/dashboard',
        destination: '/donate',
        permanent: true,
      },
    ];
  },

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
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  },
};

module.exports = nextConfig;
