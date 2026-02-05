import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Nginx arkasında mı çalışıyoruz kontrolü
const isProduction = process.env.USE_PRODUCTION_HMR === 'true';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Admin panel Nginx arkasında /admin altında çalışacak
  base: "/admin/",
  publicDir: "public",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 3000,
  },
  preview: {
    port: 5173,
    host: "0.0.0.0",
    allowedHosts: ["localhost", "islamicwindows.com", "www.islamicwindows.com", "admin-front"],
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    watch: {
      usePolling: true,
      interval: 1000,
    },
    // Nginx reverse proxy arkasından erişim için
    allowedHosts: ["islamicwindows.com", "www.islamicwindows.com", "admin-front", "localhost"],
    // HTTPS üzerinden HMR - sadece production'da (nginx arkasında)
    hmr: isProduction ? {
      protocol: "wss",
      host: "islamicwindows.com",
      clientPort: 443,
    } : {
      // Localhost için default HMR ayarları
      protocol: "ws",
      host: "localhost",
      port: 5173,
    },
  },
});
