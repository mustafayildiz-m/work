# Sistem Mimarisi — 300 Dilli Q&A

## Genel Mimari

```
┌─────────────────────────────────────────────────────────────────┐
│                         NGINX (Reverse Proxy)                    │
│                    islamicwindows.com / :443                      │
└──────┬──────────────────┬──────────────────┬────────────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  user-front  │  │   backend    │  │ admin-front  │
│  Next.js 14  │  │  NestJS 11   │  │  React/Vite  │
│  Port 3001   │  │  Port 3000   │  │  Port 5173   │
└──────────────┘  └──────┬───────┘  └──────────────┘
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
        ┌──────────┐ ┌───────┐ ┌──────────┐
        │  MySQL   │ │ Redis │ │ Uploads  │
        │   8.0    │ │  7.x  │ │  Volume  │
        └──────────┘ └───────┘ └──────────┘
```

---

## URL Yapısı

### Kullanıcı Sayfaları
```
/questions                          → Dil seçim landing sayfası
/questions/tur                      → Türkçe Q&A listesi
/questions/ara                      → Arapça Q&A listesi
/questions/tur/42                   → Türkçe soru #42 detay
/questions/ara/15                   → Arapça soru #15 detay
```

### API Endpoint'leri
```
GET  /languages/qa-search?q=       → Dil arama (native, english, iso, aliases)
GET  /languages/qa-suggested       → Önerilen diller (browser lang + popüler)
GET  /languages/qa-grouped         → Parent-child gruplu dil listesi
GET  /languages/qa-stats           → Dil bazlı questionCount özeti
GET  /qa/items/search?languageId=  → Q&A içerik arama
GET  /qa/categories?languageId=    → Kategoriler
GET  /qa/items/:id                 → Tek soru detay
```

### Admin Endpoint'leri
```
GET    /languages/admin/dashboard  → Paginated dil listesi + istatistik
PATCH  /languages/:id/status       → Tek dil status değiştir
PATCH  /languages/bulk-status      → Toplu status değiştir
```

---

## Veritabanı Şeması

### languages tablosu (genişletilmiş)

```sql
CREATE TABLE languages (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(50) NOT NULL UNIQUE,        -- Mevcut (Türkçe isim)
  code          VARCHAR(10) NOT NULL UNIQUE,        -- Mevcut (ISO 639-1, 2 harf)
  nativeName    VARCHAR(100),                       -- YENİ: Türkçe, العربية, 日本語
  englishName   VARCHAR(100),                       -- YENİ: Turkish, Arabic, Japanese
  iso639_3      CHAR(3) UNIQUE,                     -- YENİ: tur, ara, jpn
  direction     ENUM('ltr','rtl') DEFAULT 'ltr',    -- YENİ
  aliases       TEXT,                               -- YENİ: JSON array
  parentLanguageId INT,                             -- YENİ: self-FK
  questionCount INT DEFAULT 0,                      -- YENİ: denormalize sayaç
  status        ENUM('active','in_progress','not_published') DEFAULT 'not_published', -- YENİ
  flagUrl       VARCHAR(255),                       -- Mevcut
  isActive      BOOLEAN DEFAULT TRUE,               -- Mevcut
  createdAt     DATETIME(6),                        -- Mevcut
  updatedAt     DATETIME(6),                        -- Mevcut

  FOREIGN KEY (parentLanguageId) REFERENCES languages(id) ON DELETE SET NULL,
  FULLTEXT INDEX ft_lang_search (nativeName, englishName, aliases)
);
```

### İlişki Diyagramı

```
languages
  ├── 1:N → qa_item_translations (languageId)
  ├── 1:N → qa_category_translations (languageId)
  ├── 1:N → qa_tag_translations (languageId)
  └── self-ref → parentLanguageId (dil grupları)

qa_items
  ├── 1:N → qa_item_translations
  ├── N:1 → qa_categories (categoryId)
  └── M:N → qa_tags (via qa_item_tags)

qa_categories
  ├── 1:N → qa_category_translations
  └── self-ref → parentId (hiyerarşi)
```

---

## Dil Gruplama Stratejisi

### Parent-Child İlişkisi
```
Arabic (ara, parent=NULL)
  ├── Algerian Arabic (arq, parent=Arabic)
  ├── Gulf Arabic (afb, parent=Arabic)
  ├── Hijazi Arabic (acw, parent=Arabic)
  ├── Sudanese Arabic (apd, parent=Arabic)
  └── ... (diğer Arapça varyantlar)

Chinese (zho, parent=NULL)
  ├── Mandarin Chinese (cmn, parent=Chinese)
  ├── Yue Chinese (yue, parent=Chinese)
  ├── Wu Chinese (wuu, parent=Chinese)
  └── ... (diğer Çince varyantlar)
```

### Kullanıcı Deneyimi
1. İlk ekranda yalnızca parent diller + bağımsız diller gösterilir
2. "Arabic" seçildiğinde ana Arapça Q&A açılır
3. Altında "Regional varieties" accordion'u ile varyantlara erişim

---

## Dil Arama Algoritması

### Arama Önceliği
1. **Exact match** — ISO 639-3 kodu ("tur" → Türkçe)
2. **Starts with** — nativeName veya englishName
3. **Contains** — nativeName, englishName, aliases
4. **FULLTEXT** — MySQL FULLTEXT search (fuzzy)

### Arama Alanları
| Alan | Örnek | Açıklama |
|------|-------|----------|
| nativeName | "Türkçe" | Dilin kendi adı |
| englishName | "Turkish" | İngilizce adı |
| iso639_3 | "tur" | 3 harfli kod |
| aliases | ["Turk", "Turkisch"] | Alternatif isimler |

### Backend Implementasyonu
```typescript
async qaSearch(query: string): Promise<Language[]> {
  const q = query.trim().toLowerCase();

  // 1. Exact ISO match
  const isoMatch = await this.repo.findOne({ where: { iso639_3: q } });
  if (isoMatch) return [isoMatch];

  // 2. LIKE search on multiple fields
  return this.repo
    .createQueryBuilder('l')
    .where('LOWER(l.nativeName) LIKE :q', { q: `%${q}%` })
    .orWhere('LOWER(l.englishName) LIKE :q', { q: `%${q}%` })
    .orWhere('l.iso639_3 = :exact', { exact: q })
    .orWhere('LOWER(l.aliases) LIKE :q', { q: `%${q}%` })
    .andWhere('l.status != :np', { np: 'not_published' })
    .orderBy('l.questionCount', 'DESC')
    .limit(20)
    .getMany();
}
```

---

## Kullanıcı Dil Tercihi Akışı

```
┌───────────────────────────────────────────┐
│ Kullanıcı /questions sayfasına girer       │
└──────────────────┬────────────────────────┘
                   ▼
┌───────────────────────────────────────────┐
│ localStorage'da kayıtlı dil var mı?       │
└──────┬───────────────────────┬────────────┘
       │ Evet                  │ Hayır
       ▼                       ▼
┌──────────────┐    ┌──────────────────────┐
│ Direkt Q&A   │    │ Browser Accept-Lang   │
│ sayfasına    │    │ detect et → öneri     │
│ yönlendir    │    └──────────┬───────────┘
└──────────────┘               ▼
                    ┌──────────────────────┐
                    │ "Suggested for you:   │
                    │  Türkçe" göster       │
                    └──────────────────────┘
```

### Tercih Saklama Katmanları
1. **localStorage** — `qa_preferred_lang` key (tüm ziyaretçiler)
2. **User account** — giriş yapmış kullanıcılar için DB'de
3. **Browser language** — sadece öneri amaçlı (zorla yönlendirme yok)

---

## Cache Stratejisi

### Redis Cache Katmanları
| Key Pattern | TTL | Invalidation |
|-------------|-----|--------------|
| `lang:list` | 1 saat | Dil CRUD'da |
| `lang:search:{query}` | 5 dakika | Otomatik expire |
| `lang:grouped` | 1 saat | Dil CRUD'da |
| `lang:stats` | 30 dakika | Q&A item CRUD'da |

### Frontend Cache
| Veri | Strateji | Revalidate |
|------|----------|------------|
| Dil listesi | SWR (stale-while-revalidate) | 1 saat |
| Q&A içerik | ISR (Next.js) | 1 saat |
| Arama sonuçları | Client-side fuse.js | Anında |

---

## SEO Stratejisi

### Meta Tags (per language page)
```html
<html lang="tr" dir="ltr">
<head>
  <title>İslami Soru-Cevap Türkçe | Islamic Windows</title>
  <meta name="description" content="İslam hakkında Türkçe soru ve cevaplar..." />
  <link rel="alternate" hreflang="ar" href="/questions/ara" />
  <link rel="alternate" hreflang="en" href="/questions/eng" />
  <link rel="alternate" hreflang="x-default" href="/questions" />
  <meta property="og:title" content="Islamic Q&A in Turkish" />
  <meta property="og:url" content="https://islamicwindows.com/questions/tur" />
</head>
```

### Sitemap
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://islamicwindows.com/questions</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://islamicwindows.com/questions/tur</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- ... 300 dil -->
</urlset>
```

---

## RTL Desteği

### RTL Diller (tam liste)
```
ara, fas, urd, heb, arq, afb, acw, apd, aec, acm, ayp, aeb, ayl, acq, apc, shu,
mey, ckb, sdh, kas, bal, bgp, mzn, glk, pus, snd, skr
```

### Layout Değişimi
```jsx
// /questions/[langCode]/layout.jsx
export default function QaLanguageLayout({ children, params }) {
  const lang = await getLanguageByCode(params.langCode);

  return (
    <div dir={lang.direction} lang={lang.iso639_3}>
      {children}
    </div>
  );
}
```

### CSS RTL
```css
[dir="rtl"] .qa-accordion-header {
  text-align: right;
  flex-direction: row-reverse;
}

[dir="rtl"] .qa-search-icon {
  border-right: 1px solid ...;
  border-left: none;
}
```

---

## Mobil Tasarım İlkeleri

1. **Mobile-first:** Tüm CSS mobile'dan başlar, breakpoint'lerle büyür
2. **Touch target:** Minimum 48px yükseklik dil kartları için
3. **Sticky search:** Arama kutusu scroll'da sabit kalır
4. **Lazy load:** 300 dil tamamı yüklenmez; arama + sayfalama
5. **Fast interaction:** Client-side fuse.js ile anında arama
6. **Offline hint:** Service worker ile dil listesi cache (ileride)
