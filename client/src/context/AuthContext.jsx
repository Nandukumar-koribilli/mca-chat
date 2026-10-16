import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { initSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('educonnect_token'));
  const [loading, setLoading] = useState(true);

  // Check existing session on mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const storedToken = localStorage.getItem('educonnect_token');
        if (storedToken) {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          setToken(storedToken);
          initSocket(storedToken);
        }
      } catch (err) {
        console.warn('Session verification failed:', err.response?.data?.message || err.message);
        localStorage.removeItem('educonnect_token');
        setUser(null);
        setToken(null);
        disconnectSocket();
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    const { token: receivedToken, user: receivedUser } = res.data;

    localStorage.setItem('educonnect_token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    initSocket(receivedToken);

    return receivedUser;
  };

  const register = async ({ username, password, displayName, className }) => {
    const res = await api.post('/auth/register', { username, password, displayName, className });
    const { token: receivedToken, user: receivedUser } = res.data;

    localStorage.setItem('educonnect_token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    initSocket(receivedToken);

    return receivedUser;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API error:', err.message);
    } finally {
      localStorage.removeItem('educonnect_token');
      setUser(null);
      setToken(null);
      disconnectSocket();
    }
  };

  const updateProfile = async (updates) => {
    const res = await api.patch('/users/me', updates);
    setUser(res.data.user);
    return res.data.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
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
