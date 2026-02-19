import json
import os

messages_dir = '/Users/mustafayildiz/Documents/IW_Developments/user-front/src/i18n/messages'

guest_translations = {
    'tr': 'Misafir olarak ziyaret et',
    'en': 'Visit as guest',
    'ar': 'زيارة كضيف',
    'de': 'Als Gast besuchen',
    'fr': 'Visiter en tant qu\'invité',
    'es': 'Visitar como invitado',
    'it': 'Visita come ospite',
    'ru': 'Войти как гость',
    'ja': 'ゲストとして訪問',
    'zh': '以访客身份访问',
    'ko': '게스트로 방문',
    'pt': 'Visitar como convidado',
    'nl': 'Bezoek als gast',
    'pl': 'Odwiedź jako gość',
    'id': 'Kunjungi sebagai tamu',
    'ms': 'Lawat sebagai tetamu',
    'hi': 'अतिथि के रूप में जाएँ',
    'ur': 'مہمان کے طور پر وزٹ کریں'
}

for filename in os.listdir(messages_dir):
    if filename.endswith('.json'):
        file_path = os.path.join(messages_dir, filename)
        lang_code = filename.split('.')[0]
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Check if auth/visitAsGuest exists, if so update it if we have a translation
            if 'auth' in data and 'visitAsGuest' in data['auth']:
                if lang_code in guest_translations:
                    data['auth']['visitAsGuest'] = guest_translations[lang_code]
                    print(f"Updating {filename} with '{guest_translations[lang_code]}'")
                    
                    with open(file_path, 'w', encoding='utf-8') as f:
                        json.dump(data, f, indent=2, ensure_ascii=False)
                else:
                    print(f"No translation found for {lang_code}, skipping (keeping English)")
            else:
                 print(f"Key auth.visitAsGuest not found in {filename}, skipping")

        except Exception as e:
            print(f"Error processing {filename}: {e}")
