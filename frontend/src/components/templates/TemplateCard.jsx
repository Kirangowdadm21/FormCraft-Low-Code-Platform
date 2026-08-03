import React from 'react';
import { Eye, Edit3, Sparkles, Trash2, Layers } from 'lucide-react';

export default function TemplateCard({ template, onPreview, onUse, onEdit, onDelete }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const fieldCount = template.fields ? template.fields.length : 0;

  return (
    <div className="form-card">
      <div className="form-card-header">
        <div style={{ flex: 1, paddingRight: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="mono-id">TPL-{template.id}</span>
            <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Layers size={11} />
              {fieldCount} {fieldCount === 1 ? 'field' : 'fields'}
            </span>
          </div>
          <h3 className="form-card-title">{template.title}</h3>
        </div>
      </div>

      <p className="form-card-description">
        {template.description || 'No description provided for this template.'}
      </p>

      {/* Condensed Single-Line Metadata Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          margin: '0.85rem 0',
          padding: '0.5rem 0',
          borderTop: '1px solid var(--rule)',
          borderBottom: '1px solid var(--rule)',
        }}
      >
        <span>Created {formatDate(template.createdat)}</span>
        <span>•</span>
        <span>Updated {formatDate(template.updatedat)}</span>
      </div>

      {/* Compact Action Cluster */}
      <div className="form-card-actions" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          <button
            className="btn-primary"
            onClick={() => onUse(template)}
            title="Use Template to create a new form"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
          >
            <Sparkles size={14} />
            <span>Use</span>
          </button>

          <button
            className="btn-tertiary"
            onClick={() => onPreview(template)}
            title="Preview Template details & schema"
          >
            <Eye size={14} />
            <span>Preview</span>
          </button>

          <button
            className="btn-tertiary"
            onClick={() => onEdit(template)}
            title="Edit Template"
          >
            <Edit3 size={14} />
            <span>Edit</span>
          </button>
        </div>

        <button
          className="btn-destructive-subtle"
          onClick={() => onDelete(template)}
          title="Delete Template"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
