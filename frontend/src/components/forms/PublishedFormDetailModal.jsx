import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Globe,
  Calendar,
  Clock,
  User,
  Layers,
  ShieldCheck,
  Loader2,
  ExternalLink,
  Copy,
  Check,
  Eye,
  FileText,
  Hash,
} from 'lucide-react';
import { getFormById, getFormVersions } from '../../services/formsApi';
import { safeCopyText } from '../../utils/clipboard';

export default function PublishedFormDetailModal({ isOpen, onClose, formId }) {
  const [formData, setFormData] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchData = useCallback(async () => {
    if (!formId) return;
    setLoading(true);
    setError(null);
    try {
      const [form, vers] = await Promise.all([
        getFormById(formId),
        getFormVersions(formId).catch(() => []),
      ]);
      setFormData(form);
      setVersions(Array.isArray(vers) ? vers : []);
    } catch (err) {
      setError(err.message || 'Failed to load form details');
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    if (isOpen && formId) {
      fetchData();
      setCopied(false);
    }
  }, [isOpen, formId, fetchData]);

  if (!isOpen) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  const publicUrl = formId
    ? `${window.location.origin}/#/public/forms/${formId}`
    : '';

  const handleOpenForm = () => {
    if (publicUrl) {
      window.open(publicUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyLink = () => {
    if (!publicUrl) return;
    safeCopyText(publicUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Calculate field count from published version
  const publishedVersion = versions.find((v) => v.ispublished);
  const fieldCount =
    formData?.fields_count ??
    publishedVersion?.fields?.length ??
    null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="published-detail-title"
    >
      <div
        className="modal-content modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <Globe size={20} />
            </div>
            <div>
              <h2 id="published-detail-title" className="modal-title">
                Published Form Details
              </h2>
              <p
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  margin: 0,
                }}
              >
                Complete information about this published form
              </p>
            </div>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close details"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {loading && !formData && (
            <div
              style={{
                padding: '3rem 0',
                textAlign: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <Loader2
                size={32}
                className="animate-spin"
                style={{
                  margin: '0 auto 0.75rem auto',
                  color: 'var(--primary)',
                }}
              />
              <p>Loading form details...</p>
            </div>
          )}

          {error && !formData && (
            <div className="modal-error">{error}</div>
          )}

          {formData && (
            <div>
              {/* Title & Description */}
              <div
                style={{
                  marginBottom: '1.5rem',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '1.4rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {formData.title}
                  </h3>
                  <span className="badge badge-success">Published</span>
                </div>
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                  }}
                >
                  {formData.description ||
                    'No description provided for this form.'}
                </p>
              </div>

              {/* Detail Grid */}
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">
                    <ShieldCheck size={14} /> Current Published Version
                  </span>
                  <span className="detail-value highlight-active">
                    {formData.current_version
                      ? `Version ${formData.current_version}`
                      : 'N/A'}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">
                    <Calendar size={14} /> Published Date
                  </span>
                  <span className="detail-value">
                    {publishedVersion?.publishedat
                      ? formatDate(publishedVersion.publishedat)
                      : formatDate(formData.updatedat)}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">
                    <User size={14} /> Owner ID
                  </span>
                  <span className="detail-value">
                    {formData.owner_id}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">
                    <Calendar size={14} /> Created Date
                  </span>
                  <span className="detail-value">
                    {formatDate(formData.createdat)}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">
                    <Clock size={14} /> Updated Date
                  </span>
                  <span className="detail-value">
                    {formatDate(formData.updatedat)}
                  </span>
                </div>

                {fieldCount !== null && (
                  <div className="detail-item">
                    <span className="detail-label">
                      <Layers size={14} /> Number of Fields
                    </span>
                    <span className="detail-value">{fieldCount}</span>
                  </div>
                )}

                <div className="detail-item">
                  <span className="detail-label">
                    <Hash size={14} /> Number of Versions
                  </span>
                  <span className="detail-value">{versions.length}</span>
                </div>
              </div>

              {/* Public URL Box */}
              {publicUrl && (
                <div
                  style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(139, 92, 246, 0.06)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '10px',
                  }}
                >
                  <label
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      display: 'block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Public Form URL
                  </label>
                  <div
                    style={{
                      background: '#0f111a',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '0.6rem 0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: 'var(--primary)',
                        fontWeight: 500,
                        fontSize: '0.88rem',
                        wordBreak: 'break-all',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      {publicUrl}
                      <ExternalLink size={13} />
                    </a>
                  </div>

                  {/* Copy feedback */}
                  {copied && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#34d399',
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                      role="status"
                      aria-live="polite"
                    >
                      <Check size={14} />
                      ✓ Public URL copied successfully.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
          {formData && (
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
                {copied ? (
                  <Check size={16} color="#10b981" />
                ) : (
                  <Copy size={16} />
                )}
                {copied ? 'Copied!' : 'Copy Public URL'}
              </button>
            </>
          )}
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            style={{ marginLeft: 'auto' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
