#!/bin/bash
# Gecelik MySQL yedegi.
#
# ONEMLI: eski surum `-u root -proot` kullaniyordu, bu kimlik bilgisi tutmuyor.
# Cikis kodu da kontrol edilmedigi icin yedek dosyasi 0 byte kaliyor ama log'a
# "Backup successful" yaziliyordu. Bu yuzden hata kontrolu ve boyut dogrulamasi
# eklendi; yedek basarisizsa script hata ile cikar ve log'a FAILED yazar.
set -euo pipefail

PROJECT_DIR="/root/IW_Developments"
BACKUP_DIR="$PROJECT_DIR/backups"
LOG_FILE="$BACKUP_DIR/backup.log"
KEEP_DAYS=${KEEP_DAYS:-14}

DB_NAME=${DB_NAME:-islamic_windows}
DB_USER=${DB_USER:-islamic_user}
DB_PASS=${DB_PASS:-islamic_pass}
CONTAINER=${CONTAINER:-islamic_windows_mysql}

mkdir -p "$BACKUP_DIR"
stamp=$(date +%Y%m%d_%H%M%S)
target="$BACKUP_DIR/db_backup_$stamp.sql.gz"

log() { echo "$(date): $*" >> "$LOG_FILE"; }

fail() {
  log "FAILED: $1"
  rm -f "$target"
  echo "Yedek basarisiz: $1" >&2
  exit 1
}

# --single-transaction: InnoDB tablolarini kilitlemeden tutarli anlik goruntu alir.
if ! docker exec "$CONTAINER" mysqldump \
      -h127.0.0.1 -u"$DB_USER" -p"$DB_PASS" \
      --single-transaction --quick --routines --events \
      "$DB_NAME" 2>/dev/null | gzip > "$target"; then
  fail "mysqldump hata verdi"
fi

size=$(stat -c%s "$target")
# Bos ya da sadece gzip basligindan ibaret bir dosya gecerli yedek degildir.
if [ "$size" -lt 1024 ]; then
  fail "yedek dosyasi cok kucuk ($size byte)"
fi

# Sadece dogrulanmis yedek "en son" olarak isaretlenir.
ln -sf "$(basename "$target")" "$BACKUP_DIR/db_backup_latest.sql.gz"
find "$BACKUP_DIR" -name 'db_backup_*.sql.gz' -mtime +"$KEEP_DAYS" -delete

log "OK: $(basename "$target") ($size byte)"
echo "Yedek alindi: $target ($size byte)"
