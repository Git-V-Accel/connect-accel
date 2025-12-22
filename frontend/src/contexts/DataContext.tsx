import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { socketService } from '../services/socketService';
import { SocketEvents } from '../constants/socketConstants';
import * as projectService from '../services/projectService';
import { toast } from '../utils/toast';

// Types
export interface Project {
  requirements: boolean;
  id: string;
  title: string;
  description: string;
  client_id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  freelancer_id?: string;
  freelancer_name?: string;
  assigned_agent_id?: string;
  agent_margin_percentage?: number;
  status: 'draft' | 'pending_review' | 'active' | 'in_bidding' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'rejected' | 'disputed' | 'open';
  category: string;
  skills_required: string[];
  budget: number;
  client_budget: number;
  freelancer_budget?: number;
  margin?: number;
  duration_weeks: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  admin_id?: string;
  admin_name?: string;
  priority: 'low' | 'medium' | 'high';
  complexity: 'simple' | 'moderate' | 'complex';
  clientTitle?: string;
  isNegotiableBudget?: boolean;
  timeline?: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected' | 'paid';
  submission_date?: string;
  submission_notes?: string;
  approval_date?: string;
  order: number;
}

export interface Bid {
  id: string;
  project_id: string;
  freelancer_id: string;
  freelancer_name: string;
  freelancer_rating: number;
  amount: number;
  duration_weeks?: number;
  estimated_duration?: string;
  proposal?: string;
  cover_letter?: string;
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn' | 'under_review';
  created_at: string;
  submitted_at: string;
  admin_notes?: string;
  invited?: boolean;
  invitation_id?: string;
  milestones?: Array<{
    title: string;
    description: string;
    amount: number;
    duration: string;
  }>;
}

export interface BidInvitation {
  id: string;
  project_id: string;
  freelancer_id: string;
  freelancer_name: string;
  budget_min: number;
  budget_max: number;
  deadline: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  invited_by: string;
  invited_by_name: string;
  created_at: string;
  responded_at?: string;
}

export interface Consultation {
  id: string;
  client_id: string;
  client_name?: string;
  admin_id?: string;
  admin_name?: string;
  agent_id?: string;
  scheduled_date: string;
  duration: number;
  duration_minutes?: number;
  type: 'video' | 'phone' | 'in_person';
  status: 'requested' | 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  meeting_link?: string;
  notes?: string | null;
  outcome?: string | null;
  project_id?: string;
  fee?: number;
  paid?: boolean;
}

export interface Payment {
  id: string;
  project_id: string;
  milestone_id?: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  type: 'escrow' | 'milestone' | 'withdrawal' | 'refund';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}

export interface Dispute {
  id: string;
  project_id: string;
  raised_by: string;
  raised_by_name: string;
  raised_by_role: string;
  subject: string;
  description: string;
  status: 'open' | 'in_review' | 'resolved' | 'escalated';
  priority: 'low' | 'medium' | 'high';
  admin_id?: string;
  admin_notes?: string;
  resolution?: string;
  created_at: string;
  resolved_at?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  content: string;
  created_at: string;
  read: boolean;
  attachments?: string[];
}

export interface Conversation {
  id: string;
  project_id?: string;
  participants: Array<{ id: string; name: string; role: string }>;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'project' | 'milestone' | 'payment' | 'message' | 'bid' | 'dispute';
  title: string;
  description: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export interface Freelancer {
  id: string;
  name: string;
  email: string;
  title: string;
  bio: string;
  skills: string[];
  hourly_rate: number;
  rating: number;
  total_reviews: number;
  availability: 'available' | 'busy' | 'unavailable';
  member_since: string;
  portfolio?: Array<{
    title: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    year: number;
  }>;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  location?: string;
  created_at: string;
}

interface DataContextType {
  projects: Project[];
  milestones: Milestone[];
  bids: Bid[];
  bidInvitations: BidInvitation[];
  consultations: Consultation[];
  payments: Payment[];
  disputes: Dispute[];
  freelancers: Freelancer[];
  clients: Client[];
  messages: Message[];
  conversations: Conversation[];
  notifications: Notification[];

  // Project methods
  createProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project>;
  getProject: (id: string, forceRefresh?: boolean) => Promise<Project | undefined>;
  getProjectsByUser: (userId: string, role: string) => Project[];
  getProjectsByAgent: (agentId: string) => Project[];
  deleteProject: (id: string) => Promise<void>;

  // Milestone methods
  createMilestone: (milestone: Omit<Milestone, 'id'>) => Promise<Milestone>;
  updateMilestone: (id: string, updates: Partial<Milestone>) => Promise<Milestone>;
  deleteMilestone: (id: string) => void;
  getMilestonesByProject: (projectId: string) => Milestone[];

  // Bid methods
  createBid: (bid: Omit<Bid, 'id' | 'created_at'>) => Bid;
  updateBid: (id: string, updates: Partial<Bid>) => void;
  getBidsByProject: (projectId: string) => Bid[];
  getBidsByFreelancer: (freelancerId: string) => Bid[];
  getBidsByAgent: (agentId: string) => Bid[];

  // Bid Invitation methods
  createBidInvitation: (invitation: Omit<BidInvitation, 'id' | 'created_at'>) => BidInvitation;
  updateBidInvitation: (id: string, updates: Partial<BidInvitation>) => void;
  getBidInvitationsByProject: (projectId: string) => BidInvitation[];
  getBidInvitationsByFreelancer: (freelancerId: string) => BidInvitation[];

  // Consultation methods
  createConsultation: (consultation: Omit<Consultation, 'id'>) => Consultation;
  updateConsultation: (id: string, updates: Partial<Consultation>) => void;
  getConsultationsByUser: (userId: string, role: string) => Consultation[];

  // Payment methods
  createPayment: (payment: Omit<Payment, 'id' | 'created_at'>) => Payment;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  getPaymentsByProject: (projectId: string) => Payment[];
  getPaymentsByUser: (userId: string) => Payment[];

  // Dispute methods
  createDispute: (dispute: Omit<Dispute, 'id' | 'created_at'>) => Dispute;
  updateDispute: (id: string, updates: Partial<Dispute>) => void;
  getDisputesByProject: (projectId: string) => Dispute[];

  // Message methods
  sendMessage: (message: Omit<Message, 'id' | 'created_at' | 'read'>) => Message;
  markMessageAsRead: (id: string) => void;
  getConversation: (conversationId: string) => Message[];
  getUserConversations: (userId: string) => Conversation[];

  // Notification methods
  createNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => Notification;
  markNotificationAsRead: (id: string) => void;
  getUserNotifications: (userId: string) => Notification[];

  // User management methods
  getAllUsers: () => Array<{
    id: string;
    name: string;
    email: string;
    role: 'client' | 'freelancer' | 'admin' | 'superadmin' | 'agent';
    status: 'active' | 'suspended' | 'banned';
    phone?: string;
    company?: string;
    created_at: string;
    last_login?: string;
    title?: string;
    rating?: number;
  }>;
  createUser: (userData: {
    name: string;
    email: string;
    role: 'freelancer' | 'admin' | 'agent' | 'superadmin';
    phone?: string;
    company?: string;
    title?: string;
    hourlyRate?: number;
    bio?: string;
  }) => void;
  updateUserStatus: (userId: string, status: 'active' | 'suspended' | 'banned') => void;
  deleteUser: (userId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const isLoadingProjectsRef = useRef(false);
  const [data, setData] = useState(() => {
    const stored = sessionStorage.getItem('connect_accel_data');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // If parsing fails, return empty data structure
      }
    }
    // Initialize with empty data structure
    return {
      projects: [],
      milestones: [],
      bids: [],
      bidInvitations: [],
      consultations: [],
      payments: [],
      disputes: [],
      messages: [],
      conversations: [],
      notifications: [],
      freelancers: [],
      clients: [],
    };
  });

  // Load projects from backend when user is available
  useEffect(() => {
    const loadProjects = async () => {
      if (!user) return;

      // Prevent multiple simultaneous calls
      if (isLoadingProjectsRef.current) return;

      // Check if we have cached projects and they're recent (less than 30 seconds old)
      const lastLoadTime = sessionStorage.getItem('projects_last_load_time');
      const stored = sessionStorage.getItem('connect_accel_data');
      let hasProjects = false;

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          hasProjects = parsed.projects && parsed.projects.length > 0;
        } catch {
          // Ignore parse errors
        }
      }

      if (hasProjects && lastLoadTime) {
        const timeSinceLastLoad = Date.now() - parseInt(lastLoadTime, 10);
        // If we have projects and they were loaded less than 30 seconds ago, skip reload
        if (timeSinceLastLoad < 30000) {
          return;
        }
      }

      isLoadingProjectsRef.current = true;

      // Add a delay to prevent race conditions with other components
      await new Promise(resolve => setTimeout(resolve, 200));

      try {
        const result = await projectService.listProjects();
        const normalizedProjects = result.projects.map(projectService.normalizeProject);

        // Extract milestones from all projects
        const allMilestones: Milestone[] = [];
        result.projects.forEach((project: any) => {
          if (project.milestones && Array.isArray(project.milestones)) {
            project.milestones.forEach((milestone: any, index: number) => {
              const normalizedMilestone = projectService.normalizeMilestone(milestone);
              normalizedMilestone.project_id = project._id || project.id || '';
              normalizedMilestone.order = index;
              allMilestones.push(normalizedMilestone);
            });
          }
        });

        setData((prev: any) => ({
          ...prev,
          projects: normalizedProjects,
          milestones: allMilestones,
        }));

        // Store timestamp of successful load
        sessionStorage.setItem('projects_last_load_time', Date.now().toString());
      } catch (error: any) {
        console.error('Failed to load projects:', error);
        // Keep existing data if fetch fails
        // If it's a 429 error, we'll retry after a delay
        if (error.response?.status === 429) {
          // Retry after 5 seconds
          setTimeout(() => {
            if (user && !isLoadingProjectsRef.current) {
              loadProjects();
            }
          }, 5000);
        }
      } finally {
        isLoadingProjectsRef.current = false;
      }
    };

    loadProjects();
  }, [user]);

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('connect_accel_data', JSON.stringify(data));
    }
  }, [data, user]);

  // Project methods
  const createProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const payload: projectService.CreateProjectPayload = {
        title: projectData.title,
        clientTitle: projectData.clientTitle,
        description: projectData.description,
        budget: projectData.budget || projectData.client_budget || 0,
        isNegotiableBudget: projectData.isNegotiableBudget,
        timeline: projectData.timeline || `${projectData.duration_weeks} weeks`,
        category: projectData.category,
        skills: projectData.skills_required,
        priority: projectData.priority,
        complexity: projectData.complexity,
        status: (projectData.status as 'draft' | 'pending_review' | undefined) || 'pending_review',
      };

      const createdProject = await projectService.createProject(payload);
      const normalizedProject = projectService.normalizeProject(createdProject);

      setData((prev: any) => ({
        ...prev,
        projects: [...prev.projects, normalizedProject],
      }));

      return normalizedProject;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to create project';
      toast.error(errorMessage);
      throw error;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const payload: projectService.UpdateProjectPayload = {};
      if (updates.title) payload.title = updates.title;
      if (updates.clientTitle !== undefined) payload.clientTitle = updates.clientTitle;
      if (updates.description) payload.description = updates.description;
      if (updates.budget !== undefined) payload.budget = updates.budget;
      if (updates.isNegotiableBudget !== undefined) payload.isNegotiableBudget = updates.isNegotiableBudget;
      if (updates.timeline) payload.timeline = updates.timeline;
      if (updates.category) payload.category = updates.category;
      if (updates.skills_required) payload.skills = updates.skills_required;
      if (updates.priority) payload.priority = updates.priority;
      if (updates.complexity) payload.complexity = updates.complexity;
      if (updates.status) payload.status = updates.status as any;
      if ((updates as any).assignedAgentId) payload.assignedAgentId = (updates as any).assignedAgentId;
      if ((updates as any).assigned_agent_id) payload.assignedAgentId = (updates as any).assigned_agent_id;

      const updatedProject = await projectService.updateProject(id, payload);
      const normalizedProject = projectService.normalizeProject(updatedProject);

      setData((prev: any) => {
        const updatedProjects = prev.projects.map((p: Project) =>
          p.id === id ? normalizedProject : p
        );

        // Create notifications for project updates
        const project = prev.projects.find((p: Project) => p.id === id);
        const newNotifications = [...prev.notifications];

        if (project) {
          // Notify client when admin changes anything in the project
          if (socketService.isConnected() && user && (user.role === 'admin' || user.role === 'superadmin')) {
            // Determine what changed
            let notificationTitle = 'Project Updated';
            let notificationDescription = `Your project "${project.title}" has been updated.`;

            if (updates.status) {
              if (updates.status === 'in_bidding') {
                notificationTitle = 'Project Approved!';
                notificationDescription = `Your project "${project.title}" has been approved and is now open for bidding.`;
              } else if (updates.status === 'in_progress') {
                notificationTitle = 'Project Started!';
                notificationDescription = `Your project "${project.title}" has been started.`;
              } else if (updates.status === 'completed') {
                notificationTitle = 'Project Completed!';
                notificationDescription = `Your project "${project.title}" has been completed.`;
              } else if (updates.status === 'cancelled') {
                notificationTitle = 'Project Cancelled';
                notificationDescription = `Your project "${project.title}" has been cancelled.`;
              }
            } else if (updates.title || updates.description || updates.budget || updates.duration_weeks) {
              notificationTitle = 'Project Details Updated';
              notificationDescription = `Admin has updated details of your project "${project.title}".`;
            }

            const notification = {
              id: 'notif_' + Math.random().toString(36).substr(2, 9),
              user_id: project.client_id,
              type: 'project' as const,
              title: notificationTitle,
              description: notificationDescription,
              link: `/client/projects/${id}`,
              read: false,
              created_at: new Date().toISOString(),
            };

            // Emit socket event to the specific client
            socketService.getSocket()?.emit('notification:create', notification);

            // Also add to local notifications
            newNotifications.push(notification);
          }

          // Legacy status-based notifications (for backward compatibility when socket is not connected)
          if (updates.status && !socketService.isConnected()) {
            if (updates.status === 'in_bidding') {
              newNotifications.push({
                id: 'notif_' + Math.random().toString(36).substr(2, 9),
                user_id: project.client_id,
                type: 'project',
                title: 'Project Approved!',
                description: `Your project "${project.title}" has been approved and is now open for bidding.`,
                link: `/client/projects/${id}`,
                read: false,
                created_at: new Date().toISOString(),
              });
            } else if (updates.status === 'assigned') {
              // Notify both client and freelancer
              newNotifications.push({
                id: 'notif_' + Math.random().toString(36).substr(2, 9),
                user_id: project.client_id,
                type: 'project',
                title: 'Freelancer Assigned!',
                description: `A freelancer has been assigned to your project "${project.title}".`,
                link: `/client/projects/${id}`,
                read: false,
                created_at: new Date().toISOString(),
              });
              if ((updates as any).assigned_freelancer_id) {
                newNotifications.push({
                  id: 'notif_' + Math.random().toString(36).substr(2, 9),
                  user_id: (updates as any).assigned_freelancer_id,
                  type: 'project',
                  title: 'Project Assigned to You!',
                  description: `You've been assigned to project "${project.title}". Time to get started!`,
                  link: `/freelancer/projects/${id}`,
                  read: false,
                  created_at: new Date().toISOString(),
                });
              }
            } else if (updates.status === 'cancelled') {
              newNotifications.push({
                id: 'notif_' + Math.random().toString(36).substr(2, 9),
                user_id: project.client_id,
                type: 'project',
                title: 'Project Update',
                description: `Your project "${project.title}" has been cancelled. ${(updates as any).rejection_reason || ''}`,
                link: `/client/projects/${id}`,
                read: false,
                created_at: new Date().toISOString(),
              });
            }
          }
        }

        return {
          ...prev,
          projects: updatedProjects,
          notifications: newNotifications,
        };
      });

      return normalizedProject;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to update project';
      toast.error(errorMessage);
      throw error;
    }
  };

  const getProject = async (id: string, forceRefresh: boolean = false): Promise<Project | undefined> => {
    // Check if project exists in local state first (unless force refresh is requested)
    if (!forceRefresh) {
      const localProject = data.projects.find((p: Project) => p.id === id);
      if (localProject) {
        // Return local project immediately to avoid redundant API calls
        // Components can call with forceRefresh=true if they need fresh data
        return localProject;
      }
    }

    // Fetch from backend if not in local state or force refresh requested
    try {
      const project = await projectService.getProjectById(id);
      const normalizedProject = projectService.normalizeProject(project);

      // Extract milestones from project if they exist
      const projectMilestones: Milestone[] = [];
      if (project.milestones && Array.isArray(project.milestones)) {
        project.milestones.forEach((milestone: any, index: number) => {
          const normalizedMilestone = projectService.normalizeMilestone(milestone);
          normalizedMilestone.project_id = id;
          normalizedMilestone.order = index;
          projectMilestones.push(normalizedMilestone);
        });
      }

      setData((prev: any) => {
        const existingIndex = prev.projects.findIndex((p: Project) => p.id === id);
        const updatedProjects = existingIndex >= 0 ? [...prev.projects] : [...prev.projects, normalizedProject];
        if (existingIndex >= 0) {
          updatedProjects[existingIndex] = normalizedProject;
        }

        // Merge milestones - avoid duplicates
        const existingMilestoneIds = new Set(prev.milestones.map((m: Milestone) => m.id));
        const newMilestones = projectMilestones.filter((m: Milestone) => !existingMilestoneIds.has(m.id));

        return {
          ...prev,
          projects: updatedProjects,
          milestones: [...prev.milestones, ...newMilestones]
        };
      });

      return normalizedProject;
    } catch (error: any) {
      console.error('Failed to fetch project:', error);
      // Fallback to local project if fetch fails
      const localProject = data.projects.find((p: Project) => p.id === id);
      return localProject;
    }
  };

  const getProjectsByUser = (userId: string, role: string) => {
    if (role === 'client') {
      return data.projects.filter((p: Project) => p.client_id === userId);
    } else if (role === 'freelancer') {
      return data.projects.filter((p: Project) => p.freelancer_id === userId);
    } else if (role === 'admin' || role === 'superadmin') {
      return data.projects;
    }
    return [];
  };

  const getProjectsByAgent = (agentId: string) => {
    return data.projects.filter((p: Project) => p.admin_id === agentId);
  };

  const deleteProject = async (id: string) => {
    try {
      await projectService.deleteProject(id);
      setData((prev: any) => ({
        ...prev,
        projects: prev.projects.filter((p: Project) => p.id !== id),
      }));
      toast.success('Project deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
      throw error;
    }
  };

  // Milestone methods
  const createMilestone = async (milestoneData: Omit<Milestone, 'id'>) => {
    try {
      const payload: projectService.CreateMilestonePayload = {
        title: milestoneData.title,
        description: milestoneData.description,
        dueDate: milestoneData.due_date,
        amount: milestoneData.amount,
        notes: milestoneData.submission_notes,
      };

      const createdMilestone = await projectService.addMilestone(milestoneData.project_id, payload);
      const normalizedMilestone = projectService.normalizeMilestone(createdMilestone);
      normalizedMilestone.project_id = milestoneData.project_id;
      normalizedMilestone.order = data.milestones.filter((m: Milestone) => m.project_id === milestoneData.project_id).length;

      setData((prev: any) => ({
        ...prev,
        milestones: [...prev.milestones, normalizedMilestone]
      }));

      return normalizedMilestone;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to create milestone';
      toast.error(errorMessage);
      throw error;
    }
  };

  const updateMilestone = async (id: string, updates: Partial<Milestone>) => {
    try {
      const milestone = data.milestones.find((m: Milestone) => m.id === id);
      if (!milestone) throw new Error('Milestone not found');

      const payload: Partial<projectService.CreateMilestonePayload & { status?: string }> = {};
      if (updates.title) payload.title = updates.title;
      if (updates.description) payload.description = updates.description;
      if (updates.due_date) payload.dueDate = updates.due_date;
      if (updates.amount !== undefined) payload.amount = updates.amount;
      if (updates.status) payload.status = updates.status;
      if (updates.submission_notes) payload.notes = updates.submission_notes;

      const updatedMilestone = await projectService.updateMilestone(milestone.project_id, id, payload);
      const normalizedMilestone = projectService.normalizeMilestone(updatedMilestone);
      normalizedMilestone.project_id = milestone.project_id;
      normalizedMilestone.order = milestone.order;

      setData((prev: any) => ({
        ...prev,
        milestones: prev.milestones.map((m: Milestone) =>
          m.id === id ? normalizedMilestone : m
        ),
      }));

      return normalizedMilestone;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to update milestone';
      toast.error(errorMessage);
      throw error;
    }
  };

  const deleteMilestone = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      milestones: prev.milestones.filter((m: Milestone) => m.id !== id),
    }));
  };

  const getMilestonesByProject = (projectId: string) => {
    // First check if project has milestones embedded
    const project = data.projects.find((p: Project) => p.id === projectId);
    if (project && (project as any).milestones && Array.isArray((project as any).milestones)) {
      return (project as any).milestones.map((m: any, index: number) => ({
        id: m._id || m.id || '',
        project_id: projectId,
        title: m.title,
        description: m.description,
        amount: m.amount,
        due_date: m.dueDate || m.due_date,
        status: m.status,
        order: index,
        submission_date: m.submission_date,
        submission_notes: m.notes || m.submission_notes,
        approval_date: m.approval_date,
      }));
    }
    // Fallback to separate milestones array
    return data.milestones.filter((m: Milestone) => m.project_id === projectId);
  };

  // Bid methods
  const createBid = (bidData: Omit<Bid, 'id' | 'created_at'>) => {
    const newBid: Bid = {
      ...bidData,
      id: 'bid_' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    setData((prev: any) => ({ ...prev, bids: [...prev.bids, newBid] }));
    return newBid;
  };

  const updateBid = (id: string, updates: Partial<Bid>) => {
    setData((prev: any) => {
      const updatedBids = prev.bids.map((b: Bid) => (b.id === id ? { ...b, ...updates } : b));

      // Create notifications for bid updates
      const bid = prev.bids.find((b: Bid) => b.id === id);
      const newNotifications = [...prev.notifications];

      if (bid && updates.status) {
        if (updates.status === 'accepted') {
          // Notify freelancer their bid was accepted
          newNotifications.push({
            id: 'notif_' + Math.random().toString(36).substr(2, 9),
            user_id: bid.freelancer_id,
            type: 'bid',
            title: 'Bid Accepted! 🎉',
            description: `Congratulations! Your bid has been accepted. The project has been assigned to you.`,
            link: `/freelancer/projects/${bid.project_id}`,
            read: false,
            created_at: new Date().toISOString(),
          });
        } else if (updates.status === 'rejected') {
          // Notify freelancer their bid was rejected
          newNotifications.push({
            id: 'notif_' + Math.random().toString(36).substr(2, 9),
            user_id: bid.freelancer_id,
            type: 'bid',
            title: 'Bid Update',
            description: `Your bid was not selected this time. ${(updates as any).rejection_reason || 'Keep bidding on other projects!'}`,
            link: `/freelancer/my-bids`,
            read: false,
            created_at: new Date().toISOString(),
          });
        } else if (updates.status === 'shortlisted') {
          // Notify freelancer they're shortlisted
          newNotifications.push({
            id: 'notif_' + Math.random().toString(36).substr(2, 9),
            user_id: bid.freelancer_id,
            type: 'bid',
            title: 'You\'ve Been Shortlisted!',
            description: `Great news! Your bid has been shortlisted for review.`,
            link: `/freelancer/my-bids`,
            read: false,
            created_at: new Date().toISOString(),
          });
        }
      }

      return {
        ...prev,
        bids: updatedBids,
        notifications: newNotifications,
      };
    });
  };

  const getBidsByProject = (projectId: string) => {
    return data.bids.filter((b: Bid) => b.project_id === projectId);
  };

  const getBidsByFreelancer = (freelancerId: string) => {
    return data.bids.filter((b: Bid) => b.freelancer_id === freelancerId);
  };

  const getBidsByAgent = (agentId: string) => {
    // Bids are associated with projects, and projects have admin_id
    // Filter bids where the associated project's admin_id matches the agentId
    return data.bids.filter((b: Bid) => {
      const project = data.projects.find((p: Project) => p.id === b.project_id);
      return project?.admin_id === agentId;
    });
  };

  // Bid Invitation methods
  const createBidInvitation = (invitationData: Omit<BidInvitation, 'id' | 'created_at'>) => {
    const newInvitation: BidInvitation = {
      ...invitationData,
      id: 'inv_' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    setData((prev: any) => ({ ...prev, bidInvitations: [...prev.bidInvitations, newInvitation] }));
    return newInvitation;
  };

  const updateBidInvitation = (id: string, updates: Partial<BidInvitation>) => {
    setData((prev: any) => ({
      ...prev,
      bidInvitations: prev.bidInvitations.map((i: BidInvitation) =>
        i.id === id ? { ...i, ...updates } : i
      ),
    }));
  };

  const getBidInvitationsByProject = (projectId: string) => {
    return data.bidInvitations.filter((i: BidInvitation) => i.project_id === projectId);
  };

  const getBidInvitationsByFreelancer = (freelancerId: string) => {
    return data.bidInvitations.filter((i: BidInvitation) => i.freelancer_id === freelancerId);
  };

  // Consultation methods
  const createConsultation = (consultationData: Omit<Consultation, 'id'>) => {
    const newConsultation: Consultation = {
      ...consultationData,
      id: 'consult_' + Math.random().toString(36).substr(2, 9),
    };
    setData((prev: any) => ({ ...prev, consultations: [...prev.consultations, newConsultation] }));
    return newConsultation;
  };

  const updateConsultation = (id: string, updates: Partial<Consultation>) => {
    setData((prev: any) => {
      const updatedConsultations = prev.consultations.map((c: Consultation) =>
        c.id === id ? { ...c, ...updates } : c
      );

      // Create notifications for consultation updates
      const consultation = prev.consultations.find((c: Consultation) => c.id === id);
      const newNotifications = [...prev.notifications];

      if (consultation && updates.status) {
        if (updates.status === 'scheduled') {
          // Notify client when consultation is scheduled
          newNotifications.push({
            id: 'notif_' + Math.random().toString(36).substr(2, 9),
            user_id: consultation.client_id,
            type: 'project',
            title: 'Consultation Scheduled',
            description: `Your consultation has been scheduled for ${new Date(updates.scheduled_date || consultation.scheduled_date).toLocaleString()}`,
            link: `/client/consultations`,
            read: false,
            created_at: new Date().toISOString(),
          });
        } else if (updates.status === 'completed') {
          // Notify client when consultation is completed
          newNotifications.push({
            id: 'notif_' + Math.random().toString(36).substr(2, 9),
            user_id: consultation.client_id,
            type: 'project',
            title: 'Consultation Completed',
            description: `Your consultation has been completed. ${updates.outcome || 'Check notes for details.'}`,
            link: `/client/consultations`,
            read: false,
            created_at: new Date().toISOString(),
          });
        }
      }

      return {
        ...prev,
        consultations: updatedConsultations,
        notifications: newNotifications,
      };
    });
  };

  const getConsultationsByUser = (userId: string, role: string) => {
    if (role === 'client') {
      return data.consultations.filter((c: Consultation) => c.client_id === userId);
    } else if (role === 'admin' || role === 'superadmin') {
      return data.consultations;
    }
    return [];
  };

  // Payment methods
  const createPayment = (paymentData: Omit<Payment, 'id' | 'created_at'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: 'payment_' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    setData((prev: any) => ({ ...prev, payments: [...prev.payments, newPayment] }));
    return newPayment;
  };

  const updatePayment = (id: string, updates: Partial<Payment>) => {
    setData((prev: any) => ({
      ...prev,
      payments: prev.payments.map((p: Payment) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  };

  const getPaymentsByProject = (projectId: string) => {
    return data.payments.filter((p: Payment) => p.project_id === projectId);
  };

  const getPaymentsByUser = (userId: string) => {
    return data.payments.filter(
      (p: Payment) => p.from_user_id === userId || p.to_user_id === userId
    );
  };

  // Dispute methods
  const createDispute = (disputeData: Omit<Dispute, 'id' | 'created_at'>) => {
    const newDispute: Dispute = {
      ...disputeData,
      id: 'dispute_' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    setData((prev: any) => ({ ...prev, disputes: [...prev.disputes, newDispute] }));
    return newDispute;
  };

  const updateDispute = (id: string, updates: Partial<Dispute>) => {
    setData((prev: any) => {
      const updatedDisputes = prev.disputes.map((d: Dispute) =>
        d.id === id ? { ...d, ...updates } : d
      );

      // Create notifications for dispute updates
      const dispute = prev.disputes.find((d: Dispute) => d.id === id);
      const newNotifications = [...prev.notifications];

      if (dispute && updates.status) {
        if (updates.status === 'in_review') {
          // Notify the person who raised the dispute
          newNotifications.push({
            id: 'notif_' + Math.random().toString(36).substr(2, 9),
            user_id: dispute.raised_by,
            type: 'dispute',
            title: 'Dispute Under Review',
            description: `Your dispute "${dispute.subject}" is now being reviewed by our admin team.`,
            link: `/disputes/${id}`,
            read: false,
            created_at: new Date().toISOString(),
          });
        } else if (updates.status === 'resolved') {
          // Notify both parties about resolution
          const project = prev.projects.find((p: Project) => p.id === dispute.project_id);
          if (project) {
            // Notify client
            newNotifications.push({
              id: 'notif_' + Math.random().toString(36).substr(2, 9),
              user_id: project.client_id,
              type: 'dispute',
              title: 'Dispute Resolved',
              description: `The dispute for "${project.title}" has been resolved. ${updates.resolution || ''}`,
              link: `/disputes/${id}`,
              read: false,
              created_at: new Date().toISOString(),
            });

            // Notify freelancer if assigned
            if (project.freelancer_id) {
              newNotifications.push({
                id: 'notif_' + Math.random().toString(36).substr(2, 9),
                user_id: project.freelancer_id,
                type: 'dispute',
                title: 'Dispute Resolved',
                description: `The dispute for "${project.title}" has been resolved. ${updates.resolution || ''}`,
                link: `/disputes/${id}`,
                read: false,
                created_at: new Date().toISOString(),
              });
            }
          }
        }
      }

      return {
        ...prev,
        disputes: updatedDisputes,
        notifications: newNotifications,
      };
    });
  };

  const getDisputesByProject = (projectId: string) => {
    return data.disputes.filter((d: Dispute) => d.project_id === projectId);
  };

  // Message methods
  const sendMessage = (messageData: Omit<Message, 'id' | 'created_at' | 'read'>) => {
    const newMessage: Message = {
      ...messageData,
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      read: false,
    };
    setData((prev: any) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      conversations: prev.conversations.map((c: Conversation) =>
        c.id === messageData.conversation_id
          ? {
            ...c,
            last_message: messageData.content,
            last_message_at: newMessage.created_at,
            unread_count: c.unread_count + 1,
          }
          : c
      ),
    }));
    return newMessage;
  };

  const markMessageAsRead = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      messages: prev.messages.map((m: Message) =>
        m.id === id ? { ...m, read: true } : m
      ),
    }));
  };

  const getConversation = (conversationId: string) => {
    return data.messages.filter((m: Message) => m.conversation_id === conversationId);
  };

  const getUserConversations = (userId: string) => {
    return data.conversations.filter((c: Conversation) =>
      c.participants.some((p) => p.id === userId)
    );
  };

  // Notification methods
  const createNotification = (notificationData: Omit<Notification, 'id' | 'created_at' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: 'notif_' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      read: false,
    };
    setData((prev: any) => ({ ...prev, notifications: [...prev.notifications, newNotification] }));
    return newNotification;
  };

  const markNotificationAsRead = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      notifications: prev.notifications.map((n: Notification) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  };

  const getUserNotifications = (userId: string) => {
    return data.notifications.filter((n: Notification) => n.user_id === userId);
  };

  // User management methods
  const getAllUsers = () => {
    // Get created users from sessionStorage
    const storedCreatedUsers = sessionStorage.getItem('connect_accel_created_users');
    const createdUsers = storedCreatedUsers ? JSON.parse(storedCreatedUsers) : [];

    const clientUsers = data.clients.map((c: Client) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      role: 'client' as const,
      status: 'active' as const,
      phone: c.phone,
      company: c.company,
      created_at: c.created_at,
    }));

    const freelancerUsers = data.freelancers.map((f: Freelancer) => ({
      id: f.id,
      name: f.name,
      email: f.email,
      role: 'freelancer' as const,
      status: 'active' as const,
      created_at: f.member_since + 'T10:00:00Z',
      title: f.title,
      rating: f.rating,
    }));

    return [...createdUsers, ...clientUsers, ...freelancerUsers];
  };

  const createUser = (userData: {
    name: string;
    email: string;
    role: 'freelancer' | 'admin' | 'agent' | 'superadmin';
    phone?: string;
    company?: string;
    title?: string;
    hourlyRate?: number;
    bio?: string;
  }) => {
    const newUserId = `${userData.role}_${Date.now()}`;
    const newUser = {
      id: newUserId,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      status: 'active' as const,
      phone: userData.phone,
      company: userData.company,
      created_at: new Date().toISOString(),
      title: userData.title,
      bio: userData.bio,
      ...(userData.role === 'freelancer' && { rating: 0 }),
    };

    // Add to appropriate data structure
    if (userData.role === 'freelancer') {
      setData((prev: any) => ({
        ...prev,
        freelancers: [
          ...prev.freelancers,
          {
            id: newUserId,
            name: userData.name,
            email: userData.email,
            title: userData.title || 'Freelancer',
            bio: userData.bio || '',
            skills: [],
            hourly_rate: userData.hourlyRate || 0,
            rating: 0,
            total_reviews: 0,
            availability: 'available' as const,
            member_since: new Date().toISOString().split('T')[0],
          },
        ],
      }));
    } else if (userData.role === 'admin' || userData.role === 'agent' || userData.role === 'superadmin') {
      // Store admin, agent, and superadmin users in sessionStorage
      const storedCreatedUsers = sessionStorage.getItem('connect_accel_created_users');
      const createdUsers = storedCreatedUsers ? JSON.parse(storedCreatedUsers) : [];
      createdUsers.push(newUser);
      sessionStorage.setItem('connect_accel_created_users', JSON.stringify(createdUsers));
    }
  };

  const updateUserStatus = (userId: string, status: 'active' | 'suspended' | 'banned') => {
    // In a real app, this would update the user in the database
    // For now, we'll just show a toast
    console.log(`Updating user ${userId} status to ${status}`);
  };

  const deleteUser = (userId: string) => {
    // In a real app, this would delete the user from the database
    // For now, we'll just show a toast
    console.log(`Deleting user ${userId}`);
  };

  const value = {
    projects: data.projects,
    milestones: data.milestones,
    bids: data.bids,
    bidInvitations: data.bidInvitations,
    consultations: data.consultations,
    payments: data.payments,
    disputes: data.disputes,
    messages: data.messages,
    conversations: data.conversations,
    notifications: data.notifications,
    freelancers: data.freelancers,
    clients: data.clients,

    createProject,
    updateProject,
    getProject,
    getProjectsByUser,
    getProjectsByAgent,
    deleteProject,

    createMilestone,
    updateMilestone,
    deleteMilestone,
    getMilestonesByProject,

    createBid,
    updateBid,
    getBidsByProject,
    getBidsByFreelancer,
    getBidsByAgent,

    createBidInvitation,
    updateBidInvitation,
    getBidInvitationsByProject,
    getBidInvitationsByFreelancer,

    createConsultation,
    updateConsultation,
    getConsultationsByUser,

    createPayment,
    updatePayment,
    getPaymentsByProject,
    getPaymentsByUser,

    createDispute,
    updateDispute,
    getDisputesByProject,

    sendMessage,
    markMessageAsRead,
    getConversation,
    getUserConversations,

    createNotification,
    markNotificationAsRead,
    getUserNotifications,

    getAllUsers,
    createUser,
    updateUserStatus,
    deleteUser,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
