#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import os
import urllib.request
import urllib.parse
import time

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

def translate_text(text, target_lang, source_lang='TR'):
    if not text or not text.strip(): 
        return text
    
    target_lang_code = DEEPL_SUPPORTED_LANGUAGES.get(target_lang.lower())
    if not target_lang_code:
        # Fallback for some common codes
        map_fix = {'zh': 'ZH', 'ko': 'KO', 'ja': 'JA'}
        target_lang_code = map_fix.get(target_lang.lower())
        
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
    
    # Kaynak dosyaları oku
    with open('tr.json', 'r', encoding='utf-8') as f:
        tr_data = json.load(f)
    with open('en.json', 'r', encoding='utf-8') as f:
        en_data = json.load(f)
        
    messaging_keys = {}
    english_placeholders = {}
    
    # TR verileri (kaynak)
    if 'messaging' in tr_data:
        for k, v in tr_data['messaging'].items():
            messaging_keys[f"messaging.{k}"] = v
    if 'guest' in tr_data:
        for k in ['messagingTitle', 'messagingDesc']:
            if k in tr_data['guest']: messaging_keys[f"guest.{k}"] = tr_data['guest'][k]
    if 'menu' in tr_data and 'messaging' in tr_data['menu']:
        messaging_keys["menu.messaging"] = tr_data['menu']['messaging']
        
    # EN verileri (placeholder kontrolü için)
    if 'messaging' in en_data:
        for k, v in en_data['messaging'].items():
            english_placeholders[f"messaging.{k}"] = v
    if 'guest' in en_data:
        for k in ['messagingTitle', 'messagingDesc']:
            if k in en_data['guest']: english_placeholders[f"guest.{k}"] = en_data['guest'][k]
    if 'menu' in en_data and 'messaging' in en_data['menu']:
        english_placeholders["menu.messaging"] = en_data['menu']['messaging']
                
    json_files = [f for f in os.listdir('.') if f.endswith('.json') and f not in ['tr.json', 'en.json']]
    
    for filename in json_files:
        lang_code = filename.split('.')[0]
        print(f"\n🌍 {filename} ({lang_code}) güncelleniyor...")
        
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        modified = False
        
        for path, source_value in messaging_keys.items():
            parts = path.split('.')
            section = parts[0]
            key = parts[1]
            
            if section not in data: data[section] = {}
            
            current_value = data[section].get(key)
            en_placeholder = english_placeholders.get(path)
            
            # Çeviri gerektiren durumlar:
            # 1. Değer yoksa
            # 2. Değer TR kaynak ile aynıysa (ve dil TR değilse)
            # 3. Değer EN placeholder ile aynıysa (ve dil EN değilse)
            should_translate = not current_value or \
                             current_value == source_value or \
                             (en_placeholder and current_value == en_placeholder)
            
            if should_translate:
                print(f"   📝 {path} çevriliyor...")
                translated = translate_text(source_value, lang_code)
                data[section][key] = translated
                print(f"      → {translated}")
                modified = True
                time.sleep(0.5)
            else:
                print(f"   ✅ {path} zaten mevcut: {current_value}")
        
        if modified:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"   💾 {filename} kaydedildi.")
        else:
            print(f"   ⏭️  {filename} değişikliğe gerek yok.")

if __name__ == "__main__":
    main()
