import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import DashboardLayout from '../../components/shared/DashboardLayout';
import CompleteConsultationDialog from '../../components/shared/CompleteConsultationDialog';
import { ArrowLeft, Calendar, Clock, CheckCircle, XCircle, User, FileText } from 'lucide-react';
import { toast } from '../../utils/toast';
import { useState } from 'react';

export default function ConsultationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { consultations, updateConsultation } = useData();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Dialog states
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState('');
  const [dialogOutcome, setDialogOutcome] = useState('');
  const [actionItems, setActionItems] = useState('');
  
  const consultation = consultations.find(c => c._id === id);

  if (!consultation) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="max-w-4xl mx-auto text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl mb-2">Consultation Not Found</h2>
            <p className="text-gray-600 mb-6">The consultation you're looking for doesn't exist or you don't have access to it.</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'assigned': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'assigned':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const handleUpdateStatus = async (newStatus: 'completed' | 'cancelled') => {
    if (newStatus === 'completed') {
      // Open dialog instead of inline input
      setIsCompleteDialogOpen(true);
      return;
    }

    try {
      setIsUpdating(true);
      await updateConsultation(consultation._id, { 
        status: newStatus
      });
      toast.success(`Consultation marked as ${newStatus}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update consultation');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompleteConsultation = async () => {
    if (!dialogOutcome.trim()) {
      toast.error('Outcome is required to complete consultation');
      return;
    }

    try {
      setIsUpdating(true);
      await updateConsultation(consultation._id, { 
        status: 'completed',
        outcome: dialogOutcome,
        meetingNotes: meetingNotes,
        actionItems: actionItems
      });
      toast.success('Consultation marked as completed');
      setIsCompleteDialogOpen(false);
      // Reset dialog fields
      setMeetingNotes('');
      setDialogOutcome('');
      setActionItems('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete consultation');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Consultations
            </button>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{consultation.clientName}</h1>
                    <p className="text-gray-600">{consultation.clientEmail}</p>
                    {consultation.clientCompany && (
                      <p className="text-gray-600">{consultation.clientCompany}</p>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(consultation.status)}`}>
                  {getStatusIcon(consultation.status)}
                  {consultation.status}
                </span>
              </div>
            </div>
          </div>

          {/* Consultation Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Client Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Client Information
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{consultation.clientName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{consultation.clientEmail}</p>
                </div>
                {consultation.clientPhone && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900">{consultation.clientPhone}</p>
                  </div>
                )}
                {consultation.clientCompany && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Company</label>
                    <p className="text-gray-900">{consultation.clientCompany}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Consultation Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Consultation Details
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <p className="text-gray-900">{consultation.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Created Date</label>
                  <p className="text-gray-900">{new Date(consultation.createdAt).toLocaleDateString()}</p>
                </div>
                {consultation.assignedTo && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Assigned To</label>
                    <p className="text-gray-900">{consultation.assignedTo.name}</p>
                  </div>
                )}
                {consultation.assignedBy && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Assigned By</label>
                    <p className="text-gray-900">{consultation.assignedBy.name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Project Information */}
          {consultation.projectTitle && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Project Information
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Project Title</label>
                  <p className="text-gray-900">{consultation.projectTitle}</p>
                </div>
                {consultation.projectDescription && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="text-gray-900">{consultation.projectDescription}</p>
                  </div>
                )}
                {consultation.projectBudget && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Budget</label>
                    <p className="text-gray-900">{consultation.projectBudget}</p>
                  </div>
                )}
                {consultation.projectTimeline && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Timeline</label>
                    <p className="text-gray-900">{consultation.projectTimeline}</p>
                  </div>
                )}
                {consultation.projectCategory && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <p className="text-gray-900">{consultation.projectCategory}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Meeting Notes */}
          {consultation.meetingNotes && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Meeting Notes
              </h2>
              <p className="text-gray-900">{consultation.meetingNotes}</p>
            </div>
          )}

          {/* Outcome */}
          {consultation.outcome && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Outcome
              </h2>
              <p className="text-gray-900">{consultation.outcome}</p>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            
            <div className="flex items-center gap-3">
              {consultation.status === 'assigned' && (
                <>
                  <button
                    onClick={() => setIsCompleteDialogOpen(true)}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Updating...' : 'Mark Complete'}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('cancelled')}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Cancelling...' : 'Cancel'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Complete Consultation Dialog */}
          <CompleteConsultationDialog
            open={isCompleteDialogOpen}
            onOpenChange={setIsCompleteDialogOpen}
            onComplete={handleCompleteConsultation}
            meetingNotes={meetingNotes}
            onMeetingNotesChange={setMeetingNotes}
            outcome={dialogOutcome}
            onOutcomeChange={setDialogOutcome}
            actionItems={actionItems}
            onActionItemsChange={setActionItems}
            isLoading={isUpdating}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}