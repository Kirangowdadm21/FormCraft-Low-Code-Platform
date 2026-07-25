/**
 * Centralized API Service for User Management endpoints.
 * Handles API calls to FastAPI backend for registration, login, profile retrieval, and logout.
 */

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
        // Validation error array from FastAPI/Pydantic
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
 * Get stored JWT access token from localStorage.
 */
export function getStoredToken() {
  return localStorage.getItem('access_token');
}

/**
 * Store JWT access token in localStorage.
 */
export function setStoredToken(token) {
  if (token) {
    localStorage.setItem('access_token', token);
  } else {
    localStorage.removeItem('access_token');
  }
}

/**
 * Remove JWT access token from localStorage.
 */
export function removeStoredToken() {
  localStorage.removeItem('access_token');
}

/**
 * POST /auth/register
 * Register a new user with first_name, last_name, email, password, and optional role.
 */
export async function registerUser(userData) {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      email: userData.email,
      password: userData.password,
      role: userData.role || 'user'
    }),
  });

  return handleResponse(response);
}

/**
 * POST /auth/login
 * Authenticate user credentials and return JWT access token.
 */
export async function loginUser(credentials) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });

  return handleResponse(response);
}

/**
 * GET /auth/profile
 * Fetch authenticated user profile using Bearer JWT token.
 */
export async function getUserProfile(token) {
  const authToken = token || getStoredToken();
  if (!authToken) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${BASE_URL}/auth/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });

  return handleResponse(response);
}

/**
 * POST /auth/logout
 * Revoke JWT token on backend and clear session.
 */
export async function logoutUser(token) {
  const authToken = token || getStoredToken();
  if (!authToken) {
    removeStoredToken();
    return { message: 'Logged out locally' };
  }

  try {
    const response = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await handleResponse(response);
    removeStoredToken();
    return result;
  } catch (err) {
    // Always clean up local storage token even if backend error occurs
    removeStoredToken();
    throw err;
  }
}
