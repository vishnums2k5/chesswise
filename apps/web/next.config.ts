import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@chesswise/shared-types'],
  serverExternalPackages: ['@prisma/client', '@chesswise/database', 'bullmq', 'ioredis'],
};

export default nextConfig;
