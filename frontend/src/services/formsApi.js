/**
 * Centralized API Service for Forms endpoints.
 * Interacts with FastAPI backend for Forms CRUD operations.
 */

import { getStoredToken } from './api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Helper to handle HTTP response and throw descriptive error messages.
 */
async function handleResponse(response) {
  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    let errorMsg = 'An unexpected error occurred';
    if (data) {
      if (typeof data.detail === 'string') {
        errorMsg = data.detail;
      } else if (Array.isArray(data.detail)) {
        errorMsg = data.detail.map(e => `${e.loc ? e.loc.join(' -> ') : ''}: ${e.msg}`).join(', ');
      } else if (data.message) {
        errorMsg = data.message;
      }
    }
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Get common headers with authorization if token is present.
 */
function getAuthHeaders() {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * GET /forms
 * Fetch list of forms with pagination options.
 */
export async function getForms(skip = 0, limit = 100) {
  const response = await fetch(`${BASE_URL}/forms?skip=${skip}&limit=${limit}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

/**
 * GET /forms/{id}
 * Fetch specific form details by ID.
 */
export async function getFormById(formId) {
  const response = await fetch(`${BASE_URL}/forms/${formId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

/**
 * POST /forms
 * Create a new form. owner_id is derived from the authenticated user on the backend.
 */
export async function createForm(formData) {
  const response = await fetch(`${BASE_URL}/forms/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      title: formData.title,
      description: formData.description || null,
      status: formData.status || 'draft',
    }),
  });

  return handleResponse(response);
}

/**
 * PATCH /forms/{id}
 * Update existing form metadata.
 */
export async function updateForm(formId, updateData) {
  const response = await fetch(`${BASE_URL}/forms/${formId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  });

  return handleResponse(response);
}

/**
 * DELETE /forms/{id}
 * Delete a form by ID.
 */
export async function deleteForm(formId) {
  const response = await fetch(`${BASE_URL}/forms/${formId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

/**
 * GET /fields/?formversion_id={versionId}
 * Fetch all fields for a specific form version.
 */
export async function getFieldsByVersion(versionId) {
  const response = await fetch(`${BASE_URL}/fields/?formversion_id=${versionId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

/**
 * POST /fields/
 * Create a new field under a form version.
 */
export async function createField(fieldData) {
  const response = await fetch(`${BASE_URL}/fields/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(fieldData),
  });

  return handleResponse(response);
}

/**
 * PATCH /fields/{field_id}
 * Update existing field attributes and options.
 */
export async function updateField(fieldId, updateData) {
  const response = await fetch(`${BASE_URL}/fields/${fieldId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  });

  return handleResponse(response);
}

/**
 * DELETE /fields/{field_id}
 * Delete field by ID.
 */
export async function deleteField(fieldId) {
  const response = await fetch(`${BASE_URL}/fields/${fieldId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

/**
 * GET /forms/{formId}/versions
 * List all versions for a form.
 */
export async function getFormVersions(formId) {
  const response = await fetch(`${BASE_URL}/forms/${formId}/versions`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

/**
 * POST /forms/{formId}/versions
 * Create a new version for a form.
 */
export async function createFormVersion(formId, versionNumber = 1, fields = [], ispublished = false) {
  const response = await fetch(`${BASE_URL}/forms/${formId}/versions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      version_number: versionNumber,
      ispublished: ispublished,
      fields: fields,
    }),
  });

  return handleResponse(response);
}

/**
 * POST /forms/{formId}/publish
 * Publish form version.
 */
export async function publishForm(formId, versionNumber = null) {
  let url = `${BASE_URL}/forms/${formId}/publish`;
  if (versionNumber) {
    url += `?version_number=${versionNumber}`;
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

/**
 * POST /forms/{formId}/archive
 * Archive a form by ID.
 */
export async function archiveForm(formId) {
  const response = await fetch(`${BASE_URL}/forms/${formId}/archive`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

/**
 * GET /forms/public/{formId}
 * Fetch a published form for public rendering (no auth required).
 */
export async function getPublicForm(formId) {
  const response = await fetch(`${BASE_URL}/forms/public/${formId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  return handleResponse(response);
}
