import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@react-pdf/renderer'],
  // Use this project as tracing root (avoids warning when lockfile exists in parent dir)
  outputFileTracingRoot: path.resolve(process.cwd()),
};

export default nextConfig;
