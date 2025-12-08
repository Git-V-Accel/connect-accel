import DashboardLayout from '../../components/shared/DashboardLayout';
import { StatCard } from '../../components/shared/StatCard';
import { ActivityItem } from '../../components/shared/ActivityItem';
import { PageHeader } from '../../components/shared/PageHeader';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Link } from 'react-router-dom';
import { Plus, FolderKanban, CheckCircle, Clock, DollarSign, ArrowRight } from 'lucide-react';

export default function ClientDashboard() {
  const stats = [
    { label: 'Active Projects', value: '3', icon: <FolderKanban className="size-5" />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Pending Approvals', value: '2', icon: <CheckCircle className="size-5" />, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'Upcoming Deadlines', value: '5', icon: <Clock className="size-5" />, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { label: 'Total Spent', value: '₹2.4L', icon: <DollarSign className="size-5" />, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  ];

  const activeProjects = [
    { id: 1, name: 'E-commerce Website', status: 'In Progress', progress: 60, freelancer: 'Ravi Kumar', dueDate: '2025-12-15' },
    { id: 2, name: 'Mobile App MVP', status: 'In Bidding', progress: 0, freelancer: 'Pending', dueDate: '2025-12-20' },
    { id: 3, name: 'API Integration', status: 'In Progress', progress: 80, freelancer: 'Priya Singh', dueDate: '2025-11-30' },
  ];

  const recentActivity = [
    { id: 1, text: 'Freelancer submitted Milestone 2 for E-commerce Website', time: '2 hours ago', type: 'milestone' },
    { id: 2, text: 'Your project "Mobile App MVP" moved to bidding', time: 'Yesterday', type: 'status' },
    { id: 3, text: 'Admin Jane sent you a message', time: '2 days ago', type: 'message' },
    { id: 4, text: 'Payment of ₹15,000 released to Priya Singh', time: '3 days ago', type: 'payment' },
  ];

  const pendingActions = [
    { id: 1, text: 'Review milestone for E-commerce Website', action: 'Review Now', link: '/client/projects/1' },
    { id: 2, text: 'Complete your company profile', action: 'Complete', link: '/client/settings' },
  ];

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
              {activeProjects.map((project) => (
                <Link key={project.id} to={`/client/projects/${project.id}`}>
                  <div className="border rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{project.name}</h4>
                        <p className="text-sm text-gray-500">Freelancer: {project.freelancer}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        project.status === 'In Progress' ? 'bg-green-100 text-green-700' :
                        project.status === 'In Bidding' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {project.status}
                      </span>
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
              ))}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  text={activity.text}
                  time={activity.time}
                  type={activity.type}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
