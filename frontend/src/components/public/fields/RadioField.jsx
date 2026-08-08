import { useTranslation } from "react-i18next";
import React from "react";
import { AlertCircle } from "lucide-react";
import { parseFieldOptions } from "./parseFieldOptions";
export default function RadioField({
  field,
  value,
  onChange,
  error,
  disabled,
}) {
  const { t } = useTranslation();
  const fieldId = `field-${field.id}`;
  const options = parseFieldOptions(field);
  return (
    <div className="public-field-group">
      <label className="public-field-label">
        {field.label}{" "}
        {field.required && (
          <span className="required-star">{t("radioField.text")}</span>
        )}
      </label>

      {options.length === 0 ? (
        <div className="field-hint-text">
          {t("radioField.noRadioOptionsConfigured")}
        </div>
      ) : (
        <div
          className="radio-group-options"
          role="radiogroup"
          aria-label={field.label}
        >
          {options.map((opt, idx) => {
            const optVal = opt.value;
            const optText = opt.label;
            const isSelected =
              value !== undefined &&
              value !== null &&
              value !== "" &&
              String(value) === String(optVal);
            const optId = `${fieldId}-radio-${idx}`;
            return (
              <label
                key={opt.id ?? idx}
                htmlFor={optId}
                className={`choice-item-card ${isSelected ? "choice-checked" : ""} ${disabled ? "choice-disabled" : ""}`}
              >
                <input
                  type="radio"
                  id={optId}
                  name={`radio-group-${field.id}`}
                  className="visually-hidden"
                  value={optVal}
                  checked={isSelected}
                  onChange={() => !disabled && onChange(optVal)}
                  disabled={disabled}
                />

                <div
                  className={`radio-custom-dot ${isSelected ? "dot-selected" : ""}`}
                >
                  {isSelected && <div className="radio-inner-dot" />}
                </div>
                <span className="choice-label-text">{optText}</span>
              </label>
            );
          })}
        </div>
      )}

      {error && (
        <div className="field-error-message" role="alert">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
