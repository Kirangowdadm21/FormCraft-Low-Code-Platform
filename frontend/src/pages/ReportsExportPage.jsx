import React, { useState, useEffect } from 'react';
import {
  Download, FileSpreadsheet, FileCode, FileText, Loader2, AlertCircle, RefreshCw, CheckCircle2
} from 'lucide-react';
import { exportDataset, generateReportFile, getDashboardReport } from '../services/exportsApi';
import { getForms } from '../services/formsApi';

export default function ReportsExportPage() {
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState('');
  const [exportType, setExportType] = useState('forms');
  const [format, setFormat] = useState('csv');
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [dashboardSummary, setDashboardSummary] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [formList, dash] = await Promise.all([
          getForms(0, 200),
          getDashboardReport(),
        ]);
        setForms(formList || []);
        setDashboardSummary(dash.summary || null);
      } catch (err) {
        console.error('Error loading initial report data:', err);
      }
    };
    load();
  }, []);

  const handleExport = async (mode) => {
    try {
      setDownloading(true);
      setError(null);
      setSuccessMsg(null);

      if (mode === 'raw') {
        await exportDataset(exportType, format, selectedFormId ? parseInt(selectedFormId, 10) : null);
      } else {
        await generateReportFile(exportType, format, selectedFormId ? parseInt(selectedFormId, 10) : null);
      }

      setSuccessMsg(`Export file (${format.toUpperCase()}) generated and downloaded successfully!`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(err.message || 'Failed to generate export file');
    } finally {
      setDownloading(false);
    }
  };

  const cardStyle = {
    background: 'var(--card-bg)',
    borderRadius: '12px',
    border: '1px solid var(--rule)',
    padding: '1.5rem',
    boxShadow: 'var(--card-shadow)',
  };

  const selectStyle = {
    width: '100%',
    padding: '0.6rem 0.8rem',
    background: 'var(--field)',
    border: '1px solid var(--rule)',
    borderRadius: '8px',
    color: 'var(--ink)',
    fontSize: '0.88rem',
    fontFamily: 'var(--font-family)',
  };

  return (
    <div>
      <div className="header">
        <div className="header-title">
          <h1>Reports & Data Export</h1>
          <p>Generate and download production reports in CSV, JSON, and PDF formats.</p>
        </div>
      </div>

      {error && (
        <div className="modal-error" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', color: '#10b981',
          display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem',
        }}>
          <CheckCircle2 size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Export Configuration Box */}
      <div style={{ ...cardStyle, maxWidth: '640px', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--ink)' }}>
          Configure Export Package
        </h2>

        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {/* Data Category */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Data Category
            </label>
            <select style={selectStyle} value={exportType} onChange={(e) => setExportType(e.target.value)}>
              <option value="forms">Forms & Version Metadata</option>
              <option value="submissions">Submissions & Responses</option>
              <option value="analytics">Analytics & Metrics</option>
              <option value="dashboard">System Dashboard Summary</option>
            </select>
          </div>

          {/* Form Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Filter by Form <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Optional)</span>
            </label>
            <select style={selectStyle} value={selectedFormId} onChange={(e) => setSelectedFormId(e.target.value)}>
              <option value="">All Forms</option>
              {forms.map((f) => (
                <option key={f.id} value={f.id}>{f.title}</option>
              ))}
            </select>
          </div>

          {/* Export Format Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              File Format
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setFormat('csv')}
                style={{
                  padding: '0.8rem', borderRadius: '8px', border: format === 'csv' ? '2px solid var(--ledger)' : '1px solid var(--rule)',
                  background: format === 'csv' ? 'rgba(139, 92, 246, 0.1)' : 'var(--field)',
                  color: 'var(--ink)', fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                }}
              >
                <FileSpreadsheet size={22} color="#10b981" />
                <span style={{ fontSize: '0.85rem' }}>CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('json')}
                style={{
                  padding: '0.8rem', borderRadius: '8px', border: format === 'json' ? '2px solid var(--ledger)' : '1px solid var(--rule)',
                  background: format === 'json' ? 'rgba(139, 92, 246, 0.1)' : 'var(--field)',
                  color: 'var(--ink)', fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                }}
              >
                <FileCode size={22} color="#3b82f6" />
                <span style={{ fontSize: '0.85rem' }}>JSON</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('pdf')}
                style={{
                  padding: '0.8rem', borderRadius: '8px', border: format === 'pdf' ? '2px solid var(--ledger)' : '1px solid var(--rule)',
                  background: format === 'pdf' ? 'rgba(139, 92, 246, 0.1)' : 'var(--field)',
                  color: 'var(--ink)', fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                }}
              >
                <FileText size={22} color="#ef4444" />
                <span style={{ fontSize: '0.85rem' }}>PDF</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button
              className="btn-primary"
              onClick={() => handleExport('report')}
              disabled={downloading}
              style={{ flex: 1, padding: '0.75rem' }}
            >
              {downloading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Generating {format.toUpperCase()}...</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>Generate & Download Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* System Summary Info Box */}
      {dashboardSummary && (
        <div style={{ ...cardStyle, maxWidth: '640px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--ink)' }}>
            System Data Overview
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <div>Total Forms: <strong>{dashboardSummary.total_forms}</strong></div>
            <div>Total Submissions: <strong>{dashboardSummary.total_submissions}</strong></div>
            <div>Published Forms: <strong>{dashboardSummary.published_forms}</strong></div>
            <div>Completion Rate: <strong>{dashboardSummary.completion_rate}%</strong></div>
          </div>
        </div>
      )}
    </div>
  );
}
