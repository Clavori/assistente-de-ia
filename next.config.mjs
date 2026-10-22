/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['@whiskeysockets/baileys', 'qrcode', 'bcryptjs', '@electric-sql/pglite', 'pg']
  }
};

export default nextConfig;
