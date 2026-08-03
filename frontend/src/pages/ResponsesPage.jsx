import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileText, Loader2, AlertCircle, RefreshCw, Search, Eye, Trash2, ChevronDown, ChevronUp,
} from 'lucide-react';
import { getSubmissions, getResponses, deleteResponse } from '../services/responsesApi';
import { getForms, getFormVersions, getFieldsByVersion } from '../services/formsApi';

export default function ResponsesPage() {
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState('');
  const [versions, setVersions] = useState([]);
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const [versionFields, setVersionFields] = useState([]);

  const [submissions, setSubmissions] = useState([]);
  const [expandedSubmission, setExpandedSubmission] = useState(null);
  const [responses, setResponses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Load forms
  useEffect(() => {
    const loadForms = async () => {
      try {
        const data = await getForms(0, 200);
        setForms(data || []);
      } catch (err) {
        console.error('Error loading forms:', err);
      }
    };
    loadForms();
  }, []);

  // Load versions when form changes
  useEffect(() => {
    if (!selectedFormId) {
      setVersions([]);
      setSelectedVersionId('');
      return;
    }
    const loadVersions = async () => {
      try {
        const vers = await getFormVersions(parseInt(selectedFormId, 10));
        setVersions(vers || []);
        if (vers && vers.length > 0) {
          const latest = [...vers].sort((a, b) => b.version_number - a.version_number)[0];
          setSelectedVersionId(String(latest.id));
        } else {
          setSelectedVersionId('');
        }
      } catch (err) {
        setVersions([]);
      }
    };
    loadVersions();
  }, [selectedFormId]);

  // Load field metadata for selected version
  useEffect(() => {
    if (!selectedVersionId) {
      setVersionFields([]);
      return;
    }
    const loadFields = async () => {
      try {
        const fieldsData = await getFieldsByVersion(parseInt(selectedVersionId, 10));
        setVersionFields(fieldsData || []);
      } catch (err) {
        setVersionFields([]);
      }
    };
    loadFields();
  }, [selectedVersionId]);

  // Map of field ID to human-readable label
  const fieldMap = useMemo(() => {
    const map = {};
    // First map fields loaded directly via getFieldsByVersion
    if (versionFields && versionFields.length > 0) {
      versionFields.forEach((f) => {
        const label = f.label || f.field_name;
        if (label) {
          map[f.id] = label;
          map[String(f.id)] = label;
        }
      });
    }
    // Fallback to fields embedded in selected version object
    if (selectedVersionId && versions && versions.length > 0) {
      const currentVer = versions.find((v) => String(v.id) === String(selectedVersionId));
      if (currentVer && currentVer.fields) {
        currentVer.fields.forEach((f) => {
          const label = f.label || f.field_name;
          if (label && !map[f.id]) {
            map[f.id] = label;
            map[String(f.id)] = label;
          }
        });
      }
    }
    return map;
  }, [versionFields, selectedVersionId, versions]);

  // Load submissions when version changes
  const loadSubmissions = useCallback(async () => {
    if (!selectedVersionId) {
      setSubmissions([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getSubmissions(parseInt(selectedVersionId, 10));
      setSubmissions(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }, [selectedVersionId]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  // Expand/collapse submission
  const handleToggleSubmission = async (submissionId) => {
    if (expandedSubmission === submissionId) {
      setExpandedSubmission(null);
      setResponses([]);
      return;
    }
    try {
      setLoadingResponses(true);
      setExpandedSubmission(submissionId);
      const data = await getResponses(submissionId);
      setResponses(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load responses');
    } finally {
      setLoadingResponses(false);
    }
  };

  const handleDeleteResponse = async (responseId) => {
    if (!window.confirm('Delete this response value permanently?')) return;
    try {
      await deleteResponse(responseId);
      setResponses((prev) => prev.filter((r) => r.id !== responseId));
      showNotification('Response deleted.');
    } catch (err) {
      setError(err.message || 'Failed to delete response');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try { return new Date(dateStr).toLocaleString(); } catch { return dateStr; }
  };

  const filteredSubmissions = useMemo(() => {
    if (!searchQuery) return submissions;
    const q = searchQuery.toLowerCase();
    return submissions.filter((s) =>
      String(s.id).includes(q) ||
      (s.submitted_at && s.submitted_at.toLowerCase().includes(q))
    );
  }, [submissions, searchQuery]);

  const selectStyle = {
    padding: '0.5rem 0.8rem',
    background: 'var(--field)',
    border: '1px solid var(--rule)',
    borderRadius: '8px',
    color: 'var(--ink)',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-family)',
    minWidth: '180px',
  };

  return (
    <div>
      <div className="header">
        <div className="header-title">
          <h1>Form Responses</h1>
          <p>View and manage all collected form submissions and their individual field responses.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={loadSubmissions} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end',
        padding: '1rem', background: 'var(--card-bg)', borderRadius: '12px',
        border: '1px solid var(--rule)', boxShadow: 'var(--card-shadow)',
      }}>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Form</label>
          <select style={selectStyle} value={selectedFormId} onChange={(e) => setSelectedFormId(e.target.value)}>
            <option value="">Select form...</option>
            {forms.map((f) => (
              <option key={f.id} value={f.id}>{f.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Version</label>
          <select style={selectStyle} value={selectedVersionId} onChange={(e) => setSelectedVersionId(e.target.value)} disabled={!selectedFormId}>
            <option value="">Select version...</option>
            {versions.map((v) => (
              <option key={v.id} value={v.id}>v{v.version_number}{v.ispublished ? ' (Published)' : ''}</option>
            ))}
          </select>
        </div>

        <div style={{ position: 'relative' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Search</label>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', top: '50%', left: '0.6rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              style={{ ...selectStyle, paddingLeft: '2rem', minWidth: '200px' }}
              placeholder="Search submissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="modal-error" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: 'var(--ledger)' }} />
          <p style={{ fontSize: '0.95rem' }}>Loading submissions...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredSubmissions.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <FileText size={36} />
          </div>
          <h3 className="empty-title">No Submissions Found</h3>
          <p className="empty-description">
            {selectedVersionId
              ? 'No submissions have been received for this form version yet.'
              : 'Select a form and version above to view submissions.'}
          </p>
        </div>
      )}

      {/* Submissions List */}
      {!loading && filteredSubmissions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredSubmissions.map((sub) => (
            <div key={sub.id} style={{
              background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--rule)',
              boxShadow: 'var(--card-shadow)', overflow: 'hidden',
              transition: 'box-shadow 0.2s ease',
            }}>
              {/* Submission Header Row */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1rem 1.25rem', cursor: 'pointer',
                  background: expandedSubmission === sub.id ? 'rgba(139, 92, 246, 0.04)' : 'transparent',
                }}
                onClick={() => handleToggleSubmission(sub.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="mono-id">SUB-{sub.id}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    {formatDate(sub.submitted_at)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    v{sub.form_version_id}
                  </span>
                  {expandedSubmission === sub.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {/* Expanded Response Rows */}
              {expandedSubmission === sub.id && (
                <div style={{
                  borderTop: '1px solid var(--rule)', padding: '1rem 1.25rem',
                  background: 'rgba(0,0,0,0.15)',
                }}>
                  {loadingResponses ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)' }}>
                      <Loader2 size={20} className="animate-spin" />
                      <span style={{ marginLeft: '0.5rem' }}>Loading responses...</span>
                    </div>
                  ) : responses.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No responses found for this submission.</p>
                  ) : (
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 2fr 60px', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--rule)', fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <span>ID</span>
                        <span>Field</span>
                        <span>Value</span>
                        <span></span>
                      </div>
                      {responses.map((resp) => (
                        <div key={resp.id} style={{
                          display: 'grid', gridTemplateColumns: '80px 1fr 2fr 60px', gap: '0.75rem', padding: '0.5rem 0',
                          borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.85rem', alignItems: 'center',
                        }}>
                          <span className="mono-id" style={{ fontSize: '0.75rem' }}>R-{resp.id}</span>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                            {fieldMap[resp.field_id] || fieldMap[String(resp.field_id)] || `Field #${resp.field_id}`}
                          </span>
                          <span style={{ color: 'var(--ink)', wordBreak: 'break-word' }}>
                            {resp.value || <em style={{ color: 'var(--text-muted)' }}>Empty</em>}
                          </span>
                          <button
                            className="btn-destructive-subtle"
                            onClick={(e) => { e.stopPropagation(); handleDeleteResponse(resp.id); }}
                            title="Delete Response"
                            style={{ padding: '0.25rem' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          <span>{notification.msg}</span>
        </div>
      )}
    </div>
  );
}
