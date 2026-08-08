/**
 * API Service for Analytics endpoints.
 * Interacts with FastAPI backend for dashboard metrics and trends.
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

// GET /analytics/dashboard — Dashboard-level metrics
export async function getDashboardAnalytics() {
  const response = await fetch(`${BASE_URL}/analytics/dashboard`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// GET /analytics/forms/{id} — Per-form analytics
export async function getFormAnalytics(formId) {
  const response = await fetch(`${BASE_URL}/analytics/forms/${formId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// GET /analytics/trend — Submission trend data
export async function getSubmissionTrend(interval = "daily", formId) {
  const params = new URLSearchParams();
  params.append("interval", interval);
  if (formId) params.append("form_id", formId);

  const response = await fetch(
    `${BASE_URL}/analytics/trend?${params.toString()}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );
  return handleResponse(response);
}
