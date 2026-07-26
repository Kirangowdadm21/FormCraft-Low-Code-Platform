import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Search, Filter, RefreshCw, Loader2, AlertCircle, FileText } from 'lucide-react';
import { getForms } from '../services/formsApi';
import { useAuth } from '../context/AuthContext';
import FormsList from '../components/forms/FormsList';
import CreateFormModal from '../components/forms/CreateFormModal';
import EditFormModal from '../components/forms/EditFormModal';
import DeleteFormDialog from '../components/forms/DeleteFormDialog';
import FormDetailModal from '../components/forms/FormDetailModal';
import FormBuilder from '../components/forms/builder/FormBuilder';

export default function FormsPage() {
  const { user } = useAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal visibility and builder view state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [deletingForm, setDeletingForm] = useState(null);
  const [viewingFormId, setViewingFormId] = useState(null);
  const [buildingFormId, setBuildingFormId] = useState(null);
  const [buildingVersionId, setBuildingVersionId] = useState(null);

  // Fetch forms from backend API
  const loadForms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getForms(0, 100);
      setForms(data || []);
    } catch (err) {
      console.error('Error loading forms:', err);
      setError(err.message || 'Failed to load forms from backend');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  // Handlers for mutations
  const handleFormCreated = (newForm) => {
    setForms((prev) => [newForm, ...prev]);
  };

  const handleFormUpdated = (updatedForm) => {
    setForms((prev) =>
      prev.map((f) => (f.id === updatedForm.id ? updatedForm : f))
    );
  };

  const handleFormDeleted = (deletedId) => {
    setForms((prev) => prev.filter((f) => f.id !== deletedId));
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
          <FileText size={16} color="var(--primary)" />
          <span>Total Forms: <strong>{stats.total}</strong></span>
        </div>
        <div className="stat-pill">
          <span className="badge badge-success" style={{ padding: '0.15rem 0.5rem' }}>Published</span>
          <span><strong>{stats.published}</strong></span>
        </div>
        <div className="stat-pill">
          <span className="badge badge-draft" style={{ padding: '0.15rem 0.5rem' }}>Drafts</span>
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

      {/* Loading indicator */}
      {loading && (
        <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: 'var(--primary)' }} />
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
          onCreateClick={() => setIsCreateModalOpen(true)}
        />
      )}

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
        onEditVersion={(form, version) => {
          setViewingFormId(null);
          setBuildingFormId(form.id);
          setBuildingVersionId(version.id);
        }}
      />
    </div>
  );
}
