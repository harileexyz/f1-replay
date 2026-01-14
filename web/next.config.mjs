/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow loading race data from Firebase Storage
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
