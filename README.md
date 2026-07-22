# Low-Code Workflow Automation & Intelligent Data Collection Platform

## Project Overview
A smart form builder platform built with FastAPI and React.js. Users can create forms, define versioned fields, configure conditional logic rules, capture submissions, and view analytics — all through a clean admin dashboard.

---

## Technology Stack
- **Backend**: Python, FastAPI, SQLAlchemy ORM, Pydantic, Alembic
- **Database**: PostgreSQL
- **Frontend**: React.js, Vite, Tailwind CSS
- **Security**: OAuth2 Bearer JWT Tokens, Bcrypt password hashing

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
│   ├── routes/               # API route modules
│   │   ├── users.py
│   │   ├── forms.py
│   │   ├── fields.py
│   │   ├── rules.py
│   │   ├── submissions.py
│   │   ├── analytics.py
│   │   ├── templates.py
│   │   └── qrcodes.py
│   ├── uploads/              # Uploaded file storage
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
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
JWT_SECRET_KEY=your_secret_key
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
- **User Management Frontend**: React.js components for user registration (`RegisterPage`), login (`LoginPage`), profile management (`ProfilePage`), authentication context (`AuthContext`), and protected route guards (`ProtectedRoute`). Integrates directly with FastAPI backend APIs (`POST /users/register`, `POST /users/login`, `GET /users/profile`, `POST /users/logout`) with automatic Bearer JWT header attachment and localStorage token persistence.
- **Authentication**: JWT-based registration, login, profile retrieval, and token revocation.
- **Forms CRUD**: Create, list, read, update, and delete forms.
- **Fields CRUD**: Manage form fields and field options.
- **Form Lifecycle**: Publishing, version history, public rendering, and archiving.
- **Rules CRUD**: Conditional logic rules to show/hide fields dynamically.
- **Submissions**: Capture, list, and retrieve submissions; public anonymous submission with required-field validation.
- **Responses & File Uploads**: File upload with local storage and PostgreSQL metadata; response CRUD with filtering.
- **Analytics & Export**: Dashboard metrics, per-form analytics, submission trends (daily/monthly), and CSV/JSON/PDF data export.
- **Form Templates**: Create reusable form blueprints/templates with nested fields and options, and instantiate new forms with unique field copies from them.
- **QR Code Generation**: Create, list, view, and delete QR codes for any target URL with automatic PNG image generation and disk storage/cleanup.

---

## Current Project Status
All core modules and React user management frontend views are fully implemented, tested, and validated — including authentication, form lifecycle management, conditional rules, submissions, file uploads, analytics, data export, form templates, and QR code generation.

---

## Additional Documentation
| Document | Description |
|---|---|
| [API_GUIDE.md](API_GUIDE.md) | Full API reference with request/response payloads and cURL examples |
| [walkthrough.md](walkthrough.md) | Implementation details, migration history, and testing notes |
