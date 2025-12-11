/**
 * Settings Service
 * Handles all settings-related API calls
 */

import apiClient from './apiService';
import { API_CONFIG } from '../config/api';

export interface ProfileSettings {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  bio?: string;
  company?: string;
  title?: string;
  website?: string;
  avatar?: string;
  role?: string;
  skills?: string[];
  timezone?: string;
  language?: string;
}

export interface NotificationEmailSettings {
  updates?: boolean;
  promotions?: boolean;
  project_updates?: boolean;
  bid_updates?: boolean;
  payment_updates?: boolean;
  consultation_reminders?: boolean;
}

export interface NotificationPushSettings {
  updates?: boolean;
  reminders?: boolean;
  project_updates?: boolean;
  bid_updates?: boolean;
}

export interface NotificationSMSSettings {
  important_updates?: boolean;
  payment_alerts?: boolean;
}

export interface NotificationSettings {
  email?: NotificationEmailSettings;
  push?: NotificationPushSettings;
  sms?: NotificationSMSSettings;
}

export interface AppearanceSettings {
  theme?: 'light' | 'dark' | 'system';
  fontSize?: 'small' | 'medium' | 'large';
  compactMode?: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled?: boolean;
  loginAlerts?: boolean;
  sessionTimeout?: number;
  lastPasswordChange?: Date;
}

export interface PaymentSettings {
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  accountHolder?: string;
  paymentMethod?: 'bank_transfer' | 'paypal' | 'stripe' | 'other';
  currency?: string;
  autoWithdraw?: boolean;
  minimumWithdrawAmount?: number;
}

export interface PrivacySettings {
  profileVisibility?: 'public' | 'private' | 'contacts_only';
  showEmail?: boolean;
  showPhone?: boolean;
  allowMessages?: boolean;
}

export interface UserSettings {
  _id?: string;
  user: string;
  profile: ProfileSettings;
  notifications: {
    email: NotificationEmailSettings;
    push: NotificationPushSettings;
    sms: NotificationSMSSettings;
  };
  appearance: AppearanceSettings;
  security: SecuritySettings;
  payment: PaymentSettings;
  privacy: PrivacySettings;
  customSettings?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface SettingsResponse {
  success: boolean;
  message?: string;
  data: UserSettings;
}

/**
 * Get current user settings
 */
export const getSettings = async (): Promise<UserSettings> => {
  try {
    const response = await apiClient.get<SettingsResponse>(API_CONFIG.SETTINGS.GET);
    return response.data.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get settings by user ID (admin/superadmin only)
 */
export const getSettingsByUserId = async (userId: string): Promise<UserSettings | null> => {
  try {
    const response = await apiClient.get<SettingsResponse>(API_CONFIG.SETTINGS.GET_BY_USER_ID(userId));
    return response.data.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Update user settings
 */
export const updateSettings = async (settings: Partial<UserSettings>): Promise<UserSettings> => {
  try {
    const response = await apiClient.put<SettingsResponse>(API_CONFIG.SETTINGS.UPDATE, settings);
    return response.data.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Update specific settings section
 */
export const updateSettingsSection = async (
  section: 'profile' | 'notifications' | 'appearance' | 'security' | 'payment' | 'privacy' | 'customSettings',
  data: any
): Promise<UserSettings> => {
  try {
    const response = await apiClient.patch<SettingsResponse>(
      API_CONFIG.SETTINGS.UPDATE_SECTION(section),
      data
    );
    return response.data.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Reset settings to default
 */
export const resetSettings = async (): Promise<UserSettings> => {
  try {
    const response = await apiClient.post<SettingsResponse>(API_CONFIG.SETTINGS.RESET);
    return response.data.data;
  } catch (error: any) {
    throw error;
  }
};

