import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // AVIF first, WebP fallback. Source files in /public stay .webp.
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 828, 1080, 1440, 1920, 2560],
    imageSizes: [96, 160, 256, 384, 512],
  },
  // Lint runs separately via `npm run lint` so a style warning never blocks a deploy.
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    optimizePackageImports: ['@react-three/drei', 'gsap'],
  },
};

export default nextConfig;
