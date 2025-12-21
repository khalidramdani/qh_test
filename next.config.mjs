/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbopack: {
      root: process.cwd(),
    },
  },
};

export default nextConfig;
