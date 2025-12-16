import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import * as bidService from '../../services/bidService';
import type { Bid } from '../../services/bidService';
import DeleteWithReasonDialog from '../../components/common/DeleteWithReasonDialog';
import apiClient from '../../services/apiService';
import { API_CONFIG } from '../../config/api';
import { 
  FileText,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  IndianRupee,
  Calendar,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { toast } from '../../utils/toast';
import { RichTextViewer } from '../../components/common/RichTextViewer';

export default function AdminBidManagement() {
  const { projects } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectSearch, setProjectSearch] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ bidId: string; label: string } | null>(null);
  const [biddingsCount, setBiddingsCount] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    loadBids();
  }, [statusFilter]);

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
      const response = await bidService.getAllBids(params);
      setBids(response.bids);
      
      // Fetch biddings count for each bid
      const countsMap = new Map<string, number>();
      await Promise.all(
        response.bids.map(async (bid: Bid) => {
          try {
            const biddingsResponse = await apiClient.get(API_CONFIG.BIDDING.GET_BY_ADMIN_BID(bid.id));
            if (biddingsResponse.data.success && biddingsResponse.data.data) {
              const biddings = Array.isArray(biddingsResponse.data.data) ? biddingsResponse.data.data : [];
              countsMap.set(bid.id, biddings.length);
            }
          } catch (error) {
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

  const filteredBids = bids.filter(bid => {
    if (projectSearch.trim() !== '') {
      const projectTitle = bid.projectTitle || bid.project?.title || '';
      if (!projectTitle.toLowerCase().includes(projectSearch.toLowerCase())) {
        return false;
      }
    }
    return true;
  });

  const getProject = (projectId: string) => {
    return projects.find(p => p.id === projectId);
  };

  const handleAcceptBid = async (bidId: string) => {
    try {
      await bidService.updateBidAcceptance(bidId, true);
      toast.success('Bid accepted successfully!');
      loadBids();
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept bid');
    }
  };

  const handleUndoAcceptBid = async (bidId: string) => {
    try {
      await bidService.updateBidAcceptance(bidId, false);
      toast.success('Bid acceptance undone');
      loadBids();
    } catch (error: any) {
      toast.error(error.message || 'Failed to undo accept');
    }
  };

  const handleRejectBid = async (bidId: string) => {
    try {
      await bidService.updateBidDecline(bidId, true);
      toast.success('Bid rejected');
      loadBids();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject bid');
    }
  };

  const handleUndoRejectBid = async (bidId: string) => {
    try {
      await bidService.updateBidDecline(bidId, false);
      toast.success('Bid rejection undone');
      loadBids();
    } catch (error: any) {
      toast.error(error.message || 'Failed to undo reject');
    }
  };

  const handleShortlist = async (bidId: string) => {
    try {
      await bidService.updateBidShortlist(bidId, true);
      toast.success('Bid shortlisted');
      loadBids();
    } catch (error: any) {
      toast.error(error.message || 'Failed to shortlist bid');
    }
  };

  const handleDeleteBid = async (bidId: string) => {
    const bid = bids.find((b) => b.id === bidId);
    const label = bid?.projectTitle || bid?.project?.title || 'this bid';
    setDeleteTarget({ bidId, label });
    setDeleteDialogOpen(true);
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

  const stats = [
    {
      label: 'Total Bids',
      value: bids.length,
      icon: <FileText className="size-5" />,
      color: 'bg-blue-500',
    },
    {
      label: 'Pending Review',
      value: bids.filter(b => b.status === 'pending').length,
      icon: <Clock className="size-5" />,
      color: 'bg-yellow-500',
    },
    {
      label: 'Shortlisted',
      value: bids.filter(b => b.status === 'shortlisted').length,
      icon: <Users className="size-5" />,
      color: 'bg-blue-500',
    },
    {
      label: 'Accepted',
      value: bids.filter(b => b.status === 'accepted').length,
      icon: <CheckCircle2 className="size-5" />,
      color: 'bg-green-500',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DeleteWithReasonDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Bid"
          description={
            deleteTarget
              ? `Provide a reason to delete ${deleteTarget.label}. This will be tracked in activity logs.`
              : 'Provide a reason for deletion. This will be tracked in activity logs.'
          }
          onConfirm={async (reason) => {
            if (!deleteTarget) return;
            try {
              await bidService.deleteBid(deleteTarget.bidId, reason);
              toast.success('Bid deleted');
              await loadBids();
            } catch (error: any) {
              toast.error(error?.response?.data?.message || error.message || 'Failed to delete bid');
              throw error;
            } finally {
              setDeleteTarget(null);
            }
          }}
        />
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl">Bid Management</h1>
            <p className="text-gray-600 mt-1">Review and manage all bids across projects</p>
          </div>
          <Button onClick={() => navigate('/admin/bids/create')}>
            <Plus className="size-4 mr-2" />
            Create Bid
          </Button>
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
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-gray-500" />
              <label className="text-sm">Filters:</label>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="under_review">Under Review</option>
            </select>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search projects..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </div>
        </div>

        {/* Bids List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading bids...</p>
            </div>
          ) : filteredBids.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <FileText className="size-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg mb-2">No bids found</h3>
              <p className="text-gray-600">
                {statusFilter !== 'all' || projectSearch.trim() !== ''
                  ? 'Try adjusting your filters'
                  : 'No bids have been submitted yet'}
              </p>
            </div>
          ) : (
            filteredBids
              .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
              .map((bid) => {
                const project = getProject(bid.projectId);
                const projectTitle = bid.projectTitle || bid.project?.title || 'Unknown Project';
                const bidderName = bid.bidderName || bid.bidder?.name || 'Unknown';
                const bidderRating = bid.bidder?.rating;
                const bidderCompletedProjects = bid.bidder?.completedProjects;

                return (
                  <div key={bid.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl">{projectTitle}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(bid.status)}`}>
                            {bid.status.replace('_', ' ')}
                          </span>
                          {bid.isShortlisted && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                              Shortlisted
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Users className="size-4" />
                            <span>{bidderName}</span>
                            {bidderRating && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="flex items-center gap-1">
                                  ⭐ {bidderRating.toFixed(1)}
                                  {bidderCompletedProjects !== undefined && ` (${bidderCompletedProjects} projects)`}
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
                        {bid.timeline && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="size-4" />
                            <span>Timeline: {bid.timeline}</span>
                          </div>
                        )}
                        {/* Freelancer Proposals Count */}
                        {biddingsCount.has(bid.id) && (
                          <div className="flex items-center gap-2 text-sm text-blue-600 mt-2">
                            <Users className="size-4" />
                            <span>
                              {biddingsCount.get(bid.id)} Freelancer Proposal{biddingsCount.get(bid.id) !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm text-gray-500">Bid Amount</div>
                        <div className="text-2xl">${bid.bidAmount.toLocaleString()}</div>
                        {bid.timeline && (
                          <div className="text-sm text-gray-500 mt-1">
                            <Clock className="size-3 inline mr-1" />
                            {bid.timeline}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                      {/* View Proposals Button */}
                      {biddingsCount.has(bid.id) && biddingsCount.get(bid.id)! > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          asChild
                        >
                          <Link to={`/admin/bids/${bid.id}`}>
                            <Users className="size-4 mr-2" />
                            View Proposals ({biddingsCount.get(bid.id)})
                          </Link>
                        </Button>
                      )}
                      {bid.status === 'pending' || bid.status === 'under_review' ? (
                        <>
                          <Button size="sm" onClick={() => handleAcceptBid(bid.id)}>
                            <CheckCircle2 className="size-4 mr-2" />
                            Accept
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleShortlist(bid.id)}
                          >
                            <Users className="size-4 mr-2" />
                            Shortlist
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRejectBid(bid.id)}
                          >
                            <XCircle className="size-4 mr-2" />
                            Reject
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
                        </>
                      ) : bid.status === 'accepted' ? (
                        <Button variant="outline" size="sm" onClick={() => handleUndoAcceptBid(bid.id)}>
                          <XCircle className="size-4 mr-2" />
                          Undo Accept
                        </Button>
                      ) : bid.status === 'rejected' ? (
                        <Button variant="outline" size="sm" onClick={() => handleUndoRejectBid(bid.id)}>
                          <XCircle className="size-4 mr-2" />
                          Undo Reject
                        </Button>
                      ) : null}
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/admin/bids/${bid.id}`}>
                          <FileText className="size-4 mr-2" />
                          View Details
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteBid(bid.id)}
                      >
                        <Trash2 className="size-4 mr-2" />
                        Delete
                      </Button>
                      {bid.bidderId && (
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/admin/users/${bid.bidderId}/freelancer`}>
                            <Users className="size-4 mr-2" />
                            View Profile
                          </Link>
                        </Button>
                      )}
                      {bid.projectId && (
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/admin/projects/${bid.projectId}/review`}>
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
      </div>
    </DashboardLayout>
  );
}
