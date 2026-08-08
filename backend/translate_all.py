import json
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Ensure we can load models
from services.translation_service import translate

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOCALES_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "frontend", "src", "locales"))

LANGUAGES = ["kn", "hi", "ta", "te", "ml"]

def protect_placeholders(text):
    # Find all occurrences of {{...}}
    placeholders = re.findall(r'\{\{[^}]+\}\}', text)
    protected_text = text
    mappings = {}
    for idx, ph in enumerate(placeholders):
        key = f"__PH_{idx}__"
        mappings[key] = ph
        protected_text = protected_text.replace(ph, key)
    return protected_text, mappings

def restore_placeholders(translated_text, mappings):
    restored = translated_text
    for key, ph in mappings.items():
        # Translation models might add spaces inside or around the placeholder, e.g. __ PH_0 __
        # Search for key with optional spaces
        pattern = r'__\s*' + re.escape(key.replace("__", "").strip("_")) + r'\s*__'
        restored = re.sub(pattern, ph, restored, flags=re.IGNORECASE)
    return restored

def translate_value(text, target_lang):
    if not text or not isinstance(text, str) or not text.strip():
        return text
    
    # Check if it looks like a symbol / CSS unit or a number
    if re.match(r'^[•🗓✓≡—⚠*/\-\d\s%()v]+$', text):
        return text
        
    protected_text, mappings = protect_placeholders(text)
    
    # Translate
    try:
        translated = translate(protected_text, "en", target_lang)
    except Exception as e:
        print(f"Error translating '{text}' to {target_lang}: {e}")
        return text
        
    restored = restore_placeholders(translated, mappings)
    return restored

def recursive_translate(en_dict, target_dict, target_lang, path=""):
    result = {}
    for key, val in en_dict.items():
        current_path = f"{path}.{key}" if path else key
        if isinstance(val, dict):
            # Recursively handle dict
            sub_target = target_dict.get(key, {}) if isinstance(target_dict.get(key), dict) else {}
            result[key] = recursive_translate(val, sub_target, target_lang, current_path)
        else:
            # We have a leaf value
            # Only translate if missing from target or empty or identical to the key name itself (signaling placeholder)
            existing = target_dict.get(key)
            if existing is not None and isinstance(existing, str) and existing.strip() and existing != key:
                # Keep existing translation
                result[key] = existing
            else:
                # Translate English value
                print(f"Translating [{target_lang}] {current_path}: '{val}'")
                result[key] = translate_value(val, target_lang)
    return result

def main():
    en_path = os.path.join(LOCALES_DIR, "en", "translation.json")
    with open(en_path, "r", encoding="utf-8") as f:
        en_data = json.load(f)
        
    for lang in LANGUAGES:
        print(f"\n=================== TRANSLATING FOR LANGUAGE: {lang} ===================")
        lang_path = os.path.join(LOCALES_DIR, lang, "translation.json")
        
        target_data = {}
        if os.path.exists(lang_path):
            try:
                with open(lang_path, "r", encoding="utf-8") as f:
                    target_data = json.load(f)
            except Exception as e:
                print(f"Error reading existing {lang} file: {e}")
                
        updated_data = recursive_translate(en_data, target_data, lang)
        
        # Save updated translation file
        os.makedirs(os.path.dirname(lang_path), exist_ok=True)
        with open(lang_path, "w", encoding="utf-8") as f:
            json.dump(updated_data, f, ensure_ascii=False, indent=2)
        print(f"Saved updated translations to {lang_path}")

if __name__ == "__main__":
    main()
