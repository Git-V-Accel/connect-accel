import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import DashboardSkeleton from '../../components/shared/DashboardSkeleton';
import { StatCard } from '../../components/shared/StatCard';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useDashboard } from '../../hooks/useDashboard';
import { formatCurrency } from '../../utils/format';
import ApproveProjectDialog from '../../components/shared/ApproveProjectDialog';
import RejectProjectDialog from '../../components/shared/RejectProjectDialog';
import AssignAgentDialog from '../../components/shared/AssignAgentDialog';
import ProjectActionButton from '../../components/shared/ProjectActionButton';
import { useState, useEffect } from 'react';
import { listAgents } from '../../services/userService';
import { updateProject } from '../../services/projectService';
import { toast } from '../../utils/toast';
import {
    Briefcase,
    Clock,
    CheckCircle2,
    ArrowRight,
} from 'lucide-react';

export default function AdminDashboard() {
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

    const handleApproveProject = async () => {
        if (!selectedProject) return;
        
        try {
            await updateProject(selectedProject.id, {
                status: 'in_bidding'
            });
            toast.success(`Project "${selectedProject.title}" approved successfully!`);
            setIsApproveDialogOpen(false);
            setSelectedProject(null);
            // Optionally refresh dashboard data
            window.location.reload();
        } catch (error) {
            console.error('Failed to approve project:', error);
            toast.error('Failed to approve project. Please try again.');
        }
    };

    const handleRejectProject = async () => {
        if (!selectedProject || !rejectionReason) return;
        
        try {
            await updateProject(selectedProject.id, {
                status: 'cancelled',
                rejectionReason: rejectionReason
            });
            toast.success(`Project "${selectedProject.title}" rejected successfully!`);
            setIsRejectDialogOpen(false);
            setSelectedProject(null);
            setRejectionReason('');
            // Optionally refresh dashboard data
            window.location.reload();
        } catch (error) {
            console.error('Failed to reject project:', error);
            toast.error('Failed to reject project. Please try again.');
        }
    };

    const handleAssignAgent = async () => {
        if (!selectedProject || !selectedAgentId) return;
        
        try {
            await updateProject(selectedProject.id, {
                assignedAgentId: selectedAgentId,
                status: 'assigned'
            });
            const selectedAgent = agents.find(agent => agent.id === selectedAgentId);
            toast.success(`Agent "${selectedAgent?.name}" assigned to project "${selectedProject.title}" successfully!`);
            setIsAssignAgentDialogOpen(false);
            setSelectedProject(null);
            setSelectedAgentId('');
            // Optionally refresh dashboard data
            window.location.reload();
        } catch (error) {
            console.error('Failed to assign agent:', error);
            toast.error('Failed to assign agent. Please try again.');
        }
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

    if (error || !dashboard || dashboard.role !== 'admin') {
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
        { label: 'Total Projects', value: stats.totalProjects.toString(), icon: CheckCircle2, color: 'text-purple-600', bgColor: 'bg-purple-50', link: '/admin/projects' },
        { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: ArrowRight, color: 'text-green-600', bgColor: 'bg-green-50', link: '/admin/revenue' },
        { label: 'Consultations', value: stats.consultations.toString(), icon: ArrowRight, color: 'text-cyan-600', bgColor: 'bg-cyan-50', link: '/admin/consultations' },
        { label: 'Total Bids', value: stats.totalBids.toString(), icon: ArrowRight, color: 'text-orange-600', bgColor: 'bg-orange-50', link: '/admin/bids' },
    ];

    const pendingProjects = recentProjects.filter(p => p.status === 'pending_review' || p.status === 'pending_review');

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'pending_review':
            case 'PENDING_REVIEW':
                return 'bg-yellow-100 text-yellow-700';
            case 'IN PROGRESS':
            case 'IN_PROGRESS':
                return 'bg-green-100 text-green-700';
            case 'COMPLETED':
                return 'bg-blue-100 text-blue-700';
            case 'CANCELLED':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };


    return (
        <DashboardLayout>
            <div className="space-y-2">
                {/* <PageHeader
                    title="Admin Dashboard"
                    description="Manage projects, freelancers, and platform operations"
                /> */}
  {/* <Card className="p-4">
                    <h3 className="text-lg font-medium mb-4">Quick Stats</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-sm text-gray-600">Total Projects</p>
                            <p className="text-2xl font-medium mt-1">{projects.length}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-medium mt-1">
                                ₹{projects.reduce((sum, p) => sum + (p.budget || p.client_budget || 0), 0).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Consultations</p>
                            <p className="text-2xl font-medium mt-1">{consultations.length}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Bids</p>
                            <p className="text-2xl font-medium mt-1">{bids.length}</p>
                        </div>
                    </div>
                </Card> */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

                {pendingProjects.length > 0 && (
                    <Card className="p-4 bg-yellow-50 border-yellow-200">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-medium text-lg mb-2">Action Required</h3>
                                <p className="text-gray-700">
                                    {pendingProjects.length} project{pendingProjects.length !== 1 ? 's' : ''} waiting for review
                                </p>
                            </div>
                            <Link to="/admin/projects?status=pending">
                                <Button>Review Now</Button>
                            </Link>
                        </div>
                    </Card>
                )}

                <div className="grid lg:grid-cols-2 gap-6">
                    <Card className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">Recent Projects</h3>
                            <Link to="/admin/projects">
                                <Button variant="ghost" size="sm">
                                    View All <ArrowRight className="size-4 ml-1" />
                                </Button>
                            </Link>
                        </div>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {recentProjects.slice(0, 8).map(project => (
                                <Link key={project.id} to={`/admin/projects/${project.id}/review`}>
                                    <div className="p-4 border rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <h4 className="font-medium">{project.title}</h4>
                                                <p className="text-sm text-gray-600">Client: {project.client_name}</p>
                                            </div>
                                            <Badge className={getStatusColor(project.status)}>
                                                {project.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-gray-600">
                                            <span>{project.client_budget ? formatCurrency(project.client_budget) : 'Budget not specified'}</span>
                                            <span>{new Date(project.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-4">
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
                                pendingProjects.slice(0, 3).map(project => (
                                    <div key={project.id} className="p-4 border rounded-lg">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h4 className="font-medium">{project.title}</h4>
                                                <p className="text-sm text-gray-600">Client: {project.client_name}</p>
                                                <p className="text-sm text-gray-600">Budget: {project.client_budget ? formatCurrency(project.client_budget) : 'Not specified'}</p>
                                            </div>
                                            <Badge className={getStatusColor(project.status)}>
                                                {project.status.replace('_', ' ')}
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
