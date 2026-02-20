#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DeepL API ile tüm çeviri dosyalarını çevirir
Kullanım: python3 translate_all.py
"""

import json
import os
import urllib.request
import urllib.parse
import time
from datetime import datetime

# DeepL API bilgileri
DEEPL_API_KEY = "b80f08d3-407a-4af5-981b-6075c1efda10:fx"
DEEPL_API_URL = "https://api-free.deepl.com/v2/translate"

# DeepL'in desteklediği diller (ücretsiz API)
DEEPL_SUPPORTED_LANGUAGES = {
    'en': 'EN', 'de': 'DE', 'fr': 'FR', 'es': 'ES', 'pt': 'PT', 
    'it': 'IT', 'ru': 'RU', 'ja': 'JA', 'zh': 'ZH', 'ko': 'KO',
    'nl': 'NL', 'pl': 'PL', 'sv': 'SV', 'da': 'DA', 'fi': 'FI',
    'el': 'EL', 'cs': 'CS', 'sk': 'SK', 'uk': 'UK', 'bg': 'BG',
    'hr': 'HR', 'ro': 'RO', 'hu': 'HU', 'et': 'ET', 'lv': 'LV',
    'lt': 'LT', 'sl': 'SL', 'id': 'ID', 'ms': 'MS', 'th': 'TH',
    'vi': 'VI', 'tr': 'TR', 'ar': 'AR', 'no': 'NO'
}

# Dil kodlarını DeepL formatına çevir
def map_language_code(lang_code):
    lang_code_lower = lang_code.lower()
    
    # DeepL'in desteklediği dilleri doğrudan döndür
    if lang_code_lower in DEEPL_SUPPORTED_LANGUAGES:
        return DEEPL_SUPPORTED_LANGUAGES[lang_code_lower]
    
    # Desteklenmeyen diller için fallback (yakın diller)
    fallback_map = {
        'hi': None,  # Hindi - DeepL desteklemiyor
        'bn': None,  # Bengali - DeepL desteklemiyor
        'ta': None,  # Tamil - DeepL desteklemiyor
        'te': None,  # Telugu - DeepL desteklemiyor
        'gu': None,  # Gujarati - DeepL desteklemiyor
        'ml': None,  # Malayalam - DeepL desteklemiyor
        'kn': None,  # Kannada - DeepL desteklemiyor
        'or': None,  # Odia - DeepL desteklemiyor
        'mr': None,  # Marathi - DeepL desteklemiyor
        'he': None,  # Hebrew - DeepL desteklemiyor (ücretsiz API'de)
        'fa': None,  # Persian - DeepL desteklemiyor
        'ur': None,  # Urdu - DeepL desteklemiyor
        'ku': 'EN',  # Kurdish -> English (fallback, ama kaynak EN olduğu için atlanacak)
        'hy': 'EN',  # Armenian -> English (fallback, ama kaynak EN olduğu için atlanacak)
        'mk': 'BG',  # Macedonian -> Bulgarian (yakın)
        'sr': None,  # Serbian -> HR desteklenmiyor, çeviri yapılamaz
        'mt': 'IT',  # Maltese -> Italian (yakın)
    }
    
    return fallback_map.get(lang_code_lower, None)

# Dil DeepL tarafından destekleniyor mu?
def is_language_supported(lang_code):
    lang_code_lower = lang_code.lower()
    return lang_code_lower in DEEPL_SUPPORTED_LANGUAGES

# DeepL API ile çeviri yap
def translate_text(text, target_lang, source_lang='EN', retries=5):
    if not text or not text.strip():
        return text
    
    target_lang_mapped = map_language_code(target_lang)
    
    # Desteklenmeyen dil kontrolü
    if target_lang_mapped is None:
        print(f"       ⚠️  {target_lang} dili DeepL tarafından desteklenmiyor, çeviri yapılamıyor")
        return text
    
    # Kaynak ve hedef dil aynıysa çeviri yapma
    if target_lang_mapped == source_lang:
        return text
    
    for attempt in range(retries):
        try:
            if attempt > 0:
                delay = min(1000 * (2 ** (attempt - 1)), 5000) / 1000
                time.sleep(delay)
            
            params = urllib.parse.urlencode({
                'text': text,
                'target_lang': target_lang_mapped,
                'source_lang': source_lang
            }).encode('utf-8')
            
            req = urllib.request.Request(
                DEEPL_API_URL,
                data=params,
                headers={
                    'Authorization': f'DeepL-Auth-Key {DEEPL_API_KEY}',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            )
            
            with urllib.request.urlopen(req, timeout=30) as response:
                response_body = response.read().decode('utf-8')
                if response.status == 200:
                    data = json.loads(response_body)
                    if data.get('translations') and len(data['translations']) > 0:
                        translated = data['translations'][0]['text']
                        # Başarılı çeviri kontrolü
                        if translated and translated.strip() and translated != text:
                            return translated
                        else:
                            print(f"       ⚠️  Çeviri boş veya aynı: '{translated}'")
                            return text
                    else:
                        print(f"       ⚠️  API yanıtı boş veya hatalı: {response_body[:200]}")
                        return text
                elif response.status == 429:
                    # Rate limit için daha uzun bekleme
                    wait_time = 30 + (attempt * 10)  # 30, 40, 50 saniye
                    if attempt < retries - 1:
                        print(f"    ⚠️  Rate limit, {wait_time} saniye bekleniyor...")
                        time.sleep(wait_time)
                        continue
                    else:
                        print(f"    ⚠️  Rate limit hatası, çeviri yapılamadı")
                        return text
                elif response.status == 400:
                    # HTTP 400 = Dil desteklenmiyor
                    print(f"    ⚠️  HTTP 400 hatası: {response_body[:200]}")
                    return None  # None döndür, test başarısız olduğunu gösterir
                else:
                    print(f"    ⚠️  HTTP {response.status} hatası: {response_body[:200]}")
                    if attempt < retries - 1:
                        continue
                    return text
        except urllib.error.HTTPError as e:
            try:
                error_body = e.read().decode('utf-8')
            except:
                error_body = str(e)
            if e.code == 429:
                # Rate limit için daha uzun bekleme
                wait_time = 30 + (attempt * 10)  # 30, 40, 50 saniye
                if attempt < retries - 1:
                    print(f"    ⚠️  Rate limit (HTTP {e.code}), {wait_time} saniye bekleniyor...")
                    time.sleep(wait_time)
                    continue
                else:
                    print(f"    ⚠️  Rate limit hatası, çeviri yapılamadı")
                    return text
            elif e.code == 400:
                # HTTP 400 = Dil desteklenmiyor
                print(f"    ⚠️  HTTP 400 hatası: {error_body[:200]}")
                # Özel bir değer döndür ki test başarısız olduğunu anlayabilelim
                return None  # None döndür, test başarısız olduğunu gösterir
            else:
                print(f"    ⚠️  HTTP {e.code} hatası: {error_body[:200]}")
            if attempt < retries - 1:
                continue
            return text
        except Exception as e:
            print(f"    ⚠️  Çeviri hatası: {str(e)[:200]}")
            if attempt < retries - 1:
                time.sleep(2)
                continue
            return text
    
    return text

# JSON dosyasını optimize şekilde çevir
def translate_file_section(data, target_lang, section_name, translated_count=[0], success_count=[0], fail_count=[0]):
    if isinstance(data, dict):
        translated = {}
        for key, value in data.items():
            current_path = f"{section_name}.{key}" if section_name else key
            if isinstance(value, dict):
                translated[key] = translate_file_section(value, target_lang, current_path, translated_count, success_count, fail_count)
            elif isinstance(value, list):
                translated[key] = [translate_file_section(item, target_lang, current_path, translated_count, success_count, fail_count) if isinstance(item, (dict, str)) else item for item in value]
            elif isinstance(value, str) and value.strip():
                translated_count[0] += 1
                # Her çeviride anında göster
                print(f"    ✓ [{translated_count[0]}] {current_path}: {value[:50]}{'...' if len(value) > 50 else ''}")
                translated_value = translate_text(value, target_lang)
                # None kontrolü (HTTP 400 hatası durumunda)
                if translated_value is None:
                    translated_value = value  # Orijinal metni koru
                    fail_count[0] += 1
                    print(f"       ⚠️  Çeviri yapılamadı (dil desteklenmiyor)")
                translated[key] = translated_value
                # Çeviri sonucunu göster
                if translated_value != value:
                    success_count[0] += 1
                    print(f"       → {translated_value[:50]}{'...' if len(translated_value) > 50 else ''}")
                else:
                    if translated_value is not None:  # None değilse say
                        fail_count[0] += 1
                    print(f"       ⚠️  Çeviri yapılamadı (aynı değer döndü)")
                
                # Her 10 çeviride bir özet
                if translated_count[0] % 10 == 0:
                    print(f"    📊 İlerleme: {translated_count[0]} çeviri | ✅ {success_count[0]} başarılı | ❌ {fail_count[0]} başarısız")
                
                # Rate limiting için daha uzun bekleme (DeepL ücretsiz API için)
                time.sleep(1.0)  # 1 saniye bekleme
            else:
                translated[key] = value
        return translated
    elif isinstance(data, str) and data.strip():
        translated_count[0] += 1
        current_path = section_name if section_name else "root"
        print(f"    ✓ [{translated_count[0]}] {current_path}: {data[:50]}{'...' if len(data) > 50 else ''}")
        translated_value = translate_text(data, target_lang)
        # None kontrolü (HTTP 400 hatası durumunda)
        if translated_value is None:
            translated_value = data  # Orijinal metni koru
            fail_count[0] += 1
            print(f"       ⚠️  Çeviri yapılamadı (dil desteklenmiyor)")
        elif translated_value != data:
            success_count[0] += 1
            print(f"       → {translated_value[:50]}{'...' if len(translated_value) > 50 else ''}")
        else:
            fail_count[0] += 1
            print(f"       ⚠️  Çeviri yapılamadı (aynı değer döndü)")
        return translated_value
    else:
        return data

def main():
    # Script'in bulunduğu dizine geç
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    print("=" * 80)
    print("DEEPL API İLE TÜM ÇEVİRİLERİ HAZIRLAMA")
    print("=" * 80)
    print(f"Çalışma dizini: {script_dir}")
    print(f"Başlangıç zamanı: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"API URL: {DEEPL_API_URL}")
    print(f"API Key: {DEEPL_API_KEY[:20]}...")
    print("\n⚠️  NOT: Bu işlem uzun sürecek!")
    print("⚠️  Her dosya için yüzlerce çeviri yapılacak")
    print("⚠️  Rate limiting nedeniyle her çeviri arasında bekleme yapılacak")
    print("\nBaşlatılıyor...\n")

    # İngilizce kaynak dosyasını oku
    en_json_path = os.path.join(script_dir, 'en.json')
    if not os.path.exists(en_json_path):
        print(f"❌ HATA: en.json dosyası bulunamadı: {en_json_path}")
        return
    
    with open(en_json_path, 'r', encoding='utf-8') as f:
        en_data = json.load(f)

    welcome_en = en_data.get('common', {}).get('welcome', 'Welcome')

    # DeepL tarafından desteklenen diller (desteklenmeyenler kaldırıldı)
    new_files = {
        'zh.json': 'zh', 'es.json': 'es', 'pt.json': 'pt',
        'ru.json': 'ru', 'it.json': 'it', 'ko.json': 'ko', 'uk.json': 'uk',
        'ro.json': 'ro', 'bg.json': 'bg',
        'hu.json': 'hu', 'cs.json': 'cs', 'pl.json': 'pl', 'sk.json': 'sk',
        'sl.json': 'sl', 'mk.json': 'mk'  # mk fallback BG kullanıyor
    }

    total_files = len(new_files)
    current_file = 0
    start_time = time.time()

    for filename, lang_code in new_files.items():
        current_file += 1
        file_start_time = time.time()
        print(f"\n[{current_file}/{total_files}] {filename} ({lang_code}) çevriliyor...")
        
        if not os.path.exists(filename):
            print(f"  ⚠️  Dosya bulunamadı: {filename}")
            continue
        
        # Dil desteği kontrolü
        if not is_language_supported(lang_code):
            target_lang_mapped = map_language_code(lang_code)
            if target_lang_mapped is None:
                print(f"  ⚠️  {lang_code} dili DeepL tarafından desteklenmiyor!")
                print(f"  ⏭️  {filename} atlanıyor (desteklenmeyen dil)")
                continue
            elif target_lang_mapped == 'EN':
                # Fallback İngilizce ise ve kaynak zaten İngilizce, çeviri yapılamaz
                print(f"  ⚠️  {lang_code} → {target_lang_mapped} (fallback İngilizce)")
                print(f"  ⚠️  Kaynak zaten İngilizce olduğu için anlamlı çeviri yapılamaz!")
                print(f"  ⏭️  {filename} atlanıyor (fallback kaynak dili ile aynı)")
                continue
            else:
                print(f"  ⚠️  {lang_code} → {target_lang_mapped} (fallback kullanılıyor)")
        
        try:
            # Dosyayı oku
            with open(filename, 'r', encoding='utf-8') as f:
                file_data = json.load(f)
            
            # Zaten çevrilmiş mi kontrol et
            welcome_translated = file_data.get('common', {}).get('welcome', '')
            if welcome_translated != 'Welcome' and welcome_translated and welcome_translated != welcome_en:
                print(f"  ⏭️  {filename} zaten çevrilmiş, atlanıyor...")
                continue
            
            # Çeviri sayacı
            translated_count = [0]
            success_count = [0]
            fail_count = [0]
            
            # Test çevirisi yap (API'nin çalıştığını doğrula)
            target_lang_mapped = map_language_code(lang_code)
            if target_lang_mapped is None:
                print(f"  ⚠️  {lang_code} dili desteklenmiyor, atlanıyor...")
                continue
            
            print(f"  🔍 Dil kodu: {lang_code} → {target_lang_mapped}")
            print(f"  🧪 Test çevirisi yapılıyor: 'Hello' → {target_lang_mapped}...")
            test_result = translate_text("Hello", lang_code)
            if test_result is None:
                # HTTP 400 hatası = Dil desteklenmiyor
                print(f"  ❌ Test başarısız: {target_lang_mapped} dili DeepL tarafından desteklenmiyor!")
                print(f"  ⏭️  {filename} atlanıyor (desteklenmeyen dil kodu)")
                continue
            elif test_result != "Hello":
                print(f"  ✅ Test başarılı: 'Hello' → '{test_result}'")
            else:
                print(f"  ⚠️  Test başarısız: Çeviri yapılamadı!")
                print(f"  ⚠️  Devam ediliyor ama çeviriler çalışmayabilir...")
            
            # Tüm dosyayı çevir (books.languages hariç)
            print("  🔄 Çeviri başlatılıyor...")
            translated_data = {}
            
            # Önce mevcut dosya verilerini kopyala (tüm section'ları koru)
            translated_data = file_data.copy()
            
            for section_key, section_value in file_data.items():
                if section_key == 'books' and isinstance(section_value, dict):
                    # books bölümü - languages hariç çevir
                    translated_books = {}
                    for book_key, book_value in section_value.items():
                        if book_key == 'languages':
                            translated_books[book_key] = book_value
                        else:
                            print(f"  📝 Çevriliyor: books.{book_key}")
                            translated_books[book_key] = translate_file_section(
                                book_value, lang_code, f'books.{book_key}', translated_count, success_count, fail_count
                            )
                    translated_data[section_key] = translated_books
                    # Her section sonrası kaydet
                    print(f"  💾 {section_key} section'ı kaydediliyor...")
                    with open(filename, 'w', encoding='utf-8') as f:
                        json.dump(translated_data, f, ensure_ascii=False, indent=2)
                    print(f"  ✅ {section_key} kaydedildi")
                else:
                    print(f"  📝 Çevriliyor: {section_key}")
                    translated_data[section_key] = translate_file_section(
                        section_value, lang_code, section_key, translated_count, success_count, fail_count
                    )
                    # Her section sonrası kaydet
                    print(f"  💾 {section_key} section'ı kaydediliyor...")
                    with open(filename, 'w', encoding='utf-8') as f:
                        json.dump(translated_data, f, ensure_ascii=False, indent=2)
                    print(f"  ✅ {section_key} kaydedildi")
            
            # Final kayıt (tüm section'lar tamamlandıktan sonra)
            print(f"  💾 Final kayıt yapılıyor...")
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(translated_data, f, ensure_ascii=False, indent=2)
            
            # Dosyanın gerçekten kaydedildiğini doğrula
            with open(filename, 'r', encoding='utf-8') as f:
                saved_data = json.load(f)
                saved_welcome = saved_data.get('common', {}).get('welcome', '')
                if saved_welcome != 'Welcome' and saved_welcome:
                    print(f"  ✅ Doğrulama: Dosya başarıyla kaydedildi (welcome: '{saved_welcome[:30]}...')")
                else:
                    print(f"  ⚠️  UYARI: Dosya kaydedildi ama çeviri görünmüyor!")
            
            file_elapsed = time.time() - file_start_time
            print(f"  ✅ {filename} çevrildi ve kaydedildi")
            print(f"     📊 {translated_count[0]} çeviri | ✅ {success_count[0]} başarılı | ❌ {fail_count[0]} başarısız")
            print(f"     ⏱️  {file_elapsed:.1f} saniye ({file_elapsed/60:.1f} dakika)")
            
            # Genel ilerleme
            elapsed = time.time() - start_time
            avg_time = elapsed / current_file
            remaining = avg_time * (total_files - current_file)
            print(f"     ⏱️  Toplam: {elapsed/60:.1f} dk, Kalan: ~{remaining/60:.1f} dk")
            
        except Exception as e:
            print(f"  ❌ Hata: {str(e)[:200]}")
            import traceback
            traceback.print_exc()
            continue

    total_elapsed = time.time() - start_time
    print("\n" + "=" * 80)
    print("✅ TÜM ÇEVİRİLER TAMAMLANDI!")
    print(f"⏱️  Toplam süre: {total_elapsed/60:.1f} dakika")
    print(f"Bitiş zamanı: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)

if __name__ == '__main__':
    main()

