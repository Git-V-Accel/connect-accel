import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { 
  Users, Briefcase, TrendingUp, IndianRupee, 
  Clock, CheckCircle, AlertTriangle, UserPlus,
  MessageSquare, Calendar, Target, Award
} from 'lucide-react';

export default function AgentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, bids, consultations, getProjectsByAgent, getBidsByAgent } = useData();
  
  const agentProjects = getProjectsByAgent(user?.id || '');
  const agentBids = getBidsByAgent(user?.id || '');
  
  // Calculate metrics
  const activeProjects = agentProjects.filter(p => p.status === 'in_progress').length;
  const pendingReview = projects.filter(p => p.status === 'pending_review').length;
  const inBidding = agentProjects.filter(p => p.status === 'in_bidding').length;
  const completedProjects = agentProjects.filter(p => p.status === 'completed').length;
  
  const totalRevenue = agentProjects
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.margin || 0), 0);
  
  const pendingBids = agentBids.filter(b => b.status === 'pending').length;
  const shortlistedBids = agentBids.filter(b => b.status === 'shortlisted').length;
  
  const upcomingConsultations = consultations.filter(
    c => c.admin_id === user?.id && c.status === 'scheduled'
  ).length;

  // Recent activities
  const recentProjects = agentProjects
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  const activeBids = agentBids
    .filter(b => b.status === 'pending' || b.status === 'shortlisted')
    .slice(0, 5);

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl mb-2">Agent Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/agent/projects')}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Active Projects</span>
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl mb-1">{activeProjects}</p>
            <p className="text-sm text-blue-600">Managing now</p>
          </div>

          <div className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/agent/projects')}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Pending Review</span>
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl mb-1">{pendingReview}</p>
            <p className="text-sm text-yellow-600">Need attention</p>
          </div>

          <div className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/agent/bids')}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">In Bidding</span>
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl mb-1">{inBidding}</p>
            <p className="text-sm text-purple-600">{pendingBids + shortlistedBids} active bids</p>
          </div>

          <div className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Revenue Generated</span>
              <IndianRupee className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl mb-1">₹{(totalRevenue / 1000).toFixed(0)}K</p>
            <p className="text-sm text-green-600">{completedProjects} completed</p>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-900">Active Clients</span>
            </div>
            <p className="text-2xl text-blue-900">{new Set(agentProjects.map(p => p.client_id)).size}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <UserPlus className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-purple-900">Freelancers Assigned</span>
            </div>
            <p className="text-2xl text-purple-900">
              {new Set(agentProjects.filter(p => p.freelancer_id).map(p => p.freelancer_id)).size}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-900">Consultations</span>
            </div>
            <p className="text-2xl text-green-900">{upcomingConsultations}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-orange-900">Success Rate</span>
            </div>
            <p className="text-2xl text-orange-900">
              {agentProjects.length > 0 ? Math.round((completedProjects / agentProjects.length) * 100) : 0}%
            </p>
          </div>
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
                        <p className="font-medium text-sm">₹{project.client_budget.toLocaleString()}</p>
                        {project.margin && (
                          <p className="text-xs text-green-600">+₹{project.margin.toLocaleString()}</p>
                        )}
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
                activeBids.map((bid) => {
                  const project = projects.find(p => p.id === bid.project_id);
                  return (
                    <div
                      key={bid.id}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => navigate(`/agent/projects/${bid.project_id}/bids`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{project?.title}</h3>
                          <p className="text-sm text-gray-600">{bid.freelancer_name}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          bid.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {bid.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Bid Amount:</span>
                        <span className="font-medium">₹{bid.amount.toLocaleString()}</span>
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
                <p className="text-xs text-gray-600">{pendingReview} pending</p>
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
                <p className="text-xs text-gray-600">{upcomingConsultations} upcoming</p>
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
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Project Completion Rate</span>
                  <span className="font-medium">
                    {agentProjects.length > 0 ? Math.round((completedProjects / agentProjects.length) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ 
                      width: `${agentProjects.length > 0 ? Math.round((completedProjects / agentProjects.length) * 100) : 0}%` 
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Bid Success Rate</span>
                  <span className="font-medium">
                    {agentBids.length > 0 
                      ? Math.round((agentBids.filter(b => b.status === 'accepted').length / agentBids.length) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ 
                      width: `${agentBids.length > 0 
                        ? Math.round((agentBids.filter(b => b.status === 'accepted').length / agentBids.length) * 100)
                        : 0}%` 
                    }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Revenue Generated</span>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-2xl font-medium text-green-600">₹{totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-600 mt-1">From {completedProjects} completed projects</p>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Average Margin</span>
                  <IndianRupee className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-2xl font-medium text-purple-600">
                  {completedProjects > 0 ? Math.round((totalRevenue / completedProjects)) : 0}₹
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
