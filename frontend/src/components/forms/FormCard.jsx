import React from 'react';
import { Eye, Edit3, Wrench, Trash2, ExternalLink, Archive } from 'lucide-react';

export default function FormCard({ form, onView, onEdit, onBuild, onDelete, onArchive }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const fieldCount = form.fields_count ?? 
    (form.versions && form.versions.length > 0 && form.versions[0]?.fields ? form.versions[0].fields.length : 0);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return <span className="badge badge-success">Published</span>;
      case 'archived':
        return <span className="badge badge-archived">Archived</span>;
      case 'draft':
      default:
        return <span className="badge badge-draft">Draft</span>;
    }
  };

  return (
    <div className="form-card">
      <div className="form-card-header">
        <div style={{ flex: 1, paddingRight: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="mono-id">FORM-{form.id}</span>
            {getStatusBadge(form.status)}
          </div>
          <h3 className="form-card-title">{form.title}</h3>
        </div>
      </div>

      <p className="form-card-description">
        {form.description || 'No description provided.'}
      </p>

      {/* Condensed Single-Line Metadata Strip */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem', 
        fontSize: '0.8rem', 
        color: 'var(--text-muted)', 
        margin: '0.85rem 0',
        padding: '0.5rem 0',
        borderTop: '1px solid var(--rule)',
        borderBottom: '1px solid var(--rule)'
      }}>
        <span>{fieldCount} {fieldCount === 1 ? 'field' : 'fields'}</span>
        <span>•</span>
        <span>Updated {formatDate(form.updatedat)}</span>
      </div>

      {/* Compact Tertiary Icon-Button Cluster */}
      <div className="form-card-actions" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          {form.status?.toLowerCase() === 'published' && (
            <button
              className="btn-tertiary"
              onClick={() => window.open(`${window.location.origin}/forms/${form.id}`, '_blank', 'noopener,noreferrer')}
              title="Open Live Public Form"
            >
              <ExternalLink size={14} />
              <span>Public</span>
            </button>
          )}

          {onBuild && (
            <button
              className="btn-tertiary"
              onClick={() => onBuild(form)}
              title="Open Form Builder"
            >
              <Wrench size={14} />
              <span>Builder</span>
            </button>
          )}

          <button
            className="btn-tertiary"
            onClick={() => onView(form)}
            title="View Details"
          >
            <Eye size={14} />
            <span>View</span>
          </button>

          <button
            className="btn-tertiary"
            onClick={() => onEdit(form)}
            title="Edit Info"
          >
            <Edit3 size={14} />
            <span>Edit</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {form.status?.toLowerCase() !== 'archived' && onArchive && (
            <button
              className="btn-tertiary"
              onClick={() => onArchive(form)}
              title="Archive Form"
              style={{ color: '#f59e0b' }}
            >
              <Archive size={14} />
            </button>
          )}
          <button
            className="btn-destructive-subtle"
            onClick={() => onDelete(form)}
            title="Delete Form"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
