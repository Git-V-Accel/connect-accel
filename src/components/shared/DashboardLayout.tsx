import React, { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { 
  LayoutDashboard, 
  FolderKanban, 
  MessageSquare, 
  Bell, 
  Settings, 
  LogOut,
  Menu,
  User,
  Briefcase,
  Wallet,
  UserCircle,
  FileText,
  Users,
  DollarSign,
  AlertCircle,
  BarChart,
  Shield,
  Database,
  Activity,
  Gavel,
  Mail
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

export default function DashboardLayout({ children }: { children?: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user) return null;

  const getNavItems = (): NavItem[] => {
    switch (user.role) {
      case 'client':
        return [
          { label: 'Dashboard', icon: <LayoutDashboard className="size-5" />, path: '/client/dashboard' },
          { label: 'Projects', icon: <FolderKanban className="size-5" />, path: '/client/projects' },
          { label: 'Consultations', icon: <Users className="size-5" />, path: '/client/consultations' },
          { label: 'Payments', icon: <DollarSign className="size-5" />, path: '/client/payments' },
          { label: 'Messages', icon: <MessageSquare className="size-5" />, path: '/messages' },
          { label: 'Settings', icon: <Settings className="size-5" />, path: '/client/settings' },
        ];
      
      case 'freelancer':
        return [
          { label: 'Dashboard', icon: <LayoutDashboard className="size-5" />, path: '/freelancer/dashboard' },
          { label: 'Browse Projects', icon: <FolderKanban className="size-5" />, path: '/freelancer/projects' },
          { label: 'Bid Invitations', icon: <Mail className="size-5" />, path: '/freelancer/bid-invitations' },
          { label: 'My Bids', icon: <FileText className="size-5" />, path: '/freelancer/bids' },
          { label: 'Active Projects', icon: <Briefcase className="size-5" />, path: '/freelancer/active-projects' },
          { label: 'Earnings', icon: <DollarSign className="size-5" />, path: '/freelancer/earnings' },
          { label: 'Portfolio', icon: <Briefcase className="size-5" />, path: '/freelancer/portfolio' },
          { label: 'Analytics', icon: <BarChart className="size-5" />, path: '/freelancer/analytics' },
          { label: 'Profile', icon: <UserCircle className="size-5" />, path: '/freelancer/profile' },
          { label: 'Messages', icon: <MessageSquare className="size-5" />, path: '/messages' },
          { label: 'Settings', icon: <Settings className="size-5" />, path: '/freelancer/settings' },
        ];
      
      case 'admin':
        return [
          { label: 'Dashboard', icon: <LayoutDashboard className="size-5" />, path: '/admin/dashboard' },
          { label: 'Projects', icon: <FolderKanban className="size-5" />, path: '/admin/projects' },
          { label: 'Bidding', icon: <FileText className="size-5" />, path: '/admin/bids' },
          { label: 'Freelancers', icon: <Users className="size-5" />, path: '/admin/freelancers' },
          { label: 'Consultations', icon: <Users className="size-5" />, path: '/admin/consultations' },
          { label: 'Disputes', icon: <AlertCircle className="size-5" />, path: '/admin/disputes' },
          { label: 'Reports', icon: <BarChart className="size-5" />, path: '/admin/reports' },
          { label: 'Messages', icon: <MessageSquare className="size-5" />, path: '/messages' },
        ];
      
      case 'superadmin':
        return [
          { label: 'Dashboard', icon: <LayoutDashboard className="size-5" />, path: '/superadmin/dashboard' },
          { label: 'Users', icon: <Users className="size-5" />, path: '/superadmin/users' },
          { label: 'Configuration', icon: <Settings className="size-5" />, path: '/superadmin/settings' },
          { label: 'Financials', icon: <DollarSign className="size-5" />, path: '/superadmin/financials' },
          { label: 'Disputes', icon: <AlertCircle className="size-5" />, path: '/superadmin/disputes' },
          { label: 'Audit Logs', icon: <Database className="size-5" />, path: '/superadmin/audit' },
          { label: 'Analytics', icon: <Activity className="size-5" />, path: '/superadmin/analytics' },
        ];
      
      case 'agent':
        return [
          { label: 'Dashboard', icon: <LayoutDashboard className="size-5" />, path: '/agent/dashboard' },
          { label: 'Projects', icon: <FolderKanban className="size-5" />, path: '/agent/projects' },
          { label: 'Create Bid', icon: <FileText className="size-5" />, path: '/agent/bids/create' },
          { label: 'Freelancers', icon: <Users className="size-5" />, path: '/agent/freelancers' },
          { label: 'Clients', icon: <UserCircle className="size-5" />, path: '/agent/clients' },
          { label: 'Consultations', icon: <Users className="size-5" />, path: '/agent/consultations' },
          { label: 'Reports', icon: <BarChart className="size-5" />, path: '/agent/reports' },
          { label: 'Messages', icon: <MessageSquare className="size-5" />, path: '/messages' },
          { label: 'Settings', icon: <Settings className="size-5" />, path: '/agent/settings' },
        ];
      
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 fixed w-full z-10 top-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 lg:hidden"
              >
                <Menu className="size-6" />
              </button>
              <Link to="/" className="flex items-center ml-4 lg:ml-0">
                <div className="flex items-center gap-2">
                  <div className="size-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Shield className="size-5 text-white" />
                  </div>
                  <span className="text-xl">Connect-Accel</span>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/notifications')}>
                <Bell className="size-5" />
                <span className="ml-2 size-2 bg-red-500 rounded-full"></span>
              </Button>
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <div className="text-sm">{user.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="size-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside 
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-5 w-64 bg-white border-r border-gray-200 pt-16 transition-transform duration-300 ease-in-out lg:translate-x-0`}
        >
          <nav className="mt-5 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                              (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 ${sidebarOpen ? 'lg:ml-64' : ''} transition-margin duration-300`}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}