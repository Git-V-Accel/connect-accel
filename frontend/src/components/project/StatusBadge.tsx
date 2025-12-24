/**
 * StatusBadge Component
 * Displays project status with correct label and color
 */

import React from 'react';
import { Badge } from '../ui/badge';
import { statusColors, statusLabels } from '../../constants/projectConstants';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const statusColor = statusColors[status] || 'bg-gray-100 text-gray-700';
  const statusLabel = statusLabels[status] || status.replace(/_/g, ' ');

  return (
    <Badge className={`${statusColor} ${className}`}>
      {statusLabel}
    </Badge>
  );
}

