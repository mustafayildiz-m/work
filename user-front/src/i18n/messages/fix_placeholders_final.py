#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import os
import re

# Eşleme sözlüğü: Hatalı yerel değişken isimlerini standart isimlere çevirir
MAPPING = {
    # {name} için varyasyonlar
    r'\{(име|이름|姓名|ім\'я)\}': '{name}',
    # {date} için varyasyonlar
    r'\{(дата|날짜|日期)\}': '{date}',
    # {count} için varyasyonlar
    r'\{(сколько|количество|счет|카운트|개수|计|計|contagem|contar|număr|broj)\}': '{count}',
    # {language} için varyasyonlar
    r'\{(мовна версія|мова|язык|langue|língua|idioma|lingua|jazyk|jazyka|език|limba|jazyku|语言|언어)\}': '{language}',
}

def fix_all_placeholders(obj):
    if isinstance(obj, dict):
        for key, value in obj.items():
            obj[key] = fix_all_placeholders(value)
    elif isinstance(obj, list):
        return [fix_all_placeholders(item) for item in obj]
    elif isinstance(obj, str):
        new_text = obj
        for pattern, replacement in MAPPING.items():
            new_text = re.sub(pattern, replacement, new_text, flags=re.IGNORECASE)
        # Özel durum: zh.json bazen boşluk ekliyor { 日期 }
        new_text = re.sub(r'\{\s*日期\s*\}', '{date}', new_text)
        new_text = re.sub(r'\{\s*姓名\s*\}', '{name}', new_text)
        return new_text
    return obj

def main():
    messages_dir = "/Users/mustafayildiz/Documents/IW_Developments/user-front/src/i18n/messages"
    
    for filename in os.listdir(messages_dir):
        if not filename.endswith('.json'):
            continue
            
        file_path = os.path.join(messages_dir, filename)
        with open(file_path, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
            except:
                continue
            
        fixed_data = fix_all_placeholders(data)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(fixed_data, f, ensure_ascii=False, indent=2)
            print(f"Processed and cleaned: {filename}")

if __name__ == "__main__":
    main()
