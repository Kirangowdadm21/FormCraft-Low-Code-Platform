import { useTranslation } from "react-i18next";
import React from "react";
import { AlertCircle } from "lucide-react";
export default function TextField({ field, value, onChange, error, disabled }) {
  const { t } = useTranslation();
  const isTextArea =
    field.field_type === "textarea" || field.field_type === "long_text";
  const fieldId = `field-${field.id}`;
  const minLen = field.validation_conf?.min_length;
  const maxLen = field.validation_conf?.max_length;
  return (
    <div className="public-field-group">
      <label htmlFor={fieldId} className="public-field-label">
        {field.label}{" "}
        {field.required && (
          <span className="required-star">{t("textField.text")}</span>
        )}
      </label>

      {isTextArea ? (
        <textarea
          id={fieldId}
          className={`public-field-input public-field-textarea ${error ? "input-error" : ""}`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || t("textField.textareaPlaceholderFallback")}
          disabled={disabled}
          minLength={minLen}
          maxLength={maxLen}
          aria-required={field.required}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          rows={4}
        />
      ) : (
        <input
          type="text"
          id={fieldId}
          className={`public-field-input ${error ? "input-error" : ""}`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || t("textField.placeholderFallback")}
          disabled={disabled}
          minLength={minLen}
          maxLength={maxLen}
          aria-required={field.required}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined}
        />
      )}

      {/* Helper text for limits */}
      {(minLen || maxLen) && (
        <div className="field-hint-text">
          {minLen && maxLen
            ? t("textField.lengthBetween", { min: minLen, max: maxLen })
            : minLen
              ? t("textField.minLength", { min: minLen })
              : t("textField.maxLength", { max: maxLen })}
        </div>
      )}

      {/* Inline Validation Error */}
      {error && (
        <div
          id={`${fieldId}-error`}
          className="field-error-message"
          role="alert"
        >
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
