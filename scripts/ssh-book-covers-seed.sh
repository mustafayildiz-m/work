#!/usr/bin/env bash
# Canlıda backend'i yeniden derleyip kitap kapaklarını DB ile eşleştirir.
# Kendi bilgisayarında çalıştır (sunucuda SSH anahtarın tanımlı olmalı).
#
# Kullanım:
#   ./scripts/ssh-book-covers-seed.sh root@SUNUCU_IP
#   ./scripts/ssh-book-covers-seed.sh root@SUNUCU_IP /root/IW_Developments
#
# Sunucuda repo güncel değilse önce: git pull / rsync ile kodu gönder.

set -euo pipefail

HOST="${1:?Kullanım: $0 root@SUNUCU_IP [uzak_proje_dizini]}"
REMOTE_DIR="${2:-/root/IW_Developments}"

ssh -t "$HOST" bash -s <<EOF
set -euo pipefail
cd "$REMOTE_DIR"
docker compose -f docker-compose.prod.yml up -d --build backend
docker exec islamic_windows_backend npm run seed:book-covers
EOF
