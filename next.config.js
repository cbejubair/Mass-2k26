/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Allow medium-large multipart uploads (music tracks) without proxy cutoff.
    proxyClientMaxBodySize: 25 * 1024 * 1024,
  },
};

module.exports = nextConfig;
