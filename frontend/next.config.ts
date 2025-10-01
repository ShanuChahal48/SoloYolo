import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'soloyolo.onrender.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  // Help Next.js know the monorepo root to avoid lockfile ambiguity warnings
  outputFileTracingRoot: path.join(__dirname, '..', '..'),
};

export default nextConfig;
