/**
 * User Service
 * CRUD operations for user management
 */

import apiClient from './apiService';
import { API_CONFIG } from '../config/api';

export type UserRole = 'client' | 'freelancer' | 'admin' | 'superadmin' | 'agent';
// Backend accepts only 'active' or 'inactive'
export type UserStatus = 'active' | 'inactive';

export interface UserPayload {
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  company?: string;
  confirmEmail?: string;
}

export interface UserResponse {
  _id?: string;
  id?: string;
  userID?: string;
  name: string;
  email: string;
  role: UserRole;
  status?: UserStatus;
  phone?: string;
  company?: string;
  title?: string;
  location?: string;
  website?: string;
  bio?: string;
  avatar?: string;
  skills?: string[];
  hourlyRate?: number;
  experience?: string;
  adminRole?: string;
  isEmailVerified?: boolean;
  isFirstLogin?: boolean;
  createdAt?: string;
  updatedAt?: string;
  last_login?: string;
  rating?: number;
}

const normalizeUser = (user: UserResponse) => ({
  id: user._id || user.id || '',
  _id: user._id,
  userID: user.userID,
  name: user.name,
  email: user.email,
  role: user.role,
  status: (user.status as UserStatus) || 'active',
  phone: user.phone,
  company: user.company,
  title: user.title,
  location: user.location,
  website: user.website,
  bio: user.bio,
  avatar: user.avatar,
  skills: user.skills || [],
  hourlyRate: user.hourlyRate,
  experience: user.experience,
  adminRole: user.adminRole,
  isEmailVerified: user.isEmailVerified,
  isFirstLogin: user.isFirstLogin,
  created_at: user.createdAt || new Date().toISOString(),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  last_login: user.last_login,
  rating: user.rating,
});

export const listClients = async () => {
  const res = await apiClient.get<{ users: UserResponse[] }>(`${API_CONFIG.API_URL}/users/clients`);
  const users = (res.data as any)?.users || res.data;
  return users.map(normalizeUser).filter((u) => u.role === 'client');
};

export const listFreelancers = async () => {
  const res = await apiClient.get<{ users: UserResponse[] }>(`${API_CONFIG.API_URL}/users/freelancers`);
  const users = (res.data as any)?.users || res.data;
  return users.map(normalizeUser).filter((u) => u.role === 'freelancer');
};

export const listAgents = async () => {
  const res = await apiClient.get<{ users: UserResponse[] }>(`${API_CONFIG.API_URL}/users`);
  const users = (res.data as any)?.users || res.data;
  return users.map(normalizeUser).filter((u) => u.role === 'agent');
};

export const listUsers = async () => {
  const res = await apiClient.get<{ users: UserResponse[] }>(`${API_CONFIG.API_URL}/users`);
  const users = (res.data as any)?.users || res.data;
  return users.map(normalizeUser);
};

export const getUserById = async (userId: string) => {
  const res = await apiClient.get<{ success: boolean; user: UserResponse }>(`${API_CONFIG.API_URL}/users/${userId}`);
  const userData = (res.data as any)?.user || res.data;
  return normalizeUser(userData);
};

export const createUser = async (data: UserPayload) => {
  const res = await apiClient.post<UserResponse>(`${API_CONFIG.API_URL}/users`, data);
  return normalizeUser(res.data as any);
};

export const updateUserRole = async (userId: string, role: UserRole) => {
  const res = await apiClient.put<UserResponse>(`${API_CONFIG.API_URL}/users/${userId}/role`, { role });
  return normalizeUser(res.data as any);
};

export const updateUserStatus = async (userId: string, status: UserStatus) => {
  const res = await apiClient.put<UserResponse>(`${API_CONFIG.API_URL}/users/${userId}/status`, { status });
  return normalizeUser(res.data as any);
};

export const updateUser = async (userId: string, data: Partial<UserPayload>) => {
  const res = await apiClient.put<UserResponse>(`${API_CONFIG.API_URL}/users/${userId}`, data);
  return normalizeUser(res.data as any);
};

export const deleteUser = async (userId: string) => {
  await apiClient.delete(`${API_CONFIG.API_URL}/users/${userId}`);
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  const res = await apiClient.get<{ success: boolean; user: UserResponse }>(`${API_CONFIG.API_URL}/users/me`);
  const userData = (res.data as any)?.user || res.data;
  return normalizeUser(userData);
};

