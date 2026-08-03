import React, { useState } from 'react';
import { Archive, X, Loader2, AlertTriangle } from 'lucide-react';
import { archiveForm } from '../../services/formsApi';

export default function ArchiveFormDialog({ isOpen, onClose, form, onFormArchived }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !form) return null;

  const handleArchive = async () => {
    try {
      setLoading(true);
      setError(null);
      await archiveForm(form.id);
      onFormArchived(form.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to archive form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={22} color="#f59e0b" />
            <h2 className="modal-title" style={{ color: '#f59e0b' }}>Archive Form</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} disabled={loading}>
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
            Are you sure you want to archive form <strong style={{ color: 'var(--ink)' }}>"{form.title}"</strong>?
          </p>

          <div
            style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '10px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <AlertTriangle size={18} color="#f59e0b" style={{ marginTop: '0.1rem', flexShrink: 0 }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Archiving will <strong>unpublish</strong> this form and <strong>stop accepting new submissions</strong>.
              Existing submissions and data will be preserved. You can view archived forms but they cannot receive new responses.
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
            className="btn-primary"
            onClick={handleArchive}
            disabled={loading}
            style={{ background: '#f59e0b', borderColor: '#f59e0b' }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Archiving...</span>
              </>
            ) : (
              <>
                <Archive size={18} />
                <span>Confirm Archive</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
