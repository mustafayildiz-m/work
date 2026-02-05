/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Transpile external packages (like leaflet) to support CSS imports
  // transpilePackages removed
  // Disable ESLint errors from failing production builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Webpack configuration
  webpack: (config) => {
    // Canvas ve encoding modüllerini devre dışı bırak (gerekli değilse)
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    // Prod/Canlıda (ve hatta dev server canlıda çalışırken) sourcemap uyarılarını kapat
    // Firefox devtools'ta görülen webpack:// ve eksik *.map isteklerini engeller.
    config.devtool = false;
    return config;
  },
  images: {
    unoptimized: true, // Docker içinde image optimization sorunları olduğu için devre dışı bırakıldı
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      // Production API domain
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      // News image domains
      {
        protocol: 'https',
        hostname: 'sakaryagazetesicomtr.teimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.teimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cdninstagram.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.fbcdn.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '/**',
      },
      // Allow all HTTPS domains for news images (safer than allowing all protocols)
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
      // Production API domain already added above
      // Unsplash domain for images
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
    // Image optimization settings for better performance
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60, // Cache images for at least 60 seconds
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // NextAuth middleware konfigürasyonu - experimental middleware kaldırıldı
  // Middleware konfigürasyonu middleware.js dosyasında yapılmalı
};

export default nextConfig;
