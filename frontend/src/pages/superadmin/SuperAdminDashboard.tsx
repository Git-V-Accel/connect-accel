
import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import DashboardSkeleton from '../../components/shared/DashboardSkeleton';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Clock,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  FileText,
  TrendingUp,
  IndianRupee,
  Users,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { label: 'Pending Review', value: '2', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  { label: 'In Bidding', value: '4', icon: Briefcase, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { label: 'Active Projects', value: '4', icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50' },
  { label: 'Open Disputes', value: '4', icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
  { label: 'Total Projects', value: '17', icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { label: 'Total Bids', value: '16', icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { label: 'Total Revenue', value: '₹425,000', icon: IndianRupee, color: 'text-green-600', bgColor: 'bg-green-50' },
  { label: 'Consultations', value: '2', icon: Users, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
];

const recentProjects = [
  { id: 1, title: 'Social Media Dashboard', client: 'Marketing Pro Agency', amount: '₹180,000', date: '28/11/2025', status: 'PENDING REVIEW', statusColor: 'bg-yellow-100 text-yellow-700' },
  { id: 2, title: 'Mobile App MVP - Fitness Tracker', client: 'FitTech Solutions', amount: '₹200,000', date: '20/11/2025', status: 'IN BIDDING', statusColor: 'bg-blue-100 text-blue-700' },
  { id: 3, title: 'API Integration Project', client: 'StartupXYZ', amount: '', date: '', status: 'IN PROGRESS', statusColor: 'bg-green-100 text-green-700' },
];

const pendingActions = [
  { title: 'Review Bids', description: '8 new bids', icon: ArrowRight, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { title: 'Resolve Disputes', description: '4 open', icon: ArrowRight, color: 'text-red-600', bgColor: 'bg-red-50' },
];

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Super Admin Dashboard</h1>
          <p className="text-gray-500 font-medium">Manage projects, freelancers, and platform operations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="p-4 border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-medium mt-1 text-gray-900">{stat.value}</p>
                </div>
                <stat.icon className={`size-8 ${stat.color.replace('text-', 'text-')}`} />
              </div>
            </Card>
          ))}
        </div>

        {/* Action Required Banner */}
        <div className="text-card-foreground flex items-start justify-between rounded-xl border p-6 bg-yellow-50 border-yellow-200">
          <div className="space-y-1">
            <h3 className="text-lg text-gray-900 font-semibold">Action Required</h3>
            <p className="text-gray-700 font-medium">2 projects waiting for review</p>
          </div>
          <Button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3">
            Review Now
          </Button>
        </div>

        {/* Bottom Section */}
        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <Card className="p-6 rounded-xl border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Recent Projects</h3>
              <Link to="/admin/projects">
                <Button variant="ghost" size="sm" className="h-8 rounded-md gap-1.5 px-3">
                  View All <ArrowRight className="size-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {recentProjects.map((project) => (
                <Link key={project.id} to={`/admin/projects/${project.id}/review`}>
                  <div className="p-4 border rounded-lg hover:border-blue-500 transition-colors cursor-pointer bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{project.title}</h4>
                        <p className="text-sm text-gray-600">Client: {project.client}</p>
                      </div>
                      <Badge variant="secondary" className={`${project.statusColor} border-0 px-2 py-0.5 text-xs font-medium`}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{project.amount}</span>
                      <span>{project.date}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Pending Actions */}
          <Card className="p-6 rounded-xl border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Pending Actions</h3>
            </div>

            <div className="space-y-3">
              {pendingActions.map((action, index) => {
                const isDispute = action.title.includes('Disputes');
                const content = (
                  <div
                    className={`p-4 border rounded-lg transition-colors ${isDispute
                      ? 'bg-red-50 border-red-200 hover:bg-red-100 cursor-pointer'
                      : 'bg-purple-50 border-purple-200'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{action.title}</p>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                      <action.icon className={`${action.color} size-5`} />
                    </div>
                  </div>
                );

                return isDispute ? (
                  <Link key={index} to="/admin/disputes">{content}</Link>
                ) : (
                  <div key={index}>{content}</div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
