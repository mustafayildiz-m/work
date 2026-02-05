# Docker Kurulum Kılavuzu

## Hızlı Başlangıç

### 1. Gereksinimler
- Docker Desktop (veya Docker + Docker Compose)

### 2. Servisleri Başlatın
```bash
docker-compose up -d --build
```

Migration'lar otomatik olarak çalışacaktır. Backend container başlarken önce migration'ları çalıştırır, sonra uygulamayı başlatır.

### 3. Servislere Erişin
- **Backend API**: http://localhost:3000
- **Admin Panel**: http://localhost:5173
- **User Frontend**: http://localhost:3001
- **MySQL**: localhost:3315

## Temel Komutlar

```bash
# Tüm servisleri başlat
docker-compose up -d

# Tüm servisleri durdur
docker-compose down

# Logları görüntüle
docker-compose logs -f

# Belirli bir servisin loglarını görüntüle
docker-compose logs -f backend

# Servisleri yeniden başlat
docker-compose restart

# Container içine gir
docker-compose exec backend sh
```

## Navicat Bağlantı Bilgileri

```
Host: localhost
Port: 3315
User: islamic_user
Password: test_pass (veya .env dosyasındaki MYSQL_PASSWORD)
Database: islamic_windows
```

## Sorun Giderme

### Port Çakışması
`.env` dosyasında port değerlerini değiştirin:
```env
MYSQL_PORT=3316
BACKEND_PORT=3001
ADMIN_FRONT_PORT=5174
USER_FRONT_PORT=3002
```

### Migration Hataları
```bash
# Migration'ları tekrar çalıştır
docker-compose exec backend npm run migration:run
```

### Servisler Başlamıyor
```bash
# Logları kontrol et
docker-compose logs [service-name]

# Servisleri yeniden build et
docker-compose build --no-cache
docker-compose up -d
```

## Production Notları

Production'a deploy etmeden önce `.env` dosyasındaki şu değerleri güncelleyin:
- `MYSQL_ROOT_PASSWORD` ve `MYSQL_PASSWORD`: Güçlü şifreler
- `JWT_SECRET`: Güvenli bir secret key
- `NEXT_PUBLIC_API_URL` ve diğer URL'ler: Production domain'leri
