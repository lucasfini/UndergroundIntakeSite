/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    deviceSizes: [640, 750, 828, 1080, 1280, 1536, 1920],
  },
}

module.exports = nextConfig
