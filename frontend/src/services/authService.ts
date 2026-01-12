/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import apiClient from './apiService';
import { API_CONFIG } from '../config/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  isFirstLogin?: boolean;
  user?: {
    id: string;
    userID: string;
    name: string;
    email: string;
    role: 'client' | 'freelancer' | 'admin' | 'superadmin' | 'agent';
    avatar?: string;
    isFirstLogin?: boolean;
    status?: string;
  };
  email?: string;
  requiresVerification?: boolean;
}

export interface RefreshTokenResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    userID: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

/**
 * Login user
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.AUTH.LOGIN,
      credentials
    );

    const { success, token, user, message, requiresVerification, email, isFirstLogin } = response.data;

    if (success && token && user) {
      // Store token and user data
      sessionStorage.setItem('auth_token', token);
      sessionStorage.setItem('connect_accel_user', JSON.stringify({
        id: user.id,
        userID: user.userID,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        email_verified: true,
        isFirstLogin: user.isFirstLogin || isFirstLogin || false,
        status: user.status,
        created_at: new Date().toISOString(),
      }));
    }

    return response.data;
  } catch (error: any) {
    // Error is already handled by interceptor, but we can add specific handling here
    throw error;
  }
};

/**
 * Register new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.AUTH.REGISTER,
      data
    );

    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post(API_CONFIG.AUTH.LOGOUT);
  } catch (error) {
    // Even if logout fails on server, clear local storage
    console.error('Logout error:', error);
  } finally {
    // Always clear local storage
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('connect_accel_user');
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (refreshTokenValue?: string): Promise<RefreshTokenResponse> => {
  try {
    const token = refreshTokenValue || 
                 sessionStorage.getItem('refresh_token') ||
                 document.cookie.split('; ').find(row => row.startsWith('refreshToken='))?.split('=')[1];

    if (!token) {
      throw new Error('Refresh token not found');
    }

    const response = await apiClient.post<RefreshTokenResponse>(
      API_CONFIG.AUTH.REFRESH_TOKEN,
      { refreshToken: token }
    );

    const { token: newToken, user } = response.data;

    if (newToken) {
      sessionStorage.setItem('auth_token', newToken);
      sessionStorage.setItem('connect_accel_user', JSON.stringify({
        id: user.id,
        userID: user.userID,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        email_verified: true,
        created_at: new Date().toISOString(),
      }));
    }

    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Verify OTP
 */
export const verifyOTP = async (email: string, otpCode: string): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.AUTH.VERIFY_OTP,
      { email, otpCode }
    );

    const { success, token, user } = response.data;

    if (success && token && user) {
      sessionStorage.setItem('auth_token', token);
      sessionStorage.setItem('connect_accel_user', JSON.stringify({
        id: user.id,
        userID: user.userID,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        email_verified: true,
        created_at: new Date().toISOString(),
      }));
    }

    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Resend OTP
 */
export const resendOTP = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      API_CONFIG.AUTH.RESEND_OTP,
      { email }
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Forgot password
 */
export const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      API_CONFIG.AUTH.FORGOT_PASSWORD,
      { email }
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Reset password
 */
export const resetPassword = async (resetToken: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await apiClient.put<AuthResponse>(
      `${API_CONFIG.AUTH.RESET_PASSWORD}/${resetToken}`,
      { password }
    );

    const { success, token, user } = response.data;

    if (success && token && user) {
      sessionStorage.setItem('auth_token', token);
      sessionStorage.setItem('connect_accel_user', JSON.stringify({
        id: user.id,
        userID: user.userID,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        email_verified: true,
        created_at: new Date().toISOString(),
      }));
    }

    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Send password change OTP (validates current password first)
 */
export const sendPasswordChangeOTP = async (currentPassword: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      API_CONFIG.AUTH.SEND_PASSWORD_CHANGE_OTP,
      { currentPassword }
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Change password (current password already validated when OTP was sent)
 */
export const changePassword = async (
  newPassword: string,
  otpCode: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.put<{ success: boolean; message: string }>(
      API_CONFIG.AUTH.CHANGE_PASSWORD,
      { newPassword, otpCode }
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * First-time password change (for new users created by admin)
 */
export const firstLoginChangePassword = async (
  newPassword: string,
  confirmPassword: string
): Promise<AuthResponse> => {
  try {
    const response = await apiClient.put<AuthResponse>(
      API_CONFIG.AUTH.FIRST_LOGIN_CHANGE_PASSWORD,
      { newPassword, confirmPassword }
    );

    const { success, token, user } = response.data;

    if (success && token && user) {
      sessionStorage.setItem('auth_token', token);
      sessionStorage.setItem('connect_accel_user', JSON.stringify({
        id: user.id,
        userID: user.userID,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        email_verified: true,
        isFirstLogin: false,
        status: user.status,
        created_at: new Date().toISOString(),
      }));
    }

    return response.data;
  } catch (error: any) {
    throw error;
  }
};

