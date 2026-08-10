# Sprint 6: Mobil Polish, RTL Test & Final QA — Teknik Spec

## Özet

| Alan | Değer |
|------|-------|
| Süre | 3 iş günü |
| Coverage hedefi | Genel proje >= 80% lines |
| Bağımlılık | Sprint 5 (tüm özellikler hazır) |
| Çıktı | RTL test matrisi + mobil polish + sitemap + redirect + E2E |

---

## 1. RTL Test Matrisi

### Test Edilecek Diller
| Dil | ISO | Direction | Özel Dikkat |
|-----|-----|-----------|-------------|
| Arabic | ara | RTL | En yaygın RTL |
| Persian | fas | RTL | Farklı script |
| Urdu | urd | RTL | Nastaliq yazı stili |
| Hebrew | heb | RTL | Farklı alfabe |

### Test Senaryoları (her dil için)
- [ ] Sayfa yönü doğru (dir="rtl")
- [ ] Metin hizalama sağdan (text-align: right)
- [ ] Accordion chevron sol tarafta
- [ ] Arama kutusu ikonu sağda
- [ ] Kategori butonları sağdan sola sıralı
- [ ] Tag'ler sağdan sola
- [ ] Breadcrumb sağdan sola
- [ ] Share butonu doğru pozisyonda
- [ ] Scroll bar sol tarafta (browser native)
- [ ] Card hover animasyonları doğru

### Bidirectional (Bidi) Test
- Arapça metin içinde İngilizce kelime
- Sayılar ve tarihler
- URL'ler metin içinde

---

## 2. Mobil Test Planı

### Cihaz/Boyut Matrisi
| Viewport | Platform | Anahtar Test |
|----------|----------|--------------|
| 360px | Android Chrome | Minimum genişlik |
| 375px | iOS Safari | iPhone SE/Mini |
| 390px | iOS Safari | iPhone 14 |
| 768px | iPad | Tablet breakpoint |

### Mobil UX Kontrol Listesi
- [ ] Sticky search bar (scroll'da sabit)
- [ ] Touch target >= 48px (dil kartları)
- [ ] Horizontal scroll yok (overflow hidden)
- [ ] Font size readable (min 14px body)
- [ ] Accordion smooth açılma/kapanma
- [ ] Load more butonu thumb-reachable
- [ ] Keyboard açıldığında layout kayması yok
- [ ] Landscape orientation düzgün

### Performance (Mobil)
- [ ] First Contentful Paint < 2s (3G)
- [ ] Time to Interactive < 4s (3G)
- [ ] Dil listesi lazy load (300 dil yüklenmez)
- [ ] Image yok (text-based, hafif)

---

## 3. Sitemap Üretimi

### Dynamic Sitemap

**Dosya:** `user-front/src/app/sitemap-questions.xml/route.js`

```javascript
export async function GET() {
  const languages = await fetchActiveLanguages();

  const urls = [
    { loc: '/questions', changefreq: 'weekly', priority: '0.9' },
    ...languages.map(lang => ({
      loc: `/questions/${lang.iso639_3}`,
      changefreq: 'weekly',
      priority: '0.8',
      lastmod: lang.updatedAt,
    })),
  ];

  const xml = generateSitemapXml(urls);
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
```

### robots.txt Güncelleme
```
Sitemap: https://islamicwindows.com/sitemap-questions.xml
```

---

## 4. Legacy Redirect

### /feed/qa → /questions (301 Permanent)

**Dosya:** `user-front/src/app/(social)/feed/(container)/qa/page.jsx`

```javascript
import { permanentRedirect } from 'next/navigation';

export default function QaPage() {
  permanentRedirect('/questions');
}
```

### Middleware Alternative (catch-all)
```javascript
// middleware.js — QA redirect rule
if (pathname === '/feed/qa') {
  return NextResponse.redirect(new URL('/questions', request.url), 301);
}
```

---

## 5. Tema Uyumu (Dark + Green)

### Yeni Sayfalar İçin Tema Testleri

| Sayfa | Light | Dark | Green |
|-------|-------|------|-------|
| /questions (landing) | ✓ | ✓ | ✓ |
| /questions/[langCode] | ✓ | ✓ | ✓ |
| /questions/[langCode]/[itemId] | ✓ | ✓ | ✓ |
| Language picker cards | ✓ | ✓ | ✓ |
| Search input | ✓ | ✓ | ✓ |
| Coming soon page | ✓ | ✓ | ✓ |
| 404 page | ✓ | ✓ | ✓ |

### CSS Tema Kuralları
```css
/* Dark mode */
[data-bs-theme="dark"] .questions-landing { background: #151a22; }
[data-bs-theme="dark"] .language-card { background: #1a2029; border-color: rgba(255,255,255,0.08); }
[data-bs-theme="dark"] .language-search-input { background: #1a2029; color: #e2e8f0; }

/* Green mode */
[data-bs-theme="green"] .questions-landing { background: linear-gradient(...); }
[data-bs-theme="green"] .language-card { background: #234d2a; }
```

---

## 6. Error Pages

### 404 — Geçersiz Language Code

**Dosya:** `user-front/src/app/(social)/questions/[langCode]/not-found.jsx`

```
┌───────────────────────────────────┐
│  Language Not Found               │
│                                    │
│  The language code "xyz" is not    │
│  recognized.                       │
│                                    │
│  [← Browse All Languages]         │
└───────────────────────────────────┘
```

### Coming Soon — Boş Dil

İçerik /questions/[langCode]/page.jsx içinde questionCount=0 kontrolü ile gösterilir.

---

## 7. Analytics Event'leri

### Tracked Events
| Event | Payload | Trigger |
|-------|---------|---------|
| `qa_language_selected` | `{ iso639_3, source: 'search'|'suggested'|'all' }` | Dil seçildiğinde |
| `qa_page_viewed` | `{ iso639_3, questionCount }` | Dil sayfası açıldığında |
| `qa_item_viewed` | `{ itemId, iso639_3 }` | Soru detay açıldığında |
| `qa_search_performed` | `{ query, resultsCount, iso639_3 }` | İçerik aramasında |

### Implementation
```javascript
// utils/qaAnalytics.js
export function trackQaEvent(name, payload) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, payload);
  }
}
```

---

## 8. Test Planı

### E2E Tests

**redirect.test.jsx**
```javascript
describe('/feed/qa redirect', () => {
  it('should redirect to /questions with 301');
  it('should not break existing bookmarks');
});
```

**not-found.test.jsx**
```javascript
describe('404 page', () => {
  it('should show for invalid language code');
  it('should show "Browse All Languages" link');
  it('should have proper meta title');
});
```

**coming-soon.test.jsx**
```javascript
describe('Coming Soon page', () => {
  it('should show for language with 0 questions');
  it('should display language name');
  it('should have "Choose Another Language" link');
});
```

**sitemap.e2e-spec.ts**
```typescript
describe('Sitemap (e2e)', () => {
  it('GET /sitemap-questions.xml should return valid XML');
  it('should include /questions root URL');
  it('should include all active language URLs');
  it('should not include not_published languages');
  it('should have correct lastmod dates');
});
```

### Visual Regression (Manual)
- Her tema x her sayfa screenshot karşılaştırma
- RTL sayfaların LTR ile mirror kontrolü

---

## 9. Final Coverage Raporu

Sprint 6 sonunda beklenen çıktı:

```
=== Final Coverage Report ===
Backend:
  Statements: >= 82%
  Branches:   >= 75%
  Functions:  >= 80%
  Lines:      >= 80%

Frontend:
  Statements: >= 80%
  Branches:   >= 72%
  Functions:  >= 78%
  Lines:      >= 80%

New code (300-lang feature):
  Lines: >= 85%
```

---

## 10. Acceptance Criteria

- [ ] RTL sayfalar 4 dilde doğru render oluyor
- [ ] Mobil 4 viewport'ta düzgün çalışıyor
- [ ] Sitemap XML geçerli ve tüm aktif dilleri içeriyor
- [ ] /feed/qa → /questions 301 redirect çalışır
- [ ] Dark + Green tema tüm sayfalarda uyumlu
- [ ] 404 ve Coming Soon sayfaları çalışır
- [ ] Analytics event'leri ateşleniyor
- [ ] Tüm E2E testler geçer
- [ ] Genel proje coverage >= 80%
- [ ] Lighthouse Performance score >= 90 (desktop), >= 75 (mobile)
