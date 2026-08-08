/**
 * API Service for Conditional Rules endpoints.
 * Interacts with FastAPI backend for Rules CRUD operations.
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

// GET /rules/ — List conditional rules with optional filters
export async function getRules(
  triggerField,
  targetedField,
  skip = 0,
  limit = 100,
) {
  const params = new URLSearchParams();
  if (triggerField) params.append("trigger_field", triggerField);
  if (targetedField) params.append("targeted_field", targetedField);
  params.append("skip", skip);
  params.append("limit", limit);

  const response = await fetch(`${BASE_URL}/rules/?${params.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// GET /rules/{id} — Get single rule
export async function getRuleById(ruleId) {
  const response = await fetch(`${BASE_URL}/rules/${ruleId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// POST /rules/ — Create a new rule
export async function createRule(ruleData) {
  const response = await fetch(`${BASE_URL}/rules/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(ruleData),
  });
  return handleResponse(response);
}

// PATCH /rules/{id} — Update an existing rule
export async function updateRule(ruleId, ruleData) {
  const response = await fetch(`${BASE_URL}/rules/${ruleId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(ruleData),
  });
  return handleResponse(response);
}

// DELETE /rules/{id} — Delete a rule
export async function deleteRule(ruleId) {
  const response = await fetch(`${BASE_URL}/rules/${ruleId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (response.status === 204) return true;
  return handleResponse(response);
}
