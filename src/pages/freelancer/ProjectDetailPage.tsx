import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Progress } from '../../components/ui/progress';
import { Separator } from '../../components/ui/separator';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Clock, 
  Send, 
  Building2, 
  Briefcase, 
  Target,
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';
import { toast } from '../../utils/toast';

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getProject, getBidsByProject, getBidsByFreelancer, createBid, getMilestonesByProject } = useData();
  
  const [showBidDialog, setShowBidDialog] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidDuration, setBidDuration] = useState('');
  const [bidProposal, setBidProposal] = useState('');
  const [deliverables, setDeliverables] = useState('');

  if (!user || !projectId) return null;

  const project = getProject(projectId);
  const projectBids = getBidsByProject(projectId);
  const myBids = getBidsByFreelancer(user.id);
  const myBid = myBids.find(b => b.project_id === projectId);
  const milestones = getMilestonesByProject(projectId);

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl mb-4">Project Not Found</h2>
          <Button onClick={() => navigate('/freelancer/projects')}>
            Browse Projects
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleSubmitBid = () => {
    if (!bidAmount || !bidDuration || !bidProposal) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid bid amount');
      return;
    }

    createBid({
      project_id: projectId,
      freelancer_id: user.id,
      freelancer_name: user.name,
      freelancer_rating: 4.5,
      amount,
      duration_weeks: parseInt(bidDuration),
      proposal: bidProposal,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    });

    toast.success('Bid submitted successfully!');
    setShowBidDialog(false);
    setBidAmount('');
    setBidDuration('');
    setBidProposal('');
    setDeliverables('');
  };

  const statusColors: Record<string, string> = {
    'in_bidding': 'bg-blue-500',
    'assigned': 'bg-green-500',
    'in_progress': 'bg-purple-500',
    'completed': 'bg-gray-500',
  };

  const complexityIcons = {
    simple: '⚡',
    moderate: '⚙️',
    complex: '🔥'
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4 mr-2" />
          </Button>
          {project.status === 'in_bidding' && !myBid && (
            <Button onClick={() => setShowBidDialog(true)} size="lg">
              <Send className="size-5 mr-2" />
              Submit Proposal
            </Button>
          )}
          {myBid && (
            <Badge variant="default" className="text-base px-4 py-2">
              You've submitted a proposal
            </Badge>
          )}
        </div>

        {/* Project Header */}
        <Card className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl">{project.title}</h1>
                <Badge className={statusColors[project.status]}>
                  {project.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <Building2 className="size-4" />
                  <span>{project.client_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  <span>Posted {new Date(project.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="size-4" />
                  <span>{projectBids.length} proposals</span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Key Details */}
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <DollarSign className="size-8 mx-auto mb-2 text-green-600" />
              <div className="text-sm text-gray-600">Budget</div>
              <div className="text-2xl">₹{project.client_budget.toLocaleString()}</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="size-8 mx-auto mb-2 text-blue-600" />
              <div className="text-sm text-gray-600">Duration</div>
              <div className="text-2xl">{project.duration_weeks} weeks</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Target className="size-8 mx-auto mb-2 text-purple-600" />
              <div className="text-sm text-gray-600">Complexity</div>
              <div className="text-2xl">
                {complexityIcons[project.complexity]} {project.complexity}
              </div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <TrendingUp className="size-8 mx-auto mb-2 text-orange-600" />
              <div className="text-sm text-gray-600">Priority</div>
              <div className="text-2xl">{project.priority}</div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Project Details</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="proposals">Proposals ({projectBids.length})</TabsTrigger>
            <TabsTrigger value="client">About Client</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl mb-4">Project Description</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
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

            <Card className="p-6">
              <h3 className="text-xl mb-4">Category</h3>
              <div className="flex items-center gap-2">
                <Briefcase className="size-5 text-gray-600" />
                <span className="text-lg">{project.category}</span>
              </div>
            </Card>

            {myBid && (
              <Card className="p-6 bg-blue-50 border-blue-200">
                <h3 className="text-xl mb-4">Your Proposal</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-600">Your Bid Amount</div>
                    <div className="text-2xl">₹{myBid.amount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Proposed Duration</div>
                    <div className="text-2xl">{myBid.duration_weeks} weeks</div>
                  </div>
                </div>
                <Separator className="my-4" />
                <div>
                  <div className="text-sm text-gray-600 mb-2">Proposal</div>
                  <p className="text-gray-700 whitespace-pre-line">{myBid.proposal}</p>
                </div>
                <div className="mt-4">
                  <Badge variant={
                    myBid.status === 'accepted' ? 'default' :
                    myBid.status === 'shortlisted' ? 'secondary' :
                    myBid.status === 'rejected' ? 'destructive' : 'outline'
                  }>
                    {myBid.status.toUpperCase()}
                  </Badge>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="milestones" className="space-y-4">
            {milestones.length > 0 ? (
              <>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl">Payment Milestones</h3>
                    <div className="text-sm text-gray-600">
                      {milestones.filter(m => m.status === 'approved' || m.status === 'paid').length} of {milestones.length} completed
                    </div>
                  </div>
                  <Progress 
                    value={(milestones.filter(m => m.status === 'approved' || m.status === 'paid').length / milestones.length) * 100} 
                    className="mb-6"
                  />
                </Card>
                
                {milestones.map((milestone, index) => (
                  <Card key={milestone.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                            {index + 1}
                          </div>
                          <h4 className="text-lg">{milestone.title}</h4>
                          <Badge variant={
                            milestone.status === 'paid' || milestone.status === 'approved' ? 'default' :
                            milestone.status === 'submitted' ? 'secondary' :
                            milestone.status === 'in_progress' ? 'outline' : 'secondary'
                          }>
                            {milestone.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3 ml-11">{milestone.description}</p>
                        <div className="flex items-center gap-6 ml-11 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <DollarSign className="size-4" />
                            <span>₹{milestone.amount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="size-4" />
                            <span>Due: {new Date(milestone.due_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      {(milestone.status === 'paid' || milestone.status === 'approved') && (
                        <CheckCircle className="size-6 text-green-600" />
                      )}
                    </div>
                  </Card>
                ))}
              </>
            ) : (
              <Card className="p-12 text-center">
                <AlertCircle className="size-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl mb-2">No Milestones Yet</h3>
                <p className="text-gray-600">Milestones will be created after project assignment</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="proposals" className="space-y-4">
            {projectBids.length > 0 ? (
              <>
                <div className="text-sm text-gray-600 mb-4">
                  {projectBids.length} freelancer{projectBids.length !== 1 ? 's' : ''} submitted proposals
                </div>
                {projectBids.map((bid) => (
                  <Card key={bid.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {bid.freelancer_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg">{bid.freelancer_name}</h4>
                            <div className="flex items-center gap-1">
                              <Star className="size-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{bid.freelancer_rating}</span>
                            </div>
                            <Badge variant={
                              bid.status === 'accepted' ? 'default' :
                              bid.status === 'shortlisted' ? 'secondary' : 'outline'
                            }>
                              {bid.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <div className="text-sm text-gray-600">Bid Amount</div>
                              <div className="text-xl">₹{bid.amount.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Duration</div>
                              <div className="text-xl">{bid.duration_weeks} weeks</div>
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm line-clamp-2">{bid.proposal}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            ) : (
              <Card className="p-12 text-center">
                <Users className="size-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl mb-2">No Proposals Yet</h3>
                <p className="text-gray-600">Be the first to submit a proposal!</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="client" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-purple-100 text-purple-600 text-2xl">
                    {project.client_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl">{project.client_name}</h3>
                  <p className="text-gray-600">Client</p>
                </div>
              </div>
              
              <Separator className="my-6" />

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Projects Posted</div>
                  <div className="text-2xl">12</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Spent</div>
                  <div className="text-2xl">₹8.5L</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Member Since</div>
                  <div className="text-xl">2023</div>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h4 className="mb-3">Recent Projects</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm">E-commerce Platform Development</span>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm">Mobile App UI/UX Design</span>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bid Dialog */}
        <Dialog open={showBidDialog} onOpenChange={setShowBidDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submit Proposal</DialogTitle>
              <DialogDescription>
                Submit your proposal for "{project.title}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bidAmount">Bid Amount (₹)</Label>
                  <Input
                    id="bidAmount"
                    type="number"
                    placeholder="Enter your bid amount"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Client budget: ₹{project.client_budget.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label htmlFor="bidDuration">Duration (weeks)</Label>
                  <Input
                    id="bidDuration"
                    type="number"
                    placeholder="Estimated duration"
                    value={bidDuration}
                    onChange={(e) => setBidDuration(e.target.value)}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Expected: {project.duration_weeks} weeks
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="bidProposal">Cover Letter / Proposal</Label>
                <Textarea
                  id="bidProposal"
                  placeholder="Describe your approach, relevant experience, and why you're the best fit for this project..."
                  value={bidProposal}
                  onChange={(e) => setBidProposal(e.target.value)}
                  rows={8}
                />
              </div>
              <div>
                <Label htmlFor="deliverables">Key Deliverables (Optional)</Label>
                <Textarea
                  id="deliverables"
                  placeholder="List the key deliverables you'll provide..."
                  value={deliverables}
                  onChange={(e) => setDeliverables(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBidDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitBid}>
                <Send className="size-4 mr-2" />
                Submit Proposal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
