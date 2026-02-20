#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
import urllib.request
import urllib.parse
import time

DEEPL_API_KEY = "b80f08d3-407a-4af5-981b-6075c1efda10:fx"
DEEPL_API_URL = "https://api-free.deepl.com/v2/translate"

def translate_text(text, target_lang='EN', source_lang='TR'):
    if not text or not text.strip():
        return text

    for attempt in range(3):
        try:
            params = urllib.parse.urlencode({
                'text': text,
                'target_lang': target_lang,
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

            with urllib.request.urlopen(req, timeout=15) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    return data['translations'][0]['text']
                time.sleep(1)
        except Exception as e:
            print(f"Error translating '{text[:20]}': {e}")
            time.sleep(2)
    return text

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    tr_path = os.path.join(script_dir, 'tr.json')
    en_path = os.path.join(script_dir, 'en.json')

    with open(tr_path, 'r', encoding='utf-8') as f:
        tr_data = json.load(f)

    en_data = {}
    if os.path.exists(en_path):
        with open(en_path, 'r', encoding='utf-8') as f:
            en_data = json.load(f)

    translated_count = 0
    for key, value in tr_data.items():
        if key not in en_data or not en_data[key]:
            print(f"Translating: {value}")
            translated = translate_text(value, target_lang='EN', source_lang='TR')
            if translated:
                en_data[key] = translated
                translated_count += 1
                if translated_count % 10 == 0:
                    with open(en_path, 'w', encoding='utf-8') as f:
                        json.dump(en_data, f, ensure_ascii=False, indent=2)

    with open(en_path, 'w', encoding='utf-8') as f:
        json.dump(en_data, f, ensure_ascii=False, indent=2)

    print(f"Translation complete. {translated_count} new items translated.")

if __name__ == '__main__':
    main()
