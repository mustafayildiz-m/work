# Sprint 3: Dil Bazlı Q&A Sayfaları — Teknik Spec

## Özet

| Alan | Değer |
|------|-------|
| Süre | 4 iş günü |
| Coverage hedefi | Q&A modülü >= 85%, frontend pages >= 75% |
| Bağımlılık | Sprint 2 (language picker + test setup) |
| Çıktı | Dynamic routes + RTL + SEO + item detail + tests |

---

## 1. URL Yapısı

```
/questions/[langCode]              → Dil bazlı Q&A listesi
/questions/[langCode]/[itemId]     → Tek soru detay (paylaşım)
```

**langCode:** ISO 639-3 (3 harf) — örn: `tur`, `ara`, `eng`, `fas`

---

## 2. Dynamic Route: /questions/[langCode]

**Dosya:** `user-front/src/app/(social)/questions/[langCode]/page.jsx`

### Server Component Yapısı
```javascript
export async function generateMetadata({ params }) {
  const lang = await fetchLanguageByCode(params.langCode);
  if (!lang) return { title: 'Not Found' };

  return {
    title: `Islamic Q&A in ${lang.englishName} | Islamic Windows`,
    description: `Read ${lang.questionCount} Islamic questions and answers in ${lang.nativeName}`,
    alternates: {
      languages: { /* hreflang alternates */ },
    },
    openGraph: {
      title: `Islamic Q&A — ${lang.nativeName}`,
      url: `https://islamicwindows.com/questions/${lang.iso639_3}`,
    },
  };
}

export async function generateStaticParams() {
  const languages = await fetchActiveLanguages();
  return languages.map((lang) => ({ langCode: lang.iso639_3 }));
}
```

### Sayfa İçeriği
```
┌─────────────────────────────────────────────┐
│  ← Back to Languages    [Change Language 🌐] │
├─────────────────────────────────────────────┤
│  العربية — Arabic                            │
│  650 questions available                     │
├─────────────────────────────────────────────┤
│  🔍 [Search questions...]                    │
├─────────────────────────────────────────────┤
│  Categories: [All] [Aqeedah] [Fiqh] [...]   │
├─────────────────────────────────────────────┤
│  ▶ Question 1 text here...                   │
│  ▶ Question 2 text here...                   │
│  ▼ Question 3 (expanded)                     │
│    Answer text displayed here...             │
│    Tags: [Aqeedah] [Prayer]                  │
│    [Share 🔗]                                │
├─────────────────────────────────────────────┤
│  [Load More]  Showing 20 / 650              │
└─────────────────────────────────────────────┘
```

---

## 3. RTL/LTR Dynamic Layout

**Dosya:** `user-front/src/app/(social)/questions/[langCode]/layout.jsx`

```javascript
export default async function QaLanguageLayout({ children, params }) {
  const lang = await fetchLanguageByCode(params.langCode);

  return (
    <div dir={lang?.direction || 'ltr'} lang={lang?.iso639_3}>
      {children}
    </div>
  );
}
```

### CSS RTL Kuralları
```css
[dir="rtl"] .qa-lang-header { text-align: right; }
[dir="rtl"] .qa-accordion-header { flex-direction: row-reverse; }
[dir="rtl"] .qa-search-icon { border-right: 1px solid ...; border-left: none; }
[dir="rtl"] .qa-category-filters { flex-direction: row-reverse; }
[dir="rtl"] .qa-tag { margin-left: 0; margin-right: 0.5rem; }
[dir="rtl"] .qa-breadcrumb { direction: rtl; }
```

---

## 4. Item Detail: /questions/[langCode]/[itemId]

**Dosya:** `user-front/src/app/(social)/questions/[langCode]/[itemId]/page.jsx`

### SEO
```javascript
export async function generateMetadata({ params }) {
  const { langCode, itemId } = params;
  const item = await fetchQaItem(itemId, langCode);

  return {
    title: `${item.question.slice(0, 60)}... | Islamic Q&A`,
    description: item.answer.slice(0, 160),
    openGraph: {
      title: item.question,
      url: `https://islamicwindows.com/questions/${langCode}/${itemId}`,
    },
  };
}
```

### Sayfa İçeriği
```
┌─────────────────────────────────────────────┐
│  ← Back to العربية Q&A                       │
├─────────────────────────────────────────────┤
│  Q: Full question text here?                 │
├─────────────────────────────────────────────┤
│  A: Full detailed answer here...             │
│     Multiple paragraphs supported.           │
├─────────────────────────────────────────────┤
│  Category: Aqeedah                           │
│  Tags: [Prayer] [Fiqh]                       │
│  Source: Booklet Name / Section              │
├─────────────────────────────────────────────┤
│  [Share Link 🔗] [Copy URL]                  │
├─────────────────────────────────────────────┤
│  Related Questions:                          │
│  • Question X                                │
│  • Question Y                                │
└─────────────────────────────────────────────┘
```

---

## 5. Backend Değişiklikleri

### Yeni Endpoint: GET /qa/items/by-language/:langCode

**Params:** `langCode` (ISO 639-3)
**Query:** `q`, `categoryId`, `page`, `limit`

**Mantık:**
1. `langCode` ile language kaydı bul
2. `languageId` ile mevcut `searchItems()` çağır
3. 404 eğer dil bulunamazsa

### Yeni Endpoint: GET /qa/items/:id/by-language/:langCode

Tek soru detayını belirli dil çevirisiyle döndür.

---

## 6. Component: QaContent

**Dosya:** `user-front/src/app/(social)/questions/[langCode]/components/QaContent.jsx`

### Props
```typescript
interface QaContentProps {
  langCode: string;
  languageId: number;
  direction: 'ltr' | 'rtl';
}
```

### State
- `items: QaItem[]`
- `categories: Category[]`
- `filters: { q, categoryId, page, limit }`
- `total: number`
- `loading: boolean`

---

## 7. Component: QaItemDetail

**Dosya:** `user-front/src/app/(social)/questions/[langCode]/components/QaItemDetail.jsx`

### Props
```typescript
interface QaItemDetailProps {
  item: QaItem;
  langCode: string;
  direction: 'ltr' | 'rtl';
}
```

### Özellikler
- Tam soru ve cevap gösterimi
- Kategori ve tag'ler
- Kaynak bilgisi
- Paylaşım butonu (URL kopyala)
- İlgili sorular (aynı kategoriden 3-5 soru)

---

## 8. Not Found / Coming Soon Sayfaları

### Geçersiz langCode → 404
```javascript
import { notFound } from 'next/navigation';

export default async function QaLanguagePage({ params }) {
  const lang = await fetchLanguageByCode(params.langCode);
  if (!lang) notFound();
  // ...
}
```

### Boş dil (questionCount = 0) → Coming Soon
```
┌─────────────────────────────────────────┐
│  Suomi — Finnish                         │
│                                          │
│  🚧 Coming Soon                          │
│                                          │
│  We're preparing Islamic Q&A content     │
│  in Finnish. Check back soon!            │
│                                          │
│  [← Choose Another Language]             │
└─────────────────────────────────────────┘
```

---

## 9. Test Planı

### Frontend Tests

**page.test.jsx** (langCode)
```javascript
describe('/questions/[langCode] page', () => {
  it('should render language header with native name');
  it('should show question count');
  it('should render search input');
  it('should render category filters');
  it('should render accordion items');
  it('should apply dir="rtl" for Arabic');
  it('should apply dir="ltr" for Turkish');
  it('should show 404 for invalid langCode');
  it('should show "Coming soon" for empty language');
  it('should handle "Load More" pagination');
});
```

**page.test.jsx** (itemId)
```javascript
describe('/questions/[langCode]/[itemId] page', () => {
  it('should render full question text');
  it('should render full answer text');
  it('should show category and tags');
  it('should show source information');
  it('should have share/copy URL button');
  it('should show related questions');
  it('should apply correct text direction');
});
```

**QaContent.test.jsx**
```javascript
describe('QaContent', () => {
  it('should fetch and display items');
  it('should filter by category');
  it('should search within items');
  it('should paginate with load more');
  it('should show loading spinner');
  it('should handle API errors gracefully');
});
```

### Backend Tests

**qa.service.spec.ts** (ek)
```typescript
describe('QaService - by language code', () => {
  it('should find items by ISO 639-3 code');
  it('should return 404 for unknown language code');
  it('should filter items by category within language');
  it('should search within language items');
});
```

---

## 10. Acceptance Criteria

- [ ] /questions/tur sayfası Türkçe Q&A gösteriyor
- [ ] /questions/ara sayfası dir="rtl" ile Arapça gösteriyor
- [ ] /questions/xyz → 404 sayfası
- [ ] /questions/fin (boş) → Coming Soon sayfası
- [ ] /questions/tur/42 → soru detay + paylaşım URL'i
- [ ] generateMetadata doğru SEO tag'leri üretiyor
- [ ] Kategori filtreleme çalışır
- [ ] Soru arama çalışır
- [ ] Mobilde düzgün render olur
- [ ] Dark/Green tema uyumlu
- [ ] Tüm testler geçer
- [ ] Coverage: backend Q&A >= 85%, frontend >= 75%
