# Çeviri Scriptleri

## 1. Hızlı Çeviri (Ana Bölümler) - Önerilen

`translate_sections.py` - Sadece common, auth, navigation, menu bölümlerini çevirir (~2 dk/dil):

```bash
cd user-front/src/i18n/messages
source .venv/bin/activate
python3 translate_sections.py hi hy sr mr te gu ml kn or
```

## 2. Tam Çeviri (Tüm Dosya)

`translate_missing.py` - Tüm JSON'u çevirir (~20 dk/dil):

```bash
python3 translate_missing.py hi hy sr mr te gu ml kn or
```

## Kurulum

```bash
cd user-front/src/i18n/messages
python3 -m venv .venv
source .venv/bin/activate
pip install deep-translator
```

## Diller

Ermenice (hy), Sırpça (sr), Hintçe (hi), Marathi (mr), Telugu (te), Gujarati (gu), Malayalam (ml), Kannada (kn), Odia (or)

---

## Yeni Dil Ekleme

Yeni bir dil eklediğinizde sadece o dil için çeviri yapmak için:

```bash
cd user-front/src/i18n/messages
source .venv/bin/activate
python3 translate_missing.py YENİ_DİL_KODU
```

### Örnekler

Urdu eklediyseniz:
```bash
python3 translate_missing.py ur
```

Swahili eklediyseniz:
```bash
python3 translate_missing.py sw
```

Birden fazla yeni dil için:
```bash
python3 translate_missing.py ur sw bn
```

### Önce Yapılması Gerekenler

1. **useLanguageContext.jsx** – `SUPPORTED_LOCALES` listesine dil kodunu ekleyin
2. **LanguageSwitcher.jsx** – `flagMap` ve `nameMap`'e dil kodunu ekleyin
3. **Çeviri dosyası oluşturun** (en.json'dan kopyalayın):
   ```bash
   cp en.json ur.json
   ```
4. **Çeviri script'ini çalıştırın:**
   ```bash
   python3 translate_missing.py ur
   ```
