import React from 'react';
import { X, Eye, Sparkles, Layers, CheckCircle2 } from 'lucide-react';

export default function PreviewTemplateModal({ isOpen, onClose, template, onUseTemplate }) {
  if (!isOpen || !template) return null;

  const fields = template.fields || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Eye size={20} color="var(--ledger)" />
            <h2 className="modal-title">Template Preview</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Header Info */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="mono-id">TPL-{template.id}</span>
              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Layers size={12} />
                {fields.length} {fields.length === 1 ? 'Field' : 'Fields'}
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', margin: '0.25rem 0' }}>
              {template.title}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: '1.5' }}>
              {template.description || 'No description provided for this template.'}
            </p>
          </div>

          {/* Fields Schema List */}
          <div style={{ borderTop: '1px solid var(--rule)', paddingTop: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Field Schema ({fields.length})
            </h4>

            {fields.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', background: 'var(--field)', borderRadius: '8px', border: '1px dashed var(--rule)' }}>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  This template does not contain pre-configured fields.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {fields.map((field, idx) => (
                  <div
                    key={field.id || idx}
                    style={{
                      background: 'var(--paper)',
                      border: '1px solid var(--rule)',
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--ink)' }}>
                          {field.label}
                        </span>
                        {field.required && (
                          <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 700 }}>
                            * Required
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <span className="mono-id">{field.field_name}</span>
                        {field.placeholder && (
                          <span>Placeholder: "{field.placeholder}"</span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        className="badge"
                        style={{
                          textTransform: 'uppercase',
                          fontSize: '0.7rem',
                          letterSpacing: '0.04em',
                          background: 'var(--field)',
                          color: 'var(--ink)',
                          border: '1px solid var(--rule)',
                        }}
                      >
                        {field.field_type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              onClose();
              onUseTemplate(template);
            }}
          >
            <Sparkles size={16} />
            <span>Use Template</span>
          </button>
        </div>
      </div>
    </div>
  );
}
