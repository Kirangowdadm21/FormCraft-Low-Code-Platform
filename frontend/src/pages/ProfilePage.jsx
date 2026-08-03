import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Hash, Calendar, LogOut, Loader2, CheckCircle2, AlertCircle, RefreshCw, Key, Lock, Activity } from 'lucide-react';

export default function ProfilePage({ onLogoutSuccess }) {
  const { user, token, fetchProfile, logout, loading: authLoading } = useAuth();
  
  const [loggingOut, setLoggingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      if (onLogoutSuccess) {
        onLogoutSuccess();
      }
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchProfile(token);
    } finally {
      setRefreshing(false);
    }
  }, [fetchProfile, token]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '350px',
        color: 'var(--text-secondary)'
      }}>
        <Loader2 className="animate-spin" size={36} color="var(--ledger)" style={{ marginBottom: '1rem' }} />
        <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>Fetching User Profile from API...</p>
      </div>
    );
  }

  // Error state / unauthorized
  if (!user) {
    return (
      <div className="data-card" style={{ maxWidth: '540px', margin: '3rem auto', textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '4px',
          background: '#FAF0EC',
          color: 'var(--stamp)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
          border: '1px solid var(--stamp)'
        }}>
          <AlertCircle size={28} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Session Expired</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
          Unable to retrieve user credentials. Please sign in again.
        </p>
        <button className="btn-primary" style={{ margin: '0 auto' }} onClick={handleLogout}>
          <LogOut size={16} />
          <span>Return to Login</span>
        </button>
      </div>
    );
  }

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Administrator Profile';
  const initials = ((user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')).toUpperCase() || 'A';

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Card */}
      <div className="data-card" style={{ padding: '1.75rem', marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div className="avatar" style={{ width: '56px', height: '56px', fontSize: '1.35rem' }}>
            {initials}
          </div>
          <div style={{ flexGrow: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>{fullName}</h1>
              <span className="mono-id">USR-{user?.id}</span>
              <span className={`badge ${user?.role === 'admin' ? 'badge-success' : 'badge-partial'}`}>
                {user?.role ? user.role.toUpperCase() : 'USER'}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem', fontSize: '0.9rem' }}>
              {user?.email}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-secondary"
              title="Refresh Account Data"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="btn-destructive"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 1: Dense 2-Column Definition List of Account Specs */}
      <div className="data-card" style={{ padding: '1.5rem', marginBottom: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink)' }}>
            Account Specifications & System Credentials
          </span>
          <span className="mono-id">CONFIDENTIAL</span>
        </div>

        <div className="def-list-container">
          <div className="def-row">
            <span className="def-label"><Hash size={14} /> User Identifier</span>
            <span className="def-value"><span className="mono-id">USR-{user?.id}</span></span>
          </div>
          <div className="def-row">
            <span className="def-label"><User size={14} /> Full Name</span>
            <span className="def-value">{fullName}</span>
          </div>
          <div className="def-row">
            <span className="def-label"><Mail size={14} /> Registered Email</span>
            <span className="def-value">{user?.email}</span>
          </div>
          <div className="def-row">
            <span className="def-label"><Shield size={14} /> System Role</span>
            <span className="def-value" style={{ textTransform: 'capitalize' }}>{user?.role || 'user'}</span>
          </div>
          <div className="def-row">
            <span className="def-label"><Calendar size={14} /> Account Created</span>
            <span className="def-value">{formatDate(user?.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Section 2: Security, Active Sessions & Access Control */}
      <div className="data-card" style={{ padding: '1.5rem', marginBottom: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink)' }}>
            Security, Active Sessions & Access Control
          </span>
          <span className="badge badge-success">ENCRYPTED</span>
        </div>

        <div className="def-list-container">
          <div className="def-row">
            <span className="def-label"><Lock size={14} /> Authentication Protocol</span>
            <span className="def-value">JWT Bearer OAuth2</span>
          </div>
          <div className="def-row">
            <span className="def-label"><Key size={14} /> API Access Scope</span>
            <span className="def-value">Read / Write Admin Permissions</span>
          </div>
          <div className="def-row">
            <span className="def-label"><Activity size={14} /> Active Session State</span>
            <span className="def-value"><span className="badge badge-success">Active Token</span></span>
          </div>
          <div className="def-row">
            <span className="def-label"><Shield size={14} /> Password Policy</span>
            <span className="def-value">BCrypt Hashed (Salted)</span>
          </div>
        </div>
      </div>

    </div>
  );
}
