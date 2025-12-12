import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { StatCard } from '../../components/shared/StatCard';
import { ActivityItem } from '../../components/shared/ActivityItem';
import { PageHeader } from '../../components/shared/PageHeader';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Link } from 'react-router-dom';
import { Plus, FolderKanban, CheckCircle, Clock, IndianRupee, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { statusLabels, statusColors } from '../../constants/projectConstants';

export default function ClientDashboard() {
  const { user } = useAuth();
  const { projects, getProjectsByUser, getMilestonesByProject, payments } = useData();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait a bit for projects to load from backend
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [projects]);

  if (!user) return null;

  const allProjects = getProjectsByUser(user.id, user.role);
  
  // Calculate stats from real data
  const activeProjectsCount = allProjects.filter(p => p.status === 'in_progress' || p.status === 'assigned').length;
  const pendingApprovals = allProjects.reduce((count, project) => {
    const milestones = getMilestonesByProject(project.id);
    const pendingMilestones = milestones.filter(m => m.status === 'submitted').length;
    return count + pendingMilestones;
  }, 0);
  
  // Calculate upcoming deadlines (projects with end_date in next 7 days)
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingDeadlines = allProjects.filter(p => {
    if (!p.end_date) return false;
    const endDate = new Date(p.end_date);
    return endDate >= now && endDate <= nextWeek;
  }).length;

  // Calculate total spent from payments
  const totalSpent = payments
    .filter(p => p.user_id === user.id && p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    { label: 'Active Projects', value: activeProjectsCount.toString(), icon: <FolderKanban className="size-5" />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Pending Approvals', value: pendingApprovals.toString(), icon: <CheckCircle className="size-5" />, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'Upcoming Deadlines', value: upcomingDeadlines.toString(), icon: <Clock className="size-5" />, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { label: 'Total Spent', value: `₹${(totalSpent / 100000).toFixed(1)}L`, icon: <IndianRupee className="size-5" />, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  ];

  // Get active projects (in_progress or assigned)
  const activeProjects = allProjects
    .filter(p => p.status === 'in_progress' || p.status === 'assigned' || p.status === 'in_bidding')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)
    .map(project => {
      const milestones = getMilestonesByProject(project.id);
      const completedMilestones = milestones.filter(m => m.status === 'approved' || m.status === 'paid').length;
      const progress = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;
      
      return {
        id: project.id,
        name: project.title,
        status: statusLabels[project.status] || project.status,
        statusKey: project.status,
        progress,
        freelancer: project.freelancer_name || 'Pending',
        dueDate: project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A',
      };
    });

  // Recent activity - empty for now as there's no activity feed in DataContext
  const recentActivity: Array<{ id: number; text: string; time: string; type: string }> = [];

  // Pending actions - check for milestones that need approval
  const pendingActions = allProjects
    .flatMap(project => {
      const milestones = getMilestonesByProject(project.id);
      const pendingMilestones = milestones.filter(m => m.status === 'submitted');
      return pendingMilestones.map(milestone => ({
        id: `${project.id}-${milestone.id}`,
        text: `Review milestone "${milestone.title}" for ${project.title}`,
        action: 'Review Now',
        link: `/client/projects/${project.id}`,
      }));
    })
    .slice(0, 3);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <PageHeader
            title="Dashboard"
            description="Welcome back! Here's what's happening with your projects."
            actionLabel="New Project"
            actionIcon={Plus}
            actionLink="/client/projects/new"
          />
          <div className="text-center py-12">
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Welcome back! Here's what's happening with your projects."
          actionLabel="New Project"
          actionIcon={Plus}
          actionLink="/client/projects/new"
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
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
        {pendingActions.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg mb-4">Pending Actions</h3>
            <div className="space-y-3">
              {pendingActions.map((action) => (
                <div key={action.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <span className="text-sm">{action.text}</span>
                  <Link to={action.link}>
                    <Button size="sm" variant="outline">{action.action}</Button>
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        )}

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
                        <Badge className={statusColors[project.statusKey] || 'bg-gray-100 text-gray-700'}>
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
