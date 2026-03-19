import json
import os
import urllib.request
import urllib.parse
import time
import glob

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

def translate_text(text, target_lang):
    if not text or not text.strip():
        return text
        
    lang_code_lower = target_lang.lower()
    
    if lang_code_lower not in DEEPL_SUPPORTED_LANGUAGES:
        # Some fallbacks
        fallback_map = { 'mk': 'BG', 'mt': 'IT', 'ku': None, 'hy': None }
        mapped = fallback_map.get(lang_code_lower)
        if not mapped:
            return text
    else:
        mapped = DEEPL_SUPPORTED_LANGUAGES[lang_code_lower]

    try:
        params = urllib.parse.urlencode({
            'text': text,
            'target_lang': mapped,
            'source_lang': 'EN'
        }).encode('utf-8')
        
        req = urllib.request.Request(
            DEEPL_API_URL,
            data=params,
            headers={
                'Authorization': f'DeepL-Auth-Key {DEEPL_API_KEY}',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                if data.get('translations'):
                    return data['translations'][0]['text']
    except Exception as e:
        print(f"Error translating to {mapped}: {e}")
    return text

keys_to_translate = [
    "pathToLightBismillahSecondary",
    "pathToLightSubtitle",
    "pathToLightP1",
    "pathToLightP2",
    "pathToLightP3",
    "pathToLightP4"
]

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    with open('en.json', 'r', encoding='utf-8') as f:
        en_data = json.load(f)
        
    source_texts = {k: en_data['auth'][k] for k in keys_to_translate if k in en_data['auth']}
    
    for filename in glob.glob('*.json'):
        if filename in ['en.json', 'tr.json']:
            continue
            
        lang = filename.split('.')[0]
        print(f"Translating {filename}...")
        
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        modified = False
        for k, v in source_texts.items():
            if v:
                translated = translate_text(v, lang)
                if translated and translated != v:
                    data['auth'][k] = translated
                    modified = True
                    
        if modified:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"Saved {filename}")
            
if __name__ == "__main__":
    main()
