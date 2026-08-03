import React from 'react';
import { X, GitBranch, AlertCircle, Loader2 } from 'lucide-react';

export default function SaveVersionModal({
  isOpen,
  onClose,
  onConfirm,
  currentVersionNumber,
  nextVersionNumber,
  saving,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="version-detail-icon">
              <GitBranch size={18} />
            </div>
            <h2 className="modal-title">Create Version {nextVersionNumber}?</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} disabled={saving}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.25rem 1.5rem' }}>
          <div
            style={{
              background: 'rgba(139, 92, 246, 0.08)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              borderRadius: '10px',
              padding: '1rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <AlertCircle size={20} color="var(--primary)" style={{ marginTop: '0.1rem', flexShrink: 0 }} />
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
              {currentVersionNumber === 0 ? (
                <>
                  This will save your form fields as <strong>Version 1</strong>.
                  <br />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Your form currently has no saved versions. This creates the first one.
                  </span>
                </>
              ) : (
                <>
                  Saving these changes will generate a <strong>new version (v{nextVersionNumber})</strong>.
                  <br />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Version {currentVersionNumber} will remain completely unchanged in your version timeline history.
                  </span>
                </>
              )}
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            All current field configurations, labels, options, and rules will be stored under Version {nextVersionNumber}.
          </p>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={onConfirm} disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Creating Version {nextVersionNumber}...</span>
              </>
            ) : (
              <>
                <GitBranch size={16} />
                <span>Confirm & Create Version {nextVersionNumber}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
