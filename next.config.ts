import type { NextConfig } from "next";

const pages = process.env.GITHUB_PAGES === "1";
const pagesBase = process.env.PAGES_BASE_PATH ?? "/cat-mock";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: pages ? pagesBase : "" },
  ...(pages
    ? {
        output: "export" as const,
        basePath: pagesBase,
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
