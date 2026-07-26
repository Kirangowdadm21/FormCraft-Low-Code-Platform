import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function RadioField({ field, value, onChange, error, disabled }) {
  const fieldId = `field-${field.id}`;
  const options = field.options || [];

  return (
    <div className="public-field-group">
      <label className="public-field-label">
        {field.label} {field.required && <span className="required-star">*</span>}
      </label>

      {options.length === 0 ? (
        <div className="field-hint-text">No radio options configured.</div>
      ) : (
        <div className="radio-group-options" role="radiogroup" aria-label={field.label}>
          {options.map((opt, idx) => {
            const optVal = opt.value || opt.optiontext || `Option ${idx + 1}`;
            const optText = opt.optiontext || opt.value || `Option ${idx + 1}`;
            const isSelected = value === optVal;
            const optId = `${fieldId}-radio-${idx}`;

            return (
              <label
                key={opt.id || idx}
                htmlFor={optId}
                className={`choice-item-card ${isSelected ? 'choice-checked' : ''}`}
              >
                <input
                  type="radio"
                  id={optId}
                  name={`radio-group-${field.id}`}
                  className="visually-hidden"
                  value={optVal}
                  checked={isSelected}
                  onChange={() => onChange(optVal)}
                  disabled={disabled}
                />
                <div className={`radio-custom-dot ${isSelected ? 'dot-selected' : ''}`}>
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
