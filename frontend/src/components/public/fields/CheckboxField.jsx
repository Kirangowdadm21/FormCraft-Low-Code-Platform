import React from 'react';
import { AlertCircle, Check } from 'lucide-react';

export default function CheckboxField({ field, value, onChange, error, disabled }) {
  const fieldId = `field-${field.id}`;
  const options = field.options || [];

  // Parse current selected values as array
  let selectedValues = [];
  if (Array.isArray(value)) {
    selectedValues = value;
  } else if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      selectedValues = Array.isArray(parsed) ? parsed : [value];
    } catch {
      selectedValues = [value];
    }
  }

  const handleOptionToggle = (optionVal) => {
    let next;
    if (selectedValues.includes(optionVal)) {
      next = selectedValues.filter((v) => v !== optionVal);
    } else {
      next = [...selectedValues, optionVal];
    }
    onChange(JSON.stringify(next));
  };

  const handleSingleToggle = (checked) => {
    onChange(checked ? 'true' : '');
  };

  return (
    <div className="public-field-group">
      <label className="public-field-label">
        {field.label} {field.required && <span className="required-star">*</span>}
      </label>

      {options.length > 0 ? (
        <div className="checkbox-group-options" role="group" aria-label={field.label}>
          {options.map((opt, idx) => {
            const optVal = opt.value || opt.optiontext || `Option ${idx + 1}`;
            const optText = opt.optiontext || opt.value || `Option ${idx + 1}`;
            const isChecked = selectedValues.includes(optVal);
            const optId = `${fieldId}-opt-${idx}`;

            return (
              <label key={opt.id || idx} htmlFor={optId} className={`choice-item-card ${isChecked ? 'choice-checked' : ''}`}>
                <input
                  type="checkbox"
                  id={optId}
                  className="visually-hidden"
                  checked={isChecked}
                  onChange={() => handleOptionToggle(optVal)}
                  disabled={disabled}
                />
                <div className={`checkbox-custom-box ${isChecked ? 'box-checked' : ''}`}>
                  {isChecked && <Check size={12} strokeWidth={3} />}
                </div>
                <span className="choice-label-text">{optText}</span>
              </label>
            );
          })}
        </div>
      ) : (
        <label htmlFor={fieldId} className={`choice-item-card ${value === 'true' ? 'choice-checked' : ''}`}>
          <input
            type="checkbox"
            id={fieldId}
            className="visually-hidden"
            checked={value === 'true'}
            onChange={(e) => handleSingleToggle(e.target.checked)}
            disabled={disabled}
            aria-required={field.required}
          />
          <div className={`checkbox-custom-box ${value === 'true' ? 'box-checked' : ''}`}>
            {value === 'true' && <Check size={12} strokeWidth={3} />}
          </div>
          <span className="choice-label-text">{field.placeholder || 'I agree and confirm'}</span>
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
