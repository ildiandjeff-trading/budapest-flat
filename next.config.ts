import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Friends-only site: tell search engines not to index or follow any URL (pages, icons, files)
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
};

export default nextConfig;
