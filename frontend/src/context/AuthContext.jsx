import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/endpoints';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [ranger, setRanger] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setRanger(null);
      setLoading(false);
      return;
    }
    try {
      const response = await authApi.me();
      setRanger(response.data);
    } catch {
      localStorage.removeItem('access_token');
      setRanger(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const response = await authApi.login(email, password);
    localStorage.setItem('access_token', response.data.access_token);
    setRanger(response.data.ranger);
    return response.data.ranger;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setRanger(null);
  };

  return (
    <AuthContext.Provider value={{ ranger, loading, login, logout, refreshUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
