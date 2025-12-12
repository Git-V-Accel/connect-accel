import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  Filter, 
  User,
  FolderKanban,
  IndianRupee,
  Calendar,
  Eye,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  Clock,
  Mail,
  Phone
} from 'lucide-react';

export default function AgentClients() {
  const { projects, clients, consultations } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Get projects assigned to this agent
  const agentProjects = projects.filter(p => p.assigned_agent_id === user?.id);
  
  // Extract unique clients from agent's projects (using project's client data)
  const agentClientsMap = new Map<string, any>();
  agentProjects.forEach(project => {
    if (project.client_id && !agentClientsMap.has(project.client_id)) {
      // Create client object from project data (projects have populated client info)
      agentClientsMap.set(project.client_id, {
        id: project.client_id,
        name: project.client_name || 'Unknown Client',
        email: project.client_email || '',
        phone: project.client_phone || '',
        // Try to get additional info from local clients array if available
        ...(clients.find(c => c.id === project.client_id) || {})
      });
    }
  });
  
  // Convert map to array
  const agentClients = Array.from(agentClientsMap.values());

  const filteredClients = agentClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getClientProjects = (clientId: string) => {
    return agentProjects.filter(p => p.client_id === clientId);
  };

  const getClientConsultations = (clientId: string) => {
    return consultations.filter(c => c.client_id === clientId && c.agent_id === user?.id);
  };

  const getClientTotalSpent = (clientId: string) => {
    const clientProjects = getClientProjects(clientId);
    return clientProjects
      .filter(p => ['in_progress', 'completed'].includes(p.status))
      .reduce((sum, p) => sum + p.budget, 0);
  };

  const stats = [
    {
      label: 'Total Clients',
      value: agentClients.length,
      icon: <User className="size-5" />,
      color: 'bg-blue-500',
    },
    {
      label: 'Active Projects',
      value: agentProjects.filter(p => ['open', 'in_progress'].includes(p.status)).length,
      icon: <TrendingUp className="size-5" />,
      color: 'bg-purple-500',
    },
    {
      label: 'Total Revenue',
      value: `$${agentProjects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}`,
      icon: <IndianRupee className="size-5" />,
      color: 'bg-green-500',
    },
    {
      label: 'Consultations',
      value: consultations.filter(c => c.agent_id === user?.id).length,
      icon: <Calendar className="size-5" />,
      color: 'bg-orange-500',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl">My Clients</h1>
            <p className="text-gray-600 mt-1">Manage your client relationships and projects</p>
          </div>
          <Button asChild>
            <Link to="/agent/consultations">
              <Calendar className="size-4 mr-2" />
              View Consultations
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

        {/* Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
            <Input
              type="text"
              placeholder="Search clients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Clients List */}
        <div className="space-y-4">
          {filteredClients.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <User className="size-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg mb-2">No clients found</h3>
              <p className="text-gray-600">No clients match your search.</p>
            </div>
          ) : (
            filteredClients.map((client) => {
              const clientProjects = getClientProjects(client.id);
              const clientConsultations = getClientConsultations(client.id);
              const totalSpent = getClientTotalSpent(client.id);
              const activeProjects = clientProjects.filter(p => ['open', 'in_progress'].includes(p.status));
              const completedProjects = clientProjects.filter(p => p.status === 'completed');
              
              return (
                <div key={client.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="size-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl">
                        {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl">{client.name}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Mail className="size-4" />
                            <span>{client.email}</span>
                          </div>
                          {client.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="size-4" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Total Spent</div>
                      <div className="text-2xl">${totalSpent.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-4 gap-4 mb-4 py-4 border-y border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl text-blue-600">{clientProjects.length}</div>
                      <div className="text-xs text-gray-600 mt-1">Total Projects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl text-purple-600">{activeProjects.length}</div>
                      <div className="text-xs text-gray-600 mt-1">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl text-green-600">{completedProjects.length}</div>
                      <div className="text-xs text-gray-600 mt-1">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl text-orange-600">{clientConsultations.length}</div>
                      <div className="text-xs text-gray-600 mt-1">Consultations</div>
                    </div>
                  </div>

                  {/* Recent Projects */}
                  {clientProjects.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm mb-2">Recent Projects:</h4>
                      <div className="space-y-2">
                        {clientProjects.slice(0, 2).map((project) => (
                          <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FolderKanban className="size-4 text-gray-500" />
                              <div>
                                <div className="text-sm">{project.title}</div>
                                <div className="text-xs text-gray-500">{project.status.replace('_', ' ')}</div>
                              </div>
                            </div>
                            <div className="text-sm">${project.budget.toLocaleString()}</div>
                          </div>
                        ))}
                        {clientProjects.length > 2 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{clientProjects.length - 2} more projects
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/agent/clients/${client.id}`}>
                        <Eye className="size-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/messages?client=${client.id}`}>
                        <MessageSquare className="size-4 mr-2" />
                        Message
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
