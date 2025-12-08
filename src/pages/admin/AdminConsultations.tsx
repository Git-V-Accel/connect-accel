import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { useData } from '../../contexts/DataContext';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Video,
  MessageSquare,
  CheckCircle,
  XCircle,
  Edit,
  Search,
  Plus,
  FileText,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { toast } from '../../utils/toast';

export default function AdminConsultations() {
  const { consultations, updateConsultation, addConsultation, projects } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);

  // Form states
  const [selectedProject, setSelectedProject] = useState('');
  const [consultationDate, setConsultationDate] = useState('');
  const [consultationTime, setConsultationTime] = useState('');
  const [consultationType, setConsultationType] = useState('video');
  const [agenda, setAgenda] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [actionItems, setActionItems] = useState('');
  const [outcome, setOutcome] = useState('');

  const requestedConsultations = consultations.filter((c) => c.status === 'requested');
  const scheduledConsultations = consultations.filter((c) => c.status === 'scheduled');
  const completedConsultations = consultations.filter((c) => c.status === 'completed');

  const filteredConsultations = consultations.filter(
    (c) =>
      c.status.includes(searchQuery.toLowerCase()) ||
      projects.find((p) => p.id === c.project_id)?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleScheduleConsultation = () => {
    if (!selectedProject || !consultationDate || !consultationTime) {
      toast.error('Please fill all required fields');
      return;
    }

    const project = projects.find((p) => p.id === selectedProject);
    if (!project) return;

    const consultation = {
      id: `CONS-${Date.now()}`,
      project_id: selectedProject,
      client_id: project.client_id,
      admin_id: 'ADMIN-1',
      scheduled_date: `${consultationDate} ${consultationTime}`,
      type: consultationType,
      status: 'scheduled' as const,
      agenda,
      notes: '',
      created_at: new Date().toISOString(),
    };

    addConsultation(consultation);
    toast.success('Consultation scheduled successfully!');
    
    // Reset form
    setSelectedProject('');
    setConsultationDate('');
    setConsultationTime('');
    setAgenda('');
    setIsScheduleDialogOpen(false);
  };

  const handleUpdateConsultation = () => {
    if (!selectedConsultation) return;

    updateConsultation(selectedConsultation.id, {
      scheduled_date: `${consultationDate} ${consultationTime}`,
      type: consultationType,
      agenda,
    });

    toast.success('Consultation updated successfully!');
    setIsEditDialogOpen(false);
  };

  const handleCompleteConsultation = () => {
    if (!selectedConsultation || !outcome) {
      toast.error('Please provide consultation outcome');
      return;
    }

    updateConsultation(selectedConsultation.id, {
      status: 'completed',
      notes: meetingNotes,
      outcome,
      action_items: actionItems,
      completed_at: new Date().toISOString(),
    });

    toast.success('Consultation marked as completed!');
    setIsCompleteDialogOpen(false);
    setMeetingNotes('');
    setActionItems('');
    setOutcome('');
  };

  const handleCancelConsultation = (id: string) => {
    updateConsultation(id, { status: 'cancelled' });
    toast.success('Consultation cancelled');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested':
        return 'bg-yellow-100 text-yellow-700';
      case 'scheduled':
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

  const ConsultationCard = ({ consultation }: { consultation: any }) => {
    const project = projects.find((p) => p.id === consultation.project_id);
    
    return (
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  {getTypeIcon(consultation.type)}
                </div>
                <div>
                  <h3 className="font-medium">{project?.title || 'Unknown Project'}</h3>
                  <p className="text-sm text-gray-600">with {project?.client_name}</p>
                </div>
              </div>
            </div>
            <Badge className={getStatusColor(consultation.status)}>
              {consultation.status.toUpperCase()}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-4 py-4 border-y">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Calendar className="size-4" />
                Date & Time
              </div>
              <div>{new Date(consultation.scheduled_date).toLocaleString()}</div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                {getTypeIcon(consultation.type)}
                Type
              </div>
              <div className="capitalize">{consultation.type}</div>
            </div>
          </div>

          {consultation.agenda && (
            <div>
              <Label className="text-gray-600">Agenda</Label>
              <p className="mt-1 text-gray-700">{consultation.agenda}</p>
            </div>
          )}

          {consultation.outcome && (
            <div>
              <Label className="text-gray-600">Outcome</Label>
              <p className="mt-1 text-gray-700">{consultation.outcome}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            {consultation.status === 'requested' && (
              <>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedConsultation(consultation);
                    const date = new Date(consultation.scheduled_date);
                    setConsultationDate(date.toISOString().split('T')[0]);
                    setConsultationTime(date.toTimeString().slice(0, 5));
                    setConsultationType(consultation.type || 'video');
                    setAgenda(consultation.agenda || '');
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Calendar className="size-4 mr-2" />
                  Schedule
                </Button>
              </>
            )}
            
            {consultation.status === 'scheduled' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedConsultation(consultation);
                    const date = new Date(consultation.scheduled_date);
                    setConsultationDate(date.toISOString().split('T')[0]);
                    setConsultationTime(date.toTimeString().slice(0, 5));
                    setConsultationType(consultation.type || 'video');
                    setAgenda(consultation.agenda || '');
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit className="size-4 mr-2" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedConsultation(consultation);
                    setMeetingNotes('');
                    setActionItems('');
                    setOutcome('');
                    setIsCompleteDialogOpen(true);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="size-4 mr-2" />
                  Complete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancelConsultation(consultation.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <XCircle className="size-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}

            {consultation.status === 'completed' && (
              <Link to={`/admin/projects/${consultation.project_id}/review`}>
                <Button variant="outline" size="sm">
                  <ArrowRight className="size-4 mr-2" />
                  View Project
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>
    );
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
          <Button onClick={() => setIsScheduleDialogOpen(true)}>
            <Plus className="size-4 mr-2" />
            Schedule Consultation
          </Button>
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
            <TabsTrigger value="requested">
              <Clock className="size-4 mr-2" />
              Requested ({requestedConsultations.length})
            </TabsTrigger>
            <TabsTrigger value="scheduled">
              <Calendar className="size-4 mr-2" />
              Scheduled ({scheduledConsultations.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              <CheckCircle className="size-4 mr-2" />
              Completed ({completedConsultations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredConsultations.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl mb-2">No consultations found</h3>
                <p className="text-gray-600 mb-6">
                  Start by scheduling a consultation with a client
                </p>
                <Button onClick={() => setIsScheduleDialogOpen(true)}>
                  <Plus className="size-4 mr-2" />
                  Schedule Consultation
                </Button>
              </Card>
            ) : (
              filteredConsultations.map((consultation) => (
                <ConsultationCard key={consultation.id} consultation={consultation} />
              ))
            )}
          </TabsContent>

          <TabsContent value="requested" className="space-y-4">
            {requestedConsultations.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl mb-2">All caught up!</h3>
                <p className="text-gray-600">No consultation requests pending</p>
              </Card>
            ) : (
              requestedConsultations.map((consultation) => (
                <ConsultationCard key={consultation.id} consultation={consultation} />
              ))
            )}
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            {scheduledConsultations.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl mb-2">No scheduled consultations</h3>
                <p className="text-gray-600">Schedule consultations to see them here</p>
              </Card>
            ) : (
              scheduledConsultations
                .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
                .map((consultation) => (
                  <ConsultationCard key={consultation.id} consultation={consultation} />
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
                .sort((a, b) => new Date(b.completed_at || b.scheduled_date).getTime() - 
                              new Date(a.completed_at || a.scheduled_date).getTime())
                .map((consultation) => (
                  <ConsultationCard key={consultation.id} consultation={consultation} />
                ))
            )}
          </TabsContent>
        </Tabs>

        {/* Schedule Dialog */}
        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Consultation</DialogTitle>
              <DialogDescription>
                Set up a consultation call with a client
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Project *</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title} - {project.client_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={consultationDate}
                    onChange={(e) => setConsultationDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Time *</Label>
                  <Input
                    type="time"
                    value={consultationTime}
                    onChange={(e) => setConsultationTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Type</Label>
                <Select value={consultationType} onValueChange={setConsultationType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="in-person">In Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Agenda</Label>
                <Textarea
                  placeholder="Topics to discuss..."
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleScheduleConsultation}>
                <Calendar className="size-4 mr-2" />
                Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Consultation</DialogTitle>
              <DialogDescription>
                Modify consultation details
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={consultationDate}
                    onChange={(e) => setConsultationDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Time *</Label>
                  <Input
                    type="time"
                    value={consultationTime}
                    onChange={(e) => setConsultationTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Type</Label>
                <Select value={consultationType} onValueChange={setConsultationType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="in-person">In Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Agenda</Label>
                <Textarea
                  placeholder="Topics to discuss..."
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateConsultation}>
                <CheckCircle className="size-4 mr-2" />
                Update
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
      </div>
    </DashboardLayout>
  );
}
