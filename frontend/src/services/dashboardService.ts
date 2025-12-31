import apiClient from './apiService';
import { API_CONFIG } from '../config/api';

export type DashboardRole = 'superadmin' | 'admin' | 'agent' | 'client';

export interface SuperAdminDashboardResponse {
  stats: {
    pendingReview: number;
    inBidding: number;
    activeProjects: number;
    openDisputes: number;
    totalProjects: number;
    totalBids: number;
    totalRevenue: number;
    consultations: number;
  };
  recentProjects: Array<{
    id: string;
    title: string;
    client: string;
    amount: string;
    date: string;
    status: string;
  }>;
  pendingActions: {
    reviewBids: number;
    openDisputes: number;
  };
}

export interface AdminDashboardResponse {
  stats: {
    pendingReview: number;
    inBidding: number;
    activeProjects: number;
    totalProjects: number;
    totalRevenue: number;
    consultations: number;
    totalBids: number;
  };
  recentProjects: Array<{
    id: string;
    title: string;
    client_name: string;
    created_at: string;
    status: string;
    client_budget: number;
  }>;
  pending: {
    consultationsRequested: number;
    bidsPending: number;
  };
}

export interface AgentDashboardResponse {
  stats: {
    activeProjects: number;
    inBidding: number;
    completedProjects: number;
    totalRevenue: number;
    pendingBids: number;
    shortlistedBids: number;
    upcomingConsultations: number;
    activeClients: number;
    freelancersAssigned: number;
    successRate: number;
    bidSuccessRate: number;
    avgRevenuePerProject: number;
  };
  recentProjects: Array<{
    id: string;
    title: string;
    client_name: string;
    status: string;
    client_budget: number;
    updated_at: string;
  }>;
  activeBids: Array<{
    id: string;
    project_id: string;
    project_title: string;
    freelancer_name: string;
    status: string;
    amount: number;
  }>;
}

export interface ClientDashboardResponse {
  stats: {
    activeProjects: number;
    pendingApprovals: number;
    upcomingDeadlines: number;
    totalSpent: number;
  };
  activeProjects: Array<{
    id: string;
    name: string;
    status: string;
    statusKey: string;
    freelancer: string;
    progress: number;
    dueDate: string;
  }>;
  pendingActions: Array<{ id: string; text: string; link: string }>;
  recentActivity: any[];
}

export interface FreelancerDashboardResponse {
  stats: {
    activeProjects: number;
    pendingBids: number;
    earnings: number;
    availableProjects: number;
  };
  activeProjects: Array<{
    id: string;
    title: string;
    client_name: string;
    freelancer_budget: number;
    status: string;
  }>;
  recentBids: Array<{
    id: string;
    project_id: string;
    project_title: string;
    amount: number;
    status: string;
    created_at: string;
  }>;
}

export const dashboardService = {
  async getSuperAdminDashboard(): Promise<SuperAdminDashboardResponse> {
    const res = await apiClient.get(API_CONFIG.DASHBOARD.SUPERADMIN);
    return (res.data.data || res.data) as SuperAdminDashboardResponse;
  },

  async getAdminDashboard(): Promise<AdminDashboardResponse> {
    const res = await apiClient.get(API_CONFIG.DASHBOARD.ADMIN);
    return (res.data.data || res.data) as AdminDashboardResponse;
  },

  async getAgentDashboard(): Promise<AgentDashboardResponse> {
    const res = await apiClient.get(API_CONFIG.DASHBOARD.AGENT);
    return (res.data.data || res.data) as AgentDashboardResponse;
  },

  async getClientDashboard(): Promise<ClientDashboardResponse> {
    const res = await apiClient.get(API_CONFIG.DASHBOARD.CLIENT);
    return (res.data.data || res.data) as ClientDashboardResponse;
  },

  async getFreelancerDashboard(): Promise<FreelancerDashboardResponse> {
    const res = await apiClient.get(API_CONFIG.DASHBOARD.FREELANCER);
    return (res.data.data || res.data) as FreelancerDashboardResponse;
  },
};
