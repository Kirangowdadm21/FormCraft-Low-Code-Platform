import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe, ChevronDown, Check } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "hi", label: "Hindi", native: "हिंदी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
];

export default function LanguageSelector({ fullWidth = false, compact = false }) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLangCode = i18n.language ? i18n.language.slice(0, 2) : "en";
  const currentLang =
    LANGUAGES.find((l) => l.code === currentLangCode) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    try {
      localStorage.setItem("i18nextLng", langCode);
    } catch {
      // Ignore localStorage error
    }
    setIsOpen(false);
  };

  return (
    <div
      style={{ position: "relative", width: fullWidth ? "100%" : "auto" }}
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: fullWidth ? "space-between" : "flex-start",
          gap: compact ? "0.3rem" : "0.45rem",
          width: fullWidth ? "100%" : "auto",
          background: "#FFFFFF",
          border: isOpen ? "1px solid #4F46E5" : "1px solid #E2E8F0",
          borderRadius: "8px",
          height: "36px",
          padding: compact ? "0 0.5rem" : "0 0.75rem",
          fontSize: "0.82rem",
          fontWeight: 600,
          color: "#0F172A",
          cursor: "pointer",
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          transition: "all 150ms ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <Globe size={15} color="#4F46E5" />
          {compact ? (
            <span style={{ fontSize: "0.78rem", fontWeight: 700 }}>
              {currentLang.code.toUpperCase()}
            </span>
          ) : (
            <>
              <span>{currentLang.native}</span>
              <span style={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 400 }}>
                ({currentLang.label})
              </span>
            </>
          )}
        </div>
        <ChevronDown
          size={13}
          color="#94A3B8"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 150ms ease",
          }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: fullWidth ? 0 : "auto",
            right: 0,
            width: fullWidth ? "100%" : "170px",
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "10px",
            boxShadow:
              "0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 4px 6px -2px rgba(15, 23, 42, 0.04)",
            padding: "4px",
            zIndex: 200,
            animation: "fadeIn 0.15s ease-out",
          }}
        >
          {LANGUAGES.map((lang) => (
            <div
              key={lang.code}
              onClick={() => handleSelectLanguage(lang.code)}
              style={{
                display: "flex",
                alignItems: "center",
                justify: "space-between",
                padding: "0.45rem 0.65rem",
                borderRadius: "6px",
                fontSize: "0.78rem",
                fontWeight: lang.code === currentLangCode ? 600 : 500,
                color: lang.code === currentLangCode ? "#4F46E5" : "#0F172A",
                background:
                  lang.code === currentLangCode ? "#EEF2FF" : "transparent",
                cursor: "pointer",
                transition: "background 100ms ease",
              }}
              onMouseEnter={(e) => {
                if (lang.code !== currentLangCode)
                  e.currentTarget.style.background = "#F8FAFC";
              }}
              onMouseLeave={(e) => {
                if (lang.code !== currentLangCode)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ lineHeight: 1.2 }}>{lang.native}</span>
                <span style={{ fontSize: "0.68rem", color: "#64748B" }}>
                  {lang.label}
                </span>
              </div>
              {lang.code === currentLangCode && (
                <Check size={13} color="#4F46E5" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
