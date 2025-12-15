import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { statusLabels } from '../../constants/projectConstants';
import { RichTextViewer } from '../../components/common/RichTextViewer';
import { ArrowLeft, Edit2, Users, IndianRupee, Calendar, TrendingUp, MessageSquare, AlertTriangle } from 'lucide-react';
import { toast } from '../../utils/toast';

export default function AdminProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, milestones, bids, disputes, updateProject, getMilestonesByProject, getBidsByProject, getDisputesByProject } = useData();
  
  const project = projects.find(p => p.id === id);
  const projectMilestones = project ? getMilestonesByProject(project.id) : [];
  const projectBids = project ? getBidsByProject(project.id) : [];
  const projectDisputes = project ? getDisputesByProject(project.id) : [];
  

  if (!project) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="max-w-4xl mx-auto text-center py-12">
            <h2 className="text-2xl mb-2">Project Not Found</h2>
            <button
              onClick={() => navigate('/admin/projects')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-4"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      pending_review: 'bg-yellow-100 text-yellow-800',
      in_bidding: 'bg-blue-100 text-blue-800',
      assigned: 'bg-purple-100 text-purple-800',
      in_progress: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      disputed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const calculateProjectProgress = () => {
    if (projectMilestones.length === 0) return 0;
    const completed = projectMilestones.filter(m => m.status === 'approved' || m.status === 'paid').length;
    return Math.round((completed / projectMilestones.length) * 100);
  };

  const progress = calculateProjectProgress();

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/admin/projects')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl mb-2">{project.title}</h1>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(project.status)}`}>
                    {statusLabels[project.status] || project.status.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-gray-600">ID: {project.id}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                {project.status === 'pending_review' && (
                  <button
                    onClick={() => navigate(`/admin/projects/${project.id}/review`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Review Project
                  </button>
                )}
                {project.status === 'in_bidding' && (
                  <button
                    onClick={() => navigate(`/admin/projects/${project.id}/bids`)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Manage Bids
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Client Budget</span>
                <IndianRupee className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl">₹{project.client_budget.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Freelancer Budget</span>
                <IndianRupee className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl">₹{(project.freelancer_budget || 0).toLocaleString()}</p>
            </div>


            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Progress</span>
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-2xl">{progress}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Details */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl mb-4">Project Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600">Description</label>
                    <div className="mt-1">
                      <RichTextViewer content={project.description || ''} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Category</label>
                      <p className="mt-1">{project.category}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Duration</label>
                      <p className="mt-1">{project.duration_weeks} weeks</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Skills Required</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {project.skills_required.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {project.start_date && project.end_date && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Start Date</label>
                        <p className="mt-1">{new Date(project.start_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">End Date</label>
                        <p className="mt-1">{new Date(project.end_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Milestones */}
              {projectMilestones.length > 0 && (
                <div className="bg-white rounded-lg border p-6">
                  <h2 className="text-xl mb-4">Milestones ({projectMilestones.length})</h2>
                  <div className="space-y-3">
                    {projectMilestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{milestone.title}</h3>
                          <p className="text-sm text-gray-600">Due: {new Date(milestone.due_date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{milestone.amount.toLocaleString()}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            milestone.status === 'paid' ? 'bg-green-100 text-green-800' :
                            milestone.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                            milestone.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {milestone.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bids */}
              {projectBids.length > 0 && (
                <div className="bg-white rounded-lg border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl">Bids ({projectBids.length})</h2>
                    {project.status === 'in_bidding' && (
                      <button
                        onClick={() => navigate(`/admin/projects/${project.id}/bids`)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Manage All Bids →
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {projectBids.slice(0, 3).map((bid) => (
                      <div key={bid.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium">{bid.freelancer_name}</h3>
                          <p className="text-sm text-gray-600">Rating: {bid.freelancer_rating}/5</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{bid.amount.toLocaleString()}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            bid.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' :
                            bid.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {bid.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Client & Freelancer Info */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Participants
                </h3>
                <div className="space-y-4">
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
                  {project.admin_name && (
                    <div>
                      <label className="text-sm text-gray-600">Admin Assigned</label>
                      <p className="mt-1">{project.admin_name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Meta */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg mb-4">Project Metadata</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Priority</label>
                    <p className="mt-1 capitalize">{project.priority}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Complexity</label>
                    <p className="mt-1 capitalize">{project.complexity}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Created</label>
                    <p className="mt-1">{new Date(project.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Last Updated</label>
                    <p className="mt-1">{new Date(project.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Disputes */}
              {projectDisputes.length > 0 && (
                <div className="bg-red-50 rounded-lg border border-red-200 p-6">
                  <h3 className="text-lg mb-4 flex items-center gap-2 text-red-900">
                    <AlertTriangle className="w-5 h-5" />
                    Active Disputes
                  </h3>
                  <div className="space-y-3">
                    {projectDisputes.map((dispute) => (
                      <div key={dispute.id} className="bg-white p-3 rounded-lg">
                        <p className="font-medium text-sm">{dispute.subject}</p>
                        <p className="text-xs text-gray-600 mt-1">Status: {dispute.status}</p>
                        <button
                          onClick={() => navigate(`/disputes/${dispute.id}`)}
                          className="text-xs text-blue-600 hover:underline mt-2"
                        >
                          View Details →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate(`/messages?project=${project.id}`)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message Participants
                  </button>
                  <button
                    onClick={() => navigate(`/admin/reports`)}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    View Reports
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
