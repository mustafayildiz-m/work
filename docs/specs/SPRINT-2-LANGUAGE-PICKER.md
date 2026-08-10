# Sprint 2: Dil Seçim Sayfası (Frontend) — Teknik Spec

## Özet

| Alan | Değer |
|------|-------|
| Süre | 4 iş günü |
| Coverage hedefi | >= 80% (yeni frontend kodu) |
| Bağımlılık | Sprint 1 (backend API'ler hazır) |
| Çıktı | Test setup + /questions sayfası + components + tests |

---

## 1. Frontend Test Altyapısı Kurulumu

### Paketler
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event jest-environment-jsdom @swc/jest identity-obj-proxy
```

### jest.config.js
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

const customConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|scss)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/**/index.{js,jsx}',
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: { lines: 80, branches: 70, functions: 75, statements: 80 },
  },
};

module.exports = createJestConfig(customConfig);
```

### jest.setup.js
```javascript
import '@testing-library/jest-dom';
```

### package.json script'leri
```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage"
}
```

---

## 2. Sayfa: /questions (Landing)

**Dosya:** `user-front/src/app/(social)/questions/page.jsx`

### Sayfa Yapısı
```
┌─────────────────────────────────────────┐
│         Questions & Answers              │
│  Explore Islamic knowledge in your       │
│  own language.                           │
├─────────────────────────────────────────┤
│  🌐 Choose Your Language                │
├─────────────────────────────────────────┤
│  🔍 [Search among 300 languages    ]    │
├─────────────────────────────────────────┤
│  Suggested for you: Türkçe              │ ← (browser lang)
├─────────────────────────────────────────┤
│  Suggested Languages                     │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐          │
│  │ AR │ │ TR │ │ EN │ │ UR │          │
│  └────┘ └────┘ └────┘ └────┘          │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐          │
│  │ HI │ │ BN │ │ FA │ │ FR │          │
│  └────┘ └────┘ └────┘ └────┘          │
├─────────────────────────────────────────┤
│  [View All 300 Languages]               │
└─────────────────────────────────────────┘
```

### Metadata
```javascript
export const metadata = {
  title: 'Questions & Answers | Islamic Windows',
  description: 'Explore Islamic Q&A in 300+ languages',
};
```

---

## 3. Component: LanguagePicker

**Dosya:** `user-front/src/app/(social)/questions/components/LanguagePicker.jsx`

### Props
```typescript
interface LanguagePickerProps {
  // No props — fetches data internally
}
```

### State
- `languages: Language[]` — tüm diller (lazy load)
- `suggested: Language[]` — önerilen diller (API'den)
- `browserSuggested: Language | null` — tarayıcı dili
- `searchQuery: string`
- `searchResults: Language[]`
- `showAll: boolean`
- `loading: boolean`

### API Çağrıları
1. Mount: `GET /languages/qa-suggested` → suggested + browserSuggested
2. Search: `GET /languages/qa-search?q={query}` (debounced 300ms)
3. View All: `GET /languages/qa-grouped` (lazy)

### Dil Seçimi Davranışı
1. Dil kartına tıkla → localStorage'a kaydet → `/questions/{iso639_3}` navigate

---

## 4. Component: LanguageSearch

**Dosya:** `user-front/src/app/(social)/questions/components/LanguageSearch.jsx`

### Props
```typescript
interface LanguageSearchProps {
  onResults: (languages: Language[]) => void;
  onClear: () => void;
  placeholder?: string;
}
```

### Davranış
- 300ms debounce
- Min 1 karakter ile arama başlar
- Sonuçlar overlay/dropdown olarak gösterilir
- ESC veya input temizleme → onClear çağrılır
- Mobilde arama kutusu sticky (scroll'da sabit)

---

## 5. Component: LanguageCard

**Dosya:** `user-front/src/app/(social)/questions/components/LanguageCard.jsx`

### Props
```typescript
interface LanguageCardProps {
  language: {
    id: number;
    nativeName: string;
    englishName: string;
    iso639_3: string;
    direction: 'ltr' | 'rtl';
    questionCount: number;
    status: string;
  };
  onClick: (lang: Language) => void;
}
```

### Görünüm
```
┌──────────────────────┐
│  العربية              │ ← nativeName (büyük, bold)
│  Arabic               │ ← englishName (küçük, muted)
│  650 questions        │ ← questionCount badge
└──────────────────────┘
```

### Stil
- Border-radius: 12px
- Hover: scale(1.02) + shadow
- RTL badge: küçük "RTL" işareti (direction='rtl' ise)
- Status: "in_progress" ise subtle "Coming soon" badge

---

## 6. Component: LanguageGroupAccordion

**Dosya:** `user-front/src/app/(social)/questions/components/LanguageGroupAccordion.jsx`

### Props
```typescript
interface LanguageGroupAccordionProps {
  parentLanguage: Language & { children: Language[] };
  onSelect: (lang: Language) => void;
}
```

### Davranış
- Parent dil kartı normal gösterilir
- Altında "Regional varieties (N)" butonu
- Tıklanınca children collapse açılır
- Her child ayrı LanguageCard olarak gösterilir

---

## 7. Utility: qaLanguagePreference

**Dosya:** `user-front/src/utils/qaLanguagePreference.js`

### API
```javascript
export function getPreferredLanguage(): string | null;
export function setPreferredLanguage(iso639_3: string): void;
export function clearPreferredLanguage(): void;
export function detectBrowserLanguage(): string | null;
```

### localStorage Key
`qa_preferred_lang` → ISO 639-3 kodu (örn: "tur", "ara")

---

## 8. Redirect: /feed/qa → /questions

**Dosya:** `user-front/src/app/(social)/feed/(container)/qa/page.jsx` (güncelleme)

```javascript
import { redirect } from 'next/navigation';

export default function QaPage() {
  redirect('/questions');
}
```

---

## 9. Test Planı

### qaLanguagePreference.test.js
```javascript
describe('qaLanguagePreference', () => {
  describe('getPreferredLanguage', () => {
    it('should return null when no preference stored');
    it('should return stored ISO code from localStorage');
  });

  describe('setPreferredLanguage', () => {
    it('should save ISO code to localStorage');
    it('should overwrite previous preference');
  });

  describe('detectBrowserLanguage', () => {
    it('should detect "tr" from navigator.languages');
    it('should return first match from supported languages');
    it('should return null when no match found');
  });
});
```

### LanguagePicker.test.jsx
```javascript
describe('LanguagePicker', () => {
  it('should render heading and search input');
  it('should show suggested languages on mount');
  it('should show browser-suggested language if detected');
  it('should display search results when typing');
  it('should navigate to /questions/{code} on card click');
  it('should save preference to localStorage on select');
  it('should show "View All" button');
  it('should load grouped languages when "View All" clicked');
});
```

### LanguageSearch.test.jsx
```javascript
describe('LanguageSearch', () => {
  it('should render input with placeholder');
  it('should debounce input by 300ms');
  it('should call onResults with API response');
  it('should call onClear when input emptied');
  it('should show loading state during fetch');
});
```

### LanguageCard.test.jsx
```javascript
describe('LanguageCard', () => {
  it('should display native name prominently');
  it('should display English name below');
  it('should show question count badge');
  it('should call onClick when clicked');
  it('should show RTL indicator for RTL languages');
  it('should show "Coming soon" for in_progress status');
});
```

---

## 10. Acceptance Criteria

- [ ] Jest + Testing Library kurulu ve çalışır
- [ ] /questions sayfası render oluyor
- [ ] Arama 300ms debounce ile çalışır
- [ ] Önerilen diller gösteriliyor
- [ ] Tarayıcı dili algılanıyor
- [ ] Dil seçimi localStorage'a kaydediliyor
- [ ] Dil seçildiğinde /questions/{code} sayfasına gidiliyor
- [ ] /feed/qa → /questions redirect çalışır
- [ ] Mobilde sticky search + scroll çalışır
- [ ] Tüm component testleri geçer
- [ ] `npm run test:cov` >= 80%
