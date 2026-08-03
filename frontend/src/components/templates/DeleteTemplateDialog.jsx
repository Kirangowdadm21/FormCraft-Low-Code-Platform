import React, { useState } from 'react';
import { AlertTriangle, X, Loader2, Trash2 } from 'lucide-react';
import { deleteTemplate } from '../../services/templatesApi';

export default function DeleteTemplateDialog({ isOpen, onClose, template, onTemplateDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !template) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      await deleteTemplate(template.id);
      onTemplateDeleted(template.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={22} color="#ef4444" />
            <h2 className="modal-title" style={{ color: '#ef4444' }}>Delete Template</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.5rem' }}>
          {error && (
            <div className="modal-error">
              {error}
            </div>
          )}

          <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '1rem', lineHeight: '1.5' }}>
            Are you sure you want to delete template <strong style={{ color: 'var(--ink)' }}>"{template.title}"</strong>?
          </p>

          <div
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '10px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <AlertTriangle size={18} color="#ef4444" style={{ marginTop: '0.1rem', flexShrink: 0 }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              <strong style={{ color: '#ef4444' }}>⚠ This action cannot be undone.</strong> The template schema and its field definitions will be permanently removed.
            </div>
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
          <button
            type="button"
            className="btn-danger"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={18} />
                <span>Confirm Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
