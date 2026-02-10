import React, { createContext, useState, useEffect } from 'react';
import { auth } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      auth.getProfile()
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const res = await auth.login(credentials);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const register = async (data) => {
    const res = await auth.register(data);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const updateProfile = async (profileData) => {
    try {
      // For now, just update local state since backend endpoint may not exist
      setUser(prev => ({ ...prev, ...profileData }));
      // TODO: Add actual API call when backend supports it
      // const res = await auth.updateProfile(profileData);
      // setUser(res.data);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
