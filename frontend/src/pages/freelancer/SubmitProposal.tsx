import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import * as bidService from '../../services/bidService';
import { createBiddingWithAttachments, updateBiddingWithAttachments } from '../../services/bidService';
import type { Bid } from '../../services/bidService';
import { RichTextViewer } from '../../components/common/RichTextViewer';
import { RichTextEditor } from '../../components/common/RichTextEditor';
import AttachmentItem from '../../components/common/AttachmentItem';
import FileUpload from '../../components/common/FileUpload';
import { 
  ArrowLeft,
  IndianRupee,
  Clock,
  Calendar,
  FileText,
  User,
  Send,
} from 'lucide-react';
import { toast } from '../../utils/toast';
import apiClient from '../../services/apiService';
import { API_CONFIG } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

export default function SubmitProposal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [bid, setBid] = useState<Bid | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidDuration, setBidDuration] = useState('');
  const [bidProposal, setBidProposal] = useState('');
  const [existingBidding, setExistingBidding] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [proposalAttachments, setProposalAttachments] = useState<File[]>([]);

  // Attachment handler for FileUpload component
  const removeAttachment = (index: number) => {
    setProposalAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Handler for removing existing attachments
  const removeExistingAttachment = (index: number) => {
    if (existingBidding?.attachments) {
      const updatedAttachments = [...existingBidding.attachments];
      updatedAttachments.splice(index, 1);
      setExistingBidding((prev: any) => prev ? {...prev, attachments: updatedAttachments} : null);
    }
  };

  // Check if we're in edit mode
  useEffect(() => {
    const pathname = location.pathname;
    setIsEditMode(pathname.includes('/edit'));
  }, [location.pathname]);

  useEffect(() => {
    const loadBid = async () => {
      if (!id) return;
      try {
        setLoading(true);
        
        if (location.pathname.includes('/edit')) {
          // In edit mode, load admin bid details first
          const bidData = await bidService.getBidDetails(id);
          setBid(bidData);
          
          // Load existing bidding data
          try {
            const biddingResponse = await apiClient.get(API_CONFIG.BIDDING.GET_BY_FREELANCER(user.id));
            if (biddingResponse.data.success && biddingResponse.data.data) {
              const biddings = Array.isArray(biddingResponse.data.data) ? biddingResponse.data.data : [];
              const myBidding = biddings.find((b: any) => {
                const adminBidId = b.adminBidId?._id?.toString() || b.adminBidId?.toString() || b.adminBidId;
                return adminBidId === id || adminBidId === String(id) || String(adminBidId) === String(id);
              });
              
              if (myBidding) {
                setExistingBidding(myBidding);
                setBidAmount(myBidding.bidAmount?.toString() || '');
                setBidDuration(myBidding.timeline?.replace(' weeks', '') || '');
                setBidProposal(myBidding.description || '');
                // Note: Existing attachments are handled separately in the FileUpload component
              }
            }
          } catch (error) {
            console.error('Failed to load existing bidding:', error);
          }
        } else {
          // In create mode, load admin bid details
          const bidData = await bidService.getBidDetails(id);
          setBid(bidData);
        }
      } catch (error: any) {
        console.error('Failed to load bid:', error);
        toast.error(error.message || 'Failed to load bid details');
        navigate('/freelancer/bids');
      } finally {
        setLoading(false);
      }
    };
    loadBid();
  }, [id, navigate, user?.id, location.pathname]);

  const handleSubmitProposal = async () => {
    if (!bid || !bidAmount || !bidDuration || !bidProposal) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if proposal has actual content (strip HTML tags)
    const textContent = bidProposal.replace(/<[^>]*>/g, '').trim();
    if (!textContent) {
      toast.error('Please provide a detailed proposal');
      return;
    }

    try {
      setSubmitting(true);
      
      if (isEditMode && existingBidding) {
        // Update existing bidding
        const biddingPayload = {
          bidAmount: parseFloat(bidAmount),
          timeline: `${bidDuration} weeks`,
          description: bidProposal,
          notes: '',
          attachments: existingBidding?.attachments || [], // Include existing attachments
        };

        let response;
        if (proposalAttachments.length > 0) {
          response = await updateBiddingWithAttachments(existingBidding._id || existingBidding.id, biddingPayload, proposalAttachments);
        } else {
          response = await apiClient.put(API_CONFIG.BIDDING.UPDATE(existingBidding._id || existingBidding.id), biddingPayload);
        }

        if (response?.data?.success) {
          toast.success('Bid updated successfully!');
          navigate('/freelancer/bids');
        } else {
          const errorMessage = response?.data?.message || 'Failed to update bid';
          console.error('Update bid error:', response?.data);
          toast.error(errorMessage);
        }
      } else {
        // Create new bidding
        const biddingPayload = {
          adminBidId: bid.id,
          bidAmount: parseFloat(bidAmount),
          timeline: `${bidDuration} weeks`,
          description: bidProposal,
          notes: '',
        };

        let response;
        if (proposalAttachments.length > 0) {
          response = await createBiddingWithAttachments(biddingPayload, proposalAttachments);
        } else {
          response = await apiClient.post(API_CONFIG.BIDDING.CREATE, {
            ...biddingPayload,
            attachments: [],
          });
        }

        if (response?.data?.success) {
          toast.success('Proposal submitted successfully!');
          navigate('/freelancer/bids');
        } else {
          const errorMessage = response?.data?.message || 'Failed to submit proposal';
          console.error('Submit proposal error:', response?.data);
          toast.error(errorMessage);
        }
      }
    } catch (error: any) {
      console.error('Failed to submit proposal:', error);
      toast.error(error.response?.data?.message || 'Failed to submit proposal');
    } finally {
      setSubmitting(false);
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
            <h1 className="text-3xl">Submit Proposal</h1>
            <p className="text-gray-600 mt-1">{bid.projectTitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Bid Information */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl">Bid Information</h2>
                <Badge className={getStatusColor(bid.status)}>
                  {bid.status.replace('_', ' ')}
                </Badge>
              </div>
              
              <div className="space-y-6">
                {/* Posted By */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <User className="size-4" />
                    Posted By
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name</span>
                      <span className="font-medium">{bid.bidderName || 'Admin/Superadmin/Agent'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Role</span>
                      <span className="capitalize font-medium">{bid.bidder?.role || 'Admin/Superadmin/Agent'}</span>
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
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <IndianRupee className="size-4" />
                    Bid Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Bid Amount</span>
                      <span className="text-2xl font-semibold">₹{bid.bidAmount?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Clock className="size-4" />
                        Timeline
                      </span>
                      <span className="text-lg font-medium">{bid.timeline || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {bid.description && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <FileText className="size-4" />
                      Description
                    </h4>
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

          {/* Right Side - Proposal Form */}
          <div>
            <Card className="p-6">
              <h2 className="text-2xl mb-6">{isEditMode ? 'Edit Your Proposal' : 'Your Proposal'}</h2>
              
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Note:</strong> Your proposal will be reviewed by the admin/superadmin/agent who posted this bid. If shortlisted,
                    you'll be notified and may proceed with the project.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Your Bid Amount (₹) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="e.g., 120000"
                        value={bidAmount}
                        onChange={e => setBidAmount(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Your proposed amount for this project
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration (weeks) *</Label>
                      <Input
                        id="duration"
                        type="number"
                        placeholder="e.g., 8"
                        value={bidDuration}
                        onChange={e => setBidDuration(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Estimated time to complete the project
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="proposal">Your Proposal *</Label>
                    <div className="mt-2">
                      <RichTextEditor
                        value={bidProposal}
                        onChange={setBidProposal}
                        placeholder="Explain why you're the best fit for this project. Include relevant experience, approach, and what makes your bid competitive."
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      A detailed proposal increases your chances of being shortlisted
                    </p>
                  </div>

                  {/* Attachments Section */}
                  <FileUpload
                    files={proposalAttachments}
                    onFilesChange={setProposalAttachments}
                    onRemoveFile={removeAttachment}
                    existingAttachments={existingBidding?.attachments || []}
                    onRemoveExistingAttachment={removeExistingAttachment}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                    maxFiles={10}
                    maxSize={10}
                    disabled={submitting}
                    label="Proposal Attachments"
                    description="Add any relevant documents, portfolio samples, or supporting materials (optional)"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    variant="outline"
                    asChild
                    className="flex-1"
                  >
                    <Link to={`/freelancer/bids/${bid.id}/view`}>
                      Cancel
                    </Link>
                  </Button>
                  <Button 
                    onClick={handleSubmitProposal}
                    disabled={!bidAmount || !bidDuration || !bidProposal || submitting}
                    className="flex-1"
                  >
                    <Send className="size-4 mr-2" />
                    {submitting ? 'Submitting...' : (isEditMode ? 'Update Bid' : 'Submit Proposal')}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

