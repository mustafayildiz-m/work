/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Eski tarayıcılar için node_modules'dan modern syntax transpile et
  transpilePackages: ['react-bootstrap', 'react-pdf', 'react-select', 'react-icons'],
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

  // CSP: YouTube iframe ve üçüncü taraf embed'ler için - require-trusted-types kullanılmıyor
  // (YouTube iframe'leri trusted-types ile uyumsuz)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: http:",
              "frame-src 'self' https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://www.google.com",
              "connect-src 'self' https: http: wss: ws:",
              "media-src 'self' blob: https: http:",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
