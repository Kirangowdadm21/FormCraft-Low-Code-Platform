import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enTranslation from "./locales/en/translation.json";
import knTranslation from "./locales/kn/translation.json";
import hiTranslation from "./locales/hi/translation.json";
import taTranslation from "./locales/ta/translation.json";
import teTranslation from "./locales/te/translation.json";
import mlTranslation from "./locales/ml/translation.json";

const resources = {
  en: { translation: enTranslation },
  kn: { translation: knTranslation },
  hi: { translation: hiTranslation },
  ta: { translation: taTranslation },
  te: { translation: teTranslation },
  ml: { translation: mlTranslation },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    lng: "en", // default language
    interpolation: {
      escapeValue: false, // react handles escaping
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
