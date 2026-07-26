import React, { useState, useEffect } from 'react';
import { X, Edit3, Loader2 } from 'lucide-react';
import { updateForm } from '../../services/formsApi';

export default function EditFormModal({ isOpen, onClose, form, onFormUpdated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (form) {
      setTitle(form.title || '');
      setDescription(form.description || '');
      setStatus(form.status || 'draft');
      setError(null);
    }
  }, [form]);

  if (!isOpen || !form) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Form title is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const updated = await updateForm(form.id, {
        title,
        description,
        status,
      });
      onFormUpdated(updated);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Edit3 size={20} color="var(--primary)" />
            <h2 className="modal-title">Edit Form Information</h2>
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
              <label className="form-label" htmlFor="edit-form-title">
                Form Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="edit-form-title"
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-form-description">
                Description
              </label>
              <textarea
                id="edit-form-description"
                className="form-textarea"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-form-status">
                Status
              </label>
              <select
                id="edit-form-status"
                className="form-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
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
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
