import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import * as bidService from '../../services/bidService';
import type { Bid } from '../../services/bidService';
import apiClient from '../../services/apiService';
import { API_CONFIG } from '../../config/api';
import {
  Search,
  Filter,
  FileText,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Plus,
  Edit
} from 'lucide-react';
import { toast } from '../../utils/toast';
import { RichTextViewer } from '../../components/common';

export default function AgentBidManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects } = useData();
  const { user } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [biddingsCount, setBiddingsCount] = useState<Map<string, number>>(new Map());

  const agentProjects = projects.filter(p => p.assigned_agent_id === user?.id);
  const hasAssignedProjects = agentProjects.length > 0;

  // Get project if ID is provided
  const project = id ? projects.find(p => p.id === id) : null;

  useEffect(() => {
    loadBids();
  }, [statusFilter, id]);

  const loadBids = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        limit: 100,
      };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (id) {
        params.projectId = id;
      }
      const response = await bidService.getAllBids(params);

      // Filter bids to ensure only assigned projects (secondary check)
      const visibleBids = response.bids.filter((bid: any) => {
        if (!user || user.role !== 'agent') return true;
        const bidProject = projects.find(p => p.id === bid.projectId);
        return bidProject?.assigned_agent_id === user.id;
      });

      setBids(visibleBids);

      // Fetch biddings count for each bid
      const countsMap = new Map<string, number>();
      await Promise.all(
        visibleBids.map(async (bid: Bid) => {
          try {
            // Only try to fetch if we have access (backend controller for bidding already has checks)
            // If it fails with 403, we just set 0 and ignore the error to avoid toasts
            const biddingsResponse = await apiClient.get(API_CONFIG.BIDDING.GET_BY_ADMIN_BID(bid.id));
            if (biddingsResponse.data.success && biddingsResponse.data.data) {
              const biddings = Array.isArray(biddingsResponse.data.data) ? biddingsResponse.data.data : [];
              countsMap.set(bid.id, biddings.length);
            }
          } catch (error) {
            const status = (error as any)?.response?.status;
            // If forbidden, treat as 0 proposals (agent is not authorized for this bid)
            if (status === 403) {
              countsMap.set(bid.id, 0);
              return;
            }
            console.error(`Failed to load biddings for bid ${bid.id}:`, error);
            countsMap.set(bid.id, 0);
          }
        })
      );
      setBiddingsCount(countsMap);
    } catch (error: any) {
      console.error('Failed to load bids:', error);
      toast.error(error.message || 'Failed to load bids');
    } finally {
      setLoading(false);
    }
  };

  // Filter to specific project if provided (backend already handles this, but we filter client-side too)
  const relevantBids = project
    ? bids.filter(b => b.projectId === project.id)
    : bids;

  const filteredBids = relevantBids.filter(bid => {
    const bidProject = projects.find(p => p.id === bid.projectId);
    const matchesSearch =
      (bid.bidderName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (bid.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (bidProject?.title.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = statusFilter === 'all' || bid.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getProjectTitle = (projectId: string) => {
    const bid = bids.find(b => b.projectId === projectId);
    return bid?.projectTitle || projects.find(p => p.id === projectId)?.title || 'Unknown Project';
  };

  const getBidderName = (bid: Bid) => {
    return bid.bidderName || bid.bidder?.name || 'Unknown Bidder';
  };

  const getBidderRating = (bid: Bid) => {
    return bid.bidder?.rating || null;
  };

  // Check if bid was created by admin/superadmin or the agent themselves
  const canManageBid = (bid: Bid) => {
    if (!user) return false;

    // If bid was created by the agent themselves, hide management buttons
    if (bid.bidderId === user.id) {
      return false;
    }

    // If bid was created by admin or superadmin, hide management buttons
    const bidderRole = bid.bidder?.role;
    if (bidderRole === 'admin' || bidderRole === 'superadmin') {
      return false;
    }

    // Otherwise, allow management (bid created by another agent)
    return true;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'shortlisted': 'bg-blue-100 text-blue-700',
      'under_review': 'bg-purple-100 text-purple-700',
      'accepted': 'bg-green-100 text-green-700',
      'rejected': 'bg-red-100 text-red-700',
      'withdrawn': 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="size-4" />;
      case 'under_review':
        return <AlertCircle className="size-4" />;
      case 'accepted':
        return <CheckCircle2 className="size-4" />;
      case 'rejected':
        return <XCircle className="size-4" />;
      default:
        return <FileText className="size-4" />;
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    try {
      await bidService.updateBidAcceptance(bidId, true);
      toast.success('Bid accepted successfully!');
      loadBids(); // Reload bids to reflect changes
    } catch (error: any) {
      console.error('Failed to accept bid:', error);
      toast.error(error?.response?.data?.message || 'Failed to accept bid');
    }
  };

  const handleRejectBid = async (bidId: string) => {
    try {
      await bidService.updateBidDecline(bidId, true);
      toast.success('Bid rejected successfully!');
      loadBids(); // Reload bids to reflect changes
    } catch (error: any) {
      console.error('Failed to reject bid:', error);
      toast.error(error?.response?.data?.message || 'Failed to reject bid');
    }
  };

  const handleShortlistBid = async (bidId: string, isShortlisted: boolean) => {
    try {
      await bidService.updateBidShortlist(bidId, isShortlisted);
      toast.success(`Bid ${isShortlisted ? 'shortlisted' : 'removed from shortlist'} successfully!`);
      loadBids(); // Reload bids to reflect changes
    } catch (error: any) {
      console.error('Failed to update shortlist status:', error);
      toast.error(error?.response?.data?.message || 'Failed to update shortlist status');
    }
  };

  const handleUndoAcceptBid = async (bidId: string) => {
    try {
      await bidService.updateBidAcceptance(bidId, false);
      toast.success('Bid acceptance undone successfully!');
      loadBids(); // Reload bids to reflect changes
    } catch (error: any) {
      console.error('Failed to undo accept bid:', error);
      toast.error(error?.response?.data?.message || 'Failed to undo accept bid');
    }
  };

  const handleUndoRejectBid = async (bidId: string) => {
    try {
      await bidService.updateBidDecline(bidId, false);
      toast.success('Bid rejection undone successfully!');
      loadBids(); // Reload bids to reflect changes
    } catch (error: any) {
      console.error('Failed to undo reject bid:', error);
      toast.error(error?.response?.data?.message || 'Failed to undo reject bid');
    }
  };

  const stats = [
    {
      label: 'Total Bids',
      value: relevantBids.length,
      icon: <FileText className="size-5" />,
      color: 'bg-blue-500',
    },
    {
      label: 'Pending Review',
      value: relevantBids.filter(b => b.status === 'pending').length,
      icon: <Clock className="size-5" />,
      color: 'bg-yellow-500',
    },
    {
      label: 'Shortlisted',
      value: relevantBids.filter(b => b.isShortlisted || b.status === 'shortlisted').length,
      icon: <User className="size-5" />,
      color: 'bg-blue-500',
    },
    {
      label: 'Accepted',
      value: relevantBids.filter(b => b.status === 'accepted').length,
      icon: <CheckCircle2 className="size-5" />,
      color: 'bg-green-500',
    },
    {
      label: 'Rejected',
      value: relevantBids.filter(b => b.status === 'rejected').length,
      icon: <XCircle className="size-5" />,
      color: 'bg-red-500',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl">
              {project ? `Bids for ${project.title}` : 'Bid Management'}
            </h1>
            <p className="text-gray-600 mt-1">Review and manage all bids for your projects</p>
          </div>
          <div className="flex items-center gap-2">
            {project && (
              <Button asChild variant="outline">
                <Link to="/agent/projects">
                  <FileText className="size-4 mr-2" />
                  All Projects
                </Link>
              </Button>
            )}
            <Button onClick={() => navigate('/agent/bids/create')}>
              <Plus className="size-4 mr-2" />
              Create Bid
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} text-white p-3 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by freelancer or project..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="under_review">Under Review</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bids List */}
        {!hasAssignedProjects && !loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <AlertCircle className="size-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg mb-2">No projects assigned</h3>
            <p className="text-gray-600">You haven't been assigned to any projects yet. Contact the administrator to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBids.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <FileText className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg mb-2">No bids found</h3>
                <p className="text-gray-600">{searchTerm || statusFilter !== 'all' ? 'No bids match your current filters.' : 'No bids have been submitted for your projects yet.'}</p>
              </div>
            ) : (
              filteredBids
                .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                .map((bid) => {
                  const bidProject = projects.find(p => p.id === bid.projectId);
                  const bidderRating = getBidderRating(bid);

                  return (
                    <div key={bid.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl">{!project ? getProjectTitle(bid.projectId) : getBidderName(bid)}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(bid.status)}`}>
                              {bid.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <User className="size-4" />
                              <span>{getBidderName(bid)}</span>
                              {bidderRating !== null && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span className="flex items-center gap-1">
                                    ⭐ {bidderRating} ({bid.bidder?.completedProjects || 0} projects)
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="size-4" />
                              <span>Submitted {new Date(bid.submittedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {bid.description && (
                            <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                              <RichTextViewer content={bid.description} />
                            </p>
                          )}
                          {bid.attachments && bid.attachments.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FileText className="size-4" />
                              <span>{bid.attachments.length} attachment{bid.attachments.length > 1 ? 's' : ''}</span>
                            </div>
                          )}
                          {/* Freelancer Proposals Count */}
                          {biddingsCount.has(bid.id) && (
                            <div className="flex items-center gap-2 text-sm text-blue-600 mt-2">
                              <User className="size-4" />
                              <span>
                                {biddingsCount.get(bid.id)} Freelancer Proposal{biddingsCount.get(bid.id) !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm text-gray-500">Bid Amount</div>
                          <div className="text-2xl">₹{bid.bidAmount.toLocaleString()}</div>
                          {bid.timeline && (
                            <div className="text-sm text-gray-500 mt-1">
                              <Clock className="size-3 inline mr-1" />
                              {bid.timeline}
                            </div>
                          )}
                        </div>
                      </div>

                      {bid.attachments && bid.attachments.length > 0 && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="text-sm mb-2">Attachments:</h4>
                          <div className="space-y-2">
                            {bid.attachments.map((attachment, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <a
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {attachment.name}
                                </a>
                                <span className="text-gray-600">{(attachment.size / 1024).toFixed(2)} KB</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-200">
                        {/* View Proposals Button */}
                        {biddingsCount.has(bid.id) && biddingsCount.get(bid.id)! > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link to={`/admin/bids/${bid.id}`}>
                              <User className="size-4 mr-2" />
                              View Proposals ({biddingsCount.get(bid.id)})
                            </Link>
                          </Button>
                        )}

                        {/* Edit Button - Show only when project is in_bidding */}
                        {bidProject?.status === 'in_bidding' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/agent/bids/${bid.id}/edit`)}
                          >
                            <Edit className="size-4 mr-2" />
                            Edit Bid
                          </Button>
                        )}

                        {canManageBid(bid) && (
                          <>
                            {bid.status === 'pending' || bid.status === 'under_review' ? (
                              <>
                                <Button size="sm" onClick={() => handleAcceptBid(bid.id)}>
                                  <CheckCircle2 className="size-4 mr-2" />
                                  Accept
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRejectBid(bid.id)}
                                >
                                  <XCircle className="size-4 mr-2" />
                                  Reject
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleShortlistBid(bid.id, !bid.isShortlisted)}
                                >
                                  {bid.isShortlisted ? 'Remove from Shortlist' : 'Shortlist'}
                                </Button>
                              </>
                            ) : bid.status === 'shortlisted' ? (
                              <>
                                <Button size="sm" onClick={() => handleAcceptBid(bid.id)}>
                                  <CheckCircle2 className="size-4 mr-2" />
                                  Accept
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRejectBid(bid.id)}
                                >
                                  <XCircle className="size-4 mr-2" />
                                  Reject
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleShortlistBid(bid.id, false)}
                                >
                                  Remove from Shortlist
                                </Button>
                              </>
                            ) : bid.status === 'accepted' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUndoAcceptBid(bid.id)}
                              >
                                Undo Accept
                              </Button>
                            ) : bid.status === 'rejected' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUndoRejectBid(bid.id)}
                              >
                                Undo Reject
                              </Button>
                            ) : null}

                            <Button asChild variant="outline" size="sm">
                              <Link to={`/admin/users/${bid.bidderId}/freelancer`}>
                                <User className="size-4 mr-2" />
                                View Bidder Profile
                              </Link>
                            </Button>
                          </>
                        )}

                        {!project && (
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/agent/projects/${bid.projectId}`}>
                              <FileText className="size-4 mr-2" />
                              View Project
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
