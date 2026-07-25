import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Hash, Calendar, LogOut, Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

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
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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
        <Loader2 className="animate-spin" size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
        <p style={{ fontSize: '1rem', fontWeight: 500 }}>Fetching User Profile from API...</p>
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
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.12)',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto'
        }}>
          <AlertCircle size={28} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>Unauthorized or Session Expired</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
          Unable to retrieve user credentials. Please log in again.
        </p>
        <button className="btn-primary" style={{ margin: '0 auto' }} onClick={handleLogout}>
          <LogOut size={16} />
          <span>Return to Login</span>
        </button>
      </div>
    );
  }

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'User Profile';
  const initials = ((user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')).toUpperCase() || 'U';

  return (
    <div style={{ maxWidth: '720px', margin: '1rem auto', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Header card */}
      <div className="data-card" style={{ padding: '2.5rem 2rem', marginBottom: '1.5rem', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div className="avatar" style={{ width: '72px', height: '72px', fontSize: '1.75rem', border: '3px solid rgba(139, 92, 246, 0.4)' }}>
            {initials}
          </div>
          <div style={{ flexGrow: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{fullName}</h1>
              <span className={`badge ${user?.role === 'admin' ? 'badge-partial' : 'badge-success'}`}>
                <Shield size={12} />
                {user?.role ? user.role.toUpperCase() : 'USER'}
              </span>
              {user?.is_active && (
                <span className="badge badge-success">
                  <CheckCircle2 size={12} />
                  Active
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
              {user?.email}
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '12px',
              padding: '0.75rem 1.25rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: loggingOut ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'var(--transition-smooth)'
            }}
          >
            {loggingOut ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <LogOut size={16} />
            )}
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="data-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          Account Specifications & Metadata
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          
          {/* User ID */}
          <div style={{ background: 'rgba(10, 11, 18, 0.5)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              <Hash size={18} color="var(--primary)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>User ID</span>
            </div>
            <span style={{ fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>
              #{user?.id}
            </span>
          </div>

          {/* First Name */}
          <div style={{ background: 'rgba(10, 11, 18, 0.5)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              <User size={18} color="var(--primary)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>First Name</span>
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>
              {user?.first_name || 'N/A'}
            </span>
          </div>

          {/* Last Name */}
          <div style={{ background: 'rgba(10, 11, 18, 0.5)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              <User size={18} color="var(--primary)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Last Name</span>
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>
              {user?.last_name || 'N/A'}
            </span>
          </div>

          {/* Email */}
          <div style={{ background: 'rgba(10, 11, 18, 0.5)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              <Mail size={18} color="var(--primary)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email Address</span>
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 600, wordBreak: 'break-all' }}>
              {user?.email}
            </span>
          </div>

          {/* Role */}
          <div style={{ background: 'rgba(10, 11, 18, 0.5)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              <Shield size={18} color="var(--primary)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Assigned Role</span>
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 600, textTransform: 'capitalize' }}>
              {user?.role || 'user'}
            </span>
          </div>

          {/* Account Creation Date */}
          <div style={{ background: 'rgba(10, 11, 18, 0.5)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              <Calendar size={18} color="var(--primary)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Account Creation Date</span>
            </div>
            <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
              {formatDate(user?.created_at)}
            </span>
          </div>

        </div>

        {/* Refresh Profile Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              background: 'none',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              borderRadius: '10px',
              padding: '0.5rem 1rem',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem'
            }}
          >
            {refreshing ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <RefreshCw size={14} />
            )}
            <span>Refresh Profile Data</span>
          </button>
        </div>

      </div>
    </div>
  );
}
