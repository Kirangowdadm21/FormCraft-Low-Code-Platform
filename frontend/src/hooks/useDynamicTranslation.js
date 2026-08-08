import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { translateDynamicText } from "../services/translateApi";

/**
 * Translates a single dynamic text string dynamically on language changes.
 */
export function useDynamicTranslation(text, sourceLang = "en") {
  const { i18n } = useTranslation();
  const [translatedText, setTranslatedText] = useState(text);

  useEffect(() => {
    if (!text || typeof text !== "string" || !text.trim()) {
      setTranslatedText(text);
      return;
    }

    const currentLang = (i18n.language || "en").slice(0, 2).toLowerCase();
    const srcLang = sourceLang.slice(0, 2).toLowerCase();

    if (currentLang === srcLang || currentLang === "en") {
      setTranslatedText(text);
      return;
    }

    let isMounted = true;
    setTranslatedText(text); // Fallback to original text while translating

    translateDynamicText(text, currentLang, srcLang).then((translated) => {
      if (isMounted) {
        setTranslatedText(translated);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [text, i18n.language, sourceLang]);

  return translatedText;
}

/**
 * Translates an array of form field schemas dynamically on language changes.
 */
export function useTranslateFields(fields, sourceLang = "en") {
  const { i18n } = useTranslation();
  const [translatedFields, setTranslatedFields] = useState(fields);

  useEffect(() => {
    if (!fields || fields.length === 0) {
      setTranslatedFields(fields);
      return;
    }

    const currentLang = (i18n.language || "en").slice(0, 2).toLowerCase();
    const srcLang = sourceLang.slice(0, 2).toLowerCase();

    if (currentLang === srcLang || currentLang === "en") {
      setTranslatedFields(fields);
      return;
    }

    let isMounted = true;

    async function translateAll() {
      const translated = await Promise.all(
        fields.map(async (field) => {
          // Translate label
          const label = field.label
            ? await translateDynamicText(field.label, currentLang, srcLang)
            : field.label;

          // Translate placeholder
          const placeholder = field.placeholder
            ? await translateDynamicText(field.placeholder, currentLang, srcLang)
            : field.placeholder;

          // Translate options if any
          let options = field.options;
          if (!options && field.field_options) options = field.field_options;
          if (!options && field.validation_conf && field.validation_conf.options) {
            options = field.validation_conf.options;
          }

          let translatedOptions = options;
          if (Array.isArray(options)) {
            translatedOptions = await Promise.all(
              options.map(async (opt) => {
                if (typeof opt === "string") {
                  return await translateDynamicText(opt, currentLang, srcLang);
                } else if (typeof opt === "object" && opt !== null) {
                  const lbl = opt.optiontext ?? opt.label ?? opt.text ?? opt.value;
                  if (lbl) {
                    const transLbl = await translateDynamicText(lbl, currentLang, srcLang);
                    return {
                      ...opt,
                      label: transLbl,
                      optiontext: transLbl,
                      text: transLbl,
                    };
                  }
                }
                return opt;
              })
            );
          }

          const validation_conf = field.validation_conf
            ? { ...field.validation_conf, options: translatedOptions }
            : undefined;

          return {
            ...field,
            label,
            placeholder,
            options: translatedOptions,
            field_options: translatedOptions,
            validation_conf,
          };
        })
      );

      if (isMounted) {
        setTranslatedFields(translated);
      }
    }

    translateAll();

    return () => {
      isMounted = false;
    };
  }, [fields, i18n.language, sourceLang]);

  return translatedFields;
}
