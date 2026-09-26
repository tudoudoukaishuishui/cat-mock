import type { NextConfig } from "next";

const pages = process.env.GITHUB_PAGES === "1";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  ...(pages
    ? {
        output: "export" as const,
        basePath: "/cat-mock",
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
