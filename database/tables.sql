-- PostgreSQL Table Schemas for Low-Code smart forms builder database

-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX ix_users_email ON users(email);

-- 2. Forms Table
CREATE TABLE forms (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' NOT NULL,
    current_version INTEGER,
    createdat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. FormVersions Table
CREATE TABLE form_versions (
    id SERIAL PRIMARY KEY,
    formid INTEGER REFERENCES forms(id) ON DELETE CASCADE NOT NULL,
    version_number INTEGER NOT NULL,
    ispublished BOOLEAN DEFAULT FALSE NOT NULL,
    publishedat TIMESTAMP WITH TIME ZONE,
    createdat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Fields Table
CREATE TABLE fields (
    id SERIAL PRIMARY KEY,
    formversion INTEGER REFERENCES form_versions(id) ON DELETE CASCADE NOT NULL,
    label VARCHAR(255) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    placeholder VARCHAR(255),
    required BOOLEAN DEFAULT FALSE NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    validation_conf JSON,
    createdat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. FieldOptions Table
CREATE TABLE field_options (
    id SERIAL PRIMARY KEY,
    field_id INTEGER REFERENCES fields(id) ON DELETE CASCADE NOT NULL,
    optiontext VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL
);

-- 6. ConditionalRules Table
CREATE TABLE conditional_rules (
    id SERIAL PRIMARY KEY,
    trigger_field INTEGER REFERENCES fields(id) ON DELETE CASCADE NOT NULL,
    operator VARCHAR(50) NOT NULL,
    comparison VARCHAR(255),
    targeted_field INTEGER REFERENCES fields(id) ON DELETE CASCADE NOT NULL,
    action VARCHAR(50) NOT NULL,
    logical_group VARCHAR(50)
);

-- 7. Submissions Table
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    form_version INTEGER REFERENCES form_versions(id) ON DELETE CASCADE NOT NULL,
    submission_id VARCHAR(255) UNIQUE NOT NULL,
    submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'started' NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX ix_submissions_submission_id ON submissions(submission_id);

-- 8. UploadedFiles Table
CREATE TABLE uploaded_files (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size INTEGER NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 9. ResponseValues Table
CREATE TABLE response_values (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER REFERENCES submissions(id) ON DELETE CASCADE NOT NULL,
    field_id INTEGER REFERENCES fields(id) ON DELETE CASCADE NOT NULL,
    value TEXT,
    uploaded_file INTEGER REFERENCES uploaded_files(id) ON DELETE SET NULL
);
