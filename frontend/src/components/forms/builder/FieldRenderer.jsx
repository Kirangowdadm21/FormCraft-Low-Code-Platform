import React, { useState } from 'react';
import { Star, UploadCloud, PenTool, Check, Calendar } from 'lucide-react';

export default function FieldRenderer({ field, value, onChange, isPreview = false }) {
  const [rating, setRating] = useState(value || 0);

  const getOptions = () => {
    if (Array.isArray(field.options) && field.options.length > 0) {
      return field.options.map(opt => typeof opt === 'string' ? { label: opt, value: opt } : { label: opt.optiontext || opt.label || opt.value, value: opt.value || opt.optiontext });
    }
    return [
      { label: 'Option 1', value: 'option_1' },
      { label: 'Option 2', value: 'option_2' }
    ];
  };

  const renderFieldInput = () => {
    switch (field.field_type) {
      case 'textarea':
        return (
          <textarea
            className="field-preview-textarea"
            placeholder={field.placeholder || 'Enter long description...'}
            value={value || ''}
            onChange={(e) => onChange && onChange(e.target.value)}
            disabled={isPreview}
            rows={3}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            className="field-preview-input"
            placeholder={field.placeholder || 'name@example.com'}
            value={value || ''}
            onChange={(e) => onChange && onChange(e.target.value)}
            disabled={isPreview}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            className="field-preview-input"
            placeholder={field.placeholder || '0'}
            value={value || ''}
            onChange={(e) => onChange && onChange(e.target.value)}
            disabled={isPreview}
          />
        );

      case 'phone':
        return (
          <input
            type="tel"
            className="field-preview-input"
            placeholder={field.placeholder || '+1 (555) 000-0000'}
            value={value || ''}
            onChange={(e) => onChange && onChange(e.target.value)}
            disabled={isPreview}
          />
        );

      case 'date':
        return (
          <div className="input-with-icon">
            <input
              type="date"
              className="field-preview-input"
              value={value || ''}
              onChange={(e) => onChange && onChange(e.target.value)}
              disabled={isPreview}
            />
          </div>
        );

      case 'dropdown':
        return (
          <select
            className="field-preview-input"
            value={value || ''}
            onChange={(e) => onChange && onChange(e.target.value)}
            disabled={isPreview}
          >
            <option value="">{field.placeholder || '-- Select option --'}</option>
            {getOptions().map((opt, i) => (
              <option key={i} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="field-preview-options">
            {getOptions().map((opt, i) => (
              <label key={i} className="preview-choice-label">
                <input
                  type="radio"
                  name={`radio-${field.id}`}
                  checked={value === opt.value}
                  onChange={() => onChange && onChange(opt.value)}
                  disabled={isPreview}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="field-preview-options">
            {getOptions().map((opt, i) => (
              <label key={i} className="preview-choice-label">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) ? value.includes(opt.value) : false}
                  onChange={(e) => {
                    if (!onChange) return;
                    const current = Array.isArray(value) ? [...value] : [];
                    if (e.target.checked) {
                      current.push(opt.value);
                    } else {
                      const idx = current.indexOf(opt.value);
                      if (idx > -1) current.splice(idx, 1);
                    }
                    onChange(current);
                  }}
                  disabled={isPreview}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'file_upload':
        return (
          <div className="field-preview-dropzone">
            <UploadCloud size={24} color="var(--primary)" />
            <span>Click or drag files here to upload</span>
            <span className="dropzone-sub">Supports PDF, DOCX, PNG, JPG (Max 10MB)</span>
          </div>
        );

      case 'rating':
        return (
          <div className="field-preview-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={22}
                className={`star-icon ${star <= (rating || value || 0) ? 'filled' : ''}`}
                onClick={() => {
                  setRating(star);
                  onChange && onChange(star);
                }}
              />
            ))}
          </div>
        );

      case 'signature':
        return (
          <div className="field-preview-signature">
            <PenTool size={18} color="var(--text-muted)" />
            <span>Draw or sign name here</span>
          </div>
        );

      case 'submit':
        return (
          <button
            type="button"
            className="btn-primary"
            style={{ width: field.width === 'half' ? '50%' : '100%', marginTop: '0.5rem' }}
            disabled={!isPreview}
          >
            <span>{field.label || 'Submit Form'}</span>
          </button>
        );

      case 'text':
      default:
        return (
          <input
            type="text"
            className="field-preview-input"
            placeholder={field.placeholder || 'Enter short text...'}
            value={value || ''}
            onChange={(e) => onChange && onChange(e.target.value)}
            disabled={isPreview}
          />
        );
    }
  };

  if (field.field_type === 'submit') {
    return renderFieldInput();
  }

  return (
    <div className="field-renderer-wrapper" style={{ width: field.width === 'half' ? '49%' : field.width === 'third' ? '32%' : '100%' }}>
      <label className="field-render-label">
        <span>{field.label || 'Untitled Field'}</span>
        {field.required && <span className="required-star">*</span>}
      </label>
      {field.help_text && (
        <span className="field-help-text">{field.help_text}</span>
      )}
      {renderFieldInput()}
    </div>
  );
}
