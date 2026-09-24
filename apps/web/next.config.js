/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@minaker/shared-types', '@minaker/ui-kit'],
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.theminaker.in',
      },
      // LocalStack S3 in dev
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4566',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  },
};

module.exports = nextConfig;
