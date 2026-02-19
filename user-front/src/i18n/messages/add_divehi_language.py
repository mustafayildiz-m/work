import json
import os

messages_dir = '/Users/mustafayildiz/Documents/IW_Developments/user-front/src/i18n/messages'

divehi_translations = {
    'tr': 'Divehi',
    'en': 'Dhivehi',
    'ar': 'ديفيهي',
    'de': 'Dhivehi',
    'fr': 'Divehi',
    'es': 'Divehi',
    'it': 'Divehi',
    'ru': 'Дивехи',
    'ja': 'ディベヒ語',
    'zh': '迪维希语',
    'ko': '디베히어',
    'pt': 'Divehi',
    'nl': 'Divehi',
    'pl': 'Malediwski',
    'id': 'Dhivehi',
    'ms': 'Dhivehi',
    'hi': 'धिवेही',
    'ur': 'دیوہی',
    'bg': 'Дивехи',
    'cs': 'Divehi',
    'ro': 'Divehi',
    'uk': 'Дівехі',
    'hu': 'Divehi',
    'sk': 'Divehi',
    'sl': 'Divehi',
    'mk': 'Дивехи'
}

default_translation = "Dhivehi"

for filename in os.listdir(messages_dir):
    if filename.endswith('.json'):
        file_path = os.path.join(messages_dir, filename)
        lang_code = filename.split('.')[0]
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if 'books' in data and 'languages' in data['books']:
                translation = divehi_translations.get(lang_code, default_translation)
                data['books']['languages']['divehice'] = translation
                print(f"Updating {filename} with 'divehice': '{translation}'")
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
            else:
                 print(f"Key books.languages not found in {filename}, skipping")

        except Exception as e:
            print(f"Error processing {filename}: {e}")
