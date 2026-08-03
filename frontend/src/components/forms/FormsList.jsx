import React from 'react';
import FormCard from './FormCard';
import { FileText } from 'lucide-react';

export default function FormsList({ forms, onView, onEdit, onBuild, onDelete, onArchive, onCreateClick }) {
  if (!forms || forms.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <FileText size={36} />
        </div>
        <h3 className="empty-title">No Forms Found</h3>
        <p className="empty-description">
          You haven't created any forms yet, or no forms matched your search filter.
        </p>
        {onCreateClick && (
          <button className="btn-primary" onClick={onCreateClick} style={{ margin: '1rem auto 0 auto' }}>
            Create Your First Form
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="forms-grid">
      {forms.map((form) => (
        <FormCard
          key={form.id}
          form={form}
          onView={onView}
          onEdit={onEdit}
          onBuild={onBuild}
          onDelete={onDelete}
          onArchive={onArchive}
        />
      ))}
    </div>
  );
}
