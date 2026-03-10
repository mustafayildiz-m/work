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
