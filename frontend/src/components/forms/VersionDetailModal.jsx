import React from 'react';
import {
  X,
  Eye,
  Calendar,
  Clock,
  Layers,
  CheckCircle2,
  FileText,
  Hash,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function VersionDetailModal({ isOpen, onClose, version, currentVersion }) {
  if (!isOpen || !version) return null;

  const isActive = currentVersion && version.version_number === currentVersion;

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

  const fieldCount = version.fields ? version.fields.length : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="version-detail-icon">
              <Eye size={18} />
            </div>
            <div>
              <h2 className="modal-title" style={{ marginBottom: '0.15rem' }}>
                Version {version.version_number}
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Complete version details
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Status Badges Row */}
          <div className="version-detail-badges">
            <span
              className={`badge ${version.ispublished ? 'badge-success' : 'badge-draft'}`}
            >
              {version.ispublished ? (
                <>
                  <CheckCircle2 size={12} /> Published
                </>
              ) : (
                'Draft'
              )}
            </span>
            {isActive && (
              <span className="badge badge-active-glow">
                <Zap size={12} /> Active
              </span>
            )}
          </div>

          {/* Info Grid */}
          <div className="version-detail-grid">
            <div className="version-detail-cell">
              <span className="version-detail-label">
                <Hash size={14} /> Version Number
              </span>
              <span className="version-detail-value">v{version.version_number}</span>
            </div>

            <div className="version-detail-cell">
              <span className="version-detail-label">
                <ShieldCheck size={14} /> Status
              </span>
              <span className="version-detail-value">
                {version.ispublished ? 'Published' : 'Draft'}
              </span>
            </div>

            <div className="version-detail-cell">
              <span className="version-detail-label">
                <Calendar size={14} /> Created Date
              </span>
              <span className="version-detail-value">{formatDate(version.createdat)}</span>
            </div>

            <div className="version-detail-cell">
              <span className="version-detail-label">
                <Clock size={14} /> Updated Date
              </span>
              <span className="version-detail-value">{formatDate(version.updatedat)}</span>
            </div>

            {version.publishedat && (
              <div className="version-detail-cell">
                <span className="version-detail-label">
                  <CheckCircle2 size={14} /> Published Date
                </span>
                <span className="version-detail-value">
                  {formatDate(version.publishedat)}
                </span>
              </div>
            )}

            <div className="version-detail-cell">
              <span className="version-detail-label">
                <Layers size={14} /> Field Count
              </span>
              <span className="version-detail-value">{fieldCount} field{fieldCount !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Fields Listing */}
          <div className="version-detail-fields-section">
            <h4 className="version-detail-fields-heading">
              <FileText size={16} color="var(--primary)" />
              Fields in This Version
            </h4>

            {fieldCount === 0 ? (
              <div className="version-detail-empty-fields">
                <Layers size={28} style={{ opacity: 0.3 }} />
                <p>No fields have been added to this version yet.</p>
              </div>
            ) : (
              <div className="version-detail-fields-list">
                {version.fields.map((field, idx) => (
                  <div className="version-detail-field-row" key={field.id || idx}>
                    <span className="version-field-order">{idx + 1}</span>
                    <div className="version-field-info">
                      <span className="version-field-label">{field.label || 'Untitled Field'}</span>
                      <span className="version-field-meta">
                        <span className="version-field-type-badge">{field.field_type}</span>
                        {field.required && <span className="version-field-required">Required</span>}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
