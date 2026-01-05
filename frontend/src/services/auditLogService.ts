/**
 * Audit Log Service
 * API operations for audit log management
 */

import apiClient from './apiService';
import { API_CONFIG } from '../config/api';

export interface AuditLogResponse {
    _id: string;
    performedBy?: {
        _id: string;
        name: string;
        email: string;
        role: string;
        userID?: string;
    };
    performedByName: string;
    performedByEmail: string;
    performedByRole: string;

    action: string;

    targetUser?: {
        _id: string;
        name: string;
        email: string;
        role: string;
        userID?: string;
    };
    targetUserName?: string;
    targetUserEmail?: string;
    targetUserRole?: string;

    description: string;
    changes: Record<string, any>;
    previousValues: Record<string, any>;
    newValues: Record<string, any>;

    ipAddress?: string;
    userAgent?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    metadata: Record<string, any>;

    createdAt: string;
    updatedAt: string;
}

export interface AuditLogStats {
    totalLogs: number;
    byAction: Array<{ _id: string; count: number }>;
    bySeverity: Array<{ _id: string; count: number }>;
    recentLogs: AuditLogResponse[];
}

export interface AuditLogFilters {
    page?: number;
    limit?: number;
    action?: string;
    performedBy?: string;
    targetUser?: string;
    severity?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
}

/**
 * Get audit logs relevant to the current user
 */
export const getMyAuditLogs = async (filters?: Omit<AuditLogFilters, 'performedBy' | 'targetUser'>): Promise<{
    success: boolean;
    count: number;
    total: number;
    page: number;
    pages: number;
    auditLogs: AuditLogResponse[];
}> => {
    const queryParams = new URLSearchParams();

    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.action) queryParams.append('action', filters.action);
    if (filters?.severity) queryParams.append('severity', filters.severity);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.search) queryParams.append('search', filters.search);

    const res = await apiClient.get<{
        success: boolean;
        count: number;
        total: number;
        page: number;
        pages: number;
        auditLogs: AuditLogResponse[];
    }>(`${API_CONFIG.API_URL}/audit-logs/me${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);

    return res.data;
};

/**
 * Get all audit logs with filters
 */
export const getAllAuditLogs = async (filters?: AuditLogFilters): Promise<{
    success: boolean;
    count: number;
    total: number;
    page: number;
    pages: number;
    auditLogs: AuditLogResponse[];
}> => {
    const queryParams = new URLSearchParams();

    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.action) queryParams.append('action', filters.action);
    if (filters?.performedBy) queryParams.append('performedBy', filters.performedBy);
    if (filters?.targetUser) queryParams.append('targetUser', filters.targetUser);
    if (filters?.severity) queryParams.append('severity', filters.severity);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.search) queryParams.append('search', filters.search);

    const res = await apiClient.get<{
        success: boolean;
        count: number;
        total: number;
        page: number;
        pages: number;
        auditLogs: AuditLogResponse[];
    }>(`${API_CONFIG.API_URL}/audit-logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);

    return res.data;
};

/**
 * Get audit logs for a specific user
 */
export const getUserAuditLogs = async (
    userId: string,
    filters?: Omit<AuditLogFilters, 'performedBy' | 'targetUser'>
): Promise<{
    success: boolean;
    count: number;
    total: number;
    page: number;
    pages: number;
    auditLogs: AuditLogResponse[];
}> => {
    const queryParams = new URLSearchParams();

    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.action) queryParams.append('action', filters.action);
    if (filters?.severity) queryParams.append('severity', filters.severity);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);

    const res = await apiClient.get<{
        success: boolean;
        count: number;
        total: number;
        page: number;
        pages: number;
        auditLogs: AuditLogResponse[];
    }>(`${API_CONFIG.API_URL}/audit-logs/user/${userId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);

    return res.data;
};

/**
 * Get audit log statistics
 */
export const getAuditLogStats = async (filters?: {
    startDate?: string;
    endDate?: string;
}): Promise<{
    success: boolean;
    stats: AuditLogStats;
}> => {
    const queryParams = new URLSearchParams();

    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);

    const res = await apiClient.get<{
        success: boolean;
        stats: AuditLogStats;
    }>(`${API_CONFIG.API_URL}/audit-logs/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);

    return res.data;
};

/**
 * Get audit log by ID
 */
export const getAuditLogById = async (id: string): Promise<{
    success: boolean;
    auditLog: AuditLogResponse;
}> => {
    const res = await apiClient.get<{
        success: boolean;
        auditLog: AuditLogResponse;
    }>(`${API_CONFIG.API_URL}/audit-logs/${id}`);

    return res.data;
};
