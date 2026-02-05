# Islamic Windows Backend API

NestJS ile geliştirilmiş, İslami içerik paylaşım platformu backend API'si.

## 🚀 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# .env dosyası oluştur ve veritabanı bilgilerini ayarla
# Gerekli değişkenler: DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE, JWT_SECRET
```

## 📦 Veritabanı Kurulumu

```bash
# Migration'ları çalıştır (sunucuda da bu komutu kullan)
npm run migration:run

# Admin kullanıcısını oluştur
npx ts-node src/users/seed-admin.ts

# Dil verilerini yükle (opsiyonel)
npm run seed:languages

# Çok dilli kitap verilerini yükle (opsiyonel)
npm run seed:multilanguage-books

# Makale verilerini yükle (opsiyonel)
npm run seed:multilanguage-articles

# Tüm seed'leri çalıştır
npm run seed:all
```

## ⚙️ Migration Komutları

```bash
# Migration çalıştır (production için)
npm run migration:run

# Yeni migration oluştur
npm run migration:generate src/migrations/MigrationName

# Migration'ı geri al
npm run migration:revert
```

## 🏃 Uygulamayı Çalıştırma

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

## 🧪 Test

```bash
# Unit testler
npm run test

# E2E testler
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📁 Proje Yapısı

```
src/
├── articles/       # Makale yönetimi
├── auth/          # Kimlik doğrulama
├── books/         # Kitap yönetimi
├── chat/          # WebSocket chat sistemi
├── scholars/      # Âlim profilleri
├── users/         # Kullanıcı yönetimi
├── upload/        # Dosya yükleme
└── migrations/    # Veritabanı migration'ları
```

## 🔧 Önemli Notlar

- **Sunucuda Migration**: Sunucuya deploy ettikten sonra `npm run migration:run` komutunu çalıştırın
- TypeORM kullanılmaktadır
- WebSocket desteği mevcuttur
- JWT tabanlı authentication
- MySQL/MariaDB veritabanı gereklidir

## 📄 Lisans

UNLICENSED - Private Project
