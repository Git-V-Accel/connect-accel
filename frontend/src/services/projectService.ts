/**
 * Project Service
 * CRUD operations for project management
 */

import apiClient from './apiService';
import { API_CONFIG } from '../config/api';

export interface ProjectResponse {
  _id?: string;
  id?: string;
  title: string;
  clientTitle?: string;
  description: string;
  additionalDescriptions?: Array<{
    description: string;
    createdAt: string;
    createdBy: {
      _id: string;
      name: string;
      email: string;
      userID?: string;
      role?: string;
    };
  }>;
  budget: number;
  isNegotiableBudget?: boolean;
  timeline: string;
  category: string;
  skills?: string[];
  status: 'draft' | 'pending_review' | 'in_bidding' | 'bidding' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'disputed' | 'open' | 'hold';
  statusRemarks?: string;
  priority?: 'low' | 'medium' | 'high';
  complexity?: 'simple' | 'moderate' | 'complex';
  client: string | {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    userID?: string;
  };
  assignedFreelancerId?: string | {
    _id: string;
    name: string;
    email: string;
    userID?: string;
  };
  assignedAgentId?: string | {
    _id: string;
    name: string;
    email: string;
    userID?: string;
  };
  milestones?: MilestoneResponse[];
  attachments?: string[];
  project_type?: string;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MilestoneResponse {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  dueDate: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected' | 'paid';
  isPaid?: boolean;
  paymentStatus?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectPayload {
  title: string;
  clientTitle?: string;
  description: string;
  budget: number;
  isNegotiableBudget?: boolean;
  timeline: string;
  category: string;
  skills?: string[];
  priority?: 'low' | 'medium' | 'high';
  complexity?: 'simple' | 'moderate' | 'complex';
  attachments?: File[];
  status?: 'draft' | 'pending_review';
  project_type?: string;
}

export interface UpdateProjectPayload extends Omit<Partial<CreateProjectPayload>, 'status' | 'attachments'> {
  status?: string;
  assignedAgentId?: string;
  statusRemarks?: string;
  rejectionReason?: string;
  attachments?: Array<File | any>;
}

export interface CreateMilestonePayload {
  title: string;
  description: string;
  dueDate: string;
  amount: number;
  notes?: string;
}

const normalizeProject = (project: ProjectResponse) => {
  // Handle client - can be string ID, populated object, or null/undefined
  let client: { _id: string; name: string; email: string; phone?: string } = { _id: '', name: '', email: '', phone: '' };

  if (project.client) {
    if (typeof project.client === 'object' && project.client !== null) {
      client = {
        _id: project.client._id || '',
        name: project.client.name || '',
        email: project.client.email || '',
        phone: (project.client as any).phone || '',
      };
    } else if (typeof project.client === 'string') {
      client._id = project.client;
    }
  }

  const freelancer = project.assignedFreelancerId
    ? (typeof project.assignedFreelancerId === 'object' && project.assignedFreelancerId !== null
      ? {
        _id: project.assignedFreelancerId._id?.toString() || project.assignedFreelancerId._id || '',
        name: project.assignedFreelancerId.name || '',
        email: project.assignedFreelancerId.email || '',
        userID: project.assignedFreelancerId.userID || ''
      }
      : { _id: project.assignedFreelancerId?.toString() || project.assignedFreelancerId || '', name: '', email: '' })
    : undefined;

  const agent = project.assignedAgentId
    ? (typeof project.assignedAgentId === 'object' && project.assignedAgentId !== null
      ? project.assignedAgentId
      : { _id: project.assignedAgentId, name: '', email: '' })
    : undefined;

  // Get client_id safely
  const client_id = project.client
    ? (typeof project.client === 'string'
      ? project.client
      : (typeof project.client === 'object' && project.client !== null
        ? project.client._id || ''
        : ''))
    : '';

  return {
    id: project._id || project.id || '',
    title: project.title,
    clientTitle: project.clientTitle,
    description: project.description,
    additionalDescriptions: project.additionalDescriptions || [],
    budget: project.budget,
    client_budget: project.budget,
    isNegotiableBudget: project.isNegotiableBudget || false,
    timeline: project.timeline,
    duration_weeks: parseInt(project.timeline) || 0,
    category: project.category,
    skills_required: project.skills || [],
    status: project.status,
    priority: project.priority || 'medium',
    complexity: project.complexity || 'moderate',
    client_id: client_id,
    client_name: client.name,
    client_email: client.email,
    client_phone: client.phone || '',
    freelancer_id: freelancer?._id,
    freelancer_name: freelancer?.name,
    assigned_agent_id: agent?._id,
    admin_id: undefined,
    start_date: undefined,
    end_date: undefined,
    created_at: project.createdAt || project.created_at || new Date().toISOString(),
    updated_at: project.updatedAt || project.updated_at || new Date().toISOString(),
    requirements: false,
    project_type: project.project_type === 'Ongoing Project' ? 'ongoing' :
      project.project_type === 'From Scratch' ? 'from_scratch' :
        project.project_type,
    attachments: (project as any).attachments || [],
  };
};

const normalizeMilestone = (milestone: any) => ({
  ...milestone,
  id: milestone._id || milestone.id || '',
  project_id: '',
  title: milestone.title,
  description: milestone.description,
  amount: milestone.amount,
  due_date: milestone.dueDate || milestone.due_date,
  status: milestone.status,
  order: milestone.order || 0,
  submission_date: milestone.submission_date,
  submission_notes: milestone.notes || milestone.submission_notes,
  approval_date: milestone.approval_date,
});

/**
 * Get all projects
 */
export const listProjects = async (params?: {
  cursor?: string;
  limit?: number;
  assignedFreelancerId?: string;
  clientId?: string;
}): Promise<{ projects: ProjectResponse[]; nextCursor?: string; hasMore: boolean }> => {
  const queryParams = new URLSearchParams();
  if (params?.cursor) queryParams.append('cursor', params.cursor);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.assignedFreelancerId) queryParams.append('assignedFreelancerId', params.assignedFreelancerId);
  if (params?.clientId) queryParams.append('clientId', params.clientId);

  const res = await apiClient.get<{ success: boolean; data: ProjectResponse[]; nextCursor?: string; hasMore: boolean }>(
    `${API_CONFIG.API_URL}/projects${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  );

  return {
    projects: res.data.data || res.data,
    nextCursor: res.data.nextCursor,
    hasMore: res.data.hasMore || false,
  };
};

/**
 * Get project by ID
 */
export const getProjectById = async (projectId: string): Promise<ProjectResponse> => {
  const res = await apiClient.get<{ success: boolean; data: ProjectResponse }>(
    `${API_CONFIG.API_URL}/projects/${projectId}`
  );
  const projectData = res.data.data || res.data;
  // If milestones are included in the response, normalize them
  if (projectData.milestones && Array.isArray(projectData.milestones)) {
    projectData.milestones = projectData.milestones.map(normalizeMilestone);
  }
  return projectData;
};

/**
 * Create new project
 */
export const createProject = async (data: CreateProjectPayload): Promise<ProjectResponse> => {
  const formData = new FormData();
  formData.append('title', data.title);
  if (data.clientTitle) formData.append('clientTitle', data.clientTitle);
  formData.append('description', data.description);
  formData.append('budget', data.budget.toString());
  formData.append('isNegotiableBudget', (data.isNegotiableBudget || false).toString());
  formData.append('timeline', data.timeline);
  formData.append('category', data.category);
  if (data.skills) {
    data.skills.forEach(skill => formData.append('skills[]', skill));
  }
  if (data.priority) formData.append('priority', data.priority);
  if (data.complexity) formData.append('complexity', data.complexity);
  if (data.status) formData.append('status', data.status);
  if (data.attachments) {
    data.attachments.forEach(file => formData.append('files', file));
  }
  if (data.project_type) formData.append('project_type', data.project_type);

  const res = await apiClient.post<{ success: boolean; data: ProjectResponse }>(
    `${API_CONFIG.API_URL}/projects`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return res.data.data || res.data;
};

/**
 * Update project
 */
export const updateProject = async (projectId: string, data: UpdateProjectPayload): Promise<ProjectResponse> => {
  const formData = new FormData();
  if (data.title) formData.append('title', data.title);
  if (data.clientTitle !== undefined) formData.append('clientTitle', data.clientTitle || '');
  if (data.description) formData.append('description', data.description);
  if (data.budget !== undefined) formData.append('budget', data.budget.toString());
  if (data.isNegotiableBudget !== undefined) formData.append('isNegotiableBudget', data.isNegotiableBudget.toString());
  if (data.timeline) formData.append('timeline', data.timeline);
  if (data.category) formData.append('category', data.category);
  if (data.skills) {
    data.skills.forEach(skill => formData.append('skills[]', skill));
  }
  if (data.priority) formData.append('priority', data.priority);
  if (data.complexity) formData.append('complexity', data.complexity);
  if (data.status) formData.append('status', data.status);
  if (data.assignedAgentId) formData.append('assignedAgentId', data.assignedAgentId);
  if (data.statusRemarks) formData.append('statusRemarks', data.statusRemarks);
  if (data.rejectionReason) formData.append('rejectionReason', data.rejectionReason);
  if (data.attachments) {
    const keptExisting: any[] = [];
    data.attachments.forEach((attachment) => {
      if (attachment instanceof File) {
        formData.append('attachments', attachment);
      } else if (attachment) {
        keptExisting.push(attachment);
      }
    });

    // Send kept existing attachments metadata under the same key.
    // Backend will parse JSON and merge with any uploaded files.
    formData.append('attachments', JSON.stringify(keptExisting));
  }

  if ((data as any).project_type) formData.append('project_type', (data as any).project_type);

  const res = await apiClient.put<{ success: boolean; data: ProjectResponse }>(
    `${API_CONFIG.API_URL}/projects/${projectId}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return res.data.data || res.data;
};

/**
 * Delete project
 */
export const deleteProject = async (projectId: string): Promise<void> => {
  await apiClient.delete(`${API_CONFIG.API_URL}/projects/${projectId}`);
};

/**
 * Add milestone to project
 */
export const addMilestone = async (projectId: string, milestone: CreateMilestonePayload): Promise<MilestoneResponse> => {
  const res = await apiClient.post<{ success: boolean; data: MilestoneResponse }>(
    `${API_CONFIG.API_URL}/projects/${projectId}/milestones`,
    milestone
  );
  return res.data.data || res.data;
};

/**
 * Update milestone
 */
export const updateMilestone = async (
  projectId: string,
  milestoneId: string,
  data: Partial<CreateMilestonePayload & { status?: string }>
): Promise<MilestoneResponse> => {
  const res = await apiClient.put<{ success: boolean; data: MilestoneResponse }>(
    `${API_CONFIG.API_URL}/projects/${projectId}/milestones/${milestoneId}`,
    data
  );
  return res.data.data || res.data;
};

/**
 * Release funds for milestone
 */
export const releaseFunds = async (projectId: string, milestoneId: string): Promise<void> => {
  await apiClient.put(`${API_CONFIG.API_URL}/projects/${projectId}/milestones/${milestoneId}/release`);
};

/**
 * Mark project for bidding
 */
export const markProjectForBidding = async (projectId: string): Promise<ProjectResponse> => {
  const res = await apiClient.put<{ success: boolean; data: ProjectResponse }>(
    `${API_CONFIG.API_URL}/projects/${projectId}/bidding`
  );
  return res.data.data || res.data;
};

/**
 * Request consultation
 */
export const requestConsultation = async (data: {
  projectId?: string;
  message?: string;
  projectTitle?: string;
  projectDescription?: string;
  projectBudget?: string;
  projectTimeline?: string;
  projectCategory?: string;
}): Promise<void> => {
  await apiClient.post(`${API_CONFIG.API_URL}/projects/consultation`, data);
};

/**
 * Post project (draft → active)
 */
export const postProject = async (projectId: string): Promise<{ project: ProjectResponse; timelineEntry: any }> => {
  const res = await apiClient.post<{ success: boolean; data: ProjectResponse; timelineEntry: any }>(
    `${API_CONFIG.API_URL}/projects/${projectId}/post`
  );
  return { project: res.data.data || res.data, timelineEntry: res.data.timelineEntry };
};

/**
 * Create bidding (active → in_bidding)
 */
export const createBidding = async (projectId: string): Promise<{ project: ProjectResponse; timelineEntry: any }> => {
  const res = await apiClient.post<{ success: boolean; data: ProjectResponse; timelineEntry: any }>(
    `${API_CONFIG.API_URL}/projects/${projectId}/create-bidding`
  );
  return { project: res.data.data || res.data, timelineEntry: res.data.timelineEntry };
};

/**
 * Award bidding (in_bidding → in_progress)
 */
export const awardBidding = async (projectId: string, freelancerId: string): Promise<{ project: ProjectResponse; timelineEntry: any }> => {
  const res = await apiClient.post<{ success: boolean; data: ProjectResponse; timelineEntry: any }>(
    `${API_CONFIG.API_URL}/projects/${projectId}/award-bidding`,
    { freelancerId }
  );
  return { project: res.data.data || res.data, timelineEntry: res.data.timelineEntry };
};

/**
 * Complete project (in_progress → completed)
 */
export const completeProject = async (projectId: string): Promise<{ project: ProjectResponse; timelineEntry: any }> => {
  const res = await apiClient.post<{ success: boolean; data: ProjectResponse; timelineEntry: any }>(
    `${API_CONFIG.API_URL}/projects/${projectId}/complete`
  );
  return { project: res.data.data || res.data, timelineEntry: res.data.timelineEntry };
};

/**
 * Hold project (active/in_bidding → hold)
 */
export const holdProject = async (projectId: string, remark: string): Promise<{ project: ProjectResponse; timelineEntry: any }> => {
  const res = await apiClient.post<{ success: boolean; data: ProjectResponse; timelineEntry: any }>(
    `${API_CONFIG.API_URL}/projects/${projectId}/hold`,
    { remark }
  );
  return { project: res.data.data || res.data, timelineEntry: res.data.timelineEntry };
};

/**
 * Cancel project (active/in_bidding → cancelled)
 */
export const cancelProject = async (projectId: string, remark: string): Promise<{ project: ProjectResponse; timelineEntry: any }> => {
  const res = await apiClient.post<{ success: boolean; data: ProjectResponse; timelineEntry: any }>(
    `${API_CONFIG.API_URL}/projects/${projectId}/cancel`,
    { remark }
  );
  return { project: res.data.data || res.data, timelineEntry: res.data.timelineEntry };
};

/**
 * Resume project (hold → in_progress)
 */
export const resumeProject = async (projectId: string): Promise<{ project: ProjectResponse; timelineEntry: any }> => {
  const res = await apiClient.post<{ success: boolean; data: ProjectResponse; timelineEntry: any }>(
    `${API_CONFIG.API_URL}/projects/${projectId}/resume`
  );
  return { project: res.data.data || res.data, timelineEntry: res.data.timelineEntry };
};

/**
 * Get project timeline
 */
export interface ProjectTimelineEntry {
  _id: string;
  projectId: string;
  userId: string | {
    _id: string;
    name: string;
    email: string;
    userID?: string;
    role?: string;
  };
  userRole: string;
  oldStatus: string | null;
  newStatus: string;
  action: string;
  remark: string | null;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export const getProjectTimeline = async (projectId: string): Promise<ProjectTimelineEntry[]> => {
  const res = await apiClient.get<{ success: boolean; data: ProjectTimelineEntry[]; count: number }>(
    `${API_CONFIG.API_URL}/projects/${projectId}/timeline`
  );
  return res.data.data || [];
};

// Export normalize functions for use in DataContext
export { normalizeProject, normalizeMilestone };

