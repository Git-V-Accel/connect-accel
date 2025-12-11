import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
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
  Plus
} from 'lucide-react';
import { toast } from '../../utils/toast';

export default function AgentBidManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, freelancers, bids, updateBid } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Get project if ID is provided
  const project = id ? projects.find(p => p.id === id) : null;

  // Get bids for agent's projects
  const agentProjects = projects.filter(p => p.assigned_agent_id === user?.id);
  const agentProjectIds = agentProjects.map(p => p.id);
  const agentBids = bids.filter(b => agentProjectIds.includes(b.project_id));

  // Filter to specific project if provided
  const relevantBids = project 
    ? agentBids.filter(b => b.project_id === project.id)
    : agentBids;

  const filteredBids = relevantBids.filter(bid => {
    const project = projects.find(p => p.id === bid.project_id);
    const freelancer = freelancers.find(f => f.id === bid.freelancer_id);
    const matchesSearch = 
      (freelancer?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (project?.title.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = statusFilter === 'all' || bid.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getFreelancerName = (freelancerId: string) => {
    return freelancers.find(f => f.id === freelancerId)?.name || 'Unknown';
  };

  const getProjectTitle = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.title || 'Unknown Project';
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

  const handleAcceptBid = (bidId: string) => {
    updateBid(bidId, { status: 'accepted' });
    toast.success('Bid accepted successfully!');
  };

  const handleRejectBid = (bidId: string) => {
    updateBid(bidId, { status: 'rejected' });
    toast.success('Bid rejected');
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
      value: relevantBids.filter(b => b.status === 'shortlisted').length,
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
        <div className="space-y-4">
          {filteredBids.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <FileText className="size-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg mb-2">No bids found</h3>
              <p className="text-gray-600">No bids match your current filters.</p>
            </div>
          ) : (
            filteredBids
              .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
              .map((bid) => {
                const freelancer = freelancers.find(f => f.id === bid.freelancer_id);
                const bidProject = projects.find(p => p.id === bid.project_id);
                
                return (
                  <div key={bid.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl">{!project ? getProjectTitle(bid.project_id) : getFreelancerName(bid.freelancer_id)}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(bid.status)}`}>
                            {bid.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <User className="size-4" />
                            <span>{getFreelancerName(bid.freelancer_id)}</span>
                            {freelancer && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="flex items-center gap-1">
                                  ⭐ {freelancer.rating || 'N/A'} ({freelancer.total_reviews || 0} reviews)
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="size-4" />
                            <span>Submitted {new Date(bid.submitted_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {bid.cover_letter && (
                          <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                            {bid.cover_letter}
                          </p>
                        )}
                        {bid.milestones && bid.milestones.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FileText className="size-4" />
                            <span>{bid.milestones.length} milestones proposed</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm text-gray-500">Bid Amount</div>
                        <div className="text-2xl">${bid.amount.toLocaleString()}</div>
                        {bid.estimated_duration && (
                          <div className="text-sm text-gray-500 mt-1">
                            <Clock className="size-3 inline mr-1" />
                            {bid.estimated_duration}
                          </div>
                        )}
                      </div>
                    </div>

                    {bid.milestones && bid.milestones.length > 0 && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm mb-2">Proposed Milestones:</h4>
                        <div className="space-y-2">
                          {bid.milestones.map((milestone, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span>{milestone.title}</span>
                              <span className="text-gray-600">${milestone.amount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
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
                      ) : null}
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/agent/freelancers/${bid.freelancer_id}`}>
                          <User className="size-4 mr-2" />
                          View Profile
                        </Link>
                      </Button>
                      {!project && (
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/agent/projects/${bid.project_id}`}>
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
