import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import DashboardSkeleton from '../../components/shared/DashboardSkeleton';
import { StatCard } from '../../components/shared/StatCard';
import { PageHeader } from '../../components/shared/PageHeader';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboard } from '../../hooks/useDashboard';
import { formatCurrency } from '../../utils/format';
import { Briefcase, Clock, IndianRupee, Star, TrendingUp, ArrowRight, Search } from 'lucide-react';

export default function FreelancerDashboard() {
  const { user } = useAuth();
  const { loading, error, dashboard } = useDashboard();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !dashboard || dashboard.role !== 'freelancer') {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <p className="text-red-600">{error || 'Failed to load dashboard data'}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) return null;

  const { stats, activeProjects, recentBids } = dashboard.data;

  const statsConfig = [
    { label: 'Active Projects', value: stats.activeProjects.toString(), icon: Briefcase, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Pending Bids', value: stats.pendingBids.toString(), icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { label: 'Total Earnings', value: formatCurrency(stats.earnings), icon: IndianRupee, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'Available Projects', value: stats.availableProjects.toString(), icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in_progress':
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'assigned':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'shortlisted':
        return 'bg-purple-100 text-purple-700';
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Welcome back! Here's your freelance overview"
          actionLabel="Browse Projects"
          actionIcon={Search}
          actionLink="/freelancer/projects"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsConfig.map((stat, index) => (
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

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Active Projects</h3>
              <Link to="/freelancer/active-projects">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="size-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {activeProjects.slice(0, 3).map(project => (
                <div key={project.id} className="p-4 border rounded-lg hover:border-blue-500 transition-colors">
                  <h4 className="font-medium mb-1">{project.title}</h4>
                  <p className="text-sm text-gray-600">Client: {project.client_name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-600">{project.freelancer_budget ? formatCurrency(project.freelancer_budget) : 'Budget not specified'}</span>
                    <Badge variant="secondary" className={getStatusColor(project.status)}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
              {activeProjects.length === 0 && (
                <p className="text-center text-gray-600 py-8">No active projects</p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Recent Bids</h3>
              <Link to="/freelancer/bids">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="size-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {recentBids.slice(0, 3).map(bid => {
                const project = bid.project_title ? { title: bid.project_title } : null;
                return (
                  <div key={bid.id} className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-1">{project?.title || bid.project_title || 'Unknown Project'}</h4>
                    <p className="text-sm text-gray-600">Your bid: {formatCurrency(bid.amount)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-600">{new Date(bid.created_at).toLocaleDateString()}</span>
                      <Badge variant={bid.status === 'shortlisted' ? 'default' : 'secondary'} className={getStatusColor(bid.status)}>
                        {bid.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                );
              })}
              {recentBids.length === 0 && (
                <p className="text-center text-gray-600 py-8">No bids yet</p>
              )}
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium mb-2">New Projects Available</h3>
              <p className="text-gray-600 mb-4">
                {stats.availableProjects} projects are currently open for bidding. Browse and submit your proposals now!
              </p>
              <Link to="/freelancer/projects">
                <Button>
                  <Search className="size-4 mr-2" />
                  Browse Projects
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
