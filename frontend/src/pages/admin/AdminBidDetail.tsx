import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { useData } from '../../contexts/DataContext';
import * as bidService from '../../services/bidService';
import type { Bid as ApiBid } from '../../services/bidService';
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
  MapPin
} from 'lucide-react';
import { toast } from '../../utils/toast';

export default function AdminBidDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bids, projects, freelancers, getProjectsByUser } = useData();
  const [apiBid, setApiBid] = useState<ApiBid | null>(null);
  const [loadingBid, setLoadingBid] = useState(false);

  const localBid = bids.find((b) => b.id === id);

  useEffect(() => {
    const load = async () => {
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
    load();
  }, [id, localBid]);

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
          <Button asChild>
            <Link to="/admin/bids">
              <ArrowLeft className="size-4 mr-2" />
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleAccept = async () => {
    try {
      await bidService.updateBidAcceptance(bid.id, true);
      toast.success('Bid accepted successfully!');
      navigate('/admin/bids');
    } catch (e: any) {
      toast.error(e.message || 'Failed to accept bid');
    }
  };

  const handleReject = async () => {
    try {
      await bidService.updateBidDecline(bid.id, true);
      toast.success('Bid rejected');
      navigate('/admin/bids');
    } catch (e: any) {
      toast.error(e.message || 'Failed to reject bid');
    }
  };

  const handleShortlist = async () => {
    try {
      await bidService.updateBidShortlist(bid.id, true);
      toast.success('Bid shortlisted');
    } catch (e: any) {
      toast.error(e.message || 'Failed to shortlist bid');
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
          <div className="lg:col-span-2 space-y-6">
            {/* Full Proposal */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl mb-6">Full Proposal</h2>
              
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
                  <h4 className="font-medium mb-3">Cover Letter</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{bid.proposal || bid.cover_letter || 'No proposal provided.'}</p>
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
                  {bid.milestones.map((milestone, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-sm mb-1">{milestone.title}</h3>
                          <p className="text-sm text-gray-600">{milestone.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm">${milestone.amount.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">{milestone.duration}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total:</span>
                      <span className="text-lg">
                        ${bid.milestones.reduce((sum, m) => sum + m.amount, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Notes */}
            {/* Admin Notes removed as requested */}

            {/* Actions */}
            {bid.status !== 'accepted' && bid.status !== 'rejected' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl mb-4">Actions</h2>
                <div className="flex items-center gap-3">
                  <Button onClick={handleAccept}>
                    <CheckCircle2 className="size-4 mr-2" />
                    Accept Bid
                  </Button>
                  {bid.status !== 'shortlisted' && (
                    <Button variant="outline" onClick={handleShortlist}>
                      <Star className="size-4 mr-2" />
                      Shortlist
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleReject}>
                    <XCircle className="size-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            )}
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
                  <div className="text-sm">${project.budget.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Category</div>
                  <div className="text-sm">{project.category}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Required Skills</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.skills_required.map(skill => (
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

            {/* Freelancer Info */}
            {freelancer && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg mb-4">Freelancer Profile</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg">
                      {freelancer.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm">{freelancer.name}</div>
                      <div className="text-xs text-gray-500">{freelancer.title}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Star className="size-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm">{freelancer.rating}</span>
                    <span className="text-sm text-gray-500">({freelancer.total_reviews} reviews)</span>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-2">Skills</div>
                    <div className="flex flex-wrap gap-1">
                      {freelancer.skills.slice(0, 6).map(skill => (
                        <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <IndianRupee className="size-4" />
                      <span>${freelancer.hourly_rate}/hr</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="size-4" />
                      <span className="capitalize">{freelancer.availability}</span>
                    </div>
                  </div>

                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to={`/admin/freelancers/${freelancer.id}`}>
                      <User className="size-4 mr-2" />
                      View Full Profile
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Comparison */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg mb-4">Budget Comparison</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Project Budget</span>
                  <span className="text-sm">${project.budget.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This Bid</span>
                  <span className="text-sm">${bid.amount.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Difference</span>
                    <span className={`text-sm ${bid.amount <= project.budget ? 'text-green-600' : 'text-red-600'}`}>
                      {bid.amount <= project.budget ? '-' : '+'}
                      ${Math.abs(project.budget - bid.amount).toLocaleString()}
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
