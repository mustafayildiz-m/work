#!/bin/bash

# Proje ana dizini
PROJECT_DIR="/Users/mustafayildiz/Documents/IW_Developments"
BACKUP_DIR="$PROJECT_DIR/backups"
BACKUP_FILE="$BACKUP_DIR/db_backup.sql"

# Yedekleme klasörünü oluştur (yoksa)
mkdir -p "$BACKUP_DIR"

# Docker konteynırı üzerinden yedeği al
# '>' operatörü mevcut dosyanın üzerine yazar (bir öncekini silmiş olur)
docker exec islamic_windows_mysql /usr/bin/mysqldump -u root -proot islamic_windows > "$BACKUP_FILE"

# Log dosyasına kayıt ekle
echo "$(date): Veritabanı yedeği başarıyla alındı: $BACKUP_FILE" >> "$BACKUP_DIR/backup.log"
