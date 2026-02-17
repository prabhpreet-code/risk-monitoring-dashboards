import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/en",
        destination: "/",
        permanent: false,
      },
      {
        source: "/zh-CN",
        destination: "/",
        permanent: false,
      },
      {
        source: "/th-TH",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
