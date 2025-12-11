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
  status: 'draft' | 'pending_review' | 'in_bidding' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'disputed' | 'open';
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
  milestones?: MilestoneResponse[];
  attachments?: string[];
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
}

export interface UpdateProjectPayload extends Partial<CreateProjectPayload> {
  status?: string;
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
        ? project.assignedFreelancerId 
        : { _id: project.assignedFreelancerId, name: '', email: '' })
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
    assigned_agent_id: undefined,
    admin_id: undefined,
    start_date: undefined,
    end_date: undefined,
    created_at: project.createdAt || project.created_at || new Date().toISOString(),
    updated_at: project.updatedAt || project.updated_at || new Date().toISOString(),
    requirements: false,
  };
};

const normalizeMilestone = (milestone: MilestoneResponse) => ({
  id: milestone._id || milestone.id || '',
  project_id: '',
  title: milestone.title,
  description: milestone.description,
  amount: milestone.amount,
  due_date: milestone.dueDate,
  status: milestone.status,
  order: 0,
  submission_date: undefined,
  submission_notes: milestone.notes,
  approval_date: undefined,
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
  if (data.attachments) {
    data.attachments.forEach(file => formData.append('attachments', file));
  }

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
  if ((data as any).rejectionReason) formData.append('rejectionReason', (data as any).rejectionReason);
  if (data.attachments) {
    data.attachments.forEach(file => formData.append('attachments', file));
  }

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
export const requestConsultation = async (data: { projectId?: string; message?: string }): Promise<void> => {
  await apiClient.post(`${API_CONFIG.API_URL}/projects/consultation`, data);
};

// Export normalize functions for use in DataContext
export { normalizeProject, normalizeMilestone };

