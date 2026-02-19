import json
import os

messages_dir = '/Users/mustafayildiz/Documents/IW_Developments/user-front/src/i18n/messages'

theme_titles = {
    'tr': 'Tema',
    'en': 'Theme',
    'ar': 'موضوع',
    'de': 'Thema',
    'fr': 'Thème',
    'es': 'Tema',
    'it': 'Tema',
    'pt': 'Tema',
    'ru': 'Тема',
    'ja': 'テーマ',
    'zh': '主题',
    'ko': '테마',
    'nl': 'Thema',
    'pl': 'Motyw',
    'id': 'Tema',
    'ms': 'Tema',
    'hi': 'विषय',
    'bn': 'থিম',
    'ur': 'تھیم'
}

default_title = "Theme"

for filename in os.listdir(messages_dir):
    if filename.endswith('.json'):
        file_path = os.path.join(messages_dir, filename)
        lang_code = filename.split('.')[0]
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if 'theme' not in data:
                data['theme'] = {}

            # Determine title
            title = theme_titles.get(lang_code, default_title)
            
            # Check if we need to update
            if 'title' not in data['theme'] or data['theme']['title'] != title:
                data['theme']['title'] = title
                
                print(f"Updating {filename} with theme.title = {title}")
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
            else:
                print(f"No changes needed for {filename}")

        except Exception as e:
            print(f"Error processing {filename}: {e}")
