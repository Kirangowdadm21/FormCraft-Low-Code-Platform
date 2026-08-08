/**
 * API Service for Export & Report generation.
 * Handles binary file downloads (CSV, JSON, PDF).
 */

import { getStoredToken } from "./api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function getAuthHeaders() {
  const token = getStoredToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Triggers browser file download from Blob.
 */
export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

// GET /export — Export raw datasets (forms, submissions, analytics)
export async function exportDataset(
  dataType = "forms",
  format = "csv",
  formId = null,
) {
  const params = new URLSearchParams();
  params.append("data_type", dataType);
  params.append("format", format);
  if (formId) params.append("form_id", formId);

  const response = await fetch(`${BASE_URL}/export?${params.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let errorMsg = "Failed to export data";
    try {
      const errJson = await response.json();
      errorMsg = errJson.detail || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  const blob = await response.blob();
  downloadBlob(blob, `export_${dataType}_${Date.now()}.${format}`);
}

// POST /reports/generate — Generate structured report files
export async function generateReportFile(
  reportType = "dashboard",
  format = "pdf",
  formId = null,
) {
  const response = await fetch(`${BASE_URL}/reports/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
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
  downloadBlob(blob, `report_${reportType}_${Date.now()}.${format}`);
}

// GET /reports/dashboard — Get dashboard report JSON
export async function getDashboardReport() {
  const response = await fetch(`${BASE_URL}/reports/dashboard`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch dashboard report");
  return response.json();
}
