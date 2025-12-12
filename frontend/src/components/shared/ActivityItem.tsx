import React, { ReactNode } from 'react';
import { CheckCircle, FolderKanban, Clock, IndianRupee, MessageSquare, AlertCircle, User } from 'lucide-react';

export type ActivityType = 'milestone' | 'status' | 'message' | 'payment' | 'project' | 'user' | 'alert';

interface ActivityItemProps {
  id?: string | number;
  text: string;
  time: string;
  type: ActivityType;
  icon?: ReactNode;
  onClick?: () => void;
}

const activityIcons: Record<ActivityType, ReactNode> = {
  milestone: <CheckCircle className="size-4" />,
  status: <FolderKanban className="size-4" />,
  message: <MessageSquare className="size-4" />,
  payment: <IndianRupee className="size-4" />,
  project: <FolderKanban className="size-4" />,
  user: <User className="size-4" />,
  alert: <AlertCircle className="size-4" />,
};

const activityColors: Record<ActivityType, { bg: string; text: string }> = {
  milestone: { bg: 'bg-green-100', text: 'text-green-600' },
  status: { bg: 'bg-blue-100', text: 'text-blue-600' },
  message: { bg: 'bg-purple-100', text: 'text-purple-600' },
  payment: { bg: 'bg-orange-100', text: 'text-orange-600' },
  project: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  user: { bg: 'bg-gray-100', text: 'text-gray-600' },
  alert: { bg: 'bg-red-100', text: 'text-red-600' },
};

export function ActivityItem({ text, time, type, icon, onClick }: ActivityItemProps) {
  const colors = activityColors[type] || activityColors.user;
  const defaultIcon = activityIcons[type] || activityIcons.user;

  return (
    <div 
      className={`flex gap-3 ${onClick ? 'cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors' : ''}`}
      onClick={onClick}
    >
      <div className={`flex-shrink-0 size-8 rounded-full flex items-center justify-center ${colors.bg} ${colors.text}`}>
        {icon || defaultIcon}
      </div>
      <div className="flex-1">
        <p className="text-sm">{text}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
}

