import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { ArrowLeft, AlertTriangle, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from '../../utils/toast';

export default function DisputeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { disputes, projects, updateDispute, createNotification } = useData();
  
  const dispute = disputes.find(d => d.id === id);
  const project = dispute ? projects.find(p => p.id === dispute.project_id) : undefined;
  
  const [resolution, setResolution] = useState('');
  const [adminNotes, setAdminNotes] = useState(dispute?.admin_notes || '');
  const [showResolveForm, setShowResolveForm] = useState(false);

  if (!dispute || !project) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="max-w-4xl mx-auto text-center py-12">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl mb-2">Dispute Not Found</h2>
            <p className="text-gray-600 mb-6">The dispute you're looking for doesn't exist or you don't have access to it.</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-yellow-100 text-yellow-800',
      in_review: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      escalated: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const handleUpdateStatus = (newStatus: string) => {
    updateDispute(dispute.id, { status: newStatus as any });
    toast.success('Dispute status updated');
  };

  const handleResolve = () => {
    if (!resolution.trim()) {
      toast.error('Please provide a resolution');
      return;
    }

    updateDispute(dispute.id, {
      status: 'resolved',
      resolution,
      resolved_at: new Date().toISOString(),
      admin_id: user?.id,
    });

    // Notify both parties
    if (project.client_id) {
      createNotification({
        user_id: project.client_id,
        type: 'dispute',
        title: 'Dispute Resolved',
        description: `The dispute for "${project.title}" has been resolved.`,
        link: `/disputes/${dispute.id}`,
      });
    }
    if (project.freelancer_id) {
      createNotification({
        user_id: project.freelancer_id,
        type: 'dispute',
        title: 'Dispute Resolved',
        description: `The dispute for "${project.title}" has been resolved.`,
        link: `/disputes/${dispute.id}`,
      });
    }

    toast.success('Dispute resolved successfully');
    setShowResolveForm(false);
  };

  const handleSaveNotes = () => {
    updateDispute(dispute.id, { admin_notes: adminNotes });
    toast.success('Notes saved');
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl mb-2">{dispute.subject}</h1>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(dispute.status)}`}>
                    {dispute.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(dispute.priority)}`}>
                    {dispute.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
              </div>
              
              {isAdmin && dispute.status !== 'resolved' && (
                <button
                  onClick={() => setShowResolveForm(!showResolveForm)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Resolve Dispute
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dispute Details */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl mb-4">Dispute Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600">Description</label>
                    <p className="mt-1">{dispute.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Raised By</label>
                      <p className="mt-1">{dispute.raised_by_name} ({dispute.raised_by_role})</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Date Raised</label>
                      <p className="mt-1">{new Date(dispute.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {dispute.resolved_at && (
                    <div>
                      <label className="text-sm text-gray-600">Resolved On</label>
                      <p className="mt-1">{new Date(dispute.resolved_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Resolution Form (Admin Only) */}
              {isAdmin && showResolveForm && dispute.status !== 'resolved' && (
                <div className="bg-white rounded-lg border p-6">
                  <h2 className="text-xl mb-4">Resolve Dispute</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2">Resolution Details</label>
                      <textarea
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg resize-none"
                        rows={6}
                        placeholder="Provide detailed resolution and outcome..."
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleResolve}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Confirm Resolution
                      </button>
                      <button
                        onClick={() => setShowResolveForm(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Resolution (if resolved) */}
              {dispute.resolution && (
                <div className="bg-green-50 rounded-lg border border-green-200 p-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg mb-2 text-green-900">Resolution</h3>
                      <p className="text-green-800">{dispute.resolution}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {isAdmin && (
                <div className="bg-white rounded-lg border p-6">
                  <h2 className="text-xl mb-4">Admin Notes (Internal)</h2>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg resize-none mb-3"
                    rows={4}
                    placeholder="Add internal notes about this dispute..."
                  />
                  <button
                    onClick={handleSaveNotes}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Notes
                  </button>
                </div>
              )}

              {!isAdmin && dispute.admin_notes && (
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                  <h3 className="text-lg mb-2 text-blue-900">Admin Comments</h3>
                  <p className="text-blue-800">{dispute.admin_notes}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Info */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg mb-4">Related Project</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Project Title</label>
                    <p className="mt-1">{project.title}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Client</label>
                    <p className="mt-1">{project.client_name}</p>
                  </div>
                  {project.freelancer_name && (
                    <div>
                      <label className="text-sm text-gray-600">Freelancer</label>
                      <p className="mt-1">{project.freelancer_name}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-gray-600">Project Status</label>
                    <p className="mt-1 capitalize">{project.status.replace('_', ' ')}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/${user?.role}/projects/${project.id}`)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-3"
                  >
                    View Project
                  </button>
                </div>
              </div>

              {/* Actions (Admin Only) */}
              {isAdmin && dispute.status !== 'resolved' && (
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    {dispute.status !== 'in_review' && (
                      <button
                        onClick={() => handleUpdateStatus('in_review')}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        <Clock className="w-4 h-4" />
                        Start Review
                      </button>
                    )}
                    {dispute.status !== 'escalated' && (
                      <button
                        onClick={() => handleUpdateStatus('escalated')}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Escalate
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/messages?project=${project.id}`)}
                      className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Message Parties
                    </button>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg mb-4">Timeline</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm">Dispute Raised</p>
                      <p className="text-xs text-gray-600">{new Date(dispute.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {dispute.status === 'in_review' && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm">Under Review</p>
                        <p className="text-xs text-gray-600">Being reviewed by admin team</p>
                      </div>
                    </div>
                  )}
                  {dispute.resolved_at && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm">Resolved</p>
                        <p className="text-xs text-gray-600">{new Date(dispute.resolved_at).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
