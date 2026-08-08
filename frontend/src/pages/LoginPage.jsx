import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, AlertCircle, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function LoginPage({ onLoginSuccess, onNavigateToRegister }) {
  const { t } = useTranslation();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    try {
      setLoading(true);
      await login(email, password);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      setGoogleLoading(true);
      await loginWithGoogle();
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.message || "Google Sign-In failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-form-content">
      {/* Header */}
      <div className="auth-form-header">
        <h2 className="auth-form-title">
          {t("loginPage.administratorSignIn", "Welcome Back")}
        </h2>
        <p className="auth-form-subtitle">
          {t("loginPage.signInToAccess", "Sign in to access your FormCraft HQ workspace")}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="auth-alert-error" role="alert">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="auth-form-fields" noValidate>
        {/* Email Field */}
        <div className="auth-field-group">
          <label className="auth-field-label" htmlFor="login-email">
            {t("loginPage.emailAddress", "Email Address")}
          </label>
          <div className="auth-input-wrapper">
            <Mail size={17} className="input-icon-left" />
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder={t("loginPage.adminExampleCom", "admin@example.com")}
              className="auth-input"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="auth-field-group">
          <div className="label-with-link">
            <label className="auth-field-label" htmlFor="login-password">
              {t("loginPage.password", "Password")}
            </label>
          </div>
          <div className="auth-input-wrapper">
            <Lock size={17} className="input-icon-left" />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="••••••••••••"
              className="auth-input"
            />
            <button
              type="button"
              className="input-icon-right-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || googleLoading}
          className="auth-btn-primary"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span>{t("loginPage.authenticating", "Signing In...")}</span>
            </>
          ) : (
            <>
              <span>{t("loginPage.signIn", "Sign In to Dashboard")}</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="auth-divider">
        <span className="divider-line" />
        <span className="divider-text">{t("loginPage.or", "OR")}</span>
        <span className="divider-line" />
      </div>

      {/* Google Sign-In Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading || googleLoading}
        className="auth-btn-google"
      >
        {googleLoading ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            <span>{t("loginPage.connectingToGoogle", "Connecting...")}</span>
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" className="google-svg">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{t("loginPage.continueWithGoogle", "Continue with Google")}</span>
          </>
        )}
      </button>

      {/* Footer Switcher */}
      <div className="auth-form-footer">
        <p>
          {t("loginPage.donTHaveAnAccount", "Don't have an account?")}{" "}
          <button
            type="button"
            onClick={onNavigateToRegister}
            className="auth-link-btn"
          >
            {t("loginPage.createAnAccount", "Create an Account")}
          </button>
        </p>
      </div>
    </div>
  );
}
