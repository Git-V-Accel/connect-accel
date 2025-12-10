import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  Filter, 
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Eye,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AgentProjects() {
  const { projects, clients, bids } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter projects assigned to this agent
  const agentProjects = projects.filter(p => p.assigned_agent_id === user?.id);

  const filteredProjects = agentProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-700',
      'pending_review': 'bg-yellow-100 text-yellow-700',
      'open': 'bg-blue-100 text-blue-700',
      'in_progress': 'bg-purple-100 text-purple-700',
      'completed': 'bg-green-100 text-green-700',
      'cancelled': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="size-4" />;
      case 'in_progress':
        return <TrendingUp className="size-4" />;
      case 'completed':
        return <CheckCircle2 className="size-4" />;
      case 'pending_review':
        return <AlertCircle className="size-4" />;
      default:
        return <FileText className="size-4" />;
    }
  };

  const getProjectBids = (projectId: string) => {
    return bids.filter(b => b.project_id === projectId);
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Unknown Client';
  };

  const stats = [
    {
      label: 'Total Projects',
      value: agentProjects.length,
      icon: <FileText className="size-5" />,
      color: 'bg-blue-500',
    },
    {
      label: 'Active Projects',
      value: agentProjects.filter(p => ['open', 'in_progress'].includes(p.status)).length,
      icon: <TrendingUp className="size-5" />,
      color: 'bg-purple-500',
    },
    {
      label: 'Completed',
      value: agentProjects.filter(p => p.status === 'completed').length,
      icon: <CheckCircle2 className="size-5" />,
      color: 'bg-green-500',
    },
    {
      label: 'Total Value',
      value: `$${agentProjects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}`,
      icon: <DollarSign className="size-5" />,
      color: 'bg-emerald-500',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl">My Projects</h1>
            <p className="text-gray-600 mt-1">Manage and track your assigned projects</p>
          </div>
          <Button asChild>
            <Link to="/agent/clients">
              <Users className="size-4 mr-2" />
              View Clients
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} text-white p-3 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending_review">Pending Review</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <FileText className="size-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg mb-2">No projects found</h3>
              <p className="text-gray-600">No projects match your current filters.</p>
            </div>
          ) : (
            filteredProjects.map((project) => {
              const projectBids = getProjectBids(project.id);
              const margin = project.agent_margin_percentage || 0;
              const clientBudget = project.budget;
              const freelancerBudget = clientBudget * (1 - margin / 100);
              
              return (
                <div key={project.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl">{project.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(project.status)}`}>
                          {getStatusIcon(project.status)}
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{project.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="size-4" />
                          <span>{getClientName(project.client_id)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="size-4" />
                          <span>Posted {new Date(project.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="size-4" />
                          <span>{projectBids.length} bids</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm text-gray-500">Client Budget</div>
                      <div className="text-2xl">${clientBudget.toLocaleString()}</div>
                      {margin > 0 && (
                        <>
                          <div className="text-sm text-gray-500 mt-2">Margin: {margin}%</div>
                          <div className="text-sm text-purple-600">Freelancer: ${freelancerBudget.toLocaleString()}</div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/agent/projects/${project.id}`}>
                        <Eye className="size-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/agent/projects/${project.id}/bids`}>
                        <FileText className="size-4 mr-2" />
                        Manage Bids ({projectBids.length})
                      </Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link to={`/agent/bids/create?project=${project.id}`}>
                        <Users className="size-4 mr-2" />
                        Invite Freelancers
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
