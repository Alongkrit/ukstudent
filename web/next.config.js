/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // TODO: add the S3/CloudFront domain once provisioned, for expert
      // avatars and chat/attachment previews.
    ],
  },
};

module.exports = nextConfig;
