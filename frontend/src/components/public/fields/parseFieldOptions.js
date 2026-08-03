/**
 * Normalizes options for Dropdown, Radio, and Checkbox field types.
 * Handles objects, arrays of strings, comma-separated strings, and JSON strings.
 */
export function parseFieldOptions(field) {
  if (!field) return [];

  let raw = field.options;
  if (!raw && field.field_options) raw = field.field_options;
  if (!raw && field.validation_conf && field.validation_conf.options) {
    raw = field.validation_conf.options;
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        raw = JSON.parse(trimmed);
      } catch {
        raw = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
      }
    } else {
      raw = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }

  if (!Array.isArray(raw)) return [];

  return raw.map((opt, idx) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return {
        id: idx,
        value: String(opt),
        label: String(opt),
      };
    }
    if (typeof opt === 'object' && opt !== null) {
      const lbl = opt.optiontext ?? opt.label ?? opt.text ?? opt.value ?? `Option ${idx + 1}`;
      const val = (opt.value !== undefined && opt.value !== null && String(opt.value) !== '')
        ? String(opt.value)
        : String(lbl);
      return {
        id: opt.id ?? idx,
        value: val,
        label: String(lbl),
      };
    }
    return {
      id: idx,
      value: `Option ${idx + 1}`,
      label: `Option ${idx + 1}`,
    };
  });
}
