import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Search, RefreshCw, Loader2, AlertCircle, Layers, ArrowUpDown, Sparkles } from 'lucide-react';
import { listTemplates } from '../services/templatesApi';
import TemplateCard from '../components/templates/TemplateCard';
import CreateTemplateModal from '../components/templates/CreateTemplateModal';
import EditTemplateModal from '../components/templates/EditTemplateModal';
import PreviewTemplateModal from '../components/templates/PreviewTemplateModal';
import UseTemplateModal from '../components/templates/UseTemplateModal';
import DeleteTemplateDialog from '../components/templates/DeleteTemplateDialog';
import FormBuilder from '../components/forms/builder/FormBuilder';

export default function TemplatesPage({ onNavigateToPublished }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Modal & Builder states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [usingTemplate, setUsingTemplate] = useState(null);
  const [deletingTemplate, setDeletingTemplate] = useState(null);

  // Active form building state after "Use Template"
  const [buildingFormId, setBuildingFormId] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listTemplates('', 0, 100);
      setTemplates(data || []);
    } catch (err) {
      console.error('Error loading templates:', err);
      setError(err.message || 'Failed to load templates from backend');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // Event Handlers
  const handleTemplateCreated = (newTemplate) => {
    showNotification(`Template "${newTemplate.title}" created successfully.`);
    loadTemplates();
  };

  const handleTemplateUpdated = (updatedTemplate) => {
    showNotification(`Template "${updatedTemplate.title}" updated successfully.`);
    loadTemplates();
  };

  const handleTemplateDeleted = (deletedId) => {
    showNotification('Template deleted successfully.');
    loadTemplates();
  };

  const handleFormCreatedFromTemplate = (newForm) => {
    showNotification(`Form "${newForm.title}" created from template! Launching Form Builder...`);
    setBuildingFormId(newForm.id);
  };

  // Search & Filtered/Sorted templates
  const filteredTemplates = useMemo(() => {
    let result = templates.filter((template) => {
      const q = searchQuery.toLowerCase();
      const matchesTitle = template.title?.toLowerCase().includes(q);
      const matchesDesc = template.description?.toLowerCase().includes(q);
      return matchesTitle || matchesDesc;
    });

    switch (sortBy) {
      case 'oldest':
        result.sort((a, b) => new Date(a.createdat) - new Date(b.createdat));
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'fields':
        result.sort((a, b) => (b.fields?.length || 0) - (a.fields?.length || 0));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdat) - new Date(a.createdat));
        break;
    }

    return result;
  }, [templates, searchQuery, sortBy]);

  // Total statistics
  const stats = useMemo(() => {
    const totalTemplates = templates.length;
    const totalFields = templates.reduce((acc, t) => acc + (t.fields?.length || 0), 0);
    return { totalTemplates, totalFields };
  }, [templates]);

  // If a newly created form from template is launching, render FormBuilder view
  if (buildingFormId) {
    return (
      <FormBuilder
        formId={buildingFormId}
        onBack={() => {
          setBuildingFormId(null);
          loadTemplates();
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
          <h1>Form Templates Library</h1>
          <p>Browse, create, and manage reusable form templates to accelerate data collection workflows.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn-secondary"
            onClick={loadTemplates}
            disabled={loading}
            title="Reload templates"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            className="btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={18} />
            <span>Create Template</span>
          </button>
        </div>
      </div>

      {/* Summary Stats Strip */}
      <div className="forms-stats-strip">
        <div className="stat-pill">
          <Layers size={16} color="var(--ink)" />
          <span>Total Templates: <strong>{stats.totalTemplates}</strong></span>
        </div>
        <div className="stat-pill">
          <Sparkles size={16} color="var(--ledger)" />
          <span>Pre-configured Fields: <strong>{stats.totalFields}</strong></span>
        </div>
      </div>

      {/* Controls Bar: Search & Sort */}
      <div className="forms-controls-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search templates by title or description..."
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
            <option value="newest">Sort by Newest</option>
            <option value="oldest">Sort by Oldest</option>
            <option value="title">Sort by Title (A-Z)</option>
            <option value="fields">Sort by Most Fields</option>
          </select>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="modal-error" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
          <button
            onClick={loadTemplates}
            style={{ marginLeft: 'auto', background: 'none', border: 'underline', color: 'inherit', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Templates Display */}
      <div>
        {loading && (
          <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: 'var(--ledger)' }} />
            <p style={{ fontSize: '0.95rem' }}>Fetching templates from backend API...</p>
          </div>
        )}

        {!loading && filteredTemplates.length === 0 && (
          <div
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              background: 'var(--paper)',
              border: '1px dashed var(--rule)',
              borderRadius: '12px',
              margin: '1.5rem 0',
            }}
          >
            <Layers size={44} style={{ margin: '0 auto 1rem auto', color: 'var(--text-muted)', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--ink)', marginBottom: '0.5rem' }}>
              {searchQuery ? 'No templates match your search query.' : 'No templates found.'}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
              {searchQuery
                ? 'Try adjusting your search terms.'
                : 'Create your first form template to speed up form creation across your organization.'}
            </p>
            {!searchQuery && (
              <button
                className="btn-primary"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus size={18} />
                <span>Create First Template</span>
              </button>
            )}
          </div>
        )}

        {!loading && filteredTemplates.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.25rem',
              marginTop: '1rem',
            }}
          >
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onPreview={(tpl) => setPreviewTemplate(tpl)}
                onUse={(tpl) => setUsingTemplate(tpl)}
                onEdit={(tpl) => setEditingTemplate(tpl)}
                onDelete={(tpl) => setDeletingTemplate(tpl)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTemplateCreated={handleTemplateCreated}
      />

      <EditTemplateModal
        isOpen={!!editingTemplate}
        onClose={() => setEditingTemplate(null)}
        template={editingTemplate}
        onTemplateUpdated={handleTemplateUpdated}
      />

      <PreviewTemplateModal
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        template={previewTemplate}
        onUseTemplate={(tpl) => setUsingTemplate(tpl)}
      />

      <UseTemplateModal
        isOpen={!!usingTemplate}
        onClose={() => setUsingTemplate(null)}
        template={usingTemplate}
        onFormCreated={handleFormCreatedFromTemplate}
      />

      <DeleteTemplateDialog
        isOpen={!!deletingTemplate}
        onClose={() => setDeletingTemplate(null)}
        template={deletingTemplate}
        onTemplateDeleted={handleTemplateDeleted}
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
