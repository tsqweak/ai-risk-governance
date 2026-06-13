import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@airg/db", "@airg/risk-engine"],
  serverExternalPackages: ["@prisma/client"]
};

export default nextConfig;
