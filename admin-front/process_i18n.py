import json
import sys

def process_i18n(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Python dicts preserve order since 3.7, but sorting by key is better for maintenance
    sorted_data = dict(sorted(data.items()))
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(sorted_data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python process_i18n.py <file_path>")
        sys.exit(1)
    process_i18n(sys.argv[1])
