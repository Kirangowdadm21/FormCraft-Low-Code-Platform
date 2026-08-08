import { useTranslation } from "react-i18next";
import React, { useState, useCallback, useMemo } from "react";
import { Eye, AlertTriangle } from "lucide-react";
import TextField from "./fields/TextField";
import EmailField from "./fields/EmailField";
import PhoneField from "./fields/PhoneField";
import NumberField from "./fields/NumberField";
import DateField from "./fields/DateField";
import CheckboxField from "./fields/CheckboxField";
import RadioField from "./fields/RadioField";
import DropdownField from "./fields/DropdownField";
import FileUploadField from "./fields/FileUploadField";
import RatingField from "./fields/RatingField";
import SignatureField from "./fields/SignatureField";
import SubmitButton from "./fields/SubmitButton";
import { parseFieldOptions } from "./fields/parseFieldOptions";

/**
 * Maps a backend field_type string to a React field component.
 */
function getFieldComponent(fieldType) {
  const type = (fieldType || "").toLowerCase();
  switch (type) {
    case "text":
    case "short_text":
      return TextField;
    case "textarea":
    case "long_text":
      return TextField;
    case "email":
      return EmailField;
    case "phone":
    case "phone_number":
      return PhoneField;
    case "number":
    case "numeric":
      return NumberField;
    case "date":
      return DateField;
    case "checkbox":
    case "checkboxes":
      return CheckboxField;
    case "radio":
    case "radio_button":
      return RadioField;
    case "select":
    case "dropdown":
      return DropdownField;
    case "file":
    case "file_upload":
      return FileUploadField;
    case "rating":
    case "star_rating":
      return RatingField;
    case "signature":
      return SignatureField;
    case "submit":
      return null;
    default:
      return TextField;
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
function evaluateCondition(operator, val, comp, triggerField = null) {
  const sanitizeStr = (s) =>
    s !== undefined && s !== null
      ? String(s)
          .replace(/^[—–\-="'`\s]+|[—–\-="'`\s]+$/g, "")
          .trim()
      : "";

  const strVal = sanitizeStr(val);
  const strComp = sanitizeStr(comp);
  const op = (operator || "").toLowerCase();

  // Determine if trigger field is empty or unselected (e.g. 0 stars or empty string)
  const isUnselected =
    val === undefined ||
    val === null ||
    val === "" ||
    val === 0 ||
    val === "0" ||
    strVal === "" ||
    strVal === "0";

  if (op === "is_empty") {
    return isUnselected;
  }
  if (op === "is_not_empty") {
    return !isUnselected;
  }

  // If the trigger field has not been selected/filled yet, conditions do not trigger
  if (isUnselected) {
    return false;
  }

  // Extract all possible string representations of val (value and label if field has options)
  const valMatches = [strVal.toLowerCase()];
  if (triggerField) {
    const opts = parseFieldOptions(triggerField);
    const matchedOpt = opts.find(
      (o) =>
        sanitizeStr(o.value).toLowerCase() === strVal.toLowerCase() ||
        sanitizeStr(o.label).toLowerCase() === strVal.toLowerCase() ||
        String(o.id) === strVal,
    );
    if (matchedOpt) {
      if (matchedOpt.label) valMatches.push(sanitizeStr(matchedOpt.label).toLowerCase());
      if (matchedOpt.value) valMatches.push(sanitizeStr(matchedOpt.value).toLowerCase());
    }
  }

  const compLower = strComp.toLowerCase();
  const isEqualsMatch = valMatches.some((v) => v === compLower);

  switch (op) {
    case "equals":
    case "==":
    case "is":
      return isEqualsMatch;
    case "not_equals":
    case "!=":
    case "is_not":
      return !isEqualsMatch;
    case "contains":
    case "in":
      return valMatches.some((v) => v.includes(compLower));
    case "not_contains":
      return !valMatches.some((v) => v.includes(compLower));
    case "greater_than":
    case ">": {
      const numV = extractNumeric(strVal);
      const numC = extractNumeric(strComp);
      return !isNaN(numV) && !isNaN(numC) && numV > numC;
    }
    case "less_than":
    case "<": {
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
function validateField(field, value, isRequired, t) {
  const type = (field.field_type || "").toLowerCase();

  // Non-input fields like 'submit' are not validated
  if (type === "submit" || !getFieldComponent(type)) return null;
  const conf = field.validation_conf || {};

  // Helper to determine if a value is empty for validation purposes
  const isValueEmpty = (val) => {
    if (val === null || val === undefined || val === "") return true;
    if (type === "rating" || type === "star_rating") {
      const num = Number(val);
      return isNaN(num) || num <= 0;
    }
    if (type === "number" || type === "numeric") {
      return (
        val === "" || val === null || val === undefined || isNaN(Number(val))
      );
    }
    if (type === "checkbox" || type === "checkboxes") {
      if (val === false || val === "false" || val === "" || val === "[]")
        return true;
      if (Array.isArray(val) && val.length === 0) return true;
      if (typeof val === "string" && val.startsWith("[")) {
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
    if (typeof val === "string") {
      const trimmed = val.trim();
      return trimmed === "" || trimmed === "[]";
    }
    return false;
  };

  // 1. Required check
  if (isRequired && isValueEmpty(value)) {
    return `${field.label} ${t("validation.isRequired")}`;
  }

  // 2. Skip further checks if field is empty and not required
  if (isValueEmpty(value)) return null;
  const strVal = String(value).trim();

  // Email format
  if (type === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(strVal)) {
      return t("validation.invalidEmail");
    }
  }

  // Phone format
  if (type === "phone" || type === "phone_number") {
    const phoneRegex = /^[+]?[\d\s().-]{7,20}$/;
    if (!phoneRegex.test(strVal)) {
      return t("validation.invalidPhone");
    }
  }

  // Number validation
  if (type === "number" || type === "numeric") {
    const numVal = Number(strVal);
    if (isNaN(numVal)) {
      return t("validation.invalidNumber");
    }
    if (
      conf.min_value !== undefined &&
      conf.min_value !== null &&
      numVal < conf.min_value
    ) {
      return t("validation.minValue", { min: conf.min_value });
    }
    if (
      conf.max_value !== undefined &&
      conf.max_value !== null &&
      numVal > conf.max_value
    ) {
      return t("validation.maxValue", { max: conf.max_value });
    }
  }

  // Rating validation
  if (type === "rating" || type === "star_rating") {
    const numVal = Number(strVal);
    const maxStars = conf.max_value || 5;
    if (isNaN(numVal) || numVal < 1 || numVal > maxStars) {
      return t("validation.ratingRange", { max: maxStars });
    }
  }

  // Min/Max length ONLY for text-based types
  const isTextType = [
    "text",
    "short_text",
    "textarea",
    "long_text",
    "email",
    "phone",
    "phone_number",
  ].includes(type);
  if (isTextType) {
    if (conf.min_length && strVal.length < conf.min_length) {
      return t("validation.minLength", { min: conf.min_length });
    }
    if (conf.max_length && strVal.length > conf.max_length) {
      return t("validation.maxLength", { max: conf.max_length });
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
  const { t } = useTranslation();
  const [values, setValues] = useState(() => {
    const init = {};
    (fields || []).forEach((f) => {
      const def = f.default_value ?? f.validation_conf?.default_value;
      const type = (f.field_type || "").toLowerCase();
      if (type === "rating" || type === "star_rating") {
        init[f.id] =
          def !== undefined && def !== null && def !== "" ? Number(def) : 0;
      } else {
        init[f.id] = def !== undefined && def !== null ? String(def) : "";
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
      const next = {
        ...prev,
      };
      fields.forEach((f) => {
        if (next[f.id] === undefined) {
          const def = f.default_value ?? f.validation_conf?.default_value;
          const type = (f.field_type || "").toLowerCase();
          if (type === "rating" || type === "star_rating") {
            next[f.id] =
              def !== undefined && def !== null && def !== "" ? Number(def) : 0;
          } else {
            next[f.id] = def !== undefined && def !== null ? String(def) : "";
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
    const sortedRaw = [...fields].sort((a, b) => {
      const orderA = a.display_order ?? a.displayOrder ?? a.order ?? (typeof a.id === "number" ? a.id : 0);
      const orderB = b.display_order ?? b.displayOrder ?? b.order ?? (typeof b.id === "number" ? b.id : 0);
      return orderA - orderB;
    });

    if (!rules || rules.length === 0) return sortedRaw;

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
    if (targetedSet.size === 0) return sortedRaw;
    const ordered = [];
    const placedSet = new Set();
    const placeField = (fieldId) => {
      const idStr = String(fieldId);
      if (placedSet.has(idStr)) return;
      placedSet.add(idStr);
      const fieldObj = sortedRaw.find((f) => String(f.id) === idStr);
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
    sortedRaw.forEach((field) => {
      if (!targetedSet.has(String(field.id))) {
        placeField(field.id);
      }
    });

    // Fallback for any unplaced targeted fields (e.g. missing trigger)
    sortedRaw.forEach((field) => {
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
      const targetKey = Object.keys(states).find(
        (k) => String(k) === String(targetId),
      );
      if (!targetKey) return;

      const triggerVal =
        values[rule.trigger_field] ??
        values[String(rule.trigger_field)] ??
        values[Number(rule.trigger_field)];

      const triggerFieldObj = schemaFields.find(
        (f) => String(f.id) === String(rule.trigger_field),
      );

      const isMet = evaluateCondition(
        rule.operator,
        triggerVal,
        rule.comparison,
        triggerFieldObj,
      );
      const act = (rule.action || "").toLowerCase();
      if (act === "hide") {
        if (isMet) {
          states[targetKey].hidden = true;
        }
      } else if (act === "show") {
        if (isMet) {
          states[targetKey].hidden = false;
        } else {
          states[targetKey].hidden = true;
        }
      } else if (act === "require") {
        if (isMet) {
          states[targetKey].required = true;
        }
      }
    });
    return states;
  }, [schemaFields, rules, values]);
  const handleChange = useCallback((fieldId, val) => {
    setValues((prev) => ({
      ...prev,
      [fieldId]: val,
    }));
    // Clear error for this field on change and clear formError if no errors remain
    setErrors((prev) => {
      if (!prev[fieldId]) return prev;
      const next = {
        ...prev,
      };
      delete next[fieldId];
      if (Object.keys(next).length === 0) {
        setFormError(null);
      }
      return next;
    });
  }, []);
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (isPreview) {
        setFormError(
          t("validation.previewModeSubmitDisabled"),
        );
        return;
      }

      // Validate visible fields
      const newErrors = {};
      for (const field of schemaFields) {
        const type = (field.field_type || "").toLowerCase();
        // Skip non-input fields like 'submit' or unrendered field types
        if (type === "submit" || !getFieldComponent(type)) continue;
        const state = computedFieldStates[field.id] || {
          hidden: false,
          required: !!field.required,
        };
        if (state.hidden) continue; // Do not validate hidden fields

        const err = validateField(field, values[field.id], state.required, t);
        if (err) newErrors[field.id] = err;
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setFormError(
          t("validation.correctHighlightedFields"),
        );
        const firstErrorId = Object.keys(newErrors)[0];
        const el = document.getElementById(`field-${firstErrorId}`);
        if (el) el.focus();
        return;
      }
      setErrors({});
      setFormError(null);

      // Transform field answers into backend payload format for ALL fields in the form
      const responses = schemaFields.map((field) => {
        const ft = (field.field_type || "").toLowerCase();
        const state =
          computedFieldStates[field.id] ??
          computedFieldStates[String(field.id)] ??
          computedFieldStates[Number(field.id)] ?? {
            hidden: false,
          };

        if (ft === "submit") {
          return {
            field_id: field.id,
            value: "Submitted",
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

        const rawVal =
          values[field.id] ??
          values[String(field.id)] ??
          values[Number(field.id)];

        let submitValue =
          typeof rawVal === "string"
            ? rawVal
            : rawVal !== undefined && rawVal !== null
              ? String(rawVal)
              : null;

        // Map option values (e.g. 'first_choice') to option labels (e.g. 'India') for select/dropdown/radio
        if (
          (ft === "select" ||
            ft === "dropdown" ||
            ft === "radio" ||
            ft === "radio_button") &&
          submitValue !== null
        ) {
          const opts = parseFieldOptions(field);
          const matchedOpt = opts.find(
            (o) =>
              String(o.value).toLowerCase() === submitValue.toLowerCase() ||
              String(o.label).toLowerCase() === submitValue.toLowerCase() ||
              String(o.id) === String(submitValue),
          );
          if (matchedOpt && matchedOpt.label) {
            submitValue = matchedOpt.label;
          }
        }

        let uploadedFile = null;
        if (ft === "file" || ft === "file_upload") {
          try {
            const parsed =
              typeof rawVal === "string" ? JSON.parse(rawVal) : rawVal;
            if (parsed && parsed.file_id) {
              uploadedFile = parsed.file_id;
              submitValue = parsed.filename || "";
            }
          } catch {
            // Not JSON, use as-is
          }
        }

        return {
          field_id: field.id,
          value:
            submitValue !== undefined &&
            submitValue !== null &&
            submitValue !== ""
              ? submitValue
              : null,
          uploaded_file: uploadedFile,
        };
      });
      if (onSubmit) {
        onSubmit({
          responses,
        });
      }
    },
    [isPreview, schemaFields, computedFieldStates, values, onSubmit],
  );
  return (
    <form
      onSubmit={handleSubmit}
      className="public-form-fields-layout"
      noValidate
    >
      {/* Preview mode banner */}
      {isPreview && (
        <div className="preview-mode-banner" role="alert">
          <Eye size={18} />
          <div>
            <strong>{t("publicFormRenderer.previewMode")}</strong>
            <p>{t("publicFormRenderer.youAreViewingThis")}</p>
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
          <p>{t("publicFormRenderer.noQuestionsHaveBeen")}</p>
        </div>
      ) : (
        schemaFields.map((field) => {
          const FieldComponent = getFieldComponent(field.field_type);
          if (!FieldComponent) return null;
          const state = computedFieldStates[field.id] || {
            hidden: false,
            required: !!field.required,
          };
          if (state.hidden) return null; // Do not render if hidden by rule

          // Dynamic field overrides for required state
          const dynamicField =
            state.required !== !!field.required
              ? {
                  ...field,
                  required: state.required,
                }
              : field;

          return (
            <div
              key={field.id}
              className="public-form-card"
            >
              <FieldComponent
                field={dynamicField}
                value={values[field.id]}
                onChange={(val) => handleChange(field.id, val)}
                error={errors[field.id]}
                disabled={isPreview}
              />
            </div>
          );
        })
      )}

      {/* Submit / Preview Button */}
      {schemaFields.length > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "0.25rem" }}>
          <SubmitButton
            isSubmitting={isSubmitting}
            disabled={isPreview}
            label={
              isPreview
                ? t("submitButton.submitDisabledPreview")
                : t("submitButton.submitResponse")
            }
          />
        </div>
      )}
    </form>
  );
}
