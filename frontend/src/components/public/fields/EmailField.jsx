import { useTranslation } from "react-i18next";
import React from "react";
import { Mail, AlertCircle } from "lucide-react";
export default function EmailField({
  field,
  value,
  onChange,
  error,
  disabled,
}) {
  const { t } = useTranslation();
  const fieldId = `field-${field.id}`;
  return (
    <div className="public-field-group">
      <label htmlFor={fieldId} className="public-field-label">
        {field.label}{" "}
        {field.required && (
          <span className="required-star">{t("emailField.text")}</span>
        )}
      </label>

      <div className="public-input-with-icon">
        <Mail size={16} className="input-icon" />
        <input
          type="email"
          id={fieldId}
          className={`public-field-input input-has-icon ${error ? "input-error" : ""}`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || "example@domain.com"}
          disabled={disabled}
          aria-required={field.required}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined}
        />
      </div>

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
