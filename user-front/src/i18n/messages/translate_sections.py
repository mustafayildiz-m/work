#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Ana bölümleri (common, auth, navigation, menu) Google Translate ile çevirir.
Placeholder'ları ({count}, {name}, vb.) korur.
Kullanım: python3 translate_sections.py [hi hy sr mr te gu ml kn or]
"""

import json
import re
import sys
from deep_translator import GoogleTranslator

PLACEHOLDERS = {}
counter = [0]

def protect(text):
    def rep(m):
        k = f"__P{counter[0]}__"
        PLACEHOLDERS[k] = m.group(0)
        counter[0] += 1
        return k
    return re.sub(r'\{[a-zA-Z_]+\}', rep, text)

def restore(text):
    for k, v in PLACEHOLDERS.items():
        text = text.replace(k, v)
    PLACEHOLDERS.clear()
    counter[0] = 0
    return text

def translate_sections(lang_code):
    with open('en.json') as f:
        en = json.load(f)
    with open(f'{lang_code}.json') as f:
        data = json.load(f)
    
    trans = GoogleTranslator(source='en', target=lang_code)
    sections = ['common', 'auth', 'navigation', 'menu']
    
    for sec in sections:
        if sec not in en:
            continue
        for key, val in en[sec].items():
            if isinstance(val, str) and val.strip():
                try:
                    protected = protect(val)
                    result = trans.translate(protected)
                    data[sec][key] = restore(result) if result else val
                except Exception as e:
                    print(f"  {sec}.{key}: {e}")
    
    with open(f'{lang_code}.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  ✅ {lang_code}.json güncellendi")

if __name__ == '__main__':
    langs = sys.argv[1:] if len(sys.argv) > 1 else ['hy', 'sr', 'mr', 'te', 'gu', 'ml', 'kn', 'or']
    for l in langs:
        print(f"\n📝 {l} çevriliyor...")
        translate_sections(l)
    print("\n✅ Tamamlandı!")
