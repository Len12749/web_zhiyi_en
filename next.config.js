/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['postgres', 'drizzle-orm'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // 针对特定API路由的配置
  async rewrites() {
    return [
      {
        source: '/api/files/upload',
        destination: '/api/files/upload',
        has: [
          {
            type: 'header',
            key: 'content-type',
            value: '.*multipart/form-data.*',
          },
        ],
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/api/sse/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Connection',
            value: 'keep-alive',
          },
        ],
      },
      {
        source: '/api/files/upload',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 
 