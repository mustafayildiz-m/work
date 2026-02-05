# User Front - Islamic Social Platform

Bu proje [Next.js](https://nextjs.org/) ile geliştirilmiş İslami sosyal medya platformudur.

## 🚀 Hızlı Başlangıç

### Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

[http://localhost:3001](http://localhost:3001) adresinde uygulamayı görüntüleyebilirsiniz.

### Environment Variables

Local geliştirme için `.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key
```

## 🌐 Production Deployment

Production kurulumu için detaylı rehber: [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)

### Kısa Özet:
- **Frontend URL**: `https://user.yourdomain.com`
- **API URL**: `https://api.yourdomain.com`
- **PM2** ile process management
- **Nginx** ile reverse proxy
- **SSL** sertifikası (Let's Encrypt)

## 📚 Özellikler

- 🔐 NextAuth.js ile kimlik doğrulama
- 💬 WebSocket tabanlı gerçek zamanlı chat
- 📱 Responsive tasarım
- 🔍 Gelişmiş arama sistemi
- 📰 İslami haber entegrasyonu
- 👥 Kullanıcı ve alim takip sistemi
- 📝 Post ve yorum sistemi

## 🛠️ Teknolojiler

- **Frontend**: Next.js 14, React 18
- **Styling**: SCSS, Bootstrap
- **Authentication**: NextAuth.js
- **Real-time**: WebSocket
- **State Management**: React Context
- **Deployment**: PM2, Nginx

## 📖 Dokümantasyon

- [Authentication System](./AUTH_SYSTEM_README.md)
- [WebSocket Chat](./WEBSOCKET_CHAT_README.md)
- [Search Implementation](./SEARCH_IMPLEMENTATION_README.md)
- [Islamic News](./ISLAMIC_NEWS_README.md)
- [Timeline Posts](./TIMELINE_POSTS_README.md)

## 🚀 Deploy

### Vercel (Önerilen)
[Vercel Platform](https://vercel.com/new) ile kolayca deploy edebilirsiniz.

### VPS/Server
Detaylı kurulum için [Production Deployment Guide](./PRODUCTION_DEPLOYMENT.md) dosyasını inceleyin.

## 📄 Lisans

Bu proje özel lisans altındadır.
