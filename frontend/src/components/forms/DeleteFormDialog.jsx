import React, { useState } from 'react';
import { AlertTriangle, X, Loader2, Trash2 } from 'lucide-react';
import { deleteForm } from '../../services/formsApi';

export default function DeleteFormDialog({ isOpen, onClose, form, onFormDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !form) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      await deleteForm(form.id);
      onFormDeleted(form.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete form');
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
            <h2 className="modal-title" style={{ color: '#ef4444' }}>Delete Form</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="modal-error">
              {error}
            </div>
          )}

          <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '1rem', lineHeight: '1.5' }}>
            Are you sure you want to delete form <strong style={{ color: '#f8fafc' }}>"{form.title}"</strong>?
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.4' }}>
            This action cannot be undone. All fields, versions, and associated submission data will be permanently removed.
          </p>
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
