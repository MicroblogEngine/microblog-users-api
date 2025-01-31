import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ['pino', 'pino-pretty'],
  headers: async () => {
    return [
      {
        source: "/(.*)",
        headers: [
          { 
            key: "Access-Control-Allow-Origin", 
            value: "*" 
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
  webpack: (config, {}) => {
    config.resolve.alias["@"] = path.join(__dirname, "src", "app");
    return config;
  },
};

export default nextConfig;
