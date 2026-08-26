# Dil İkiliğini Birleştirme Planı (languages tablosu tekilleştirme)

Durum: taslak · Hazırlanma tarihi: 2026-08-26 · Ön koşul: ülke→dil→içerik filtrelerinden önce tamamlanmalı

## 1. Problem ve kök neden

`languages` tablosunda iki nesil kayıt iç içe duruyor:

| Nesil | Adet | Örnek | `code` | `iso639_3` |
|---|---|---|---|---|
| Legacy (Türkçe adlı, 639-1 kodlu) | 83 | `27 Endonezyaca` | `id` | `id` |
| QA-300 / Ethnologue seed (İngilizce adlı, 639-3 kodlu) | 305 | `142 Indonesian` | `ind` | `ind` |

**Kök neden:** `backend/src/seeders/qa-300-languages-seeder.ts:44` mevcut kaydı yalnızca
`{ iso639_3: entry.iso639_3 }` veya `{ code: entry.iso639_3 }` ile arıyor. Legacy satırlarda
`iso639_3` alanına 2 harfli kod yazılmış olduğu için (`id`, `ja`, `ru`…) `ind` araması boş dönüyor
ve seeder ikinci bir satır yaratıyor. Legacy satırın `iso639_3`'ü doğru olan 6 dilde
(`tur, eng, ara, deu, fra, spa`) eşleşme tuttuğu için orada kopya oluşmamış — o satırlar
yerinde güncellenmiş. Fark tam olarak buradan geliyor.

## 2. Ölçülen etki (yerel DB, 2026-08-26)

- Toplam dil: **388** (83 legacy + 305 yeni)
- Tespit edilen kopya çift: **54**
- Kopya çiftlerinin **yeni** tarafındaki veri: `book_translations 0`, `book_page_translations 0`,
  `qa_item/category/tag_translations 0/0/0`, `country_languages 0`, `countries.primaryLanguageId 0`
- Kopya çiftlerinin **legacy** tarafındaki veri: `book_translations 139`, `book_page_translations 36`,
  `qa_item 128`, `qa_category 112`, `qa_tag 240`, `country_languages 90`, `primaryLanguageId 76`
- Çakışma (aynı kitap/ülke hem legacy hem yeni dile bağlı): **0**
- Yeni tarafta QA'da aktif olan kopya: **0**
- Kopya satırları parent olarak gösteren çocuk diller: **16** (Chinese `108` → 11 çocuk, Malay `130` → 5 çocuk)
- `iso639_3` alanı hâlâ 2 harfli olan satır: **77**

**Sonuç: birleştirme tek yönlü ve veri kaybı riski taşımıyor.** Tüm gerçek veri legacy tarafta,
yeni taraf boş. Yani ID remap gerektiren bir taşıma yok; yeni satırın *metadata*'sı legacy satıra
aktarılıp yeni satır silinecek.

## 3. Kararlar

**K1 — Hayatta kalan satır: legacy ID.**
274 kitap, 192 QA çevirisi, 279 country_languages satırı ve 249 ülkenin primaryLanguageId'si legacy
ID'lere bağlı. Legacy'yi koruyunca hiçbir FK dokunulmuyor; tersi 700+ satırlık remap demek.
Bedeli: ID'ler "yeni" seed sırasını izlemiyor — kozmetik.

**K2 — `code` alanı UI kodu olarak kalır (639-1 varsa 2 harfli), `iso639_3` kanonik anahtar olur.**
`admin-front/src/utils/languageUtils.js` i18n haritası 2 harfli kodla çalışıyor; `paper_translations.languageCode`,
`podcasts.language`, `users.language`, `newsletters.sourceLanguage` alanları da 2 harfli kod tutuyor
(`tr, en, de, it, ja, ru`). `code`'u 639-3'e çevirmek bu 4 tabloyu ve i18n haritasını kırar.
Kural: **eşleştirme daima `iso639_3` üzerinden**, gösterim ve legacy kod alanları `code` üzerinden.

**K3 — Ad alanları:** `name` = Türkçe ad (legacy'den korunur), `englishName`/`nativeName`/`direction`/`aliases`
= yeni satırdan devralınır. Böylece admin Türkçe, QA tarafı İngilizce/yerel adı görebilir.

**K4 — Kopya olmayan legacy diller** (Swahili, Başkurtça, Hausa, Igbo, Yoruba, Çuvaşça… ~23 adet)
silinmez; yalnızca `iso639_3` backfill edilir.

## 4. Uygulama adımları

### Adım 0 — Yedek ve doğrulama seti
- `mysqldump` ile `languages, country_languages, countries, book_translations, book_page_translations, qa_*_translations` yedeği al (`backups/` altına).
- Migration öncesi sayımları bir "before" raporuna yaz: dil sayısı, tablo başına satır sayısı, dil başına kitap/QA dağılımı.

### Adım 1 — Eşleştirme haritasını sabitle (kod içinde, veri olarak)
`backend/src/migrations/<ts>-MergeDuplicateLanguages.ts` içine **elle doğrulanmış** `legacyCode → iso639_3`
haritası gömülecek. Kaynaklar:
1. `aliases` LIKE eşleşmesi ile bulunan 50 çift (Farsça↔`fas`, Rusça↔`rus`, Japonca↔`jpn`, …)
2. `aliases`'ta yakalanmayan 4 çift: `hi→hin`, `id→ind`, `az→aze`, `ug→uig`
3. Elle karar isteyen kenar durumlar (aşağıda)

Harita migration'a **statik dizi** olarak yazılır; runtime'da LIKE ile tahmin yapılmaz.

**Elle onay isteyen eşleşmeler:**
| Legacy | Aday | Not |
|---|---|---|
| `29 Tagalog (tl)` | `158 Filipino (fil)` | Tagalog ≠ Filipino; ayrı tutma seçeneği var |
| `97 Myanmar (my)` | `152 Burmese (mya)` | ad farkı, dil aynı |
| `98 Nepalce (ne)` | `180 Nepali (npi)` | `npi` bireysel, `nep` makro kod |
| `11 Çince (zh)` | `108 Chinese (zho)` | makro dil; 11 çocuk buna bağlı |
| `28 Malayca (ms)` | `130 Malay (msa)` | makro dil; 5 çocuk buna bağlı |
| `35 Azerbaycan Türkçesi (az)` | `165 Azerbaijani (aze)` | `azj` (Kuzey) ayrımı gerekir mi |
| `30 Swahili (sw)` | twin yok | `swh`/`swa` eklenecek mi |

### Adım 2 — Migration: metadata devri
Her `(legacyId, newId)` çifti için:
1. `UPDATE languages legacy SET iso639_3 = new.iso639_3, nativeName = COALESCE(new.nativeName, legacy.nativeName), englishName = COALESCE(new.englishName, legacy.englishName), direction = new.direction, aliases = new.aliases` — `name` ve `code` **değişmez**.
2. `questionCount` / `status`: yeni tarafta hepsi `not_published`/`0` olduğu için legacy değer korunur (genel kural: `GREATEST` ve "daha ileri statü kazanır").
3. `flagUrl`: legacy boşsa yeniden alınır.

### Adım 3 — Migration: bağımlılıkları taşı (savunma amaçlı, bugün 0 satır)
Bugün yeni tarafta veri yok ama migration prod'da farklı bir durumla karşılaşabilir. Bu yüzden
silmeden önce **koşulsuz** repoint çalıştırılır:
- `book_translations`, `book_page_translations`, `qa_item_translations`, `qa_category_translations`,
  `qa_tag_translations`, `country_languages`, `stocks.language_id`, `countries.primaryLanguageId`:
  `SET languageId = legacyId WHERE languageId = newId`
- Her tabloda önce **çakışma temizliği**: hedefte aynı (bookId/countryId/…, legacyId) satırı zaten
  varsa yeni satır taşınmaz, silinir. (`book_translations`'ta unique yok; `country_languages` PK çakışabilir.)
- `languages.parentLanguageId = newId` olan **16 çocuk** legacy ID'ye repoint edilir (FK `SET NULL`
  olduğu için sıralama önemli: repoint → sonra delete).

### Adım 4 — Migration: kopya satırları sil
`DELETE FROM languages WHERE id IN (newIds)` — Adım 3'ten sonra bu satırlar tamamen yalnız olmalı.
Silmeden önce migration içinde bir güvenlik kontrolü: kalan referans varsa migration **hata fırlatır**,
sessizce devam etmez.

### Adım 5 — `iso639_3` backfill + kalıcı tekilleştirme koruması
- Kopyası olmayan 23 legacy dile doğru `iso639_3` yazılır.
- `languages.iso639_3` zaten UNIQUE — backfill sonrası `NOT NULL` yapılabilir mi diye kontrol edilir
  (özel/kodsuz diller varsa nullable kalır).
- `CHECK (CHAR_LENGTH(iso639_3) = 3)` benzeri bir kısıt ya da uygulama seviyesinde doğrulama eklenir;
  bu kısıt olmadan aynı hata tekrarlar.

### Adım 6 — Seeder'ları düzelt (kök neden)
- `qa-300-languages-seeder.ts:44` lookup'ı genişletilir: `iso639_3` → `code` → **`aliases` içinde ad** →
  `englishName` sırasıyla aranır; bulunan satırın `iso639_3`'ü boş/2 harfliyse **önce backfill** edilir, sonra güncellenir.
- `ethnologue300-languages-seeder.ts:36` `{ code }` veya `{ name }` ile arıyor; aynı genişletme uygulanır,
  ayrıca eklediği satırlara `iso639_3` yazması sağlanır (şu an hiç yazmıyor).
- Her iki seeder idempotent olduğunu kanıtlayan bir testle korunur: boş DB'ye 2 kez çalıştır → satır sayısı aynı.

### Adım 7 — Uygulama katmanı temizliği
- `language.service.ts:52` `findAll()` her şeyi dönüyor. Birleşme sonrası dahi 350+ dil var; en azından
  `isActive` filtresi ve `name ASC` sıralaması eklenir (kitaplar sayfasındaki 388'lik düz liste sorununun yarısı burada çözülür).
- `admin-front/.../BookListCards.jsx:197` `languageName`'i URL'den okumayı bırakır, id'den çözer
  (URL `?languageId=330&languageName=Indonesian` örneğinde 330 = Hazaragi; rozet yanlış yazıyor).
- `diller/liste/index.jsx:30` `getFlagByLanguageCode()` tek ülke bayrağı varsayımı — birleşme sonrası
  `country_languages` üzerinden çoklu bayrağa geçilir (bu, ülke fazının işi; burada sadece not).

### Adım 8 — Doğrulama
Migration sonrası "after" raporu alınır ve şunlar **eşit** olmalı:
- `book_translations`, `book_page_translations`, `qa_*_translations`, `country_languages` satır sayıları (kayıp yok)
- Kitap/QA içeriği olan farklı dil sayısı: kitaplarda 33, QA'da 24 (azalmamalı; çift birleşirse azalabilir → beklenen değer önceden hesaplanır)
- `languages` sayısı: 388 → **334** (54 silinir)
- `SELECT COUNT(*) FROM languages WHERE LENGTH(iso639_3)<>3` → 0
- Yetim referans: her FK tablosunda `languageId NOT IN (SELECT id FROM languages)` → 0
- Admin'de: Diller listesi açılır, Endonezyaca satırındaki kitap sayısı 11 görünür, tıklanınca kitaplar listesi 11 kayıt döner.

### Adım 9 — Geri alma (down)
Migration `down()` gerçekçi biçimde yazılamaz (silinen satırların ID'leri geri gelmez).
Bunun yerine:
- `down()` açıkça `throw new Error('irreversible')` der,
- geri dönüş yolu Adım 0'daki dump'tan restore'dur ve bu README'ye yazılır.

## 5. Sıralama ve bağımlılık

```
Adım 0 (yedek)
   └─ Adım 1 (harita + kenar durum onayı)   ← senin kararın gerekiyor
        └─ Adım 2-4 (migration: devret → taşı → sil)
             └─ Adım 5 (backfill + kısıt)
                  ├─ Adım 6 (seeder fix)  ← olmazsa kopyalar geri gelir
                  └─ Adım 7 (servis/UI temizliği)
                       └─ Adım 8 (doğrulama)
```

Ülke bazlı filtreleme (`countryId` → n dil), kitaplar sayfasındaki kademeli Ülke→Dil seçimi ve
`languageIds[]` desteği **bu plan bittikten sonra** ayrı bir iş olarak ele alınacak.

## 6. Riskler

| Risk | Etki | Önlem |
|---|---|---|
| Prod DB'de yeni tarafta veri olması | Adım 4 silme veri kaybı | Adım 3 koşulsuz repoint + Adım 4 öncesi referans kontrolü ve hata fırlatma |
| Makro dil eşleşmeleri (zho/msa/aze) yanlış birleşir | Yanlış dil altında içerik | Adım 1 kenar durum listesi elle onaylanır |
| Seeder tekrar çalıştırılır | Kopyalar geri gelir | Adım 6 + idempotence testi |
| `code` alanına dokunulması | paper/podcast/users/newsletter kırılır | K2 kararı: `code` sabit |
