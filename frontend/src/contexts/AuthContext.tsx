import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as authService from '../services/authService';
import { socketService } from '../services/socketService';
import { toast } from '../utils/toast';

interface User {
  id: string;
  userID?: string;
  email: string;
  name: string;
  role: 'client' | 'freelancer' | 'admin' | 'superadmin' | 'agent';
  email_verified: boolean;
  phone?: string;
  avatar?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<{ requiresVerification: boolean; email: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  verifyOTP: (email: string, otpCode: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session on mount
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('connect_accel_user');
        const token = localStorage.getItem('auth_token');

        if (storedUser && token) {
          const userData = JSON.parse(storedUser);
          setUser(userData);

          // Connect socket if user is authenticated
          if (userData.id && token) {
            socketService.connect(userData.id, token);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid data
        localStorage.removeItem('connect_accel_user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login({ email, password });

      if (response.success && response.user && response.token) {
        const userData: User = {
          id: response.user.id,
          userID: response.user.userID,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
          avatar: response.user.avatar,
          email_verified: true,
          created_at: new Date().toISOString(),
        };

        setUser(userData);

        // Connect socket
        socketService.connect(userData.id, response.token);

        toast.success(response.message || 'Logged in successfully!');
      } else if (response.requiresVerification) {
        // User needs to verify email
        throw new Error('Email verification required. Please check your email for OTP.');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, phone?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.register({ name, email, password, phone });

      if (response.success) {
        if (response.requiresVerification && response.email) {
          toast.success(response.message || 'Registration successful! Please verify your email.');
          return { requiresVerification: true, email: response.email };
        } else if (response.user && response.token) {
          // If user is auto-verified (shouldn't happen for clients, but handle it)
          const userData: User = {
            id: response.user.id,
            userID: response.user.userID,
            email: response.user.email,
            name: response.user.name,
            role: response.user.role,
            avatar: response.user.avatar,
            email_verified: true,
            created_at: new Date().toISOString(),
          };
          setUser(userData);
          socketService.connect(userData.id, response.token);
          return { requiresVerification: false, email: response.user.email };
        }
      }
      throw new Error(response.message || 'Registration failed');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (email: string, otpCode: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.verifyOTP(email, otpCode);

      if (response.success && response.user && response.token) {
        const userData: User = {
          id: response.user.id,
          userID: response.user.userID,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
          avatar: response.user.avatar,
          email_verified: true,
          created_at: new Date().toISOString(),
        };

        setUser(userData);
        socketService.connect(userData.id, response.token);
        toast.success(response.message || 'Email verified successfully!');
      } else {
        throw new Error(response.message || 'OTP verification failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'OTP verification failed. Please try again.';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.resendOTP(email);
      if (response.success) {
        toast.success(response.message || 'OTP sent successfully!');
      } else {
        throw new Error(response.message || 'Failed to resend OTP');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to resend OTP. Please try again.';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      socketService.disconnect();
      setLoading(false);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('connect_accel_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout, updateUser, verifyOTP, resendOTP }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}