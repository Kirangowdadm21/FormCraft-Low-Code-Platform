/**
 * API Service for Templates endpoints.
 * Interacts with FastAPI backend for Template CRUD operations and form creation.
 */

import { getStoredToken } from './api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function getAuthHeaders() {
  const token = getStoredToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

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
 * GET /templates/ — List templates with optional pagination
 */
export async function listTemplates(search = '', skip = 0, limit = 100) {
  const params = new URLSearchParams();
  params.append('skip', skip);
  params.append('limit', limit);
  if (search) {
    params.append('search', search);
  }

  const response = await fetch(`${BASE_URL}/templates/?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

/**
 * GET /templates/{template_id} — Get single template details
 */
export async function getTemplateById(templateId) {
  const response = await fetch(`${BASE_URL}/templates/${templateId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

/**
 * POST /templates/ — Create a new template
 */
export async function createTemplate({ title, description = null, fields = [] }) {
  const response = await fetch(`${BASE_URL}/templates/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      title,
      description: description || null,
      fields: fields || [],
    }),
  });
  return handleResponse(response);
}

/**
 * PATCH /templates/{template_id} — Update an existing template (partial updates allowed)
 */
export async function updateTemplate(templateId, updateData) {
  const response = await fetch(`${BASE_URL}/templates/${templateId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  });
  return handleResponse(response);
}

/**
 * DELETE /templates/{template_id} — Delete a template
 */
export async function deleteTemplate(templateId) {
  const response = await fetch(`${BASE_URL}/templates/${templateId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (response.status === 204) return true;
  return handleResponse(response);
}

/**
 * POST /templates/{template_id}/create-form — Create a new form from a template
 */
export async function useTemplate(templateId, { title, description = null }) {
  const response = await fetch(`${BASE_URL}/templates/${templateId}/create-form`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      title,
      description: description || null,
    }),
  });
  return handleResponse(response);
}
