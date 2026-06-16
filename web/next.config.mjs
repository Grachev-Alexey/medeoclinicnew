const API_PORT = process.env.API_PORT || "3001";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // Allow importing source files from outside the web/ root (../shared schema/types)
  experimental: { externalDir: true },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `http://127.0.0.1:${API_PORT}/api/:path*`,
      },
      {
        source: "/objects/:path*",
        destination: `http://127.0.0.1:${API_PORT}/objects/:path*`,
      },
    ];
  },
};

export default nextConfig;
