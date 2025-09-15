// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,

//   // Performance optimizations
//   compiler: {
//     removeConsole: process.env.NODE_ENV === 'production',
//   },

//   // Optimize for production
//   experimental: {
//     optimizePackageImports: [
//       'lucide-react',
//       'framer-motion',
//       'recharts',
//       '@supabase/supabase-js',
//       'date-fns',
//       'react-hook-form',
//     ],
//   },

//   // Minimal webpack config - remove the problematic parts
//   webpack: (config, { isServer, dev }) => {
//     // Fix Radix UI jsx-runtime issues with React 18
//     config.resolve.alias = {
//       ...config.resolve.alias,
//       'react/jsx-runtime': require.resolve('react/jsx-runtime'),
//       'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime'),
//     };

//     // Exclude problematic Radix UI packages to prevent webpack errors
//     if (!isServer) {
//       config.externals = config.externals || [];
//       config.externals.push({
//         '@radix-ui/react-slot': 'commonjs @radix-ui/react-slot',
//         '@radix-ui/react-dialog': 'commonjs @radix-ui/react-dialog',
//         '@radix-ui/react-select': 'commonjs @radix-ui/react-select',
//         '@radix-ui/react-tooltip': 'commonjs @radix-ui/react-tooltip',
//         '@radix-ui/react-popover': 'commonjs @radix-ui/react-popover',
//         '@radix-ui/react-dropdown-menu': 'commonjs @radix-ui/react-dropdown-menu',
//         '@radix-ui/react-progress': 'commonjs @radix-ui/react-progress',
//         '@radix-ui/react-radio-group': 'commonjs @radix-ui/react-radio-group',
//         '@radix-ui/react-label': 'commonjs @radix-ui/react-label',
//         '@radix-ui/react-checkbox': 'commonjs @radix-ui/react-checkbox',
//         '@radix-ui/react-tabs': 'commonjs @radix-ui/react-tabs',
//       });
//     }

//     // Only keep essential webpack configs
//     if (process.env.ANALYZE === 'true' && !isServer) {
//       const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
//       config.plugins.push(
//         new BundleAnalyzerPlugin({
//           analyzerMode: 'static',
//           openAnalyzer: false,
//         })
//       );
//     }

//     if (!isServer) {
//       // Optimize bundle splitting
//       config.optimization.splitChunks = {
//         chunks: 'all',
//         cacheGroups: {
//           default: false,
//           vendors: false,
//           framework: {
//             name: 'framework',
//             chunks: 'all',
//             test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
//             priority: 40,
//             enforce: true,
//           },
//           // Split commons into smaller, more specific chunks
//           supabase: {
//             name: 'supabase',
//             test: /[\\/]node_modules[\\/]@supabase[\\/]/,
//             chunks: 'all',
//             priority: 30,
//             enforce: true,
//           },
//           ui: {
//             name: 'ui-libs',
//             test: /[\\/]node_modules[\\/](lucide-react|framer-motion|recharts|radix-ui)[\\/]/,
//             chunks: 'all',
//             priority: 25,
//             enforce: true,
//           },
//           commons: {
//             name: 'commons',
//             chunks: 'all',
//             minChunks: 3,
//             priority: 20,
//             maxSize: 200000,
//           },
//           lib: {
//             test(module) {
//               return (
//                 module.size() > 160000 &&
//                 /node_modules[\\/]/.test(module.identifier())
//               );
//             },
//             name(module) {
//               const hash = require('crypto').createHash('sha1');
//               hash.update(module.identifier());
//               return hash.digest('hex').substring(0, 8);
//             },
//             priority: 30,
//             minChunks: 1,
//             reuseExistingChunk: true,
//           },
//         },
//       };
//     }
//     return config;
//   },

//   async redirects() {
//     return [
//       {
//         source: '/',
//         destination: '/auth/login',
//         permanent: true,
//       },
//     ];
//   },

//   // Production performance optimizations
//   poweredByHeader: false,
//   generateEtags: true,
//   compress: true,

//   // Asset optimization
//   assetPrefix: process.env.ASSET_PREFIX || '',

//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'vqtfcdnrgotgrnwwuryo.supabase.co',
//         port: '',
//         pathname: '**',
//       },
//     ],
//     // Optimize image loading
//     deviceSizes: [640, 768, 1024, 1280, 1600],
//     imageSizes: [16, 32, 48, 64, 96, 128, 256],
//     formats: ['image/webp', 'image/avif'],
//     minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache
//     dangerouslyAllowSVG: false,
//     contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
//   },

//   // Headers for better caching (complementing middleware)
//   async headers() {
//     return [
//       {
//         source: '/:path*',
//         headers: [
//           {
//             key: 'X-Frame-Options',
//             value: 'DENY',
//           },
//           {
//             key: 'X-Content-Type-Options',
//             value: 'nosniff',
//           },
//           {
//             key: 'Referrer-Policy',
//             value: 'strict-origin-when-cross-origin',
//           },
//         ],
//       },
//       // Optimize font loading
//       {
//         source: '/fonts/:path*',
//         headers: [
//           {
//             key: 'Cache-Control',
//             value: 'public, max-age=31536000, immutable',
//           },
//           {
//             key: 'Cross-Origin-Resource-Policy',
//             value: 'cross-origin',
//           },
//         ],
//       },
//     ];
//   },
// };

// module.exports = nextConfig;
