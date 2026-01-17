/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" }, // For Google Login
      { protocol: "https", hostname: "res.cloudinary.com" }, // If you use Cloudinary
    ],
  },
};

export default nextConfig;
