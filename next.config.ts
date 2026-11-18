import type { NextConfig } from "next";
import { allowedDevHosts } from "./lib/net/lan";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@libsql/client"],
  allowedDevOrigins: allowedDevHosts(),
};

export default nextConfig;
