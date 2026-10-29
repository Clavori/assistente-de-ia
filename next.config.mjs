/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
    serverComponentsExternalPackages: ['@whiskeysockets/baileys', 'qrcode', 'bcryptjs', '@electric-sql/pglite', 'pg'],
    outputFileTracingIncludes: {
      '/api/**/*': ['./prisma/dev.db']
    }
  }
};

export default nextConfig;
