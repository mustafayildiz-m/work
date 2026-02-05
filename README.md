# Islamic Windows Project

Bu proje, İslami içerik yönetimi için geliştirilmiş bir full-stack web uygulamasıdır.

## Proje Yapısı

- **backend/**: NestJS ile geliştirilmiş REST API
- **admin-front/**: React + Vite ile geliştirilmiş admin paneli
- **user-front/**: Next.js ile geliştirilmiş kullanıcı arayüzü

## Hızlı Başlangıç

### Gereksinimler

- Docker Desktop (veya Docker + Docker Compose)
- Git

### Kurulum Adımları

1. **Projeyi klonlayın:**
```bash
git clone git@github.com:mustafayildiz-m/iw_project.git
cd iw_project
```

2. **Docker ile projeyi başlatın:**
```bash
docker-compose up -d --build

docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

docker exec islamic_windows_nginx nginx -s reload

```


Migration'lar **otomatik olarak** çalışacaktır. Backend container başlarken önce MySQL'in hazır olmasını bekler, sonra migration'ları çalıştırır ve uygulamayı başlatır.

### Servislere Erişim

- **Backend API**: http://localhost:3000
- **Admin Panel**: http://localhost:5173
- **User Frontend**: http://localhost:3001
- **MySQL**: localhost:3315

### Temel Komutlar

```bash
# Tüm servisleri başlat
docker-compose up -d

# Logları görüntüle
docker-compose logs -f

# Backend loglarını görüntüle (migration durumunu görmek için)
docker-compose logs -f backend

# Servisleri durdur
docker-compose down

# Servisleri yeniden başlat
docker-compose restart

# Veritabanını sıfırlayıp yeniden başlat (migration'lar tekrar çalışır)
docker-compose down -v
docker-compose up -d --build
```

## Teknolojiler

- Backend: NestJS, TypeORM, MySQL, Redis
- Admin Panel: React, Vite, Tailwind CSS
- User Frontend: Next.js, React

## Detaylı Dokümantasyon

Detaylı kurulum ve yapılandırma bilgileri için `DOCKER_README.md` dosyasına bakın.

