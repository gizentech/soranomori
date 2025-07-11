/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    LIFF_ID: '2007727551-lyNAQx1z', // 新しいLIFF IDに更新
  },
};

module.exports = nextConfig;