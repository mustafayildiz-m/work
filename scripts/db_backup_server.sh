#!/bin/bash
PROJECT_DIR="/root/IW_Developments"
BACKUP_DIR="$PROJECT_DIR/backups"
BACKUP_FILE="$BACKUP_DIR/db_backup.sql"
mkdir -p "$BACKUP_DIR"
docker exec islamic_windows_mysql /usr/bin/mysqldump -u root -proot islamic_windows > "$BACKUP_FILE"
echo "$(date): Backup successful" >> "$BACKUP_DIR/backup.log"
