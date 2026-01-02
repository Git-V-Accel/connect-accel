import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RightDrawer } from '../ui/right-drawer';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Bell, CheckCircle2, IndianRupee, MessageSquare, Briefcase, Flag, Check } from 'lucide-react';

const notificationIcons = {
  project: Briefcase,
  milestone: CheckCircle2,
  payment: IndianRupee,
  message: MessageSquare,
  bid: Briefcase,
  dispute: Flag,
};

const notificationColors = {
  project: 'bg-blue-100 text-blue-600',
  milestone: 'bg-green-100 text-green-600',
  payment: 'bg-purple-100 text-purple-600',
  message: 'bg-orange-100 text-orange-600',
  bid: 'bg-blue-100 text-blue-600',
  dispute: 'bg-red-100 text-red-600',
};

interface NotificationsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationsDrawer({ open, onClose }: NotificationsDrawerProps) {
  const { user } = useAuth();
  const { getUserNotifications, markNotificationAsRead } = useData();
  const [selectedTab, setSelectedTab] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getProjectLink = (projectId: string) => {
    if (!user) return '/';
    switch (user.role) {
      case 'client':
        return `/client/projects/${projectId}`;
      case 'freelancer':
        return `/freelancer/projects/${projectId}/detail`;
      case 'admin':
      case 'superadmin':
        return `/admin/projects/${projectId}`;
      case 'agent':
        return `/agent/projects/${projectId}`;
      default:
        return '/';
    }
  };

  if (!user) return null;

  const notifications = getUserNotifications(user.id).sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    unreadNotifications.forEach(n => markNotificationAsRead(n.id));
  };

  interface NotificationCardProps {
    notification: typeof notifications[0];
  }

  const NotificationCard: React.FC<NotificationCardProps> = ({ notification }) => {
    const Icon = notificationIcons[notification.type];
    const colorClass = notificationColors[notification.type];
    const isExpanded = expandedId === notification.id;

    const handleToggle = () => {
      setExpandedId((prev) => (prev === notification.id ? null : notification.id));
      if (!notification.read) {
        markNotificationAsRead(notification.id);
      }
    };

    const handleCardClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
      const scrollContainer = e.currentTarget.closest(
        '[data-notifications-scroll="true"]'
      ) as HTMLElement | null;

      const prevScrollTop = scrollContainer?.scrollTop;
      handleToggle();

      if (scrollContainer && typeof prevScrollTop === 'number') {
        requestAnimationFrame(() => {
          scrollContainer.scrollTop = prevScrollTop;
        });
      }
    };

    return (
      <Card
        className={`p-4 mb-3 cursor-pointer select-none transition-colors hover:bg-gray-50 ${
          notification.read && !isExpanded ? 'opacity-60' : 'border-l-4 border-l-blue-500'
        }`}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
      >
        <div className="flex items-start gap-4">
          <div className={`size-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
            <Icon className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className={`font-medium mb-1 text-sm ${isExpanded ? 'text-gray-900' : 'text-gray-700'}`}>
                  {notification.title}
                </h3>
                <p
                  className={`text-sm mb-2 ${
                    isExpanded
                      ? 'text-gray-900 whitespace-pre-wrap break-words'
                      : 'text-gray-600 line-clamp-1'
                  }`}
                >
                  {notification.description}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notification.id);
                    }}
                    title="Mark as read"
                  >
                    <Check className="size-4" />
                  </Button>
                )}
              </div>
            </div>
            {notification.link && isExpanded && (
              <Link
                to={getProjectLink(notification.link.split('/').pop() || '')}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
              >
                <Button variant="link" size="sm" className="mt-2 px-0">
                  View Details →
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <RightDrawer
      open={open}
      onClose={onClose}
      title="Notifications"
      width={450}
    >
      <div className="space-y-4">
        {/* Header with unread count and mark all read */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="size-5" />
            {unreadNotifications.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadNotifications.length} unread
              </span>
            )}
          </div>
          {unreadNotifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <Check className="size-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="read">
              Read ({readNotifications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-2">
            {notifications.length === 0 ? (
              <Card className="p-8 text-center">
                <Bell className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-gray-600">You're all caught up!</p>
              </Card>
            ) : (
              <div className="max-h-[calc(100vh-250px)] overflow-y-auto pr-2" data-notifications-scroll="true">
                {notifications.map(notification => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="unread" className="mt-4 space-y-2">
            {unreadNotifications.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle2 className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No unread notifications</h3>
                <p className="text-gray-600">You're all caught up!</p>
              </Card>
            ) : (
              <div className="max-h-[calc(100vh-250px)] overflow-y-auto pr-2" data-notifications-scroll="true">
                {unreadNotifications.map(notification => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="read" className="mt-4 space-y-2">
            {readNotifications.length === 0 ? (
              <Card className="p-8 text-center">
                <Bell className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No read notifications</h3>
                <p className="text-gray-600">Read notifications will appear here</p>
              </Card>
            ) : (
              <div className="max-h-[calc(100vh-250px)] overflow-y-auto pr-2" data-notifications-scroll="true">
                {readNotifications.map(notification => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RightDrawer>
  );
}

