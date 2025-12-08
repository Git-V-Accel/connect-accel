import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { ArrowLeft, Calendar, Clock, Video, CheckCircle, XCircle, Edit2 } from 'lucide-react';
import { toast } from '../../utils/toast';

export default function ConsultationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { consultations, projects, updateConsultation } = useData();
  
  const consultation = consultations.find(c => c.id === id);
  const project = consultation?.project_id ? projects.find(p => p.id === consultation.project_id) : undefined;
  
  const [isEditing, setIsEditing] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(consultation?.scheduled_date || '');
  const [meetingLink, setMeetingLink] = useState(consultation?.meeting_link || '');
  const [notes, setNotes] = useState(consultation?.notes || '');
  const [outcome, setOutcome] = useState('');

  if (!consultation) {
    return (
      <DashboardLayout role={user?.role || 'client'}>
        <div className="p-6">
          <div className="max-w-4xl mx-auto text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl mb-2">Consultation Not Found</h2>
            <p className="text-gray-600 mb-6">The consultation you're looking for doesn't exist or you don't have access to it.</p>
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
      requested: 'bg-yellow-100 text-yellow-800',
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const canEdit = isAdmin && consultation.status !== 'completed' && consultation.status !== 'cancelled';

  const handleSchedule = () => {
    if (!scheduledDate || !meetingLink) {
      toast.error('Please provide both date and meeting link');
      return;
    }

    updateConsultation(consultation.id, {
      scheduled_date: scheduledDate,
      meeting_link: meetingLink,
      status: 'scheduled',
      admin_id: user?.id,
      admin_name: user?.name,
    });

    toast.success('Consultation scheduled successfully');
    setIsEditing(false);
  };

  const handleComplete = () => {
    if (!outcome.trim()) {
      toast.error('Please provide outcome details');
      return;
    }

    updateConsultation(consultation.id, {
      status: 'completed',
      outcome,
      notes: notes || consultation.notes,
    });

    toast.success('Consultation marked as completed');
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this consultation?')) {
      updateConsultation(consultation.id, {
        status: 'cancelled',
      });
      toast.success('Consultation cancelled');
    }
  };

  const handleSaveNotes = () => {
    updateConsultation(consultation.id, { notes });
    toast.success('Notes saved');
    setIsEditing(false);
  };

  const isPastDate = new Date(consultation.scheduled_date) < new Date();
  const canComplete = isAdmin && consultation.status === 'scheduled' && isPastDate;

  return (
    <DashboardLayout role={user?.role || 'client'}>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl mb-2">Consultation Details</h1>
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(consultation.status)}`}>
                  {consultation.status.toUpperCase()}
                </span>
              </div>
              
              {canEdit && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  {isEditing ? 'Cancel Edit' : 'Edit'}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl mb-4">Consultation Information</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Client</label>
                      <p className="mt-1">{consultation.client_name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Admin Assigned</label>
                      <p className="mt-1">{consultation.admin_name || 'Not assigned'}</p>
                    </div>
                  </div>

                  {isEditing ? (
                    <>
                      <div>
                        <label className="text-sm text-gray-600 block mb-2">Scheduled Date & Time</label>
                        <input
                          type="datetime-local"
                          value={scheduledDate.slice(0, 16)}
                          onChange={(e) => setScheduledDate(new Date(e.target.value).toISOString())}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 block mb-2">Meeting Link</label>
                        <input
                          type="url"
                          value={meetingLink}
                          onChange={(e) => setMeetingLink(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="https://meet.google.com/..."
                        />
                      </div>
                      <button
                        onClick={handleSchedule}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Save Schedule
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Date & Time
                          </label>
                          <p className="mt-1">{new Date(consultation.scheduled_date).toLocaleString()}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Duration
                          </label>
                          <p className="mt-1">{consultation.duration_minutes} minutes</p>
                        </div>
                      </div>

                      {consultation.meeting_link && (
                        <div>
                          <label className="text-sm text-gray-600 flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            Meeting Link
                          </label>
                          <a
                            href={consultation.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 text-blue-600 hover:underline block"
                          >
                            {consultation.meeting_link}
                          </a>
                          {consultation.status === 'scheduled' && (
                            <button
                              onClick={() => window.open(consultation.meeting_link, '_blank')}
                              className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                            >
                              <Video className="w-4 h-4" />
                              Join Meeting
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  <div>
                    <label className="text-sm text-gray-600">Fee</label>
                    <p className="mt-1">₹{consultation.fee.toLocaleString()}</p>
                    <span className={`text-sm ${consultation.paid ? 'text-green-600' : 'text-yellow-600'}`}>
                      {consultation.paid ? '✓ Paid' : '⏳ Payment Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl mb-4">Notes</h2>
                {isAdmin ? (
                  <>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg resize-none mb-3"
                      rows={6}
                      placeholder="Add notes about the consultation..."
                    />
                    <button
                      onClick={handleSaveNotes}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save Notes
                    </button>
                  </>
                ) : (
                  <p className="text-gray-600">{consultation.notes || 'No notes available yet.'}</p>
                )}
              </div>

              {/* Complete Consultation (Admin Only) */}
              {canComplete && (
                <div className="bg-white rounded-lg border p-6">
                  <h2 className="text-xl mb-4">Complete Consultation</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600 block mb-2">Outcome Summary</label>
                      <textarea
                        value={outcome}
                        onChange={(e) => setOutcome(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg resize-none"
                        rows={4}
                        placeholder="Summarize the consultation outcome and next steps..."
                      />
                    </div>
                    <button
                      onClick={handleComplete}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark as Completed
                    </button>
                  </div>
                </div>
              )}

              {/* Outcome (if completed) */}
              {consultation.status === 'completed' && consultation.outcome && (
                <div className="bg-green-50 rounded-lg border border-green-200 p-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg mb-2 text-green-900">Consultation Outcome</h3>
                      <p className="text-green-800">{consultation.outcome}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Related Project */}
              {project && (
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg mb-4">Related Project</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Project</label>
                      <p className="mt-1">{project.title}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Status</label>
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
              )}

              {/* Actions */}
              {isAdmin && consultation.status !== 'completed' && consultation.status !== 'cancelled' && (
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg mb-4">Actions</h3>
                  <div className="space-y-2">
                    {consultation.status === 'requested' && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        Schedule Consultation
                      </button>
                    )}
                    <button
                      onClick={handleCancel}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel Consultation
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Info */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                <h3 className="text-lg mb-3 text-blue-900">Consultation Tips</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• Join 5 minutes early</li>
                  <li>• Have your questions ready</li>
                  <li>• Take notes during the call</li>
                  <li>• Follow up on action items</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
