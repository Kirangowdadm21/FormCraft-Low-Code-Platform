import React, { useState } from 'react'
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
  Sparkles,
  ChevronRight,
  CheckCircle2
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts'

// Mock Data
const initialForms = [
  { id: 1, title: 'Job Application Form', description: 'HR department recruitment questionnaire.', owner: 'Madhuvanth DM', status: 'published', current_version: 2, createdat: '2026-06-15', fields_count: 14 },
  { id: 2, title: 'Product Feedback Survey', description: 'Post-launch feedback for FormCraft v1.', owner: 'Madhuvanth DM', status: 'published', current_version: 1, createdat: '2026-06-28', fields_count: 8 },
  { id: 3, title: 'Tech Quiz 2026', description: 'Internal developers check.', owner: 'Madhuvanth DM', status: 'published', current_version: 1, createdat: '2026-07-01', fields_count: 12 },
  { id: 4, title: 'Contact Us Inquiry', description: 'General contact form for respondents.', owner: 'Madhuvanth DM', status: 'published', current_version: 3, createdat: '2026-05-10', fields_count: 5 },
  { id: 5, title: 'Event Registration Form', description: 'Signup sheet for upcoming technology hackathon.', owner: 'Madhuvanth DM', status: 'draft', current_version: null, createdat: '2026-07-03', fields_count: 9 },
]

const recentSubmissions = [
  { id: 'SUB-4841', form: 'Job Application Form', respondent: 'R. Kumar', fields_filled: '14/14', duration: '4m 12s', date: '10:14 AM', status: 'Complete' },
  { id: 'SUB-4840', form: 'Product Feedback Survey', respondent: 'A. Singh', fields_filled: '8/8', duration: '1m 48s', date: '10:12 AM', status: 'Complete' },
  { id: 'SUB-4839', form: 'Tech Quiz 2026', respondent: 'P. Joshi', fields_filled: '12/12', duration: '6m 02s', date: '10:10 AM', status: 'Complete' },
  { id: 'SUB-4838', form: 'Contact Us Inquiry', respondent: 'M. Nair', fields_filled: '3/5', duration: '--', date: '10:08 AM', status: 'Partial' },
  { id: 'SUB-4837', form: 'Event Registration Form', respondent: 'S. Rao', fields_filled: '9/9', duration: '2m 34s', date: '10:06 AM', status: 'Complete' },
]

const submissionChartData = [
  { name: 'Mon', submissions: 120 },
  { name: 'Tue', submissions: 180 },
  { name: 'Wed', submissions: 156 },
  { name: 'Thu', submissions: 240 },
  { name: 'Fri', submissions: 198 },
  { name: 'Sat', submissions: 290 },
  { name: 'Sun', submissions: 486 },
]

const fieldTypeData = [
  { name: 'Text Input', value: 24, color: '#8b5cf6' },
  { name: 'Dropdown', value: 12, color: '#3b82f6' },
  { name: 'Rating Scale', value: 8, color: '#ec4899' },
  { name: 'File Upload', value: 6, color: '#f59e0b' },
  { name: 'Checkboxes', value: 10, color: '#10b981' },
]

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

export default function App() {
  const [activeTab, setActiveTab] = useState('overview')
  const [forms, setForms] = useState(initialForms)
  const [filterForm, setFilterForm] = useState('All')
  const [selectedTable, setSelectedTable] = useState('users')

  const handleDuplicate = (form) => {
    const newForm = {
      ...form,
      id: forms.length + 1,
      title: `${form.title} (Copy)`,
      status: 'draft',
      createdat: new Date().toISOString().split('T')[0],
      current_version: null
    }
    setForms([...forms, newForm])
  }

  const handleDelete = (id) => {
    setForms(forms.filter(f => f.id !== id))
  }

  return (
    <div className="dashboard-container">
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand-logo">
          <Sparkles size={24} color="#8b5cf6" />
          <span>FormCraft</span>
        </div>
        <ul className="nav-list">
          <li>
            <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <LayoutDashboard size={20} />
              <span>Overview</span>
            </div>
          </li>
          <li>
            <div className={`nav-item ${activeTab === 'forms' ? 'active' : ''}`} onClick={() => setActiveTab('forms')}>
              <FileText size={20} />
              <span>Forms Portfolio</span>
            </div>
          </li>
          <li>
            <div className={`nav-item ${activeTab === 'submissions' ? 'active' : ''}`} onClick={() => setActiveTab('submissions')}>
              <Send size={20} />
              <span>Submissions</span>
            </div>
          </li>
          <li>
            <div className={`nav-item ${activeTab === 'conditions' ? 'active' : ''}`} onClick={() => setActiveTab('conditions')}>
              <GitFork size={20} />
              <span>Conditional Rules</span>
            </div>
          </li>
          <li>
            <div className={`nav-item ${activeTab === 'dbschema' ? 'active' : ''}`} onClick={() => setActiveTab('dbschema')}>
              <Database size={20} />
              <span>Database Schema</span>
            </div>
          </li>
        </ul>
        <div className="user-profile">
          <div className="avatar">M</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Madhuvanth DM</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Project Owner</span>
          </div>
        </div>
      </aside>

      {/* Main content body */}
      <main className="main-content">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            <div className="header">
              <div className="header-title">
                <h1>Dashboard Overview</h1>
                <p>Welcome back! Here is what is happening on your smart form builder platform.</p>
              </div>
              <button className="btn-primary" onClick={() => setActiveTab('forms')}>
                <Plus size={18} />
                <span>Create New Form</span>
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div>
                  <span className="stat-label">Active Forms</span>
                  <h3 className="stat-value">{forms.filter(f => f.status === 'published').length}</h3>
                  <span className="stat-trend trend-up">
                    <ArrowUpRight size={12} style={{ marginRight: 2 }} />
                    5 in draft
                  </span>
                </div>
                <div className="stat-icon">
                  <FileText size={24} />
                </div>
              </div>

              <div className="stat-card">
                <div>
                  <span className="stat-label">Submissions Today</span>
                  <h3 className="stat-value">486</h3>
                  <span className="stat-trend trend-up">
                    <ArrowUpRight size={12} style={{ marginRight: 2 }} />
                    12.3% vs yesterday
                  </span>
                </div>
                <div className="stat-icon">
                  <Send size={24} />
                </div>
              </div>

              <div className="stat-card">
                <div>
                  <span className="stat-label">Avg. Completion Rate</span>
                  <h3 className="stat-value">67%</h3>
                  <span className="stat-trend trend-up">
                    <ArrowUpRight size={12} style={{ marginRight: 2 }} />
                    Top performing: 94%
                  </span>
                </div>
                <div className="stat-icon">
                  <CheckCircle2 size={24} />
                </div>
              </div>

              <div className="stat-card">
                <div>
                  <span className="stat-label">Pending Reviews</span>
                  <h3 className="stat-value">3</h3>
                  <span className="stat-trend trend-down">
                    <ArrowDownRight size={12} style={{ marginRight: 2 }} />
                    2 awaiting export
                  </span>
                </div>
                <div className="stat-icon">
                  <Settings size={24} />
                </div>
              </div>
            </div>

            {/* Graphs Grid */}
            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-header">
                  <span className="chart-title">Submissions per Form (Today)</span>
                </div>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={submissionChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                      <YAxis stroke="var(--text-muted)" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#131520', borderColor: 'var(--border-color)', borderRadius: 10 }} />
                      <Area type="monotone" dataKey="submissions" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorSubmissions)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <span className="chart-title">Fields distribution</span>
                </div>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fieldTypeData} layout="vertical" margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" stroke="var(--text-muted)" fontSize={10} />
                      <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={10} width={80} />
                      <Tooltip contentStyle={{ backgroundColor: '#131520', borderColor: 'var(--border-color)', borderRadius: 10 }} />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16}>
                        {fieldTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Submissions Table */}
            <div className="data-card">
              <div className="chart-header">
                <span className="chart-title">Recent Submissions</span>
              </div>
              <div className="table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Sub ID</th>
                      <th>Form</th>
                      <th>Respondent</th>
                      <th>Fields</th>
                      <th>Time Taken</th>
                      <th>Submitted At</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSubmissions.map((sub, idx) => (
                      <tr key={idx}>
                        <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{sub.id}</td>
                        <td style={{ fontWeight: 500 }}>{sub.form}</td>
                        <td>{sub.respondent}</td>
                        <td style={{ fontFamily: 'monospace' }}>{sub.fields_filled}</td>
                        <td>{sub.duration}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{sub.date}</td>
                        <td>
                          <span className={`badge ${sub.status === 'Complete' ? 'badge-success' : 'badge-partial'}`}>
                            {sub.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* FORMS PORTFOLIO TAB */}
        {activeTab === 'forms' && (
          <div>
            <div className="header">
              <div className="header-title">
                <h1>Forms Portfolio</h1>
                <p>Manage, version, publish, and duplicate your intelligent collection schemas.</p>
              </div>
              <button className="btn-primary" onClick={() => {
                const title = prompt("Enter form title:")
                if (title) {
                  setForms([...forms, {
                    id: forms.length + 1,
                    title,
                    description: 'No description provided.',
                    owner: 'Madhuvanth DM',
                    status: 'draft',
                    current_version: null,
                    createdat: new Date().toISOString().split('T')[0],
                    fields_count: 0
                  }])
                }
              }}>
                <Plus size={18} />
                <span>Create New Draft</span>
              </button>
            </div>

            <div className="data-card">
              <div className="table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Form Title</th>
                      <th>Owner</th>
                      <th>Status</th>
                      <th>Current Version</th>
                      <th>Total Fields</th>
                      <th>Created On</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forms.map((form) => (
                      <tr key={form.id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{form.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{form.description}</div>
                        </td>
                        <td>{form.owner}</td>
                        <td>
                          <span className={`badge ${form.status === 'published' ? 'badge-success' : 'badge-draft'}`}>
                            {form.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{form.current_version || '--'}</td>
                        <td style={{ fontFamily: 'monospace', textAlign: 'center' }}>{form.fields_count}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{form.createdat}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => handleDuplicate(form)}>
                              <Copy size={16} />
                            </button>
                            <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => handleDelete(form.id)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUBMISSIONS TAB */}
        {activeTab === 'submissions' && (
          <div>
            <div className="header">
              <div className="header-title">
                <h1>Submissions Browser</h1>
                <p>View client responses, verify conditional outputs, and download response datasets.</p>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <select style={{ backgroundColor: '#131520', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)', padding: '0.5rem 1rem' }} onChange={(e) => setFilterForm(e.target.value)}>
                  <option value="All">All Forms</option>
                  {forms.map(f => <option key={f.id} value={f.title}>{f.title}</option>)}
                </select>
                <button className="btn-primary" onClick={() => alert("CSV Export complete!")}>
                  <Download size={18} />
                  <span>Export responses</span>
                </button>
              </div>
            </div>

            <div className="data-card">
              <div className="table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Submission UUID</th>
                      <th>Respondent Name</th>
                      <th>Answer Preview</th>
                      <th>Attachments</th>
                      <th>Submitted On</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSubmissions
                      .filter(sub => filterForm === 'All' || sub.form === filterForm)
                      .map((sub, idx) => (
                        <tr key={idx}>
                          <td style={{ color: 'var(--primary)', fontFamily: 'monospace', fontWeight: 600 }}>{sub.id}</td>
                          <td style={{ fontWeight: 500 }}>{sub.respondent}</td>
                          <td style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            {sub.form === 'Job Application Form' ? '{"role": "Senior Dev", "experience": "5 yrs"}' : '{"satisfaction": 9}'}
                          </td>
                          <td>
                            {sub.form === 'Job Application Form' ? (
                              <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>resume.pdf</span>
                            ) : '--'}
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{sub.date}</td>
                          <td>
                            <span className={`badge ${sub.status === 'Complete' ? 'badge-success' : 'badge-partial'}`}>
                              {sub.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CONDITIONAL RULES TAB */}
        {activeTab === 'conditions' && (
          <div>
            <div className="header">
              <div className="header-title">
                <h1>Conditional rules logic</h1>
                <p>Rules enforced server-side at submission time to validate fields show/hide behaviors.</p>
              </div>
            </div>

            <div className="data-card">
              <div className="table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Rule ID</th>
                      <th>Trigger Field</th>
                      <th>Operator</th>
                      <th>Comparison Match</th>
                      <th>Target Field</th>
                      <th>Action</th>
                      <th>Logical Group</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conditionalRulesList.map((rule) => (
                      <tr key={rule.id}>
                        <td style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>#{rule.id}</td>
                        <td style={{ fontWeight: 600 }}>{rule.trigger}</td>
                        <td>{rule.operator}</td>
                        <td>"{rule.comparison || 'N/A'}"</td>
                        <td style={{ fontWeight: 600 }}>{rule.target}</td>
                        <td>
                          <span className={`badge ${rule.action === 'require' ? 'badge-partial' : 'badge-success'}`}>
                            {rule.action.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{rule.group}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
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

      </main>
    </div>
  )
}
