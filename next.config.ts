import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/backend-api/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://sis-escolar.local'}/api/v1/:path*`,
      },
      {
        source: '/sanctum/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://sis-escolar.local'}/sanctum/:path*`,
      },
    ];
  },
};

export default nextConfig;
