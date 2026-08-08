/**
 * API Service for Responses & Submissions endpoints.
 * Interacts with FastAPI backend for reading/deleting response data.
 */

import { getStoredToken } from "./api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function getAuthHeaders() {
  const token = getStoredToken();
  return {
    "Content-Type": "application/json",
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
    let errorMsg = "An unexpected error occurred";
    if (data) {
      if (typeof data.detail === "string") {
        errorMsg = data.detail;
      } else if (Array.isArray(data.detail)) {
        errorMsg = data.detail
          .map((e) => `${e.loc ? e.loc.join(" -> ") : ""}: ${e.msg}`)
          .join(", ");
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

// GET /responses/ — List responses with optional filters
export async function getResponses(
  submissionId,
  fieldId,
  skip = 0,
  limit = 100,
) {
  const params = new URLSearchParams();
  if (submissionId) params.append("submission_id", submissionId);
  if (fieldId) params.append("field_id", fieldId);
  params.append("skip", skip);
  params.append("limit", limit);

  const response = await fetch(`${BASE_URL}/responses/?${params.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// GET /responses/{id} — Get single response
export async function getResponseById(id) {
  const response = await fetch(`${BASE_URL}/responses/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// DELETE /responses/{id} — Delete a response value
export async function deleteResponse(id) {
  const response = await fetch(`${BASE_URL}/responses/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (response.status === 204) return true;
  return handleResponse(response);
}

// GET /submissions/ — List submissions with optional filter
export async function getSubmissions(formVersionId, skip = 0, limit = 100) {
  const params = new URLSearchParams();
  if (formVersionId) params.append("form_version_id", formVersionId);
  params.append("skip", skip);
  params.append("limit", limit);

  const response = await fetch(
    `${BASE_URL}/submissions/?${params.toString()}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );
  return handleResponse(response);
}

// GET /submissions/{id} — Get single submission
export async function getSubmissionById(id) {
  const response = await fetch(`${BASE_URL}/submissions/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}
