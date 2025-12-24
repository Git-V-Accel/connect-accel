/**
 * ProjectStatusTimeline Component
 * Displays status change timeline entries
 */

import React from 'react';
import { ProjectTimelineEntry } from '../../services/projectService';
import { statusColors, statusLabels } from '../../constants/projectConstants';
import { Badge } from '../ui/badge';
import { Clock, User, ArrowRight } from 'lucide-react';
import { RichTextViewer } from '../common/RichTextViewer';

interface ProjectStatusTimelineProps {
  timeline: ProjectTimelineEntry[];
  loading?: boolean;
}

export default function ProjectStatusTimeline({ timeline, loading = false }: ProjectStatusTimelineProps) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading timeline...</p>
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="size-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No timeline entries found</p>
      </div>
    );
  }

  const getUserDisplay = (entry: ProjectTimelineEntry) => {
    if (typeof entry.userId === 'object' && entry.userId !== null) {
      return entry.userId.name || 'Unknown User';
    }
    return 'Unknown User';
  };

  const formatActionLabel = (action: string) => {
    const actionMap: Record<string, string> = {
      post_project: 'Posted Project',
      create_bidding: 'Created Bidding',
      award_bidding: 'Awarded Bidding',
      complete_project: 'Completed Project',
      hold_project: 'Put on Hold',
      cancel_project: 'Cancelled Project',
    };
    return actionMap[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

      <div className="space-y-6">
        {timeline.map((entry, index) => (
          <div key={entry._id || index} className="relative flex items-start gap-4">
            {/* Icon */}
            <div className="relative z-10 bg-blue-100 p-2 rounded-full">
              <Clock className="size-5 text-blue-600" />
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="font-medium text-gray-900">{formatActionLabel(entry.action)}</p>
                  {entry.remark && (
                    <p className="text-sm text-gray-600 mt-1">Reason: <RichTextViewer content={entry.remark} /></p>
                  )}
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>

              {/* User info */}
              <div className="flex items-center gap-2 mt-2 mb-3">
                <User className="size-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {getUserDisplay(entry)}
                  {entry.userRole && ` (${entry.userRole})`}
                </span>
              </div>

              {/* Status change */}
              {entry.oldStatus && entry.newStatus && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">Status Change:</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className={statusColors[entry.oldStatus] || 'bg-gray-100 text-gray-700'}>
                      {statusLabels[entry.oldStatus] || entry.oldStatus.replace(/_/g, ' ')}
                    </Badge>
                    <ArrowRight className="size-4 text-gray-400" />
                    <Badge className={statusColors[entry.newStatus] || 'bg-gray-100 text-gray-700'}>
                      {statusLabels[entry.newStatus] || entry.newStatus.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

