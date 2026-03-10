#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Google Translate (deep-translator) ile DeepL'in desteklemediği dilleri çevirir.
Kullanım: pip install deep-translator && python3 translate_missing.py
Diller: hy (Ermenice), sr (Sırpça), hi (Hintçe), mr (Marathi), te (Telugu),
        gu (Gujarati), ml (Malayalam), kn (Kannada), or (Odia)
"""

import json
import os
import re
import sys
import time
from datetime import datetime

try:
    from deep_translator import GoogleTranslator
except ImportError:
    print("❌ deep-translator kurulu değil. Kurmak için: pip install deep-translator")
    exit(1)

# Çevrilecek diller (DeepL desteklemiyor)
# Sadece belirli dilleri çevirmek için listeyi kısaltın
TARGET_LANGUAGES = {
    'hy': 'hy',  # Armenian
    'sr': 'sr',  # Serbian
    'hi': 'hi',  # Hindi
    'mr': 'mr',  # Marathi
    'te': 'te',  # Telugu
    'gu': 'gu',  # Gujarati
    'ml': 'ml',  # Malayalam
    'kn': 'kn',  # Kannada
    'or': 'or',  # Odia
}

# Placeholder'ları korumak için geçici değiştirme
PLACEHOLDER_MAP = {}
PLACEHOLDER_COUNTER = [0]

def protect_placeholders(text):
    """Metindeki {param} formatındaki placeholder'ları koru"""
    def replace_placeholder(match):
        key = f"__PLACEHOLDER_{PLACEHOLDER_COUNTER[0]}__"
        PLACEHOLDER_MAP[key] = match.group(0)
        PLACEHOLDER_COUNTER[0] += 1
        return key
    return re.sub(r'\{[a-zA-Z_]+\}', replace_placeholder, text)

def restore_placeholders(text):
    """Placeholder'ları geri yükle"""
    result = text
    for key, value in PLACEHOLDER_MAP.items():
        result = result.replace(key, value)
    PLACEHOLDER_MAP.clear()
    PLACEHOLDER_COUNTER[0] = 0
    return result

def translate_text_google(text, target_lang, source_lang='en'):
    """Google Translate ile çeviri yap"""
    if not text or not text.strip():
        return text
    
    # Sadece boşluk veya özel karakterler varsa çevirme
    if not re.search(r'[a-zA-Z\u0400-\u04FF\u0600-\u06FF\u0900-\u097F\u0B80-\u0BFF\u0C80-\u0CFF\u0D00-\u0D7F\u0E00-\u0E7F\u0B00-\u0B7F\u0980-\u09FF\u0A80-\u0AFF]', text):
        return text
    
    try:
        # Placeholder'ları koru
        protected = protect_placeholders(text)
        
        translator = GoogleTranslator(source=source_lang, target=target_lang)
        translated = translator.translate(protected[:5000])  # Google limit
        
        if translated:
            result = restore_placeholders(translated)
            return result
    except Exception as e:
        print(f"       ⚠️  Çeviri hatası: {str(e)[:80]}", flush=True)
    
    return text

def translate_recursive(data, target_lang, section_name="", count=[0], success=[0]):
    """JSON'u özyinelemeli çevir"""
    if isinstance(data, dict):
        result = {}
        for key, value in data.items():
            path = f"{section_name}.{key}" if section_name else key
            result[key] = translate_recursive(value, target_lang, path, count, success)
        return result
    elif isinstance(data, list):
        return [translate_recursive(item, target_lang, section_name, count, success) 
                if isinstance(item, (dict, str)) else item for item in data]
    elif isinstance(data, str) and data.strip():
        count[0] += 1
        if count[0] % 50 == 0:
            print(f"    📊 {count[0]} çeviri...", flush=True)
        
        translated = translate_text_google(data, target_lang)
        if translated != data:
            success[0] += 1
        time.sleep(0.15)  # Rate limit
        return translated
    else:
        return data

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    print("=" * 70)
    print("GOOGLE TRANSLATE İLE EKSİK DİLLERİN ÇEVİRİSİ")
    print("=" * 70)
    print(f"Dizin: {script_dir}")
    print(f"Başlangıç: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Diller: {', '.join(TARGET_LANGUAGES.keys())}")
    print("\n⚠️  Bu işlem 15-30 dakika sürebilir (rate limit nedeniyle)\n")
    
    with open('en.json', 'r', encoding='utf-8') as f:
        en_data = json.load(f)
    
    # Komut satırından dil belirtilebilir: python3 translate_missing.py hi mr
    langs_to_translate = sys.argv[1:] if len(sys.argv) > 1 else list(TARGET_LANGUAGES.keys())
    
    for lang_code in langs_to_translate:
        if lang_code not in TARGET_LANGUAGES:
            print(f"  ⚠️  Bilinmeyen dil: {lang_code}, atlanıyor")
            continue
        filename = f"{lang_code}.json"
        print(f"\n{'='*50}")
        print(f"📝 {filename} çevriliyor ({lang_code})...")
        print('='*50)
        
        count, success = [0], [0]
        start = time.time()
        
        try:
            translated = translate_recursive(en_data.copy(), lang_code, "", count, success)
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(translated, f, ensure_ascii=False, indent=2)
            
            elapsed = time.time() - start
            print(f"  ✅ Kaydedildi: {count[0]} çeviri, {success[0]} başarılı ({elapsed:.1f}s)")
            
        except Exception as e:
            print(f"  ❌ Hata: {e}")
            import traceback
            traceback.print_exc()
    
    print("\n" + "=" * 70)
    print("✅ TÜM ÇEVİRİLER TAMAMLANDI!")
    print("=" * 70)

if __name__ == '__main__':
    main()
