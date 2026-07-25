import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, onNavigateToLogin }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        color: 'var(--text-secondary)'
      }}>
        <Loader2 className="animate-spin" size={36} color="var(--primary)" style={{ marginBottom: '1rem' }} />
        <p>Verifying authentication session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="data-card" style={{
        textAlign: 'center',
        padding: '3rem 2rem',
        maxWidth: '500px',
        margin: '4rem auto'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}>
          <Lock size={32} />
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', fontWeight: 700 }}>Access Restricted</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: '1.5' }}>
          You must be logged in to view this section. Please sign in with your account credentials.
        </p>
        <button
          className="btn-primary"
          style={{ margin: '0 auto' }}
          onClick={onNavigateToLogin}
        >
          Go to Login Page
        </button>
      </div>
    );
  }

  return children;
}
