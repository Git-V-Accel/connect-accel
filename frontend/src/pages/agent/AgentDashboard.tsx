import { useNavigate } from 'react-router-dom';
import DashboardSkeleton from '../../components/shared/DashboardSkeleton';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboard } from '../../hooks/useDashboard';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { StatCard } from '../../components/shared/StatCard';
import { formatCurrency } from '../../utils/format';
import {
  Users, Briefcase, TrendingUp, IndianRupee,
  Clock, CheckCircle, AlertTriangle, UserPlus,
  MessageSquare, Calendar, Target, Award
} from 'lucide-react';

export default function AgentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, error, dashboard } = useDashboard();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !dashboard || dashboard.role !== 'agent') {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <p className="text-red-600">{error || 'Failed to load dashboard data'}</p>
        </div>
      </DashboardLayout>
    );
  }

  const { stats, recentProjects, activeBids } = dashboard.data;

  const mainStatsConfig = [
    { label: 'Active Projects', value: stats.activeProjects.toString(), icon: Briefcase, color: 'text-blue-600', bgColor: 'bg-blue-50', link: '/agent/projects' },
    { label: 'Pending Review', value: stats.pendingBids.toString(), icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50', link: '/agent/projects?status=pending' },
    { label: 'In Bidding', value: stats.shortlistedBids.toString(), icon: Target, color: 'text-purple-600', bgColor: 'bg-purple-50', link: '/agent/bids' },
    { label: 'Revenue Generated', value: formatCurrency(stats.totalRevenue), icon: IndianRupee, color: 'text-green-600', bgColor: 'bg-green-50' },
  ];

  const secondaryStatsConfig = [
    { label: 'Active Clients', value: stats.activeClients.toString(), icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Freelancers Assigned', value: stats.freelancersAssigned.toString(), icon: UserPlus, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { label: 'Consultations', value: stats.upcomingConsultations.toString(), icon: Calendar, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'Success Rate', value: `${stats.successRate}%`, icon: Award, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in_progress':
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'pending_review':
      case 'pending-review':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'assigned':
        return 'bg-purple-100 text-purple-700';
      case 'in_bidding':
      case 'in-bidding':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl mb-2">Agent Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {mainStatsConfig.map((stat, index) => (
            <StatCard
              key={index}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              bgColor={stat.bgColor}
              link={stat.link}
              onClick={() => stat.link && navigate(stat.link)}
            />
          ))}
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {secondaryStatsConfig.map((stat, index) => (
            <StatCard
              key={index}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              bgColor={stat.bgColor}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl">Your Recent Projects</h2>
              <button
                onClick={() => navigate('/agent/projects')}
                className="text-sm text-blue-600 hover:underline"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => navigate(`/agent/projects/${project.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{project.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span>{project.client_name}</span>
                          <span>•</span>
                          <span className="capitalize">{project.status.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{project.client_budget ? formatCurrency(project.client_budget) : 'Budget not specified'}</p>
                      </div>
                    </div>
                    {project.status === 'pending_review' && (
                      <div className="mt-2">
                        <button className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                          Action Required
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No projects assigned yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Active Bids */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl">Active Bids</h2>
              <button
                onClick={() => navigate('/agent/bids')}
                className="text-sm text-blue-600 hover:underline"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {activeBids.length > 0 ? (
                activeBids.map((bid: any) => {
                  return (
                    <div
                      key={bid.id}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => navigate(`/agent/projects/${bid.project_id}/bids`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{bid.project_title || 'Unknown Project'}</h3>
                          <p className="text-sm text-gray-600">{bid.freelancer_name}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(bid.status)}`}>
                          {bid.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Bid Amount:</span>
                        <span className="font-medium">{formatCurrency(bid.amount)}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No active bids</p>
                  <button
                    onClick={() => navigate('/agent/bids/create')}
                    className="mt-3 text-sm text-blue-600 hover:underline"
                  >
                    Create Bid Invitation
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/agent/projects')}
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors"
              >
                <Clock className="w-6 h-6 text-blue-600 mb-2" />
                <p className="text-sm font-medium">Review Projects</p>
                <p className="text-xs text-gray-600">{stats.pendingBids} pending</p>
              </button>

              <button
                onClick={() => navigate('/agent/bids')}
                className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors"
              >
                <Target className="w-6 h-6 text-purple-600 mb-2" />
                <p className="text-sm font-medium">Bid Management</p>
                <p className="text-xs text-gray-600">Manage bids</p>
              </button>

              <button
                onClick={() => navigate('/agent/freelancers')}
                className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors"
              >
                <Users className="w-6 h-6 text-green-600 mb-2" />
                <p className="text-sm font-medium">Browse Freelancers</p>
                <p className="text-xs text-gray-600">Find talent</p>
              </button>

              <button
                onClick={() => navigate('/agent/clients')}
                className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors"
              >
                <UserPlus className="w-6 h-6 text-orange-600 mb-2" />
                <p className="text-sm font-medium">Manage Clients</p>
                <p className="text-xs text-gray-600">View clients</p>
              </button>

              <button
                onClick={() => navigate('/agent/consultations')}
                className="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-left transition-colors"
              >
                <Calendar className="w-6 h-6 text-indigo-600 mb-2" />
                <p className="text-sm font-medium">Consultations</p>
                <p className="text-xs text-gray-600">{stats.upcomingConsultations} upcoming</p>
              </button>

              <button
                onClick={() => navigate('/messages')}
                className="p-4 bg-pink-50 hover:bg-pink-100 rounded-lg text-left transition-colors"
              >
                <MessageSquare className="w-6 h-6 text-pink-600 mb-2" />
                <p className="text-sm font-medium">Messages</p>
                <p className="text-xs text-gray-600">Chat with users</p>
              </button>
            </div>
          </div>

          {/* Performance Overview */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl mb-4">Performance Overview</h2>
            <div className="space-y-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Project Completion Rate</span>
                  <span className="font-medium">{stats.successRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${stats.successRate}%` }}
                  />
                </div>

                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Bid Success Rate</span>
                  <span className="font-medium">{stats.bidSuccessRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${stats.bidSuccessRate}%` }}
                  />
                </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Revenue Generated</span>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-2xl font-medium text-green-600">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-xs text-gray-600 mt-1">From {stats.completedProjects} completed projects</p>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Average Margin</span>
                  <IndianRupee className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-2xl font-medium text-purple-600">
                  {formatCurrency(stats.avgRevenuePerProject)}
                </p>
                <p className="text-xs text-gray-600 mt-1">Per project</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
