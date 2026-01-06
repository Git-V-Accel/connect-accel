import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import * as bidService from '../../services/bidService';
import type { Bid as ApiBid } from '../../services/bidService';
import apiClient from '../../services/apiService';
import { API_CONFIG } from '../../config/api';
import { RichTextViewer } from '../../components/common/RichTextViewer';
import {
  ArrowLeft,
  IndianRupee,
  Clock,
  Calendar,
  FileText,
  User,
  CheckCircle2,
  XCircle,
  Star,
  Briefcase,
  Award,
  Mail,
  Phone,
  MapPin,
  Users,
  Eye,
  RotateCcw,
  Edit
} from 'lucide-react';
import { toast } from '../../utils/toast';

export default function AdminBidDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bids, projects, freelancers, getProjectsByUser } = useData();
  const [apiBid, setApiBid] = useState<ApiBid | null>(null);
  const [loadingBid, setLoadingBid] = useState(false);
  const [biddings, setBiddings] = useState<any[]>([]);
  const [loadingBiddings, setLoadingBiddings] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const localBid = bids.find((b) => b.id === id);

  const loadBid = async () => {
    if (!id) return;
    // If we already have it in memory, no need to fetch.
    if (localBid) return;
    try {
      setLoadingBid(true);
      const b = await bidService.getBidDetails(id);
      setApiBid(b);
    } catch (e) {
      console.error('Failed to fetch bid details:', e);
      setApiBid(null);
    } finally {
      setLoadingBid(false);
    }
  };

  useEffect(() => {
    loadBid();
  }, [id, localBid]);

  // Load freelancer proposals (biddings) for this admin bid
  useEffect(() => {
    const loadBiddings = async () => {
      if (!id) return;
      try {
        setLoadingBiddings(true);
        const response = await apiClient.get(API_CONFIG.BIDDING.GET_BY_ADMIN_BID(id));
        if (response.data.success && response.data.data) {
          setBiddings(Array.isArray(response.data.data) ? response.data.data : []);
        }
      } catch (error) {
        console.error('Failed to load biddings:', error);
        setBiddings([]);
      } finally {
        setLoadingBiddings(false);
      }
    };
    loadBiddings();
  }, [id]);

  const mappedBid = useMemo(() => {
    if (!apiBid) return null;
    return {
      id: apiBid.id,
      project_id: apiBid.projectId,
      freelancer_id: apiBid.bidderId,
      freelancer_name: apiBid.bidderName,
      amount: apiBid.bidAmount,
      duration_weeks: 0,
      estimated_duration: apiBid.timeline,
      cover_letter: apiBid.description,
      proposal: apiBid.description,
      status: apiBid.status,
      isShortlisted: apiBid.isShortlisted,
      isAccepted: apiBid.isAccepted,
      isDeclined: apiBid.isDeclined,
      submitted_at: apiBid.submittedAt,
      created_at: apiBid.submittedAt,
      admin_notes: '',
      milestones: [],
    } as any;
  }, [apiBid]);

  const bid = localBid || mappedBid;
  const project =
    (bid ? projects.find((p) => p.id === bid.project_id) : null) ||
    (apiBid?.project
      ? ({
        id: apiBid.project.id,
        title: apiBid.project.title,
        budget: apiBid.project.budget ?? 0,
        category: '',
        skills_required: [],
        duration_weeks: 0,
      } as any)
      : null);

  const freelancer =
    (bid ? freelancers.find((f) => f.id === bid.freelancer_id) : null) ||
    (apiBid?.bidder
      ? ({
        id: apiBid.bidder.id,
        name: apiBid.bidder.name,
        email: apiBid.bidder.email,
        rating: apiBid.bidder.rating ?? 0,
        total_reviews: 0,
        title: '',
        skills: [],
        hourly_rate: 0,
        availability: '',
        phone: '',
        location: '',
      } as any)
      : null);

  // Calculate freelancer stats from projects (local data only)
  const freelancerProjects = freelancer ? getProjectsByUser(freelancer.id, 'freelancer') : [];
  const completedProjectsCount = freelancerProjects.filter(p => p.status === 'completed').length;
  const totalProjectsCount = freelancerProjects.length;

  if (loadingBid) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading bid details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!bid || !project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl mb-4">Bid not found</h2>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4 mr-2" />
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleAccept = async () => {
    try {
      setActionLoading(true);
      await bidService.updateBidAcceptance(bid.id, true);
      toast.success('Bid accepted successfully!');
      loadBid();
    } catch (e: any) {
      toast.error(e.message || 'Failed to accept bid');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUndoAccept = async () => {
    try {
      setActionLoading(true);
      await bidService.updateBidAcceptance(bid.id, false);
      toast.success('Acceptance undone successfully!');
      loadBid();
    } catch (e: any) {
      toast.error(e.message || 'Failed to undo accept');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setActionLoading(true);
      await bidService.updateBidDecline(bid.id, true);
      toast.success('Bid rejected');
      loadBid();
    } catch (e: any) {
      toast.error(e.message || 'Failed to reject bid');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUndoReject = async () => {
    try {
      setActionLoading(true);
      await bidService.updateBidDecline(bid.id, false);
      toast.success('Rejection undone successfully!');
      loadBid();
    } catch (e: any) {
      toast.error(e.message || 'Failed to undo reject');
    } finally {
      setActionLoading(false);
    }
  };

  const handleShortlist = async () => {
    try {
      setActionLoading(true);
      await bidService.updateBidShortlist(bid.id, true);
      toast.success('Bid shortlisted');
      loadBid();
    } catch (e: any) {
      toast.error(e.message || 'Failed to shortlist bid');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUndoShortlist = async () => {
    try {
      setActionLoading(true);
      await bidService.updateBidShortlist(bid.id, false);
      toast.success('Shortlist removed successfully!');
      loadBid();
    } catch (e: any) {
      toast.error(e.message || 'Failed to undo shortlist');
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
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(bid.status)}`}>
                {bid.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-gray-600 mt-1">{project.title}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 max-h-[calc(100vh)] overflow-y-auto scrollbar-hide">
            {/* Full Proposal */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl mb-6">Full Proposal</h2>
                {/* Edit Button - Show only when project is in_bidding */}
                  {project?.status === 'in_bidding' && (
                    <Button
                      onClick={() => navigate(`/admin/bids/${bid.id}/edit`)}
                      variant="outline"
                    >
                      <Edit className="size-4 mr-2" />
                    </Button>
                 )}
                </div>

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
                      <p className="text-2xl">{bid.estimated_duration || (bid.duration_weeks ? `${bid.duration_weeks} weeks` : 'N/A')}</p>
                    </div>
                  </div>
                </div>

                {/* Full Proposal */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Description</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    <RichTextViewer content={bid.proposal || bid.cover_letter || 'No proposal provided.'} />
                  </p>
                </div>

                {/* Submitted Date */}
                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Submitted on {new Date(bid.submitted_at || bid.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Proposed Milestones */}
            {bid.milestones && bid.milestones.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl mb-4">Proposed Milestones</h2>
                <div className="space-y-3">
                  {bid.milestones.map((milestone: any, index: number) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-sm mb-1">{milestone.title}</h3>
                          <p className="text-sm text-gray-600">{milestone.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm">₹{milestone.amount.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">{milestone.duration}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total:</span>
                      <span className="text-lg">
                        ₹{bid.milestones.reduce((sum: number, m: any) => sum + m.amount, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

         

            {/* Freelancer Proposals Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl">Freelancer Proposals</h2>
                <Badge variant="outline" className="text-lg">
                  {loadingBiddings ? 'Loading...' : biddings.length}
                </Badge>
              </div>

              {loadingBiddings ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
                  <p className="text-gray-600">Loading proposals...</p>
                </div>
              ) : biddings.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="size-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg mb-2">No Proposals Yet</h3>
                  <p className="text-gray-600">No freelancers have submitted proposals for this bid yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {biddings.map((bidding: any) => {
                    const freelancerId = bidding.freelancerId?._id || bidding.freelancerId;
                    const freelancerName = bidding.freelancerId?.name || 'Unknown Freelancer';
                    const freelancerEmail = bidding.freelancerId?.email || '';
                    const submittedDate = bidding.submittedAt ? new Date(bidding.submittedAt).toLocaleDateString() : 'N/A';

                    return (
                      <Card key={bidding._id || bidding.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium">{freelancerName}</h3>
                                <Badge className={getStatusColor(bidding.status)}>
                                  {bidding.status}
                                </Badge>
                              </div>
                              {freelancerEmail && (
                                <p className="text-sm text-gray-600">{freelancerEmail}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">Submitted {submittedDate}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">Bid Amount</div>
                              <div className="text-lg font-semibold">₹{bidding.bidAmount?.toLocaleString() || '0'}</div>
                              {bidding.timeline && (
                                <div className="text-xs text-gray-500 mt-1">
                                  <Clock className="size-3 inline mr-1" />
                                  {bidding.timeline}
                                </div>
                              )}
                            </div>
                          </div>

                          {bidding.description && (
                            <div className="pt-3 border-t">
                              <div className="text-sm text-gray-600 mb-2">Proposal:</div>
                              <div className="text-sm">
                                <RichTextViewer content={bidding.description} />
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-2 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <Link to={`/admin/bids/${id}/proposal?biddingId=${bidding._id || bidding.id}`}>
                                <Eye className="size-4 mr-2" />
                                View Full Proposal
                              </Link>
                            </Button>
                            {freelancerId && (
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                              >
                                <Link to={`/admin/users/${freelancerId}/freelancer`}>
                                  <User className="size-4 mr-2" />
                                  View Profile
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg mb-4">Project Information</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Title</div>
                  <div className="text-sm">{project.title}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Budget</div>
                  <div className="text-sm">₹{project.budget.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Category</div>
                  <div className="text-sm">{project.category}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Required Skills</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.skills_required.map((skill: string) => (
                      <span key={skill} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to={`/admin/projects/${project.id}`}>
                    <FileText className="size-4 mr-2" />
                    View Full Project
                  </Link>
                </Button>
              </div>
            </div>

            {/* Comparison */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg mb-4">Budget Comparison</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Project Budget</span>
                  <span className="text-sm">₹{project.budget.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This Bid</span>
                  <span className="text-sm">₹{bid.amount.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Difference</span>
                    <span className={`text-sm ${bid.amount <= project.budget ? 'text-green-600' : 'text-red-600'}`}>
                      {bid.amount <= project.budget ? '-' : '+'}
                      ₹{Math.abs(project.budget - bid.amount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
