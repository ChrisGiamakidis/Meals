/** @type {import('next').NextConfig} */
const { loadLocalEnv, requireEnv } = require("./lib/environment").default;

loadLocalEnv();

const r2PublicUrl = new URL(requireEnv("R2_PUBLIC_URL"));

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: r2PublicUrl.protocol.replace(":", ""),
        hostname: r2PublicUrl.hostname,
      },
    ],
  },
};

module.exports = nextConfig;
