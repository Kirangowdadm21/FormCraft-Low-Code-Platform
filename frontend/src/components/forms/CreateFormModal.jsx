import React, { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { createForm } from '../../services/formsApi';

export default function CreateFormModal({ isOpen, onClose, onFormCreated, ownerId = 1 }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Form title is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const newForm = await createForm({ title, description }, ownerId);
      setTitle('');
      setDescription('');
      onFormCreated(newForm);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} color="var(--primary)" />
            <h2 className="modal-title">Create New Form</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="modal-error">
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="form-title">
                Form Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="form-title"
                type="text"
                className="form-input"
                placeholder="e.g. Customer Satisfaction Survey"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="form-description">
                Description
              </label>
              <textarea
                id="form-description"
                className="form-textarea"
                rows={4}
                placeholder="Briefly describe the purpose of this form..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus size={18} />
                  <span>Create Form</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
