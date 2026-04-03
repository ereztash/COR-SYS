import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@react-pdf/renderer'],
  // Use this project as tracing root (avoids warning when lockfile exists in parent dir)
  outputFileTracingRoot: path.resolve(process.cwd()),
  // Force no-cache on all responses to bust proxy/tunnel caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
    ]
  },
};

export default nextConfig;
