import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X, Check, CheckCheck, Filter, Trash2, Settings } from 'lucide-react';
import { socketService } from '../../services/socketService';
import { SocketEvents } from '../../constants/socketConstants';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  projectId?: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Setup socket listeners
  useEffect(() => {
    if (!user || !isOpen) return;

    const unsubscribeFunctions: (() => void)[] = [];

    // Role-specific notification listeners
    const roleBasedEvents = getRoleBasedEvents(user.role);
    
    roleBasedEvents.forEach(event => {
      const unsubscribe = socketService.on(event, (data: Notification) => {
        if (data.user_id === user.id) {
          setNotifications(prev => [data, ...prev]);
          
          // Show toast for high priority notifications
          if (data.priority === 'high') {
            toast.success(data.title, {
              description: data.message,
              duration: 5000,
            });
          }
        }
      });
      unsubscribeFunctions.push(unsubscribe);
    });

    // General notification listener
    const unsubscribeGeneral = socketService.on(SocketEvents.NOTIFICATION_CREATED, (data: Notification) => {
      if (data.user_id === user.id) {
        setNotifications(prev => [data, ...prev]);
        
        if (data.priority === 'high') {
          toast.success(data.title, {
            description: data.message,
            duration: 5000,
          });
        }
      }
    });
    unsubscribeFunctions.push(unsubscribeGeneral);

    // Notification read listener
    const unsubscribeRead = socketService.on(SocketEvents.NOTIFICATION_READ, (data: { id: string; user_id: string }) => {
      if (data.user_id === user.id) {
        setNotifications(prev => 
          prev.map(n => n.id === data.id ? { ...n, read: true } : n)
        );
      }
    });
    unsubscribeFunctions.push(unsubscribeRead);

    // Notification deleted listener
    const unsubscribeDeleted = socketService.on(SocketEvents.NOTIFICATION_DELETED, (data: { id: string; user_id: string }) => {
      if (data.user_id === user.id) {
        setNotifications(prev => prev.filter(n => n.id !== data.id));
      }
    });
    unsubscribeFunctions.push(unsubscribeDeleted);

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [user, isOpen]);

  // Fetch notifications when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Get role-based socket events
  const getRoleBasedEvents = (role: string): SocketEvents[] => {
    switch (role) {
      case 'client':
        return [
          SocketEvents.NOTIFICATION_CLIENT_PROJECT_CREATED,
          SocketEvents.NOTIFICATION_CLIENT_PROJECT_UPDATED,
          SocketEvents.NOTIFICATION_CLIENT_STATUS_CHANGED,
          SocketEvents.NOTIFICATION_CLIENT_PROJECT_DELETED,
          SocketEvents.NOTIFICATION_CLIENT_MILESTONE_CREATED,
          SocketEvents.NOTIFICATION_CLIENT_MILESTONE_UPDATED,
          SocketEvents.NOTIFICATION_CLIENT_MILESTONE_COMPLETED,
          SocketEvents.NOTIFICATION_CLIENT_BID_RECEIVED,
        ];
      case 'freelancer':
        return [
          SocketEvents.NOTIFICATION_FREELANCER_BID_CREATED,
          SocketEvents.NOTIFICATION_FREELANCER_BID_UPDATED,
          SocketEvents.NOTIFICATION_FREELANCER_BID_WITHDRAWN,
          SocketEvents.NOTIFICATION_FREELANCER_BID_ACCEPTED,
          SocketEvents.NOTIFICATION_FREELANCER_BID_REJECTED,
          SocketEvents.NOTIFICATION_FREELANCER_BID_SHORTLISTED,
          SocketEvents.NOTIFICATION_FREELANCER_PROJECT_ASSIGNED,
          SocketEvents.NOTIFICATION_FREELANCER_MILESTONE_CREATED,
          SocketEvents.NOTIFICATION_FREELANCER_MILESTONE_UPDATED,
        ];
      case 'admin':
      case 'superadmin':
        return [
          SocketEvents.NOTIFICATION_ADMIN_USER_CREATED,
          SocketEvents.NOTIFICATION_ADMIN_USER_UPDATED,
          SocketEvents.NOTIFICATION_ADMIN_USER_DELETED,
          SocketEvents.NOTIFICATION_ADMIN_USER_SUSPENDED,
          SocketEvents.NOTIFICATION_ADMIN_USER_VERIFICATION_CHANGED,
          SocketEvents.NOTIFICATION_ADMIN_PROJECT_REVIEW_PENDING,
          SocketEvents.NOTIFICATION_ADMIN_PROJECT_CREATED,
          SocketEvents.NOTIFICATION_ADMIN_PROJECT_UPDATED,
          SocketEvents.NOTIFICATION_ADMIN_PROJECT_DELETED,
          SocketEvents.NOTIFICATION_ADMIN_STATUS_CHANGED,
          SocketEvents.NOTIFICATION_ADMIN_MILESTONE_UPDATED,
          SocketEvents.NOTIFICATION_ADMIN_FREELANCER_ASSIGNED,
          SocketEvents.NOTIFICATION_ADMIN_FREELANCER_UNASSIGNED,
          SocketEvents.NOTIFICATION_ADMIN_AGENT_ASSIGNED,
          SocketEvents.NOTIFICATION_ADMIN_AGENT_UNASSIGNED,
        ];
      case 'agent':
        return [
          SocketEvents.NOTIFICATION_AGENT_STATUS_CHANGED,
          SocketEvents.NOTIFICATION_AGENT_PROJECT_ASSIGNED,
        ];
      default:
        return [];
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    // Navigate to relevant page based on notification type
    if (notification.projectId) {
      window.location.href = `/projects/${notification.projectId}`;
    } else if (notification.type.includes('user')) {
      window.location.href = '/admin/users';
    } else if (notification.type.includes('bid')) {
      window.location.href = '/freelancer/bids';
    }
    onClose();
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'high':
        return notification.priority === 'high';
      default:
        return true;
    }
  });

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      socketService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      socketService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      socketService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    if (type.includes('project')) return '📋';
    if (type.includes('bid')) return '💰';
    if (type.includes('milestone')) return '🎯';
    if (type.includes('user')) return '👤';
    if (type.includes('admin')) return '⚙️';
    if (type.includes('agent')) return '🤝';
    return '📢';
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Notification Panel */}
      <div className="relative ml-auto w-full max-w-md h-full bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Notifications</h2>
            {filteredNotifications.filter(n => !n.read).length > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {filteredNotifications.filter(n => !n.read).length}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`p-2 rounded ${filter === 'all' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              title="All notifications"
            >
              <Filter className="w-4 h-4" />
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`p-2 rounded ${filter === 'unread' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              title="Unread only"
            >
              <div className="w-4 h-4 bg-blue-600 rounded-full" />
            </button>
            <button
              onClick={markAllAsRead}
              className="p-2 rounded hover:bg-gray-100"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <Bell className="w-12 h-12 mb-2" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification.id);
                    }
                    // Handle notification click (e.g., navigate to relevant page)
                    handleNotificationClick(notification);
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium truncate ${
                          !notification.read ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {notification.title}
                        </p>
                        <div className="flex items-center space-x-1">
                          <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-2">
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              // Navigate to full notification settings
              window.location.href = '/settings/notifications';
            }}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <Settings className="w-4 h-4" />
            <span>Notification Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
