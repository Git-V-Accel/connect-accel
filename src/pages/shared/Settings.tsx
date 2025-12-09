import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ClientSettings from '../client/ClientSettings';
import FreelancerSettings from '../freelancer/FreelancerSettings';
import AgentSettings from '../agent/AgentSettings';
import AdminSettings from '../admin/AdminSettings';

/**
 * Common Settings entry point that routes to the role-specific settings page.
 */
export default function SettingsRouter() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'client':
      return <ClientSettings />;
    case 'freelancer':
      return <FreelancerSettings />;
    case 'agent':
      return <AgentSettings />;
    case 'admin':
    case 'superadmin':
      return <AdminSettings />;
    default:
      return <ClientSettings />;
  }
}

