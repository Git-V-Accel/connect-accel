import apiClient from './apiService';
import { API_CONFIG } from '../config/api';

export interface ConsultationRequestData {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientCompany?: string;
  projectTitle?: string;
  projectDescription?: string;
  projectBudget?: string;
  projectTimeline?: string;
  projectCategory?: string;
}

export interface ConsultationCompletionData {
  meetingNotes?: string;
  outcome: string;
  actionItems?: string;
}

export interface ConsultationCancellationData {
  cancellationReason?: string;
}

export interface ConsultationAssignmentData {
  assigneeId?: string;
  assignmentType?: 'assign_to_agent' | 'move_to_in_house';
}

export interface ConsultationFilters {
  status?: string;
  assigned?: 'me' | 'unassigned';
}

export const consultationService = {
  // Get all consultation requests (admin/superadmin only)
  getConsultations: async (filters?: ConsultationFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assigned) params.append('assigned', filters.assigned);

    const response = await apiClient.get(
      `${API_CONFIG.CONSULTATIONS.LIST}${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  // Get single consultation by ID
  getConsultation: async (id: string) => {
    const response = await apiClient.get(API_CONFIG.CONSULTATIONS.GET(id));
    return response.data;
  },

  // Assign consultation to agent/admin
  assignConsultation: async (id: string, data: ConsultationAssignmentData) => {
    const response = await apiClient.patch(API_CONFIG.CONSULTATIONS.ASSIGN(id), data);
    return response.data;
  },

  // Complete consultation
  completeConsultation: async (id: string, data: ConsultationCompletionData) => {
    const response = await apiClient.patch(API_CONFIG.CONSULTATIONS.COMPLETE(id), data);
    return response.data;
  },

  // Cancel consultation
  cancelConsultation: async (id: string, data: ConsultationCancellationData) => {
    const response = await apiClient.patch(API_CONFIG.CONSULTATIONS.CANCEL(id), data);
    return response.data;
  },

  // Undo cancel consultation
  undoCancelConsultation: async (id: string) => {
    const response = await apiClient.patch(API_CONFIG.CONSULTATIONS.UNDO_CANCEL(id));
    return response.data;
  },

  // Create new consultation request
  createConsultationRequest: async (data: ConsultationRequestData) => {
    const response = await apiClient.post(API_CONFIG.PROJECTS.CONSULTATION, data);
    return response.data;
  },
};

export default consultationService;
