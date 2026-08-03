import React from 'react';
import { Settings, Plus, Trash2, Sliders, Layers, Layout, HelpCircle } from 'lucide-react';

export default function FieldProperties({ selectedField, onUpdateField }) {
  if (!selectedField) {
    return (
      <div className="builder-panel right-panel empty-properties">
        <div className="properties-guide font-muted">
          <Settings size={36} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h4>No Field Selected</h4>
          <p>Click on any field in the center canvas to configure its properties, options, and validation rules.</p>
        </div>
      </div>
    );
  }

  const handleChange = (key, value) => {
    onUpdateField(selectedField.id, { [key]: value });
  };

  const handleOptionChange = (index, key, value) => {
    const currentOptions = Array.isArray(selectedField.options) ? [...selectedField.options] : [];
    const targetOpt = typeof currentOptions[index] === 'object' ? { ...currentOptions[index] } : { optiontext: currentOptions[index], value: currentOptions[index] };
    targetOpt[key] = value;
    if (key === 'optiontext' && !targetOpt.value) {
      targetOpt.value = value.toLowerCase().replace(/\s+/g, '_');
    }
    currentOptions[index] = targetOpt;
    onUpdateField(selectedField.id, { options: currentOptions });
  };

  const handleAddOption = () => {
    const currentOptions = Array.isArray(selectedField.options) ? [...selectedField.options] : [];
    const newIdx = currentOptions.length + 1;
    currentOptions.push({
      optiontext: `Option ${newIdx}`,
      value: `option_${newIdx}`,
      display_order: newIdx,
    });
    onUpdateField(selectedField.id, { options: currentOptions });
  };

  const handleRemoveOption = (index) => {
    const currentOptions = Array.isArray(selectedField.options) ? [...selectedField.options] : [];
    currentOptions.splice(index, 1);
    onUpdateField(selectedField.id, { options: currentOptions });
  };

  const hasOptions = ['dropdown', 'radio', 'checkbox'].includes(selectedField.field_type);

  return (
    <div className="builder-panel right-panel">
      <div className="panel-header">
        <h3>Field Properties</h3>
        <span className="panel-subtitle">Editing: {selectedField.field_type.toUpperCase()}</span>
      </div>

      <div className="properties-content">
        {/* Label & Field Slug */}
        <div className="form-group">
          <label className="form-label" htmlFor="prop-label">Field Label</label>
          <input
            id="prop-label"
            type="text"
            className="form-input"
            value={selectedField.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="prop-field-name">Field Code Identifier (field_name)</label>
          <input
            id="prop-field-name"
            type="text"
            className="form-input"
            placeholder="e.g. email_address"
            value={selectedField.field_name || ''}
            onChange={(e) => handleChange('field_name', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
          />
        </div>

        {/* Placeholder */}
        {selectedField.field_type !== 'submit' && (
          <div className="form-group">
            <label className="form-label" htmlFor="prop-placeholder">Placeholder Text</label>
            <input
              id="prop-placeholder"
              type="text"
              className="form-input"
              value={selectedField.placeholder || ''}
              onChange={(e) => handleChange('placeholder', e.target.value)}
            />
          </div>
        )}

        {/* Help Text */}
        <div className="form-group">
          <label className="form-label" htmlFor="prop-help-text">Help / Description Subtext</label>
          <input
            id="prop-help-text"
            type="text"
            className="form-input"
            placeholder="Subtext shown below the label..."
            value={selectedField.help_text || ''}
            onChange={(e) => handleChange('help_text', e.target.value)}
          />
        </div>

        {/* Required Toggle */}
        <div className="form-group row-toggle">
          <label className="form-label" htmlFor="prop-required" style={{ cursor: 'pointer' }}>
            Required Field
          </label>
          <input
            id="prop-required"
            type="checkbox"
            className="toggle-checkbox"
            checked={!!selectedField.required}
            onChange={(e) => handleChange('required', e.target.checked)}
          />
        </div>

        {/* Layout Width */}
        <div className="form-group">
          <label className="form-label">Layout Width</label>
          <div className="width-btn-group">
            <button
              type="button"
              className={`width-btn ${(!selectedField.width || selectedField.width === 'full') ? 'active' : ''}`}
              onClick={() => handleChange('width', 'full')}
            >
              Full (100%)
            </button>
            <button
              type="button"
              className={`width-btn ${selectedField.width === 'half' ? 'active' : ''}`}
              onClick={() => handleChange('width', 'half')}
            >
              Half (50%)
            </button>
            <button
              type="button"
              className={`width-btn ${selectedField.width === 'third' ? 'active' : ''}`}
              onClick={() => handleChange('width', 'third')}
            >
              Third (33%)
            </button>
          </div>
        </div>

        {/* Dynamic Options Manager for Dropdown, Radio, Checkbox */}
        {hasOptions && (
          <div className="properties-section">
            <div className="section-title">
              <Layers size={16} color="var(--ledger)" />
              <span>Options List</span>
            </div>

            <div className="options-manager-list">
              {(selectedField.options || []).map((opt, idx) => {
                const optText = typeof opt === 'object' ? opt.optiontext : opt;
                return (
                  <div key={idx} className="option-row">
                    <input
                      type="text"
                      className="form-input option-input"
                      value={optText}
                      onChange={(e) => handleOptionChange(idx, 'optiontext', e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                    />
                    <button
                      type="button"
                      className="btn-card-icon danger"
                      onClick={() => handleRemoveOption(idx)}
                      title="Remove Option"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="btn-secondary font-sm"
              onClick={handleAddOption}
              style={{ marginTop: '0.75rem', width: '100%', justifyContent: 'center' }}
            >
              <Plus size={14} />
              <span>Add Choice Option</span>
            </button>
          </div>
        )}

        {/* Validation Rules Section */}
        <div className="properties-section">
          <div className="section-title">
            <Sliders size={16} color="var(--ledger)" />
            <span>Validation Rules</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prop-min-len">Minimum Length / Value</label>
            <input
              id="prop-min-len"
              type="number"
              className="form-input"
              placeholder="e.g. 1"
              value={selectedField.validation_conf?.min_length ?? selectedField.validation_conf?.min_value ?? ''}
              onChange={(e) =>
                handleChange('validation_conf', {
                  ...selectedField.validation_conf,
                  min_length: e.target.value ? Number(e.target.value) : null,
                  min_value: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prop-max-len">Maximum Length / Value</label>
            <input
              id="prop-max-len"
              type="number"
              className="form-input"
              placeholder="e.g. 255"
              value={selectedField.validation_conf?.max_length ?? selectedField.validation_conf?.max_value ?? ''}
              onChange={(e) =>
                handleChange('validation_conf', {
                  ...selectedField.validation_conf,
                  max_length: e.target.value ? Number(e.target.value) : null,
                  max_value: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
