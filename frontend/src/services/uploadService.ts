import apiClient from './apiService';
import { API_CONFIG } from '../config/api';

export interface UploadResponse {
  success: boolean;
  data?: {
    url: string;
    filename: string;
    originalName: string;
    size: number;
    type: string;
  };
  message?: string;
}

/**
 * Upload a single file to the backend (generic endpoint)
 */
export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await apiClient.post<UploadResponse>(
    `${API_CONFIG.API_URL}/upload`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return res.data;
};
