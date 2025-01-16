import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ["pino", "pino-pretty"],
  webpack: (config, {}) => {
    config.resolve.alias['@'] = path.join(__dirname, 'src', 'app');
    return config;
  },
};

export default nextConfig;
