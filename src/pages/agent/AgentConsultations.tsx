import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  User,
  FileText,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function AgentConsultations() {
  const { consultations, clients, updateConsultation, createConsultation } = useData();
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    client_id: '',
    scheduled_date: '',
    duration: 60,
    type: 'video' as 'video' | 'phone' | 'in_person',
    notes: '',
  });

  // Filter consultations for this agent
  const agentConsultations = consultations.filter(c => c.agent_id === user?.id);

  const filteredConsultations = agentConsultations.filter(consultation => {
    if (statusFilter === 'all') return true;
    return consultation.status === statusFilter;
  });

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Unknown Client';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'scheduled': 'bg-blue-100 text-blue-700',
      'completed': 'bg-green-100 text-green-700',
      'cancelled': 'bg-red-100 text-red-700',
      'rescheduled': 'bg-yellow-100 text-yellow-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="size-4" />;
      case 'completed':
        return <CheckCircle2 className="size-4" />;
      case 'cancelled':
        return <XCircle className="size-4" />;
      case 'rescheduled':
        return <AlertCircle className="size-4" />;
      default:
        return <Calendar className="size-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="size-4" />;
      case 'phone':
        return <Phone className="size-4" />;
      case 'in_person':
        return <MapPin className="size-4" />;
      default:
        return <Calendar className="size-4" />;
    }
  };

  const handleCreateConsultation = () => {
    if (!formData.client_id || !formData.scheduled_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    createConsultation({
      client_id: formData.client_id,
      agent_id: user!.id,
      scheduled_date: formData.scheduled_date,
      duration: formData.duration,
      type: formData.type,
      status: 'scheduled',
      notes: formData.notes,
      outcome: null,
    });

    toast.success('Consultation scheduled successfully!');
    setShowCreateModal(false);
    setFormData({
      client_id: '',
      scheduled_date: '',
      duration: 60,
      type: 'video',
      notes: '',
    });
  };

  const stats = [
    {
      label: 'Total Consultations',
      value: agentConsultations.length,
      icon: <Calendar className="size-5" />,
      color: 'bg-blue-500',
    },
    {
      label: 'Scheduled',
      value: agentConsultations.filter(c => c.status === 'scheduled').length,
      icon: <Clock className="size-5" />,
      color: 'bg-purple-500',
    },
    {
      label: 'Completed',
      value: agentConsultations.filter(c => c.status === 'completed').length,
      icon: <CheckCircle2 className="size-5" />,
      color: 'bg-green-500',
    },
    {
      label: 'This Week',
      value: agentConsultations.filter(c => {
        const consultDate = new Date(c.scheduled_date);
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return consultDate >= now && consultDate <= weekFromNow;
      }).length,
      icon: <AlertCircle className="size-5" />,
      color: 'bg-orange-500',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl">Consultations</h1>
            <p className="text-gray-600 mt-1">Manage client consultations and discovery calls</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="size-4 mr-2" />
            Schedule Consultation
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
          <div className="flex items-center gap-4">
            <Label>Filter by Status:</Label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </div>
        </div>

        {/* Consultations List */}
        <div className="space-y-4">
          {filteredConsultations.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Calendar className="size-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg mb-2">No consultations found</h3>
              <p className="text-gray-600">Schedule a consultation to get started.</p>
            </div>
          ) : (
            filteredConsultations
              .sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime())
              .map((consultation) => (
                <div key={consultation.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="size-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                        <User className="size-6" />
                      </div>
                      <div>
                        <h3 className="text-lg">{getClientName(consultation.client_id)}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="size-4" />
                            <span>{new Date(consultation.scheduled_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="size-4" />
                            <span>{new Date(consultation.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {getTypeIcon(consultation.type)}
                            <span className="capitalize">{consultation.type.replace('_', ' ')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="size-4" />
                            <span>{consultation.duration} min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(consultation.status)}`}>
                      {getStatusIcon(consultation.status)}
                      {consultation.status}
                    </span>
                  </div>

                  {consultation.notes && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="size-4 text-gray-500" />
                        <span className="text-sm">Notes:</span>
                      </div>
                      <p className="text-sm text-gray-600">{consultation.notes}</p>
                    </div>
                  )}

                  {consultation.outcome && (
                    <div className="mb-4 p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="size-4 text-green-600" />
                        <span className="text-sm text-green-700">Outcome:</span>
                      </div>
                      <p className="text-sm text-gray-600">{consultation.outcome}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/consultation/${consultation.id}`}>
                        <FileText className="size-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                    {consultation.status === 'scheduled' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            updateConsultation(consultation.id, { status: 'completed' });
                            toast.success('Consultation marked as completed');
                          }}
                        >
                          <CheckCircle2 className="size-4 mr-2" />
                          Mark Complete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            updateConsultation(consultation.id, { status: 'cancelled' });
                            toast.success('Consultation cancelled');
                          }}
                        >
                          <XCircle className="size-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Create Consultation Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-2xl mb-6">Schedule Consultation</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="client">Client *</Label>
                  <select
                    id="client"
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="scheduled_date">Date & Time *</Label>
                  <Input
                    id="scheduled_date"
                    type="datetime-local"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      className="mt-1"
                      min="15"
                      step="15"
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Type</Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="video">Video Call</option>
                      <option value="phone">Phone Call</option>
                      <option value="in_person">In Person</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Add any notes or agenda items..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 mt-6">
                <Button onClick={handleCreateConsultation} className="flex-1">
                  Schedule Consultation
                </Button>
                <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
