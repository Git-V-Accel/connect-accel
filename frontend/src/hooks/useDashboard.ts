import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from './useSocket';
import { SocketEvents } from '../constants/socketConstants';
import {
  dashboardService,
  SuperAdminDashboardResponse,
  AdminDashboardResponse,
  AgentDashboardResponse,
  ClientDashboardResponse,
  FreelancerDashboardResponse,
} from '../services/dashboardService';

export type DashboardData =
  | { role: 'superadmin'; data: SuperAdminDashboardResponse }
  | { role: 'admin'; data: AdminDashboardResponse }
  | { role: 'agent'; data: AgentDashboardResponse }
  | { role: 'client'; data: ClientDashboardResponse }
  | { role: 'freelancer'; data: FreelancerDashboardResponse };

export function useDashboard() {
  const { user } = useAuth();
  const { onEvent } = useSocket();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  const refreshTimerRef = useRef<number | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!user) return;

    setError(null);
    setLoading(true);

    try {
      if (user.role === 'superadmin') {
        const data = await dashboardService.getSuperAdminDashboard();
        setDashboard({ role: 'superadmin', data });
      } else if (user.role === 'admin') {
        const data = await dashboardService.getAdminDashboard();
        setDashboard({ role: 'admin', data });
      } else if (user.role === 'agent') {
        const data = await dashboardService.getAgentDashboard();
        setDashboard({ role: 'agent', data });
      } else if (user.role === 'client') {
        const data = await dashboardService.getClientDashboard();
        setDashboard({ role: 'client', data });
      } else if (user.role === 'freelancer') {
        const data = await dashboardService.getFreelancerDashboard();
        setDashboard({ role: 'freelancer', data });
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onEvent(SocketEvents.DASHBOARD_REFRESH, () => {
      // Basic throttle to avoid hammering API when multiple events arrive
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
      }
      refreshTimerRef.current = window.setTimeout(() => {
        fetchDashboard();
      }, 250);
    });

    return () => {
      unsubscribe();
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [user, onEvent, fetchDashboard]);

  return {
    loading,
    error,
    dashboard,
    refetch: fetchDashboard,
  };
}
