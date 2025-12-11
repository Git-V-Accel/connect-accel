/**
 * Project Timeline Component
 * Displays a comprehensive timeline of all project activities and changes
 */

import React from 'react';
import { ActivityLog } from '../../services/activityLogService';
import { statusColors, statusLabels } from '../../constants/projectConstants';
import { Badge } from '../ui/badge';
import {
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  DollarSign,
  User,
  FileText,
  AlertCircle,
  Users,
  MessageSquare,
  Target,
  Award,
  Trash2,
  Eye,
  ArrowRight,
} from 'lucide-react';

interface ProjectTimelineProps {
  activityLogs: ActivityLog[];
  project: any;
  loading?: boolean;
}

export default function ProjectTimeline({ activityLogs, project, loading = false }: ProjectTimelineProps) {
  const getActivityIcon = (activityType: string, metadata?: any) => {
    // Check if it's an approval or rejection based on metadata
    if (metadata?.action === 'approved') {
      return <CheckCircle className="size-5 text-green-600" />;
    }
    if (metadata?.action === 'rejected') {
      return <XCircle className="size-5 text-red-600" />;
    }
    
    switch (activityType) {
      case 'project_created':
        return <Clock className="size-5 text-blue-600" />;
      case 'project_status_changed':
        // Check metadata for specific status transitions
        if (metadata?.oldStatus === 'pending_review' && metadata?.newStatus === 'in_progress') {
          return <CheckCircle className="size-5 text-green-600" />;
        }
        if (metadata?.oldStatus === 'pending_review' && metadata?.newStatus === 'rejected') {
          return <XCircle className="size-5 text-red-600" />;
        }
        return <CheckCircle className="size-5 text-green-600" />;
      case 'project_updated':
        return <Edit className="size-5 text-purple-600" />;
      case 'project_deleted':
        return <Trash2 className="size-5 text-red-600" />;
      case 'milestone_created':
        return <Target className="size-5 text-orange-600" />;
      case 'milestone_completed':
      case 'milestone_status_updated':
        return <Award className="size-5 text-yellow-600" />;
      case 'description_added':
      case 'description_updated':
      case 'description_deleted':
        return <FileText className="size-5 text-indigo-600" />;
      case 'file_uploaded':
        return <FileText className="size-5 text-teal-600" />;
      case 'file_deleted':
        return <Trash2 className="size-5 text-red-500" />;
      case 'file_downloaded':
      case 'file_viewed':
        return <Eye className="size-5 text-blue-500" />;
      case 'payment_initiated':
      case 'payment_processing':
        return <DollarSign className="size-5 text-yellow-600" />;
      case 'payment_completed':
        return <DollarSign className="size-5 text-green-600" />;
      case 'payment_failed':
      case 'payment_cancelled':
        return <XCircle className="size-5 text-red-600" />;
      case 'admin_assigned_freelancer':
      case 'admin_updated_project':
        return <Users className="size-5 text-purple-600" />;
      case 'admin_approved_payment':
        return <CheckCircle className="size-5 text-green-600" />;
      case 'admin_rejected_payment':
        return <XCircle className="size-5 text-red-600" />;
      case 'project_note_added':
      case 'project_note_updated':
        return <FileText className="size-5 text-blue-600" />;
      case 'project_note_deleted':
        return <Trash2 className="size-5 text-red-500" />;
      case 'message_sent':
      case 'notification_sent':
        return <MessageSquare className="size-5 text-indigo-600" />;
      default:
        return <AlertCircle className="size-5 text-gray-600" />;
    }
  };

  const getActivityColor = (activityType: string, metadata?: any) => {
    // Check if it's an approval or rejection based on metadata
    if (metadata?.action === 'approved') {
      return 'bg-green-100';
    }
    if (metadata?.action === 'rejected') {
      return 'bg-red-100';
    }
    
    switch (activityType) {
      case 'project_created':
        return 'bg-blue-100';
      case 'project_status_changed':
        // Check metadata for specific status transitions
        if (metadata?.oldStatus === 'pending_review' && metadata?.newStatus === 'in_progress') {
          return 'bg-green-100';
        }
        if (metadata?.oldStatus === 'pending_review' && metadata?.newStatus === 'rejected') {
          return 'bg-red-100';
        }
        return 'bg-green-100';
      case 'project_updated':
        return 'bg-purple-100';
      case 'project_deleted':
        return 'bg-red-100';
      case 'milestone_created':
        return 'bg-orange-100';
      case 'milestone_completed':
      case 'milestone_status_updated':
        return 'bg-yellow-100';
      case 'description_added':
      case 'description_updated':
        return 'bg-indigo-100';
      case 'description_deleted':
        return 'bg-red-100';
      case 'file_uploaded':
        return 'bg-teal-100';
      case 'file_deleted':
        return 'bg-red-100';
      case 'file_downloaded':
      case 'file_viewed':
        return 'bg-blue-100';
      case 'payment_initiated':
      case 'payment_processing':
        return 'bg-yellow-100';
      case 'payment_completed':
        return 'bg-green-100';
      case 'payment_failed':
      case 'payment_cancelled':
        return 'bg-red-100';
      case 'admin_assigned_freelancer':
      case 'admin_updated_project':
        return 'bg-purple-100';
      case 'admin_approved_payment':
        return 'bg-green-100';
      case 'admin_rejected_payment':
        return 'bg-red-100';
      case 'project_note_added':
      case 'project_note_updated':
        return 'bg-blue-100';
      case 'project_note_deleted':
        return 'bg-red-100';
      case 'message_sent':
      case 'notification_sent':
        return 'bg-indigo-100';
      default:
        return 'bg-gray-100';
    }
  };

  const formatChange = (key: string, value: any) => {
    if (key === 'status' && value) {
      return statusLabels[value] || value;
    }
    if (key === 'priority' && value) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
    if (key === 'budget' || key === 'client_budget' || key === 'freelancer_budget' || key === 'amount') {
      return `₹${Number(value).toLocaleString('en-IN')}`;
    }
    if (key === 'timeline' || key === 'duration_weeks') {
      return typeof value === 'number' ? `${value} weeks` : value;
    }
    if (key === 'isNegotiableBudget' || key === 'requirements') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return JSON.stringify(value);
    }
    return value?.toString() || 'N/A';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading activity logs...</p>
      </div>
    );
  }

  if (activityLogs.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="size-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No activity logs found</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
      
      <div className="space-y-6">
        {activityLogs.map((log, index) => (
          <div key={log._id || log.id || index} className="relative flex items-start gap-4">
            {/* Icon */}
            <div className={`relative z-10 ${getActivityColor(log.activityType, log.metadata)} p-2 rounded-full`}>
              {getActivityIcon(log.activityType, log.metadata)}
            </div>
            
            {/* Content */}
            <div className="flex-1 pb-6">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="font-medium text-gray-900">{log.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{log.description}</p>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
              
              {/* User info */}
              <div className="flex items-center gap-2 mt-2 mb-3">
                <User className="size-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {log.user?.name || 'Unknown User'}
                  {log.user?.role && ` (${log.user.role})`}
                </span>
              </div>

              {/* Show changes if metadata exists */}
              {log.metadata && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {/* Approval/Rejection specific info */}
                  {log.metadata.action === 'approved' && (
                    <div className="mb-2 p-2 bg-green-50 rounded border border-green-200">
                      <p className="text-xs font-medium text-green-700 mb-1">Project Approved</p>
                      <p className="text-sm text-green-600">
                        Approved by {log.metadata.approvedBy || 'Admin'}
                        {log.metadata.approvedByRole && ` (${log.metadata.approvedByRole})`}
                      </p>
                    </div>
                  )}

                  {log.metadata.action === 'rejected' && (
                    <div className="mb-2 p-2 bg-red-50 rounded border border-red-200">
                      <p className="text-xs font-medium text-red-700 mb-1">Project Rejected</p>
                      <p className="text-sm text-red-600">
                        Rejected by {log.metadata.rejectedBy || 'Admin'}
                        {log.metadata.rejectedByRole && ` (${log.metadata.rejectedByRole})`}
                      </p>
                      {log.metadata.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1 italic">
                          Reason: {log.metadata.rejectionReason}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Status changes */}
                  {log.metadata.oldStatus && log.metadata.newStatus && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">Status Change:</p>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge className={statusColors[log.metadata.oldStatus] || 'bg-gray-100 text-gray-700'}>
                          {statusLabels[log.metadata.oldStatus] || log.metadata.oldStatus}
                        </Badge>
                        <ArrowRight className="size-4 text-gray-400" />
                        <Badge className={statusColors[log.metadata.newStatus] || 'bg-gray-100 text-gray-700'}>
                          {statusLabels[log.metadata.newStatus] || log.metadata.newStatus}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Priority changes */}
                  {log.metadata.oldPriority && log.metadata.newPriority && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">Priority Change:</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">{formatChange('priority', log.metadata.oldPriority)}</span>
                        <ArrowRight className="size-4 text-gray-400" />
                        <span className="text-gray-600">{formatChange('priority', log.metadata.newPriority)}</span>
                      </div>
                    </div>
                  )}

                  {/* Other changes */}
                  {log.metadata.changes && typeof log.metadata.changes === 'object' && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-2">Changes:</p>
                      <div className="space-y-1">
                        {Object.entries(log.metadata.changes).map(([key, value]: [string, any]) => {
                          if (key === 'status' || key === 'priority') return null; // Already shown above
                          return (
                            <div key={key} className="text-xs">
                              <span className="font-medium text-gray-700 capitalize">{key.replace(/_/g, ' ')}:</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-gray-500 line-through">{formatChange(key, project[key as keyof typeof project])}</span>
                                <ArrowRight className="size-3 text-gray-400" />
                                <span className="text-gray-700">{formatChange(key, value)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Milestone info */}
                  {log.metadata.milestoneTitle && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-700">Milestone:</p>
                      <p className="text-sm text-gray-600">{log.metadata.milestoneTitle}</p>
                      {log.metadata.milestoneAmount && (
                        <p className="text-sm text-gray-600">Amount: ₹{log.metadata.milestoneAmount.toLocaleString()}</p>
                      )}
                    </div>
                  )}

                  {/* Budget changes */}
                  {(log.metadata.changes?.budget || log.metadata.changes?.client_budget) && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">Budget Change:</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500 line-through">
                          {formatChange('budget', log.metadata.changes.budget || log.metadata.changes.client_budget ? 
                            (project.budget || project.client_budget) : 'N/A')}
                        </span>
                        <ArrowRight className="size-4 text-gray-400" />
                        <span className="text-gray-700 font-medium">
                          {formatChange('budget', log.metadata.changes.budget || log.metadata.changes.client_budget)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Timeline changes */}
                  {(log.metadata.changes?.timeline || log.metadata.changes?.duration_weeks) && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">Timeline Change:</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500 line-through">
                          {formatChange('timeline', project.timeline || project.duration_weeks)}
                        </span>
                        <ArrowRight className="size-4 text-gray-400" />
                        <span className="text-gray-700">
                          {formatChange('timeline', log.metadata.changes.timeline || log.metadata.changes.duration_weeks)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Project creation metadata */}
                  {log.activityType === 'project_created' && log.metadata && (
                    <div className="mt-2 space-y-1">
                      {log.metadata.projectBudget && (
                        <div className="text-xs">
                          <span className="font-medium text-gray-700">Initial Budget: </span>
                          <span className="text-gray-600">{formatChange('budget', log.metadata.projectBudget)}</span>
                        </div>
                      )}
                      {log.metadata.projectPriority && (
                        <div className="text-xs">
                          <span className="font-medium text-gray-700">Priority: </span>
                          <span className="text-gray-600">{formatChange('priority', log.metadata.projectPriority)}</span>
                        </div>
                      )}
                      {log.metadata.projectCategory && (
                        <div className="text-xs">
                          <span className="font-medium text-gray-700">Category: </span>
                          <span className="text-gray-600">{log.metadata.projectCategory}</span>
                        </div>
                      )}
                      {log.metadata.projectTimeline && (
                        <div className="text-xs">
                          <span className="font-medium text-gray-700">Timeline: </span>
                          <span className="text-gray-600">{log.metadata.projectTimeline}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment info */}
                  {log.metadata.amount && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-700">Payment Amount:</p>
                      <p className="text-sm text-gray-600 font-medium">
                        {formatChange('amount', log.metadata.amount)}
                        {log.metadata.currency && ` ${log.metadata.currency}`}
                      </p>
                      {log.metadata.transactionId && (
                        <p className="text-xs text-gray-500 mt-1">Transaction ID: {log.metadata.transactionId}</p>
                      )}
                      {log.metadata.paymentMethod && (
                        <p className="text-xs text-gray-500">Method: {log.metadata.paymentMethod}</p>
                      )}
                    </div>
                  )}

                  {/* File info */}
                  {log.metadata.fileName && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-700">File:</p>
                      <p className="text-sm text-gray-600">{log.metadata.fileName}</p>
                      {log.metadata.fileSize && (
                        <p className="text-xs text-gray-500">
                          Size: {(log.metadata.fileSize / 1024).toFixed(2)} KB
                        </p>
                      )}
                      {log.metadata.fileType && (
                        <p className="text-xs text-gray-500">Type: {log.metadata.fileType}</p>
                      )}
                    </div>
                  )}

                  {/* Description info */}
                  {log.metadata.descriptionLength && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-700">Description:</p>
                      {log.metadata.descriptionPreview && (
                        <p className="text-sm text-gray-600 italic">"{log.metadata.descriptionPreview}"</p>
                      )}
                      <p className="text-xs text-gray-500">Length: {log.metadata.descriptionLength} characters</p>
                    </div>
                  )}

                  {/* Admin action info */}
                  {log.metadata.adminAction && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-700">Admin Action:</p>
                      <p className="text-sm text-gray-600">{log.metadata.adminAction}</p>
                      {log.metadata.freelancerName && (
                        <p className="text-xs text-gray-500 mt-1">Freelancer: {log.metadata.freelancerName}</p>
                      )}
                    </div>
                  )}

                  {/* Additional data */}
                  {log.metadata.additionalData && typeof log.metadata.additionalData === 'object' && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">Additional Information:</p>
                      <div className="text-xs text-gray-600 space-y-1">
                        {Object.entries(log.metadata.additionalData).map(([key, value]: [string, any]) => (
                          <div key={key}>
                            <span className="font-medium capitalize">{key.replace(/_/g, ' ')}: </span>
                            <span>{formatChange(key, value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {log.tags && log.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {log.tags.map((tag: string, tagIndex: number) => (
                        <Badge key={tagIndex} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Severity indicator */}
                  {log.severity && (
                    <div className="mt-2">
                      <Badge 
                        className={
                          log.severity === 'high'
                            ? 'bg-red-100 text-red-700' 
                            : log.severity === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }
                      >
                        {log.severity.charAt(0).toUpperCase() + log.severity.slice(1)} Priority
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

