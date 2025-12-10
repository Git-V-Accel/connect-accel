import React, { ReactNode, isValidElement } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon | ReactNode;
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
  // Render icon: if it's already a React element, use it directly
  // Otherwise, if it's a component function, instantiate it
  const renderIcon = () => {
    if (isValidElement(Icon)) {
      return Icon;
    }
    if (typeof Icon === 'function') {
      const IconComponent = Icon as LucideIcon;
      return <IconComponent className="size-5" />;
    }
    return null;
  };

  const content = (
    <Card className={`p-6 ${link || onClick ? 'hover:shadow-lg transition-shadow cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-3xl mt-2">{value}</p>
        </div>
        <div className={`${bgColor} ${color} p-3 rounded-lg`}>
          {renderIcon()}
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

