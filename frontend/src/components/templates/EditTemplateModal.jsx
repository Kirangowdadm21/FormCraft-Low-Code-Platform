import React, { useState, useEffect } from 'react';
import { X, Edit3, Plus, Trash2, Loader2, Layers } from 'lucide-react';
import { updateTemplate } from '../../services/templatesApi';

const FIELD_TYPES = [
  { label: 'Text Input', value: 'text' },
  { label: 'Text Area', value: 'textarea' },
  { label: 'Number', value: 'number' },
  { label: 'Dropdown Select', value: 'select' },
  { label: 'Checkboxes', value: 'checkbox' },
  { label: 'Radio Buttons', value: 'radio' },
  { label: 'Date Picker', value: 'date' },
  { label: 'Rating Scale', value: 'rating' },
  { label: 'File Upload', value: 'file_upload' },
];

export default function EditTemplateModal({ isOpen, onClose, template, onTemplateUpdated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (template) {
      setTitle(template.title || '');
      setDescription(template.description || '');
      setFields(
        (template.fields || []).map((f) => ({
          label: f.label || '',
          field_name: f.field_name || '',
          field_type: f.field_type || 'text',
          placeholder: f.placeholder || '',
          required: !!f.required,
          display_order: f.display_order || 1,
        }))
      );
      setError(null);
    }
  }, [template]);

  if (!isOpen || !template) return null;

  const handleAddField = () => {
    const fieldIndex = fields.length + 1;
    setFields([
      ...fields,
      {
        label: `Field ${fieldIndex}`,
        field_name: `field_${fieldIndex}`,
        field_type: 'text',
        placeholder: '',
        required: false,
        display_order: fieldIndex,
      },
    ]);
  };

  const handleRemoveField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index, key, value) => {
    setFields(
      fields.map((f, i) => {
        if (i !== index) return f;
        const updated = { ...f, [key]: value };
        if (key === 'label' && (!f.field_name || f.field_name.startsWith('field_'))) {
          updated.field_name = value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
        }
        return updated;
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Template Name is required');
      return;
    }

    // Validate fields
    for (let i = 0; i < fields.length; i++) {
      if (!fields[i].label.trim()) {
        setError(`Field #${i + 1} requires a display label`);
        return;
      }
      if (!fields[i].field_name.trim()) {
        setError(`Field #${i + 1} requires a field name (slug)`);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const updatePayload = {
        title: title.trim(),
        description: description.trim() || null,
        fields: fields.map((f, idx) => ({
          ...f,
          display_order: idx + 1,
          placeholder: f.placeholder?.trim() || null,
        })),
      };

      const updatedTemplate = await updateTemplate(template.id, updatePayload);
      onTemplateUpdated(updatedTemplate);
      onClose();
    } catch (err) {
      console.error('Edit template error:', err);
      setError(err.message || 'Failed to update template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '680px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Edit3 size={20} color="var(--ledger)" />
            <h2 className="modal-title">Edit Template</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
            {error && <div className="modal-error">{error}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="edit-template-title">
                Template Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="edit-template-title"
                type="text"
                className="form-input"
                placeholder="Template title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-template-description">
                Description
              </label>
              <textarea
                id="edit-template-description"
                className="form-textarea"
                rows={3}
                placeholder="Template description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Fields editor */}
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--rule)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)' }}>
                    Template Fields ({fields.length})
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Modify question schema for this template.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleAddField}
                  disabled={loading}
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
                >
                  <Plus size={14} />
                  <span>Add Field</span>
                </button>
              </div>

              {fields.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--field)', borderRadius: '8px', border: '1px dashed var(--rule)' }}>
                  <Layers size={24} style={{ margin: '0 auto 0.5rem auto', color: 'var(--text-muted)', opacity: 0.6 }} />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    No fields configured. Click <strong>"Add Field"</strong> to add questions.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {fields.map((field, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--paper)',
                        border: '1px solid var(--rule)',
                        borderRadius: '8px',
                        padding: '0.85rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.65rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="mono-id" style={{ fontSize: '0.72rem' }}>
                          Field #{idx + 1}
                        </span>
                        <button
                          type="button"
                          className="btn-destructive-subtle"
                          onClick={() => handleRemoveField(idx)}
                          disabled={loading}
                          title="Remove field"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.78rem' }}>
                            Label <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            style={{ fontSize: '0.85rem', padding: '0.4rem 0.65rem' }}
                            placeholder="e.g. Full Name"
                            value={field.label}
                            onChange={(e) => handleFieldChange(idx, 'label', e.target.value)}
                            disabled={loading}
                          />
                        </div>

                        <div>
                          <label className="form-label" style={{ fontSize: '0.78rem' }}>
                            Field Name (Slug) <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            style={{ fontSize: '0.85rem', padding: '0.4rem 0.65rem', fontFamily: 'monospace' }}
                            placeholder="full_name"
                            value={field.field_name}
                            onChange={(e) => handleFieldChange(idx, 'field_name', e.target.value)}
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.65rem', alignItems: 'flex-end' }}>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.78rem' }}>
                            Field Type
                          </label>
                          <select
                            className="filter-select"
                            style={{ width: '100%', fontSize: '0.85rem', padding: '0.4rem 0.65rem' }}
                            value={field.field_type}
                            onChange={(e) => handleFieldChange(idx, 'field_type', e.target.value)}
                            disabled={loading}
                          >
                            {FIELD_TYPES.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="form-label" style={{ fontSize: '0.78rem' }}>
                            Placeholder
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            style={{ fontSize: '0.85rem', padding: '0.4rem 0.65rem' }}
                            placeholder="Optional placeholder..."
                            value={field.placeholder || ''}
                            onChange={(e) => handleFieldChange(idx, 'placeholder', e.target.value)}
                            disabled={loading}
                          />
                        </div>

                        <div style={{ paddingBottom: '0.35rem' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => handleFieldChange(idx, 'required', e.target.checked)}
                              disabled={loading}
                            />
                            <span>Required</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Edit3 size={18} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
