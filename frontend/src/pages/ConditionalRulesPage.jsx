import React, { useState, useEffect, useCallback } from 'react';
import {
  GitFork, Plus, Loader2, AlertCircle, RefreshCw, Trash2, Edit3, Search,
} from 'lucide-react';
import { getRules, deleteRule } from '../services/rulesApi';
import { getForms, getFormVersions, getFieldsByVersion } from '../services/formsApi';
import CreateRuleModal from '../components/forms/CreateRuleModal';

export default function ConditionalRulesPage() {
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState('');
  const [versions, setVersions] = useState([]);
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const [fields, setFields] = useState([]);
  const [rules, setRules] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Load forms on mount
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
        console.error('Error loading versions:', err);
        setVersions([]);
      }
    };
    loadVersions();
  }, [selectedFormId]);

  // Load fields and rules when version changes
  useEffect(() => {
    if (!selectedVersionId) {
      setFields([]);
      setRules([]);
      return;
    }
    const loadData = async () => {
      try {
        setLoadingFields(true);
        setError(null);
        const [fieldsData, rulesData] = await Promise.all([
          getFieldsByVersion(parseInt(selectedVersionId, 10)),
          getRules(),
        ]);
        setFields(fieldsData || []);
        setRules(rulesData || []);
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoadingFields(false);
      }
    };
    loadData();
  }, [selectedVersionId]);

  const loadRules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRules();
      setRules(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load rules');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteRule = async (ruleId) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) return;
    try {
      await deleteRule(ruleId);
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
      showNotification('Rule deleted successfully.');
    } catch (err) {
      setError(err.message || 'Failed to delete rule');
    }
  };

  const handleRuleCreated = (rule, isUpdate) => {
    if (isUpdate) {
      setRules((prev) => prev.map((r) => (r.id === rule.id ? rule : r)));
      showNotification('Rule updated successfully.');
    } else {
      setRules((prev) => [rule, ...prev]);
      showNotification('Rule created successfully.');
    }
  };

  const getFieldLabel = (fieldId) => {
    const field = fields.find((f) => f.id === fieldId);
    return field ? field.label : `Field #${fieldId}`;
  };

  // Filter rules relevant to selected version's fields
  const fieldIds = fields.map((f) => f.id);
  const filteredRules = selectedVersionId
    ? rules.filter((r) => fieldIds.includes(r.trigger_field) || fieldIds.includes(r.targeted_field))
    : rules;

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
          <h1>Conditional Rules Engine</h1>
          <p>Define conditional logic rules that control field visibility and validation at submission time.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={loadRules} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button className="btn-primary" onClick={() => { setEditingRule(null); setIsCreateModalOpen(true); }}>
            <Plus size={18} />
            <span>Create Rule</span>
          </button>
        </div>
      </div>

      {/* Form & Version Selectors */}
      <div style={{
        display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center',
        padding: '1rem', background: 'var(--card-bg)', borderRadius: '12px',
        border: '1px solid var(--rule)', boxShadow: 'var(--card-shadow)',
      }}>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Form</label>
          <select style={selectStyle} value={selectedFormId} onChange={(e) => setSelectedFormId(e.target.value)}>
            <option value="">All Forms</option>
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

        <div style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {fields.length > 0 && <span>{fields.length} fields loaded</span>}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="modal-error" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={loadRules} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}>
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loadingFields && (
        <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: 'var(--ledger)' }} />
          <p style={{ fontSize: '0.95rem' }}>Loading rules and fields...</p>
        </div>
      )}

      {/* Empty State */}
      {!loadingFields && filteredRules.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <GitFork size={36} />
          </div>
          <h3 className="empty-title">No Rules Found</h3>
          <p className="empty-description">
            {selectedVersionId
              ? 'No conditional rules exist for the selected form version. Create one to get started.'
              : 'Select a form and version above, or create a new rule.'}
          </p>
        </div>
      )}

      {/* Rules Cards Grid */}
      {!loadingFields && filteredRules.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
          {filteredRules.map((rule) => (
            <div key={rule.id} style={{
              background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--rule)',
              padding: '1.25rem', boxShadow: 'var(--card-shadow)',
              transition: 'box-shadow 0.2s ease, transform 0.2s ease',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span className="mono-id">RULE-{rule.id}</span>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    className="btn-tertiary"
                    onClick={() => { setEditingRule(rule); setIsCreateModalOpen(true); }}
                    title="Edit Rule"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    className="btn-destructive-subtle"
                    onClick={() => handleDeleteRule(rule.id)}
                    title="Delete Rule"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '0.88rem', lineHeight: '1.6' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>IF </span>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{getFieldLabel(rule.trigger_field)}</span>
                  <span style={{ color: 'var(--ledger)', fontWeight: 600 }}> {rule.operator} </span>
                  {rule.comparison && (
                    <span style={{ color: 'var(--text-secondary)' }}>"{rule.comparison}"</span>
                  )}
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>THEN </span>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: rule.action === 'require' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: rule.action === 'require' ? '#f59e0b' : '#10b981',
                  }}>
                    {rule.action}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}> → </span>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{getFieldLabel(rule.targeted_field)}</span>
                </div>
                {rule.logical_group && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Group: <span style={{ fontFamily: 'var(--font-mono)' }}>{rule.logical_group}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Create/Edit Rule Modal */}
      <CreateRuleModal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); setEditingRule(null); }}
        onRuleCreated={handleRuleCreated}
        existingRule={editingRule}
        fields={fields}
      />
    </div>
  );
}
