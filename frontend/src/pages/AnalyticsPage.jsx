import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, TrendingUp, CheckCircle2, FileText, Users, Clock, Loader2, AlertCircle, RefreshCw, Filter
} from 'lucide-react';
import { getDashboardAnalytics, getFormAnalytics, getSubmissionTrend } from '../services/analyticsApi';
import { getForms } from '../services/formsApi';

export default function AnalyticsPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState('');
  const [formAnalytics, setFormAnalytics] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [trendInterval, setTrendInterval] = useState('daily');

  const [loading, setLoading] = useState(true);
  const [loadingPerForm, setLoadingPerForm] = useState(false);
  const [error, setError] = useState(null);

  // Load dashboard overview & forms list
  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [dash, formList, trend] = await Promise.all([
        getDashboardAnalytics(),
        getForms(0, 200),
        getSubmissionTrend(trendInterval, selectedFormId ? parseInt(selectedFormId, 10) : undefined),
      ]);
      setDashboardData(dash);
      setForms(formList || []);
      setTrendData(trend || []);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [trendInterval, selectedFormId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Load per-form analytics when selectedFormId changes
  useEffect(() => {
    if (!selectedFormId) {
      setFormAnalytics(null);
      return;
    }
    const loadSpecific = async () => {
      try {
        setLoadingPerForm(true);
        const [fa, trend] = await Promise.all([
          getFormAnalytics(parseInt(selectedFormId, 10)),
          getSubmissionTrend(trendInterval, parseInt(selectedFormId, 10)),
        ]);
        setFormAnalytics(fa);
        setTrendData(trend || []);
      } catch (err) {
        console.error('Error loading per-form analytics:', err);
      } finally {
        setLoadingPerForm(false);
      }
    };
    loadSpecific();
  }, [selectedFormId, trendInterval]);

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

  const cardStyle = {
    background: 'var(--card-bg)',
    borderRadius: '12px',
    border: '1px solid var(--rule)',
    padding: '1.25rem',
    boxShadow: 'var(--card-shadow)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  };

  return (
    <div>
      <div className="header">
        <div className="header-title">
          <h1>Platform Analytics</h1>
          <p>Real-time metrics, submission completion rates, and submission trend analysis.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={loadDashboard} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="modal-error" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: 'var(--ledger)' }} />
          <p style={{ fontSize: '0.95rem' }}>Loading analytics dashboard...</p>
        </div>
      ) : (
        <>
          {/* Top KPI Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Forms</span>
                <FileText size={18} color="var(--ledger)" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--ink)' }}>
                {dashboardData?.total_forms ?? 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}>
                <span>{dashboardData?.published_forms ?? 0} Published</span> • <span>{dashboardData?.draft_forms ?? 0} Draft</span>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Submissions</span>
                <TrendingUp size={18} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--ink)' }}>
                {dashboardData?.total_submissions ?? 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {dashboardData?.submitted_submissions ?? 0} Completed • {dashboardData?.started_submissions ?? 0} In Progress
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completion Rate</span>
                <CheckCircle2 size={18} color="#3b82f6" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--ink)' }}>
                {(dashboardData?.completion_rate ?? 0).toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Submissions finalized vs started
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registered Users</span>
                <Users size={18} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--ink)' }}>
                {dashboardData?.total_users ?? 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Active platform accounts
              </div>
            </div>
          </div>

          {/* Form Breakdown & Trend Controls */}
          <div style={{
            display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center',
            padding: '1rem', background: 'var(--card-bg)', borderRadius: '12px',
            border: '1px solid var(--rule)', boxShadow: 'var(--card-shadow)',
          }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Filter Form</label>
              <select style={selectStyle} value={selectedFormId} onChange={(e) => setSelectedFormId(e.target.value)}>
                <option value="">All Forms (Overview)</option>
                {forms.map((f) => (
                  <option key={f.id} value={f.id}>{f.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Trend Interval</label>
              <select style={selectStyle} value={trendInterval} onChange={(e) => setTrendInterval(e.target.value)}>
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          {/* Per-form specific analytics if selected */}
          {selectedFormId && formAnalytics && (
            <div style={{
              background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--rule)',
              padding: '1.5rem', marginBottom: '1.5rem', boxShadow: 'var(--card-shadow)',
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--ink)' }}>
                Analytics for "{formAnalytics.title}"
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Status</span>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ink)' }}>
                    {(formAnalytics.status || 'draft').toUpperCase()}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Versions</span>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ink)' }}>
                    {formAnalytics.version_count}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Submissions</span>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ink)' }}>
                    {formAnalytics.total_submissions}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Completed</span>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#10b981' }}>
                    {formAnalytics.completed_submissions}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Form Completion Rate</span>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#3b82f6' }}>
                    {formAnalytics.completion_rate.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submission Trend Visualization */}
          <div style={{
            background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--rule)',
            padding: '1.5rem', boxShadow: 'var(--card-shadow)',
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={18} color="var(--ledger)" />
              Submission Trend ({trendInterval === 'daily' ? 'Daily' : 'Monthly'})
            </h3>

            {trendData.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', padding: '2rem 0', textAlign: 'center' }}>
                No submission trend data available for the selected range.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                {trendData.map((item, idx) => {
                  const label = item.date || item.month || `Period ${idx + 1}`;
                  const maxCount = Math.max(...trendData.map((d) => d.count), 1);
                  const pct = Math.max((item.count / maxCount) * 100, 4);

                  return (
                    <div key={label} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 50px', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{label}</span>
                      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', height: '22px' }}>
                        <div style={{
                          width: `${pct}%`, height: '100%',
                          background: 'linear-gradient(90deg, var(--ledger), #a78bfa)',
                          borderRadius: '4px', transition: 'width 0.3s ease',
                        }} />
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--ink)', textAlign: 'right' }}>{item.count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
