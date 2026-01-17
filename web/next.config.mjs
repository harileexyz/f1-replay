/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.formula1.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.openf1.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.formula1.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
