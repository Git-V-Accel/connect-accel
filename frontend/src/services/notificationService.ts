/**
 * Notification Service
 * Centralized service for notification API operations
 */

import apiClient from './apiService';
import { toast } from '../utils/toast';

export interface Notification {
  _id: string;
  user: string;
  type: string;
  title: string;
  message: string;
  projectId?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface NotificationsResponse {
  success: boolean;
  count: number;
  data: Notification[];
  nextCursor?: string;
  hasMore?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

class NotificationService {
  /**
   * Fetch notifications for the current user
   */
  async getNotifications(params?: {
    cursor?: string;
    limit?: number;
  }): Promise<NotificationsResponse> {
    try {
      console.log('Fetching notifications from API...');
      
      const queryParams = new URLSearchParams();
      if (params?.cursor) queryParams.append('cursor', params.cursor);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      

      const response = await apiClient.get<NotificationsResponse>(
        `/api/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      );
      
      console.log('Notifications fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
      throw error;
    }
  }

  /**
   * Mark a specific notification as read
   */
  async markAsRead(notificationId: string): Promise<ApiResponse<Notification>> {
    try {
      console.log('Marking notification as read:', notificationId);
      

      const response = await apiClient.put<ApiResponse<Notification>>(
        `/api/notifications/${notificationId}/read`
      );
      
      console.log('Notification marked as read:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<ApiResponse> {
    try {
      console.log('Marking all notifications as read...');
      

      const response = await apiClient.put<ApiResponse>('/api/notifications/read-all');
      
      console.log('All notifications marked as read:', response.data);
      toast.success('All notifications marked as read');
      return response.data;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
      throw error;
    }
  }

  /**
   * Delete/dismiss a notification
   */
  async deleteNotification(notificationId: string): Promise<ApiResponse> {
    try {
      console.log('Deleting notification:', notificationId);
      

      const response = await apiClient.delete<ApiResponse>(`/api/notifications/${notificationId}`);
      
      console.log('Notification deleted:', response.data);
      toast.success('Notification deleted');
      return response.data;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await this.getNotifications({ limit: 100 });
      const unreadCount = response.data.filter(notification => !notification.isRead).length;
      console.log('Unread notification count:', unreadCount);
      return unreadCount;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  /**
   * Get notifications by type
   */
  async getNotificationsByType(type: string): Promise<Notification[]> {
    try {
      const response = await this.getNotifications();
      return response.data.filter(notification => notification.type.includes(type));
    } catch (error) {
      console.error('Failed to get notifications by type:', error);
      return [];
    }
  }

  /**
   * Create a new notification (for testing/admin purposes)
   */
  async createNotification(notificationData: {
    type: string;
    title: string;
    message: string;
    projectId?: string;
    metadata?: Record<string, any>;
  }): Promise<ApiResponse<Notification>> {
    try {
      console.log('Creating notification:', notificationData);
      

      const response = await apiClient.post<ApiResponse<Notification>>('/api/notifications', notificationData);
      
      console.log('Notification created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to create notification:', error);
      toast.error('Failed to create notification');
      throw error;
    }
  }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;
