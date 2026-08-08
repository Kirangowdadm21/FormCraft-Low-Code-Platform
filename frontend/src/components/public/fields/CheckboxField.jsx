import { useTranslation } from "react-i18next";
import React from "react";
import { AlertCircle, Check } from "lucide-react";
import { parseFieldOptions } from "./parseFieldOptions";
export default function CheckboxField({
  field,
  value,
  onChange,
  error,
  disabled,
}) {
  const { t } = useTranslation();
  const fieldId = `field-${field.id}`;
  const options = parseFieldOptions(field);

  // Parse current selected values as array
  let selectedValues = [];
  if (Array.isArray(value)) {
    selectedValues = value.map(String);
  } else if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      selectedValues = Array.isArray(parsed) ? parsed.map(String) : [value];
    } catch {
      selectedValues = [value];
    }
  }
  const handleOptionToggle = (optionVal) => {
    const valStr = String(optionVal);
    let next;
    if (selectedValues.includes(valStr)) {
      next = selectedValues.filter((v) => v !== valStr);
    } else {
      next = [...selectedValues, valStr];
    }
    onChange(JSON.stringify(next));
  };
  const handleSingleToggle = (checked) => {
    onChange(checked ? "true" : "");
  };
  return (
    <div className="public-field-group">
      <label className="public-field-label">
        {field.label}{" "}
        {field.required && (
          <span className="required-star">{t("checkboxField.text")}</span>
        )}
      </label>

      {options.length > 0 ? (
        <div
          className="checkbox-group-options"
          role="group"
          aria-label={field.label}
        >
          {options.map((opt, idx) => {
            const optVal = opt.value;
            const optText = opt.label;
            const isChecked = selectedValues.includes(String(optVal));
            const optId = `${fieldId}-opt-${idx}`;
            return (
              <label
                key={opt.id ?? idx}
                htmlFor={optId}
                className={`choice-item-card ${isChecked ? "choice-checked" : ""} ${disabled ? "choice-disabled" : ""}`}
              >
                <input
                  type="checkbox"
                  id={optId}
                  className="visually-hidden"
                  checked={isChecked}
                  onChange={() => handleOptionToggle(optVal)}
                  disabled={disabled}
                />

                <div
                  className={`checkbox-custom-box ${isChecked ? "box-checked" : ""}`}
                >
                  {isChecked && <Check size={12} strokeWidth={3} />}
                </div>
                <span className="choice-label-text">{optText}</span>
              </label>
            );
          })}
        </div>
      ) : (
        <label
          htmlFor={fieldId}
          className={`choice-item-card ${value === "true" || value === true ? "choice-checked" : ""} ${disabled ? "choice-disabled" : ""}`}
        >
          <input
            type="checkbox"
            id={fieldId}
            className="visually-hidden"
            checked={value === "true" || value === true}
            onChange={(e) => handleSingleToggle(e.target.checked)}
            disabled={disabled}
            aria-required={field.required}
          />

          <div
            className={`checkbox-custom-box ${value === "true" || value === true ? "box-checked" : ""}`}
          >
            {(value === "true" || value === true) && (
              <Check size={12} strokeWidth={3} />
            )}
          </div>
          <span className="choice-label-text">
            {field.placeholder || t("checkboxField.agreeAndConfirm")}
          </span>
        </label>
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
