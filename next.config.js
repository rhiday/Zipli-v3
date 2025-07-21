/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async redirects() {
    return [
      {
        source: '/donor/dashboard',
        destination: '/donate',
        permanent: true,
      },
    ]
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
  },
}

module.exports = nextConfig 