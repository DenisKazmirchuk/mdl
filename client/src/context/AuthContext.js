import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication status on mount and after any auth state changes
  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      toast.success(response.data.message);
      await checkAuth();
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/register', { email, password });
      toast.success(response.data.message);
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await axios.post('/api/auth/logout');
      setUser(null);
      toast.success('You have been logged out');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const verifyEmail = async (token) => {
    try {
      const response = await axios.get(`/api/auth/verify-email/${token}`);
      toast.success(response.data.message);
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Email verification failed');
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        verifyEmail,
        checkAuth,
      }}
    >
      {!loading && children}
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