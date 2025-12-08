import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { generateMockData } from '../data/mockData';

// Types
export interface Project {
  id: string;
  title: string;
  description: string;
  client_id: string;
  client_name: string;
  freelancer_id?: string;
  freelancer_name?: string;
  assigned_agent_id?: string;
  agent_margin_percentage?: number;
  status: 'draft' | 'pending_review' | 'in_bidding' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'disputed' | 'open';
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
  createProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  getProject: (id: string) => Project | undefined;
  getProjectsByUser: (userId: string, role: string) => Project[];
  getProjectsByAgent: (agentId: string) => Project[];
  
  // Milestone methods
  createMilestone: (milestone: Omit<Milestone, 'id'>) => Milestone;
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = useState(() => {
    const stored = localStorage.getItem('connect_accel_data');
    if (stored && user) {
      return JSON.parse(stored);
    }
    return user ? generateMockData(user.id, user.role) : generateMockData('', '');
  });

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem('connect_accel_data');
      if (!stored) {
        const mockData = generateMockData(user.id, user.role);
        setData(mockData);
        localStorage.setItem('connect_accel_data', JSON.stringify(mockData));
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('connect_accel_data', JSON.stringify(data));
    }
  }, [data, user]);

  // Project methods
  const createProject = (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    const newProject: Project = {
      ...projectData,
      id: 'proj_' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setData((prev: any) => ({ ...prev, projects: [...prev.projects, newProject] }));
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setData((prev: any) => {
      const updatedProjects = prev.projects.map((p: Project) =>
        p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
      );
      
      // Create notifications for project updates
      const project = prev.projects.find((p: Project) => p.id === id);
      const newNotifications = [...prev.notifications];
      
      if (project && updates.status) {
        // Notify client when project status changes
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
      
      return {
        ...prev,
        projects: updatedProjects,
        notifications: newNotifications,
      };
    });
  };

  const getProject = (id: string) => {
    return data.projects.find((p: Project) => p.id === id);
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

  // Milestone methods
  const createMilestone = (milestoneData: Omit<Milestone, 'id'>) => {
    const newMilestone: Milestone = {
      ...milestoneData,
      id: 'milestone_' + Math.random().toString(36).substr(2, 9),
    };
    setData((prev: any) => ({ ...prev, milestones: [...prev.milestones, newMilestone] }));
    return newMilestone;
  };

  const updateMilestone = (id: string, updates: Partial<Milestone>) => {
    setData((prev: any) => ({
      ...prev,
      milestones: prev.milestones.map((m: Milestone) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    }));
  };

  const getMilestonesByProject = (projectId: string) => {
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
    return data.bids.filter((b: Bid) => (b as any).admin_id === agentId);
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
    
    createMilestone,
    updateMilestone,
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
