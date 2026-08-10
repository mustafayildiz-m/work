# Sprint 1: Veritabanı & Backend Altyapısı — Teknik Spec

## Özet

| Alan | Değer |
|------|-------|
| Süre | 4 iş günü |
| Coverage hedefi | >= 85% (languages modülü) |
| Bağımlılık | Yok (ilk sprint) |
| Çıktı | Migration + Entity + Seed + API + Tests |

---

## 1. Migration: Languages Tablosu Genişletme

**Dosya:** `backend/src/migrations/XXXX-ExtendLanguagesForQa300.ts`

### Yeni Sütunlar

| Sütun | Tip | Default | Açıklama |
|-------|-----|---------|----------|
| nativeName | VARCHAR(100), nullable | NULL | Dilin kendi yazılışı |
| englishName | VARCHAR(100), nullable | NULL | İngilizce adı |
| iso639_3 | CHAR(3), unique, nullable | NULL | 3 harfli ISO kodu |
| direction | ENUM('ltr','rtl') | 'ltr' | Yazı yönü |
| aliases | TEXT, nullable | NULL | JSON array alternatif isimler |
| parentLanguageId | INT, nullable | NULL | Self-FK (ana dil) |
| questionCount | INT | 0 | Denormalize soru sayacı |
| status | ENUM('active','in_progress','not_published') | 'not_published' | Yayın durumu |

### SQL (Migration up)
```sql
ALTER TABLE languages
  ADD COLUMN nativeName VARCHAR(100) NULL AFTER name,
  ADD COLUMN englishName VARCHAR(100) NULL AFTER nativeName,
  ADD COLUMN iso639_3 CHAR(3) NULL AFTER code,
  ADD COLUMN direction ENUM('ltr','rtl') NOT NULL DEFAULT 'ltr' AFTER iso639_3,
  ADD COLUMN aliases TEXT NULL AFTER direction,
  ADD COLUMN parentLanguageId INT NULL AFTER aliases,
  ADD COLUMN questionCount INT NOT NULL DEFAULT 0 AFTER parentLanguageId,
  ADD COLUMN status ENUM('active','in_progress','not_published') NOT NULL DEFAULT 'not_published' AFTER questionCount;

ALTER TABLE languages
  ADD UNIQUE INDEX idx_iso639_3 (iso639_3),
  ADD INDEX idx_parent_language (parentLanguageId),
  ADD INDEX idx_status (status),
  ADD FULLTEXT INDEX ft_lang_search (nativeName, englishName, aliases),
  ADD CONSTRAINT fk_parent_language
    FOREIGN KEY (parentLanguageId) REFERENCES languages(id) ON DELETE SET NULL;
```

### SQL (Migration down)
```sql
ALTER TABLE languages
  DROP FOREIGN KEY fk_parent_language,
  DROP INDEX ft_lang_search,
  DROP INDEX idx_status,
  DROP INDEX idx_parent_language,
  DROP INDEX idx_iso639_3,
  DROP COLUMN status,
  DROP COLUMN questionCount,
  DROP COLUMN parentLanguageId,
  DROP COLUMN aliases,
  DROP COLUMN direction,
  DROP COLUMN iso639_3,
  DROP COLUMN englishName,
  DROP COLUMN nativeName;
```

---

## 2. Entity Güncellemesi

**Dosya:** `backend/src/languages/entities/language.entity.ts`

### Eklenen Alanlar
```typescript
@Column({ type: 'varchar', length: 100, nullable: true })
nativeName: string;

@Column({ type: 'varchar', length: 100, nullable: true })
englishName: string;

@Column({ type: 'char', length: 3, nullable: true, unique: true })
iso639_3: string;

@Column({ type: 'enum', enum: ['ltr', 'rtl'], default: 'ltr' })
direction: 'ltr' | 'rtl';

@Column({ type: 'text', nullable: true })
aliases: string; // JSON array stored as text

@ManyToOne(() => Language, { nullable: true, onDelete: 'SET NULL' })
@JoinColumn({ name: 'parentLanguageId' })
parentLanguage: Language;

@Column({ nullable: true })
parentLanguageId: number;

@OneToMany(() => Language, (lang) => lang.parentLanguage)
children: Language[];

@Column({ type: 'int', default: 0 })
questionCount: number;

@Column({ type: 'enum', enum: ['active', 'in_progress', 'not_published'], default: 'not_published' })
status: 'active' | 'in_progress' | 'not_published';
```

---

## 3. Seed Datası (300 Dil)

**Dosya:** `backend/src/seeders/qa-300-languages.data.ts`

### Veri Yapısı
```typescript
export interface Qa300LanguageEntry {
  rank: number;
  englishName: string;
  iso639_3: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  aliases: string[];
  parentIso?: string; // parent dil kodu (varsa)
  estimatedSpeakers: string;
}
```

### Kaynak
PDF dosyası: `backend/docs/Dunyada_En_Cok_Kullanilan_300_Dil_Ethnologue_Incelemeli.pdf`

### RTL Diller (seed'de direction='rtl' olacaklar)
```
ara, fas, urd, heb, arq, afb, acw, apd, aec, acm, ayp, aeb, ayl, acq, apc, shu,
mey, ckb, sdh, kas, bal, bgp, mzn, glk, pus, snd, skr, uig
```

### Parent İlişkileri
| Parent (ISO) | Çocuklar |
|--------------|----------|
| ara | arq, afb, acw, apd, aec, acm, ayp, aeb, ayl, acq, apc, shu, mey |
| zho | cmn, yue, wuu, hak, hsn, gan, cjy, mnp, cdo, czh, cpx |
| kur | ckb, sdh |
| msa | meo, msi, pse, abs, mfp |
| que | quh |

**Seeder dosyası:** `backend/src/seeders/qa-300-languages-seeder.ts`

**Komut:** `npm run seed:qa-300-languages`

### Seeder Davranışı
1. `iso639_3` ile mevcut kayıt arar (upsert)
2. Mevcutsa: nativeName, englishName, direction, aliases, parentLanguageId günceller
3. Yoksa: yeni kayıt oluşturur
4. Parent ilişkileri: iki geçişli (önce tüm diller, sonra parent bağlantıları)

---

## 4. Yeni API Endpoint'leri

### GET /languages/qa-search

**Query params:**
| Param | Tip | Zorunlu | Açıklama |
|-------|-----|---------|----------|
| q | string | Evet | Arama terimi (min 1 karakter) |
| limit | number | Hayır | Max sonuç (default: 20, max: 50) |

**Response:** `Language[]` (nativeName, englishName, iso639_3, direction, questionCount, status)

**Arama mantığı:**
1. Exact ISO 639-3 match → tek sonuç
2. LIKE `%q%` on nativeName, englishName, aliases
3. Status: yalnızca 'active' ve 'in_progress' gösterilir
4. Sort: questionCount DESC

---

### GET /languages/qa-suggested

**Headers:** `Accept-Language` (browser dil tercihi)

**Response:**
```json
{
  "browserSuggested": { ... } | null,
  "popular": [ ... ]  // Top 12 by questionCount
}
```

**Mantık:**
1. Accept-Language header'dan ilk 2-3 dil kodu çıkar
2. DB'de eşleşen dilleri "browserSuggested" olarak döndür
3. "popular": questionCount'a göre ilk 12 aktif dil

---

### GET /languages/qa-grouped

**Response:**
```json
[
  {
    "id": 1,
    "nativeName": "العربية",
    "englishName": "Arabic",
    "iso639_3": "ara",
    "questionCount": 650,
    "children": [
      { "id": 41, "nativeName": "...", "englishName": "Algerian Arabic", "iso639_3": "arq", ... },
      ...
    ]
  },
  {
    "id": 15,
    "nativeName": "Türkçe",
    "englishName": "Turkish",
    "iso639_3": "tur",
    "questionCount": 420,
    "children": []
  },
  ...
]
```

**Mantık:**
1. Parent diller (parentLanguageId = NULL) + bağımsız diller
2. Her parent'ın children'ı eager load
3. Sadece 'active' ve 'in_progress' status
4. Sort: questionCount DESC

---

### GET /languages/qa-stats

**Auth:** Opsiyonel (public ama admin daha fazla veri alır)

**Response:**
```json
{
  "totalLanguages": 300,
  "activeLanguages": 45,
  "inProgressLanguages": 28,
  "totalQuestions": 12500,
  "topLanguages": [
    { "iso639_3": "ara", "englishName": "Arabic", "questionCount": 650 },
    ...
  ]
}
```

---

### PATCH /languages/:id/status

**Auth:** JWT (admin only)

**Body:**
```json
{
  "status": "active" | "in_progress" | "not_published"
}
```

**Response:** Updated language object

---

## 5. Test Planı

### Unit Tests — Service

**Dosya:** `backend/src/languages/languages.service.spec.ts`

```typescript
describe('LanguagesService - QA 300', () => {
  describe('qaSearch(query)', () => {
    it('should find language by exact ISO 639-3 code');
    it('should find language by native name (case-insensitive)');
    it('should find language by English name');
    it('should find language by alias');
    it('should not return "not_published" languages');
    it('should limit results to specified count');
    it('should order results by questionCount DESC');
    it('should return empty array for no match');
    it('should handle special characters in query');
  });

  describe('qaSuggested(acceptLanguage)', () => {
    it('should parse Accept-Language header correctly');
    it('should return browser-matched language as suggestion');
    it('should return top 12 popular languages');
    it('should handle missing Accept-Language header');
    it('should not suggest inactive languages');
  });

  describe('qaGrouped()', () => {
    it('should return parent languages with children');
    it('should not include children as top-level entries');
    it('should sort by questionCount');
    it('should only include active/in_progress languages');
  });

  describe('qaStats()', () => {
    it('should return correct total counts');
    it('should return top languages by questionCount');
  });

  describe('updateStatus(id, status)', () => {
    it('should update language status');
    it('should throw NotFoundException for invalid id');
    it('should validate status enum value');
  });
});
```

### Unit Tests — Controller

**Dosya:** `backend/src/languages/languages.controller.spec.ts`

```typescript
describe('LanguagesController - QA 300', () => {
  describe('GET /languages/qa-search', () => {
    it('should return 200 with matching languages');
    it('should return 400 when query is empty');
    it('should pass query to service');
  });

  describe('GET /languages/qa-suggested', () => {
    it('should pass Accept-Language to service');
    it('should return 200 with suggestions');
  });

  describe('GET /languages/qa-grouped', () => {
    it('should return 200 with grouped languages');
  });

  describe('GET /languages/qa-stats', () => {
    it('should return 200 with statistics');
  });

  describe('PATCH /languages/:id/status', () => {
    it('should require JWT authentication');
    it('should return 200 on successful update');
    it('should return 404 for invalid language id');
    it('should return 400 for invalid status value');
  });
});
```

### Unit Tests — DTO

**Dosya:** `backend/src/languages/dto/language-search.dto.spec.ts`

```typescript
describe('LanguageSearchDto', () => {
  it('should validate q is not empty');
  it('should accept limit between 1 and 50');
  it('should default limit to 20');
});

describe('UpdateLanguageStatusDto', () => {
  it('should accept valid status values');
  it('should reject invalid status values');
});
```

### E2E Tests

**Dosya:** `backend/test/languages-qa.e2e-spec.ts`

```typescript
describe('Languages QA API (e2e)', () => {
  it('GET /languages/qa-search?q=tur → returns Turkish');
  it('GET /languages/qa-search?q=العربية → returns Arabic');
  it('GET /languages/qa-search?q=xyz → returns empty');
  it('GET /languages/qa-suggested → returns popular languages');
  it('GET /languages/qa-grouped → returns grouped structure');
  it('GET /languages/qa-stats → returns statistics');
  it('PATCH /languages/:id/status without auth → 401');
  it('PATCH /languages/:id/status with auth → 200');
});
```

---

## 6. Acceptance Criteria

- [ ] Migration başarıyla çalışır (up + down)
- [ ] 300 dil seed'i hatasız tamamlanır
- [ ] qa-search endpoint 3 farklı alanla arama yapabilir
- [ ] qa-suggested browser dil algılaması çalışır
- [ ] qa-grouped parent-child ilişkileri doğru
- [ ] Mevcut `/languages` endpoint'leri bozulmaz (backward compat)
- [ ] `npm run test:cov` — languages modülü >= 85% line coverage
- [ ] E2E testler geçer
- [ ] Mevcut Q&A fonksiyonalitesi etkilenmez
