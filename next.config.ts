import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Pin the workspace root (a stray package-lock.json exists in the home dir).
  turbopack: { root: import.meta.dirname },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  // Drizzle + postgres.js are server-only; keep them out of the client bundle.
  serverExternalPackages: ['postgres'],
};

export default nextConfig;
