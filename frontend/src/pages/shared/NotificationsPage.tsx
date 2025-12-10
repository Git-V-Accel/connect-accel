import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Bell, CheckCircle2, DollarSign, MessageSquare, Briefcase, Flag, Check, Trash2 } from 'lucide-react';

const notificationIcons = {
  project: Briefcase,
  milestone: CheckCircle2,
  payment: DollarSign,
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

export default function NotificationsPage() {
  const { user } = useAuth();
  const { getUserNotifications, markNotificationAsRead } = useData();
  const [selectedTab, setSelectedTab] = useState('all');

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

    return (
      <Card className={`p-4 ${notification.read ? 'opacity-60' : 'border-l-4 border-l-blue-500'}`}>
        <div className="flex items-start gap-4">
          <div className={`size-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
            <Icon className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-medium mb-1">{notification.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{notification.description}</p>
                <p className="text-xs text-gray-500">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkAsRead(notification.id)}
                    title="Mark as read"
                  >
                    <Check className="size-4" />
                  </Button>
                )}
              </div>
            </div>
            {notification.link && (
              <Link to={notification.link}>
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
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl">Notifications</h1>
            <p className="text-gray-600">Stay updated with all your activity</p>
          </div>
          {unreadNotifications.length > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <Check className="size-4 mr-2" />
              Mark All as Read
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Bell className="size-5 text-gray-600" />
            <span className="text-gray-600">
              {unreadNotifications.length} unread notification{unreadNotifications.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList>
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

          <TabsContent value="all" className="space-y-3">
            {notifications.length === 0 ? (
              <Card className="p-12 text-center">
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-gray-600">You're all caught up!</p>
              </Card>
            ) : (
              notifications.map(notification => (
                <NotificationCard key={notification.id} notification={notification} />
              ))
            )}
          </TabsContent>

          <TabsContent value="unread" className="space-y-3">
            {unreadNotifications.length === 0 ? (
              <Card className="p-12 text-center">
                <h3 className="text-lg font-medium mb-2">No unread notifications</h3>
                <p className="text-gray-600">You're all caught up!</p>
              </Card>
            ) : (
              unreadNotifications.map(notification => (
                <NotificationCard key={notification.id} notification={notification} />
              ))
            )}
          </TabsContent>

          <TabsContent value="read" className="space-y-3">
            {readNotifications.length === 0 ? (
              <Card className="p-12 text-center">
                <h3 className="text-lg font-medium mb-2">No read notifications</h3>
                <p className="text-gray-600">Read notifications will appear here</p>
              </Card>
            ) : (
              readNotifications.map(notification => (
                <NotificationCard key={notification.id} notification={notification} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
