import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { translateText } from '../../services/translationApi';

// Simple in-memory cache to avoid duplicate API calls for the same text+lang
const translationCache = new Map();

export default function DynamicText({ text, sourceLang = 'en', as: Component = 'span', className = '', ...props }) {
  const { i18n } = useTranslation();
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    if (!text) {
      setTranslated('');
      return;
    }

    const currentLang = i18n.language || 'en';
    
    // If language is English (source), just use text
    if (currentLang === sourceLang) {
      setTranslated(text);
      return;
    }

    const cacheKey = `${text}_${sourceLang}_${currentLang}`;
    if (translationCache.has(cacheKey)) {
      setTranslated(translationCache.get(cacheKey));
      return;
    }

    let isMounted = true;
    
    // Fallback to text while loading
    setTranslated(text);

    translateText(text, currentLang, sourceLang).then(res => {
      if (isMounted) {
        translationCache.set(cacheKey, res);
        setTranslated(res);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [text, i18n.language, sourceLang]);

  if (!Component) return <>{translated}</>;

  return (
    <Component className={className} {...props}>
      {translated}
    </Component>
  );
}
