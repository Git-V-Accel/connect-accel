import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { useData } from '../../contexts/DataContext';
import {
  ArrowLeft,
  Star,
  CheckCircle,
  XCircle,
  MessageSquare,
  DollarSign,
  Clock,
  User,
  Briefcase,
  Award,
  TrendingUp,
  Eye,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { toast } from '../../utils/toast';

export default function BiddingManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, bids, updateBid, updateProject } = useData();
  
  const project = projects.find((p) => p.id === id);
  const projectBids = bids.filter((b) => b.project_id === id);

  const [selectedBid, setSelectedBid] = useState<any>(null);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  if (!project) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl mb-4">Project Not Found</h2>
            <Button onClick={() => navigate('/admin/projects')}>
              Back to Projects
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleAcceptBid = () => {
    if (!selectedBid) return;

    // Update bid status
    updateBid(selectedBid.id, {
      status: 'accepted',
      admin_notes: adminNotes,
    });

    // Reject all other bids
    projectBids
      .filter((b) => b.id !== selectedBid.id)
      .forEach((b) => {
        updateBid(b.id, {
          status: 'rejected',
          admin_notes: 'Another freelancer was selected',
        });
      });

    // Update project status
    updateProject(project.id, {
      status: 'assigned',
      freelancer_id: selectedBid.freelancer_id,
      freelancer_name: selectedBid.freelancer_name,
    });

    toast.success('Bid accepted and freelancer assigned!');
    setIsAcceptDialogOpen(false);
    navigate('/admin/projects');
  };

  const handleRejectBid = () => {
    if (!selectedBid || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    updateBid(selectedBid.id, {
      status: 'rejected',
      admin_notes: adminNotes || rejectionReason || 'Bid rejected by admin',
    });

    toast.success('Bid rejected');
    setIsRejectDialogOpen(false);
    setSelectedBid(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'shortlisted':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const BidCard = ({ bid }: { bid: any }) => {
    // Mock freelancer data
    const freelancer = {
      name: 'John Doe',
      rating: 4.8,
      completedProjects: 45,
      skills: ['React', 'Node.js', 'MongoDB', 'AWS'],
      hourlyRate: 1200,
      responseTime: '2 hours',
      successRate: 98,
    };

    return (
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="space-y-4">
          {/* Freelancer Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 size-12 rounded-full flex items-center justify-center">
                <User className="size-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">{freelancer.name}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Star className="size-4 text-yellow-500 fill-yellow-500" />
                    {freelancer.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="size-4" />
                    {freelancer.completedProjects} projects
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="size-4" />
                    {freelancer.successRate}% success
                  </span>
                </div>
              </div>
            </div>
            <Badge className={getStatusColor(bid.status)}>
              {bid.status.toUpperCase()}
            </Badge>
          </div>

          {/* Bid Details */}
          <div className="grid grid-cols-3 gap-4 py-4 border-y">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <DollarSign className="size-4" />
                Bid Amount
              </div>
              <div className="text-xl">₹{bid.amount.toLocaleString()}</div>
              <div className="text-sm text-gray-600">
                {((bid.amount / project.client_budget) * 100).toFixed(0)}% of client budget
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Clock className="size-4" />
                Delivery
              </div>
              <div className="text-xl">{bid.delivery_time}</div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <TrendingUp className="size-4" />
                Platform Margin
              </div>
              <div className="text-xl text-purple-600">
                ₹{(project.client_budget - bid.amount).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                {(((project.client_budget - bid.amount) / project.client_budget) * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Proposal Preview */}
          <div>
            <Label className="text-gray-600">Proposal</Label>
            <p className="mt-2 text-gray-700 line-clamp-3">{bid.proposal}</p>
          </div>

          {/* Skills */}
          <div>
            <Label className="text-gray-600">Skills</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {freelancer.skills.map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin/bids/${bid.id}/proposal`)}
            >
              <Eye className="size-4 mr-2" />
              View Full Proposal
            </Button>
            
            {bid.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedBid(bid);
                    setRejectionReason('');
                    setAdminNotes('');
                    setIsRejectDialogOpen(true);
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <ThumbsDown className="size-4 mr-2" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedBid(bid);
                    setAdminNotes('');
                    setIsAcceptDialogOpen(true);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <ThumbsUp className="size-4 mr-2" />
                  Accept & Assign
                </Button>
              </>
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin/projects')}>
              <ArrowLeft className="size-4 mr-2" />
            </Button>
            <div>
              <h1 className="text-3xl">Bidding Management</h1>
              <p className="text-gray-600">Review and select the best freelancer</p>
            </div>
          </div>
        </div>

        {/* Project Info */}
        <Card className="p-6">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <h2 className="text-xl mb-2">{project.title}</h2>
              <p className="text-gray-600 line-clamp-2">{project.description}</p>
            </div>
            <div>
              <Label className="text-gray-600">Client Budget</Label>
              <p className="text-2xl mt-1">₹{project.client_budget.toLocaleString()}</p>
            </div>
            <div>
              <Label className="text-gray-600">Total Bids</Label>
              <p className="text-2xl mt-1">{projectBids.length}</p>
            </div>
          </div>
        </Card>

        {/* Bid Statistics */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Pending Bids</div>
            <div className="text-2xl mt-1">
              {projectBids.filter((b) => b.status === 'pending').length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Average Bid</div>
            <div className="text-2xl mt-1">
              ₹
              {projectBids.length > 0
                ? Math.round(
                    projectBids.reduce((sum, b) => sum + b.amount, 0) / projectBids.length
                  ).toLocaleString()
                : 0}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Lowest Bid</div>
            <div className="text-2xl mt-1">
              ₹
              {projectBids.length > 0
                ? Math.min(...projectBids.map((b) => b.amount)).toLocaleString()
                : 0}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Highest Margin</div>
            <div className="text-2xl mt-1 text-purple-600">
              ₹
              {projectBids.length > 0
                ? Math.max(
                    ...projectBids.map((b) => project.client_budget - b.amount)
                  ).toLocaleString()
                : 0}
            </div>
          </Card>
        </div>

        {/* Bids List */}
        <div>
          <h3 className="text-xl mb-4">
            All Bids ({projectBids.length})
          </h3>
          <div className="space-y-4">
            {projectBids.length === 0 ? (
              <Card className="p-12 text-center">
                <MessageSquare className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl mb-2">No bids yet</h3>
                <p className="text-gray-600">
                  Freelancers haven't submitted any proposals yet
                </p>
              </Card>
            ) : (
              projectBids
                .sort((a, b) => {
                  // Sort pending first, then by amount
                  if (a.status === 'pending' && b.status !== 'pending') return -1;
                  if (a.status !== 'pending' && b.status === 'pending') return 1;
                  return a.amount - b.amount;
                })
                .map((bid) => <BidCard key={bid.id} bid={bid} />)
            )}
          </div>
        </div>

        {/* Accept Dialog */}
        <Dialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Accept Bid & Assign Freelancer</DialogTitle>
              <DialogDescription>
                This will assign the freelancer to the project and reject all other bids.
              </DialogDescription>
            </DialogHeader>
            
            {selectedBid && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Client Budget</span>
                    <span className="font-medium">
                      ₹{project.client_budget.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Freelancer Bid</span>
                    <span className="font-medium">₹{selectedBid.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-medium">Platform Margin</span>
                    <span className="font-medium text-purple-600">
                      ₹{(project.client_budget - selectedBid.amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Margin Percentage</span>
                    <span>
                      {(
                        ((project.client_budget - selectedBid.amount) / project.client_budget) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <Label>Admin Notes (Optional)</Label>
                  <Textarea
                    placeholder="Add notes about why this bid was selected..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAcceptDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAcceptBid} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="size-4 mr-2" />
                Accept & Assign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Bid</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this bid.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Rejection Reason *</Label>
                <Textarea
                  placeholder="Explain why this bid is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                />
              </div>
              <div>
                <Label>Admin Notes (Optional)</Label>
                <Textarea
                  placeholder="Internal notes..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRejectBid} className="bg-red-600 hover:bg-red-700">
                <XCircle className="size-4 mr-2" />
                Reject Bid
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}
