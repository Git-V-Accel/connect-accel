import React from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { useData } from '../../contexts/DataContext';
import { 
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users,
  Send,
  Eye,
  Edit
} from 'lucide-react';

export default function AgentProjectDetail() {
  const { id } = useParams();
  const { projects, clients, bids, freelancers, bidInvitations, milestones } = useData();
  
  const project = projects.find(p => p.id === id);
  const client = project ? clients.find(c => c.id === project.client_id) : null;
  const projectBids = project ? bids.filter(b => b.project_id === project.id) : [];
  const projectInvitations = project ? bidInvitations.filter(bi => bi.project_id === project.id) : [];
  const projectMilestones = project ? milestones.filter(m => m.project_id === project.id) : [];

  if (!project || !client) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl mb-4">Project not found</h2>
          <Button asChild>
            <Link to="/agent/projects">
              <ArrowLeft className="size-4 mr-2" />
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const margin = project.agent_margin_percentage || 0;
  const clientBudget = project.budget;
  const freelancerBudget = clientBudget * (1 - margin / 100);
  const agentRevenue = clientBudget - freelancerBudget;

  const acceptedBid = projectBids.find(b => b.status === 'accepted');
  const assignedFreelancer = acceptedBid ? freelancers.find(f => f.id === acceptedBid.freelancer_id) : null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-700',
      'pending_review': 'bg-yellow-100 text-yellow-700',
      'open': 'bg-blue-100 text-blue-700',
      'in_progress': 'bg-purple-100 text-purple-700',
      'completed': 'bg-green-100 text-green-700',
      'cancelled': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const stats = [
    {
      label: 'Total Bids',
      value: projectBids.length,
      icon: <FileText className="size-5" />,
      color: 'bg-blue-500',
    },
    {
      label: 'Pending Bids',
      value: projectBids.filter(b => b.status === 'pending').length,
      icon: <Clock className="size-5" />,
      color: 'bg-yellow-500',
    },
    {
      label: 'Invitations Sent',
      value: projectInvitations.length,
      icon: <Send className="size-5" />,
      color: 'bg-purple-500',
    },
    {
      label: 'Agent Revenue',
      value: `$${agentRevenue.toLocaleString()}`,
      icon: <DollarSign className="size-5" />,
      color: 'bg-green-500',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline">
              <Link to="/agent/projects">
                <ArrowLeft className="size-4 mr-2" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl">{project.title}</h1>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${getStatusColor(project.status)}`}>
                {project.status.replace('_', ' ')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link to={`/agent/projects/${project.id}/bids`}>
                <FileText className="size-4 mr-2" />
                Manage Bids
              </Link>
            </Button>
            <Button asChild>
              <Link to={`/agent/bids/create?project=${project.id}`}>
                <Send className="size-4 mr-2" />
                Invite Freelancers
              </Link>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl mb-4">Project Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm mb-2">Description</h3>
                  <p className="text-gray-600">{project.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm text-gray-500">Client Budget</h3>
                    <p className="text-xl mt-1">${clientBudget.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500">Freelancer Budget</h3>
                    <p className="text-xl mt-1">${freelancerBudget.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500">Agent Margin</h3>
                    <p className="text-xl mt-1">{margin}%</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500">Agent Revenue</h3>
                    <p className="text-xl mt-1 text-green-600">${agentRevenue.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm mb-2">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.skills_required.map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm mb-2">Timeline</h3>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="size-4" />
                    <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Freelancer */}
            {assignedFreelancer && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl mb-4">Assigned Freelancer</h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl">
                      {assignedFreelancer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg">{assignedFreelancer.name}</h3>
                      <p className="text-sm text-gray-600">{assignedFreelancer.title}</p>
                      <p className="text-sm text-gray-500 mt-1">Bid: ${acceptedBid?.amount.toLocaleString()}</p>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/agent/freelancers/${assignedFreelancer.id}`}>
                      <Eye className="size-4 mr-2" />
                      View Profile
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Milestones */}
            {projectMilestones.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl mb-4">Milestones</h2>
                <div className="space-y-3">
                  {projectMilestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`size-8 rounded-full flex items-center justify-center ${
                          milestone.status === 'paid' || milestone.status === 'approved' ? 'bg-green-500' :
                          milestone.status === 'in_progress' ? 'bg-blue-500' :
                          'bg-gray-300'
                        }`}>
                          {milestone.status === 'paid' || milestone.status === 'approved' ? (
                            <CheckCircle2 className="size-5 text-white" />
                          ) : (
                            <Clock className="size-5 text-white" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm">{milestone.title}</h4>
                          <p className="text-xs text-gray-500">{milestone.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">${milestone.amount.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 capitalize">{milestone.status.replace('_', ' ')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg mb-4">Client Information</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="size-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white">
                  {client.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm">{client.name}</h3>
                  <p className="text-xs text-gray-600">{client.email}</p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to={`/agent/clients/${client.id}`}>
                  <Eye className="size-4 mr-2" />
                  View Client Profile
                </Link>
              </Button>
            </div>

            {/* Recent Bids */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg">Recent Bids</h2>
                <span className="text-sm text-gray-500">{projectBids.length} total</span>
              </div>
              <div className="space-y-3">
                {projectBids.slice(0, 5).map((bid) => {
                  const freelancer = freelancers.find(f => f.id === bid.freelancer_id);
                  return (
                    <div key={bid.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-sm">{freelancer?.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{bid.status.replace('_', ' ')}</div>
                      </div>
                      <div className="text-sm">${bid.amount.toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
              {projectBids.length > 5 && (
                <Button asChild variant="outline" size="sm" className="w-full mt-3">
                  <Link to={`/agent/projects/${project.id}/bids`}>
                    View All Bids
                  </Link>
                </Button>
              )}
            </div>

            {/* Pending Invitations */}
            {projectInvitations.filter(i => i.status === 'pending').length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg">Pending Invitations</h2>
                  <span className="text-sm text-gray-500">
                    {projectInvitations.filter(i => i.status === 'pending').length}
                  </span>
                </div>
                <div className="space-y-2">
                  {projectInvitations
                    .filter(i => i.status === 'pending')
                    .slice(0, 3)
                    .map((invitation) => {
                      const freelancer = freelancers.find(f => f.id === invitation.freelancer_id);
                      return (
                        <div key={invitation.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                          <div className="text-sm">{freelancer?.name}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(invitation.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
