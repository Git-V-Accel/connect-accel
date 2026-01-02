import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/card';
import { LucideIcon } from 'lucide-react';
import { Icon } from '@iconify/react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon | ReactNode| Icon;
  color?: string;
  bgColor?: string;
  link?: string;
  onClick?: () => void;
}

export function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  color = 'text-blue-600', 
  bgColor = 'bg-blue-50',
  link,
  onClick
}: StatCardProps) {
  const content = (
    <Card className={`p-6 ${link || onClick ? 'hover:shadow-lg transition-shadow cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-3xl mt-2">{value}</p>
        </div>
        <div className={`${bgColor} p-3 rounded-lg flex items-center justify-center`}>
          <Icon className={`size-6 ${color}`} />
        </div>
      </div>
    </Card>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }

  if (onClick) {
    return <div onClick={onClick}>{content}</div>;
  }

  return content;
}

