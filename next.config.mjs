/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // Vercel 上のビルドは自動で確認用になる（PHP が動かないので、api/store.js が Vercel Blob に保存する）
  env: {
    NEXT_PUBLIC_REVIEW: process.env.VERCEL ? '1' : process.env.NEXT_PUBLIC_REVIEW || '',
  },
};

export default nextConfig;
