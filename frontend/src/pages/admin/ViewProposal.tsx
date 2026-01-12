import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiService';
import { API_CONFIG } from '../../config/api';
import { RichTextViewer } from '../../components/common/RichTextViewer';
import AttachmentItem from '../../components/common/AttachmentItem';
import { 
  ArrowLeft,
  Star,
  CheckCircle2,
  XCircle,
  Users,
  RotateCcw,
} from 'lucide-react';
import { toast } from '../../utils/toast';

interface BiddingData {
  _id: string;
  adminBidId: string;
  projectId: any;
  freelancerId: any;
  bidAmount: number;
  timeline: string;
  description: string;
  status: string;
  isShortlisted?: boolean;
  isAccepted?: boolean;
  isDeclined?: boolean;
  submittedAt: string;
  attachments?: Array<{
    name: string;
    url: string;
    size?: number;
    type?: string;
  }>;
}

export default function ViewProposal() {
  const { bidId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { bids, projects, freelancers, getProjectsByUser } = useData();
  const [biddingData, setBiddingData] = useState<BiddingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const biddingId = searchParams.get('biddingId');

  const loadBidding = async () => {
    if (!biddingId) return;
    try {
      setLoading(true);
      const response = await apiClient.get(API_CONFIG.BIDDING.GET(biddingId));
      if (response.data.success && response.data.data) {
        setBiddingData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load bidding:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBidding();
  }, [biddingId]);

  const handleAccept = async () => {
    if (!biddingId) return;
    try {
      setActionLoading(true);
      const response = await apiClient.patch(API_CONFIG.BIDDING.ACCEPT(biddingId), { isAccepted: true });
      if (response.data.success) {
        toast.success('Proposal accepted successfully!');
        loadBidding();
      }
    } catch (error: any) {
      console.error('Failed to accept proposal:', error);
      toast.error(error?.response?.data?.message || 'Failed to accept proposal');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUndoAccept = async () => {
    if (!biddingId) return;
    try {
      setActionLoading(true);
      const response = await apiClient.patch(API_CONFIG.BIDDING.ACCEPT(biddingId), { isAccepted: false });
      if (response.data.success) {
        toast.success('Acceptance undone successfully!');
        loadBidding();
      }
    } catch (error: any) {
      console.error('Failed to undo accept:', error);
      toast.error(error?.response?.data?.message || 'Failed to undo accept');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!biddingId) return;
    try {
      setActionLoading(true);
      const response = await apiClient.patch(API_CONFIG.BIDDING.DECLINE(biddingId), { isDeclined: true });
      if (response.data.success) {
        toast.success('Proposal rejected successfully!');
        loadBidding();
      }
    } catch (error: any) {
      console.error('Failed to reject proposal:', error);
      toast.error(error?.response?.data?.message || 'Failed to reject proposal');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUndoReject = async () => {
    if (!biddingId) return;
    try {
      setActionLoading(true);
      const response = await apiClient.patch(API_CONFIG.BIDDING.DECLINE(biddingId), { isDeclined: false });
      if (response.data.success) {
        toast.success('Rejection undone successfully!');
        loadBidding();
      }
    } catch (error: any) {
      console.error('Failed to undo reject:', error);
      toast.error(error?.response?.data?.message || 'Failed to undo reject');
    } finally {
      setActionLoading(false);
    }
  };

  const handleShortlist = async () => {
    if (!biddingId) return;
    try {
      setActionLoading(true);
      const response = await apiClient.patch(API_CONFIG.BIDDING.SHORTLIST(biddingId), { isShortlisted: true });
      if (response.data.success) {
        toast.success('Proposal shortlisted successfully!');
        loadBidding();
      }
    } catch (error: any) {
      console.error('Failed to shortlist proposal:', error);
      toast.error(error?.response?.data?.message || 'Failed to shortlist proposal');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUndoShortlist = async () => {
    if (!biddingId) return;
    try {
      setActionLoading(true);
      const response = await apiClient.patch(API_CONFIG.BIDDING.SHORTLIST(biddingId), { isShortlisted: false });
      if (response.data.success) {
        toast.success('Shortlist removed successfully!');
        loadBidding();
      }
    } catch (error: any) {
      console.error('Failed to undo shortlist:', error);
      toast.error(error?.response?.data?.message || 'Failed to undo shortlist');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'shortlisted': 'bg-blue-100 text-blue-700',
      'accepted': 'bg-green-100 text-green-700',
      'rejected': 'bg-red-100 text-red-700',
      'withdrawn': 'bg-gray-100 text-gray-700',
      'under_review': 'bg-purple-100 text-purple-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  // If biddingId is provided, use bidding data; otherwise use bid data from context
  const bid = biddingData ? {
    id: biddingData.adminBidId?._id || biddingData.adminBidId,
    project_id: biddingData.projectId?._id || biddingData.projectId,
    freelancer_id: biddingData.freelancerId?._id || biddingData.freelancerId,
    amount: biddingData.bidAmount,
    estimated_duration: biddingData.timeline,
    proposal: biddingData.description,
    cover_letter: biddingData.description,
    submitted_at: biddingData.submittedAt,
    created_at: biddingData.submittedAt,
  } : bids.find(b => b.id === bidId);
  
  // Get project - if using bidding data, try to get from populated projectId, otherwise from context
  const project = biddingData?.projectId?._id 
    ? projects.find(p => p.id === (biddingData.projectId._id || biddingData.projectId))
    : (bid ? projects.find(p => p.id === bid.project_id) : null);
  
  // Get freelancer - if using bidding data, try to get from populated freelancerId, otherwise from context
  const freelancer = biddingData?.freelancerId?._id
    ? freelancers.find(f => f.id === (biddingData.freelancerId._id || biddingData.freelancerId))
    : (bid ? freelancers.find(f => f.id === bid.freelancer_id) : null);
  
  // Calculate freelancer stats from projects
  const freelancerProjects = freelancer ? getProjectsByUser(freelancer.id, 'freelancer') : [];
  const completedProjectsCount = freelancerProjects.filter(p => p.status === 'completed').length;
  const totalProjectsCount = freelancerProjects.length;

  if (!bid) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl mb-2">Proposal Not Found</h2>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="size-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  // Use project data from bidding if available, otherwise from context
  const projectData = biddingData?.projectId || project;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4 mr-2" />
            
          </Button>
          <div>
            <h1 className="text-3xl">Full Proposal</h1>
            <p className="text-gray-600 mt-1">Complete bid details and freelancer information</p>
          </div>
        </div>

        {/* Main Content */}
        <Card className="p-6">
          <div className="space-y-6">
            {/* Freelancer Info */}
            {freelancer && (
              <div>
                <h4 className="font-medium mb-3">Freelancer Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name</span>
                    <span>{freelancer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating</span>
                    <span className="flex items-center gap-1">
                      <Star className="size-4 text-yellow-500 fill-yellow-500" />
                      {freelancer.rating}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed Projects</span>
                    <span>{completedProjectsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Success Rate</span>
                    <span>
                      {totalProjectsCount > 0 
                        ? `${((completedProjectsCount / totalProjectsCount) * 100).toFixed(0)}%`
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Bid Details */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Bid Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Bid Amount</Label>
                  <p className="text-2xl">₹{bid.amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Delivery Time</Label>
                  <p className="text-2xl">
                    {bid.estimated_duration || 
                     (bid.duration_weeks ? `${bid.duration_weeks} weeks` : 'N/A')}
                  </p>
                </div>
              </div>
            </div>


            {/* Full Proposal */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Proposal</h4>
              {bid.proposal || bid.cover_letter ? (
                <RichTextViewer content={bid.proposal || bid.cover_letter || ''} />
              ) : (
                <p className="text-gray-700">No proposal provided.</p>
              )}
            </div>

            {/* Attachments */}
            {biddingData?.attachments && biddingData.attachments.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Attachments</h4>
                <div className="space-y-2">
                  {biddingData.attachments.map((attachment: any, index: number) => (
                    <AttachmentItem
                      key={index}
                      attachment={attachment}
                      showDownload={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Submitted Date */}
            <div className="pt-4 border-t">
              <div className="text-sm text-gray-600">
                Submitted on {new Date(bid.submitted_at || bid.created_at).toLocaleString()}
              </div>
            </div>

            {/* Status Badge */}
            {biddingData && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={getStatusColor(biddingData.status)}>
                    {biddingData.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {biddingData && user && (user.role === 'admin' || user.role === 'superadmin' || user.role === 'agent') && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Actions</h4>
                <div className="flex flex-wrap items-center gap-3">
                  {(biddingData.status === 'pending' || biddingData.status === 'under_review') && !biddingData.isShortlisted ? (
                    <>
                      <Button 
                        onClick={handleAccept}
                        disabled={actionLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="size-4 mr-2" />
                        Accept
                      </Button>
                      <Button 
                        onClick={handleReject}
                        disabled={actionLoading}
                        variant="destructive"
                      >
                        <XCircle className="size-4 mr-2" />
                        Reject
                      </Button>
                      <Button 
                        onClick={handleShortlist}
                        disabled={actionLoading}
                        variant="outline"
                      >
                        <Users className="size-4 mr-2" />
                        Shortlist
                      </Button>
                    </>
                  ) : biddingData.status === 'accepted' || biddingData.isAccepted ? (
                    <>
                      <Button 
                        onClick={handleUndoAccept}
                        disabled={actionLoading}
                        variant="outline"
                      >
                        <RotateCcw className="size-4 mr-2" />
                        Undo Accept
                      </Button>
                      <Button 
                        onClick={handleReject}
                        disabled={actionLoading}
                        variant="destructive"
                      >
                        <XCircle className="size-4 mr-2" />
                        Reject
                      </Button>
                      <Button 
                        onClick={handleShortlist}
                        disabled={actionLoading}
                        variant="outline"
                      >
                        <Users className="size-4 mr-2" />
                        Shortlist
                      </Button>
                    </>
                  ) : biddingData.status === 'rejected' || biddingData.isDeclined ? (
                    <>
                      <Button 
                        onClick={handleAccept}
                        disabled={actionLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="size-4 mr-2" />
                        Accept
                      </Button>
                      <Button 
                        onClick={handleUndoReject}
                        disabled={actionLoading}
                        variant="outline"
                      >
                        <RotateCcw className="size-4 mr-2" />
                        Undo Reject
                      </Button>
                      <Button 
                        onClick={handleShortlist}
                        disabled={actionLoading}
                        variant="outline"
                      >
                        <Users className="size-4 mr-2" />
                        Shortlist
                      </Button>
                    </>
                  ) : (biddingData.status === 'shortlisted' || biddingData.isShortlisted) && !biddingData.isAccepted && !biddingData.isDeclined ? (
                    <>
                      <Button 
                        onClick={handleAccept}
                        disabled={actionLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="size-4 mr-2" />
                        Accept
                      </Button>
                      <Button 
                        onClick={handleReject}
                        disabled={actionLoading}
                        variant="destructive"
                      >
                        <XCircle className="size-4 mr-2" />
                        Reject
                      </Button>
                      <Button 
                        onClick={handleUndoShortlist}
                        disabled={actionLoading}
                        variant="outline"
                      >
                        <RotateCcw className="size-4 mr-2" />
                        Undo Shortlist
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

