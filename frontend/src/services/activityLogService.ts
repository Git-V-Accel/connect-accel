/**
 * Activity Log Service
 * Handles all activity log related API calls
 */

import apiClient from './apiService';
import { API_CONFIG } from '../config/api';

export interface ActivityLog {
  _id: string;
  id?: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role?: string;
  };
  project?: {
    _id: string;
    title: string;
  };
  activityType: string;
  title: string;
  description: string;
  metadata?: {
    oldStatus?: string;
    newStatus?: string;
    oldPriority?: string;
    newPriority?: string;
    changes?: Record<string, any>;
    changeCount?: number;
    projectTitle?: string;
    milestoneTitle?: string;
    milestoneAmount?: number;
    fileName?: string;
    amount?: number;
    [key: string]: any;
  };
  severity: 'low' | 'medium' | 'high';
  visibleToClient: boolean;
  visibleToAdmin: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLogResponse {
  success: boolean;
  count: number;
  data: ActivityLog[];
}

/**
 * Get activity logs for a specific project
 */
export const getProjectActivityLogs = async (projectId: string): Promise<ActivityLog[]> => {
  const res = await apiClient.get<ActivityLogResponse>(
    API_CONFIG.ACTIVITY_LOGS.PROJECT(projectId)
  );
  return res.data.data || [];
};

/**
 * Get activity logs for a specific client
 */
export const getClientActivityLogs = async (clientId: string): Promise<ActivityLog[]> => {
  const res = await apiClient.get<ActivityLogResponse>(
    API_CONFIG.ACTIVITY_LOGS.CLIENT(clientId)
  );
  return res.data.data || [];
};

/**
 * Get all activity logs (Admin only)
 */
export const getAllActivityLogs = async (): Promise<ActivityLog[]> => {
  const res = await apiClient.get<ActivityLogResponse>(
    API_CONFIG.ACTIVITY_LOGS.ALL
  );
  return res.data.data || [];
};

