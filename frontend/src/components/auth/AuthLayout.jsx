import React from "react";
import { useTranslation } from "react-i18next";
import { Zap, ShieldCheck, BarChart3, Sparkles, ArrowLeft } from "lucide-react";
import LogoMark from "../common/LogoMark";
import LanguageSelector from "../common/LanguageSelector";

export default function AuthLayout({ children, authMode, setAuthMode, onBackToLanding }) {
  const { t } = useTranslation();

  return (
    <div className="auth-split-screen">
      {/* LEFT PANEL: Single Solid Color Branding Showcase */}
      <div className="auth-brand-panel">
        {/* Top Header Logo */}
        <div className="auth-panel-header">
          <div
            className="auth-brand-pill"
            onClick={onBackToLanding}
            title={t("landing.backToHome", "Back to Home Page")}
            style={{ cursor: onBackToLanding ? "pointer" : "default" }}
          >
            <div className="brand-logo-icon">
              <LogoMark size={20} color="#FFFFFF" />
            </div>
            <span className="brand-logo-text">{t("app.formcraftHq", "FormCraft HQ")}</span>
          </div>
          <span className="auth-badge-pill">Enterprise v2.4</span>
        </div>

        {/* Hero Content */}
        <div className="auth-hero-content">
          <div className="auth-hero-tag">
            <Sparkles size={14} color="#4F46E5" />
            <span>Next-Gen Form Automation</span>
          </div>
          <h1 className="auth-hero-title">
            Intelligent Data Collection & Workflow Automation
          </h1>
          <p className="auth-hero-subtitle">
            Build high-converting forms, run real-time conditional logic rules, and analyze submission telemetry seamlessly.
          </p>

          {/* Key Feature Stack */}
          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="feature-icon-box">
                <Zap size={18} />
              </div>
              <div>
                <h4>Low-Code Rule Engine</h4>
                <p>Configure dynamic branching, field dependencies, and auto-calculations without coding.</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="feature-icon-box">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4>Enterprise Security & Compliance</h4>
                <p>Role-based access, JWT authentication, and secure encrypted submissions.</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="feature-icon-box">
                <BarChart3 size={18} />
              </div>
              <div>
                <h4>Real-Time Telemetry & Reports</h4>
                <p>Instant submission response charts, multi-format CSV/PDF exports, and audit logs.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Footer */}
        <div className="auth-panel-footer">
          <span>© 2026 FormCraft HQ. All rights reserved.</span>
        </div>
      </div>

      {/* RIGHT PANEL: Sleek Auth Form Container */}
      <div className="auth-form-panel">
        <div className="auth-top-nav">
          {onBackToLanding && (
            <button
              type="button"
              className="auth-back-home-btn"
              onClick={onBackToLanding}
            >
              <ArrowLeft size={16} />
              <span>{t("landing.backToHome", "Back to Home")}</span>
            </button>
          )}
          <LanguageSelector compact />
        </div>

        <div className="auth-form-card-wrapper">
          {/* Header Mode Switcher Pills */}
          <div className="auth-mode-tab-pills">
            <button
              type="button"
              className={`auth-tab-pill ${authMode === "login" ? "active" : ""}`}
              onClick={() => setAuthMode("login")}
            >
              {t("loginPage.signIn", "Sign In")}
            </button>
            <button
              type="button"
              className={`auth-tab-pill ${authMode === "register" ? "active" : ""}`}
              onClick={() => setAuthMode("register")}
            >
              {t("loginPage.createAnAccount", "Create Account")}
            </button>
          </div>

          {/* Active Auth Form */}
          <div className="auth-card-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
