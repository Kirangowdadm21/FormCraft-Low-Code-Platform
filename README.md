# Low-Code Workflow Automation & Intelligent Data Collection Platform

## Project Overview
A smart form builder platform built with FastAPI, Firebase Authentication, and React.js. Users can create forms, define versioned fields, configure conditional logic rules, capture submissions, and view analytics — all through a clean admin dashboard.

---

## Technology Stack
- **Backend**: Python, FastAPI, Firebase Admin SDK, SQLAlchemy ORM, Pydantic, Alembic
- **Authentication**: Firebase Authentication (Email/Password), Firebase Admin SDK ID Token verification
- **Database**: PostgreSQL
- **Frontend**: React.js, Vite, Firebase Web SDK
- **Security**: Firebase ID Token Bearer Verification, Bcrypt password hashing

---

## Project Structure
```
Low-Code-Workflow-Automation/
├── backend/
│   ├── main.py               # Entrypoint & router aggregator
│   ├── database.py           # DB engine & session setup
│   ├── models.py             # SQLAlchemy models
│   ├── schemas.py            # Pydantic schemas
│   ├── crud.py               # Database queries
│   ├── security.py           # Firebase Admin SDK & token verification
│   ├── routes/               # API route modules
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── forms.py
│   │   ├── fields.py
│   │   ├── rules.py
│   │   ├── submissions.py
│   │   ├── analytics.py
│   │   ├── templates.py
│   │   ├── qrcodes.py
│   │   └── reports.py
│   ├── uploads/              # Uploaded file storage
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── firebase.js       # Firebase Web SDK initialization
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── .env.local
│   └── vite.config.js
├── database/
│   └── tables.sql
├── README.md
├── API_GUIDE.md
└── .gitignore
```

---

## Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL 14+
- Firebase Project with Email/Password Authentication enabled

---

## Installation & Setup

### 1. Database Setup
Ensure PostgreSQL is running, then initialize the schema:
```bash
psql -U postgres -d postgres -f database/tables.sql
```

### 2. Backend
```bash
cd backend
pip install -r requirements.txt
```

Configure `backend/.env`:
```ini
DATABASE_URL=postgresql://postgres:password@localhost:5432/smart_forms
FIREBASE_PROJECT_ID=formcraft-752c9
# Optional path to Service Account JSON
# FIREBASE_SERVICE_ACCOUNT_PATH=path/to/service-account.json
```

Start the server:
```bash
python -m uvicorn main:app --reload
```

### 3. Frontend
```bash
cd frontend
npm install
```

Configure `frontend/.env.local`:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Start the frontend development server:
```bash
npm run dev
```

---

## API Documentation
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs) (available when backend is running)
- **Detailed API Guide**: See [API_GUIDE.md](API_GUIDE.md) for full endpoint reference, request/response examples, and cURL commands.

---

## Completed Features
- **Firebase Authentication (Email/Password)**: Fully integrated frontend & backend authentication using Firebase Web SDK (`createUserWithEmailAndPassword`, `signInWithEmailAndPassword`) and Firebase Admin SDK (`verify_firebase_token`).
- **User Management Frontend**: React.js components for user registration (`RegisterPage`), login (`LoginPage`), profile management (`ProfilePage`), authentication context (`AuthContext`), and protected route guards (`ProtectedRoute`). Automatically attaches Firebase Bearer ID Tokens to all backend API calls.
- **Backend Token Verification (`security.py`)**: Reusable FastAPI dependency (`verify_firebase_token` & `get_current_user`) verifying Firebase ID Tokens and auto-provisioning PostgreSQL user records to maintain foreign key integrity across user-owned resources.
- **Forms CRUD**: Create, list, read, update, and delete forms.
- **Fields CRUD**: Manage form fields and field options.
- **Form Lifecycle**: Publishing, version history, public rendering, and archiving.
- **Rules CRUD**: Conditional logic rules to show/hide fields dynamically.
- **Submissions**: Capture, list, and retrieve submissions; public anonymous submission with required-field validation.
- **Responses & File Uploads**: File upload with local storage and PostgreSQL metadata; response CRUD with filtering.
- **Analytics & Export**: Dashboard metrics, per-form analytics, submission trends (daily/monthly), and CSV/JSON/PDF data export.
- **Form Templates**: Create reusable form blueprints/templates with nested fields and options, and instantiate new forms with unique field copies from them.
- **QR Code Generation**: Create, list, view, and delete QR codes for any target URL with automatic PNG image generation and disk storage/cleanup.
- **Independent Reports Module (`/reports`)**: Standalone read-only reporting router providing structured `{ summary, data }` responses for dashboard, forms, single-form detail, templates, QR codes, submissions, responses, and report export generation (JSON, CSV, PDF).

---

## Current Project Status
All core modules, Firebase Email/Password authentication, and React frontend views are fully implemented, tested, and validated — including form lifecycle management, conditional rules, submissions, file uploads, analytics, data export, form templates, QR code generation, and independent reports.

---

## Additional Documentation
| Document | Description |
|---|---|
| [API_GUIDE.md](API_GUIDE.md) | Full API reference with request/response payloads and cURL examples |
| [walkthrough.md](walkthrough.md) | Implementation details, migration history, and testing notes |
