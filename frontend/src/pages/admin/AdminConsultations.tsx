import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import AssignAgentDialog from '../../components/shared/AssignAgentDialog';
import CancelConsultationDialog from '../../components/shared/CancelConsultationDialog';
import ConsultationCard from '../../components/shared/ConsultationCard';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import * as userService from '../../services/userService';
import consultationService from '../../services/consultationService';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Video,
  MessageSquare,
  CheckCircle,
  XCircle,
  FileText,
  Search,
} from 'lucide-react';
import { toast } from '../../utils/toast';

export default function AdminConsultations() {
  const { consultations, updateConsultation, projects } = useData();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  
  // Agent assignment states
  const [isAssignAgentDialogOpen, setIsAssignAgentDialogOpen] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [assignmentType, setAssignmentType] = useState('assign_to_agent');

  // Form states
  const [meetingNotes, setMeetingNotes] = useState('');
  const [actionItems, setActionItems] = useState('');
  const [outcome, setOutcome] = useState('');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const requestedConsultations = consultations.filter((c) => c.status === 'pending');
  const scheduledConsultations = consultations.filter((c) => c.status === 'assigned');
  const completedConsultations = consultations.filter((c) => c.status === 'completed');
  const cancelledConsultations = consultations.filter((c) => c.status === 'cancelled');

  // Load agents for assignment
  const loadAgents = async () => {
    setIsLoadingAgents(true);
    try {
      const users = await userService.listUsers();
      const agentUsers = users.filter((u: any) => u.role === 'agent');
      console.log(agentUsers,"agentUsers");
      setAgents(agentUsers.map((agent: any) => ({
        id: agent._id || agent.id,
        name: agent.name,
        userID: agent.userID,
        email: agent.email,
        status: agent.status
      })));
    } catch (error: any) {
      console.error('Failed to load agents:', error);
      toast.error('Failed to load agents');
    } finally {
      setIsLoadingAgents(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      loadAgents();
    }
  }, [user]);

  const filteredConsultations = consultations.filter(
    (c) =>
      c.status.includes(searchQuery.toLowerCase()) ||
      projects.find((p) => p.id === c.project?._id)?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const handleCompleteConsultation = async () => {
    if (!selectedConsultation || !outcome) {
      toast.error('Please provide consultation outcome');
      return;
    }

    try {
      const response = await consultationService.completeConsultation(selectedConsultation._id, {
        meetingNotes,
        outcome,
        actionItems
      });

      // Update the local consultation data with the response from API
      if (response.success && response.data) {
        updateConsultation(selectedConsultation._id, response.data);
      }

      toast.success('Consultation marked as completed!');
      setIsCompleteDialogOpen(false);
      setMeetingNotes('');
      setActionItems('');
      setOutcome('');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to complete consultation';
      toast.error(errorMessage);
    }
  };

  const handleAssignAgent = async () => {
    if (!selectedConsultation) return;

    if (assignmentType === 'assign_to_agent' && !selectedAgentId) {
      toast.error('Please select an agent');
      return;
    }

    try {
      const response = await consultationService.assignConsultation(selectedConsultation._id, {
        assigneeId: selectedAgentId,
        assignmentType: assignmentType as 'assign_to_agent' | 'move_to_in_house'
      });

      // Update the local consultation data with the response from API
      if (response.success && response.data) {
        updateConsultation(selectedConsultation._id, response.data);
      }

      toast.success(assignmentType === 'assign_to_agent' ? 'Agent assigned successfully!' : 'Moved to in-house successfully!');
      setIsAssignAgentDialogOpen(false);
      setSelectedAgentId('');
      setAssignmentType('assign_to_agent');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to assign consultation';
      toast.error(errorMessage);
    }
  };

  const handleOpenAssignDialog = (consultation: any, isEditing: boolean = false) => {
    setSelectedConsultation(consultation);
    setIsAssignAgentDialogOpen(true);
    if (isEditing && consultation.assignedTo) {
      setSelectedAgentId(consultation.assignedTo._id);
    }
  };

  const handleCancelConsultation = (consultation: any) => {
    setSelectedConsultation(consultation);
    setIsCancelDialogOpen(true);
  };

  const handleConfirmCancel = async (reason: string) => {
    if (!selectedConsultation) return;

    try {
      const response = await consultationService.cancelConsultation(selectedConsultation._id, {
        cancellationReason: reason
      });

      // Update the local consultation data with the response from API
      if (response.success && response.data) {
        updateConsultation(selectedConsultation._id, response.data);
      }

      toast.success('Consultation cancelled successfully!');
      setIsCancelDialogOpen(false);
      setSelectedConsultation(null);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to cancel consultation';
      toast.error(errorMessage);
    }
  };

  const handleUndoCancelConsultation = async (consultation: any) => {
    try {
      const response = await consultationService.undoCancelConsultation(consultation._id);

      // Update the local consultation data with the response from API
      if (response.success && response.data) {
        updateConsultation(consultation._id, response.data);
      }

      toast.success('Consultation restored successfully!');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to restore consultation';
      toast.error(errorMessage);
    }
  };

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

  const toggleCardExpansion = (consultationId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(consultationId)) {
        newSet.delete(consultationId);
      } else {
        newSet.add(consultationId);
      }
      return newSet;
    });
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2">Consultation Management</h1>
            <p className="text-gray-600">
              Schedule and manage client consultations
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Requested</p>
                <p className="text-2xl mt-1">{requestedConsultations.length}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="size-5 text-yellow-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl mt-1">{scheduledConsultations.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="size-5 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl mt-1">{completedConsultations.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="size-5 text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl mt-1">{cancelledConsultations.length}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="size-5 text-red-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl mt-1">{consultations.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <FileText className="size-5 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search consultations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Consultations Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">
              All ({consultations.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              <Clock className="size-4 mr-2" />
              Pending ({requestedConsultations.length})
            </TabsTrigger>
            <TabsTrigger value="assigned">
              <Calendar className="size-4 mr-2" />
              Assigned ({scheduledConsultations.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              <CheckCircle className="size-4 mr-2" />
              Completed ({completedConsultations.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              <XCircle className="size-4 mr-2" />
              Cancelled ({cancelledConsultations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredConsultations.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl mb-2">No consultations found</h3>
                <p className="text-gray-600 mb-6">
                  No consultations have been scheduled yet
                </p>
              </Card>
            ) : (
              filteredConsultations.map((consultation) => (
                <ConsultationCard 
                  key={consultation._id} 
                  consultation={consultation}
                  isExpanded={expandedCards.has(consultation._id)}
                  onToggleExpand={toggleCardExpansion}
                  onAssignAgent={handleOpenAssignDialog}
                  onReassignAgent={handleOpenAssignDialog}
                  onCompleteConsultation={() => {
                    setSelectedConsultation(consultation);
                    setIsCompleteDialogOpen(true);
                  }}
                  onCancelConsultation={handleCancelConsultation}
                  onUndoCancelConsultation={handleUndoCancelConsultation}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {requestedConsultations.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl mb-2">All caught up!</h3>
                <p className="text-gray-600">No consultation requests pending</p>
              </Card>
            ) : (
              requestedConsultations.map((consultation) => (
                <ConsultationCard 
                  key={consultation._id} 
                  consultation={consultation}
                  isExpanded={expandedCards.has(consultation._id)}
                  onToggleExpand={toggleCardExpansion}
                  onAssignAgent={handleOpenAssignDialog}
                  onReassignAgent={handleOpenAssignDialog}
                  onCompleteConsultation={() => {
                    setSelectedConsultation(consultation);
                    setIsCompleteDialogOpen(true);
                  }}
                  onCancelConsultation={handleCancelConsultation}
                  onUndoCancelConsultation={handleUndoCancelConsultation}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="assigned" className="space-y-4">
            {scheduledConsultations.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl mb-2">No scheduled consultations</h3>
                <p className="text-gray-600">Schedule consultations to see them here</p>
              </Card>
            ) : (
              scheduledConsultations
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                .map((consultation) => (
                  <ConsultationCard 
                    key={consultation._id} 
                    consultation={consultation}
                    isExpanded={expandedCards.has(consultation._id)}
                    onToggleExpand={toggleCardExpansion}
                    onAssignAgent={handleOpenAssignDialog}
                    onReassignAgent={handleOpenAssignDialog}
                    onCompleteConsultation={() => {
                      setSelectedConsultation(consultation);
                      setIsCompleteDialogOpen(true);
                    }}
                    onCancelConsultation={handleCancelConsultation}
                    onUndoCancelConsultation={handleUndoCancelConsultation}
                  />
                ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedConsultations.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl mb-2">No completed consultations</h3>
                <p className="text-gray-600">Completed consultations will appear here</p>
              </Card>
            ) : (
              completedConsultations
                .sort((a, b) => new Date(b.updatedAt).getTime() - 
                              new Date(a.updatedAt).getTime())
                .map((consultation) => (
                  <ConsultationCard 
                    key={consultation._id} 
                    consultation={consultation}
                    isExpanded={expandedCards.has(consultation._id)}
                    onToggleExpand={toggleCardExpansion}
                    onAssignAgent={handleOpenAssignDialog}
                    onReassignAgent={handleOpenAssignDialog}
                    onCompleteConsultation={() => {
                      setSelectedConsultation(consultation);
                      setIsCompleteDialogOpen(true);
                    }}
                    onCancelConsultation={handleCancelConsultation}
                    onUndoCancelConsultation={handleUndoCancelConsultation}
                  />
                ))
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {cancelledConsultations.length === 0 ? (
              <Card className="p-12 text-center">
                <XCircle className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl mb-2">No cancelled consultations</h3>
                <p className="text-gray-600">Cancelled consultations will appear here</p>
              </Card>
            ) : (
              cancelledConsultations
                .sort((a, b) => new Date(b.updatedAt).getTime() - 
                              new Date(a.updatedAt).getTime())
                .map((consultation) => (
                  <ConsultationCard 
                    key={consultation._id} 
                    consultation={consultation}
                    isExpanded={expandedCards.has(consultation._id)}
                    onToggleExpand={toggleCardExpansion}
                    onAssignAgent={handleOpenAssignDialog}
                    onReassignAgent={handleOpenAssignDialog}
                    onCompleteConsultation={() => {
                      setSelectedConsultation(consultation);
                      setIsCompleteDialogOpen(true);
                    }}
                    onCancelConsultation={handleCancelConsultation}
                    onUndoCancelConsultation={handleUndoCancelConsultation}
                  />
                ))
            )}
          </TabsContent>
        </Tabs>


        {/* Assign Agent Dialog */}
        <AssignAgentDialog
          isOpen={isAssignAgentDialogOpen}
          onOpenChange={setIsAssignAgentDialogOpen}
          onAssign={handleAssignAgent}
          agents={agents}
          selectedAgentId={selectedAgentId}
          onAgentSelect={setSelectedAgentId}
          isEditingAgent={selectedConsultation?.status === 'assigned'}
          isLoading={isLoadingAgents}
          assignmentType={assignmentType}
          onAssignmentTypeChange={setAssignmentType}
          showInHouseOption={false}
        />


        {/* Complete Dialog */}
        <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Complete Consultation</DialogTitle>
              <DialogDescription>
                Add meeting notes and outcomes
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Meeting Notes</Label>
                <Textarea
                  placeholder="What was discussed..."
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <Label>Outcome *</Label>
                <Textarea
                  placeholder="What was decided or agreed upon..."
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label>Action Items</Label>
                <Textarea
                  placeholder="Next steps and follow-ups..."
                  value={actionItems}
                  onChange={(e) => setActionItems(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCompleteConsultation} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="size-4 mr-2" />
                Mark Complete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Consultation Dialog */}
        <CancelConsultationDialog
          isOpen={isCancelDialogOpen}
          onOpenChange={setIsCancelDialogOpen}
          onCancel={handleConfirmCancel}
          consultationTitle={selectedConsultation?.projectTitle || `consultation for ${selectedConsultation?.clientName}`}
        />
      </div>
    </DashboardLayout>
  );
}
