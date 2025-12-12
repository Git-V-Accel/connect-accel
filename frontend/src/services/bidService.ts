/**
 * Bid Service
 * Service for managing bids and bidding proposals
 */

import apiClient from './apiService';
import { API_CONFIG } from '../config/api';

// ==================== Types ====================

export interface BidAttachment {
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt?: string;
}

export interface Bid {
  id: string;
  projectId: string;
  projectTitle: string;
  bidderId: string;
  bidderName: string;
  bidderEmail: string;
  bidAmount: number;
  timeline: string;
  description: string;
  attachments?: BidAttachment[];
  notes?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'shortlisted' | 'under_review';
  isShortlisted?: boolean;
  isAccepted?: boolean;
  isDeclined?: boolean;
  clientId?: string;
  clientName?: string;
  submittedAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  project?: {
    id: string;
    title: string;
    description?: string;
    budget?: number;
    timeline?: string;
    status?: string;
  };
  bidder?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    rating?: number;
    completedProjects?: number;
    userID?: string;
    role?: string;
  };
}

export interface CreateBidPayload {
  projectId: string;
  projectTitle?: string;
  bidAmount: number;
  timeline: string;
  description: string;
  attachments?: BidAttachment[];
  notes?: string;
}

export interface UpdateBidPayload {
  bidAmount?: number;
  timeline?: string;
  description?: string;
  attachments?: BidAttachment[];
  notes?: string;
}

// ==================== Bid API Functions ====================

export const createBid = async (payload: CreateBidPayload): Promise<Bid> => {
  const response = await apiClient.post(API_CONFIG.BIDS.CREATE, payload);
  if (response.data.success && response.data.data) {
    return normalizeBid(response.data.data as any);
  }
  throw new Error(response.data.message || 'Failed to create bid');
};

export const getAllBids = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<{ bids: Bid[]; pagination: any }> => {
  const response = await apiClient.get(API_CONFIG.BIDS.LIST, { params });
  if (response.data.success && response.data.data) {
    const data = response.data.data as { bids: Bid[]; pagination: any };
    return {
      bids: data.bids.map(normalizeBid),
      pagination: data.pagination,
    };
  }
  throw new Error(response.data.message || 'Failed to fetch bids');
};

export const getAvailableAdminBids = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<{ bids: Bid[]; pagination: any }> => {
  const response = await apiClient.get(API_CONFIG.BIDS.AVAILABLE, { params });
  if (response.data.success && response.data.data) {
    const data = response.data.data as { bids: Bid[]; pagination: any };
    return {
      bids: data.bids.map(normalizeBid),
      pagination: data.pagination,
    };
  }
  throw new Error(response.data.message || 'Failed to fetch available bids');
};

export const getProjectBids = async (
  projectId: string,
  params?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
): Promise<Bid[]> => {
  const response = await apiClient.get(API_CONFIG.BIDS.GET_BY_PROJECT(projectId), { params });
  if (response.data.success && response.data.data) {
    const bids = Array.isArray(response.data.data) ? response.data.data : [];
    return bids.map(normalizeBid);
  }
  throw new Error(response.data.message || 'Failed to fetch project bids');
};

export const getUserBids = async (
  userId: string,
  params?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
): Promise<Bid[]> => {
  const response = await apiClient.get(API_CONFIG.BIDS.GET_BY_USER(userId), { params });
  if (response.data.success && response.data.data) {
    const bids = Array.isArray(response.data.data) ? response.data.data : [];
    return bids.map(normalizeBid);
  }
  throw new Error(response.data.message || 'Failed to fetch user bids');
};

export const getBidDetails = async (bidId: string): Promise<Bid> => {
  const response = await apiClient.get(API_CONFIG.BIDS.GET(bidId));
  if (response.data.success && response.data.data) {
    return normalizeBid(response.data.data as any);
  }
  throw new Error(response.data.message || 'Failed to fetch bid details');
};

export const updateBid = async (bidId: string, payload: UpdateBidPayload): Promise<Bid> => {
  const response = await apiClient.put(API_CONFIG.BIDS.UPDATE(bidId), payload);
  if (response.data.success && response.data.data) {
    return normalizeBid(response.data.data as any);
  }
  throw new Error(response.data.message || 'Failed to update bid');
};

export const updateBidStatus = async (
  bidId: string,
  status: 'accepted' | 'rejected',
  reviewNotes?: string
): Promise<Bid> => {
  const response = await apiClient.put(API_CONFIG.BIDS.UPDATE_STATUS(bidId), { status, reviewNotes });
  if (response.data.success && response.data.data) {
    return normalizeBid(response.data.data as any);
  }
  throw new Error(response.data.message || 'Failed to update bid status');
};

export const deleteBid = async (bidId: string, reason?: string): Promise<void> => {
  const response = await apiClient.delete(API_CONFIG.BIDS.DELETE(bidId), {
    data: { reason },
  });
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to delete bid');
  }
};

export const updateBidShortlist = async (bidId: string, isShortlisted: boolean): Promise<Bid> => {
  const response = await apiClient.patch(API_CONFIG.BIDS.SHORTLIST(bidId), { isShortlisted });
  if (response.data.success && response.data.data) {
    return normalizeBid(response.data.data as any);
  }
  throw new Error(response.data.message || 'Failed to update shortlist status');
};

export const updateBidAcceptance = async (bidId: string, isAccepted: boolean): Promise<Bid> => {
  const response = await apiClient.patch(API_CONFIG.BIDS.ACCEPT(bidId), { isAccepted });
  if (response.data.success && response.data.data) {
    return normalizeBid(response.data.data as any);
  }
  throw new Error(response.data.message || 'Failed to update acceptance status');
};

export const updateBidDecline = async (bidId: string, isDeclined: boolean): Promise<Bid> => {
  const response = await apiClient.patch(API_CONFIG.BIDS.DECLINE(bidId), { isDeclined });
  if (response.data.success && response.data.data) {
    return normalizeBid(response.data.data as any);
  }
  throw new Error(response.data.message || 'Failed to update decline status');
};

export const getShortlistedBids = async (projectId: string): Promise<Bid[]> => {
  const response = await apiClient.get(API_CONFIG.BIDS.GET_SHORTLISTED(projectId));
  if (response.data.success && response.data.data) {
    const bids = Array.isArray(response.data.data) ? response.data.data : [];
    return bids.map(normalizeBid);
  }
  throw new Error(response.data.message || 'Failed to fetch shortlisted bids');
};

export const getBidStats = async (): Promise<any> => {
  const response = await apiClient.get(API_CONFIG.BIDS.STATS);
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Failed to fetch bid statistics');
};

// ==================== Helper Functions ====================

function normalizeBid(bid: any): Bid {
  return {
    id: bid._id || bid.id,
    projectId: bid.projectId?._id || bid.projectId || '',
    projectTitle: bid.projectTitle || bid.project?.title || '',
    bidderId: bid.bidderId?._id || bid.bidderId || '',
    bidderName: bid.bidderName || bid.bidder?.name || '',
    bidderEmail: bid.bidderEmail || bid.bidder?.email || '',
    bidAmount: bid.bidAmount || 0,
    timeline: bid.timeline || '',
    description: bid.description || '',
    attachments: bid.attachments || [],
    notes: bid.notes || '',
    status: bid.status || 'pending',
    isShortlisted: bid.isShortlisted || false,
    isAccepted: bid.isAccepted || false,
    isDeclined: bid.isDeclined || false,
    clientId: bid.clientId?._id || bid.clientId || undefined,
    clientName: bid.clientName || bid.clientId?.name || undefined,
    submittedAt: bid.submittedAt || bid.createdAt || new Date().toISOString(),
    updatedAt: bid.updatedAt || bid.submittedAt || new Date().toISOString(),
    reviewedAt: bid.reviewedAt,
    reviewedBy: bid.reviewedBy?._id || bid.reviewedBy || undefined,
    reviewNotes: bid.reviewNotes,
    project: bid.projectId
      ? {
          id: bid.projectId._id || bid.projectId,
          title: bid.projectId.title || bid.projectTitle,
          description: bid.projectId.description,
          budget: bid.projectId.budget,
          timeline: bid.projectId.timeline,
          status: bid.projectId.status,
        }
      : undefined,
    bidder: bid.bidderId
      ? {
          id: bid.bidderId._id || bid.bidderId,
          name: bid.bidderId.name || bid.bidderName,
          email: bid.bidderId.email || bid.bidderEmail,
          avatar: bid.bidderId.avatar,
          rating: bid.bidderId.rating,
          completedProjects: bid.bidderId.completedProjects,
          userID: bid.bidderId.userID,
          role: bid.bidderId.role,
        }
      : undefined,
  };
}
