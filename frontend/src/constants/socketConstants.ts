// Socket event types
export enum SocketEvents {
  // Connection events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  CONNECT_ERROR = 'connect_error',
  RECONNECT = 'reconnect',
  RECONNECT_ATTEMPT = 'reconnect_attempt',
  RECONNECT_ERROR = 'reconnect_error',
  RECONNECT_FAILED = 'reconnect_failed',

  // Notification events
  NOTIFICATION_CREATED = 'notification:created',
  NOTIFICATION_UPDATED = 'notification:updated',
  NOTIFICATION_READ = 'notification:read',
  NOTIFICATION_READ_ALL = 'notification:read_all',
  NOTIFICATION_DELETED = 'notification:deleted',

  // Message events
  MESSAGE_SENT = 'message:sent',
  MESSAGE_RECEIVED = 'message:received',
  MESSAGE_READ = 'message:read',
  MESSAGE_READ_ALL = 'message:read_all',
  MESSAGE_TYPING = 'message:typing',
  MESSAGE_TYPING_STOP = 'message:typing_stop',
  MESSAGE_DELETED = 'message:deleted',
  MESSAGE_EDITED = 'message:edited',
  MESSAGE_REACTED = 'message:reacted',
  MESSAGE_FORWARDED = 'message:forwarded',
  MESSAGE_PINNED = 'message:pinned',
  MESSAGE_UNPINNED = 'message:unpinned',

  // Conversation events
  CONVERSATION_CREATED = 'conversation:created',
  CONVERSATION_UPDATED = 'conversation:updated',
  CONVERSATION_READ = 'conversation:read',
  CONVERSATION_ARCHIVED = 'conversation:archived',
  CONVERSATION_UNARCHIVED = 'conversation:unarchived',
  CONVERSATION_DELETED = 'conversation:deleted',
  CONVERSATION_MEMBER_ADDED = 'conversation:member_added',
  CONVERSATION_MEMBER_REMOVED = 'conversation:member_removed',
  CONVERSATION_MEMBER_LEFT = 'conversation:member_left',
  CONVERSATION_NAME_CHANGED = 'conversation:name_changed',
  CONVERSATION_AVATAR_CHANGED = 'conversation:avatar_changed',

  // Custom Message events
  CUSTOM_MESSAGE_PROJECT_UPDATE = 'custom_message:project_update',
  CUSTOM_MESSAGE_MILESTONE_APPROVED = 'custom_message:milestone_approved',
  CUSTOM_MESSAGE_MILESTONE_REJECTED = 'custom_message:milestone_rejected',
  CUSTOM_MESSAGE_PAYMENT_RECEIVED = 'custom_message:payment_received',
  CUSTOM_MESSAGE_PAYMENT_PROCESSING = 'custom_message:payment_processing',
  CUSTOM_MESSAGE_BID_ACCEPTED = 'custom_message:bid_accepted',
  CUSTOM_MESSAGE_BID_REJECTED = 'custom_message:bid_rejected',
  CUSTOM_MESSAGE_BID_WITHDRAWN = 'custom_message:bid_withdrawn',
  CUSTOM_MESSAGE_PROJECT_ASSIGNED = 'custom_message:project_assigned',
  CUSTOM_MESSAGE_PROJECT_COMPLETED = 'custom_message:project_completed',
  CUSTOM_MESSAGE_PROJECT_CANCELLED = 'custom_message:project_cancelled',
  CUSTOM_MESSAGE_DISPUTE_RAISED = 'custom_message:dispute_raised',
  CUSTOM_MESSAGE_DISPUTE_RESOLVED = 'custom_message:dispute_resolved',
  CUSTOM_MESSAGE_CONSULTATION_SCHEDULED = 'custom_message:consultation_scheduled',
  CUSTOM_MESSAGE_CONSULTATION_CANCELLED = 'custom_message:consultation_cancelled',
  CUSTOM_MESSAGE_CONSULTATION_COMPLETED = 'custom_message:consultation_completed',
  CUSTOM_MESSAGE_SYSTEM_ANNOUNCEMENT = 'custom_message:system_announcement',
  CUSTOM_MESSAGE_USER_MENTIONED = 'custom_message:user_mentioned',
  CUSTOM_MESSAGE_FILE_UPLOADED = 'custom_message:file_uploaded',
  CUSTOM_MESSAGE_REVIEW_SUBMITTED = 'custom_message:review_submitted',
  CUSTOM_MESSAGE_INVITATION_SENT = 'custom_message:invitation_sent',
  CUSTOM_MESSAGE_INVITATION_ACCEPTED = 'custom_message:invitation_accepted',
  CUSTOM_MESSAGE_INVITATION_DECLINED = 'custom_message:invitation_declined',

  // Project status events
  PROJECT_STATUS_UPDATED = 'project_status_updated',

  // Dashboard events
  DASHBOARD_REFRESH = 'dashboard:refresh',
}

// Socket room types
export enum SocketRooms {
  USER = 'user',
  CONVERSATION = 'conversation',
  PROJECT = 'project',
  ADMIN = 'admin',
}

// Socket event payload types
export interface NotificationPayload {
  id: string;
  user_id: string;
  type: 'project' | 'milestone' | 'payment' | 'message' | 'bid' | 'dispute';
  title: string;
  description: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export interface MessagePayload {
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

export interface TypingPayload {
  conversation_id: string;
  user_id: string;
  user_name: string;
  is_typing: boolean;
}

export interface CustomMessagePayload {
  id: string;
  type: string;
  user_id: string;
  conversation_id?: string;
  project_id?: string;
  data: Record<string, any>;
  created_at: string;
}

