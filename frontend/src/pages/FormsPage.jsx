import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Search, Filter, RefreshCw, Loader2, AlertCircle, FileText } from 'lucide-react';
import { getForms, getFormVersions } from '../services/formsApi';
import { getSubmissions } from '../services/responsesApi';
import { useAuth } from '../context/AuthContext';
import FormsList from '../components/forms/FormsList';
import CreateFormModal from '../components/forms/CreateFormModal';
import EditFormModal from '../components/forms/EditFormModal';
import DeleteFormDialog from '../components/forms/DeleteFormDialog';
import ArchiveFormDialog from '../components/forms/ArchiveFormDialog';
import FormDetailModal from '../components/forms/FormDetailModal';
import FormBuilder from '../components/forms/builder/FormBuilder';

export default function FormsPage({ onNavigateToPublished }) {
  const { user } = useAuth();
  const [forms, setForms] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal visibility and builder view state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [deletingForm, setDeletingForm] = useState(null);
  const [archivingForm, setArchivingForm] = useState(null);
  const [viewingFormId, setViewingFormId] = useState(null);
  const [buildingFormId, setBuildingFormId] = useState(null);
  const [buildingVersionId, setBuildingVersionId] = useState(null);
  const [notification, setNotification] = useState(null);

  // Relative time formatter for live audit logs
  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      if (diffMs < 0) return 'Just now';
      const diffSecs = Math.floor(diffMs / 1000);
      if (diffSecs < 60) return `${diffSecs}s ago`;
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  // Generate real live audit logs from real forms & submissions database
  const generateAuditLogs = useCallback(async (formsList) => {
    try {
      const logs = [];
      const subList = await getSubmissions(null, 0, 20).catch(() => []);

      // Build version -> form title lookup
      const versionToTitle = {};
      if (formsList && formsList.length > 0) {
        await Promise.all(
          formsList.map(async (form) => {
            try {
              const vers = await getFormVersions(form.id);
              if (vers) {
                vers.forEach((v) => {
                  versionToTitle[v.id] = form.title;
                });
              }
            } catch {
              // ignore per-form error
            }
          })
        );
      }

      // 1. Add real submission logs
      (subList || []).forEach((sub) => {
        const title = versionToTitle[sub.form_version] || 'Form';
        const valsCount = sub.response_values ? sub.response_values.length : 0;
        logs.push({
          id: `SUB-${sub.id}`,
          title: 'New Submission Logged',
          description: `${valsCount} field values captured for "${title}".`,
          timestamp: sub.submitted_at || sub.started_at,
        });
      });

      // 2. Add real form logs (creation, publication, metadata updates)
      (formsList || []).forEach((form) => {
        const isPub = form.status?.toLowerCase() === 'published';
        logs.push({
          id: isPub ? `PUB-${form.id}` : `FRM-${form.id}`,
          title: isPub ? 'Form Published' : 'Form Created',
          description: `"${form.title}" is ${form.status || 'draft'} (v${form.current_version || 1}).`,
          timestamp: form.updatedat || form.createdat,
        });
      });

      // Sort logs descending by timestamp
      logs.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

      setAuditLogs(logs.slice(0, 10));
    } catch (err) {
      console.error('Error generating audit logs:', err);
    }
  }, []);

  // Fetch forms from backend API
  const loadForms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getForms(0, 100);
      const formArray = data || [];
      setForms(formArray);
      generateAuditLogs(formArray);
    } catch (err) {
      console.error('Error loading forms:', err);
      setError(err.message || 'Failed to load forms from backend');
    } finally {
      setLoading(false);
    }
  }, [generateAuditLogs]);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  // Handlers for mutations
  const handleFormCreated = (newForm) => {
    setForms((prev) => [newForm, ...prev]);
    loadForms();
  };

  const handleFormUpdated = (updatedForm) => {
    setForms((prev) =>
      prev.map((f) => (f.id === updatedForm.id ? updatedForm : f))
    );
    loadForms();
  };

  const handleFormDeleted = (deletedId) => {
    setForms((prev) => prev.filter((f) => f.id !== deletedId));
    setNotification({ msg: 'Form deleted successfully.', type: 'success' });
    setTimeout(() => setNotification(null), 4000);
    loadForms();
  };

  const handleFormArchived = (archivedId) => {
    setForms((prev) =>
      prev.map((f) => (f.id === archivedId ? { ...f, status: 'archived' } : f))
    );
    setNotification({ msg: 'Form archived successfully.', type: 'success' });
    setTimeout(() => setNotification(null), 4000);
    loadForms();
  };

  // Filtered forms based on search and status
  const filteredForms = useMemo(() => {
    return forms.filter((form) => {
      const matchesSearch =
        form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (form.description && form.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'ALL' ||
        form.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [forms, searchQuery, statusFilter]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = forms.length;
    const published = forms.filter((f) => f.status?.toLowerCase() === 'published').length;
    const draft = forms.filter((f) => f.status?.toLowerCase() === 'draft' || !f.status).length;
    return { total, published, draft };
  }, [forms]);

  // If a form is selected for drag-and-drop building, render FormBuilder view
  if (buildingFormId) {
    return (
      <FormBuilder
        formId={buildingFormId}
        initialVersionId={buildingVersionId}
        onBack={() => {
          setBuildingFormId(null);
          setBuildingVersionId(null);
          loadForms();
        }}
        onNavigateToPublished={onNavigateToPublished}
      />
    );
  }

  return (
    <div className="forms-page-container">
      {/* Page Header */}
      <div className="header">
        <div className="header-title">
          <h1>Forms Dashboard</h1>
          <p>Manage, create, edit, and view your form schemas using backend APIs.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn-secondary"
            onClick={loadForms}
            disabled={loading}
            title="Reload forms"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            className="btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={18} />
            <span>Create Form</span>
          </button>
        </div>
      </div>

      {/* Summary Stats Strip */}
      <div className="forms-stats-strip">
        <div className="stat-pill">
          <FileText size={16} color="var(--ink)" />
          <span>Total Forms: <strong>{stats.total}</strong></span>
        </div>
        <div className="stat-pill">
          <span className="badge badge-success">Published</span>
          <span><strong>{stats.published}</strong></span>
        </div>
        <div className="stat-pill">
          <span className="badge badge-draft">Drafts</span>
          <span><strong>{stats.draft}</strong></span>
        </div>
      </div>

      {/* Controls Bar: Search & Filter */}
      <div className="forms-controls-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search forms by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-dropdown-wrapper">
          <Filter size={16} className="filter-icon" />
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="modal-error" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
          <button
            onClick={loadForms}
            style={{ marginLeft: 'auto', background: 'none', border: 'underline', color: 'inherit', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* 2-Column Responsive Layout: Grid + Activity Rail */}
      <div className="forms-portfolio-layout">
        <div>
          {/* Loading indicator */}
          {loading && (
            <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: 'var(--ledger)' }} />
              <p style={{ fontSize: '0.95rem' }}>Fetching forms from API...</p>
            </div>
          )}

          {/* Forms Grid List */}
          {!loading && (
            <FormsList
              forms={filteredForms}
              onView={(form) => setViewingFormId(form.id)}
              onEdit={(form) => setEditingForm(form)}
              onBuild={(form) => setBuildingFormId(form.id)}
              onDelete={(form) => setDeletingForm(form)}
              onArchive={(form) => setArchivingForm(form)}
              onCreateClick={() => setIsCreateModalOpen(true)}
            />
          )}
        </div>

        {/* Right Rail: System Activity & Live Audit Log */}
        <div className="activity-rail">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--rule)' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink)' }}>
              Platform Audit Rail
            </span>
            <span className="mono-id" style={{ fontSize: '0.7rem' }}>LIVE</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {auditLogs.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No recent activity logged.
              </div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="activity-item">
                  <span className="mono-id" style={{ height: 'fit-content', marginTop: '2px', fontSize: '0.72rem' }}>
                    {log.id}
                  </span>
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '0.85rem' }}>{log.title}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '1px' }}>{log.description}</p>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                      {formatRelativeTime(log.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Form Modal */}
      <CreateFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onFormCreated={handleFormCreated}
        ownerId={user?.id || 1}
      />

      {/* Edit Form Modal */}
      <EditFormModal
        isOpen={!!editingForm}
        onClose={() => setEditingForm(null)}
        form={editingForm}
        onFormUpdated={handleFormUpdated}
      />

      {/* Delete Form Dialog */}
      <DeleteFormDialog
        isOpen={!!deletingForm}
        onClose={() => setDeletingForm(null)}
        form={deletingForm}
        onFormDeleted={handleFormDeleted}
      />

      {/* View Form Detail Modal */}
      <FormDetailModal
        isOpen={!!viewingFormId}
        onClose={() => setViewingFormId(null)}
        formId={viewingFormId}
        onNavigateToPublished={onNavigateToPublished}
        onEditVersion={(form, version) => {
          setViewingFormId(null);
          setBuildingFormId(form.id);
          setBuildingVersionId(version.id);
        }}
      />

      {/* Archive Form Dialog */}
      <ArchiveFormDialog
        isOpen={!!archivingForm}
        onClose={() => setArchivingForm(null)}
        form={archivingForm}
        onFormArchived={handleFormArchived}
      />

      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          <span>{notification.msg}</span>
        </div>
      )}
    </div>
  );
}
