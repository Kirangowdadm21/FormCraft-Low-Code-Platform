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
    case 'submit':
      return null;
    default:
      return TextField; // Fallback
  }
}

/**
 * Helper to extract numeric values from strings like "3", "3/5", "2 stars"
 */
function extractNumeric(str) {
  if (str === null || str === undefined) return NaN;
  const s = String(str).trim();
  const match = s.match(/-?\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : parseFloat(s);
}

/**
 * Evaluates a single conditional rule operator against trigger value vs comparison
 */
function evaluateCondition(operator, val, comp) {
  const strVal = val !== undefined && val !== null ? String(val).trim() : '';
  const strComp = comp !== undefined && comp !== null ? String(comp).trim() : '';

  const op = (operator || '').toLowerCase();

  // Determine if trigger field is empty or unselected (e.g. 0 stars or empty string)
  const isUnselected =
    val === undefined ||
    val === null ||
    val === '' ||
    val === 0 ||
    val === '0' ||
    strVal === '' ||
    strVal === '0';

  if (op === 'is_empty') {
    return isUnselected;
  }
  if (op === 'is_not_empty') {
    return !isUnselected;
  }

  // If the trigger field has not been selected/filled yet, conditions like less_than / greater_than do not trigger
  if (isUnselected) {
    return false;
  }

  switch (op) {
    case 'equals':
    case '==':
    case 'is':
      return strVal.toLowerCase() === strComp.toLowerCase();
    case 'not_equals':
    case '!=':
    case 'is_not':
      return strVal.toLowerCase() !== strComp.toLowerCase();
    case 'contains':
    case 'in':
      return strVal.toLowerCase().includes(strComp.toLowerCase());
    case 'not_contains':
      return !strVal.toLowerCase().includes(strComp.toLowerCase());
    case 'greater_than':
    case '>': {
      const numV = extractNumeric(strVal);
      const numC = extractNumeric(strComp);
      return !isNaN(numV) && !isNaN(numC) && numV > numC;
    }
    case 'less_than':
    case '<': {
      const numV = extractNumeric(strVal);
      const numC = extractNumeric(strComp);
      return !isNaN(numV) && !isNaN(numC) && numV < numC;
    }
    default:
      return false;
  }
}

/**
 * Validates a single field value against its metadata.
 * Returns error string or null.
 */
function validateField(field, value, isRequired) {
  const type = (field.field_type || '').toLowerCase();

  // Non-input fields like 'submit' are not validated
  if (type === 'submit' || !getFieldComponent(type)) return null;

  const conf = field.validation_conf || {};

  // Helper to determine if a value is empty for validation purposes
  const isValueEmpty = (val) => {
    if (val === null || val === undefined || val === '') return true;
    if (type === 'rating' || type === 'star_rating') {
      const num = Number(val);
      return isNaN(num) || num <= 0;
    }
    if (type === 'number' || type === 'numeric') {
      return val === '' || val === null || val === undefined || isNaN(Number(val));
    }
    if (type === 'checkbox' || type === 'checkboxes') {
      if (val === false || val === 'false' || val === '' || val === '[]') return true;
      if (Array.isArray(val) && val.length === 0) return true;
      if (typeof val === 'string' && val.startsWith('[')) {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed) && parsed.length === 0) return true;
        } catch {
          // invalid json string
        }
      }
      return false;
    }
    if (Array.isArray(val)) return val.length === 0;
    if (typeof val === 'string') {
      const trimmed = val.trim();
      return trimmed === '' || trimmed === '[]';
    }
    return false;
  };

  // 1. Required check
  if (isRequired && isValueEmpty(value)) {
    return `${field.label} is required.`;
  }

  // 2. Skip further checks if field is empty and not required
  if (isValueEmpty(value)) return null;

  const strVal = String(value).trim();

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
    if (conf.min_value !== undefined && conf.min_value !== null && numVal < conf.min_value) {
      return `Value must be at least ${conf.min_value}.`;
    }
    if (conf.max_value !== undefined && conf.max_value !== null && numVal > conf.max_value) {
      return `Value must be at most ${conf.max_value}.`;
    }
  }

  // Rating validation
  if (type === 'rating' || type === 'star_rating') {
    const numVal = Number(strVal);
    const maxStars = conf.max_value || 5;
    if (isNaN(numVal) || numVal < 1 || numVal > maxStars) {
      return `Rating must be between 1 and ${maxStars}.`;
    }
  }

  // Min/Max length ONLY for text-based types
  const isTextType = ['text', 'short_text', 'textarea', 'long_text', 'email', 'phone', 'phone_number'].includes(type);
  if (isTextType) {
    if (conf.min_length && strVal.length < conf.min_length) {
      return `Must be at least ${conf.min_length} characters.`;
    }
    if (conf.max_length && strVal.length > conf.max_length) {
      return `Must not exceed ${conf.max_length} characters.`;
    }
  }

  return null;
}

export default function PublicFormRenderer({
  fields = [],
  rules = [],
  onSubmit,
  isPreview = false,
  isSubmitting = false,
}) {
  const [values, setValues] = useState(() => {
    const init = {};
    (fields || []).forEach((f) => {
      const def = f.default_value ?? f.validation_conf?.default_value;
      const type = (f.field_type || '').toLowerCase();
      if (type === 'rating' || type === 'star_rating') {
        init[f.id] = def !== undefined && def !== null && def !== '' ? Number(def) : 0;
      } else {
        init[f.id] = def !== undefined && def !== null ? String(def) : '';
      }
    });
    return init;
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);

  // Synchronize values state when fields prop changes
  React.useEffect(() => {
    if (!fields || fields.length === 0) return;
    setValues((prev) => {
      let changed = false;
      const next = { ...prev };
      fields.forEach((f) => {
        if (next[f.id] === undefined) {
          const def = f.default_value ?? f.validation_conf?.default_value;
          const type = (f.field_type || '').toLowerCase();
          if (type === 'rating' || type === 'star_rating') {
            next[f.id] = def !== undefined && def !== null && def !== '' ? Number(def) : 0;
          } else {
            next[f.id] = def !== undefined && def !== null ? String(def) : '';
          }
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [fields]);

  // Compute ordered fields where targeted conditional fields render immediately below their trigger field
  const schemaFields = useMemo(() => {
    if (!fields || fields.length === 0) return [];
    if (!rules || rules.length === 0) return fields;

    // Build map of trigger_field -> array of targeted_fields
    const triggerToTargets = {};
    const targetedSet = new Set();

    rules.forEach((rule) => {
      const trig = rule.trigger_field;
      const targ = rule.targeted_field;
      if (trig && targ && String(trig) !== String(targ)) {
        const trigStr = String(trig);
        const targStr = String(targ);
        if (!triggerToTargets[trigStr]) {
          triggerToTargets[trigStr] = [];
        }
        if (!triggerToTargets[trigStr].includes(targStr)) {
          triggerToTargets[trigStr].push(targStr);
        }
        targetedSet.add(targStr);
      }
    });

    if (targetedSet.size === 0) return fields;

    const ordered = [];
    const placedSet = new Set();

    const placeField = (fieldId) => {
      const idStr = String(fieldId);
      if (placedSet.has(idStr)) return;
      placedSet.add(idStr);

      const fieldObj = fields.find((f) => String(f.id) === idStr);
      if (fieldObj) {
        ordered.push(fieldObj);
      }

      // Append any fields targeted by this trigger field immediately below it
      const targets = triggerToTargets[idStr] || [];
      targets.forEach((targId) => {
        placeField(targId);
      });
    };

    // Place non-targeted base fields in schema order
    fields.forEach((field) => {
      if (!targetedSet.has(String(field.id))) {
        placeField(field.id);
      }
    });

    // Fallback for any unplaced targeted fields (e.g. missing trigger)
    fields.forEach((field) => {
      if (!placedSet.has(String(field.id))) {
        placeField(field.id);
      }
    });

    return ordered;
  }, [fields, rules]);

  // Dynamically compute visibility & requirement rules for every field
  const computedFieldStates = useMemo(() => {
    const states = {};

    schemaFields.forEach((field) => {
      states[field.id] = {
        hidden: false,
        required: !!field.required,
      };
    });

    if (!rules || rules.length === 0) return states;

    rules.forEach((rule) => {
      const targetId = rule.targeted_field;
      if (!states[targetId]) return;

      const triggerVal = values[rule.trigger_field];
      const isMet = evaluateCondition(rule.operator, triggerVal, rule.comparison);
      const act = (rule.action || '').toLowerCase();

      if (act === 'hide') {
        if (isMet) {
          states[targetId].hidden = true;
        }
      } else if (act === 'show') {
        if (isMet) {
          states[targetId].hidden = false;
        } else {
          states[targetId].hidden = true;
        }
      } else if (act === 'require') {
        if (isMet) {
          states[targetId].required = true;
        }
      }
    });

    return states;
  }, [schemaFields, rules, values]);

  const handleChange = useCallback((fieldId, val) => {
    setValues((prev) => ({ ...prev, [fieldId]: val }));
    // Clear error for this field on change and clear formError if no errors remain
    setErrors((prev) => {
      if (!prev[fieldId]) return prev;
      const next = { ...prev };
      delete next[fieldId];
      if (Object.keys(next).length === 0) {
        setFormError(null);
      }
      return next;
    });
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    if (isPreview) {
      setFormError('Preview mode: Submission is disabled. This is how respondents will see your form.');
      return;
    }

    // Validate visible fields
    const newErrors = {};
    for (const field of schemaFields) {
      const type = (field.field_type || '').toLowerCase();
      // Skip non-input fields like 'submit' or unrendered field types
      if (type === 'submit' || !getFieldComponent(type)) continue;

      const state = computedFieldStates[field.id] || { hidden: false, required: !!field.required };
      if (state.hidden) continue; // Do not validate hidden fields

      const err = validateField(field, values[field.id], state.required);

      if (err) newErrors[field.id] = err;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setFormError('Please correct the highlighted fields before submitting.');
      const firstErrorId = Object.keys(newErrors)[0];
      const el = document.getElementById(`field-${firstErrorId}`);
      if (el) el.focus();
      return;
    }

    setErrors({});
    setFormError(null);

    // Transform field answers into backend payload format for ALL fields in the form
    const responses = schemaFields.map((field) => {
      const ft = (field.field_type || '').toLowerCase();
      const state = computedFieldStates[field.id] || { hidden: false };

      if (ft === 'submit') {
        return {
          field_id: field.id,
          value: 'Submitted',
          uploaded_file: null,
        };
      }

      if (state.hidden) {
        return {
          field_id: field.id,
          value: null,
          uploaded_file: null,
        };
      }

      const rawVal = values[field.id];
      let submitValue = typeof rawVal === 'string' ? rawVal : (rawVal !== undefined && rawVal !== null ? String(rawVal) : null);
      let uploadedFile = null;

      if (ft === 'file' || ft === 'file_upload') {
        try {
          const parsed = typeof rawVal === 'string' ? JSON.parse(rawVal) : rawVal;
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
        value: submitValue !== undefined && submitValue !== null && submitValue !== '' ? submitValue : null,
        uploaded_file: uploadedFile,
      };
    });

    if (onSubmit) {
      onSubmit({ responses });
    }
  }, [isPreview, schemaFields, computedFieldStates, values, onSubmit]);

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

      {/* Render each visible field dynamically */}
      {schemaFields.length === 0 ? (
        <div className="public-empty-fields">
          <p>No questions have been added to this form yet.</p>
        </div>
      ) : (
        schemaFields.map((field) => {
          const FieldComponent = getFieldComponent(field.field_type);
          if (!FieldComponent) return null;

          const state = computedFieldStates[field.id] || { hidden: false, required: !!field.required };
          if (state.hidden) return null; // Do not render if hidden by rule

          // Dynamic field overrides for required state
          const dynamicField = state.required !== !!field.required ? { ...field, required: state.required } : field;

          return (
            <FieldComponent
              key={field.id}
              field={dynamicField}
              value={values[field.id]}
              onChange={(val) => handleChange(field.id, val)}
              error={errors[field.id]}
              disabled={isPreview}
            />
          );
        })
      )}

      {/* Submit / Preview Button */}
      {schemaFields.length > 0 && (
        <SubmitButton
          isSubmitting={isSubmitting}
          disabled={isPreview}
          label={isPreview ? 'Submit Disabled (Preview)' : 'Submit Response'}
        />
      )}
    </form>
  );
}
