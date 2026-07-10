# Low-Code Workflow Automation & Intelligent Data Collection Platform

## Project Overview
This project implements a smart form builder platform, containing a FastAPI + SQLAlchemy backend, a React.js admin dashboard frontend, and PostgreSQL database configurations. It is designed to let users create forms, define versioned fields, construct conditional logic rules, and capture analytics on submissions.

## Features / Completed Tasks
- **Authentication**: JWT-based secure user registration, login, profile retrieval, and logout token revocation.
- **Forms CRUD**: Complete endpoints to create, list, read, update (PATCH), and delete (DELETE) forms.
- **Fields CRUD**: Complete endpoints to create, list, read, update (PATCH), and delete (DELETE) form fields and options.
- **Form Lifecycle**: Form publishing (`/publish` link), version history tracking, public form rendering without authentication (`/public`), and archiving (`/archive`).
- **Rules CRUD**: Full CRUD endpoints to manage conditional logic rules (e.g. show/hide fields dynamically).
- **Submissions**: Endpoints to capture and list submission records, response values, and files.
- **Analytics**: Submission analytics (started, completed, and completion rates).

## Technology Stack
- **Backend Core**: Python, FastAPI, SQLAlchemy ORM, Pydantic, Alembic migrations.
- **Database**: PostgreSQL.
- **Frontend Core**: React.js, Vite, Tailwind CSS.
- **Security**: OAuth2 Bearer JWT Tokens, Bcrypt password hashing.

## Workspace Layout
```
Low-Code-Workflow-Automation/
│
├── backend/                  # FastAPI Web Backend
│   ├── main.py               # Entrypoint & router aggregator
│   ├── database.py           # Engine & SessionLocal initializer
│   ├── models.py             # SQLAlchemy models defining 9 DB schemas
│   ├── schemas.py            # Pydantic validation schemas
│   ├── crud.py               # Database queries
│   ├── routes/               # API route endpoints
│   │   ├── users.py
│   │   ├── forms.py
│   │   ├── fields.py
│   │   ├── rules.py
│   │   ├── submissions.py
│   │   └── analytics.py
│   ├── uploads/              # Local uploaded files storage
│   ├── requirements.txt      # Python dependencies specifications
│   └── .env                  # Configuration variables
│
├── frontend/                 # React.js Admin Dashboard (Vite project)
│   ├── public/               # Public assets
│   ├── src/                  # React source files
│   │   ├── components/       # Reusable layout controls
│   │   ├── pages/            # Page structures
│   │   ├── App.jsx           # Dashboard root layout & state logic
│   │   └── main.jsx          # React app entry renderer
│   ├── package.json          # Node packages manifest
│   └── vite.config.js        # Vite compilation tool setting
│
├── database/
│   └── tables.sql            # Raw PostgreSQL schemas layout script
│
├── README.md                 # Complete project documentation
├── API_GUIDE.md             # Detailed request/response examples and cURL guide
└── .gitignore                # Untracked files configuration
```

## Installation & Setup

### Database Configuration
Ensure PostgreSQL is active. Execute the schema initialization script:
```bash
psql -U postgres -d postgres -f database/tables.sql
```

### Running the Backend
1. Enter backend folder and install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
2. Configure `.env` database details:
   ```ini
   DATABASE_URL=postgresql://postgres:password@localhost:5432/smart_forms
   ```
3. Start the FastAPI uvicorn server:
   ```bash
   python -m uvicorn main:app --reload
   ```

### Running the Frontend
1. Enter frontend folder and install packages:
   ```bash
   cd frontend
   npm install
   ```
2. Run Vite dev server:
   ```bash
   npm run dev
   ```

## API Documentation
- **Interactive Swagger Docs**: Available at [http://localhost:8000/docs](http://localhost:8000/docs) when backend is running.
- **Detailed API Guide**: For comprehensive request/response payloads and cURL commands, see [API_GUIDE.md](API_GUIDE.md).

## Environment Variables
Configured in `backend/.env`:
- `DATABASE_URL`: Connection string (e.g. `postgresql://postgres:Kirangowda21@localhost:5432/smart_forms`)
- `JWT_SECRET_KEY`: String used to sign session JWTs.

## Current Project Status
All core modules, form publishing, archiving, field operations, and rules logic CRUD are fully implemented, tested, and validated.
