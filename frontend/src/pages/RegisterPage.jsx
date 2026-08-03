import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import LogoMark from '../components/common/LogoMark';

export default function RegisterPage({ onNavigateToLogin }) {
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Front-end validation
    if (!formData.email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!formData.password) {
      setError('Please enter a password.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      // Automatically assign role as Administrator
      await register({
        ...formData,
        role: 'Administrator'
      });
      setSuccess(true);
      setTimeout(() => {
        if (onNavigateToLogin) {
          onNavigateToLogin();
        }
      }, 1500);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="data-card" style={{ padding: '2.5rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '4px',
          background: 'var(--ledger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto'
        }}>
          <LogoMark size={24} color="var(--paper)" />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.35rem' }}>Create Administrator</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Set up primary admin credentials to access FormCraft
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{
          background: '#FAF0EC',
          border: '1px solid var(--stamp)',
          borderRadius: '4px',
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: 'var(--stamp)',
          fontSize: '0.9rem',
          fontWeight: 500
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div style={{
          background: '#E6ECEB',
          border: '1px solid var(--ledger)',
          borderRadius: '4px',
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: 'var(--ledger)',
          fontSize: '0.9rem',
          fontWeight: 500
        }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>Administrator account created! Redirecting to Sign In...</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Name Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-firstname">
              First Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="register-firstname"
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Admin"
                className="form-input"
                style={{
                  width: '100%',
                  paddingLeft: '2.5rem'
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-lastname">
              Last Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="register-lastname"
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="User"
                className="form-input"
                style={{
                  width: '100%',
                  paddingLeft: '2.5rem'
                }}
              />
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label" htmlFor="register-email">
            Email Address *
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="register-email"
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              className="form-input"
              style={{
                width: '100%',
                paddingLeft: '2.5rem'
              }}
            />
          </div>
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="register-password">
            Password *
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="register-password"
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="form-input"
              style={{
                width: '100%',
                paddingLeft: '2.5rem'
              }}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || success}
          className="btn-primary"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '0.75rem',
            marginTop: '0.5rem',
            opacity: loading || success ? 0.7 : 1,
            cursor: loading || success ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Register Administrator</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

      </form>

      {/* Footer link to Login */}
      <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--rule)' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Already registered?{' '}
          <button
            onClick={onNavigateToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--ledger)',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Sign In
          </button>
        </p>
      </div>

    </div>
  );
}
