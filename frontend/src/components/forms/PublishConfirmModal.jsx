import React, { useEffect, useRef } from 'react';
import { Send, X, AlertCircle, Loader2 } from 'lucide-react';

export default function PublishConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  version,
  isPublishing,
  formTitle,
}) {
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        confirmBtnRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isPublishing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPublishing, onClose]);

  if (!isOpen || !version) return null;

  return (
    <div
      className="modal-overlay"
      onClick={() => !isPublishing && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-dialog-title"
    >
      <div
        className="modal-content modal-md publish-confirm-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="publish-modal-icon-badge">
              <Send size={20} />
            </div>
            <div>
              <h2 id="publish-dialog-title" className="modal-title">
                Publish Version {version.version_number}?
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                {formTitle || 'Form Version Management'}
              </p>
            </div>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            disabled={isPublishing}
            aria-label="Close publish dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="publish-confirm-alert">
            <AlertCircle size={20} className="publish-alert-icon" />
            <div className="publish-alert-text">
              <strong>This version will become the active version.</strong>
              <p>
                Publishing Version {version.version_number} will mark it as the default live version
                used for respondent submissions.
              </p>
            </div>
          </div>

          <div className="publish-version-summary-box">
            <div className="summary-row">
              <span className="summary-label">Target Version:</span>
              <span className="summary-value highlight">v{version.version_number}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Total Fields:</span>
              <span className="summary-value">{version.fields ? version.fields.length : 0} fields</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Current Status:</span>
              <span className={`badge ${version.ispublished ? 'badge-success' : 'badge-draft'}`}>
                {version.ispublished ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={isPublishing}
          >
            Cancel
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            className="btn-primary btn-publish-confirm"
            onClick={() => onConfirm(version.version_number)}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Publish</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
