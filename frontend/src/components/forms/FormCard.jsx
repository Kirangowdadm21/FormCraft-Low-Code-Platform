import React from 'react';
import { Eye, Edit3, Wrench, Trash2, Calendar, Clock, Layers } from 'lucide-react';

export default function FormCard({ form, onView, onEdit, onBuild, onDelete }) {
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

  // Determine field count if versions or fields are returned
  const fieldCount = form.fields_count ?? 
    (form.versions && form.versions.length > 0 && form.versions[0]?.fields ? form.versions[0].fields.length : null);

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
          <h3 className="form-card-title">{form.title}</h3>
          <p className="form-card-description">
            {form.description || 'No description provided.'}
          </p>
        </div>
        <div>{getStatusBadge(form.status)}</div>
      </div>

      <div className="form-card-meta">
        <div className="meta-item" title="Created date">
          <Calendar size={14} />
          <span>Created {formatDate(form.createdat)}</span>
        </div>
        <div className="meta-item" title="Updated date">
          <Clock size={14} />
          <span>Updated {formatDate(form.updatedat)}</span>
        </div>
        {fieldCount !== null && (
          <div className="meta-item" title="Fields count">
            <Layers size={14} />
            <span>{fieldCount} {fieldCount === 1 ? 'field' : 'fields'}</span>
          </div>
        )}
      </div>

      <div className="form-card-actions">
        {onBuild && (
          <button
            className="btn-card-action edit"
            onClick={() => onBuild(form)}
            title="Open Drag and Drop Form Builder"
            style={{ borderColor: 'rgba(139, 92, 246, 0.4)', color: '#a78bfa' }}
          >
            <Wrench size={15} />
            <span>Builder</span>
          </button>
        )}

        <button
          className="btn-card-action view"
          onClick={() => onView(form)}
          title="View Form Details"
        >
          <Eye size={16} />
          <span>View</span>
        </button>

        <button
          className="btn-card-action edit"
          onClick={() => onEdit(form)}
          title="Edit Form Info"
        >
          <Edit3 size={16} />
          <span>Edit</span>
        </button>

        <button
          className="btn-card-action delete"
          onClick={() => onDelete(form)}
          title="Delete Form"
        >
          <Trash2 size={16} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}
