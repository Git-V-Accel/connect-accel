import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Mail,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Send
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function BidInvitations() {
  const { bidInvitations, projects, updateBidInvitation } = useData();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Get invitations for this freelancer
  const myInvitations = bidInvitations.filter(i => i.freelancer_id === user?.id);

  const filteredInvitations = myInvitations.filter(invitation => {
    if (statusFilter === 'all') return true;
    return invitation.status === statusFilter;
  });

  const getProject = (projectId: string) => {
    return projects.find(p => p.id === projectId);
  };

  const handleAcceptInvitation = (invitationId: string, projectId: string) => {
    updateBidInvitation(invitationId, { 
      status: 'accepted',
      responded_at: new Date().toISOString()
    });
    toast.success('Invitation accepted! You can now submit your bid.');
  };

  const handleDeclineInvitation = (invitationId: string) => {
    updateBidInvitation(invitationId, { 
      status: 'declined',
      responded_at: new Date().toISOString()
    });
    toast.success('Invitation declined');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'accepted': 'bg-green-100 text-green-700',
      'declined': 'bg-red-100 text-red-700',
      'expired': 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const stats = [
    {
      label: 'Total Invitations',
      value: myInvitations.length,
      icon: <Mail className="size-5" />,
      color: 'bg-blue-500',
    },
    {
      label: 'Pending',
      value: myInvitations.filter(i => i.status === 'pending').length,
      icon: <Clock className="size-5" />,
      color: 'bg-yellow-500',
    },
    {
      label: 'Accepted',
      value: myInvitations.filter(i => i.status === 'accepted').length,
      icon: <CheckCircle2 className="size-5" />,
      color: 'bg-green-500',
    },
    {
      label: 'Declined',
      value: myInvitations.filter(i => i.status === 'declined').length,
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
            <h1 className="text-3xl">Bid Invitations</h1>
            <p className="text-gray-600 mt-1">Invitations to submit bids on projects</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/freelancer/projects">
              <Eye className="size-4 mr-2" />
              Browse All Projects
            </Link>
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
          <div className="flex items-center gap-4">
            <label className="text-sm">Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Invitations List */}
        <div className="space-y-4">
          {filteredInvitations.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Mail className="size-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg mb-2">No invitations found</h3>
              <p className="text-gray-600">
                {statusFilter === 'all' 
                  ? "You haven't received any bid invitations yet." 
                  : `No ${statusFilter} invitations.`}
              </p>
            </div>
          ) : (
            filteredInvitations
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((invitation) => {
                const project = getProject(invitation.project_id);
                if (!project) return null;

                const isExpired = new Date(invitation.deadline) < new Date();
                const daysLeft = Math.ceil((new Date(invitation.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <div key={invitation.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl">{project.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(invitation.status)}`}>
                            {invitation.status}
                          </span>
                          {isExpired && invitation.status === 'pending' && (
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                              Expired
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{project.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Mail className="size-4" />
                            <span>Invited by {invitation.invited_by_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="size-4" />
                            <span>Sent {new Date(invitation.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {invitation.message && (
                          <div className="p-4 bg-blue-50 rounded-lg mb-3">
                            <p className="text-sm text-gray-700">{invitation.message}</p>
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm text-gray-500">Budget Range</div>
                        <div className="text-xl">
                          ${invitation.budget_min.toLocaleString()} - ${invitation.budget_max.toLocaleString()}
                        </div>
                        {invitation.status === 'pending' && !isExpired && (
                          <div className="text-sm text-gray-500 mt-2">
                            <Clock className="size-4 inline mr-1" />
                            {daysLeft} days left
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                      {invitation.status === 'pending' && !isExpired && (
                        <>
                          <Button 
                            asChild 
                            size="sm"
                            onClick={() => handleAcceptInvitation(invitation.id, project.id)}
                          >
                            <Link to={`/freelancer/projects/${project.id}/detail`}>
                              <Send className="size-4 mr-2" />
                              Submit Bid
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeclineInvitation(invitation.id)}
                          >
                            <XCircle className="size-4 mr-2" />
                            Decline
                          </Button>
                        </>
                      )}
                      {invitation.status === 'accepted' && (
                        <Button asChild size="sm">
                          <Link to={`/freelancer/projects/${project.id}/detail`}>
                            <Send className="size-4 mr-2" />
                            Submit Bid
                          </Link>
                        </Button>
                      )}
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/freelancer/projects/${project.id}/detail`}>
                          <Eye className="size-4 mr-2" />
                          View Project
                        </Link>
                      </Button>
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
