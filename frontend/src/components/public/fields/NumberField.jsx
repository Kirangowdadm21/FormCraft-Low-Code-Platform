import React from 'react';
import { Hash, AlertCircle } from 'lucide-react';

export default function NumberField({ field, value, onChange, error, disabled }) {
  const fieldId = `field-${field.id}`;
  const minVal = field.validation_conf?.min_value;
  const maxVal = field.validation_conf?.max_value;

  return (
    <div className="public-field-group">
      <label htmlFor={fieldId} className="public-field-label">
        {field.label} {field.required && <span className="required-star">*</span>}
      </label>

      <div className="public-input-with-icon">
        <Hash size={16} className="input-icon" />
        <input
          type="number"
          id={fieldId}
          className={`public-field-input input-has-icon ${error ? 'input-error' : ''}`}
          value={value !== undefined && value !== null ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'Enter a number...'}
          disabled={disabled}
          min={minVal}
          max={maxVal}
          aria-required={field.required}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined}
        />
      </div>

      {(minVal !== undefined || maxVal !== undefined) && (
        <div className="field-hint-text">
          {minVal !== undefined && maxVal !== undefined
            ? `Range: ${minVal} to ${maxVal}`
            : minVal !== undefined
            ? `Min value: ${minVal}`
            : `Max value: ${maxVal}`}
        </div>
      )}

      {error && (
        <div id={`${fieldId}-error`} className="field-error-message" role="alert">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
