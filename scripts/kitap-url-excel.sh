#!/usr/bin/env bash
# Canlı veritabanındaki kitapları okuyup kısa /documents/ URL'leriyle Excel üretir.
# Kendi bilgisayarında çalıştır. Veritabanına ve dosyalara HİÇBİR yazma yapmaz.
#
# Kullanım:
#   ./scripts/kitap-url-excel.sh root@SUNUCU_IP
#   ./scripts/kitap-url-excel.sh root@SUNUCU_IP ~/Desktop/kitaplar.xlsx
#   BASE_URL=https://islamicwindows.org ./scripts/kitap-url-excel.sh root@SUNUCU_IP
#
# SSH anahtarı yerine parola kullanıyorsan (sshpass kurulu olmalı):
#   SSH_PASS='parola' ./scripts/kitap-url-excel.sh root@SUNUCU_IP
#
# Gereksinim: python3 + openpyxl  (yoksa: pip3 install openpyxl)
#
# URL formatı: {BASE_URL}/documents/{md5(dosya_adı)[:13]}.pdf
# Hash dosya adından türer; backend'deki DocumentsService ile aynı kuralı kullanır.

set -euo pipefail

HOST="${1:?Kullanım: $0 root@SUNUCU_IP [cikti.xlsx]}"
OUT="${2:-$HOME/Desktop/IslamicWindows_Kitaplar.xlsx}"
BASE_URL="${BASE_URL:-https://www.islamicwindows.com}"
CONTAINER="${CONTAINER:-islamic_windows_mysql}"
DB_USER="${DB_USER:-islamic_user}"
DB_PASS="${DB_PASS:-islamic_pass}"
DB_NAME="${DB_NAME:-islamic_windows}"

command -v python3 >/dev/null || { echo "HATA: python3 bulunamadı." >&2; exit 1; }
python3 -c "import openpyxl" 2>/dev/null || {
  echo "HATA: openpyxl kurulu değil. Kurmak için: pip3 install openpyxl" >&2; exit 1; }

# Parola ile giriş isteniyorsa sshpass üzerinden çalış
SSH=(ssh)
if [ -n "${SSH_PASS:-}" ]; then
  command -v sshpass >/dev/null || {
    echo "HATA: SSH_PASS verildi ama sshpass kurulu değil (brew install sshpass)." >&2; exit 1; }
  SSH=(sshpass -e ssh -o StrictHostKeyChecking=no)
  export SSHPASS="$SSH_PASS"
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "[1/3] $HOST üzerinden kitap kayıtları çekiliyor..."
# base64: Arapça/Kiril/Hintçe başlıkların SSH aktarımında bozulmaması için
"${SSH[@]}" "$HOST" \
  "docker exec $CONTAINER mysql --default-character-set=utf8mb4 -u$DB_USER -p$DB_PASS $DB_NAME -N -e \"
     SELECT b.id, IFNULL(bt.title,''), IFNULL(b.author,''), l.code,
            SUBSTRING_INDEX(bt.pdfUrl,'/',-1)
     FROM books b
     JOIN book_translations bt ON bt.bookId = b.id
     JOIN languages l ON l.id = bt.languageId
     WHERE bt.pdfUrl IS NOT NULL AND bt.pdfUrl <> ''
     ORDER BY b.id;\" 2>/dev/null | base64" > "$TMP/books.b64"

base64 -d -i "$TMP/books.b64" -o "$TMP/books.tsv" 2>/dev/null \
  || base64 -d < "$TMP/books.b64" > "$TMP/books.tsv"   # GNU/Linux uyumu

SATIR=$(wc -l < "$TMP/books.tsv" | tr -d ' ')
[ "$SATIR" -gt 0 ] || { echo "HATA: Hiç kayıt gelmedi. DB bilgilerini kontrol et." >&2; exit 1; }
echo "      $SATIR kayıt alındı."

echo "[2/3] Hash'ler üretilip Excel yazılıyor..."
TSV="$TMP/books.tsv" OUT="$OUT" BASE_URL="$BASE_URL" python3 - <<'PY'
import csv, hashlib, os, sys
import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill

tsv, out, base = os.environ['TSV'], os.environ['OUT'], os.environ['BASE_URL'].rstrip('/')

rows = []
with open(tsv, encoding='utf-8') as f:
    for r in csv.reader(f, delimiter='\t'):
        if len(r) < 5:
            continue
        bid, title, author, lang, fname = r[0], r[1], r[2], r[3], r[4]
        h = hashlib.md5(fname.encode()).hexdigest()[:13]
        rows.append((int(bid), title, author or 'Belirtilmemiş', lang,
                     f'{base}/documents/{h}.pdf', fname, h))

hashes = [r[6] for r in rows]
if len(set(hashes)) != len(hashes):
    print(f'HATA: {len(hashes) - len(set(hashes))} hash çakışması var!', file=sys.stderr)
    sys.exit(1)

HDR_FILL = PatternFill('solid', fgColor='1F4E5F')

def basliklandir(ws, basliklar, genislikler):
    ws.append(basliklar)
    for i in range(1, len(basliklar) + 1):
        c = ws.cell(1, i)
        c.font = Font(bold=True, color='FFFFFF', size=11)
        c.fill = HDR_FILL
        c.alignment = Alignment(horizontal='center', vertical='center')
    ws.freeze_panes = 'A2'
    for col, w in zip('ABCDEFG', genislikler):
        ws.column_dimensions[col].width = w

wb = openpyxl.Workbook()

ws = wb.active
ws.title = 'Kitaplar'
basliklandir(ws, ['ID', 'Kitap Adı', 'Yazar', 'Dil Kodu', 'URL'], [7, 52, 34, 10, 62])
for bid, title, author, lang, url, fname, h in rows:
    ws.append([bid, title, author, lang, url])
    u = ws.cell(ws.max_row, 5)
    u.hyperlink = url
    u.font = Font(color='0563C1', underline='single')
    ws.cell(ws.max_row, 4).alignment = Alignment(horizontal='center')
ws.auto_filter.ref = f'A1:E{ws.max_row}'

ws2 = wb.create_sheet('Eslestirme')
basliklandir(ws2, ['Hash', 'Gerçek Dosya Adı', 'Mevcut Yol'], [16, 50, 66])
for *_, fname, h in rows:
    ws2.append([h, fname, '/uploads/pdfs/' + fname])

wb.save(out)
print(f'      {len(rows)} satır yazıldı, hash çakışması yok.')
PY

echo "[3/3] Tamamlandı: $OUT"
