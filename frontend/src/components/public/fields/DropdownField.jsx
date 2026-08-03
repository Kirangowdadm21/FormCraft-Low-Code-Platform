import React from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { parseFieldOptions } from './parseFieldOptions';

export default function DropdownField({ field, value, onChange, error, disabled }) {
  const fieldId = `field-${field.id}`;
  const options = parseFieldOptions(field);

  return (
    <div className="public-field-group">
      <label htmlFor={fieldId} className="public-field-label">
        {field.label} {field.required && <span className="required-star">*</span>}
      </label>

      <div className="public-select-wrapper">
        <select
          id={fieldId}
          className={`public-field-select ${error ? 'input-error' : ''}`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-required={field.required}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined}
        >
          <option value="">{field.placeholder || 'Select an option...'}</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="select-arrow-icon" />
      </div>

      {error && (
        <div id={`${fieldId}-error`} className="field-error-message" role="alert">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
