const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// In-memory translation cache to prevent duplicate backend requests
const translationCache = new Map();

/**
 * Translates dynamic text via backend POST /translate endpoint with client-side caching.
 * @param {string} text - Text to translate.
 * @param {string} targetLang - Target short language code (en, kn, hi, ta, te, ml).
 * @param {string} sourceLang - Source short language code (default 'en').
 * @returns {Promise<string>} Translated text string.
 */
export async function translateDynamicText(
  text,
  targetLang = "en",
  sourceLang = "en",
) {
  if (!text || typeof text !== "string" || !text.trim()) {
    return text;
  }

  const sLang = (sourceLang || "en").slice(0, 2).toLowerCase().trim();
  const tLang = (targetLang || "en").slice(0, 2).toLowerCase().trim();

  // Return original text if target language is English or same as source
  if (sLang === tLang || tLang === "en") {
    return text;
  }

  const cacheKey = `${text}___${sLang}_to_${tLang}`;

  // Check in-memory cache
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  // Check localStorage cache
  try {
    const cachedLocal = localStorage.getItem(`tr_${cacheKey}`);
    if (cachedLocal) {
      translationCache.set(cacheKey, cachedLocal);
      return cachedLocal;
    }
  } catch {
    // Ignore localStorage read errors
  }

  try {
    const response = await fetch(`${API_BASE_URL}/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        source_language: sLang,
        target_language: tLang,
      }),
    });

    if (!response.ok) {
      console.warn(
        `Translation API error (${response.status}): returning original text`,
      );
      return text;
    }

    const data = await response.json();
    const translatedText = data?.translated_text || text;

    // Cache the successful translation
    translationCache.set(cacheKey, translatedText);
    try {
      localStorage.setItem(`tr_${cacheKey}`, translatedText);
    } catch {
      // Ignore localStorage write errors
    }

    return translatedText;
  } catch (err) {
    console.error("Failed to call translation service:", err);
    return text;
  }
}
