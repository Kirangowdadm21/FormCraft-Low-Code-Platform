import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  RotateCcw,
  X,
} from 'lucide-react';
import PublicFormRenderer from '../components/public/PublicFormRenderer';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function PublicFormPage({ formId, isPreview = false, previewForm = null }) {
  const [form, setForm] = useState(previewForm || null);
  const [loading, setLoading] = useState(!previewForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitKey, setSubmitKey] = useState(0); // Used to reset the form

  const fetchForm = useCallback(async () => {
    if (previewForm) return; // Preview mode uses passed-in form data
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${BASE_URL}/forms/public/${formId}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Form not found or not published.');
      }
      const data = await res.json();
      setForm(data);
    } catch (err) {
      setError(err.message || 'Failed to load the form. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [formId, previewForm]);

  useEffect(() => {
    if (formId && !previewForm) {
      fetchForm();
    }
  }, [formId, previewForm, fetchForm]);

  const handleSubmit = async (payload) => {
    if (isPreview) return;
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`${BASE_URL}/public/forms/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Submission failed. Please try again.');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAnother = () => {
    setSubmitted(false);
    setError(null);
    setSubmitKey((k) => k + 1);
  };

  return (
    <div className="public-form-page">
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      {/* Branding Header */}
      <div className="public-form-brand">
        <div className="public-brand-logo">
          <Sparkles size={26} />
          <span>FormCraft</span>
        </div>
        <p className="public-brand-tagline">Intelligent Data Collection Platform</p>
      </div>

      <div className="public-form-container">
        {/* LOADING STATE with skeleton */}
        {loading && (
          <div className="public-form-card">
            <div className="skeleton-form-loading">
              <div className="skeleton-line skeleton-heading" />
              <div className="skeleton-line skeleton-desc" />
              <div className="skeleton-divider" />
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="skeleton-field-block">
                  <div className="skeleton-line skeleton-field-label" />
                  <div className="skeleton-line skeleton-field-input" />
                </div>
              ))}
              <div className="skeleton-line skeleton-field-btn" />
            </div>
          </div>
        )}

        {/* ERROR STATE (form failed to load) */}
        {!loading && error && !form && (
          <div className="public-form-card public-error-card">
            <div className="error-icon-circle">
              <AlertCircle size={40} />
            </div>
            <h2 className="error-heading">Form Unavailable</h2>
            <p className="error-description">{error}</p>
            <button className="btn-primary public-retry-btn" onClick={fetchForm}>
              <RefreshCw size={16} />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* SUCCESS SCREEN */}
        {!loading && submitted && (
          <div className="public-form-card public-success-card">
            <div className="success-icon-circle">
              <CheckCircle2 size={44} />
            </div>
            <h2 className="success-heading">✓ Thank You!</h2>
            <p className="success-description">
              Your response has been submitted successfully.
            </p>
            {form && (
              <p className="success-form-name">
                Form: <strong>{form.title}</strong>
              </p>
            )}
            <div className="success-actions">
              <button className="btn-primary" onClick={handleSubmitAnother}>
                <RotateCcw size={16} />
                <span>Submit Another Response</span>
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  if (window.opener) window.close();
                  else window.history.back();
                }}
              >
                <X size={16} />
                <span>Close</span>
              </button>
            </div>
          </div>
        )}

        {/* FORM VIEW */}
        {!loading && form && !submitted && (
          <div className="public-form-card">
            {/* Form Header */}
            <div className="public-form-header-section">
              <h1 className="public-form-title">{form.title}</h1>
              {form.description && (
                <p className="public-form-description">{form.description}</p>
              )}
            </div>

            {/* Inline submission error */}
            {error && (
              <div className="form-level-error" role="alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Dynamic Form Renderer */}
            <PublicFormRenderer
              key={submitKey}
              fields={form.fields || []}
              onSubmit={handleSubmit}
              isPreview={isPreview}
              isSubmitting={submitting}
            />
          </div>
        )}

        {/* EMPTY STATE (form loaded but no fields) */}
        {!loading && form && !submitted && (!form.fields || form.fields.length === 0) && null}
      </div>

      {/* Footer */}
      <div className="public-form-footer">
        <span>Powered by <strong>FormCraft</strong></span>
      </div>
    </div>
  );
}
