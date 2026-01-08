import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Calendar, Video, Phone, User, MessageSquare, CheckCircle, XCircle, Edit, ArrowRight } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';

interface ConsultationCardProps {
  consultation: any;
  isExpanded?: boolean;
  onToggleExpand?: (consultationId: string) => void;
  onAssignAgent?: (consultation: any) => void;
  onReassignAgent?: (consultation: any) => void;
  onCompleteConsultation?: (consultation: any) => void;
  onCancelConsultation?: (consultation: any) => void;
  onUndoCancelConsultation?: (consultation: any) => void;
  showActions?: boolean;
  showAccordion?: boolean;
}

const ConsultationCard: React.FC<ConsultationCardProps> = ({
  consultation,
  isExpanded = false,
  onToggleExpand,
  onAssignAgent,
  onReassignAgent,
  onCompleteConsultation,
  onCancelConsultation,
  onUndoCancelConsultation,
  showActions = true,
  showAccordion = true
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'assigned':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="size-4" />;
      case 'phone':
        return <Phone className="size-4" />;
      case 'in-person':
        return <User className="size-4" />;
      default:
        return <MessageSquare className="size-4" />;
    }
  };

  const isCompleted = consultation.status === 'completed';

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                {getTypeIcon('video')}
              </div>
              <div>
                <h3 className="font-medium">{consultation.projectTitle || 'Consultation Request'}</h3>
                <p className="text-sm text-gray-600">with {consultation.clientName}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(consultation.status)}>
              {consultation.status.toUpperCase()}
            </Badge>
            {showAccordion && isCompleted && onToggleExpand && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleExpand(consultation._id)}
                className="p-2"
              >
                {isExpanded ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 py-4 border-y">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Calendar className="size-4" />
              Date & Time
            </div>
            <div>{new Date(consultation.createdAt).toLocaleString()}</div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              {getTypeIcon(consultation.type)}
              Type
            </div>
            <div className="capitalize">Consultation</div>
          </div>


          {consultation.assignedTo && (
            <div>
              <Label className="text-gray-600">Assigned To</Label>
              <p className="mt-1 text-gray-700">{consultation.assignedTo.name} <em>({consultation.assignedTo.role})</em></p>
            </div>
          )}

          {consultation.assignedBy && (
            <div>
              <Label className="text-gray-600">Assigned By</Label>
              <p className="mt-1 text-gray-700">{consultation.assignedBy.name} <em>({consultation.assignedBy.role})</em></p>
            </div>
          )}

          {consultation.completedBy && (
            <div>
              <Label className="text-gray-600">Completed By</Label>
              <p className="mt-1 text-gray-700">{consultation.completedBy.name} <em>({consultation.completedBy.role})</em></p>
            </div>
          )}

          {consultation.completedAt && (
            <div>
              <Label className="text-gray-600">Completed At</Label>
              <p className="mt-1 text-gray-700">{new Date(consultation.completedAt).toLocaleString()}</p>
            </div>
          )}
            {consultation.status === 'cancelled' && consultation.cancelledBy && (
          <div>
            <Label className="text-gray-600">Cancelled By</Label>
            <p className="mt-1 text-gray-700">{consultation.cancelledBy.name} <em>({consultation.cancelledBy.role})</em></p>
          </div>
        )}

        {consultation.status === 'cancelled' && consultation.cancellationReason && (
          <div>
            <Label className="text-gray-600">Cancellation Reason</Label>
            <p className="mt-1 text-gray-700 whitespace-pre-wrap">{consultation.cancellationReason}</p>
          </div>
        )}
        </div>
      


        {showActions && (
          <div className="flex items-center gap-3">
            {consultation.status === 'pending' && onAssignAgent && (
              <Button
                size="sm"
                onClick={() => onAssignAgent(consultation)}
              >
                <Calendar className="size-4 mr-2" />
                Assign to agent
              </Button>
            )}

            {consultation.status === 'assigned' && (
              <>
                {onReassignAgent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReassignAgent(consultation)}
                  >
                    <Edit className="size-4 mr-2" />
                    Re-assign
                  </Button>
                )}
                {onCompleteConsultation && (
                  <Button
                    size="sm"
                    onClick={() => onCompleteConsultation(consultation)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="size-4 mr-2" />
                    Complete
                  </Button>
                )}
                {onCancelConsultation && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCancelConsultation(consultation)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="size-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </>
            )}

            {consultation.status === 'cancelled' && onUndoCancelConsultation && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUndoCancelConsultation(consultation)}
                className="text-blue-600 hover:text-blue-700"
              >
                <CheckCircle className="size-4 mr-2" />
                Undo Cancel
              </Button>
            )}
  {consultation.status === 'completed' && consultation.project && (
              <Link to={`/admin/projects/${consultation.project._id}/review`}>
                <Button variant="outline" size="sm">
                  <ArrowRight className="size-4 mr-2" />
                  View Project
                </Button>
              </Link>
            )}
            {consultation.status === 'completed' && !consultation.project && (
              <Link to={`/admin/projects/create?clientId=${consultation.client._id}&clientName=${encodeURIComponent(consultation.clientName)}&consultationId=${consultation._id}`}>
                <Button variant="outline" size="sm">
                  <ArrowRight className="size-4 mr-2" />
                  Create Project
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Accordion Content for Completed Consultations */}
        {showAccordion && isCompleted && isExpanded && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {consultation.projectDescription && (
                <div>
                  <Label className="text-gray-600">Project Description</Label>
                  <p className="mt-1 text-gray-700 whitespace-pre-wrap">{consultation.projectDescription}</p>
                </div>
              )}

              {consultation.projectTitle && (
                <div>
                  <Label className="text-gray-600">Project Title</Label>
                  <p className="mt-1 text-gray-700 whitespace-pre-wrap">{consultation.projectTitle}</p>
                </div>
              )}


            </div>

            {consultation.outcome && (
              <div>
                <Label className="text-gray-600">Outcome</Label>
                <div className="mt-1 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{consultation.outcome}</p>
                </div>
              </div>
            )}

            {consultation.meetingNotes && (
              <div>
                <Label className="text-gray-600">Meeting Notes</Label>
                <div className="mt-1 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{consultation.meetingNotes}</p>
                </div>
              </div>
            )}

            {consultation.actionItems && (
              <div>
                <Label className="text-gray-600">Action Items</Label>
                <div className="mt-1 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{consultation.actionItems}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ConsultationCard;
