import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  IndianRupee,
  TrendingUp,
  Users,
  FolderKanban,
  Calendar,
  CheckCircle2,
  Clock,
  Star,
  Award,
  Target,
  BarChart3,
  Download,
  FileText
} from 'lucide-react';

export default function AgentReports() {
  const { projects, clients, consultations, bids, freelancers, bidInvitations } = useData();
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<string>('30days');

  // Filter data for this agent
  const agentProjects = projects.filter(p => p.assigned_agent_id === user?.id);
  const agentClientIds = Array.from(new Set(agentProjects.map(p => p.client_id)));
  const agentClients = clients.filter(c => agentClientIds.includes(c.id));
  const agentConsultations = consultations.filter(c => c.agent_id === user?.id);
  const agentBidInvitations = bidInvitations.filter(bi => {
    const project = projects.find(p => p.id === bi.project_id);
    return project?.assigned_agent_id === user?.id;
  });

  // Calculate revenue metrics
  const totalRevenue = agentProjects.reduce((sum, p) => {
    const margin = p.agent_margin_percentage || 0;
    return sum + (p.budget * margin / 100);
  }, 0);

  const activeProjectsRevenue = agentProjects
    .filter(p => ['in_progress', 'open'].includes(p.status))
    .reduce((sum, p) => {
      const margin = p.agent_margin_percentage || 0;
      return sum + (p.budget * margin / 100);
    }, 0);

  const completedProjectsRevenue = agentProjects
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => {
      const margin = p.agent_margin_percentage || 0;
      return sum + (p.budget * margin / 100);
    }, 0);

  const avgMargin = agentProjects.length > 0
    ? agentProjects.reduce((sum, p) => sum + (p.agent_margin_percentage || 0), 0) / agentProjects.length
    : 0;

  const avgProjectValue = agentProjects.length > 0
    ? agentProjects.reduce((sum, p) => sum + p.budget, 0) / agentProjects.length
    : 0;

  // Performance metrics
  const completionRate = agentProjects.length > 0
    ? (agentProjects.filter(p => p.status === 'completed').length / agentProjects.length) * 100
    : 0;

  const consultationCompletionRate = agentConsultations.length > 0
    ? (agentConsultations.filter(c => c.status === 'completed').length / agentConsultations.length) * 100
    : 0;

  const invitationAcceptanceRate = agentBidInvitations.length > 0
    ? (agentBidInvitations.filter(bi => bi.status === 'accepted').length / agentBidInvitations.length) * 100
    : 0;

  // Client metrics
  const avgClientProjects = agentClients.length > 0
    ? agentProjects.length / agentClients.length
    : 0;

  const topClients = agentClients
    .map(client => {
      const clientProjects = agentProjects.filter(p => p.client_id === client.id);
      const totalSpent = clientProjects.reduce((sum, p) => sum + p.budget, 0);
      return { ...client, projectCount: clientProjects.length, totalSpent };
    })
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  // Project pipeline
  const projectsByStatus = {
    draft: agentProjects.filter(p => p.status === 'draft').length,
    pending_review: agentProjects.filter(p => p.status === 'pending_review').length,
    open: agentProjects.filter(p => p.status === 'open').length,
    in_progress: agentProjects.filter(p => p.status === 'in_progress').length,
    completed: agentProjects.filter(p => p.status === 'completed').length,
    cancelled: agentProjects.filter(p => p.status === 'cancelled').length,
  };

  // Freelancer metrics
  const topFreelancers = freelancers
    .map(freelancer => {
      const freelancerBids = bids.filter(b => 
        b.freelancer_id === freelancer.id && 
        agentProjects.some(p => p.id === b.project_id)
      );
      const acceptedBids = freelancerBids.filter(b => b.status === 'accepted');
      return {
        ...freelancer,
        totalBids: freelancerBids.length,
        acceptedBids: acceptedBids.length,
        successRate: freelancerBids.length > 0 ? (acceptedBids.length / freelancerBids.length) * 100 : 0
      };
    })
    .filter(f => f.totalBids > 0)
    .sort((a, b) => b.acceptedBids - a.acceptedBids)
    .slice(0, 5);

  const stats = [
    {
      label: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      icon: <IndianRupee className="size-5" />,
      color: 'bg-green-500',
      change: '+12.5%',
    },
    {
      label: 'Active Projects',
      value: agentProjects.filter(p => ['open', 'in_progress'].includes(p.status)).length,
      icon: <FolderKanban className="size-5" />,
      color: 'bg-blue-500',
      change: '+3',
    },
    {
      label: 'Total Clients',
      value: agentClients.length,
      icon: <Users className="size-5" />,
      color: 'bg-purple-500',
      change: '+2',
    },
    {
      label: 'Avg Margin',
      value: `${avgMargin.toFixed(1)}%`,
      icon: <TrendingUp className="size-5" />,
      color: 'bg-orange-500',
      change: '+0.8%',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Performance insights and key metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="year">This year</option>
              <option value="all">All time</option>
            </select>
            <Button variant="outline">
              <Download className="size-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className={`${stat.color} text-white p-3 rounded-lg`}>
                  {stat.icon}
                </div>
                <span className="text-sm text-green-600">{stat.change}</span>
              </div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl mb-4">Revenue Breakdown</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600">Completed Projects</div>
                  <div className="text-2xl">${completedProjectsRevenue.toLocaleString()}</div>
                </div>
                <CheckCircle2 className="size-8 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600">Active Projects</div>
                  <div className="text-2xl">${activeProjectsRevenue.toLocaleString()}</div>
                </div>
                <Clock className="size-8 text-blue-600" />
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600">Avg Project Value</div>
                  <div className="text-2xl">${avgProjectValue.toLocaleString()}</div>
                </div>
                <Target className="size-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl mb-4">Performance Metrics</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Project Completion Rate</span>
                  <span className="text-sm">{completionRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Consultation Completion</span>
                  <span className="text-sm">{consultationCompletionRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${consultationCompletionRate}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Invitation Acceptance Rate</span>
                  <span className="text-sm">{invitationAcceptanceRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${invitationAcceptanceRate}%` }}
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Projects per Client</span>
                  <span className="text-lg">{avgClientProjects.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Project Pipeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl mb-4">Project Pipeline</h2>
            <div className="space-y-3">
              {Object.entries(projectsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`size-3 rounded-full ${
                      status === 'completed' ? 'bg-green-500' :
                      status === 'in_progress' ? 'bg-blue-500' :
                      status === 'open' ? 'bg-purple-500' :
                      status === 'pending_review' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`} />
                    <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                  </div>
                  <span className="text-sm">{count} projects</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Clients */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl mb-4">Top Clients</h2>
            <div className="space-y-3">
              {topClients.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No clients yet</p>
              ) : (
                topClients.map((client, index) => (
                  <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="size-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-sm">{client.name}</div>
                        <div className="text-xs text-gray-500">{client.projectCount} projects</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">${client.totalSpent.toLocaleString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Freelancers */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 lg:col-span-2">
            <h2 className="text-xl mb-4">Top Performing Freelancers</h2>
            <div className="space-y-3">
              {topFreelancers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No freelancer data yet</p>
              ) : (
                topFreelancers.map((freelancer) => (
                  <div key={freelancer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="size-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                        {freelancer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm">{freelancer.name}</div>
                        <div className="text-xs text-gray-500">{freelancer.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="size-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs">{freelancer.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{freelancer.acceptedBids} accepted</div>
                      <div className="text-xs text-gray-500">{freelancer.successRate.toFixed(0)}% success rate</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 lg:col-span-2">
            <h2 className="text-xl mb-4">Recent Activity Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="size-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Bids This Month</span>
                </div>
                <div className="text-2xl">
                  {bids.filter(b => {
                    const bidDate = new Date(b.submitted_at);
                    const now = new Date();
                    return bidDate.getMonth() === now.getMonth() && 
                           bidDate.getFullYear() === now.getFullYear() &&
                           agentProjects.some(p => p.id === b.project_id);
                  }).length}
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="size-5 text-purple-600" />
                  <span className="text-sm text-gray-600">Consultations</span>
                </div>
                <div className="text-2xl">{agentConsultations.length}</div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="size-5 text-green-600" />
                  <span className="text-sm text-gray-600">Success Score</span>
                </div>
                <div className="text-2xl">{completionRate.toFixed(0)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
