import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Output configuration
  output: 'standalone',
  
  // Fix workspace root detection
  outputFileTracingRoot: process.cwd(),
  
  // Experimental features for stability
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  
  // Webpack configuration
  webpack: (config, { isServer, dev }) => {
    // Ignore specific warnings
    config.ignoreWarnings = [
      /Critical dependency/,
      /the request of a dependency is an expression/,
    ];
    
    // Handle module resolution for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
      };
    }
    
    // Optimize chunk loading in development
    if (dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'named',
        chunkIds: 'named',
      };
    }
    
    return config;
  },
};

export default nextConfig;