/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'vqtfcdnrgotgrnwwuryo.supabase.co', // Supabase Storage domain
    ],
  },
}

module.exports = nextConfig 