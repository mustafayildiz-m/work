# Sprint 4: Admin Panel — Dil Yönetimi — Teknik Spec

## Özet

| Alan | Değer |
|------|-------|
| Süre | 3 iş günü |
| Coverage hedefi | >= 85% (admin language endpoints) |
| Bağımlılık | Sprint 1 (DB ready), Sprint 3 ile paralel olabilir |
| Çıktı | Admin dashboard + form + bulk actions + tests |

---

## 1. Admin Sayfaları

### /diller/dashboard — Dil Yönetim Paneli

**Dosya:** `admin-front/src/pages/diller/dashboard/index.jsx`

#### Görünüm
```
┌──────────────────────────────────────────────────────────────┐
│  Dil Yönetimi                              [+ Yeni Dil Ekle] │
├──────────────────────────────────────────────────────────────┤
│  Filtreler: [Tümü ▾] [Active ▾] [In Progress ▾] [🔍 Ara... ]│
├──────────────────────────────────────────────────────────────┤
│  ☐ │ Yerel Adı    │ İngilizce  │ ISO │ Yön │ Soru │ Durum  │
│  ──┼──────────────┼────────────┼─────┼─────┼──────┼────────│
│  ☐ │ العربية      │ Arabic     │ ara │ RTL │ 650  │ Active │
│  ☐ │ Türkçe       │ Turkish    │ tur │ LTR │ 420  │ Active │
│  ☐ │ Suomi        │ Finnish    │ fin │ LTR │ 48   │ In Prg │
│  ☐ │ 日本語       │ Japanese   │ jpn │ LTR │ 175  │ Active │
│  ...                                                          │
├──────────────────────────────────────────────────────────────┤
│  Seçili: 3  [Aktif Yap] [Yayından Kaldır]    Sayfa 1/15     │
└──────────────────────────────────────────────────────────────┘
```

#### Özellikler
- Paginated tablo (20 satır/sayfa)
- Sütun sıralaması (nativeName, questionCount, status)
- Status filtresi (dropdown: All, Active, In Progress, Not Published)
- Metin araması (nativeName, englishName, iso639_3)
- Checkbox ile çoklu seçim
- Bulk status değiştirme
- Satır tıklama → düzenleme sayfasına git

---

### /diller/duzenle/:id — Dil Düzenleme Formu

**Dosya:** `admin-front/src/pages/diller/duzenle/index.jsx`

#### Form Alanları
| Alan | Tip | Açıklama |
|------|-----|----------|
| nativeName | text input | Dilin kendi yazılışı |
| englishName | text input | İngilizce adı |
| iso639_3 | text input (readonly) | 3 harfli kod |
| direction | select (LTR/RTL) | Yazı yönü |
| aliases | tag input | Alternatif isimler (JSON array) |
| parentLanguage | select (searchable) | Ana dil grubu |
| status | radio group | Active / In Progress / Not Published |

#### Yan Panel: İstatistikler
- Toplam soru sayısı
- Kategori dağılımı
- Son eklenen soru tarihi
- Bağlı varyant dilleri (children)

---

## 2. Backend Endpoint'leri

### GET /languages/admin/dashboard

**Auth:** JWT (admin only)

**Query params:**
| Param | Tip | Default | Açıklama |
|-------|-----|---------|----------|
| page | number | 1 | Sayfa numarası |
| limit | number | 20 | Sayfa boyutu |
| status | string | (all) | Filtre: active, in_progress, not_published |
| q | string | — | Arama terimi |
| sort | string | 'questionCount' | Sıralama alanı |
| order | string | 'DESC' | ASC veya DESC |

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "nativeName": "العربية",
      "englishName": "Arabic",
      "iso639_3": "ara",
      "direction": "rtl",
      "questionCount": 650,
      "status": "active",
      "childrenCount": 13
    }
  ],
  "total": 300,
  "page": 1,
  "limit": 20,
  "stats": {
    "active": 45,
    "inProgress": 28,
    "notPublished": 227,
    "totalQuestions": 12500
  }
}
```

---

### PATCH /languages/bulk-status

**Auth:** JWT (admin only)

**Body:**
```json
{
  "ids": [1, 5, 12, 45],
  "status": "active"
}
```

**Response:**
```json
{
  "updated": 4,
  "languages": [ ... ]
}
```

**Validation:**
- ids: non-empty array of numbers
- status: valid enum value
- Max 50 ids per request

---

## 3. Admin Menu Entegrasyonu

**Dosya:** `admin-front/src/config/menu.config.jsx`

```javascript
{
  title: 'Diller',
  icon: <BsGlobe />,
  children: [
    { title: 'Dashboard', path: '/diller/dashboard' },
    { title: 'Dil Ekle', path: '/diller/ekle' },
  ],
}
```

---

## 4. Test Planı

### Backend Unit Tests

**languages.service.spec.ts** (ek)
```typescript
describe('LanguagesService - Admin', () => {
  describe('getAdminDashboard(query)', () => {
    it('should return paginated results');
    it('should filter by status');
    it('should search by nativeName/englishName/iso639_3');
    it('should sort by specified field');
    it('should include childrenCount');
    it('should include aggregate stats');
  });

  describe('bulkUpdateStatus(ids, status)', () => {
    it('should update multiple languages');
    it('should throw for empty ids array');
    it('should throw for invalid status');
    it('should limit to 50 ids');
    it('should return updated languages');
  });
});
```

**languages.controller.spec.ts** (ek)
```typescript
describe('LanguagesController - Admin', () => {
  describe('GET /languages/admin/dashboard', () => {
    it('should require JWT auth');
    it('should return 200 with paginated data');
    it('should apply filters');
  });

  describe('PATCH /languages/bulk-status', () => {
    it('should require JWT auth');
    it('should return 200 on success');
    it('should return 400 for invalid body');
  });
});
```

### Admin Frontend Tests

**dashboard.test.jsx**
```javascript
describe('LanguageDashboard', () => {
  it('should render language table');
  it('should show status filter dropdown');
  it('should filter by status');
  it('should search by text');
  it('should sort columns');
  it('should select multiple rows');
  it('should bulk update status');
  it('should show stats summary');
  it('should paginate');
  it('should navigate to edit on row click');
});
```

**duzenle.test.jsx**
```javascript
describe('LanguageEdit', () => {
  it('should load language data');
  it('should display form fields');
  it('should validate required fields');
  it('should save changes on submit');
  it('should show success toast');
  it('should show children languages');
});
```

---

## 5. Acceptance Criteria

- [ ] Admin dashboard tüm 300 dili sayfalı gösteriyor
- [ ] Status filtresi çalışır
- [ ] Arama çalışır (native + english + iso)
- [ ] Sıralama çalışır (tüm sütunlar)
- [ ] Bulk status değiştirme çalışır
- [ ] Düzenleme formu kayıt yapıyor
- [ ] JWT olmadan 401 dönüyor
- [ ] Tüm testler geçer
- [ ] Coverage >= 85%
