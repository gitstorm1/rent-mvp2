import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['pdf-parse'],
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
    proxyClientMaxBodySize: '5mb',
  },
};

export default nextConfig;
