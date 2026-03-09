# Certbot SSL Sertifikaları

`certbot/conf/` klasörü **Git ile takip edilmez** – her sunucuda certbot tarafından oluşturulur.

## Canlı sunucuda ilk kurulum

```bash
# certbot/conf ve certbot/www klasörlerini oluştur
mkdir -p certbot/conf certbot/www

# İlk sertifika (nginx çalışırken)
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d islamicwindows.org -d www.islamicwindows.org
```

## Yenileme

Certbot konteyneri otomatik olarak her 12 saatte bir yeniler. Manuel yenileme:

```bash
docker compose -f docker-compose.prod.yml run --rm certbot renew
```
