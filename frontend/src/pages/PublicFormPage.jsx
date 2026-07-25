import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';

export default function PublicFormPage({ formId }) {
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchForm() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/forms/public/${formId}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || 'Form not found or not published.');
        }
        const data = await res.json();
        setForm(data);
        // Initialize responses object
        const initialResp = {};
        if (data.fields) {
          data.fields.forEach(f => {
            initialResp[f.id] = '';
          });
        }
        setResponses(initialResp);
      } catch (err) {
        setError(err.message || 'Failed to load public form.');
      } finally {
        setLoading(false);
      }
    }

    if (formId) {
      fetchForm();
    }
  }, [formId]);

  const handleValueChange = (fieldId, val) => {
    setResponses(prev => ({
      ...prev,
      [fieldId]: val
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form || !form.fields) return;

    // Validate required fields
    for (const field of form.fields) {
      if (field.required && (!responses[field.id] || !responses[field.id].toString().trim())) {
        setError(`Please fill in the required field: "${field.label}"`);
        return;
      }
    }

    // Format response values for API
    const responsePayload = {
      responses: Object.entries(responses).map(([fieldId, val]) => ({
        field_id: parseInt(fieldId),
        value: typeof val === 'string' ? val : JSON.stringify(val),
        uploaded_file: null
      }))
    };

    try {
      setSubmitting(true);
      const res = await fetch(`/public/forms/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responsePayload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Form submission failed.');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Submission error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-main)',
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '3rem 1rem',
      position: 'relative'
    }}>
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', zIndex: 2 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
          <Sparkles size={28} color="#8b5cf6" />
          <span>FormCraft Public</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Intelligent Public Response Portal</p>
      </div>

      <div style={{ width: '100%', maxWidth: '640px', zIndex: 2 }}>
        {loading ? (
          <div className="data-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Loader2 className="animate-spin" size={36} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading form...</p>
          </div>
        ) : error && !form ? (
          <div className="data-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem auto' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Form Unavailable</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
          </div>
        ) : submitted ? (
          <div className="data-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <CheckCircle2 size={36} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>Submission Received!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6' }}>
              Thank you for completing <strong>{form.title}</strong>. Your response has been recorded securely.
            </p>
          </div>
        ) : (
          <div className="data-card" style={{ padding: '2.5rem 2rem' }}>
            {/* Form Info */}
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>{form.title}</h1>
              {form.description && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>{form.description}</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '0.85rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ef4444', fontSize: '0.875rem' }}>
                <AlertCircle size={20} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Questions Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {form.fields && form.fields.length > 0 ? (
                form.fields.map((field) => (
                  <div key={field.id}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                      {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                    </label>

                    {/* Dropdown Options */}
                    {field.field_type === 'select' || field.field_type === 'dropdown' ? (
                      <select
                        value={responses[field.id] || ''}
                        onChange={(e) => handleValueChange(field.id, e.target.value)}
                        required={field.required}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          background: '#090a0f',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem',
                          outline: 'none'
                        }}
                      >
                        <option value="">Select an option...</option>
                        {field.options && field.options.map(opt => (
                          <option key={opt.id} value={opt.value}>{opt.optiontext || opt.value}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.field_type === 'email' ? 'email' : 'text'}
                        value={responses[field.id] || ''}
                        onChange={(e) => handleValueChange(field.id, e.target.value)}
                        required={field.required}
                        placeholder={field.placeholder || 'Enter your response...'}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          background: 'rgba(10, 11, 18, 0.6)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem',
                          outline: 'none'
                        }}
                      />
                    )}
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>No questions available for this form.</p>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.85rem',
                  marginTop: '1rem',
                  opacity: submitting ? 0.7 : 1,
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Submitting Response...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Response</span>
                    <Send size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
