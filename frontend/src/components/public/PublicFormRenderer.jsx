import React, { useState, useCallback, useMemo } from 'react';
import { Eye, AlertTriangle } from 'lucide-react';

import TextField from './fields/TextField';
import EmailField from './fields/EmailField';
import PhoneField from './fields/PhoneField';
import NumberField from './fields/NumberField';
import DateField from './fields/DateField';
import CheckboxField from './fields/CheckboxField';
import RadioField from './fields/RadioField';
import DropdownField from './fields/DropdownField';
import FileUploadField from './fields/FileUploadField';
import RatingField from './fields/RatingField';
import SignatureField from './fields/SignatureField';
import SubmitButton from './fields/SubmitButton';

/**
 * Maps a backend field_type string to a React field component.
 */
function getFieldComponent(fieldType) {
  const type = (fieldType || '').toLowerCase();
  switch (type) {
    case 'text':
    case 'short_text':
      return TextField;
    case 'textarea':
    case 'long_text':
      return TextField;
    case 'email':
      return EmailField;
    case 'phone':
    case 'phone_number':
      return PhoneField;
    case 'number':
    case 'numeric':
      return NumberField;
    case 'date':
      return DateField;
    case 'checkbox':
    case 'checkboxes':
      return CheckboxField;
    case 'radio':
    case 'radio_button':
      return RadioField;
    case 'select':
    case 'dropdown':
      return DropdownField;
    case 'file':
    case 'file_upload':
      return FileUploadField;
    case 'rating':
    case 'star_rating':
      return RatingField;
    case 'signature':
      return SignatureField;
    default:
      return TextField; // Fallback
  }
}

/**
 * Validates a single field value against its metadata.
 * Returns error string or null.
 */
function validateField(field, value) {
  const val = typeof value === 'string' ? value.trim() : value;

  // Required check
  if (field.required) {
    if (val === null || val === undefined || val === '' || val === '[]') {
      return `"${field.label}" is required.`;
    }
  }

  // Skip further checks if empty and not required
  if (!val && val !== 0) return null;

  const strVal = String(val);
  const type = (field.field_type || '').toLowerCase();
  const conf = field.validation_conf || {};

  // Email format
  if (type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(strVal)) {
      return 'Please enter a valid email address.';
    }
  }

  // Phone format
  if (type === 'phone' || type === 'phone_number') {
    const phoneRegex = /^[+]?[\d\s().-]{7,20}$/;
    if (!phoneRegex.test(strVal)) {
      return 'Please enter a valid phone number.';
    }
  }

  // Number validation
  if (type === 'number' || type === 'numeric') {
    const numVal = Number(strVal);
    if (isNaN(numVal)) {
      return 'Please enter a valid number.';
    }
    if (conf.min_value !== undefined && numVal < conf.min_value) {
      return `Value must be at least ${conf.min_value}.`;
    }
    if (conf.max_value !== undefined && numVal > conf.max_value) {
      return `Value must be at most ${conf.max_value}.`;
    }
  }

  // Min/Max length
  if (conf.min_length && strVal.length < conf.min_length) {
    return `Must be at least ${conf.min_length} characters.`;
  }
  if (conf.max_length && strVal.length > conf.max_length) {
    return `Must not exceed ${conf.max_length} characters.`;
  }

  return null;
}

/**
 * PublicFormRenderer
 *
 * Central renderer component that maps field metadata to dynamic field
 * components, performs client-side validation, collects state, and
 * transforms answers into backend-compatible payload format.
 *
 * Supports:
 *  - isPreview={true}: Admin Preview mode – renders form exactly as
 *    respondents see it but disables actual submission.
 *  - isPreview={false}: Public Respondent Submission mode.
 */
export default function PublicFormRenderer({
  fields = [],
  onSubmit,
  isPreview = false,
  isSubmitting = false,
}) {
  const [values, setValues] = useState(() => {
    const init = {};
    fields.forEach((f) => { init[f.id] = ''; });
    return init;
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);

  // Sort fields by display_order
  const sortedFields = useMemo(
    () => [...fields].sort((a, b) => (a.display_order || 0) - (b.display_order || 0)),
    [fields]
  );

  const handleChange = useCallback((fieldId, val) => {
    setValues((prev) => ({ ...prev, [fieldId]: val }));
    // Clear error for this field on change
    setErrors((prev) => {
      if (!prev[fieldId]) return prev;
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
    if (formError) setFormError(null);
  }, [formError]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    if (isPreview) {
      setFormError('Preview mode: Submission is disabled. This is how respondents will see your form.');
      return;
    }

    // Validate all fields
    const newErrors = {};
    for (const field of sortedFields) {
      const err = validateField(field, values[field.id]);
      if (err) newErrors[field.id] = err;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setFormError('Please correct the highlighted fields before submitting.');
      // Focus on first error field
      const firstErrorId = Object.keys(newErrors)[0];
      const el = document.getElementById(`field-${firstErrorId}`);
      if (el) el.focus();
      return;
    }

    setErrors({});
    setFormError(null);

    // Transform answers into backend payload format
    const responses = sortedFields.map((field) => {
      const rawVal = values[field.id];
      let submitValue = typeof rawVal === 'string' ? rawVal : JSON.stringify(rawVal);
      let uploadedFile = null;

      // Handle file upload: extract file_id
      const ft = (field.field_type || '').toLowerCase();
      if (ft === 'file' || ft === 'file_upload') {
        try {
          const parsed = JSON.parse(rawVal);
          if (parsed && parsed.file_id) {
            uploadedFile = parsed.file_id;
            submitValue = parsed.filename || '';
          }
        } catch {
          // Not JSON, use as-is
        }
      }

      return {
        field_id: field.id,
        value: submitValue || null,
        uploaded_file: uploadedFile,
      };
    });

    if (onSubmit) {
      onSubmit({ responses });
    }
  }, [isPreview, sortedFields, values, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className="public-form-fields-layout" noValidate>
      {/* Preview mode banner */}
      {isPreview && (
        <div className="preview-mode-banner" role="alert">
          <Eye size={18} />
          <div>
            <strong>Preview Mode</strong>
            <p>You are viewing this form as a respondent. Submission is disabled.</p>
          </div>
        </div>
      )}

      {/* Form-level error */}
      {formError && (
        <div className="form-level-error" role="alert">
          <AlertTriangle size={16} />
          <span>{formError}</span>
        </div>
      )}

      {/* Render each field dynamically */}
      {sortedFields.length === 0 ? (
        <div className="public-empty-fields">
          <p>No questions have been added to this form yet.</p>
        </div>
      ) : (
        sortedFields.map((field) => {
          const FieldComponent = getFieldComponent(field.field_type);
          return (
            <FieldComponent
              key={field.id}
              field={field}
              value={values[field.id]}
              onChange={(val) => handleChange(field.id, val)}
              error={errors[field.id]}
              disabled={isPreview}
            />
          );
        })
      )}

      {/* Submit / Preview Button */}
      {sortedFields.length > 0 && (
        <SubmitButton
          isSubmitting={isSubmitting}
          disabled={isPreview}
          label={isPreview ? 'Submit Disabled (Preview)' : 'Submit Response'}
        />
      )}
    </form>
  );
}
