#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""profileMenu bölümünü tr.json'dan DeepL ile diğer dillere çevirir."""
import json
import os
import urllib.request
import urllib.parse
import time

DEEPL_API_KEY = "b80f08d3-407a-4af5-981b-6075c1efda10:fx"
DEEPL_API_URL = "https://api-free.deepl.com/v2/translate"

DEEPL_SUPPORTED_LANGUAGES = {
    'en': 'EN', 'de': 'DE', 'fr': 'FR', 'es': 'ES', 'pt': 'PT',
    'it': 'IT', 'ru': 'RU', 'ja': 'JA', 'zh': 'ZH', 'ko': 'KO',
    'nl': 'NL', 'pl': 'PL', 'sv': 'SV', 'da': 'DA', 'fi': 'FI',
    'el': 'EL', 'cs': 'CS', 'sk': 'SK', 'uk': 'UK', 'bg': 'BG',
    'hr': 'HR', 'ro': 'RO', 'hu': 'HU', 'et': 'ET', 'lv': 'LV',
    'lt': 'LT', 'sl': 'SL', 'id': 'ID', 'ms': 'MS', 'th': 'TH',
    'vi': 'VI', 'tr': 'TR', 'ar': 'AR', 'no': 'NO', 'mk': 'MK'
}

def translate_text(text, target_lang, source_lang='TR'):
    if not text or not text.strip():
        return text
    target_lang_code = DEEPL_SUPPORTED_LANGUAGES.get(target_lang.lower())
    if not target_lang_code:
        target_lang_code = {'zh': 'ZH', 'ko': 'KO', 'ja': 'JA'}.get(target_lang.lower())
    if not target_lang_code or target_lang_code == source_lang:
        return text
    try:
        params = urllib.parse.urlencode({
            'text': text,
            'target_lang': target_lang_code,
            'source_lang': source_lang
        }).encode('utf-8')
        req = urllib.request.Request(
            DEEPL_API_URL,
            data=params,
            headers={'Authorization': f'DeepL-Auth-Key {DEEPL_API_KEY}'}
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            return res_data['translations'][0]['text']
    except Exception as e:
        print(f"       ⚠️  {target_lang} çeviri hatası: {e}")
        return text

def main():
    messages_dir = "/Users/mustafayildiz/Documents/IW_Developments/user-front/src/i18n/messages"
    os.chdir(messages_dir)

    with open('tr.json', 'r', encoding='utf-8') as f:
        tr_data = json.load(f)

    section_name = 'profileMenu'
    source_section = tr_data.get(section_name, {})
    if not source_section:
        print(f"❌ '{section_name}' bölümü tr.json içinde bulunamadı.")
        return

    # Sadece about ve activity - tablarda İngilizce kalanlar
    keys_to_translate = ['about', 'activity']

    json_files = [f for f in os.listdir('.') if f.endswith('.json') and f != 'tr.json']

    for filename in json_files:
        lang_code = filename.split('.')[0]
        print(f"\n🌍 {filename} ({lang_code}) güncelleniyor...")

        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)

        if section_name not in data:
            data[section_name] = {}

        modified = False
        for key in keys_to_translate:
            if key not in source_section:
                continue
            source_value = source_section[key]
            current_value = data[section_name].get(key)

            # İngilizce veya eksikse çevir
            if not current_value or current_value in ['About', 'Lineage']:
                print(f"   📝 {section_name}.{key} DeepL ile çevriliyor...")
                translated = translate_text(source_value, lang_code)
                data[section_name][key] = translated
                print(f"      → {translated}")
                modified = True
                time.sleep(0.5)

        if modified:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"   💾 {filename} kaydedildi.")
        else:
            print(f"   ⏭️  {filename} zaten çevrilmiş.")

if __name__ == "__main__":
    main()
