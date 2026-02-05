# Docker Ortam Yönetimi

Bu proje farklı ortamlar için ayrı Docker Compose yapılandırmaları kullanır.

## 📁 Dosya Yapısı

```
├── docker-compose.yml              # Temel yapılandırma (tüm ortamlar için ortak)
├── docker-compose.override.yml     # Localhost için (GIT'E EKLENMEMELİ)
└── docker-compose.prod.yml         # Production için
```

## 🖥️ Localhost'ta Çalıştırma

```bash
# Otomatik olarak docker-compose.yml + docker-compose.override.yml kullanır
docker compose up -d

# Logları görmek için
docker compose logs -f

# Durdurmak için
docker compose down
```

**Not**: `docker-compose.override.yml` dosyası `.gitignore`'da. Her developer kendi override dosyasını oluşturmalı.

## 🚀 Production'da Çalıştırma

```bash
# Production yapılandırmasıyla çalıştır
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Logları görmek için
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Durdurmak için
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

## 🔄 Güncelleme (Production)

```bash
# Kodu çek
git pull origin main

# Container'ları yeniden oluştur
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Veya sadece değişen servisileri yeniden oluştur
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build admin-front user-front backend
```

## ⚙️ Environment Variables

### Localhost (docker-compose.override.yml)
- `NEXT_PUBLIC_API_URL`: http://localhost:3000
- `NEXTAUTH_URL`: http://localhost:3001
- `USE_PRODUCTION_HMR`: false

### Production (docker-compose.prod.yml)
- `NEXT_PUBLIC_API_URL`: https://islamicwindows.com/api
- `NEXTAUTH_URL`: https://islamicwindows.com
- `USE_PRODUCTION_HMR`: true

## 🔍 Debug

Hangi yapılandırmanın yüklendiğini görmek için:

```bash
# Localhost
docker compose config

# Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml config
```

## 📝 Yeni Ortam Eklemek

Staging ortamı için:

```bash
# docker-compose.staging.yml oluştur
# Sonra çalıştır:
docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d
```

## ⚠️ Önemli Notlar

1. **docker-compose.override.yml** asla git'e eklenmemeli
2. Production'da **mutlaka** `-f docker-compose.prod.yml` parametresi kullanılmalı
3. Localhost'ta override dosyası otomatik yüklenir, parametre gerekmez
