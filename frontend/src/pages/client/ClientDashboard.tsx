import DashboardLayout from '../../components/shared/DashboardLayout';
import { StatCard } from '../../components/shared/StatCard';
import { ActivityItem } from '../../components/shared/ActivityItem';
import { PageHeader } from '../../components/shared/PageHeader';
import { DashboardBanner } from '../../components/shared/DashboardBanner';
import { PendingActions } from '../../components/shared/PendingActions';
import DashboardSkeleton from '../../components/shared/DashboardSkeleton';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Link } from 'react-router-dom';
import { Plus, FolderKanban, CheckCircle, Clock, IndianRupee, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboard } from '../../hooks/useDashboard';
import { formatCurrency } from '../../utils/format';

export default function ClientDashboard() {
  const { user } = useAuth();
  const { loading, error, dashboard } = useDashboard();

  if (!user) return null;

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !dashboard || dashboard.role !== 'client') {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <p className="text-red-600">{error || 'Failed to load dashboard data'}</p>
        </div>
      </DashboardLayout>
    );
  }

  const { stats, activeProjects, pendingActions, recentActivity } = dashboard.data;

  const statsConfig = [
    { label: 'Active Projects', value: stats.activeProjects.toString(), icon: FolderKanban, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Pending Approvals', value: stats.pendingApprovals.toString(), icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'Upcoming Deadlines', value: stats.upcomingDeadlines.toString(), icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { label: 'Total Spent', value: formatCurrency(stats.totalSpent), icon: IndianRupee, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  ];

  const getStatusColor = (statusKey: string) => {
    switch (statusKey.toLowerCase()) {
      case 'in_progress':
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'assigned':
        return 'bg-green-100 text-green-700';
      case 'in_bidding':
      case 'in-bidding':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-purple-100 text-purple-700';
      case 'cancelled':
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
          description="Welcome back! Here's what's happening with your projects."
          actionLabel="New Project"
          actionIcon={<Plus className="w-5 h-5" />}
          actionLink="/client/projects/new"
        />

        <DashboardBanner />

        {/* Stats */}
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

        {/* Pending Actions */}
        <PendingActions />

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Active Projects */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg">Active Projects</h3>
              <Link to="/client/projects">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="size-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {activeProjects.length > 0 ? (
                activeProjects.map((project) => (
                  <Link key={project.id} to={`/client/projects/${project.id}`}>
                    <div className="border rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{project.name}</h4>
                          <p className="text-sm text-gray-500">Freelancer: {project.freelancer}</p>
                        </div>
                        <Badge className={getStatusColor(project.statusKey)}>
                          {project.status}
                        </Badge>
                      </div>
                      {project.progress > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">Due: {project.dueDate}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-2">No active projects</p>
                  <Link to="/client/projects/new">
                    <Button size="sm" variant="outline">Create your first project</Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    text={activity.text}
                    time={activity.time}
                    type={activity.type}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
