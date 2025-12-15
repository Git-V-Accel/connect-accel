import { useEffect, useRef, useState } from 'react';
import { socketService } from '../services/socketService';
import { SocketEvents, NotificationPayload, MessagePayload, CustomMessagePayload } from '../constants/socketConstants';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for socket connection and event handling
 */
export function useSocket() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const handlersRef = useRef<Array<() => void>>([]);

  useEffect(() => {
    if (!user) {
      socketService.disconnect();
      return;
    }

    // Connect socket
    const token = sessionStorage.getItem('auth_token') || '';
    if (token && user.id) {
      socketService.connect(user.id, token);
    }

    // Listen to connection changes
    const unsubscribeConnection = socketService.onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    // Cleanup
    return () => {
      unsubscribeConnection();
      handlersRef.current.forEach((unsubscribe) => unsubscribe());
      handlersRef.current = [];
    };
  }, [user]);

  /**
   * Register notification event handler
   */
  const onNotification = (
    event: SocketEvents,
    handler: (data: NotificationPayload) => void
  ) => {
    if (!user) return () => {};

    const unsubscribe = socketService.on(event, handler);
    handlersRef.current.push(unsubscribe);
    return unsubscribe;
  };

  /**
   * Register message event handler
   */
  const onMessage = (
    event: SocketEvents,
    handler: (data: MessagePayload) => void
  ) => {
    if (!user) return () => {};

    const unsubscribe = socketService.on(event, handler);
    handlersRef.current.push(unsubscribe);
    return unsubscribe;
  };

  /**
   * Register custom message event handler
   */
  const onCustomMessage = (
    event: SocketEvents,
    handler: (data: CustomMessagePayload) => void
  ) => {
    if (!user) return () => {};

    const unsubscribe = socketService.on(event, handler);
    handlersRef.current.push(unsubscribe);
    return unsubscribe;
  };

  /**
   * Register generic event handler
   */
  const onEvent = (event: SocketEvents, handler: (data: any) => void) => {
    if (!user) return () => {};

    const unsubscribe = socketService.on(event, handler);
    handlersRef.current.push(unsubscribe);
    return unsubscribe;
  };

  return {
    isConnected,
    socketService,
    onNotification,
    onMessage,
    onCustomMessage,
    onEvent,
  };
}

