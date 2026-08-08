/**
 * API Service for Reports endpoints.
 * Interacts with FastAPI backend /reports endpoints.
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

// GET /reports/dashboard
export async function getDashboardReport() {
  const response = await fetch(`${BASE_URL}/reports/dashboard`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// GET /reports/forms
export async function getFormsReport() {
  const response = await fetch(`${BASE_URL}/reports/forms`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// GET /reports/submissions
export async function getSubmissionsReport(formId = null) {
  const params = new URLSearchParams();
  if (formId) params.append("form_id", formId);
  const url = `${BASE_URL}/reports/submissions${params.toString() ? "?" + params.toString() : ""}`;
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// GET /reports/responses
export async function getFieldsReport(submissionId = null, fieldId = null) {
  const params = new URLSearchParams();
  if (submissionId) params.append("submission_id", submissionId);
  if (fieldId) params.append("field_id", fieldId);
  const url = `${BASE_URL}/reports/responses${params.toString() ? "?" + params.toString() : ""}`;
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// POST /reports/generate
export async function generateReportFile(reportType, format, formId = null) {
  const token = getStoredToken();
  const response = await fetch(`${BASE_URL}/reports/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      report_type: reportType,
      format: format,
      form_id: formId ? parseInt(formId, 10) : null,
    }),
  });

  if (!response.ok) {
    let errorMsg = "Failed to generate report";
    try {
      const errJson = await response.json();
      errorMsg = errJson.detail || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `report_${reportType}_${Date.now()}.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
