import React, { ReactNode, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import { Button } from "../ui/button";
import { ThemeSwitch } from "../common/ThemeSwitch";
import { useTheme } from "next-themes";
import { NotificationsDrawer } from "./NotificationsDrawer";
import { useSocket } from "../../hooks/useSocket";
import { SocketEvents } from "../../constants/socketConstants";
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
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

export default function DashboardLayout({
  children,
}: {
  children?: ReactNode;
}) {
  const { user, logout } = useAuth();
  const { getUserNotifications, createNotification } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { onNotification } = useSocket();

  // Listen for real-time notifications via socket
  useEffect(() => {
    if (!user) return;

    // Listen for new notifications
    const unsubscribe = onNotification(
      SocketEvents.NOTIFICATION_CREATED,
      (notification) => {
        // Only process notifications for the current user
        if (notification.user_id === user.id) {
          // Add notification to local state
          createNotification({
            user_id: notification.user_id,
            type: notification.type,
            title: notification.title,
            description: notification.description,
            link: notification.link,
          });
        }
      }
    );

    return unsubscribe;
  }, [user, onNotification, createNotification]);

  const unreadCount = user ? getUserNotifications(user.id).filter(n => !n.read).length : 0;

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!user) return null;

  const getNavItems = (): NavItem[] => {
    switch (user.role) {
      case "client":
        return [
          {
            label: "Dashboard",
            icon: <LayoutDashboard className="size-5" />,
            path: "/client/dashboard",
          },
          {
            label: "Projects",
            icon: <FolderKanban className="size-5" />,
            path: "/client/projects",
          },
          {
            label: "Payments",
            icon: <DollarSign className="size-5" />,
            path: "/client/payments",
          },
          {
            label: "Messages",
            icon: <MessageSquare className="size-5" />,
            path: "/messages",
          },
          
        ];

      case "freelancer":
        return [
          {
            label: "Dashboard",
            icon: <LayoutDashboard className="size-5" />,
            path: "/freelancer/dashboard",
          },
          {
            label: "Browse Projects",
            icon: <FolderKanban className="size-5" />,
            path: "/freelancer/projects",
          },
          {
            label: "Bid Invitations",
            icon: <Mail className="size-5" />,
            path: "/freelancer/bid-invitations",
          },
          {
            label: "My Bids",
            icon: <FileText className="size-5" />,
            path: "/freelancer/bids",
          },
          {
            label: "Active Projects",
            icon: <Briefcase className="size-5" />,
            path: "/freelancer/active-projects",
          },
          {
            label: "Earnings",
            icon: <DollarSign className="size-5" />,
            path: "/freelancer/earnings",
          },
          {
            label: "Portfolio",
            icon: <Briefcase className="size-5" />,
            path: "/freelancer/portfolio",
          },
          {
            label: "Analytics",
            icon: <BarChart className="size-5" />,
            path: "/freelancer/analytics",
          },
          {
            label: "Profile",
            icon: <UserCircle className="size-5" />,
            path: "/freelancer/profile",
          },
          {
            label: "Messages",
            icon: <MessageSquare className="size-5" />,
            path: "/messages",
          },
         
        ];

      case "admin":
        return [
          {
            label: "Dashboard",
            icon: <LayoutDashboard className="size-5" />,
            path: "/admin/dashboard",
          },
          {
            label: "Projects",
            icon: <FolderKanban className="size-5" />,
            path: "/admin/projects",
          },
          {
            label: "Bidding",
            icon: <FileText className="size-5" />,
            path: "/admin/bids",
          },
          {
            label: "Freelancers",
            icon: <Briefcase className="size-5" />,
            path: "/admin/freelancers-management",
          },
          {
            label: "Consultations",
            icon: <Users className="size-5" />,
            path: "/admin/consultations",
          },
          {
            label: "Users",
            icon: <Users className="size-5" />,
            path: "/admin/users",
          },
          {
            label: "Agents",
            icon: <Shield className="size-5" />,
            path: "/admin/agents",
          },
          {
            label: "Clients",
            icon: <User className="size-5" />,
            path: "/admin/clients",
          },
          {
            label: "Reports",
            icon: <BarChart className="size-5" />,
            path: "/admin/reports",
          },
          {
            label: "Messages",
            icon: <MessageSquare className="size-5" />,
            path: "/messages",
          },
        ];

      case "superadmin":
        return [
          {
            label: "Dashboard",
            icon: <LayoutDashboard className="size-5" />,
            path: "/superadmin/dashboard",
          },
          {
            label: "Users",
            icon: <Users className="size-5" />,
            path: "/superadmin/users",
          },
          {
            label: "Projects",
            icon: <FolderKanban className="size-5" />,
            path: "/admin/projects",
          },
          {
            label: "Freelancers",
            icon: <Briefcase className="size-5" />,
            path: "/admin/freelancers-management",
          },
          {
            label: "Agents",
            icon: <Shield className="size-5" />,
            path: "/admin/agents",
          },
          {
            label: "Clients",
            icon: <User className="size-5" />,
            path: "/admin/clients",
          },
          {
            label: "Financials",
            icon: <DollarSign className="size-5" />,
            path: "/superadmin/financials",
          },
          {
            label: "Audit Logs",
            icon: <Database className="size-5" />,
            path: "/superadmin/audit",
          },
          {
            label: "Analytics",
            icon: <Activity className="size-5" />,
            path: "/superadmin/analytics",
          },
        ];

      case "agent":
        return [
          {
            label: "Dashboard",
            icon: <LayoutDashboard className="size-5" />,
            path: "/agent/dashboard",
          },
          {
            label: "Projects",
            icon: <FolderKanban className="size-5" />,
            path: "/agent/projects",
          },
          {
            label: "Create Bid",
            icon: <FileText className="size-5" />,
            path: "/agent/bids/create",
          },
          {
            label: "Freelancers",
            icon: <Users className="size-5" />,
            path: "/agent/freelancers",
          },
          {
            label: "Clients",
            icon: <UserCircle className="size-5" />,
            path: "/agent/clients",
          },
          {
            label: "Consultations",
            icon: <Users className="size-5" />,
            path: "/agent/consultations",
          },
          {
            label: "Clients",
            icon: <User className="size-5" />,
            path: "/admin/clients",
          },
          {
            label: "Reports",
            icon: <BarChart className="size-5" />,
            path: "/agent/reports",
          },
          {
            label: "Messages",
            icon: <MessageSquare className="size-5" />,
            path: "/messages",
          },
          
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // constants for widths used in styles (keep in sync with tailwind w-64 and w-20)
  const SIDEBAR_OPEN_PX = 256; // 16rem
  const SIDEBAR_CLOSED_PX = 64; // 5rem

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav (unchanged) */}
      <nav className="bg-white border-b border-gray-200 fixed w-full z-10 top-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 lg:hidden"
              >
                <Menu className="w-6 h-6" />
              </button>
              <Link to="/" className="flex items-center ml-4 lg:ml-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl">Connect-Accel</span>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {mounted && (
                <ThemeSwitch
                  checked={theme === "dark"}
                  // onChange={(e, checked) => setTheme(checked ? "dark" : "light")}
                  // onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                />
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setNotificationsOpen(true)}
                className="relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <div className="text-sm">{user.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Smooth-width Sidebar */}
        <aside
          aria-hidden={false}
          // use inline style to animate width smoothly
          style={{
            width: sidebarOpen ? `${SIDEBAR_OPEN_PX}px` : `${SIDEBAR_CLOSED_PX}px`,
            transition: "width 300ms cubic-bezier(0.2,0.8,0.2,1)",
            willChange: "width",
          }}
          className={`fixed inset-y-0 left-0 z-20 bg-white border-r border-gray-200 pt-16 overflow-hidden`}
        >
          {/* Optional internal padding changes */}
          <div
            className="h-full flex flex-col"
            style={{
              transition: "padding 300ms cubic-bezier(0.2,0.8,0.2,1)",
              paddingLeft: sidebarOpen ? 16 : 8,
              paddingRight: sidebarOpen ? 16 : 8,
            }}
          >
            <nav className="mt-5 flex-1">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path !== "/admin/dashboard" && location.pathname.startsWith(item.path));

                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        title={!sidebarOpen ? item.label : undefined}
                        className={`group flex items-center gap-3 py-2 rounded-lg transition-colors ${
                          isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                        }`}
                        style={{
                          // ensure content doesn't jump while width animates
                          alignItems: "center",
                        }}
                      >
                        <span className="flex-shrink-0 flex items-center justify-center" style={{ width: 24 }}>
                          {/* icon already sized */}
                          {item.icon}
                        </span>

                        {/* label: animate opacity + translate */}
                        <span
                          className="whitespace-nowrap text-sm"
                          aria-hidden={!sidebarOpen}
                          style={{
                            transition: "opacity 220ms ease, transform 220ms ease",
                            opacity: sidebarOpen ? 1 : 0,
                            transform: sidebarOpen ? "translateX(0)" : "translateX(-6px)",
                            // prevent label from taking layout when collapsed
                            display: "inline-block",
                          }}
                        >
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Footer actions inside sidebar */}
            <div className="p-3">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/${user.role}/settings`)}>
                <div className="flex-shrink-0">
                  <UserCircle className="w-6 h-6 text-gray-500" />
                </div>
                <div
                  style={{
                    transition: "opacity 220ms ease, transform 220ms ease",
                    opacity: sidebarOpen ? 1 : 0,
                    transform: sidebarOpen ? "translateX(0)" : "translateX(-6px)",
                    display: "inline-block",
                  }}
                >
                  <div className="text-sm">{user.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Floating toggle button (fixed) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          style={{
            position: "fixed",
            left: sidebarOpen ? `${SIDEBAR_OPEN_PX}px` : `${SIDEBAR_CLOSED_PX}px`,
            top: "40vh",
            transform: "translate(-50%, -50%)",
            zIndex: 60,
            width: 36,
            height: 36,
            transition: "left 300ms cubic-bezier(0.2,0.8,0.2,1), transform 300ms cubic-bezier(0.2,0.8,0.2,1)",
            willChange: "left, transform",
          }}
          className="flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
        >
          <span className={`inline-block transition-transform duration-300 ${sidebarOpen ? "rotate-0" : "rotate-180"}`}>
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </span>
        </button>

        {/* Main Content: animate margin to match sidebar width */}
        <main
          className="flex-1"
          style={{
            transition: "margin-left 300ms cubic-bezier(0.2,0.8,0.2,1)",
            marginLeft: sidebarOpen ? `${SIDEBAR_OPEN_PX}px` : `${SIDEBAR_CLOSED_PX}px`,
          }}
        >
          <div className="p-6">{children}</div>
        </main>
      </div>

      {/* Notifications Drawer */}
      <NotificationsDrawer 
        open={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />
    </div>
  );
}
