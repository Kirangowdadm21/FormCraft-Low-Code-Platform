import React, { useEffect } from 'react';
import { X, Eye } from 'lucide-react';
import PublicFormRenderer from '../../public/PublicFormRenderer';

export default function FormPreviewModal({ isOpen, onClose, form, fields }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
    >
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Eye size={20} color="var(--primary)" />
            <h2 id="preview-modal-title" className="modal-title">Form Live Preview</h2>
          </div>
          <span className="badge badge-success">Respondent View</span>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close preview dialog"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ background: '#0a0c14' }}>
          <div className="preview-form-card">
            {/* Form Title & Description */}
            <div className="preview-form-header">
              <h1 className="preview-title">{form?.title || 'Untitled Form'}</h1>
              <p className="preview-desc">
                {form?.description || 'Please fill out all required fields below.'}
              </p>
            </div>

            {/* Reuse PublicFormRenderer in preview mode */}
            <PublicFormRenderer
              fields={fields || []}
              isPreview={true}
              isSubmitting={false}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
