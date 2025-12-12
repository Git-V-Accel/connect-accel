import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { StatCard } from '../../components/shared/StatCard';
import { PageHeader } from '../../components/shared/PageHeader';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Briefcase, Clock, IndianRupee, Star, TrendingUp, ArrowRight, Search } from 'lucide-react';

export default function FreelancerDashboard() {
  const { user } = useAuth();
  const { getProjectsByUser, getBidsByFreelancer, getPaymentsByUser, projects } = useData();

  if (!user) return null;

  const myProjects = getProjectsByUser(user.id, user.role);
  const myBids = getBidsByFreelancer(user.id);
  const payments = getPaymentsByUser(user.id);

  const activeProjects = myProjects.filter(p => p.status === 'in_progress');
  const activeBids = myBids.filter(b => b.status === 'pending' || b.status === 'shortlisted');
  const earnings = payments.filter(p => p.to_user_id === user.id && p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const availableProjects = projects.filter(p => p.status === 'in_bidding').length;

  const stats = [
    { label: 'Active Projects', value: activeProjects.length.toString(), icon: Briefcase, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Pending Bids', value: activeBids.length.toString(), icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { label: 'Total Earnings', value: `₹${earnings.toLocaleString()}`, icon: IndianRupee, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'Available Projects', value: availableProjects.toString(), icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  ];

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
                    <span className="text-sm text-gray-600">₹{project.freelancer_budget?.toLocaleString()}</span>
                    <Badge variant="secondary">{project.status.replace('_', ' ')}</Badge>
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
              {myBids.slice(0, 3).map(bid => {
                const project = projects.find(p => p.id === bid.project_id);
                return (
                  <div key={bid.id} className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-1">{project?.title || 'Unknown Project'}</h4>
                    <p className="text-sm text-gray-600">Your bid: ₹{bid.amount.toLocaleString()}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-600">{new Date(bid.created_at).toLocaleDateString()}</span>
                      <Badge variant={bid.status === 'shortlisted' ? 'default' : 'secondary'}>
                        {bid.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                );
              })}
              {myBids.length === 0 && (
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
                {availableProjects} projects are currently open for bidding. Browse and submit your proposals now!
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
