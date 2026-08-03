import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  Globe,
  ExternalLink,
  Copy,
  Check,
  Eye,
  ArrowUpDown,
  Layers,
  Calendar,
  Clock,
  FileText,
  QrCode,
} from 'lucide-react';
import { getForms, getFormVersions } from '../services/formsApi';
import PublishedFormDetailModal from '../components/forms/PublishedFormDetailModal';
import PublicFormQRModal from '../components/forms/PublicFormQRModal';
import { safeCopyText } from '../utils/clipboard';

export default function PublishedFormsPage() {
  const [allForms, setAllForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [copiedId, setCopiedId] = useState(null);
  const [toast, setToast] = useState(null);
  const [detailFormId, setDetailFormId] = useState(null);
  const [qrForm, setQrForm] = useState(null);

  // Fetch all forms
  const loadForms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getForms(0, 200);
      setAllForms(data || []);
    } catch (err) {
      console.error('Error loading forms:', err);
      setError(err.message || 'Failed to load forms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  // Filter only published forms
  const publishedForms = useMemo(() => {
    let filtered = allForms.filter(
      (f) => f.status?.toLowerCase() === 'published'
    );

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.title?.toLowerCase().includes(q) ||
          f.description?.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case 'oldest':
        filtered.sort(
          (a, b) => new Date(a.createdat || 0) - new Date(b.createdat || 0)
        );
        break;
      case 'name-asc':
        filtered.sort((a, b) =>
          (a.title || '').localeCompare(b.title || '')
        );
        break;
      case 'name-desc':
        filtered.sort((a, b) =>
          (b.title || '').localeCompare(a.title || '')
        );
        break;
      case 'newest':
      default:
        filtered.sort(
          (a, b) => new Date(b.updatedat || b.createdat || 0) - new Date(a.updatedat || a.createdat || 0)
        );
        break;
    }

    return filtered;
  }, [allForms, searchQuery, sortBy]);

  const publishedCount = useMemo(
    () => allForms.filter((f) => f.status?.toLowerCase() === 'published').length,
    [allForms]
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getPublicUrl = (formId) =>
    `${window.location.origin}/#/public/forms/${formId}`;

  const handleOpenForm = (formId) => {
    window.open(getPublicUrl(formId), '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = (formId) => {
    const url = getPublicUrl(formId);
    safeCopyText(url).then(() => {
      setCopiedId(formId);
      setToast('✓ Public URL copied successfully.');
      setTimeout(() => setCopiedId(null), 2500);
      setTimeout(() => setToast(null), 3000);
    });
  };

  // Skeleton cards for loading state
  const SkeletonCard = () => (
    <div className="published-card published-card-skeleton">
      <div className="skeleton-line skeleton-heading" />
      <div className="skeleton-line skeleton-desc" />
      <div className="skeleton-line skeleton-desc" style={{ width: '60%' }} />
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <div className="skeleton-line" style={{ width: '80px', height: '24px' }} />
        <div className="skeleton-line" style={{ width: '100px', height: '24px' }} />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
        <div className="skeleton-line" style={{ width: '100%', height: '36px' }} />
      </div>
    </div>
  );

  return (
    <div className="published-forms-page">
      {/* Header */}
      <div className="header">
        <div className="header-title">
          <h1>Published Forms</h1>
          <p>
            View and manage all your live, publicly accessible forms.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="published-counter-badge">
            <Globe size={16} />
            <span>
              <strong>{publishedCount}</strong> Published
            </span>
          </div>
          <button
            className="btn-secondary"
            onClick={loadForms}
            disabled={loading}
            title="Refresh published forms"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="forms-controls-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search published forms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-dropdown-wrapper">
          <ArrowUpDown size={16} className="filter-icon" />
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name-asc">Name A → Z</option>
            <option value="name-desc">Name Z → A</option>
          </select>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          className="modal-error"
          style={{
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
          <button
            onClick={loadForms}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="published-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <SkeletonCard key={n} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && publishedForms.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <Globe size={36} />
          </div>
          <h3 className="empty-title">
            {searchQuery
              ? 'No Matching Published Forms'
              : 'No Published Forms Yet'}
          </h3>
          <p className="empty-description">
            {searchQuery
              ? 'Try adjusting your search query to find published forms.'
              : 'Publish a form from the Forms Portfolio to see it here.'}
          </p>
        </div>
      )}

      {/* Published Forms Grid */}
      {!loading && publishedForms.length > 0 && (
        <div className="published-grid">
          {publishedForms.map((form) => (
            <div key={form.id} className="published-card">
              <div className="published-card-header">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 className="published-card-title">{form.title}</h3>
                  <p className="published-card-desc">
                    {form.description || 'No description provided.'}
                  </p>
                </div>
                <span className="badge badge-success">Published</span>
              </div>

              <div className="published-card-meta">
                {form.current_version && (
                  <div className="meta-item" title="Published version">
                    <Layers size={14} />
                    <span>Version {form.current_version}</span>
                  </div>
                )}
                <div className="meta-item" title="Last updated">
                  <Clock size={14} />
                  <span>{formatDate(form.updatedat || form.createdat)}</span>
                </div>
              </div>

              <div className="published-card-actions">
                <button
                  className="btn-published-action btn-open"
                  onClick={() => handleOpenForm(form.id)}
                  title="Open live form in new tab"
                >
                  <ExternalLink size={15} />
                  <span>Open Form</span>
                </button>
                <button
                  className="btn-published-action btn-copy"
                  onClick={() => handleCopyLink(form.id)}
                  title="Copy public URL to clipboard"
                >
                  {copiedId === form.id ? (
                    <Check size={15} color="#10b981" />
                  ) : (
                    <Copy size={15} />
                  )}
                  <span>
                    {copiedId === form.id ? 'Copied!' : 'Copy Link'}
                  </span>
                </button>
                <button
                  className="btn-published-action btn-details"
                  onClick={() => setQrForm(form)}
                  title="Generate & View QR Code"
                >
                  <QrCode size={15} />
                  <span>QR Code</span>
                </button>
                <button
                  className="btn-published-action btn-details"
                  onClick={() => setDetailFormId(form.id)}
                  title="View form details"
                >
                  <Eye size={15} />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="published-toast" role="status" aria-live="polite">
          <Check size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Published Form Detail Modal */}
      <PublishedFormDetailModal
        isOpen={!!detailFormId}
        onClose={() => setDetailFormId(null)}
        formId={detailFormId}
      />

      {/* QR Code Modal */}
      <PublicFormQRModal
        isOpen={!!qrForm}
        onClose={() => setQrForm(null)}
        form={qrForm}
      />
    </div>
  );
}
