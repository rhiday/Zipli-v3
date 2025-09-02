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
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'recharts',
      '@supabase/supabase-js',
      'date-fns',
      'react-hook-form',
    ],
  },

  // Configure webpack for better tree shaking
  webpack: (config, { isServer }) => {
    // Enable bundle analyzer when ANALYZE=true
    if (process.env.ANALYZE === 'true' && !isServer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
    }
    if (!isServer) {
      // Replace react with preact in production for smaller bundle
      config.resolve.alias = {
        ...config.resolve.alias,
        'react/jsx-runtime': 'react/jsx-runtime',
      };

      // Optimize bundle splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          // Split commons into smaller, more specific chunks
          supabase: {
            name: 'supabase',
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            chunks: 'all',
            priority: 30,
            enforce: true,
          },
          ui: {
            name: 'ui-libs',
            test: /[\\/]node_modules[\\/](lucide-react|framer-motion|recharts|radix-ui)[\\/]/,
            chunks: 'all',
            priority: 25,
            enforce: true,
          },
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 3, // Increase threshold to reduce commons size
            priority: 20,
            maxSize: 200000, // Limit commons to 200KB
          },
          lib: {
            test(module) {
              return (
                module.size() > 160000 &&
                /node_modules[\\/]/.test(module.identifier())
              );
            },
            name(module) {
              const hash = require('crypto').createHash('sha1');
              hash.update(module.identifier());
              return hash.digest('hex').substring(0, 8);
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
        },
      };
    }
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
