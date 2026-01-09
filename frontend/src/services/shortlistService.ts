import apiClient from './apiService';
import { API_CONFIG } from '../config/api';

export interface ShortlistedProject {
  _id: string;
  freelancerId: string;
  projectId: string;
  adminBidId: string;
  shortlistedAt: string;
}

// Add project to shortlist
export const addToShortlist = async (projectId: string, adminBidId: string) => {
  try {
    const response = await apiClient.post(API_CONFIG.SHORTLISTED_PROJECTS.ADD, {
      projectId,
      adminBidId
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to add project to shortlist:', error);
    throw error;
  }
};

// Remove project from shortlist
export const removeFromShortlist = async (projectId: string) => {
  try {
    const response = await apiClient.delete(API_CONFIG.SHORTLISTED_PROJECTS.REMOVE(projectId));
    return response.data;
  } catch (error: any) {
    console.error('Failed to remove project from shortlist:', error);
    throw error;
  }
};

// Get shortlisted projects
export const getShortlistedProjects = async () => {
  try {
    const response = await apiClient.get(API_CONFIG.SHORTLISTED_PROJECTS.LIST);
    return response.data;
  } catch (error: any) {
    console.error('Failed to get shortlisted projects:', error);
    throw error;
  }
};

// Check if project is shortlisted
export const checkShortlistStatus = async (projectId: string) => {
  try {
    const response = await apiClient.get(API_CONFIG.SHORTLISTED_PROJECTS.CHECK(projectId));
    return response.data;
  } catch (error: any) {
    console.error('Failed to check shortlist status:', error);
    throw error;
  }
};
