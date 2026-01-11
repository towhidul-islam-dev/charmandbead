/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
 experimental: {
  serverActions: {
    bodySizeLimit: '10mb', 
  },
},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**', // Allows all paths from this host
      },
    ],
  },
};

export default nextConfig;
