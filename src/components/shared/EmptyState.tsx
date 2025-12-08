import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon | ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionLink,
  onAction,
  className = '',
}: EmptyStateProps) {
  const actionButton = actionLabel && (
    <div className="mt-6">
      {actionLink ? (
        <Link to={actionLink}>
          <Button>{actionLabel}</Button>
        </Link>
      ) : onAction ? (
        <Button onClick={onAction}>{actionLabel}</Button>
      ) : null}
    </div>
  );

  return (
    <Card className={`p-12 text-center ${className}`}>
      <div className="max-w-md mx-auto">
        {Icon && (
          <div className="mb-4 flex justify-center">
            {typeof Icon === 'function' ? (
              <Icon className="size-16 text-gray-400" />
            ) : (
              <div className="text-gray-400">{Icon}</div>
            )}
          </div>
        )}
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        {actionButton}
      </div>
    </Card>
  );
}

