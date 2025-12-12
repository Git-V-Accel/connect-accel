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
import { 
  ArrowLeft,
  Star,
} from 'lucide-react';

interface BiddingData {
  _id: string;
  adminBidId: any;
  projectId: any;
  freelancerId: any;
  bidAmount: number;
  timeline: string;
  description: string;
  status: string;
  submittedAt: string;
}

export default function ViewProposal() {
  const { bidId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { bids, projects, freelancers, getProjectsByUser } = useData();
  const [biddingData, setBiddingData] = useState<BiddingData | null>(null);
  const [loading, setLoading] = useState(false);

  const biddingId = searchParams.get('biddingId');

  useEffect(() => {
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
    loadBidding();
  }, [biddingId]);

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

            {/* Submitted Date */}
            <div className="pt-4 border-t">
              <div className="text-sm text-gray-600">
                Submitted on {new Date(bid.submitted_at || bid.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

