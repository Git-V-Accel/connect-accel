import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import CompleteConsultationDialog from '../../components/shared/CompleteConsultationDialog';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  FileText
} from 'lucide-react';
import { toast } from '../../utils/toast';

export default function AgentConsultations() {
  const { consultations, updateConsultation } = useData();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Dialog states
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState('');
  const [outcome, setOutcome] = useState('');
  const [actionItems, setActionItems] = useState('');
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter consultations for this agent (only assigned consultations)
  const agentConsultations = consultations.filter(c => c.assignedTo && c.assignedTo._id === user?.id);

  const filteredConsultations = agentConsultations.filter(consultation => {
    if (statusFilter === 'all') return true;
    return consultation.status === statusFilter;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-gray-100 text-gray-700',
      'assigned': 'bg-blue-100 text-blue-700',
      'completed': 'bg-green-100 text-green-700',
      'cancelled': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Calendar className="size-4" />;
      case 'assigned':
        return <Clock className="size-4" />;
      case 'completed':
        return <CheckCircle2 className="size-4" />;
      case 'cancelled':
        return <XCircle className="size-4" />;
      default:
        return <AlertCircle className="size-4" />;
    }
  };

  const handleCompleteConsultation = async () => {
    if (!outcome.trim()) {
      toast.error('Outcome is required to complete consultation');
      return;
    }

    try {
      setIsUpdating(true);
      await updateConsultation(selectedConsultation._id, { 
        status: 'completed',
        outcome: outcome,
        meetingNotes: meetingNotes,
        actionItems: actionItems
      });
      toast.success('Consultation marked as completed');
      setIsCompleteDialogOpen(false);
      // Reset dialog fields
      setMeetingNotes('');
      setOutcome('');
      setActionItems('');
      setSelectedConsultation(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete consultation');
    } finally {
      setIsUpdating(false);
    }
  };

  const openCompleteDialog = (consultation: any) => {
    setSelectedConsultation(consultation);
    setIsCompleteDialogOpen(true);
  };

  const stats = [
    {
      label: 'Total Consultations',
      value: agentConsultations.length,
      icon: <Calendar className="size-5" />,
      color: 'bg-blue-500',
    },
    {
      label: 'Scheduled',
      value: agentConsultations.filter(c => c.status === 'assigned').length,
      icon: <Clock className="size-5" />,
      color: 'bg-purple-500',
    },
    {
      label: 'Completed',
      value: agentConsultations.filter(c => c.status === 'completed').length,
      icon: <CheckCircle2 className="size-5" />,
      color: 'bg-green-500',
    },
    {
      label: 'This Week',
      value: agentConsultations.filter(c => {
        const consultDate = new Date(c.createdAt);
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return consultDate >= now && consultDate <= weekFromNow;
      }).length,
      icon: <AlertCircle className="size-5" />,
      color: 'bg-orange-500',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl">Consultations</h1>
            <p className="text-gray-600 mt-1">Manage client consultations and discovery calls</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} text-white p-3 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <Label>Filter by Status:</Label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="assigned">Assigned</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Consultations List */}
        <div className="space-y-4">
          {filteredConsultations.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Calendar className="size-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg mb-2">No consultations found</h3>
              <p className="text-gray-600">Schedule a consultation to get started.</p>
            </div>
          ) : (
            filteredConsultations
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((consultation) => (
                <div key={consultation._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="size-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                        <User className="size-6" />
                      </div>
                      <div>
                        <h3 className="text-lg">{consultation.clientName || 'Unknown Client'}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="size-4" />
                            <span>{new Date(consultation.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="size-4" />
                            <span>{new Date(consultation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(consultation.status)}`}>
                      {getStatusIcon(consultation.status)}
                      {consultation.status}
                    </span>
                  </div>

                  {consultation.meetingNotes && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="size-4 text-gray-500" />
                        <span className="text-sm">Notes:</span>
                      </div>
                      <p className="text-sm text-gray-600">{consultation.meetingNotes}</p>
                    </div>
                  )}

                  {consultation.outcome && (
                    <div className="mb-4 p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="size-4 text-green-600" />
                        <span className="text-sm text-green-700">Outcome:</span>
                      </div>
                      <p className="text-sm text-gray-600">{consultation.outcome}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/consultation/${consultation._id}`}>
                        <FileText className="size-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                    {consultation.status === 'assigned' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCompleteDialog(consultation)}
                        >
                          <CheckCircle2 className="size-4 mr-2" />
                          Mark Complete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            updateConsultation(consultation._id, { status: 'cancelled' });
                            toast.success('Consultation cancelled');
                          }}
                        >
                          <XCircle className="size-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>
  
    {/* Complete Consultation Dialog */}
    <CompleteConsultationDialog
      open={isCompleteDialogOpen}
      onOpenChange={setIsCompleteDialogOpen}
      onComplete={handleCompleteConsultation}
      meetingNotes={meetingNotes}
      onMeetingNotesChange={setMeetingNotes}
      outcome={outcome}
      onOutcomeChange={setOutcome}
      actionItems={actionItems}
      onActionItemsChange={setActionItems}
      isLoading={isUpdating}
    />
      </div>
    </DashboardLayout>
  );
}
