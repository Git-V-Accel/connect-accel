import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import * as bidService from '../../services/bidService';
import type { Bid } from '../../services/bidService';
import { RichTextViewer } from '../../components/common/RichTextViewer';
import AttachmentItem from '../../components/common/AttachmentItem';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft,
  IndianRupee,
  Clock,
  Calendar,
  FileText,
  User,
  Send,
  Eye
} from 'lucide-react';
import { toast } from '../../utils/toast';
import apiClient from '../../services/apiService';
import { API_CONFIG } from '../../config/api';

export default function FreelancerBidDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bid, setBid] = useState<Bid | null>(null);
  const [loading, setLoading] = useState(true);
  const [myBiddingId, setMyBiddingId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const loadBid = async () => {
      if (!id || !user) return;
      try {
        setLoading(true);
        const bidData = await bidService.getBidDetails(id);
        setBid(bidData);
        
        // Check if user has already submitted a proposal for this bid
        try {
          const biddingResponse = await apiClient.get(API_CONFIG.BIDDING.GET_BY_FREELANCER(user.id));
          if (biddingResponse.data.success && biddingResponse.data.data) {
            const biddings = Array.isArray(biddingResponse.data.data) ? biddingResponse.data.data : [];
            const myBidding = biddings.find((b: any) => {
              const adminBidId = b.adminBidId?._id?.toString() || b.adminBidId?.toString() || b.adminBidId;
              return adminBidId === id || adminBidId === String(id) || String(adminBidId) === String(id);
            });
            
            if (myBidding) {
              setHasSubmitted(true);
              setMyBiddingId(myBidding._id?.toString() || myBidding.id?.toString() || null);
            }
          }
        } catch (error) {
          console.error('Failed to check my biddings:', error);
        }
      } catch (error: any) {
        console.error('Failed to load bid:', error);
        toast.error(error.message || 'Failed to load bid details');
        navigate('/freelancer/projects');
      } finally {
        setLoading(false);
      }
    };
    loadBid();
  }, [id, navigate, user]);


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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading bid details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!bid) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl mb-4">Bid not found</h2>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4 mr-2" />
            Back to Browse Projects
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4 mr-2" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl">Bid Details</h1>
              <Badge className={getStatusColor(bid.status)}>
                {bid.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-gray-600 mt-1">{bid.projectTitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bid Information */}
            <Card className="p-6">
              <h2 className="text-2xl mb-6">Bid Information</h2>
              
              <div className="space-y-6">
                {/* Posted By */}
                <div>
                  <h4 className="font-medium mb-3">Posted By</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name</span>
                      <span>{bid.bidderName || 'Admin/Superadmin/Agent'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Role</span>
                      <span className="capitalize">{bid.bidder?.role || 'Admin/Superadmin/Agent'}</span>
                    </div>
                    {bid.bidder?.email && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email</span>
                        <span>{bid.bidder.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bid Details */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Bid Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-600">Bid Amount</Label>
                      <p className="text-2xl font-semibold">₹{bid.bidAmount?.toLocaleString() || '0'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Timeline</Label>
                      <p className="text-2xl font-semibold">{bid.timeline || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {bid.description && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Description</h4>
                    <div className="prose max-w-none">
                      <RichTextViewer content={bid.description} />
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {bid.attachments && bid.attachments.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Attachments</h4>
                    <div className="space-y-2">
                      {bid.attachments.map((attachment, index) => (
                        <AttachmentItem
                          key={index}
                          attachment={attachment}
                          className="w-full"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Submission Date */}
                {bid.submittedAt && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="size-4" />
                      <span>Posted on {new Date(bid.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-medium mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {hasSubmitted && myBiddingId ? (
                  <Button 
                    className="w-full"
                    variant="outline"
                    asChild
                  >
                    <Link to={`/admin/bids/${bid.id}/proposal?biddingId=${myBiddingId}`}>
                      <FileText className="size-4 mr-2" />
                      View Your Proposal
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button 
                      className="w-full"
                      asChild
                      disabled={bid.status !== 'pending'}
                    >
                      <Link to={`/freelancer/bids/${bid.id}/submit-proposal`}>
                        <Send className="size-4 mr-2" />
                        Submit Proposal
                      </Link>
                    </Button>
                    {bid.status !== 'pending' && (
                      <p className="text-xs text-gray-500 text-center">
                        This bid is no longer accepting proposals
                      </p>
                    )}
                  </>
                )}
              </div>
            </Card>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

