import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { Separator } from '../../components/ui/separator';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { 
  ArrowLeft,
  Upload,
  MessageSquare,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Send,
  ChevronRight,
  Flag
} from 'lucide-react';
import { toast } from '../../utils/toast';

export default function ProjectWorkspace() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    getProject, 
    getMilestonesByProject, 
    updateMilestone,
    createDispute,
    getUserConversations,
    sendMessage
  } = useData();

  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [disputeSubject, setDisputeSubject] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');

  if (!user || !projectId) return null;

  const project = getProject(projectId);
  const milestones = getMilestonesByProject(projectId);
  const conversations = getUserConversations(user.id);
  const projectConversation = conversations.find(c => c.project_id === projectId);

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl mb-4">Project Not Found</h2>
          <Button onClick={() => navigate('/freelancer/active-projects')}>
            Back to Projects
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleSubmitMilestone = () => {
    if (!selectedMilestone || !submissionNotes) {
      toast.error('Please provide submission notes');
      return;
    }

    updateMilestone(selectedMilestone, {
      status: 'submitted',
      submission_date: new Date().toISOString(),
      submission_notes: submissionNotes
    });

    toast.success('Milestone submitted for review!');
    setShowSubmitDialog(false);
    setSubmissionNotes('');
    setSelectedMilestone(null);
  };

  const handleRaiseDispute = () => {
    if (!disputeSubject || !disputeDescription) {
      toast.error('Please fill in all fields');
      return;
    }

    createDispute({
      project_id: projectId,
      raised_by: user.id,
      raised_by_name: user.name,
      raised_by_role: user.role,
      subject: disputeSubject,
      description: disputeDescription,
      status: 'open',
      priority: 'medium'
    });

    toast.success('Dispute raised successfully. Admin will review shortly.');
    setShowDisputeDialog(false);
    setDisputeSubject('');
    setDisputeDescription('');
  };

  const progress = milestones.length > 0
    ? (milestones.filter(m => m.status === 'approved' || m.status === 'paid').length / milestones.length) * 100
    : 0;

  const completedMilestones = milestones.filter(m => m.status === 'approved' || m.status === 'paid');
  const currentMilestone = milestones.find(m => m.status === 'in_progress');
  const nextMilestone = milestones.find(m => m.status === 'pending');

  const earnedAmount = completedMilestones.reduce((sum, m) => sum + m.amount, 0);
  const totalAmount = project.freelancer_budget || 0;

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'approved':
        return 'bg-green-500';
      case 'submitted':
        return 'bg-blue-500';
      case 'in_progress':
        return 'bg-purple-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/freelancer/active-projects')}>
            <ArrowLeft className="size-4 mr-2" />
          </Button>
          <Button variant="outline" onClick={() => setShowDisputeDialog(true)}>
            <Flag className="size-4 mr-2" />
            Raise Dispute
          </Button>
        </div>

        {/* Project Header */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl mb-2">{project.title}</h1>
              <p className="text-gray-600">Client: {project.client_name}</p>
            </div>
            <Badge className="bg-purple-500">In Progress</Badge>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Overall Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
              <span>{completedMilestones.length} of {milestones.length} milestones completed</span>
              <span>₹{earnedAmount.toLocaleString()} of ₹{totalAmount.toLocaleString()} earned</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <DollarSign className="size-6 mx-auto mb-2 text-green-600" />
              <div className="text-sm text-gray-600">Earned</div>
              <div className="text-xl">₹{earnedAmount.toLocaleString()}</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Clock className="size-6 mx-auto mb-2 text-orange-600" />
              <div className="text-sm text-gray-600">Remaining</div>
              <div className="text-xl">₹{(totalAmount - earnedAmount).toLocaleString()}</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Calendar className="size-6 mx-auto mb-2 text-blue-600" />
              <div className="text-sm text-gray-600">Due Date</div>
              <div className="text-sm">{project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <MessageSquare className="size-6 mx-auto mb-2 text-purple-600" />
              <div className="text-sm text-gray-600">Messages</div>
              <div className="text-xl">{projectConversation?.unread_count || 0}</div>
            </div>
          </div>
        </Card>

        {/* Current Focus */}
        {currentMilestone && (
          <Alert className="border-blue-200 bg-blue-50">
            <Clock className="size-5 text-blue-600" />
            <AlertDescription className="ml-2">
              <strong>Current Focus:</strong> {currentMilestone.title} - Due {new Date(currentMilestone.due_date).toLocaleDateString()}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs defaultValue="milestones" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="details">Project Details</TabsTrigger>
          </TabsList>

          <TabsContent value="milestones" className="space-y-4 mt-6">
            {milestones.map((milestone, index) => (
              <Card key={milestone.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full ${getMilestoneStatusColor(milestone.status)} text-white flex items-center justify-center font-medium`}>
                        {index + 1}
                      </div>
                      {index < milestones.length - 1 && (
                        <div className="w-0.5 h-16 bg-gray-200 mt-2" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl">{milestone.title}</h3>
                        <Badge className={getMilestoneStatusColor(milestone.status)}>
                          {milestone.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{milestone.description}</p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="size-4" />
                          <span>₹{milestone.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4" />
                          <span>Due: {new Date(milestone.due_date).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {milestone.submission_notes && (
                        <div className="p-4 bg-blue-50 rounded-lg mb-4">
                          <div className="text-sm font-medium mb-2">Submission Notes:</div>
                          <p className="text-sm text-gray-700">{milestone.submission_notes}</p>
                          {milestone.submission_date && (
                            <div className="text-xs text-gray-600 mt-2">
                              Submitted on {new Date(milestone.submission_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      )}

                      {milestone.status === 'in_progress' && (
                        <Button onClick={() => {
                          setSelectedMilestone(milestone.id);
                          setShowSubmitDialog(true);
                        }}>
                          <Upload className="size-4 mr-2" />
                          Submit Milestone
                        </Button>
                      )}

                      {milestone.status === 'approved' && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="size-5" />
                          <span className="font-medium">Approved & Paid</span>
                        </div>
                      )}

                      {milestone.status === 'rejected' && (
                        <div className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="size-5" />
                          <span className="font-medium">Rejected - Needs Revision</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {milestones.length === 0 && (
              <Card className="p-12 text-center">
                <FileText className="size-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl mb-2">No Milestones Yet</h3>
                <p className="text-gray-600">Milestones will be created by the admin</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="deliverables" className="space-y-4 mt-6">
            <Card className="p-6">
              <h3 className="text-xl mb-4">Project Deliverables</h3>
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Source Code Repository</h4>
                    <Badge>Required</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Complete source code with proper documentation and comments
                  </p>
                </div>
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Technical Documentation</h4>
                    <Badge>Required</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    API documentation, setup instructions, and architecture overview
                  </p>
                </div>
                <div className="p-4 border-l-4 border-green-500 bg-green-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Testing Suite</h4>
                    <Badge variant="secondary">Optional</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Unit tests and integration tests for critical features
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl mb-4">Upload Files</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <Upload className="size-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg mb-2">Drop files here or click to upload</p>
                <p className="text-sm text-gray-600">
                  Support for all file types, max 100MB per file
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="communication" className="space-y-4 mt-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl">Project Communication</h3>
                <Button>
                  <MessageSquare className="size-4 mr-2" />
                  Open Messages
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-medium">
                        {project.client_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{project.client_name}</div>
                        <div className="text-sm text-gray-600">Client</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">2h ago</div>
                  </div>
                  <p className="text-sm ml-13">
                    Please make sure to include the responsive design in the next milestone.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
                        You
                      </div>
                      <div>
                        <div className="font-medium">You</div>
                        <div className="text-sm text-gray-600">Freelancer</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">1h ago</div>
                  </div>
                  <p className="text-sm ml-13">
                    Absolutely! I'll ensure all components are fully responsive across all device sizes.
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-3">
                <Label>Send a Message</Label>
                <Textarea 
                  placeholder="Type your message..."
                  rows={4}
                />
                <Button className="w-full">
                  <Send className="size-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 mt-6">
            <Card className="p-6">
              <h3 className="text-xl mb-4">Project Description</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl mb-4">Project Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Category</div>
                  <div className="font-medium">{project.category}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Complexity</div>
                  <div className="font-medium capitalize">{project.complexity}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Start Date</div>
                  <div className="font-medium">
                    {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">End Date</div>
                  <div className="font-medium">
                    {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl mb-4">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {project.skills_required.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Milestone Dialog */}
        <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Milestone</DialogTitle>
              <DialogDescription>
                Provide details about your milestone completion
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Submission Notes</Label>
                <Textarea
                  placeholder="Describe what you've completed, any challenges faced, and additional notes..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  rows={6}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitMilestone}>
                <Upload className="size-4 mr-2" />
                Submit for Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dispute Dialog */}
        <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Raise Dispute</DialogTitle>
              <DialogDescription>
                Describe the issue you're facing with this project
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Subject</Label>
                <Input
                  placeholder="Brief description of the issue"
                  value={disputeSubject}
                  onChange={(e) => setDisputeSubject(e.target.value)}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Provide detailed information about the dispute..."
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  rows={6}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDisputeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleRaiseDispute} variant="destructive">
                <Flag className="size-4 mr-2" />
                Raise Dispute
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
