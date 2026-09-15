#!/bin/bash
# IW production deploy.
#
# .env dosyalari git'te TAKIPLI DEGIL. Tek gercek kaynak: $ENV_STORE.
# Bu yuzden `git reset --hard` onlara dokunmaz; yedekle/geri-yukle dansina gerek yok.
# Script sadece dosyalarin yerinde oldugunu dogrular, eksikse deploy'u durdurur.
#
# Bir env degeri degisecekse: once $ENV_STORE icindeki dosyayi duzenleyin,
# sonra bu script'i calistirin. Boylece degisiklik bir sonraki deploy'da kaybolmaz.
set -euo pipefail

DEPLOY_DIR=${DEPLOY_DIR:-/root/IW_Developments}
ENV_STORE=${ENV_STORE:-/root/env_backup}
COMPOSE="docker compose -f docker-compose.prod.yml"

# "<repo icindeki yol>:<ENV_STORE icindeki ad>"
ENV_FILES=(
  ".env:.env"
  "backend/.env:backend.env"
  "admin-front/.env:admin-front.env"
  "admin-front/.env.local:admin-front.env.local"
  "user-front/.env.local:user-front.env.local"
  "user-front/.env.production:user-front.env.production"
)

echo "[1/4] Kod cekiliyor..."
cd "$DEPLOY_DIR"
git fetch origin
git reset --hard origin/main

echo "[2/4] .env dosyalari $ENV_STORE icinden yerlestiriliyor..."
missing=0
for pair in "${ENV_FILES[@]}"; do
  target="$DEPLOY_DIR/${pair%%:*}"
  source="$ENV_STORE/${pair##*:}"
  if [ ! -f "$source" ]; then
    echo "  EKSIK: $source (hedef: ${pair%%:*})"
    missing=1
    continue
  fi
  mkdir -p "$(dirname "$target")"
  cp "$source" "$target"
  echo "  ok: ${pair%%:*}"
done
if [ "$missing" -ne 0 ]; then
  echo "HATA: $ENV_STORE icinde eksik env dosyasi var. Deploy durduruldu."
  exit 1
fi

echo "[3/4] Kritik degiskenler dogrulaniyor..."
for key in MAIL_HOST MAIL_PORT MAIL_USER MAIL_PASS MAIL_FROM JWT_SECRET; do
  if ! grep -qE "^${key}=.+" "$DEPLOY_DIR/.env"; then
    echo "HATA: .env icinde $key bos veya yok. Deploy durduruldu."
    exit 1
  fi
done
echo "  ok"

echo "[4/4] Docker yeniden baslatiliyor..."
$COMPOSE build backend user-front admin-front
$COMPOSE up -d

echo ""
echo "=== Deploy tamamlandi! Site: https://islamicwindows.com ==="
docker ps --format "table {{.Names}}\t{{.Status}}"
echo ""
echo "SMTP durumu (backend acilis logu):"
sleep 20
docker logs islamic_windows_backend 2>&1 | grep -i "MailService" | tail -3 || echo "  (MailService logu bulunamadi)"
