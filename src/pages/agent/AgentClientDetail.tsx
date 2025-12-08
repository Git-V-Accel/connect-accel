import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FolderKanban,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  MessageSquare,
  Eye,
  FileText
} from 'lucide-react';

export default function AgentClientDetail() {
  const { id } = useParams();
  const { clients, projects, consultations } = useData();
  const { user } = useAuth();
  
  const client = clients.find(c => c.id === id);
  const clientProjects = client ? projects.filter(p => p.client_id === client.id && p.assigned_agent_id === user?.id) : [];
  const clientConsultations = client ? consultations.filter(c => c.client_id === client.id && c.agent_id === user?.id) : [];

  if (!client) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl mb-4">Client not found</h2>
          <Button asChild>
            <Link to="/agent/clients">
              <ArrowLeft className="size-4 mr-2" />
              Back to Clients
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const totalSpent = clientProjects
    .filter(p => ['in_progress', 'completed'].includes(p.status))
    .reduce((sum, p) => sum + p.budget, 0);
  
  const activeProjects = clientProjects.filter(p => ['open', 'in_progress'].includes(p.status));
  const completedProjects = clientProjects.filter(p => p.status === 'completed');
  const totalRevenue = clientProjects.reduce((sum, p) => {
    const margin = p.agent_margin_percentage || 0;
    return sum + (p.budget * margin / 100);
  }, 0);

  const stats = [
    {
      label: 'Total Projects',
      value: clientProjects.length,
      icon: <FolderKanban className="size-5" />,
      color: 'bg-blue-500',
    },
    {
      label: 'Active Projects',
      value: activeProjects.length,
      icon: <TrendingUp className="size-5" />,
      color: 'bg-purple-500',
    },
    {
      label: 'Completed',
      value: completedProjects.length,
      icon: <CheckCircle2 className="size-5" />,
      color: 'bg-green-500',
    },
    {
      label: 'Total Spent',
      value: `$${totalSpent.toLocaleString()}`,
      icon: <DollarSign className="size-5" />,
      color: 'bg-emerald-500',
    },
  ];

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline">
              <Link to="/agent/clients">
                <ArrowLeft className="size-4 mr-2" />
                Back
              </Link>
            </Button>
            <div className="flex items-center gap-4">
              <div className="size-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl">
                {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl">{client.name}</h1>
                <p className="text-gray-600 mt-1">{client.company || 'Individual Client'}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Calendar className="size-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Member since {new Date(client.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link to={`/messages?client=${client.id}`}>
                <MessageSquare className="size-4 mr-2" />
                Message
              </Link>
            </Button>
            <Button asChild>
              <Link to={`/agent/consultations?client=${client.id}`}>
                <Calendar className="size-4 mr-2" />
                Schedule Consultation
              </Link>
            </Button>
          </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Projects */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl">Projects</h2>
                <span className="text-sm text-gray-500">{clientProjects.length} total</span>
              </div>
              <div className="space-y-4">
                {clientProjects.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No projects yet</p>
                ) : (
                  clientProjects.map((project) => {
                    const margin = project.agent_margin_percentage || 0;
                    const revenue = project.budget * margin / 100;
                    
                    return (
                      <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg">{project.title}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
                                {project.status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="size-4" />
                                <span>{new Date(project.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-sm text-gray-500">Budget</div>
                            <div className="text-xl">${project.budget.toLocaleString()}</div>
                            {margin > 0 && (
                              <div className="text-sm text-purple-600 mt-1">
                                Revenue: ${revenue.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/agent/projects/${project.id}`}>
                              <Eye className="size-4 mr-2" />
                              View Details
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/agent/projects/${project.id}/bids`}>
                              <FileText className="size-4 mr-2" />
                              Manage Bids
                            </Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Consultations History */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl">Consultations</h2>
                <span className="text-sm text-gray-500">{clientConsultations.length} total</span>
              </div>
              <div className="space-y-3">
                {clientConsultations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No consultations yet</p>
                ) : (
                  clientConsultations
                    .sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime())
                    .slice(0, 5)
                    .map((consultation) => (
                      <div key={consultation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-sm mb-1">
                            {new Date(consultation.scheduled_date).toLocaleDateString()} at{' '}
                            {new Date(consultation.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs capitalize text-gray-600">{consultation.type.replace('_', ' ')}</span>
                            <span className="text-xs">•</span>
                            <span className="text-xs text-gray-600">{consultation.duration} min</span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          consultation.status === 'completed' ? 'bg-green-100 text-green-700' :
                          consultation.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {consultation.status}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="size-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="size-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="text-sm">{client.email}</div>
                  </div>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-3">
                    <div className="size-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Phone className="size-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Phone</div>
                      <div className="text-sm">{client.phone}</div>
                    </div>
                  </div>
                )}
                {client.location && (
                  <div className="flex items-center gap-3">
                    <div className="size-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MapPin className="size-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Location</div>
                      <div className="text-sm">{client.location}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Revenue Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg mb-4">Revenue Summary</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Revenue</span>
                  <span className="text-sm">${totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Project Value</span>
                  <span className="text-sm">
                    ${clientProjects.length > 0 
                      ? Math.round(totalSpent / clientProjects.length).toLocaleString() 
                      : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="text-sm">
                    {clientProjects.length > 0 
                      ? Math.round((completedProjects.length / clientProjects.length) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Button asChild variant="outline" size="sm" className="w-full justify-start">
                  <Link to={`/agent/consultations?client=${client.id}`}>
                    <Calendar className="size-4 mr-2" />
                    Schedule Consultation
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full justify-start">
                  <Link to={`/messages?client=${client.id}`}>
                    <MessageSquare className="size-4 mr-2" />
                    Send Message
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full justify-start">
                  <Link to="/agent/projects">
                    <FolderKanban className="size-4 mr-2" />
                    View All Projects
                  </Link>
                </Button>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {clientProjects.length === 0 && clientConsultations.length === 0 ? (
                  <p className="text-gray-500 text-center py-4 text-sm">No activity yet</p>
                ) : (
                  <>
                    {clientProjects.slice(0, 3).map((project) => (
                      <div key={project.id} className="flex items-start gap-3">
                        <div className="size-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FolderKanban className="size-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm">{project.title}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(project.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
