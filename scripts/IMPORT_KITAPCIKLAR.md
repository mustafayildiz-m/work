# Kitapçık Toplu Import — Roadmap

136 kitapçık + PDF (`teslim/` klasörü) → Islamic Windows sistemi.

## Ön koşullar

- `teslim/kitapciklar.xlsx` ve `teslim/pdfler/` hazır
- Backend çalışıyor (local: `localhost:3000` veya canlı sunucu)
- MySQL erişimi (script doğrudan DB üzerinden çalışır)

## Adımlar

| Adım | Komut | Amaç |
|------|-------|------|
| **1** | `npm run import:kitapciklar -- --dry-run` | Excel + PDF + kitap eşleşmesi doğrula, DB'ye yazma |
| **2** | `npm run import:kitapciklar -- --limit 5` | İlk 5 kaydı test yükle |
| **3** | Admin panelden kontrol | Kitapçıklar doğru kitaba, PDF açılıyor mu? |
| **4** | `npm run import:kitapciklar` | Kalan 131 kaydı yükle (veya `--skip 5`) |
| **5** | Canlıda Almanca kitapçık listesini kontrol et | 136 kayıt görünüyor mu? |

## Ortam değişkenleri

```bash
# Opsiyonel — varsayılan: ../../teslim (proje kökü)
TESLIM_DIR=/path/to/teslim

# Canlı sunucuda docker içinden:
docker exec islamic_windows_backend npm run import:kitapciklar -- --dry-run
```

## Bayraklar

| Bayrak | Açıklama |
|--------|----------|
| `--dry-run` | Sadece doğrulama, import yok |
| `--limit N` | İlk N kayıt |
| `--skip N` | İlk N kaydı atla (devam import) |
| `--ignore-pdf-errors` | Bozuk PDF uyarısını atla |

## Bilinen eşleştirmeler

- `GESTÄNDNISSE EINES BRITISCHEN SPIONS` → canlı kitap id=99 (uzun ad)
- PDF dosya adı boşsa → `{başlık}.pdf` otomatik
- Sıra No boşsa → başlıktaki numaradan üretilir (`1.4` → 104)

## Log

Import sonuçları: `teslim/import-log.json`
