import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  FileText,
  Send,
  GitFork,
  Settings,
  Layers,
  Plus,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Copy,
  Trash2,
  FileUp,
  ChevronRight,
  CheckCircle2,
  User,
  LogIn,
  UserPlus,
  LogOut,
  Shield,
  Loader2,
  Globe,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

// Inside MainDashboard...
import LogoMark from "./components/common/LogoMark";
import StatTile from "./components/dashboard/StatTile";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./components/common/LanguageSelector";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AuthLayout from "./components/auth/AuthLayout";
import LandingPage from "./pages/LandingPage";
import SmoothScroll from "./components/SmoothScroll";
import ProfilePage from "./pages/ProfilePage";
import PublicFormPage from "./pages/PublicFormPage";
import ProtectedRoute from "./components/ProtectedRoute";
import FormsPage from "./pages/FormsPage";
import PublishedFormsPage from "./pages/PublishedFormsPage";
import ConditionalRulesPage from "./pages/ConditionalRulesPage";
import ResponsesPage from "./pages/ResponsesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ReportsExportPage from "./pages/ReportsExportPage";
import TemplatesPage from "./pages/TemplatesPage";
import OverviewPage from "./pages/OverviewPage";
import Skeleton, {
  SkeletonRect,
  SkeletonText,
} from "./components/common/Skeleton";
import ReloadPrompt from "./components/common/ReloadPrompt";

function MainDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("tab") || "overview";
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setMobileNavOpen(false);
  };

  const displayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email || "Administrator"
    : "Guest User";
  const displayInitials = user
    ? (
        (user.first_name?.[0] || "") + (user.last_name?.[0] || "")
      ).toUpperCase() || (user.email?.[0] || "A").toUpperCase()
    : "G";

  return (
    <div className="dashboard-container">
      {/* Mobile Top Navigation Header */}
      <div className="mobile-header">
        <div
          className="brand-logo"
          onClick={() => handleNavClick("overview")}
          style={{ borderBottom: "none", height: "auto", padding: 0 }}
        >
          <div
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "6px",
              background: "#4F46E5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <LogoMark size={15} color="#FFFFFF" />
          </div>
          <span
            style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "#101113",
              letterSpacing: "-0.02em",
            }}
          >
            {t("app.formcraftHq")}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <LanguageSelector compact />
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div
          className="mobile-drawer-overlay"
          onClick={() => setMobileNavOpen(false)}
        >
          <aside
            className="mobile-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="nav-list">
              <li className="nav-section-label">{t("app.workspace")}</li>
              <li>
                <div
                  className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
                  onClick={() => handleNavClick("overview")}
                >
                  <LayoutDashboard size={17} />
                  <span>{t("sidebar.overview")}</span>
                </div>
              </li>
              <li>
                <div
                  className={`nav-item ${activeTab === "forms" ? "active" : ""}`}
                  onClick={() => handleNavClick("forms")}
                >
                  <FileText size={17} />
                  <span>{t("sidebar.forms_portfolio")}</span>
                </div>
              </li>
              <li>
                <div
                  className={`nav-item ${activeTab === "templates" ? "active" : ""}`}
                  onClick={() => handleNavClick("templates")}
                >
                  <Copy size={17} />
                  <span>{t("sidebar.templates")}</span>
                </div>
              </li>
              <li>
                <div
                  className={`nav-item ${activeTab === "submissions" ? "active" : ""}`}
                  onClick={() => handleNavClick("submissions")}
                >
                  <Send size={17} />
                  <span>{t("sidebar.submissions")}</span>
                </div>
              </li>
              <li>
                <div
                  className={`nav-item ${activeTab === "conditions" ? "active" : ""}`}
                  onClick={() => handleNavClick("conditions")}
                >
                  <GitFork size={17} />
                  <span>{t("sidebar.conditional_rules")}</span>
                </div>
              </li>
              <li>
                <div
                  className={`nav-item ${activeTab === "analytics" ? "active" : ""}`}
                  onClick={() => handleNavClick("analytics")}
                >
                  <Layers size={17} />
                  <span>{t("sidebar.analytics")}</span>
                </div>
              </li>
              <li>
                <div
                  className={`nav-item ${activeTab === "reports" ? "active" : ""}`}
                  onClick={() => handleNavClick("reports")}
                >
                  <Download size={17} />
                  <span>{t("sidebar.reports_export")}</span>
                </div>
              </li>

              <li className="nav-section-label">{t("app.account")}</li>
              <li>
                <div
                  className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
                  onClick={() => handleNavClick("profile")}
                >
                  <User size={17} />
                  <span>{t("sidebar.user_profile")}</span>
                </div>
              </li>
              {isAuthenticated ? (
                <li>
                  <div
                    className="nav-item"
                    onClick={() => {
                      setMobileNavOpen(false);
                      logout();
                    }}
                    style={{ color: "#6B7280" }}
                  >
                    <LogOut size={17} />
                    <span>{t("sidebar.sign_out")}</span>
                  </div>
                </li>
              ) : null}
            </ul>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div
          className="brand-logo"
          onClick={() => setActiveTab("overview")}
          style={{
            cursor: "pointer",
            padding: "0.85rem 1rem",
            borderBottom: "1px solid #EAEAEC",
            display: "flex",
            alignItems: "center",
            gap: "0.65rem",
          }}
        >
          <div
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "6px",
              background: "#4F46E5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <LogoMark size={15} color="#FFFFFF" />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "#101113",
                letterSpacing: "-0.02em",
                whiteSpace: "nowrap",
              }}
            >
              {t("app.formcraftHq")}
            </span>
            <span
              style={{
                fontSize: "0.68rem",
                color: "#9CA3AF",
                fontWeight: 500,
              }}
            >
              {t("app.productionWorkspace")}
            </span>
          </div>
        </div>

        <ul className="nav-list">
          <li className="nav-section-label">{t("app.workspace")}</li>
          <li>
            <div
              className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <LayoutDashboard size={17} />
              <span>{t("sidebar.overview")}</span>
            </div>
          </li>
          <li>
            <div
              className={`nav-item ${activeTab === "forms" ? "active" : ""}`}
              onClick={() => setActiveTab("forms")}
            >
              <FileText size={17} />
              <span>{t("sidebar.forms_portfolio")}</span>
            </div>
          </li>
          <li>
            <div
              className={`nav-item ${activeTab === "templates" ? "active" : ""}`}
              onClick={() => setActiveTab("templates")}
            >
              <Copy size={17} />
              <span>{t("sidebar.templates")}</span>
            </div>
          </li>
          <li>
            <div
              className={`nav-item ${activeTab === "submissions" ? "active" : ""}`}
              onClick={() => setActiveTab("submissions")}
            >
              <Send size={17} />
              <span>{t("sidebar.submissions")}</span>
            </div>
          </li>
          <li>
            <div
              className={`nav-item ${activeTab === "conditions" ? "active" : ""}`}
              onClick={() => setActiveTab("conditions")}
            >
              <GitFork size={17} />
              <span>{t("sidebar.conditional_rules")}</span>
            </div>
          </li>
          <li>
            <div
              className={`nav-item ${activeTab === "analytics" ? "active" : ""}`}
              onClick={() => setActiveTab("analytics")}
            >
              <Layers size={17} />
              <span>{t("sidebar.analytics")}</span>
            </div>
          </li>
          <li>
            <div
              className={`nav-item ${activeTab === "reports" ? "active" : ""}`}
              onClick={() => setActiveTab("reports")}
            >
              <Download size={17} />
              <span>{t("sidebar.reports_export")}</span>
            </div>
          </li>

          <li className="nav-section-label">{t("app.language", "Language")}</li>
          <li style={{ padding: "0.2rem 0.5rem 0.5rem 0.5rem" }}>
            <LanguageSelector fullWidth />
          </li>

          <li className="nav-section-label">{t("app.account")}</li>
          <li>
            <div
              className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <User size={17} />
              <span>{t("sidebar.user_profile")}</span>
            </div>
          </li>
          {isAuthenticated ? (
            <li>
              <div
                className="nav-item"
                onClick={logout}
                style={{ color: "#6B7280" }}
              >
                <LogOut size={17} />
                <span>{t("sidebar.sign_out")}</span>
              </div>
            </li>
          ) : null}
        </ul>

        {/* User Profile Footer Card */}
        <div
          style={{
            padding: "0.75rem 0.85rem",
            marginTop: "auto",
            borderTop: "1px solid #EAEAEC",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.6rem 0.75rem",
              background: "#FFFFFF",
              border: "1px solid #EAEAEC",
              borderRadius: "10px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                cursor: "pointer",
                overflow: "hidden",
                flex: 1,
              }}
              onClick={() =>
                setActiveTab(isAuthenticated ? "profile" : "overview")
              }
            >
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: "#4F46E5",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  flexShrink: 0,
                }}
              >
                {displayInitials}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "#101113",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {displayName}
                </span>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "#6B7280",
                    textTransform: "capitalize",
                  }}
                >
                  {isAuthenticated && user
                    ? (user?.role?.toLowerCase() === "administrator" ? t("profile.administrator", "Administrator") : user?.role || t("profile.administrator", "Administrator"))
                    : t("common.not_signed_in", "Not Signed In")}
                </span>
              </div>
            </div>
            {isAuthenticated ? (
              <button
                title={t("app.signOut")}
                onClick={logout}
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "6px",
                  border: "1px solid #EAEAEC",
                  background: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#6B7280",
                  flexShrink: 0,
                }}
              >
                <LogOut size={12} />
              </button>
            ) : null}
          </div>
        </div>
      </aside>

      {/* Main content body */}
      <main className="main-content">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <OverviewPage
            onNavigateToForms={() => setActiveTab("forms")}
            onNavigateToSubmissions={() => setActiveTab("submissions")}
            onNavigateToRules={() => setActiveTab("conditions")}
            onNavigateToAnalytics={() => setActiveTab("analytics")}
            onNavigateToReports={() => setActiveTab("reports")}
          />
        )}

        {/* FORMS PORTFOLIO TAB */}
        {(activeTab === "forms" || activeTab === "published") && (
          <FormsPage
            initialSubTab={activeTab === "published" ? "published" : "all"}
          />
        )}

        {/* TEMPLATES TAB */}
        {activeTab === "templates" && (
          <TemplatesPage
            onNavigateToPublished={() => setActiveTab("published")}
          />
        )}

        {/* SUBMISSIONS TAB */}
        {activeTab === "submissions" && <ResponsesPage />}

        {/* CONDITIONAL RULES TAB */}
        {activeTab === "conditions" && <ConditionalRulesPage />}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && <AnalyticsPage />}

        {/* REPORTS & EXPORT TAB */}
        {activeTab === "reports" && <ReportsExportPage />}

        {/* USER PROFILE TAB */}
        {activeTab === "profile" && (
          <ProtectedRoute onNavigateToLogin={() => setActiveTab("login")}>
            <ProfilePage onLogoutSuccess={() => setActiveTab("login")} />
          </ProtectedRoute>
        )}
      </main>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const { t } = useTranslation();
  const [authMode, setAuthMode] = useState("register");
  const [unauthView, setUnauthView] = useState("landing"); // "landing" | "auth"
  const [currentUrl, setCurrentUrl] = useState(() => window.location.href);

  useEffect(() => {
    const handleUrlChange = () => setCurrentUrl(window.location.href);
    window.addEventListener("popstate", handleUrlChange);
    window.addEventListener("hashchange", handleUrlChange);
    return () => {
      window.removeEventListener("popstate", handleUrlChange);
      window.removeEventListener("hashchange", handleUrlChange);
    };
  }, []);

  // Detect public form URL patterns (path, hash, query parameters)
  const publicFormId = useMemo(() => {
    const path = window.location.pathname;
    const search = window.location.search;
    const hash = window.location.hash;
    const params = new URLSearchParams(search);

    // 1. Hash patterns: #/public/forms/:id, #/forms/public/:id, #/forms/:id
    if (hash) {
      const matchHash =
        hash.match(/#\/public\/forms\/([^/?#]+)/) ||
        hash.match(/#\/forms\/public\/([^/?#]+)/) ||
        hash.match(/#\/forms\/([^/?#]+)/);
      if (matchHash && matchHash[1]) return matchHash[1];
    }

    // 2. Path patterns: /forms/public/:id, /public/forms/:id
    const publicMatch =
      path.match(/\/forms\/public\/([^/]+)/) ||
      path.match(/\/public\/forms\/([^/]+)/);
    if (publicMatch && publicMatch[1]) return publicMatch[1];

    // Pattern: /forms/:id (standalone public URL)
    const formsMatch = path.match(/\/forms\/([^/]+)/);
    if (formsMatch && formsMatch[1] && formsMatch[1] !== "public")
      return formsMatch[1];

    // 3. Query parameters: ?publicFormId=xxx or ?formId=xxx
    if (params.get("publicFormId")) return params.get("publicFormId");
    if (params.get("formId")) return params.get("formId");

    return null;
  }, [currentUrl]);

  // Public form: render standalone, no auth needed
  if (publicFormId) {
    return <PublicFormPage formId={publicFormId} />;
  }

  // Loading state while checking auth
  if (loading) {
    return (
      <div className="auth-page-wrapper">
        <div className="auth-brand-header">
          <div className="auth-brand-logo">
            <LogoMark size={32} color="var(--ledger)" />
            {t("app.formcraft")}
          </div>
        </div>
        <div
          className="auth-card-box"
          style={{
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          <SkeletonText size="lg" width="60%" height={24} />
          <SkeletonText size="sm" width="80%" height={16} />
          <SkeletonRect
            width="100%"
            height={44}
            borderRadius="8px"
            style={{ marginTop: "0.5rem" }}
          />
          <SkeletonRect width="100%" height={44} borderRadius="8px" />
          <SkeletonRect width="100%" height={44} borderRadius="8px" />
        </div>
      </div>
    );
  }

  // Unauthenticated: Landing Page by default, AuthLayout on action
  if (!isAuthenticated) {
    if (unauthView === "landing") {
      return (
        <SmoothScroll>
          <LandingPage
            onOpenAuth={(mode) => {
              if (mode) setAuthMode(mode);
              setUnauthView("auth");
            }}
          />
        </SmoothScroll>
      );
    }

    return (
      <AuthLayout
        authMode={authMode}
        setAuthMode={setAuthMode}
        onBackToLanding={() => setUnauthView("landing")}
      >
        {authMode === "register" ? (
          <RegisterPage onNavigateToLogin={() => setAuthMode("login")} />
        ) : (
          <LoginPage
            onLoginSuccess={() => {
              /* isAuthenticated will flip automatically */
            }}
            onNavigateToRegister={() => setAuthMode("register")}
          />
        )}
      </AuthLayout>
    );
  }

  // Authenticated: full dashboard
  return <MainDashboard />;
}

import { ToastProvider } from "./components/common/Toast";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
        <ReloadPrompt />
      </ToastProvider>
    </AuthProvider>
  );
}
