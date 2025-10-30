import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Additional configurations
  turbopack: {
    // Ignore some parsing errors in turbo mode
    resolveAlias: {
      canvas: './empty-module.js',
    },
  },
  
  // Output configuration for better deployment
  output: 'standalone',
  
  // Webpack configuration to handle potential module issues
  webpack: (config) => {
    // Ignore specific warnings/errors
    config.ignoreWarnings = [
      /Critical dependency/,
      /the request of a dependency is an expression/,
    ];
    
    return config;
  },
};

export default nextConfig;
