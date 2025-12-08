import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  ArrowLeft,
  CheckCircle,
  XCircle,
  Edit,
  DollarSign,
  Clock,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  AlertCircle,
  TrendingUp,
  Users,
  MessageSquare,
  Send,
  Calculator,
  Target,
  Briefcase,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function ProjectReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, updateProject, addConsultation } = useData();
  
  const project = projects.find(p => p.id === id);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConsultationDialogOpen, setIsConsultationDialogOpen] = useState(false);
  const [isMarginDialogOpen, setIsMarginDialogOpen] = useState(false);

  // Form states
  const [editedTitle, setEditedTitle] = useState(project?.title || '');
  const [editedDescription, setEditedDescription] = useState(project?.description || '');
  const [editedBudget, setEditedBudget] = useState(project?.client_budget.toString() || '');
  const [editedTimeline, setEditedTimeline] = useState(project?.timeline || '');
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState(project?.admin_notes || '');
  
  // Margin calculation
  const [marginPercentage, setMarginPercentage] = useState('15');
  const [freelancerBudget, setFreelancerBudget] = useState('');
  const [marginAmount, setMarginAmount] = useState('0');

  // Consultation form
  const [consultationDate, setConsultationDate] = useState('');
  const [consultationTime, setConsultationTime] = useState('');
  const [consultationNotes, setConsultationNotes] = useState('');

  if (!project) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="size-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl mb-2">Project Not Found</h2>
            <Button onClick={() => navigate('/admin/projects')}>
              Back to Projects
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const calculateMargin = (clientBudget: number, percentage: number) => {
    const margin = (clientBudget * percentage) / 100;
    const freelancerAmount = clientBudget - margin;
    setMarginAmount(margin.toFixed(2));
    setFreelancerBudget(freelancerAmount.toFixed(2));
  };

  const handleMarginChange = (value: string) => {
    setMarginPercentage(value);
    calculateMargin(project.client_budget, parseFloat(value));
  };

  const handleApproveProject = () => {
    updateProject(project.id, {
      status: 'in_bidding',
      admin_approved: true,
      admin_notes: adminNotes,
    });
    toast.success('Project approved and moved to bidding!');
    setIsApproveDialogOpen(false);
    navigate('/admin/projects');
  };

  const handleRejectProject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    updateProject(project.id, {
      status: 'cancelled',
      rejection_reason: rejectionReason,
      admin_notes: adminNotes,
    });
    toast.success('Project rejected');
    setIsRejectDialogOpen(false);
    navigate('/admin/projects');
  };

  const handleEditProject = () => {
    if (!editedTitle.trim() || !editedDescription.trim() || !editedBudget) {
      toast.error('Please fill all required fields');
      return;
    }

    updateProject(project.id, {
      title: editedTitle,
      description: editedDescription,
      client_budget: parseFloat(editedBudget),
      timeline: editedTimeline,
      admin_notes: adminNotes,
    });
    
    toast.success('Project updated successfully');
    setIsEditDialogOpen(false);
  };

  const handleScheduleConsultation = () => {
    if (!consultationDate || !consultationTime) {
      toast.error('Please select date and time');
      return;
    }

    const consultation = {
      id: `CONS-${Date.now()}`,
      project_id: project.id,
      client_id: project.client_id,
      admin_id: 'ADMIN-1',
      scheduled_date: `${consultationDate} ${consultationTime}`,
      status: 'scheduled' as const,
      notes: consultationNotes,
      created_at: new Date().toISOString(),
    };

    addConsultation(consultation);
    toast.success('Consultation scheduled successfully!');
    setIsConsultationDialogOpen(false);
    setConsultationDate('');
    setConsultationTime('');
    setConsultationNotes('');
  };

  const handleSetMargin = () => {
    if (!freelancerBudget || !marginAmount) {
      toast.error('Please calculate the margin first');
      return;
    }

    updateProject(project.id, {
      freelancer_budget: parseFloat(freelancerBudget),
      margin: parseFloat(marginAmount),
      margin_percentage: parseFloat(marginPercentage),
    });

    toast.success('Margin set successfully!');
    setIsMarginDialogOpen(false);
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    pending_review: 'bg-yellow-100 text-yellow-700',
    in_bidding: 'bg-blue-100 text-blue-700',
    assigned: 'bg-purple-100 text-purple-700',
    in_progress: 'bg-green-100 text-green-700',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-700',
    disputed: 'bg-orange-100 text-orange-700',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin/projects')}>
              <ArrowLeft className="size-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl">Project Review</h1>
              <p className="text-gray-600">Review and manage project details</p>
            </div>
          </div>
          <Badge className={statusColors[project.status]}>
            {project.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        {/* Action Buttons */}
        {project.status === 'pending_review' && (
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-5 text-yellow-600" />
                <span className="font-medium">This project requires your review</span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsRejectDialogOpen(true)}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="size-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => setIsApproveDialogOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="size-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList>
                <TabsTrigger value="details">
                  <FileText className="size-4 mr-2" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="client">
                  <User className="size-4 mr-2" />
                  Client Info
                </TabsTrigger>
                <TabsTrigger value="financials">
                  <DollarSign className="size-4 mr-2" />
                  Financials
                </TabsTrigger>
                <TabsTrigger value="timeline">
                  <Clock className="size-4 mr-2" />
                  Timeline
                </TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl">{project.title}</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditedTitle(project.title);
                        setEditedDescription(project.description);
                        setEditedBudget(project.client_budget.toString());
                        setEditedTimeline(project.timeline);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="size-4 mr-2" />
                      Edit
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-600">Description</Label>
                      <p className="mt-2 text-gray-900">{project.description}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <Label className="text-gray-600">Category</Label>
                        <p className="mt-1">{project.category}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Priority</Label>
                        <p className="mt-1 capitalize">{project.priority || 'Normal'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Timeline</Label>
                        <p className="mt-1">{project.timeline}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Created</Label>
                        <p className="mt-1">
                          {new Date(project.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {project.requirements && project.requirements.length > 0 && (
                      <div className="pt-4 border-t">
                        <Label className="text-gray-600">Requirements</Label>
                        <ul className="mt-2 space-y-2">
                          {project.requirements.map((req, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {project.skills && project.skills.length > 0 && (
                      <div className="pt-4 border-t">
                        <Label className="text-gray-600">Required Skills</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {project.skills.map((skill, idx) => (
                            <Badge key={idx} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Admin Notes */}
                <Card className="p-6">
                  <h3 className="font-medium mb-4">Admin Notes</h3>
                  <Textarea
                    placeholder="Add internal notes about this project..."
                    rows={4}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                  <Button
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      updateProject(project.id, { admin_notes: adminNotes });
                      toast.success('Notes saved');
                    }}
                  >
                    Save Notes
                  </Button>
                </Card>
              </TabsContent>

              {/* Client Info Tab */}
              <TabsContent value="client" className="space-y-4">
                <Card className="p-6">
                  <h3 className="font-medium mb-4">Client Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <User className="size-5 text-blue-600" />
                      </div>
                      <div>
                        <Label className="text-gray-600">Name</Label>
                        <p>{project.client_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-3 rounded-full">
                        <Mail className="size-5 text-green-600" />
                      </div>
                      <div>
                        <Label className="text-gray-600">Email</Label>
                        <p>client@example.com</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 p-3 rounded-full">
                        <Phone className="size-5 text-purple-600" />
                      </div>
                      <div>
                        <Label className="text-gray-600">Phone</Label>
                        <p>+91 98765 43210</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button
                        className="w-full"
                        onClick={() => setIsConsultationDialogOpen(true)}
                      >
                        <Calendar className="size-4 mr-2" />
                        Schedule Consultation
                      </Button>
                    </div>

                    <div>
                      <Button variant="outline" className="w-full">
                        <MessageSquare className="size-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Financials Tab */}
              <TabsContent value="financials" className="space-y-4">
                <Card className="p-6">
                  <h3 className="font-medium mb-4">Budget & Margin</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <Label className="text-gray-600">Client Budget</Label>
                      <p className="text-2xl mt-1">
                        ₹{project.client_budget.toLocaleString()}
                      </p>
                    </div>

                    {project.freelancer_budget && (
                      <>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <Label className="text-gray-600">Freelancer Budget</Label>
                          <p className="text-2xl mt-1">
                            ₹{project.freelancer_budget.toLocaleString()}
                          </p>
                        </div>

                        <div className="p-4 bg-purple-50 rounded-lg">
                          <Label className="text-gray-600">Platform Margin</Label>
                          <p className="text-2xl mt-1">
                            ₹{(project.margin || 0).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {project.margin_percentage}% margin
                          </p>
                        </div>
                      </>
                    )}

                    <Button
                      className="w-full"
                      onClick={() => {
                        calculateMargin(project.client_budget, parseFloat(marginPercentage));
                        setIsMarginDialogOpen(true);
                      }}
                    >
                      <Calculator className="size-4 mr-2" />
                      {project.freelancer_budget ? 'Update Margin' : 'Set Margin'}
                    </Button>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-medium mb-4">Payment Terms</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Type</span>
                      <span className="font-medium capitalize">{project.payment_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Milestones</span>
                      <span className="font-medium">
                        {project.milestones?.length || 0} planned
                      </span>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="space-y-4">
                <Card className="p-6">
                  <h3 className="font-medium mb-4">Project Timeline</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-gray-100 p-2 rounded-full mt-1">
                        <Clock className="size-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Project Created</p>
                        <p className="text-sm text-gray-600">
                          {new Date(project.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {project.status !== 'draft' && project.status !== 'pending_review' && (
                      <div className="flex items-start gap-3">
                        <div className="bg-green-100 p-2 rounded-full mt-1">
                          <CheckCircle className="size-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Admin Approved</p>
                          <p className="text-sm text-gray-600">
                            Project moved to bidding phase
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t">
                      <Label className="text-gray-600">Estimated Duration</Label>
                      <p className="mt-1">{project.timeline}</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-medium mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setIsConsultationDialogOpen(true)}
                >
                  <Calendar className="size-4 mr-2" />
                  Schedule Call
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setEditedTitle(project.title);
                    setEditedDescription(project.description);
                    setEditedBudget(project.client_budget.toString());
                    setEditedTimeline(project.timeline);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit className="size-4 mr-2" />
                  Edit Details
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate(`/admin/projects/${project.id}/bids`)}
                >
                  <Users className="size-4 mr-2" />
                  View Bids
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    calculateMargin(project.client_budget, parseFloat(marginPercentage));
                    setIsMarginDialogOpen(true);
                  }}
                >
                  <TrendingUp className="size-4 mr-2" />
                  Set Margin
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-medium mb-4">Project Stats</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-gray-600">Total Bids</Label>
                  <p className="text-2xl mt-1">0</p>
                </div>
                <div>
                  <Label className="text-gray-600">Avg Bid Amount</Label>
                  <p className="text-2xl mt-1">₹0</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Approve Dialog */}
        <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Project</DialogTitle>
              <DialogDescription>
                This will move the project to the bidding phase where freelancers can submit proposals.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Admin Notes (Optional)</Label>
                <Textarea
                  placeholder="Add any notes about the approval..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApproveProject} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="size-4 mr-2" />
                Approve Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Project</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this project.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Rejection Reason *</Label>
                <Textarea
                  placeholder="Explain why this project is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleRejectProject}
                className="bg-red-600 hover:bg-red-700"
              >
                <XCircle className="size-4 mr-2" />
                Reject Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Project Details</DialogTitle>
              <DialogDescription>
                Update project information before approval
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Project Title *</Label>
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Enter project title"
                />
              </div>
              <div>
                <Label>Description *</Label>
                <Textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Describe the project..."
                  rows={5}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Budget (₹) *</Label>
                  <Input
                    type="number"
                    value={editedBudget}
                    onChange={(e) => setEditedBudget(e.target.value)}
                    placeholder="Enter budget"
                  />
                </div>
                <div>
                  <Label>Timeline *</Label>
                  <Input
                    value={editedTimeline}
                    onChange={(e) => setEditedTimeline(e.target.value)}
                    placeholder="e.g., 2-3 months"
                  />
                </div>
              </div>
              <div>
                <Label>Admin Notes</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditProject}>
                <CheckCircle className="size-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Consultation Dialog */}
        <Dialog open={isConsultationDialogOpen} onOpenChange={setIsConsultationDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Consultation</DialogTitle>
              <DialogDescription>
                Set up a consultation call with the client
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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
              <div>
                <Label>Notes</Label>
                <Textarea
                  placeholder="Agenda or topics to discuss..."
                  value={consultationNotes}
                  onChange={(e) => setConsultationNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConsultationDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleScheduleConsultation}>
                <Calendar className="size-4 mr-2" />
                Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Margin Dialog */}
        <Dialog open={isMarginDialogOpen} onOpenChange={setIsMarginDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Project Margin</DialogTitle>
              <DialogDescription>
                Configure the platform margin for this project
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Margin Percentage</Label>
                <Select value={marginPercentage} onValueChange={handleMarginChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10%</SelectItem>
                    <SelectItem value="15">15%</SelectItem>
                    <SelectItem value="20">20%</SelectItem>
                    <SelectItem value="25">25%</SelectItem>
                    <SelectItem value="30">30%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Client Budget</span>
                  <span className="font-medium">₹{project.client_budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform Margin ({marginPercentage}%)</span>
                  <span className="font-medium text-purple-600">
                    ₹{parseFloat(marginAmount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="font-medium">Freelancer Budget</span>
                  <span className="font-medium text-green-600">
                    ₹{parseFloat(freelancerBudget || '0').toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMarginDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSetMargin}>
                <Target className="size-4 mr-2" />
                Set Margin
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
