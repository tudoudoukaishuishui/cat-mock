import type { NextConfig } from "next";

const pages = process.env.GITHUB_PAGES === "1";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: pages ? "/cat-mock" : "" },
  ...(pages
    ? {
        output: "export" as const,
        basePath: "/cat-mock",
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
