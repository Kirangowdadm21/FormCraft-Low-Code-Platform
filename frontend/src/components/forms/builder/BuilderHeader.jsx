import React from 'react';
import { ArrowLeft, Save, Eye, Send, Loader2, CheckCircle, AlertCircle, GitBranch } from 'lucide-react';

export default function BuilderHeader({
  form,
  activeVersion,
  isDirty,
  saving,
  publishing,
  onSave,
  onPublish,
  onPreview,
  onBack,
}) {
  const handleBackClick = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes in the form builder. Discard changes and exit to dashboard?')) {
        onBack();
      }
    } else {
      onBack();
    }
  };

  return (
    <div className="builder-header">
      <div className="builder-header-left">
        <button className="btn-icon-back" onClick={handleBackClick} title="Back to Forms Dashboard">
          <ArrowLeft size={18} />
          <span>Dashboard</span>
        </button>
        <div className="builder-header-divider" />
        <div className="builder-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 className="builder-form-title">{form?.title || 'Form Builder'}</h2>
            {activeVersion && (
              <span className="badge badge-version-header" title={`Loaded version ${activeVersion.version_number}`}>
                <GitBranch size={11} style={{ marginRight: '0.2rem' }} />
                v{activeVersion.version_number}
              </span>
            )}
          </div>
          <div className="builder-status-tags">
            <span className={`badge ${form?.status === 'published' ? 'badge-success' : 'badge-draft'}`}>
              {form?.status?.toUpperCase() || 'DRAFT'}
            </span>
            {isDirty ? (
              <span className="unsaved-badge" title="Unsaved changes. Saving will create a new version.">
                <AlertCircle size={12} />
                Unsaved changes
              </span>
            ) : (
              <span className="saved-badge" title="All changes saved">
                <CheckCircle size={12} />
                Saved
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="builder-header-right">
        <button
          type="button"
          className="btn-secondary"
          onClick={onPreview}
          title="Live Preview Form"
        >
          <Eye size={16} />
          <span>Preview</span>
        </button>

        <button
          type="button"
          className="btn-publish"
          onClick={onPublish}
          disabled={publishing || saving}
          title="Publish Form Version"
        >
          {publishing ? (
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

        <button
          type="button"
          className="btn-primary"
          onClick={onSave}
          disabled={saving || !isDirty}
          title="Save Fields to Backend"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Save</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
