# Test Stratejisi — 300 Dilli Q&A Sistemi

## Genel İlkeler

1. **Test-Driven Development (TDD):** Her yeni özellik için önce test yazılır, sonra implementation yapılır.
2. **Her dosyanın testi var:** Yeni oluşturulan her `.ts` / `.jsx` dosyasının yanında `.spec.ts` / `.test.jsx` dosyası zorunludur.
3. **Coverage gate:** PR merge için minimum %80 line coverage (yeni kod için).
4. **Regression koruması:** Mevcut testler asla kırılmaz; kırılan test düzeltilmeden merge yapılmaz.

---

## Backend Test Altyapısı

### Araçlar
| Araç | Sürüm | Amaç |
|------|--------|------|
| Jest | 29.x | Test runner + assertion |
| @nestjs/testing | 11.x | NestJS modül mock |
| Supertest | 7.x | HTTP E2E testleri |
| ts-jest | 29.x | TypeScript desteği |

### Komutlar
```bash
npm run test              # Tüm unit testleri çalıştır
npm run test:watch        # Watch modunda çalıştır
npm run test:cov          # Coverage raporu al
npm run test:e2e          # E2E testleri çalıştır
```

### Katman Bazlı Test Yaklaşımı

#### Service Layer (Unit Test)
- Repository mock ile izole test
- Her public metot için en az 3 test case:
  - Happy path
  - Edge case (boş veri, null, limit)
  - Error case (exception, not found)
- Coverage hedefi: **>= 90%**

```typescript
// Örnek yapı
describe('LanguagesService', () => {
  describe('qaSearch', () => {
    it('should find language by native name', async () => { ... });
    it('should find language by ISO 639-3 code', async () => { ... });
    it('should find language by alias', async () => { ... });
    it('should return empty array for no match', async () => { ... });
    it('should limit results to 20', async () => { ... });
  });
});
```

#### Controller Layer (Unit Test)
- Service mock ile izole test
- Request/response format doğrulama
- Auth guard testi (admin endpoint'ler)
- DTO validation testi
- Coverage hedefi: **>= 85%**

```typescript
describe('LanguagesController', () => {
  describe('GET /languages/qa-search', () => {
    it('should return 200 with matching languages', async () => { ... });
    it('should return 400 for empty query', async () => { ... });
    it('should respect Accept-Language header', async () => { ... });
  });
});
```

#### Entity/DTO Layer (Validation Test)
- class-validator decorator testi
- Field constraint testi (length, format, enum)
- Coverage hedefi: **>= 95%**

#### E2E Layer (Integration Test)
- Gerçek HTTP request + database
- Test database kullanılır (in-memory SQLite veya test MySQL)
- Kritik akışlar: search, suggest, CRUD
- Her sprint sonunda E2E suite çalıştırılır

---

## Frontend Test Altyapısı

### Araçlar (Sprint 2'de kurulacak)
| Araç | Sürüm | Amaç |
|------|--------|------|
| Jest | 29.x | Test runner |
| @testing-library/react | 16.x | Component render + interaction |
| @testing-library/jest-dom | 6.x | DOM assertion matchers |
| @testing-library/user-event | 14.x | Kullanıcı etkileşimi simülasyonu |
| jest-environment-jsdom | 29.x | Browser environment mock |

### Komutlar
```bash
npm run test              # Tüm testleri çalıştır
npm run test:cov          # Coverage raporu al
npm run test:watch        # Watch modunda çalıştır
```

### Katman Bazlı Test Yaklaşımı

#### Utils/Helpers (Unit Test)
- Pure function testleri
- Edge case'ler (null, undefined, boş string)
- Coverage hedefi: **>= 95%**

```javascript
describe('qaLanguagePreference', () => {
  describe('getPreferredLanguage', () => {
    it('should return stored language from localStorage', () => { ... });
    it('should detect browser language as fallback', () => { ... });
    it('should return null when no preference exists', () => { ... });
  });
});
```

#### Components (Render + Interaction)
- Render testi (doğru elementler DOM'da mı)
- User interaction (click, type, scroll)
- Accessibility (aria attributes, keyboard nav)
- Responsive behavior (mock viewport)
- Coverage hedefi: **>= 80%**

```javascript
describe('LanguageSearch', () => {
  it('should render search input', () => { ... });
  it('should debounce search input (300ms)', async () => { ... });
  it('should display results matching query', async () => { ... });
  it('should show "no results" for unknown language', async () => { ... });
  it('should call onSelect when language clicked', async () => { ... });
});
```

#### Pages (Integration)
- API mock ile sayfa render
- Navigation/routing testi
- SEO meta tag doğrulama
- Kritik akışlar için

---

## Coverage Hedefleri (Sprint Bazlı)

| Sprint | Backend | Frontend | Genel |
|--------|---------|----------|-------|
| 1 | >= 85% (languages) | — | — |
| 2 | — | >= 80% (yeni kod) | — |
| 3 | >= 85% (qa module) | >= 75% (pages) | — |
| 4 | >= 85% (admin) | — | — |
| 5 | >= 90% (cache) | >= 80% | — |
| 6 | — | — | >= 80% (tüm proje) |

---

## Test Dosya Organizasyonu

### Backend
```
backend/src/
├── languages/
│   ├── languages.service.ts
│   ├── languages.service.spec.ts          ← Service unit tests
│   ├── languages.controller.ts
│   ├── languages.controller.spec.ts       ← Controller unit tests
│   ├── dto/
│   │   ├── language-search.dto.ts
│   │   └── language-search.dto.spec.ts    ← DTO validation tests
│   └── entities/
│       ├── language.entity.ts
│       └── language.entity.spec.ts        ← Entity constraint tests
├── qa/
│   ├── qa.service.ts
│   ├── qa.service.spec.ts
│   ├── qa.controller.ts
│   └── qa.controller.spec.ts
└── ...

backend/test/
├── languages-qa.e2e-spec.ts              ← E2E integration
├── languages-performance.e2e-spec.ts     ← Performance assertions
└── sitemap.e2e-spec.ts                   ← Sitemap validity
```

### Frontend
```
user-front/src/
├── utils/
│   ├── qaLanguagePreference.js
│   └── qaLanguagePreference.test.js
├── hooks/
│   ├── useLanguageList.js
│   └── useLanguageList.test.js
├── app/(social)/questions/
│   ├── page.jsx
│   ├── components/
│   │   ├── LanguagePicker.jsx
│   │   ├── LanguagePicker.test.jsx
│   │   ├── LanguageSearch.jsx
│   │   ├── LanguageSearch.test.jsx
│   │   ├── LanguageCard.jsx
│   │   ├── LanguageCard.test.jsx
│   │   ├── LanguageGroupAccordion.jsx
│   │   └── LanguageGroupAccordion.test.jsx
│   └── [langCode]/
│       ├── page.jsx
│       ├── page.test.jsx
│       ├── [itemId]/
│       │   ├── page.jsx
│       │   └── page.test.jsx
│       └── components/
│           ├── QaContent.jsx
│           ├── QaContent.test.jsx
│           ├── QaItemDetail.jsx
│           └── QaItemDetail.test.jsx
```

---

## CI/CD Entegrasyonu (Sprint 5)

### GitHub Actions Workflow
```yaml
name: Test & Coverage
on: [push, pull_request]
jobs:
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: cd backend && npm ci && npm run test:cov
      - name: Check coverage threshold
        run: |
          COVERAGE=$(cat backend/coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then exit 1; fi

  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: cd user-front && npm ci && npm run test:cov
      - name: Check coverage threshold
        run: |
          COVERAGE=$(cat user-front/coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then exit 1; fi
```

### Coverage Badge
```markdown
![Backend Coverage](https://img.shields.io/badge/backend--coverage-85%25-brightgreen)
![Frontend Coverage](https://img.shields.io/badge/frontend--coverage-80%25-brightgreen)
```

---

## Test Yazım Kuralları

1. **Describe blokları:** Modül → Metot → Senaryo hiyerarşisi
2. **Test isimlendirme:** `should [beklenen davranış] when [koşul]`
3. **Arrange-Act-Assert** paterni
4. **Mock'lar minimize:** Sadece dış bağımlılıklar mock'lanır (DB, Redis, HTTP)
5. **Test izolasyonu:** Her test bağımsız çalışabilir, sıra bağımlılığı yok
6. **Snapshot testi:** Sadece UI component'lerde, ve sadece kritik olanlarda
7. **Flaky test yasağı:** Rastgele başarısız olan test kabul edilmez

---

## Coverage Rapor Formatı

Her sprint sonunda coverage raporu şu formatta paylaşılır:

```
=== Sprint X Coverage Report ===
Backend:
  Statements: XX%
  Branches:   XX%
  Functions:  XX%
  Lines:      XX%

Frontend:
  Statements: XX%
  Branches:   XX%
  Functions:  XX%
  Lines:      XX%

New code only:
  Lines: XX%
```
