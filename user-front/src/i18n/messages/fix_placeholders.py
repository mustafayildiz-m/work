#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import os
import re

def fix_placeholders(text):
    if not isinstance(text, str):
        return text
    # Dil isimleri için yaygın çevirileri {language} ile değiştir
    text = re.sub(r'\{(langue|language|idioma|lingua|jazyk|jazyka|язык|语言|언어|language|язику|език|limba|jazyku|language)\} ', '{language} ', text, flags=re.IGNORECASE)
    text = re.sub(r' \{(langue|language|idioma|lingua|jazyk|jazyka|язык|语言|언어|language|язику|език|limba|jazyku|language)\}', ' {language}', text, flags=re.IGNORECASE)
    text = re.sub(r'^\{(langue|language|idioma|lingua|jazyk|jazyka|язык|语言|언어|language|язику|език|limba|jazyku|language)\}', '{language}', text, flags=re.IGNORECASE)
    
    # Sayılar için yaygın çevirileri {count} ile değiştir
    text = re.sub(r'\{(count|contar|contagem|카운트|număr|число|количество|تعداد|计|計|count|broj|count)\} ', '{count} ', text, flags=re.IGNORECASE)
    text = re.sub(r' \{(count|contar|contagem|카운트|număr|число|количество|تعداد|计|計|count|broj|count)\}', ' {count}', text, flags=re.IGNORECASE)
    text = re.sub(r'^\{(count|contar|contagem|카운트|număr|число|количество|تعداد|计|計|count|broj|count)\}', '{count}', text, flags=re.IGNORECASE)
    
    return text

def main():
    messages_dir = "/Users/mustafayildiz/Documents/IW_Developments/user-front/src/i18n/messages"
    
    for filename in os.listdir(messages_dir):
        if not filename.endswith('.json'):
            continue
            
        file_path = os.path.join(messages_dir, filename)
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        modified = False
        if 'books' in data and 'languageSelector' in data['books']:
            selector = data['books']['languageSelector']
            
            if 'viewBooks' in selector:
                old_val = selector['viewBooks']
                selector['viewBooks'] = fix_placeholders(old_val)
                if old_val != selector['viewBooks']:
                    print(f"Fixed viewBooks in {filename}: {old_val} -> {selector['viewBooks']}")
                    modified = True
                    
            if 'booksAvailable' in selector:
                old_val = selector['booksAvailable']
                selector['booksAvailable'] = fix_placeholders(old_val)
                if old_val != selector['booksAvailable']:
                    print(f"Fixed booksAvailable in {filename}: {old_val} -> {selector['booksAvailable']}")
                    modified = True
        
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
