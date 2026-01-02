import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import DashboardSkeleton from '../../components/shared/DashboardSkeleton';
import { StatCard } from '../../components/shared/StatCard';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import ApproveProjectDialog from '../../components/shared/ApproveProjectDialog';
import RejectProjectDialog from '../../components/shared/RejectProjectDialog';
import AssignAgentDialog from '../../components/shared/AssignAgentDialog';
import ProjectActionButton from '../../components/shared/ProjectActionButton';
import { useDashboard } from '../../hooks/useDashboard';
import { formatCurrency } from '../../utils/format';
import { useState, useEffect } from 'react';
import { listAgents } from '../../services/userService';
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

export default function SuperAdminDashboard() {
  const { loading, error, dashboard } = useDashboard();
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isAssignAgentDialogOpen, setIsAssignAgentDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [agents, setAgents] = useState<any[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);

  // Fetch agents data
  useEffect(() => {
    const fetchAgents = async () => {
      setAgentsLoading(true);
      try {
        const agentsData = await listAgents();
        setAgents(agentsData);
      } catch (error) {
        console.error('Failed to fetch agents:', error);
        // Fallback to mock data if API fails
        setAgents([
          { id: '1', name: 'John Doe', userID: 'JD001' },
          { id: '2', name: 'Jane Smith', userID: 'JS002' },
          { id: '3', name: 'Mike Johnson', userID: 'MJ003' },
        ]);
      } finally {
        setAgentsLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const handleApproveProject = () => {
    console.log('Approving project:', selectedProject);
    setIsApproveDialogOpen(false);
    setSelectedProject(null);
  };

  const handleRejectProject = () => {
    console.log('Rejecting project:', selectedProject, 'Reason:', rejectionReason);
    setIsRejectDialogOpen(false);
    setSelectedProject(null);
    setRejectionReason('');
  };

  const handleAssignAgent = () => {
    console.log('Assigning agent:', selectedAgentId, 'to project:', selectedProject);
    setIsAssignAgentDialogOpen(false);
    setSelectedProject(null);
    setSelectedAgentId('');
  };

  const openApproveDialog = (project: any) => {
    setSelectedProject(project);
    setIsApproveDialogOpen(true);
  };

  const openRejectDialog = (project: any) => {
    setSelectedProject(project);
    setIsRejectDialogOpen(true);
  };

  const openAssignAgentDialog = (project: any) => {
    setSelectedProject(project);
    setIsAssignAgentDialogOpen(true);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !dashboard || dashboard.role !== 'superadmin') {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <p className="text-red-600">{error || 'Failed to load dashboard data'}</p>
        </div>
      </DashboardLayout>
    );
  }

  const { stats, recentProjects } = dashboard.data;

  const statsConfig = [
    { label: 'Pending Review', value: stats.pendingReview.toString(), icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50', link: '/admin/projects?status=pending' },
    { label: 'In Bidding', value: stats.inBidding.toString(), icon: Briefcase, color: 'text-blue-600', bgColor: 'bg-blue-50', link: '/admin/projects?status=bidding' },
    { label: 'Active Projects', value: stats.activeProjects.toString(), icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50', link: '/admin/projects?status=active' },
    { label: 'Open Disputes', value: stats.openDisputes.toString(), icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-50', link: '/admin/disputes' },
    { label: 'Total Projects', value: stats.totalProjects.toString(), icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-50', link: '/admin/projects' },
    { label: 'Total Bids', value: stats.totalBids.toString(), icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-50', link: '/admin/bids' },
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: IndianRupee, color: 'text-green-600', bgColor: 'bg-green-50', link: '/admin/revenue' },
    { label: 'Consultations', value: stats.consultations.toString(), icon: Users, color: 'text-cyan-600', bgColor: 'bg-cyan-50', link: '/admin/consultations' },
  ];

  const pendingProjects = recentProjects.filter(project => project.status === 'pending_review');

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-700';
      case 'in_progress':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-2 animate-in fade-in duration-500">
        {/* Header */}
        {/* <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Super Admin Dashboard</h1>
          <p className="text-gray-500 font-medium">Manage projects, freelancers, and platform operations</p>
        </div> */}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsConfig.map((stat, index) => (
            <StatCard
              key={index}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              bgColor={stat.bgColor}
              link={stat.link}
            />
          ))}
        </div>

        {/* Action Required Banner */}
        <div className="text-card-foreground flex items-start justify-between rounded-xl border p-4 bg-yellow-50 border-yellow-200">
          <div className="space-y-1">
            <h3 className="text-lg text-gray-900 font-semibold">Action Required</h3>
            <p className="text-gray-700 font-medium">{pendingProjects.length} projects waiting for review</p>
          </div>
          <Button 
            onClick={() => window.location.href = '/admin/projects?status=pending'}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3"
          >
            Review Now
          </Button>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
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

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentProjects.slice(0, 8).map((project) => (
                <Link key={project.id} to={`/admin/projects/${project.id}/review`}>
                  <div className="p-4 border rounded-lg hover:border-blue-500 transition-colors cursor-pointer bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{project.title}</h4>
                        <p className="text-sm text-gray-600">Client: {project.client}</p>
                      </div>
                      <Badge variant="secondary" className={`${getStatusColor(project.status)} border-0 px-2 py-0.5 text-xs font-medium`}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{project.amount ? formatCurrency(parseFloat(project.amount.replace(/[^0-9.]/g, ''))) : 'Budget not specified'}</span>
                      <span>{project.date}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Project Review Queue */}
          <Card className="p-6 rounded-xl border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="size-5 text-gray-600" />
                <h3 className="text-lg font-medium">Project Review Queue</h3>
              </div>
              {pendingProjects.length > 0 && (
                <Badge variant="outline">{pendingProjects.length} pending</Badge>
              )}
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {pendingProjects.length === 0 ? (
                <div className="p-8 text-center text-gray-600">
                  <p>No projects pending review</p>
                </div>
              ) : (
                pendingProjects.map(project => (
                  <div key={project.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{project.title}</h4>
                        <p className="text-sm text-gray-600">Client: {project.client}</p>
                        <p className="text-sm text-gray-600">Budget: {project.amount ? formatCurrency(parseFloat(project.amount.replace(/[^0-9.]/g, ''))) : 'Not specified'}</p>
                      </div>
                      <Badge variant="secondary" className={`${getStatusColor(project.status)} border-0 px-2 py-0.5 text-xs font-medium`}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <ProjectActionButton 
                        onClick={() => openApproveDialog(project)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </ProjectActionButton>
                      <ProjectActionButton 
                        onClick={() => openRejectDialog(project)}
                        variant="outline"
                      >
                        Reject
                      </ProjectActionButton>
                      <ProjectActionButton 
                        onClick={() => openAssignAgentDialog(project)}
                        variant="outline"
                      >
                        Assign Agent
                      </ProjectActionButton>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
      
      {/* Dialog Components */}
      <ApproveProjectDialog
        isOpen={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
        onApprove={handleApproveProject}
      />
      
      <RejectProjectDialog
        isOpen={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
        onReject={handleRejectProject}
        rejectionReason={rejectionReason}
        onReasonChange={setRejectionReason}
      />
      
      <AssignAgentDialog
        isOpen={isAssignAgentDialogOpen}
        onOpenChange={setIsAssignAgentDialogOpen}
        onAssign={handleAssignAgent}
        agents={agents}
        selectedAgentId={selectedAgentId}
        onAgentSelect={setSelectedAgentId}
        isEditingAgent={false}
        validationError={agentsLoading ? "Loading agents..." : undefined}
        isLoading={agentsLoading}
      />
    </DashboardLayout>
  );
}
