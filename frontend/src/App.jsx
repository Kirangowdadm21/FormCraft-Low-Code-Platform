import React, { useState, useEffect, useMemo } from 'react'
import { 
  LayoutDashboard, 
  FileText, 
  Send, 
  GitFork, 
  Settings, 
  Layers, 
  Database,
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
  Globe
} from 'lucide-react'
import LogoMark from './components/common/LogoMark'
import StatTile from './components/dashboard/StatTile'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import PublicFormPage from './pages/PublicFormPage'
import ProtectedRoute from './components/ProtectedRoute'
import FormsPage from './pages/FormsPage'
import PublishedFormsPage from './pages/PublishedFormsPage'
import ConditionalRulesPage from './pages/ConditionalRulesPage'
import ResponsesPage from './pages/ResponsesPage'
import AnalyticsPage from './pages/AnalyticsPage'
import ReportsExportPage from './pages/ReportsExportPage'
import TemplatesPage from './pages/TemplatesPage'
import OverviewPage from './pages/OverviewPage'


// Database structure for visualization
const dbTables = [
  {
    name: 'users',
    columns: [
      { name: 'id', type: 'Integer (PK, Serial)', notes: 'Unique identifier' },
      { name: 'first_name', type: 'String(100)', notes: 'First name' },
      { name: 'last_name', type: 'String(100)', notes: 'Last name' },
      { name: 'email', type: 'String(255) (Unique, Index)', notes: 'Login email address' },
      { name: 'password', type: 'String(255)', notes: 'Hashed password' },
      { name: 'role', type: 'String(50)', notes: 'Access roles (e.g. admin, user)' },
      { name: 'is_active', type: 'Boolean', notes: 'Active flag' },
      { name: 'created_at', type: 'DateTime', notes: 'Record creation timestamp' },
      { name: 'updated_at', type: 'DateTime', notes: 'Record update timestamp' }
    ]
  },
  {
    name: 'forms',
    columns: [
      { name: 'id', type: 'Integer (PK, Serial)', notes: 'Unique identifier' },
      { name: 'title', type: 'String(255)', notes: 'Form title' },
      { name: 'description', type: 'Text', notes: 'Form description' },
      { name: 'owner_id', type: 'Integer (FK -> users.id)', notes: 'Owner of the form' },
      { name: 'status', type: 'String(50)', notes: 'Form status (draft, published, archived)' },
      { name: 'current_version', type: 'Integer', notes: 'Version number of active version' },
      { name: 'createdat', type: 'DateTime', notes: 'Creation timestamp' },
      { name: 'updatedat', type: 'DateTime', notes: 'Update timestamp' }
    ]
  },
  {
    name: 'form_versions',
    columns: [
      { name: 'id', type: 'Integer (PK, Serial)', notes: 'Unique identifier' },
      { name: 'formid', type: 'Integer (FK -> forms.id)', notes: 'Form association' },
      { name: 'version_number', type: 'Integer', notes: 'Sequential version number' },
      { name: 'ispublished', type: 'Boolean', notes: 'Version active status' },
      { name: 'publishedat', type: 'DateTime', notes: 'Publication timestamp' },
      { name: 'createdat', type: 'DateTime', notes: 'Snapshot creation timestamp' },
      { name: 'updatedat', type: 'DateTime', notes: 'Update timestamp' }
    ]
  },
  {
    name: 'fields',
    columns: [
      { name: 'id', type: 'Integer (PK, Serial)', notes: 'Unique identifier' },
      { name: 'formversion', type: 'Integer (FK -> form_versions.id)', notes: 'Associated version' },
      { name: 'label', type: 'String(255)', notes: 'Field display label' },
      { name: 'field_name', type: 'String(100)', notes: 'Code slug (e.g. email_address)' },
      { name: 'field_type', type: 'String(50)', notes: 'Type (text, rating, file_upload, etc.)' },
      { name: 'placeholder', type: 'String(255)', notes: 'Helper placeholder text' },
      { name: 'required', type: 'Boolean', notes: 'Is required flag' },
      { name: 'display_order', type: 'Integer', notes: 'Visual sorting order' },
      { name: 'validation_conf', type: 'JSON', notes: 'Limits: min/max length, size limits' },
      { name: 'createdat', type: 'DateTime', notes: 'Creation timestamp' },
      { name: 'updatedat', type: 'DateTime', notes: 'Update timestamp' }
    ]
  },
  {
    name: 'field_options',
    columns: [
      { name: 'id', type: 'Integer (PK, Serial)', notes: 'Unique identifier' },
      { name: 'field_id', type: 'Integer (FK -> fields.id)', notes: 'Associated field' },
      { name: 'optiontext', type: 'String(255)', notes: 'Display text' },
      { name: 'value', type: 'String(255)', notes: 'Returned data value' },
      { name: 'display_order', type: 'Integer', notes: 'Ordering index' }
    ]
  },
  {
    name: 'conditional_rules',
    columns: [
      { name: 'id', type: 'Integer (PK, Serial)', notes: 'Unique identifier' },
      { name: 'trigger_field', type: 'Integer (FK -> fields.id)', notes: 'Control field source' },
      { name: 'operator', type: 'String(50)', notes: 'equals, contains, is_empty, etc.' },
      { name: 'comparison', type: 'String(255)', notes: 'Comparison match criteria' },
      { name: 'targeted_field', type: 'Integer (FK -> fields.id)', notes: 'Target field affected' },
      { name: 'action', type: 'String(50)', notes: 'Action (show, hide, require)' },
      { name: 'logical_group', type: 'String(50)', notes: 'Logical grouping tag' }
    ]
  },
  {
    name: 'submissions',
    columns: [
      { name: 'id', type: 'Integer (PK, Serial)', notes: 'Unique identifier' },
      { name: 'form_version', type: 'Integer (FK -> form_versions.id)', notes: 'Target form version' },
      { name: 'submission_id', type: 'String(255) (Unique, Index)', notes: 'Public hash / UUID identifier' },
      { name: 'submitted_by', type: 'Integer (FK -> users.id)', notes: 'User link (null if anonymous)' },
      { name: 'status', type: 'String(50)', notes: 'Submission status (started, submitted)' },
      { name: 'started_at', type: 'DateTime', notes: 'Start timestamp' },
      { name: 'submitted_at', type: 'DateTime', notes: 'Completion timestamp' }
    ]
  },
  {
    name: 'response_values',
    columns: [
      { name: 'id', type: 'Integer (PK, Serial)', notes: 'Unique identifier' },
      { name: 'submission_id', type: 'Integer (FK -> submissions.id)', notes: 'Associated submission session' },
      { name: 'field_id', type: 'Integer (FK -> fields.id)', notes: 'Associated question field' },
      { name: 'value', type: 'Text', notes: 'Filled response value' },
      { name: 'uploaded_file', type: 'Integer (FK -> uploaded_files.id)', notes: 'Link if attachment' }
    ]
  },
  {
    name: 'uploaded_files',
    columns: [
      { name: 'id', type: 'Integer (PK, Serial)', notes: 'Unique identifier' },
      { name: 'filename', type: 'String(255)', notes: 'File name' },
      { name: 'file_path', type: 'String(512)', notes: 'Storage file location' },
      { name: 'mime_type', type: 'String(100)', notes: 'MIME type (e.g. image/png)' },
      { name: 'size', type: 'Integer', notes: 'File size in bytes' },
      { name: 'uploaded_at', type: 'DateTime', notes: 'Timestamp' }
    ]
  }
]

const conditionalRulesList = [
  { id: 101, trigger: 'Experience Level', operator: 'equals', comparison: 'Senior', target: 'Portfolio Link', action: 'require', group: 'G1' },
  { id: 102, trigger: 'Designation', operator: 'equals', comparison: 'Designer', target: 'Portfolio Link', action: 'show', group: 'G1' },
  { id: 103, trigger: 'Rating Score', operator: 'greater_than', comparison: '8', target: 'Comments (Optional)', action: 'hide', group: 'G2' },
  { id: 104, trigger: 'File Upload Option', operator: 'is_empty', comparison: '', target: 'Explain Reason', action: 'require', group: 'G3' },
]

function MainDashboard() {
  const { user, isAuthenticated, logout } = useAuth()
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'overview';
  })
  const [selectedTable, setSelectedTable] = useState('users')

  const displayName = user 
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email 
    : 'Guest User';
  const displayInitials = user 
    ? ((user.first_name?.[0] || '') + (user.last_name?.[0] || '')).toUpperCase() || user.email[0].toUpperCase() 
    : 'G';

  return (
    <div className="dashboard-container">

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand-logo" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('overview')}>
          <LogoMark size={24} color="var(--ledger)" />
          <span>FormCraft</span>
        </div>

        <ul className="nav-list">
          <li className="nav-section-label">Workspace</li>
          <li>
            <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <LayoutDashboard size={18} />
              <span>Overview</span>
            </div>
          </li>
          <li>
            <div className={`nav-item ${activeTab === 'forms' ? 'active' : ''}`} onClick={() => setActiveTab('forms')}>
              <FileText size={18} />
              <span>Forms Portfolio</span>
            </div>
          </li>
          <li>
            <div className={`nav-item ${activeTab === 'published' ? 'active' : ''}`} onClick={() => setActiveTab('published')}>
              <Globe size={18} />
              <span>Published Forms</span>
            </div>
          </li>
          <li>
            <div className={`nav-item ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => setActiveTab('templates')}>
              <Copy size={18} />
              <span>Templates</span>
            </div>
          </li>
          <li>
            <div className={`nav-item ${activeTab === 'submissions' ? 'active' : ''}`} onClick={() => setActiveTab('submissions')}>
              <Send size={18} />
              <span>Submissions</span>
            </div>
          </li>
          <li>
            <div className={`nav-item ${activeTab === 'conditions' ? 'active' : ''}`} onClick={() => setActiveTab('conditions')}>
              <GitFork size={18} />
              <span>Conditional Rules</span>
            </div>
          </li>
          <li>
            <div className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
              <Layers size={18} />
              <span>Analytics</span>
            </div>
          </li>
          <li>
            <div className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
              <Download size={18} />
              <span>Reports & Export</span>
            </div>
          </li>
          <li>
            <div className={`nav-item ${activeTab === 'dbschema' ? 'active' : ''}`} onClick={() => setActiveTab('dbschema')}>
              <Database size={18} />
              <span>Database Schema</span>
            </div>
          </li>

          <li className="nav-section-label">Account</li>
          <li>
            <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              <User size={18} />
              <span>User Profile</span>
            </div>
          </li>
          {isAuthenticated ? (
            <li>
              <div 
                className="nav-item" 
                onClick={logout}
                style={{ color: 'var(--stamp)' }}
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </div>
            </li>
          ) : null}
        </ul>

        {/* User Profile Footer */}
        <div className="user-profile" style={{ justifyContent: 'space-between' }}>
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', overflow: 'hidden' }}
            onClick={() => setActiveTab(isAuthenticated ? 'profile' : 'overview')}
          >
            <div className="avatar">{displayInitials}</div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {displayName}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {isAuthenticated ? (user.role || 'User') : 'Not Signed In'}
              </span>
            </div>
          </div>
          {isAuthenticated ? (
            <button 
              title="Logout"
              onClick={logout} 
              className="btn-destructive-subtle"
            >
              <LogOut size={15} />
            </button>
          ) : null}
        </div>
      </aside>

      {/* Main content body */}
      <main className="main-content">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <OverviewPage onNavigateToForms={() => setActiveTab('forms')} />
        )}

        {/* FORMS PORTFOLIO TAB */}
        {activeTab === 'forms' && (
          <FormsPage onNavigateToPublished={() => setActiveTab('published')} />
        )}

        {/* PUBLISHED FORMS TAB */}
        {activeTab === 'published' && (
          <PublishedFormsPage />
        )}

        {/* TEMPLATES TAB */}
        {activeTab === 'templates' && (
          <TemplatesPage onNavigateToPublished={() => setActiveTab('published')} />
        )}

        {/* SUBMISSIONS TAB */}
        {activeTab === 'submissions' && (
          <ResponsesPage />
        )}

        {/* CONDITIONAL RULES TAB */}
        {activeTab === 'conditions' && (
          <ConditionalRulesPage />
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <AnalyticsPage />
        )}

        {/* REPORTS & EXPORT TAB */}
        {activeTab === 'reports' && (
          <ReportsExportPage />
        )}

        {/* DATABASE SCHEMA TAB */}
        {activeTab === 'dbschema' && (
          <div>
            <div className="header">
              <div className="header-title">
                <h1>PostgreSQL Database Schema Explorer</h1>
                <p>Catalog of tables created by migrations in database `smart_forms`.</p>
              </div>
            </div>

            <div className="charts-grid" style={{ gridTemplateColumns: '1fr 3fr' }}>
              
              {/* Tables list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {dbTables.map((table) => (
                  <div
                    key={table.name}
                    className={`nav-item ${selectedTable === table.name ? 'active' : ''}`}
                    style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    onClick={() => setSelectedTable(table.name)}
                  >
                    <span>{table.name}</span>
                    <ChevronRight size={14} />
                  </div>
                ))}
              </div>

              {/* Table details */}
              <div className="data-card" style={{ marginTop: 0 }}>
                <h3 style={{ fontFamily: 'monospace', marginBottom: '1.5rem', fontSize: '1.4rem' }}>{selectedTable}</h3>
                <div className="table-wrapper">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Column Name</th>
                        <th>Data Type / Constraints</th>
                        <th>Function & Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbTables.find(t => t.name === selectedTable).columns.map((col, idx) => (
                        <tr key={idx}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>{col.name}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{col.type}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{col.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* USER PROFILE TAB */}
        {activeTab === 'profile' && (
          <ProtectedRoute onNavigateToLogin={() => setActiveTab('login')}>
            <ProfilePage onLogoutSuccess={() => setActiveTab('login')} />
          </ProtectedRoute>
        )}



      </main>
    </div>
  )
}

function AppContent() {
  const { isAuthenticated, loading } = useAuth()
  const [authMode, setAuthMode] = useState('register')
  const [currentUrl, setCurrentUrl] = useState(() => window.location.href)

  useEffect(() => {
    const handleUrlChange = () => setCurrentUrl(window.location.href)
    window.addEventListener('popstate', handleUrlChange)
    window.addEventListener('hashchange', handleUrlChange)
    return () => {
      window.removeEventListener('popstate', handleUrlChange)
      window.removeEventListener('hashchange', handleUrlChange)
    }
  }, [])

  // Detect public form URL patterns (path, hash, query parameters)
  const publicFormId = useMemo(() => {
    const path = window.location.pathname
    const search = window.location.search
    const hash = window.location.hash
    const params = new URLSearchParams(search)

    // 1. Hash patterns: #/public/forms/:id, #/forms/public/:id, #/forms/:id
    if (hash) {
      const matchHash = hash.match(/#\/public\/forms\/([^/?#]+)/) ||
                        hash.match(/#\/forms\/public\/([^/?#]+)/) ||
                        hash.match(/#\/forms\/([^/?#]+)/)
      if (matchHash && matchHash[1]) return matchHash[1]
    }

    // 2. Path patterns: /forms/public/:id, /public/forms/:id
    const publicMatch = path.match(/\/forms\/public\/([^/]+)/) ||
                        path.match(/\/public\/forms\/([^/]+)/)
    if (publicMatch && publicMatch[1]) return publicMatch[1]

    // Pattern: /forms/:id (standalone public URL)
    const formsMatch = path.match(/\/forms\/([^/]+)/)
    if (formsMatch && formsMatch[1] && formsMatch[1] !== 'public') return formsMatch[1]

    // 3. Query parameters: ?publicFormId=xxx or ?formId=xxx
    if (params.get('publicFormId')) return params.get('publicFormId')
    if (params.get('formId')) return params.get('formId')

    return null
  }, [currentUrl])

  // Public form: render standalone, no auth needed
  if (publicFormId) {
    return <PublicFormPage formId={publicFormId} />
  }

  // Loading state while checking auth
  if (loading) {
    return (
      <div className="auth-page-wrapper">
        <Loader2 size={36} className="animate-spin" style={{ color: 'var(--ledger)' }} />
      </div>
    )
  }

  // Unauthenticated: show clean auth card
  if (!isAuthenticated) {
    return (
      <div className="auth-page-wrapper">

        {/* Brand Header */}
        <div className="auth-brand-header">
          <div className="auth-brand-logo">
            <LogoMark size={32} color="var(--ledger)" />
            FormCraft
          </div>
          <p className="auth-brand-subtext">
            Low-Code Workflow Automation &amp; Intelligent Data Collection Registry
          </p>
        </div>

        {/* Auth Card */}
        <div className="auth-card-box">
          {authMode === 'register' ? (
            <RegisterPage
              onNavigateToLogin={() => setAuthMode('login')}
            />
          ) : (
            <LoginPage
              onLoginSuccess={() => {/* isAuthenticated will flip automatically */}}
              onNavigateToRegister={() => setAuthMode('register')}
            />
          )}
        </div>
      </div>
    )
  }

  // Authenticated: full dashboard
  return <MainDashboard />
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
