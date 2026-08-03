import React, { useState, useEffect, useRef } from 'react';
import { Send, X, AlertCircle, Loader2, CheckCircle2, Copy, ExternalLink, Check, Globe } from 'lucide-react';
import { safeCopyText } from '../../utils/clipboard';

export default function PublishConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  version,
  isPublishing,
  formTitle,
  formId,
  onNavigateToPublished,
}) {
  const confirmBtnRef = useRef(null);
  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [publishTimestamp, setPublishTimestamp] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCopied(false);
      if (version?.ispublished) {
        setPublishedSuccess(true);
        setPublishTimestamp(version.publishedat ? new Date(version.publishedat).toLocaleString() : new Date().toLocaleString());
      } else {
        setPublishedSuccess(false);
        setPublishTimestamp(null);
      }
      setTimeout(() => {
        confirmBtnRef.current?.focus();
      }, 50);
    } else {
      setPublishedSuccess(false);
      setCopied(false);
    }
  }, [isOpen, version]);

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

  const effectiveFormId = formId || version.formid || version.form_id;
  const publicUrl = effectiveFormId ? `${window.location.origin}/#/public/forms/${effectiveFormId}` : '';

  const handlePublishClick = async () => {
    try {
      await onConfirm(version.version_number);
      setPublishedSuccess(true);
      setPublishTimestamp(new Date().toLocaleString());
    } catch (err) {
      // Error is handled by caller
    }
  };

  const handleCopyLink = () => {
    if (!publicUrl) return;
    safeCopyText(publicUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleOpenForm = () => {
    if (!publicUrl) return;
    window.open(publicUrl, '_blank', 'noopener,noreferrer');
  };

  const handleClose = () => {
    if (isPublishing) return;
    setPublishedSuccess(false);
    setCopied(false);
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleClose}
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
            <div className={`publish-modal-icon-badge ${publishedSuccess ? 'icon-badge-success' : ''}`}>
              {publishedSuccess ? <CheckCircle2 size={22} color="#10b981" /> : <Send size={20} />}
            </div>
            <div>
              <h2 id="publish-dialog-title" className="modal-title">
                {publishedSuccess ? '✓ Form Published Successfully' : `Publish Version ${version.version_number}?`}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                {formTitle || 'Form Version Management'}
              </p>
            </div>
          </div>
          <button
            className="modal-close-btn"
            onClick={handleClose}
            disabled={isPublishing}
            aria-label="Close publish dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {publishedSuccess ? (
            /* FEATURE 1, 2, 3, 4 & 5: PUBLISH SUCCESS DIALOG VIEW */
            <div className="publish-success-content">
              <div className="publish-success-card" style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.25)', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {formTitle || 'Form'}
                    </h3>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', alignItems: 'center' }}>
                      <span className="badge badge-sm" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
                        Version {version.version_number}
                      </span>
                      <span className="badge badge-success badge-sm">
                        Status: Published
                      </span>
                    </div>
                  </div>
                </div>

                {publishTimestamp && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                    <span>Published on: </span>
                    <strong style={{ color: 'var(--text-secondary)' }}>{publishTimestamp}</strong>
                  </div>
                )}
              </div>

              {/* Public URL Box */}
              {publicUrl && (
                <div className="public-url-section" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Shareable Public Link
                  </label>
                  <div className="public-url-box" style={{ background: '#0f111a', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '0.9rem', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
                      title="Click to open public form in new tab"
                    >
                      <span>{publicUrl}</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>

                  {/* Copy link success feedback */}
                  {copied && (
                    <div className="copy-feedback-banner" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }} role="status" aria-live="polite">
                      <Check size={14} />
                      <span>✓ Public URL copied successfully.</span>
                    </div>
                  )}

                  {/* Feature 4 & 5 Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                      onClick={handleOpenForm}
                    >
                      <ExternalLink size={16} />
                      <span>Open Form</span>
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                      onClick={handleCopyLink}
                    >
                      {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                      <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* FEATURE 6: DRAFT BEHAVIOUR (BEFORE PUBLISH) VIEW */
            <div className="publish-confirm-draft-content">
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
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={publishedSuccess ? { flexWrap: 'wrap', gap: '0.5rem' } : {}}>
          {publishedSuccess ? (
            <>
              <button
                type="button"
                className="btn-primary"
                onClick={handleOpenForm}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <ExternalLink size={16} />
                Open Form
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCopyLink}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              {onNavigateToPublished && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => { handleClose(); onNavigateToPublished(); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Globe size={16} />
                  View Published Forms
                </button>
              )}
              <button
                type="button"
                className="btn-secondary"
                onClick={handleClose}
                style={{ marginLeft: 'auto' }}
              >
                Close
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleClose}
                disabled={isPublishing}
              >
                Cancel
              </button>
              <button
                ref={confirmBtnRef}
                type="button"
                className="btn-primary btn-publish-confirm"
                onClick={handlePublishClick}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
