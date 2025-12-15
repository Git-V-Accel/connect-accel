import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { useAuth } from "./contexts/AuthContext";

// Public pages
import LandingPage from "./pages/public/LandingPage";
import LoginPage from "./pages/public/LoginPage";
import SignupPage from "./pages/public/SignupPage";
import ForgotPassword from "./pages/public/ForgotPassword";
import ResetPassword from "./pages/public/ResetPassword";
import FirstTimePasswordChange from "./pages/public/FirstTimePasswordChange";
import HowItWorksPage from "./pages/public/HowItWorksPage";
import PricingPage from "./pages/public/PricingPage";

// Client portal
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientProjects from "./pages/client/ClientProjects";
import CreateProject from "./pages/client/CreateProject";
import EditProject from "./pages/client/EditProject";
import ProjectDetail from "./pages/client/ProjectDetail";
import ClientPayments from "./pages/client/ClientPayments";
import ClientSettings from "./pages/client/ClientSettings";

// Freelancer portal
import FreelancerDashboard from "./pages/freelancer/FreelancerDashboard";
import BrowseProjects from "./pages/freelancer/BrowseProjects";
import FreelancerBids from "./pages/freelancer/FreelancerBids";
import FreelancerProjects from "./pages/freelancer/FreelancerProjects";
import FreelancerWallet from "./pages/freelancer/FreelancerWallet";
import FreelancerSettings from "./pages/freelancer/FreelancerSettings";
import ProjectDetailPage from "./pages/freelancer/ProjectDetailPage";
import ActiveProjects from "./pages/freelancer/ActiveProjects";
import ProjectWorkspace from "./pages/freelancer/ProjectWorkspace";
import EarningsPage from "./pages/freelancer/EarningsPage";
import PortfolioPage from "./pages/freelancer/PortfolioPage";
import FreelancerAnalytics from "./pages/freelancer/FreelancerAnalytics";
import OnboardingWizard from "./pages/freelancer/OnboardingWizard";
import SubmitBid from "./pages/freelancer/SubmitBid";
import FreelancerBidDetail from "./pages/freelancer/FreelancerBidDetail";
import SubmitProposal from "./pages/freelancer/SubmitProposal";

// Admin portal
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProjects from "./pages/admin/AdminProjects";
import ProjectReview from "./pages/admin/ProjectReview";
import FreelancerDetails from "./pages/admin/FreelancerDetails";
import BiddingManagement from "./pages/admin/BiddingManagement";
import AdminConsultations from "./pages/admin/AdminConsultations";
import AdminReports from "./pages/admin/AdminReports";
import AdminProjectDetail from "./pages/admin/AdminProjectDetail";
import FreelancerDetail from "./pages/admin/FreelancerDetail";
import AdminBidManagement from "./pages/admin/AdminBidManagement";
import AdminBidDetail from "./pages/admin/AdminBidDetail";
import ViewProposal from "./pages/admin/ViewProposal";
import CreateBid from "./pages/admin/CreateBid";
import AdminSettings from "./pages/admin/AdminSettings";
import AgentManagement from "./pages/admin/AgentManagement";
import ClientsManagement from "./pages/admin/ClientsManagement";
import FreelancerManagement from "./pages/admin/FreelancerManagement";
import UserDetail from "./pages/admin/UserDetail";

// Agent portal
import AgentDashboard from "./pages/agent/AgentDashboard";
import AgentProjects from "./pages/agent/AgentProjects";
import AgentFreelancers from "./pages/agent/AgentFreelancers";
import AgentClients from "./pages/agent/AgentClients";
import AgentConsultations from "./pages/agent/AgentConsultations";
import AgentBidManagement from "./pages/agent/AgentBidManagement";
import AgentFreelancerDetail from "./pages/agent/AgentFreelancerDetail";
import AgentClientDetail from "./pages/agent/AgentClientDetail";
import AgentReports from "./pages/agent/AgentReports";
import AgentSettings from "./pages/agent/AgentSettings";

// Super Admin portal
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import UserManagement from "./pages/superadmin/UserManagement";
import CreateUser from "./pages/superadmin/CreateUser";
import FinancialReports from "./pages/superadmin/FinancialReports";
import AuditLogs from "./pages/superadmin/AuditLogs";
import Analytics from "./pages/superadmin/Analytics";

// Shared
import MessagesPage from "./pages/shared/MessagesPage";
import NotificationsPage from "./pages/shared/NotificationsPage";
import SupportPage from "./pages/shared/SupportPage";
import ConsultationDetail from "./pages/shared/ConsultationDetail";
import SettingsRouter from "./pages/shared/Settings";

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={getRoleBasedRoute(user.role)} /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to={getRoleBasedRoute(user.role)} /> : <SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
      <Route path="/first-login/change-password" element={<FirstTimePasswordChange />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/pricing" element={<PricingPage />} />

      {/* Client routes */}
      <Route path="/client/dashboard" element={<ProtectedRoute allowedRoles={['client']}><ClientDashboard /></ProtectedRoute>} />
      <Route path="/client/projects" element={<ProtectedRoute allowedRoles={['client']}><ClientProjects /></ProtectedRoute>} />
      <Route path="/client/projects/new" element={<ProtectedRoute allowedRoles={['client']}><CreateProject /></ProtectedRoute>} />
      <Route path="/client/projects/:id/edit" element={<ProtectedRoute allowedRoles={['client']}><EditProject /></ProtectedRoute>} />
      <Route path="/client/projects/:id" element={<ProtectedRoute allowedRoles={['client']}><ProjectDetail /></ProtectedRoute>} />
      <Route path="/client/payments" element={<ProtectedRoute allowedRoles={['client']}><ClientPayments /></ProtectedRoute>} />
      <Route path="/client/settings" element={<ProtectedRoute allowedRoles={['client']}><ClientSettings /></ProtectedRoute>} />

      {/* Freelancer routes */}
      <Route path="/freelancer/dashboard" element={<ProtectedRoute allowedRoles={['freelancer']}><FreelancerDashboard /></ProtectedRoute>} />
      <Route path="/freelancer/projects" element={<ProtectedRoute allowedRoles={['freelancer']}><BrowseProjects /></ProtectedRoute>} />
      <Route path="/freelancer/projects/:projectId/detail" element={<ProtectedRoute allowedRoles={['freelancer']}><ProjectDetailPage /></ProtectedRoute>} />
      <Route path="/freelancer/bids" element={<ProtectedRoute allowedRoles={['freelancer']}><FreelancerBids /></ProtectedRoute>} />
      <Route path="/freelancer/active-projects" element={<ProtectedRoute allowedRoles={['freelancer']}><ActiveProjects /></ProtectedRoute>} />
      <Route path="/freelancer/workspace/:projectId" element={<ProtectedRoute allowedRoles={['freelancer']}><ProjectWorkspace /></ProtectedRoute>} />
      <Route path="/freelancer/earnings" element={<ProtectedRoute allowedRoles={['freelancer']}><EarningsPage /></ProtectedRoute>} />
      <Route path="/freelancer/portfolio" element={<ProtectedRoute allowedRoles={['freelancer']}><PortfolioPage /></ProtectedRoute>} />
      <Route path="/freelancer/analytics" element={<ProtectedRoute allowedRoles={['freelancer']}><FreelancerAnalytics /></ProtectedRoute>} />
      <Route path="/freelancer/wallet" element={<ProtectedRoute allowedRoles={['freelancer']}><FreelancerWallet /></ProtectedRoute>} />
      <Route path="/freelancer/settings" element={<ProtectedRoute allowedRoles={['freelancer']}><FreelancerSettings /></ProtectedRoute>} />
      <Route path="/freelancer/onboarding" element={<ProtectedRoute allowedRoles={['freelancer']}><OnboardingWizard /></ProtectedRoute>} />
      <Route path="/freelancer/submit-bid/:projectId" element={<ProtectedRoute allowedRoles={['freelancer']}><SubmitBid /></ProtectedRoute>} />
      <Route path="/freelancer/bids/:id/view" element={<ProtectedRoute allowedRoles={['freelancer']}><FreelancerBidDetail /></ProtectedRoute>} />
      <Route path="/freelancer/bids/:id/submit-proposal" element={<ProtectedRoute allowedRoles={['freelancer']}><SubmitProposal /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/projects" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><AdminProjects /></ProtectedRoute>} />
      <Route path="/admin/projects/:id" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><AdminProjectDetail /></ProtectedRoute>} />
      <Route path="/admin/projects/:id/review" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><ProjectReview /></ProtectedRoute>} />
      <Route path="/admin/freelancers/:id" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><FreelancerDetails /></ProtectedRoute>} />
      <Route path="/admin/freelancers/:id/detail" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><FreelancerDetail /></ProtectedRoute>} />
      <Route path="/admin/projects/:id/bids" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><BiddingManagement /></ProtectedRoute>} />
      <Route path="/admin/projects/:id/create-bid" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><CreateBid /></ProtectedRoute>} />
      <Route path="/admin/consultations" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><AdminConsultations /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><AdminReports /></ProtectedRoute>} />
      <Route path="/admin/bids" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><AdminBidManagement /></ProtectedRoute>} />
      <Route path="/admin/bids/create" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><CreateBid /></ProtectedRoute>} />
      <Route path="/admin/bids/:bidId/proposal" element={<ProtectedRoute allowedRoles={['admin', 'superadmin', 'freelancer', 'agent']}><ViewProposal /></ProtectedRoute>} />
      <Route path="/admin/bids/:id" element={<ProtectedRoute allowedRoles={['admin', 'superadmin', 'agent']}><AdminBidDetail /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><AdminSettings /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><UserManagement /></ProtectedRoute>} />
      <Route path="/admin/users/create" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><CreateUser /></ProtectedRoute>} />
      <Route path="/admin/users/:id/:type" element={<ProtectedRoute allowedRoles={['admin', 'superadmin', 'agent']}><UserDetail /></ProtectedRoute>} />
      <Route path="/admin/agents" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><AgentManagement /></ProtectedRoute>} />
      <Route path="/admin/clients" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><ClientsManagement /></ProtectedRoute>} />
      <Route path="/admin/freelancers-management" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><FreelancerManagement /></ProtectedRoute>} />

      {/* Agent routes */}
      <Route path="/agent/dashboard" element={<ProtectedRoute allowedRoles={['agent']}><AgentDashboard /></ProtectedRoute>} />
      <Route path="/agent/projects" element={<ProtectedRoute allowedRoles={['agent']}><AgentProjects /></ProtectedRoute>} />
      <Route path="/agent/projects/:id/create-bid" element={<ProtectedRoute allowedRoles={['agent']}><CreateBid /></ProtectedRoute>} />
      <Route path="/agent/projects/:id/bids" element={<ProtectedRoute allowedRoles={['agent']}><AgentBidManagement /></ProtectedRoute>} />
      <Route path="/agent/projects/:id" element={<ProtectedRoute allowedRoles={['agent']}><ProjectReview /></ProtectedRoute>} />
      <Route path="/agent/freelancers" element={<ProtectedRoute allowedRoles={['agent']}><AgentFreelancers /></ProtectedRoute>} />
      <Route path="/agent/freelancers/:id" element={<ProtectedRoute allowedRoles={['agent']}><AgentFreelancerDetail /></ProtectedRoute>} />
      <Route path="/agent/clients" element={<ProtectedRoute allowedRoles={['agent']}><AgentClients /></ProtectedRoute>} />
      <Route path="/agent/clients/:id" element={<ProtectedRoute allowedRoles={['agent']}><AgentClientDetail /></ProtectedRoute>} />
      <Route path="/agent/consultations" element={<ProtectedRoute allowedRoles={['agent']}><AgentConsultations /></ProtectedRoute>} />
      <Route path="/agent/bids" element={<ProtectedRoute allowedRoles={['agent']}><AgentBidManagement /></ProtectedRoute>} />
      <Route path="/agent/bids/create" element={<ProtectedRoute allowedRoles={['agent']}><CreateBid /></ProtectedRoute>} />
      <Route path="/agent/reports" element={<ProtectedRoute allowedRoles={['agent']}><AgentReports /></ProtectedRoute>} />
      <Route path="/agent/settings" element={<ProtectedRoute allowedRoles={['agent']}><AgentSettings /></ProtectedRoute>} />

      {/* Super Admin routes */}
      <Route path="/superadmin/dashboard" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminDashboard /></ProtectedRoute>} />
      <Route path="/superadmin/users" element={<ProtectedRoute allowedRoles={['superadmin']}><UserManagement /></ProtectedRoute>} />
      <Route path="/admin/users/create" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><CreateUser /></ProtectedRoute>} />
      <Route path="/superadmin/settings" element={<ProtectedRoute allowedRoles={['superadmin']}><AdminSettings /></ProtectedRoute>} />
      <Route path="/superadmin/financials" element={<ProtectedRoute allowedRoles={['superadmin']}><FinancialReports /></ProtectedRoute>} />
      <Route path="/superadmin/audit" element={<ProtectedRoute allowedRoles={['superadmin']}><AuditLogs /></ProtectedRoute>} />
      <Route path="/superadmin/analytics" element={<ProtectedRoute allowedRoles={['superadmin']}><Analytics /></ProtectedRoute>} />

      {/* Shared routes */}
      <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
      <Route path="/consultation/:id" element={<ProtectedRoute><ConsultationDetail /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsRouter /></ProtectedRoute>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function getRoleBasedRoute(role: string): string {
  const routes: Record<string, string> = {
    client: '/client/dashboard',
    freelancer: '/freelancer/dashboard',
    admin: '/admin/dashboard',
    superadmin: '/superadmin/dashboard',
    agent: '/agent/dashboard',
  };
  return routes[role] || '/';
}

function AppWithTheme() {
  const muiTheme = createTheme({
    palette: {
      mode: 'light',
    },
  });

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
          <Toaster />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AppWithTheme />
      </NextThemeProvider>
    </BrowserRouter>
  );
}