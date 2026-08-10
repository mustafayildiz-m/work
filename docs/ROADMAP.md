# 300 Dilli Q&A Sistemi — Geliştirme Roadmap

> IslamicWindows.com Soru-Cevap bölümünü 300+ dil destekli, arama tabanlı dil seçimli,
> SEO uyumlu, mobil öncelikli ve RTL destekli bir mimariye dönüştürme planı.

## Genel Bakış

| Sprint | Başlık | Süre | Coverage Hedefi |
|--------|--------|------|-----------------|
| 1 | Veritabanı & Backend Altyapısı | 4 gün | >= 85% |
| 2 | Dil Seçim Sayfası (Frontend) | 4 gün | >= 80% |
| 3 | Dil Bazlı Q&A Sayfaları | 4 gün | >= 75% |
| 4 | Admin Panel — Dil Yönetimi | 3 gün | >= 85% |
| 5 | Performans, Cache ve Arama | 3 gün | >= 90% (cache) |
| 6 | Mobil Polish, RTL & Final QA | 3 gün | >= 80% (genel) |

**Toplam:** ~21 iş günü

---

## Sprint 1: Veritabanı & Backend Altyapısı

**Hedef:** Languages tablosunu 300+ dil için genişlet, seed datasını hazırla, yeni API endpoint'lerini test-driven geliştir.

### Çıktılar
- [ ] `languages` tablosu migration (nativeName, englishName, iso639_3, direction, aliases, parentLanguageId, questionCount, status)
- [ ] Language entity güncellemesi
- [ ] 300 dil seed datası (PDF'den parse)
- [ ] Yeni API endpoint'leri (qa-search, qa-suggested, qa-grouped, qa-stats)
- [ ] Unit testler (service, controller, DTO, entity)
- [ ] E2E test (languages-qa.e2e-spec.ts)
- [ ] Coverage raporu >= 85%

**Detaylı spec:** [specs/SPRINT-1-DB-BACKEND.md](specs/SPRINT-1-DB-BACKEND.md)

---

## Sprint 2: Dil Seçim Sayfası (Frontend)

**Hedef:** `/questions` landing sayfası: arama + öneriler + mobil öncelikli dil seçici. Frontend test altyapısını kur.

### Çıktılar
- [ ] Jest + Testing Library kurulumu (user-front)
- [ ] `/questions` sayfası (LanguagePicker landing)
- [ ] LanguageSearch component (debounced, fuzzy)
- [ ] LanguageCard component (nativeName, englishName, questionCount)
- [ ] LanguageGroupAccordion (Arabic/Chinese varyantlar)
- [ ] localStorage tercih hafızası
- [ ] `/feed/qa` → `/questions` redirect
- [ ] Component testleri
- [ ] Coverage raporu >= 80%

**Detaylı spec:** [specs/SPRINT-2-LANGUAGE-PICKER.md](specs/SPRINT-2-LANGUAGE-PICKER.md)

---

## Sprint 3: Dil Bazlı Q&A Sayfaları

**Hedef:** `/questions/[langCode]` dynamic route, dile özel Q&A içeriği, RTL/LTR, SEO meta tags, item detail sayfası.

### Çıktılar
- [ ] `/questions/[langCode]` dynamic route
- [ ] `/questions/[langCode]/[itemId]` detail route
- [ ] RTL/LTR dynamic layout (`dir`, `lang` attributes)
- [ ] Kategori filtreleme + soru arama + sayfalama
- [ ] SEO: generateMetadata, Open Graph, hreflang
- [ ] generateStaticParams (aktif diller)
- [ ] Frontend + backend testler
- [ ] Coverage: Q&A modülü >= 85%, frontend >= 75%

**Detaylı spec:** [specs/SPRINT-3-QA-PAGES.md](specs/SPRINT-3-QA-PAGES.md)

---

## Sprint 4: Admin Panel — Dil Yönetimi

**Hedef:** Admin panelden 300 dilin durumunu, içerik sayısını ve aktivasyonunu yönetme.

### Çıktılar
- [ ] `/diller/dashboard` sayfası
- [ ] `/diller/duzenle/:id` form sayfası
- [ ] Bulk status değiştirme
- [ ] Backend admin endpoint'leri
- [ ] Admin panel testleri
- [ ] Coverage >= 85%

**Detaylı spec:** [specs/SPRINT-4-ADMIN.md](specs/SPRINT-4-ADMIN.md)

---

## Sprint 5: Performans, Cache ve Arama

**Hedef:** Redis cache, frontend SWR, arama optimizasyonu, ISR, CI coverage gate.

### Çıktılar
- [ ] Redis cache layer (language list, search results)
- [ ] questionCount event-driven güncelleme
- [ ] FULLTEXT index (languages tablosu)
- [ ] Frontend SWR + client-side fuse.js
- [ ] ISR (revalidate: 3600)
- [ ] GitHub Actions CI: test + coverage threshold
- [ ] Performance testler
- [ ] Coverage: cache layer >= 90%

**Detaylı spec:** [specs/SPRINT-5-PERFORMANCE.md](specs/SPRINT-5-PERFORMANCE.md)

---

## Sprint 6: Mobil Polish, RTL Test & Final QA

**Hedef:** Tüm dillerde mobil deneyim, RTL test matrisi, sitemap, legacy redirect, tema uyumu.

### Çıktılar
- [ ] RTL test matrisi (Arabic, Persian, Urdu, Hebrew)
- [ ] Mobil test (iOS Safari, Android Chrome, 360px)
- [ ] Sitemap: `/sitemap-questions.xml`
- [ ] Legacy redirect: `/feed/qa` → `/questions` (301)
- [ ] Dark/Green tema uyumu
- [ ] Error pages (404, "Coming soon")
- [ ] Analytics event'leri
- [ ] E2E testler
- [ ] Genel coverage >= 80%

**Detaylı spec:** [specs/SPRINT-6-POLISH.md](specs/SPRINT-6-POLISH.md)

---

## Bağımlılık Grafiği

```
Sprint 1 (DB + Backend)
    ├──→ Sprint 2 (Language Picker)
    │        └──→ Sprint 3 (QA Pages)
    │                    └──→ Sprint 5 (Performance + CI)
    └──→ Sprint 4 (Admin Panel) ──→ Sprint 5
                                          └──→ Sprint 6 (Polish + E2E)
```

- Sprint 4, Sprint 2 ile paralel yürütülebilir (ikisi de Sprint 1'e bağımlı)
- Sprint 5 ve 6 her şeyin üzerine gelir

---

## Kullanıcının Sağlaması Gereken Veri

300 dil listesi (PDF mevcut: `backend/docs/Dunyada_En_Cok_Kullanilan_300_Dil_Ethnologue_Incelemeli.pdf`)

Ek olarak her dil için gerekli:
- Yerel adı (dilin kendi yazılışı) — örn: Türkçe, العربية, 日本語
- Yazı yönü (LTR/RTL)
- Ana dil grubu (varsa)
- Alternatif arama isimleri (varsa)

---

## Teknik Mimari

Detaylı mimari doküman: [architecture/SYSTEM-DESIGN.md](architecture/SYSTEM-DESIGN.md)
