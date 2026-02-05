#!/usr/bin/env python3
# -*- coding: utf-8 -*-
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
    'vi': 'VI', 'tr': 'TR', 'ar': 'AR', 'no': 'NO'
}

def translate_text(text, target_lang, source_lang='TR'):
    if not text or not text.strip(): return text
    target_lang_code = DEEPL_SUPPORTED_LANGUAGES.get(target_lang.lower())
    if not target_lang_code or target_lang_code == source_lang: return text
    
    try:
        params = urllib.parse.urlencode({
            'text': text,
            'target_lang': target_lang_code,
            'source_lang': source_lang
        }).encode('utf-8')
        req = urllib.request.Request(DEEPL_API_URL, data=params, headers={'Authorization': f'DeepL-Auth-Key {DEEPL_API_KEY}'})
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))['translations'][0]['text']
    except Exception as e:
        print(f"Error translating to {target_lang}: {e}")
        return text

def main():
    messages_dir = "/Users/mustafayildiz/Documents/IW_Developments/user-front/src/i18n/messages"
    with open(os.path.join(messages_dir, 'tr.json'), 'r', encoding='utf-8') as f:
        tr_data = json.load(f)
    
    new_keys = tr_data['books']['languageSelector']
    # Items to translate: loading, errorTitle, viewBooks, booksAvailable
    items_to_translate = {
        'loading': new_keys['loading'],
        'errorTitle': new_keys['errorTitle'],
        'viewBooks': new_keys['viewBooks'],
        'booksAvailable': new_keys['booksAvailable']
    }

    for filename in os.listdir(messages_dir):
        if not filename.endswith('.json') or filename in ['tr.json', 'en.json', 'ja.json', 'ar.json', 'de.json']:
            continue
            
        lang_code = filename.split('.')[0]
        print(f"Updating {filename}...")
        
        with open(os.path.join(messages_dir, filename), 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        if 'books' not in data: data['books'] = {}
        if 'languageSelector' not in data['books']: data['books']['languageSelector'] = {}
        
        selector = data['books']['languageSelector']
        for key, value in items_to_translate.items():
            translated = translate_text(value, lang_code)
            selector[key] = translated
            print(f"  {key}: {translated}")
            time.sleep(0.5) # Be kind to API
            
        with open(os.path.join(messages_dir, filename), 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
