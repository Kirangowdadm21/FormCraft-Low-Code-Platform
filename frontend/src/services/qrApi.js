/**
 * API Service for QR Code endpoints.
 * Interacts with FastAPI backend for QR code generation and management.
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

// GET /qrcodes — List all QR codes
export async function getQRCodes(skip = 0, limit = 100) {
  const response = await fetch(
    `${BASE_URL}/qrcodes/?skip=${skip}&limit=${limit}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );
  return handleResponse(response);
}

// GET /qrcodes/{id} — Get single QR code detail
export async function getQRCodeById(qrId) {
  const response = await fetch(`${BASE_URL}/qrcodes/${qrId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// POST /qrcodes — Generate a new QR code
export async function createQRCode(targetUrl, title = "Public Form QR") {
  const response = await fetch(`${BASE_URL}/qrcodes/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      target_url: targetUrl,
      title: title,
    }),
  });
  return handleResponse(response);
}

// DELETE /qrcodes/{id} — Delete a QR code
export async function deleteQRCode(qrId) {
  const response = await fetch(`${BASE_URL}/qrcodes/${qrId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (response.status === 200 || response.status === 204) return true;
  return handleResponse(response);
}

// Aliases matching specification naming
export const listQRCodes = getQRCodes;
export const getQRCode = getQRCodeById;
