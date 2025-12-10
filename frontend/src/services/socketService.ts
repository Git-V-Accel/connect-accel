import { io, Socket } from 'socket.io-client';
import {
  SocketEvents,
  NotificationPayload,
  MessagePayload,
  TypingPayload,
  CustomMessagePayload,
} from '../constants/socketConstants';

// Socket service class
class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private userId: string | null = null;
  private token: string | null = null;

  // Event handlers
  private notificationHandlers: Map<string, Set<(data: any) => void>> = new Map();
  private messageHandlers: Map<string, Set<(data: any) => void>> = new Map();
  private connectionHandlers: Set<(connected: boolean) => void> = new Set();

  /**
   * Initialize socket connection
   */
  connect(userId: string, token: string, serverUrl?: string): void {
    if (this.isConnecting || (this.socket && this.socket.connected)) {
      return;
    }

    this.userId = userId;
    this.token = token;
    this.isConnecting = true;

    const url = serverUrl || import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

    this.socket = io(url, {
      auth: {
        token,
        userId,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.setupEventListeners();
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
      this.userId = null;
      this.token = null;
      this.reconnectAttempts = 0;
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Setup socket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on(SocketEvents.CONNECT, () => {
      console.log('Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      this.notifyConnectionHandlers(true);
      
      // Join user's room
      if (this.userId) {
        this.socket?.emit('join:user', { userId: this.userId });
      }
    });

    this.socket.on(SocketEvents.DISCONNECT, (reason) => {
      console.log('Socket disconnected:', reason);
      this.notifyConnectionHandlers(false);
    });

    this.socket.on(SocketEvents.CONNECT_ERROR, (error) => {
      console.error('Socket connection error:', error);
      this.isConnecting = false;
    });

    this.socket.on(SocketEvents.RECONNECT, (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      this.reconnectAttempts = 0;
      this.notifyConnectionHandlers(true);
    });

    this.socket.on(SocketEvents.RECONNECT_ATTEMPT, (attemptNumber) => {
      console.log('Reconnection attempt:', attemptNumber);
      this.reconnectAttempts = attemptNumber;
    });

    this.socket.on(SocketEvents.RECONNECT_ERROR, (error) => {
      console.error('Reconnection error:', error);
    });

    this.socket.on(SocketEvents.RECONNECT_FAILED, () => {
      console.error('Reconnection failed after max attempts');
      this.notifyConnectionHandlers(false);
    });

    // Notification events
    this.socket.on(SocketEvents.NOTIFICATION_CREATED, (data: NotificationPayload) => {
      console.log('Notification created:', data);
      this.notifyHandlers(SocketEvents.NOTIFICATION_CREATED, data);
    });

    this.socket.on(SocketEvents.NOTIFICATION_UPDATED, (data: NotificationPayload) => {
      console.log('Notification updated:', data);
      this.notifyHandlers(SocketEvents.NOTIFICATION_UPDATED, data);
    });

    this.socket.on(SocketEvents.NOTIFICATION_READ, (data: { id: string; user_id: string }) => {
      console.log('Notification read:', data);
      this.notifyHandlers(SocketEvents.NOTIFICATION_READ, data);
    });

    this.socket.on(SocketEvents.NOTIFICATION_READ_ALL, (data: { user_id: string }) => {
      console.log('All notifications read:', data);
      this.notifyHandlers(SocketEvents.NOTIFICATION_READ_ALL, data);
    });

    this.socket.on(SocketEvents.NOTIFICATION_DELETED, (data: { id: string; user_id: string }) => {
      console.log('Notification deleted:', data);
      this.notifyHandlers(SocketEvents.NOTIFICATION_DELETED, data);
    });

    // Message events
    this.socket.on(SocketEvents.MESSAGE_SENT, (data: MessagePayload) => {
      console.log('Message sent:', data);
      this.notifyHandlers(SocketEvents.MESSAGE_SENT, data);
    });

    this.socket.on(SocketEvents.MESSAGE_RECEIVED, (data: MessagePayload) => {
      console.log('Message received:', data);
      this.notifyHandlers(SocketEvents.MESSAGE_RECEIVED, data);
    });

    this.socket.on(SocketEvents.MESSAGE_READ, (data: { message_id: string; user_id: string; conversation_id: string }) => {
      console.log('Message read:', data);
      this.notifyHandlers(SocketEvents.MESSAGE_READ, data);
    });

    this.socket.on(SocketEvents.MESSAGE_READ_ALL, (data: { conversation_id: string; user_id: string }) => {
      console.log('All messages read:', data);
      this.notifyHandlers(SocketEvents.MESSAGE_READ_ALL, data);
    });

    this.socket.on(SocketEvents.MESSAGE_TYPING, (data: TypingPayload) => {
      this.notifyHandlers(SocketEvents.MESSAGE_TYPING, data);
    });

    this.socket.on(SocketEvents.MESSAGE_TYPING_STOP, (data: TypingPayload) => {
      this.notifyHandlers(SocketEvents.MESSAGE_TYPING_STOP, data);
    });

    this.socket.on(SocketEvents.MESSAGE_DELETED, (data: { id: string; conversation_id: string }) => {
      console.log('Message deleted:', data);
      this.notifyHandlers(SocketEvents.MESSAGE_DELETED, data);
    });

    // Conversation events
    this.socket.on(SocketEvents.CONVERSATION_CREATED, (data: any) => {
      console.log('Conversation created:', data);
      this.notifyHandlers(SocketEvents.CONVERSATION_CREATED, data);
    });

    this.socket.on(SocketEvents.CONVERSATION_UPDATED, (data: any) => {
      console.log('Conversation updated:', data);
      this.notifyHandlers(SocketEvents.CONVERSATION_UPDATED, data);
    });

    this.socket.on(SocketEvents.CONVERSATION_READ, (data: { conversation_id: string; user_id: string }) => {
      console.log('Conversation read:', data);
      this.notifyHandlers(SocketEvents.CONVERSATION_READ, data);
    });

    this.socket.on(SocketEvents.CONVERSATION_ARCHIVED, (data: { conversation_id: string; user_id: string }) => {
      console.log('Conversation archived:', data);
      this.notifyHandlers(SocketEvents.CONVERSATION_ARCHIVED, data);
    });

    this.socket.on(SocketEvents.CONVERSATION_UNARCHIVED, (data: { conversation_id: string; user_id: string }) => {
      console.log('Conversation unarchived:', data);
      this.notifyHandlers(SocketEvents.CONVERSATION_UNARCHIVED, data);
    });

    this.socket.on(SocketEvents.CONVERSATION_DELETED, (data: { conversation_id: string; user_id: string }) => {
      console.log('Conversation deleted:', data);
      this.notifyHandlers(SocketEvents.CONVERSATION_DELETED, data);
    });

    this.socket.on(SocketEvents.CONVERSATION_MEMBER_ADDED, (data: any) => {
      console.log('Conversation member added:', data);
      this.notifyHandlers(SocketEvents.CONVERSATION_MEMBER_ADDED, data);
    });

    this.socket.on(SocketEvents.CONVERSATION_MEMBER_REMOVED, (data: any) => {
      console.log('Conversation member removed:', data);
      this.notifyHandlers(SocketEvents.CONVERSATION_MEMBER_REMOVED, data);
    });

    this.socket.on(SocketEvents.CONVERSATION_MEMBER_LEFT, (data: any) => {
      console.log('Conversation member left:', data);
      this.notifyHandlers(SocketEvents.CONVERSATION_MEMBER_LEFT, data);
    });

    this.socket.on(SocketEvents.CONVERSATION_NAME_CHANGED, (data: any) => {
      console.log('Conversation name changed:', data);
      this.notifyHandlers(SocketEvents.CONVERSATION_NAME_CHANGED, data);
    });

    this.socket.on(SocketEvents.CONVERSATION_AVATAR_CHANGED, (data: any) => {
      console.log('Conversation avatar changed:', data);
      this.notifyHandlers(SocketEvents.CONVERSATION_AVATAR_CHANGED, data);
    });

    // Custom Message events
    this.socket.on(SocketEvents.CUSTOM_MESSAGE_PROJECT_UPDATE, (data: CustomMessagePayload) => {
      console.log('Custom message - Project update:', data);
      this.notifyHandlers(SocketEvents.CUSTOM_MESSAGE_PROJECT_UPDATE, data);
    });

    this.socket.on(SocketEvents.CUSTOM_MESSAGE_MILESTONE_APPROVED, (data: CustomMessagePayload) => {
      console.log('Custom message - Milestone approved:', data);
      this.notifyHandlers(SocketEvents.CUSTOM_MESSAGE_MILESTONE_APPROVED, data);
    });

    this.socket.on(SocketEvents.CUSTOM_MESSAGE_MILESTONE_REJECTED, (data: CustomMessagePayload) => {
      console.log('Custom message - Milestone rejected:', data);
      this.notifyHandlers(SocketEvents.CUSTOM_MESSAGE_MILESTONE_REJECTED, data);
    });

    this.socket.on(SocketEvents.CUSTOM_MESSAGE_PAYMENT_RECEIVED, (data: CustomMessagePayload) => {
      console.log('Custom message - Payment received:', data);
      this.notifyHandlers(SocketEvents.CUSTOM_MESSAGE_PAYMENT_RECEIVED, data);
    });

    this.socket.on(SocketEvents.CUSTOM_MESSAGE_PAYMENT_PROCESSING, (data: CustomMessagePayload) => {
      console.log('Custom message - Payment processing:', data);
      this.notifyHandlers(SocketEvents.CUSTOM_MESSAGE_PAYMENT_PROCESSING, data);
    });

    this.socket.on(SocketEvents.CUSTOM_MESSAGE_BID_ACCEPTED, (data: CustomMessagePayload) => {
      console.log('Custom message - Bid accepted:', data);
      this.notifyHandlers(SocketEvents.CUSTOM_MESSAGE_BID_ACCEPTED, data);
    });

    this.socket.on(SocketEvents.CUSTOM_MESSAGE_BID_REJECTED, (data: CustomMessagePayload) => {
      console.log('Custom message - Bid rejected:', data);
      this.notifyHandlers(SocketEvents.CUSTOM_MESSAGE_BID_REJECTED, data);
    });

    this.socket.on(SocketEvents.CUSTOM_MESSAGE_BID_WITHDRAWN, (data: CustomMessagePayload) => {
      console.log('Custom message - Bid withdrawn:', data);
      this.notifyHandlers(SocketEvents.CUSTOM_MESSAGE_BID_WITHDRAWN, data);
    });

    this.socket.on(SocketEvents.CUSTOM_MESSAGE_PROJECT_ASSIGNED, (data: CustomMessagePayload) => {
      console.log('Custom message - Project assigned:', data);
      this.notifyHandlers(SocketEvents.CUSTOM_MESSAGE_PROJECT_ASSIGNED, data);
    });

    this.socket.on(SocketEvents.CUSTOM_MESSAGE_PROJECT_COMPLETED, (data: CustomMessagePayload) => {
      console.log('Custom message - Project completed:', data);
      this.notifyHandlers(SocketEvents.CUSTOM_MESSAGE_PROJECT_COMPLETED, data);
    });

    this.socket.on(SocketEvents.CUSTOM_MESSAGE_PROJECT_CANCELLED, (data: CustomMessagePayload) => {
      console.log('Custom message - Project cancelled:', data);
      this.notifyHandlers(SocketEvents.CUSTOM_MESSAGE_PROJECT_CANCELLED, data);
    });

    this.socket.on(SocketEvents.CUSTOM_MESSAGE_DISPUTE_RAISED, (data: CustomMessagePayload) => {
      console.log('Custom message - Dispute raised:', data);
      this.notifyHandlers(SocketEvents.CUSTOM_MESSAGE_DISPUTE_RAISED, data);
    });

    this.socket.on(SocketEvents.CUSTOM_MESSAGE_DISPUTE_RESOLVED, (data: CustomMessagePayload) => {
      console.log('Custom message - Dispute resolved:', data);
      this.notifyHandlers(SocketEvents.CUSTOM_MESSAGE_DISPUTE_RESOLVED, data);
    });

    this.socket.on(SocketEvents.CUSTOM_MESSAGE_CONSULTATION_SCHEDULED, (data: CustomMessagePayload) => {
      console.log('Custom message - Consultation scheduled:', data);
      this.notifyHandlers(SocketEvents.CUSTOM_MESSAGE_CONSULTATION_SCHEDULED, data);
    });

    this.socket.on(SocketEvents.CUSTOM_MESSAGE_CONSULTATION_CANCELLED, (data: CustomMessagePayload) => {
      console.log('Custom message - Consultation cancelled:', data);
      this.notifyHandlers(SocketEvents.CUSTOM_MESSAGE_CONSULTATION_CANCELLED, data);
    });

    this.socket.on(SocketEvents.CUSTOM_MESSAGE_CONSULTATION_COMPLETED, (data: CustomMessagePayload) => {
      console.log('Custom message - Consultation completed:', data);
      this.notifyHandlers(SocketEvents.CUSTOM_MESSAGE_CONSULTATION_COMPLETED, data);
    });

    this.socket.on(SocketEvents.CUSTOM_MESSAGE_SYSTEM_ANNOUNCEMENT, (data: CustomMessagePayload) => {
      console.log('Custom message - System announcement:', data);
      this.notifyHandlers(SocketEvents.CUSTOM_MESSAGE_SYSTEM_ANNOUNCEMENT, data);
    });

    this.socket.on(SocketEvents.CUSTOM_MESSAGE_USER_MENTIONED, (data: CustomMessagePayload) => {
      console.log('Custom message - User mentioned:', data);
      this.notifyHandlers(SocketEvents.CUSTOM_MESSAGE_USER_MENTIONED, data);
    });

    this.socket.on(SocketEvents.CUSTOM_MESSAGE_FILE_UPLOADED, (data: CustomMessagePayload) => {
      console.log('Custom message - File uploaded:', data);
      this.notifyHandlers(SocketEvents.CUSTOM_MESSAGE_FILE_UPLOADED, data);
    });

    this.socket.on(SocketEvents.CUSTOM_MESSAGE_REVIEW_SUBMITTED, (data: CustomMessagePayload) => {
      console.log('Custom message - Review submitted:', data);
      this.notifyHandlers(SocketEvents.CUSTOM_MESSAGE_REVIEW_SUBMITTED, data);
    });

    this.socket.on(SocketEvents.CUSTOM_MESSAGE_INVITATION_SENT, (data: CustomMessagePayload) => {
      console.log('Custom message - Invitation sent:', data);
      this.notifyHandlers(SocketEvents.CUSTOM_MESSAGE_INVITATION_SENT, data);
    });

    this.socket.on(SocketEvents.CUSTOM_MESSAGE_INVITATION_ACCEPTED, (data: CustomMessagePayload) => {
      console.log('Custom message - Invitation accepted:', data);
      this.notifyHandlers(SocketEvents.CUSTOM_MESSAGE_INVITATION_ACCEPTED, data);
    });

    this.socket.on(SocketEvents.CUSTOM_MESSAGE_INVITATION_DECLINED, (data: CustomMessagePayload) => {
      console.log('Custom message - Invitation declined:', data);
      this.notifyHandlers(SocketEvents.CUSTOM_MESSAGE_INVITATION_DECLINED, data);
    });

    // Additional message events
    this.socket.on(SocketEvents.MESSAGE_EDITED, (data: MessagePayload) => {
      console.log('Message edited:', data);
      this.notifyHandlers(SocketEvents.MESSAGE_EDITED, data);
    });

    this.socket.on(SocketEvents.MESSAGE_REACTED, (data: { message_id: string; user_id: string; reaction: string }) => {
      console.log('Message reacted:', data);
      this.notifyHandlers(SocketEvents.MESSAGE_REACTED, data);
    });

    this.socket.on(SocketEvents.MESSAGE_FORWARDED, (data: { message_id: string; conversation_id: string }) => {
      console.log('Message forwarded:', data);
      this.notifyHandlers(SocketEvents.MESSAGE_FORWARDED, data);
    });

    this.socket.on(SocketEvents.MESSAGE_PINNED, (data: { message_id: string; conversation_id: string }) => {
      console.log('Message pinned:', data);
      this.notifyHandlers(SocketEvents.MESSAGE_PINNED, data);
    });

    this.socket.on(SocketEvents.MESSAGE_UNPINNED, (data: { message_id: string; conversation_id: string }) => {
      console.log('Message unpinned:', data);
      this.notifyHandlers(SocketEvents.MESSAGE_UNPINNED, data);
    });
  }

  /**
   * Register event handler
   */
  on(event: SocketEvents, handler: (data: any) => void): () => void {
    const handlers = this.getHandlersForEvent(event);
    handlers.add(handler);

    // Return unsubscribe function
    return () => {
      handlers.delete(handler);
    };
  }

  /**
   * Remove event handler
   */
  off(event: SocketEvents, handler: (data: any) => void): void {
    const handlers = this.getHandlersForEvent(event);
    handlers.delete(handler);
  }

  /**
   * Register connection status handler
   */
  onConnectionChange(handler: (connected: boolean) => void): () => void {
    this.connectionHandlers.add(handler);
    return () => {
      this.connectionHandlers.delete(handler);
    };
  }

  /**
   * Get handlers for specific event
   */
  private getHandlersForEvent(event: SocketEvents): Set<(data: any) => void> {
    if (!this.notificationHandlers.has(event) && !this.messageHandlers.has(event)) {
      if (
        event.startsWith('notification:') ||
        event.startsWith('message:') ||
        event.startsWith('conversation:') ||
        event.startsWith('custom_message:')
      ) {
        if (event.startsWith('notification:')) {
          this.notificationHandlers.set(event, new Set());
        } else {
          this.messageHandlers.set(event, new Set());
        }
      }
    }
    return this.notificationHandlers.get(event) || this.messageHandlers.get(event) || new Set();
  }

  /**
   * Notify all handlers for an event
   */
  private notifyHandlers(event: SocketEvents, data: any): void {
    const handlers = this.getHandlersForEvent(event);
    handlers.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error('Error in event handler:', error);
      }
    });
  }

  /**
   * Notify connection handlers
   */
  private notifyConnectionHandlers(connected: boolean): void {
    this.connectionHandlers.forEach((handler) => {
      try {
        handler(connected);
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }

  // ==================== Notification Methods ====================

  /**
   * Mark notification as read
   */
  markNotificationAsRead(notificationId: string): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.emit('notification:mark_read', {
      notification_id: notificationId,
      user_id: this.userId,
    });
  }

  /**
   * Mark all notifications as read
   */
  markAllNotificationsAsRead(): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.emit('notification:mark_all_read', {
      user_id: this.userId,
    });
  }

  /**
   * Delete notification
   */
  deleteNotification(notificationId: string): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.emit('notification:delete', {
      notification_id: notificationId,
      user_id: this.userId,
    });
  }

  // ==================== Message Methods ====================

  /**
   * Send message
   */
  sendMessage(conversationId: string, content: string, attachments?: string[]): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.emit('message:send', {
      conversation_id: conversationId,
      sender_id: this.userId,
      content,
      attachments: attachments || [],
    });
  }

  /**
   * Mark message as read
   */
  markMessageAsRead(messageId: string, conversationId: string): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.emit('message:mark_read', {
      message_id: messageId,
      conversation_id: conversationId,
      user_id: this.userId,
    });
  }

  /**
   * Mark all messages in conversation as read
   */
  markAllMessagesAsRead(conversationId: string): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.emit('message:mark_all_read', {
      conversation_id: conversationId,
      user_id: this.userId,
    });
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(conversationId: string, isTyping: boolean): void {
    if (!this.socket || !this.socket.connected) {
      return;
    }

    const event = isTyping ? SocketEvents.MESSAGE_TYPING : SocketEvents.MESSAGE_TYPING_STOP;
    this.socket.emit(event, {
      conversation_id: conversationId,
      user_id: this.userId,
      is_typing: isTyping,
    });
  }

  /**
   * Delete message
   */
  deleteMessage(messageId: string, conversationId: string): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.emit('message:delete', {
      message_id: messageId,
      conversation_id: conversationId,
      user_id: this.userId,
    });
  }

  /**
   * Join conversation room
   */
  joinConversation(conversationId: string): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.emit('join:conversation', {
      conversation_id: conversationId,
      user_id: this.userId,
    });
  }

  /**
   * Leave conversation room
   */
  leaveConversation(conversationId: string): void {
    if (!this.socket || !this.socket.connected) {
      return;
    }

    this.socket.emit('leave:conversation', {
      conversation_id: conversationId,
      user_id: this.userId,
    });
  }

  // ==================== Utility Methods ====================

  /**
   * Get socket instance (for advanced usage)
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Reconnect manually
   */
  reconnect(): void {
    if (this.socket && !this.socket.connected && this.userId && this.token) {
      this.socket.connect();
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();

// Export default
export default socketService;

