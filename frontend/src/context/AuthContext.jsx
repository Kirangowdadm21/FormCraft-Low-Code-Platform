import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  registerUser,
  loginUser,
  getUserProfile,
  logoutUser,
  getStoredToken,
  setStoredToken,
  removeStoredToken
} from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getStoredToken());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clear any existing auth error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch current user profile if token is present
  const fetchProfile = useCallback(async (authToken) => {
    const activeToken = authToken || getStoredToken();
    if (!activeToken) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const profileData = await getUserProfile(activeToken);
      setUser(profileData);
      return profileData;
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      // Token might be invalid or expired
      if (err.status === 401) {
        removeStoredToken();
        setTokenState(null);
        setUser(null);
      }
      setError(err.message || 'Session expired or invalid token');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // On initial mount, attempt profile fetch if token exists
  useEffect(() => {
    const existingToken = getStoredToken();
    if (existingToken) {
      fetchProfile(existingToken);
    } else {
      setLoading(false);
    }
  }, [fetchProfile]);

  // Login handler
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const data = await loginUser({ email, password });
      const newToken = data.access_token;
      
      setStoredToken(newToken);
      setTokenState(newToken);
      
      const profile = await fetchProfile(newToken);
      return profile;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  // Register handler
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await registerUser(userData);
      return response;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout handler
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      const currentToken = getStoredToken();
      if (currentToken) {
        await logoutUser(currentToken);
      }
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      removeStoredToken();
      setTokenState(null);
      setUser(null);
      setError(null);
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    fetchProfile,
    clearError,
  }), [user, token, loading, error, login, register, logout, fetchProfile, clearError]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
