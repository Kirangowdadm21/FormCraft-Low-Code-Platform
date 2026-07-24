# Low-Code Workflow Automation & Intelligent Data Collection Platform - API Guide

This document contains detailed request/response examples and cURL testing commands for all modules in the platform backend.

---

## Authentication API (/auth)

The backend implements a JWT-based authentication system under the `/auth` router with secure password hashing (using `bcrypt`) and server-side token revocation (Logout) stored in a `revoked_tokens` table.

### 1. User Registration (Register)
Creates a new user profile with a hashed password.

- **URL**: `/auth/register`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "password": "mysecurepassword123",
    "role": "user"
  }
  ```
- **Response** (Status `201 Created`):
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "id": 1,
    "is_active": true,
    "created_at": "2026-07-05T12:00:00Z",
    "updated_at": "2026-07-05T12:00:00Z"
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X POST "http://localhost:8000/auth/register" \
       -H "Content-Type: application/json" \
       -d '{"first_name": "John", "last_name": "Doe", "email": "john.doe@example.com", "password": "mysecurepassword123", "role": "user"}'
  ```

---

### 2. User Login (Login)
Validates email and password, issuing a JWT access token.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`

> [!NOTE]
> The backend also exposes a Form-URL-Encoded login endpoint at `/auth/login-form` (hidden from the main Swagger documentation listing but configured as the OAuth2 `tokenUrl`). This ensures the **Authorize** button in the Swagger UI works natively by prompting you for username (email) and password in form fields.

- **Request Body**:
  ```json
  {
    "email": "john.doe@example.com",
    "password": "mysecurepassword123"
  }
  ```
- **Response** (Status `200 OK`):
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X POST "http://localhost:8000/auth/login" \
       -H "Content-Type: application/json" \
       -d '{"email": "john.doe@example.com", "password": "mysecurepassword123"}'
  ```

---

### 3. User Profile
Retrieves the logged-in user's profile info. Requires a valid JWT token in the Authorization header.

- **URL**: `/auth/profile`
- **Method**: `GET`
- **Headers**: 
  - `Authorization: Bearer <your_jwt_token>`
- **Response** (Status `200 OK`):
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "id": 1,
    "is_active": true,
    "created_at": "2026-07-05T12:00:00Z",
    "updated_at": "2026-07-05T12:00:00Z"
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X GET "http://localhost:8000/auth/profile" \
       -H "Authorization: Bearer <your_jwt_token>"
  ```

---

### 4. User Logout
Logs out the user and revokes the JWT token server-side.

- **URL**: `/auth/logout`
- **Method**: `POST`
- **Headers**:
  - `Authorization: Bearer <your_jwt_token>`
- **Response** (Status `200 OK`):
  ```json
  {
    "message": "Successfully logged out"
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X POST "http://localhost:8000/auth/logout" \
       -H "Authorization: Bearer <your_jwt_token>"
  ```

---

## User Management API (/users)

The administrator User Management module provides full CRUD management for user accounts.

### 5. List All Users (GET /users)
Retrieves a paginated list of user accounts.

- **URL**: `/users`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Testing with cURL**:
  ```bash
  curl -X GET "http://localhost:8000/users?skip=0&limit=50" \
       -H "Authorization: Bearer <admin_token>"
  ```

### 6. Get User by ID (GET /users/{id})
Retrieves specific user account details.

- **URL**: `/users/{id}`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <admin_token>`

### 7. Create User Account (POST /users)
Creates a new user account (admin function).

- **URL**: `/users`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <admin_token>`, `Content-Type: application/json`

### 8. Update User Account (PATCH /users/{id})
Partially updates user details (first name, last name, email, password, role, is_active).

- **URL**: `/users/{id}`
- **Method**: `PATCH`
- **Headers**: `Authorization: Bearer <admin_token>`, `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "first_name": "Jane",
    "role": "admin"
  }
  ```

### 9. Delete User Account (DELETE /users/{id})
Deletes a user account by ID.

- **URL**: `/users/{id}`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer <admin_token>`

---

## Forms & Fields CRUD APIs

### 5. Form Update (PATCH /forms/{form_id})
Partially updates an existing form's metadata.

- **URL**: `/forms/{form_id}`
- **Method**: `PATCH`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "description": "Updated form description!",
    "status": "published"
  }
  ```
- **Response** (Status `200 OK`):
  ```json
  {
    "title": "Customer Feedback Survey",
    "description": "Updated form description!",
    "status": "published",
    "id": 1,
    "owner_id": 1,
    "current_version": 1,
    "createdat": "2026-07-10T12:00:00Z",
    "updatedat": "2026-07-10T12:05:00Z",
    "versions": []
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X PATCH "http://localhost:8000/forms/1" \
       -H "Content-Type: application/json" \
       -d '{"description": "Updated form description!", "status": "published"}'
  ```

---

### 6. Form Delete (DELETE /forms/{form_id})
Deletes a form and all associated versions, fields, options, and submissions.

- **URL**: `/forms/{form_id}`
- **Method**: `DELETE`
- **Response** (Status `200 OK`):
  ```json
  {
    "message": "Form successfully deleted"
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X DELETE "http://localhost:8000/forms/1"
  ```

---

### 7. Create Field (POST /fields/)
Creates a new form field directly under a specific Form Version.

- **URL**: `/fields/`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "formversion": 1,
    "label": "Email Address",
    "field_name": "email_addr",
    "field_type": "email",
    "required": true,
    "display_order": 2,
    "placeholder": "Enter your email",
    "options": [
      {
        "optiontext": "Work",
        "value": "work",
        "display_order": 1
      },
      {
        "optiontext": "Personal",
        "value": "personal",
        "display_order": 2
      }
    ]
  }
  ```
- **Response** (Status `201 Created`):
  ```json
  {
    "label": "Email Address",
    "field_name": "email_addr",
    "field_type": "email",
    "placeholder": "Enter your email",
    "required": true,
    "display_order": 2,
    "validation_conf": null,
    "id": 2,
    "formversion": 1,
    "createdat": "2026-07-10T12:10:00Z",
    "updatedat": "2026-07-10T12:10:00Z",
    "options": [
      {
        "optiontext": "Work",
        "value": "work",
        "display_order": 1,
        "id": 1,
        "field_id": 2
      },
      {
        "optiontext": "Personal",
        "value": "personal",
        "display_order": 2,
        "id": 2,
        "field_id": 2
      }
    ]
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X POST "http://localhost:8000/fields/" \
       -H "Content-Type: application/json" \
       -d '{"formversion": 1, "label": "Email Address", "field_name": "email_addr", "field_type": "email", "required": true, "display_order": 2, "placeholder": "Enter your email", "options": [{"optiontext": "Work", "value": "work", "display_order": 1}, {"optiontext": "Personal", "value": "personal", "display_order": 2}]}'
  ```

---

### 8. List Fields (GET /fields/)
Retrieves all fields, with optional filtering by `formversion_id`.

- **URL**: `/fields/` (or `/fields/?formversion_id=1`)
- **Method**: `GET`
- **Response** (Status `200 OK`):
  ```json
  [
    {
      "label": "Email Address",
      "field_name": "email_addr",
      "field_type": "email",
      "placeholder": "Enter your email",
      "required": true,
      "display_order": 2,
      "validation_conf": null,
      "id": 2,
      "formversion": 1,
      "createdat": "2026-07-10T12:10:00Z",
      "updatedat": "2026-07-10T12:10:00Z",
      "options": [...]
    }
  ]
  ```

- **Testing with cURL**:
  ```bash
  curl -X GET "http://localhost:8000/fields/?formversion_id=1"
  ```

---

### 9. Get Field by ID (GET /fields/{field_id})
Retrieves a specific field by its unique ID.

- **URL**: `/fields/{field_id}`
- **Method**: `GET`
- **Response** (Status `200 OK`):
  ```json
  {
    "label": "Email Address",
    "field_name": "email_addr",
    "field_type": "email",
    "placeholder": "Enter your email",
    "required": true,
    "display_order": 2,
    "validation_conf": null,
    "id": 2,
    "formversion": 1,
    "createdat": "2026-07-10T12:10:00Z",
    "updatedat": "2026-07-10T12:10:00Z",
    "options": [...]
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X GET "http://localhost:8000/fields/2"
  ```

---

### 10. Update Field (PATCH /fields/{field_id})
Partially updates an existing field's attributes and options.

- **URL**: `/fields/{field_id}`
- **Method**: `PATCH`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "label": "Primary Email Address",
    "placeholder": "e.g. john@example.com",
    "options": [
      {
        "optiontext": "Office",
        "value": "office",
        "display_order": 1
      },
      {
        "optiontext": "Home",
        "value": "home",
        "display_order": 2
      }
    ]
  }
  ```
- **Response** (Status `200 OK`):
  ```json
  {
    "label": "Primary Email Address",
    "field_name": "email_addr",
    "field_type": "email",
    "placeholder": "e.g. john@example.com",
    "required": true,
    "display_order": 2,
    "validation_conf": null,
    "id": 2,
    "formversion": 1,
    "createdat": "2026-07-10T12:10:00Z",
    "updatedat": "2026-07-10T12:15:00Z",
    "options": [
      {
        "optiontext": "Office",
        "value": "office",
        "display_order": 1,
        "id": 3,
        "field_id": 2
      },
      {
        "optiontext": "Home",
        "value": "home",
        "display_order": 2,
        "id": 4,
        "field_id": 2
      }
    ]
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X PATCH "http://localhost:8000/fields/2" \
       -H "Content-Type: application/json" \
       -d '{"label": "Primary Email Address", "placeholder": "e.g. john@example.com", "options": [{"optiontext": "Office", "value": "office", "display_order": 1}, {"optiontext": "Home", "value": "home", "display_order": 2}]}'
  ```

---

### 11. Delete Field (DELETE /fields/{field_id})
Deletes a field and its cascade deleted options.

- **URL**: `/fields/{field_id}`
- **Method**: `DELETE`
- **Response** (Status `200 OK`):
  ```json
  {
    "message": "Field successfully deleted"
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X DELETE "http://localhost:8000/fields/2"
  ```

---

## Form Lifecycle & Conditional Rules APIs

### 12. Create Publish Link (POST /forms/{form_id}/publish)
Marks the form as published, updates its active version, and returns a public URL.

- **URL**: `/forms/{form_id}/publish` (Optional query: `?version_number=1`)
- **Method**: `POST`
- **Response** (Status `200 OK`):
  ```json
  {
    "message": "Form successfully published",
    "publish_url": "/forms/public/1",
    "status": "published",
    "current_version": 1
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X POST "http://localhost:8000/forms/1/publish?version_number=1"
  ```

---

### 13. Get Form Versions (GET /forms/{form_id}/versions)
Retrieves all historical and draft versions of a form.

- **URL**: `/forms/{form_id}/versions`
- **Method**: `GET`
- **Response** (Status `200 OK`):
  ```json
  [
    {
      "version_number": 1,
      "ispublished": true,
      "id": 1,
      "formid": 1,
      "publishedat": "2026-07-10T15:30:00Z",
      "createdat": "2026-07-10T15:00:00Z",
      "updatedat": "2026-07-10T15:30:00Z",
      "fields": [...]
    }
  ]
  ```

- **Testing with cURL**:
  ```bash
  curl -X GET "http://localhost:8000/forms/1/versions"
  ```

---

### 14. Get Public Form without Authentication (GET /forms/public/{form_id})
Exposes a lightweight, public schema of the currently active/published form version for collection rendering (no auth required).

- **URL**: `/forms/public/{form_id}`
- **Method**: `GET`
- **Response** (Status `200 OK`):
  ```json
  {
    "id": 1,
    "title": "Customer Feedback Survey",
    "description": "Form for testing lifecycle and rules",
    "current_version": 1,
    "fields": [
      {
        "label": "Are you a student?",
        "field_name": "is_student",
        "field_type": "dropdown",
        "placeholder": null,
        "required": true,
        "display_order": 1,
        "validation_conf": null,
        "id": 3,
        "formversion": 1,
        "createdat": "2026-07-10T15:00:00Z",
        "updatedat": "2026-07-10T15:00:00Z",
        "options": [...]
      }
    ]
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X GET "http://localhost:8000/forms/public/1"
  ```

---

### 15. Archive Form (POST /forms/{form_id}/archive)
Archives a form, updating its status to `"archived"` and preventing any public access.

- **URL**: `/forms/{form_id}/archive`
- **Method**: `POST`
- **Response** (Status `200 OK`):
  ```json
  {
    "title": "Customer Feedback Survey",
    "description": "Form for testing lifecycle and rules",
    "status": "archived",
    "id": 1,
    "owner_id": 1,
    "current_version": 1,
    "createdat": "2026-07-10T15:00:00Z",
    "updatedat": "2026-07-10T15:40:00Z",
    "versions": []
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X POST "http://localhost:8000/forms/1/archive"
  ```

---

### 16. Create Conditional Rule (POST /rules/)
Creates a new display or logic rule for form rendering.

- **URL**: `/rules/`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "trigger_field": 3,
    "operator": "equals",
    "comparison": "yes",
    "targeted_field": 4,
    "action": "show"
  }
  ```
- **Response** (Status `201 Created`):
  ```json
  {
    "trigger_field": 3,
    "operator": "equals",
    "comparison": "yes",
    "targeted_field": 4,
    "action": "show",
    "id": 1
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X POST "http://localhost:8000/rules/" \
       -H "Content-Type: application/json" \
       -d '{"trigger_field": 3, "operator": "equals", "comparison": "yes", "targeted_field": 4, "action": "show"}'
  ```

---

### 17. List Conditional Rules (GET /rules/)
Retrieves rules, optionally filtered by `trigger_field` or `targeted_field`.

- **URL**: `/rules/` (Optional query: `?trigger_field=3`)
- **Method**: `GET`
- **Response** (Status `200 OK`):
  ```json
  [
    {
      "trigger_field": 3,
      "operator": "equals",
      "comparison": "yes",
      "targeted_field": 4,
      "action": "show",
      "id": 1
    }
  ]
  ```

- **Testing with cURL**:
  ```bash
  curl -X GET "http://localhost:8000/rules/?trigger_field=3"
  ```

---

### 18. Get Rule by ID (GET /rules/{rule_id})
Retrieves a specific rule by its unique ID.

- **URL**: `/rules/{rule_id}`
- **Method**: `GET`
- **Response** (Status `200 OK`):
  ```json
  {
    "trigger_field": 3,
    "operator": "equals",
    "comparison": "yes",
    "targeted_field": 4,
    "action": "show",
    "id": 1
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X GET "http://localhost:8000/rules/1"
  ```

---

### 19. Update Rule (PATCH /rules/{rule_id})
Partially updates an existing rule's logic or fields.

- **URL**: `/rules/{rule_id}`
- **Method**: `PATCH`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "operator": "not_equals",
    "comparison": "no"
  }
  ```
- **Response** (Status `200 OK`):
  ```json
  {
    "trigger_field": 3,
    "operator": "not_equals",
    "comparison": "no",
    "targeted_field": 4,
    "action": "show",
    "id": 1
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X PATCH "http://localhost:8000/rules/1" \
       -H "Content-Type: application/json" \
       -d '{"operator": "not_equals", "comparison": "no"}'
  ```

---

### 20. Delete Rule (DELETE /rules/{rule_id})
Deletes a rule logic configuration.

- **URL**: `/rules/{rule_id}`
- **Method**: `DELETE`
- **Response** (Status `200 OK`):
  ```json
  {
    "message": "Rule successfully deleted"
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X DELETE "http://localhost:8000/rules/1"
  ```

---

## Form Templates APIs

The templates module allows administrators/users to define reusable blueprints (Templates and Template Fields) to instantiate fresh forms, ensuring that subsequent changes to the forms are isolated.

### 21. Create Template (POST /templates)
Creates a reusable form template with nested fields and options.

- **URL**: `/templates/`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "title": "Customer Feedback Template",
    "description": "Standard feedback template for customer service evaluations",
    "fields": [
      {
        "label": "Full Name",
        "field_name": "full_name",
        "field_type": "text",
        "required": true,
        "display_order": 1,
        "placeholder": "Enter your name"
      },
      {
        "label": "Satisfaction Rating",
        "field_name": "satisfaction",
        "field_type": "dropdown",
        "required": false,
        "display_order": 2,
        "placeholder": "Select your rating",
        "options": [
          {"optiontext": "Satisfied", "value": "satisfied", "display_order": 1},
          {"optiontext": "Unsatisfied", "value": "unsatisfied", "display_order": 2}
        ]
      }
    ]
  }
  ```
- **Response** (Status `201 Created`):
  ```json
  {
    "title": "Customer Feedback Template",
    "description": "Standard feedback template for customer service evaluations",
    "id": 1,
    "createdat": "2026-07-17T15:40:00Z",
    "updatedat": "2026-07-17T15:40:00Z",
    "fields": [
      {
        "label": "Full Name",
        "field_name": "full_name",
        "field_type": "text",
        "placeholder": "Enter your name",
        "required": true,
        "display_order": 1,
        "validation_conf": null,
        "options": null,
        "id": 1,
        "template_id": 1,
        "createdat": "2026-07-17T15:40:00Z",
        "updatedat": "2026-07-17T15:40:00Z"
      },
      {
        "label": "Satisfaction Rating",
        "field_name": "satisfaction",
        "field_type": "dropdown",
        "placeholder": "Select your rating",
        "required": false,
        "display_order": 2,
        "validation_conf": null,
        "options": [
          {"optiontext": "Satisfied", "value": "satisfied", "display_order": 1},
          {"optiontext": "Unsatisfied", "value": "unsatisfied", "display_order": 2}
        ],
        "id": 2,
        "template_id": 1,
        "createdat": "2026-07-17T15:40:00Z",
        "updatedat": "2026-07-17T15:40:00Z"
      }
    ]
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X POST "http://localhost:8000/templates/" \
       -H "Content-Type: application/json" \
       -d '{"title": "Customer Feedback Template", "description": "Standard feedback template", "fields": [{"label": "Full Name", "field_name": "full_name", "field_type": "text", "required": true, "display_order": 1, "placeholder": "Enter your name"}]}'
  ```

---

### 22. List Templates (GET /templates)
Retrieves a list of all reusable form templates.

- **URL**: `/templates/` (Optional query: `?skip=0&limit=100`)
- **Method**: `GET`
- **Response** (Status `200 OK`):
  ```json
  [
    {
      "title": "Customer Feedback Template",
      "description": "Standard feedback template for customer service evaluations",
      "id": 1,
      "createdat": "2026-07-17T15:40:00Z",
      "updatedat": "2026-07-17T15:40:00Z",
      "fields": [...]
    }
  ]
  ```

- **Testing with cURL**:
  ```bash
  curl -X GET "http://localhost:8000/templates/?limit=10"
  ```

---

### 23. Get Template by ID (GET /templates/{template_id})
Retrieves a single template configuration.

- **URL**: `/templates/{template_id}`
- **Method**: `GET`
- **Response** (Status `200 OK`):
  ```json
  {
    "title": "Customer Feedback Template",
    "description": "Standard feedback template for customer service evaluations",
    "id": 1,
    "createdat": "2026-07-17T15:40:00Z",
    "updatedat": "2026-07-17T15:40:00Z",
    "fields": [...]
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X GET "http://localhost:8000/templates/1"
  ```

---

### 24. Update Template (PATCH /templates/{template_id})
Partially updates a template's details or entirely replaces its fields.

- **URL**: `/templates/{template_id}`
- **Method**: `PATCH`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "title": "Updated Feedback Template",
    "fields": [
      {
        "label": "Short Feedback Comment",
        "field_name": "comment",
        "field_type": "text",
        "required": false,
        "display_order": 1
      }
    ]
  }
  ```
- **Response** (Status `200 OK`):
  ```json
  {
    "title": "Updated Feedback Template",
    "description": "Standard feedback template for customer service evaluations",
    "id": 1,
    "createdat": "2026-07-17T15:40:00Z",
    "updatedat": "2026-07-17T15:45:00Z",
    "fields": [
      {
        "label": "Short Feedback Comment",
        "field_name": "comment",
        "field_type": "text",
        "placeholder": null,
        "required": false,
        "display_order": 1,
        "validation_conf": null,
        "options": null,
        "id": 3,
        "template_id": 1,
        "createdat": "2026-07-17T15:45:00Z",
        "updatedat": "2026-07-17T15:45:00Z"
      }
    ]
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X PATCH "http://localhost:8000/templates/1" \
       -H "Content-Type: application/json" \
       -d '{"title": "Updated Feedback Template"}'
  ```

---

### 25. Delete Template (DELETE /templates/{template_id})
Deletes a template and all associated template fields.

- **URL**: `/templates/{template_id}`
- **Method**: `DELETE`
- **Response** (Status `200 OK`):
  ```json
  {
    "message": "Template successfully deleted"
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X DELETE "http://localhost:8000/templates/1"
  ```

---

### 26. Create Form from Template (POST /templates/{template_id}/create-form)
Generates a new, independent Form based on the specified template. Copies all fields and field options into fresh Form database records under an active Version 1.

- **URL**: `/templates/{template_id}/create-form` (Query parameter: `owner_id`)
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Request Body (Optional)**:
  ```json
  {
    "title": "Overridden Form Title",
    "description": "Overridden Form Description"
  }
  ```
- **Response** (Status `201 Created`):
  ```json
  {
    "title": "Overridden Form Title",
    "description": "Overridden Form Description",
    "status": "draft",
    "id": 10,
    "owner_id": 1,
    "current_version": null,
    "createdat": "2026-07-17T15:50:00Z",
    "updatedat": "2026-07-17T15:50:00Z",
    "versions": [
      {
        "version_number": 1,
        "ispublished": false,
        "id": 5,
        "formid": 10,
        "publishedat": null,
        "createdat": "2026-07-17T15:50:00Z",
        "updatedat": "2026-07-17T15:50:00Z",
        "fields": [
          {
            "label": "Short Feedback Comment",
            "field_name": "comment",
            "field_type": "text",
            "placeholder": null,
            "required": false,
            "display_order": 1,
            "validation_conf": null,
            "id": 20,
            "formversion": 5,
            "createdat": "2026-07-17T15:50:00Z",
            "updatedat": "2026-07-17T15:50:00Z",
            "options": []
          }
        ]
      }
    ]
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X POST "http://localhost:8000/templates/1/create-form?owner_id=1" \
       -H "Content-Type: application/json" \
       -d '{"title": "Custom Customer Satisfaction Form"}'
  ```

---

## QR Code Generation APIs

The QR Code module allows generating, managing, and retrieving QR code images for any target URL. QR images are saved as PNG files on disk and cleaned up on deletion. This module operates independently from all other modules.

### 27. Create QR Code (POST /qrcodes)
Generates a QR code image for the specified target URL and saves it to disk.

- **URL**: `/qrcodes`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "title": "Feedback Form Link",
    "target_url": "https://example.com/forms/public/1"
  }
  ```
- **Response** (Status `201 Created`):
  ```json
  {
    "title": "Feedback Form Link",
    "target_url": "https://example.com/forms/public/1",
    "qr_image_path": "uploads/qrcodes/a1b2c3d4e5f6.png",
    "id": 1,
    "created_at": "2026-07-17T19:00:00Z"
  }
  ```

- **Validation**: Only `http://` and `https://` URLs are accepted. Invalid URLs return `400 Bad Request`.

- **Testing with cURL**:
  ```bash
  curl -X POST "http://localhost:8000/qrcodes" \
       -H "Content-Type: application/json" \
       -d '{"title": "Feedback Form Link", "target_url": "https://example.com/forms/public/1"}'
  ```

---

### 28. List QR Codes (GET /qrcodes)
Retrieves all QR code records.

- **URL**: `/qrcodes` (Optional query: `?skip=0&limit=100`)
- **Method**: `GET`
- **Response** (Status `200 OK`):
  ```json
  [
    {
      "title": "Feedback Form Link",
      "target_url": "https://example.com/forms/public/1",
      "qr_image_path": "uploads/qrcodes/a1b2c3d4e5f6.png",
      "id": 1,
      "created_at": "2026-07-17T19:00:00Z"
    }
  ]
  ```

- **Testing with cURL**:
  ```bash
  curl -X GET "http://localhost:8000/qrcodes?limit=10"
  ```

---

### 29. Get QR Code by ID (GET /qrcodes/{qr_id})
Retrieves a specific QR code record by its unique ID.

- **URL**: `/qrcodes/{qr_id}`
- **Method**: `GET`
- **Response** (Status `200 OK`):
  ```json
  {
    "title": "Feedback Form Link",
    "target_url": "https://example.com/forms/public/1",
    "qr_image_path": "uploads/qrcodes/a1b2c3d4e5f6.png",
    "id": 1,
    "created_at": "2026-07-17T19:00:00Z"
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X GET "http://localhost:8000/qrcodes/1"
  ```

---

### 30. Delete QR Code (DELETE /qrcodes/{qr_id})
Deletes a QR code record and removes the associated PNG image file from disk.

- **URL**: `/qrcodes/{qr_id}`
- **Method**: `DELETE`
- **Response** (Status `200 OK`):
  ```json
  {
    "message": "QR Code successfully deleted"
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X DELETE "http://localhost:8000/qrcodes/1"
  ```

---

## Reports API (/reports)

The Reports module is a completely independent backend feature. It performs only read (SELECT) operations across existing database records, returning standardized responses with a `summary` overview and detailed `data`.

### 31. Get Dashboard Report (GET /reports/dashboard)
Retrieves a consolidated high-level overview of system metrics across users, forms, submissions, templates, and QR codes.

- **URL**: `/reports/dashboard`
- **Method**: `GET`
- **Response** (Status `200 OK`):
  ```json
  {
    "summary": {
      "generated_at": "2026-07-24T21:59:00Z",
      "report_type": "Dashboard",
      "total_forms": 15,
      "published_forms": 10,
      "draft_forms": 5,
      "archived_forms": 0,
      "total_templates": 5,
      "total_qrcodes": 12,
      "total_submissions": 245,
      "total_responses": 245,
      "completion_rate": 95.5
    },
    "data": {
      "users_count": 8,
      "forms_summary": { "total": 15, "published": 10, "draft": 5, "archived": 0 },
      "submissions_summary": { "total": 245, "completed": 234, "completion_rate": 95.5 },
      "modules_count": { "templates": 5, "qrcodes": 12, "responses": 245 }
    }
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X GET "http://localhost:8000/reports/dashboard"
  ```

---

### 32. Get Forms Summary Report (GET /reports/forms)
Retrieves a summary and array of forms with status, fields count, response count, and last submission date.

- **URL**: `/reports/forms`
- **Method**: `GET`
- **Response** (Status `200 OK`):
  ```json
  {
    "summary": {
      "generated_at": "2026-07-24T21:59:00Z",
      "report_type": "Forms Report",
      "total_forms": 15,
      "published_forms": 10,
      "draft_forms": 5,
      "archived_forms": 0,
      "total_fields": 48,
      "total_responses": 245
    },
    "data": [
      {
        "id": 1,
        "title": "Customer Feedback Form",
        "description": "General survey",
        "status": "published",
        "owner_id": 1,
        "current_version": 1,
        "createdat": "2026-07-10T12:00:00Z",
        "updatedat": "2026-07-10T12:00:00Z",
        "number_of_fields": 4,
        "number_of_responses": 20,
        "last_submission_date": "2026-07-24T20:00:00Z"
      }
    ]
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X GET "http://localhost:8000/reports/forms"
  ```

---

### 33. Get Single Form Report (GET /reports/forms/{form_id})
Retrieves detailed report breakdown for a single form including versions, fields, options, and submission metrics.

- **URL**: `/reports/forms/{form_id}`
- **Method**: `GET`
- **Response** (Status `200 OK`):
  ```json
  {
    "summary": {
      "generated_at": "2026-07-24T21:59:00Z",
      "report_type": "Form Detail Report",
      "form_id": 1,
      "form_name": "Customer Feedback Form",
      "status": "published",
      "created_date": "2026-07-10T12:00:00Z",
      "number_of_fields": 4,
      "number_of_responses": 20,
      "last_submission_date": "2026-07-24T20:00:00Z"
    },
    "data": {
      "id": 1,
      "title": "Customer Feedback Form",
      "description": "General survey",
      "owner_id": 1,
      "status": "published",
      "current_version": 1,
      "versions": [...]
    }
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X GET "http://localhost:8000/reports/forms/1"
  ```

---

### 34. Get Templates Report (GET /reports/templates)
Retrieves templates report with field count and usage count.

- **URL**: `/reports/templates`
- **Method**: `GET`
- **Response** (Status `200 OK`):
  ```json
  {
    "summary": {
      "generated_at": "2026-07-24T21:59:00Z",
      "report_type": "Templates Report",
      "total_templates": 5,
      "total_template_fields": 25
    },
    "data": [
      {
        "id": 1,
        "title": "Customer Feedback Template",
        "description": "Standard survey blueprint",
        "createdat": "2026-07-17T15:00:00Z",
        "updatedat": "2026-07-17T15:00:00Z",
        "number_of_fields": 5,
        "usage_count": 3
      }
    ]
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X GET "http://localhost:8000/reports/templates"
  ```

---

### 35. Get QR Codes Report (GET /reports/qrcodes)
Retrieves QR code report detailing target URLs and creation dates.

- **URL**: `/reports/qrcodes`
- **Method**: `GET`
- **Response** (Status `200 OK`):
  ```json
  {
    "summary": {
      "generated_at": "2026-07-24T21:59:00Z",
      "report_type": "QR Code Report",
      "total_qrcodes": 12
    },
    "data": [
      {
        "id": 1,
        "title": "Feedback Form Link",
        "target_url": "https://example.com/forms/public/1",
        "qr_image_path": "uploads/qrcodes/a1b2c3d4e5f6.png",
        "creation_date": "2026-07-17T19:00:00Z"
      }
    ]
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X GET "http://localhost:8000/reports/qrcodes"
  ```

---

### 36. Get Submissions Report (GET /reports/submissions)
Retrieves submissions report with successful count, latest submission date, and form metadata.

- **URL**: `/reports/submissions` (Optional query: `?form_id=1`)
- **Method**: `GET`
- **Response** (Status `200 OK`):
  ```json
  {
    "summary": {
      "generated_at": "2026-07-24T21:59:00Z",
      "report_type": "Submission Report",
      "total_submissions": 245,
      "successful_submissions": 234,
      "latest_submission": "2026-07-24T20:00:00Z"
    },
    "data": [
      {
        "id": 1,
        "submission_id": "uuid-string-1234",
        "form_version_id": 1,
        "version_number": 1,
        "form_id": 1,
        "form_title": "Customer Feedback Form",
        "submitted_by": 1,
        "status": "submitted",
        "started_at": "2026-07-24T19:55:00Z",
        "submitted_at": "2026-07-24T20:00:00Z",
        "response_count": 4
      }
    ]
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X GET "http://localhost:8000/reports/submissions?form_id=1"
  ```

---

### 37. Get Responses Report (GET /reports/responses)
Retrieves granular responses report with field labels, types, and form titles.

- **URL**: `/reports/responses` (Optional query: `?submission_id=1&field_id=2`)
- **Method**: `GET`
- **Response** (Status `200 OK`):
  ```json
  {
    "summary": {
      "generated_at": "2026-07-24T21:59:00Z",
      "report_type": "Response Report",
      "total_responses": 245,
      "latest_response": "2026-07-24T20:00:00Z",
      "associated_forms_count": 10
    },
    "data": [
      {
        "id": 1,
        "submission_id": 1,
        "field_id": 2,
        "field_name": "feedback_text",
        "field_label": "Your Feedback",
        "field_type": "text",
        "form_id": 1,
        "form_title": "Customer Feedback Form",
        "value": "Great experience!",
        "uploaded_file": null
      }
    ]
  }
  ```

- **Testing with cURL**:
  ```bash
  curl -X GET "http://localhost:8000/reports/responses"
  ```

---

### 38. Generate Exportable Report (POST /reports/generate)
Generates an export file (JSON, CSV, or PDF) for any report type, delegating PDF bytes generation to the export module.

- **URL**: `/reports/generate`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "report_type": "dashboard",
    "format": "json"
  }
  ```
- **Response**: Binary file attachment download (`report_dashboard.json`, `report_forms.csv`, or `report_submissions.pdf`).

- **Testing with cURL**:
  ```bash
  curl -X POST "http://localhost:8000/reports/generate" \
       -H "Content-Type: application/json" \
       -d '{"report_type": "forms", "format": "csv"}' \
       --output report_forms.csv
  ```

