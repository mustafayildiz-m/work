# Sprint 5: Performans, Cache ve Arama — Teknik Spec

## Özet

| Alan | Değer |
|------|-------|
| Süre | 3 iş günü |
| Coverage hedefi | Cache layer >= 90%, genel backend >= 80% |
| Bağımlılık | Sprint 3 + Sprint 4 |
| Çıktı | Redis cache + FULLTEXT + SWR + ISR + CI + tests |

---

## 1. Backend: Redis Cache Layer

### Cache Service

**Dosya:** `backend/src/languages/language-cache.service.ts`

```typescript
@Injectable()
export class LanguageCacheService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async getOrSet<T>(key: string, ttl: number, factory: () => Promise<T>): Promise<T>;
  async invalidate(pattern: string): Promise<void>;
  async invalidateAll(): Promise<void>;
}
```

### Cache Key Yapısı
| Key | TTL | Invalidation Trigger |
|-----|-----|---------------------|
| `lang:list` | 3600s (1h) | Language CRUD |
| `lang:search:{hash(query)}` | 300s (5m) | Auto-expire |
| `lang:grouped` | 3600s (1h) | Language CRUD |
| `lang:stats` | 1800s (30m) | QA item CRUD |
| `lang:suggested:{hash(accept-lang)}` | 3600s (1h) | Language CRUD |

### Invalidation Stratejisi
```typescript
@Injectable()
export class LanguageCacheInvalidator {
  @OnEvent('language.created')
  @OnEvent('language.updated')
  @OnEvent('language.deleted')
  async onLanguageChange() {
    await this.cacheService.invalidate('lang:*');
  }

  @OnEvent('qa-item.created')
  @OnEvent('qa-item.deleted')
  async onQaItemChange(payload: { languageId: number }) {
    await this.cacheService.invalidate('lang:stats');
  }
}
```

---

## 2. questionCount Event-Driven Güncelleme

### Event Listener

**Dosya:** `backend/src/languages/question-count.listener.ts`

```typescript
@Injectable()
export class QuestionCountListener {
  @OnEvent('qa-item.created')
  async onItemCreated(payload: { languageIds: number[] }) {
    await this.languageRepo
      .createQueryBuilder()
      .update()
      .set({ questionCount: () => 'questionCount + 1' })
      .where('id IN (:...ids)', { ids: payload.languageIds })
      .execute();
  }

  @OnEvent('qa-item.deleted')
  async onItemDeleted(payload: { languageIds: number[] }) {
    await this.languageRepo
      .createQueryBuilder()
      .update()
      .set({ questionCount: () => 'GREATEST(questionCount - 1, 0)' })
      .where('id IN (:...ids)', { ids: payload.languageIds })
      .execute();
  }
}
```

### QA Service'de Event Emit
```typescript
// qa.service.ts - createItem()
await this.eventEmitter.emit('qa-item.created', {
  languageIds: dto.translations.map(t => t.languageId),
});
```

---

## 3. FULLTEXT Index

### Migration

**Dosya:** `backend/src/migrations/XXXX-AddFulltextToLanguages.ts`

```sql
ALTER TABLE languages
  ADD FULLTEXT INDEX ft_lang_search (nativeName, englishName, aliases);
```

### Kullanım (qaSearch iyileştirmesi)
```typescript
// Kısa query (< 3 char) → LIKE
// Uzun query (>= 3 char) → FULLTEXT + LIKE fallback
if (query.length >= 3) {
  qb.orWhere('MATCH(l.nativeName, l.englishName, l.aliases) AGAINST(:q IN BOOLEAN MODE)', { q: `*${query}*` });
}
```

---

## 4. Frontend: SWR + Fuse.js

### useLanguageList Hook

**Dosya:** `user-front/src/hooks/useLanguageList.js`

```javascript
import useSWR from 'swr';

export function useLanguageList() {
  const { data, error, isLoading } = useSWR(
    '/languages/qa-grouped',
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 3600000 }
  );

  return { languages: data || [], error, isLoading };
}
```

### Client-Side Fuse.js Search

**Dosya:** `user-front/src/hooks/useLanguageSearch.js`

```javascript
import Fuse from 'fuse.js';

const fuseOptions = {
  keys: ['nativeName', 'englishName', 'iso639_3', 'aliases'],
  threshold: 0.3,
  includeScore: true,
};

export function useLanguageSearch(languages, query) {
  const fuse = useMemo(() => new Fuse(languages, fuseOptions), [languages]);

  return useMemo(() => {
    if (!query || query.length < 1) return [];
    return fuse.search(query).map(r => r.item).slice(0, 20);
  }, [fuse, query]);
}
```

### ISR (Incremental Static Regeneration)

**`/questions/[langCode]/page.jsx`:**
```javascript
export const revalidate = 3600; // 1 saat
```

---

## 5. CI/CD: GitHub Actions

### Workflow Dosyası

**Dosya:** `.github/workflows/test-coverage.yml`

```yaml
name: Test & Coverage

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: test
          MYSQL_DATABASE: test_db
        ports: ['3306:3306']
        options: --health-cmd="mysqladmin ping" --health-interval=10s

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd backend && npm ci
      - run: cd backend && npm run test:cov
      - name: Check coverage
        run: |
          COV=$(node -e "const c=require('./backend/coverage/coverage-summary.json');console.log(c.total.lines.pct)")
          echo "Coverage: $COV%"
          node -e "if($COV < 80) process.exit(1)"

  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd user-front && npm ci
      - run: cd user-front && npm run test:cov
      - name: Check coverage
        run: |
          COV=$(node -e "const c=require('./user-front/coverage/coverage-summary.json');console.log(c.total.lines.pct)")
          echo "Coverage: $COV%"
          node -e "if($COV < 80) process.exit(1)"
```

---

## 6. Paket Bağımlılıkları

### Backend (yeni)
```bash
npm install cache-manager cache-manager-redis-store @nestjs/event-emitter
```

### Frontend (yeni)
```bash
npm install swr fuse.js
```

---

## 7. Test Planı

### language-cache.service.spec.ts
```typescript
describe('LanguageCacheService', () => {
  it('should return cached value when exists');
  it('should call factory when cache miss');
  it('should set TTL correctly');
  it('should invalidate by pattern');
  it('should invalidateAll');
});
```

### question-count.listener.spec.ts
```typescript
describe('QuestionCountListener', () => {
  it('should increment count on qa-item.created');
  it('should decrement count on qa-item.deleted');
  it('should not go below 0');
  it('should handle multiple languageIds');
  it('should invalidate stats cache');
});
```

### useLanguageList.test.js
```javascript
describe('useLanguageList', () => {
  it('should fetch languages on mount');
  it('should cache response for 1 hour');
  it('should not refetch on window focus');
  it('should handle error state');
});
```

### useLanguageSearch.test.js
```javascript
describe('useLanguageSearch', () => {
  it('should return empty for empty query');
  it('should find by nativeName');
  it('should find by englishName');
  it('should find by iso639_3');
  it('should find by alias');
  it('should limit results to 20');
  it('should handle fuzzy matching');
});
```

### Performance E2E
```typescript
describe('Languages Performance (e2e)', () => {
  it('GET /languages/qa-search should respond < 200ms');
  it('GET /languages/qa-grouped should respond < 300ms');
  it('cached requests should respond < 50ms');
});
```

---

## 8. Acceptance Criteria

- [ ] Redis cache aktif ve çalışır
- [ ] Cache invalidation doğru tetikleniyor
- [ ] questionCount otomatik güncelleniyor
- [ ] FULLTEXT arama çalışır
- [ ] Frontend SWR ile cache'lenmiş dil listesi kullanıyor
- [ ] Fuse.js ile anlık client-side arama çalışır
- [ ] ISR /questions/[langCode] sayfalarda aktif
- [ ] GitHub Actions CI geçiyor
- [ ] Coverage threshold PR'ları engelliyor
- [ ] Cache layer coverage >= 90%
- [ ] Genel backend coverage >= 80%
