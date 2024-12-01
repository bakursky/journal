/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['fal.media'],
      },
    env: {
        FAL_KEY: process.env.FAL_KEY,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    },
  };
export default nextConfig;
