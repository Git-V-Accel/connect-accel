// This is a helper file listing all pages that need to be created
// Each page will be a functional placeholder component

export const PAGES_TO_CREATE = {
  public: [
    { path: '/pages/public/HowItWorksPage.tsx', title: 'How It Works' },
    { path: '/pages/public/PricingPage.tsx', title: 'Pricing' },
  ],
  client: [
    { path: '/pages/client/ClientProjects.tsx', title: 'My Projects' },
    { path: '/pages/client/CreateProject.tsx', title: 'Create New Project' },
    { path: '/pages/client/ProjectDetail.tsx', title: 'Project Details' },
    { path: '/pages/client/ClientConsultations.tsx', title: 'Consultations' },
    { path: '/pages/client/ClientPayments.tsx', title: 'Payments & Invoices' },
    { path: '/pages/client/ClientSettings.tsx', title: 'Settings' },
  ],
  freelancer: [
    { path: '/pages/freelancer/FreelancerDashboard.tsx', title: 'Dashboard' },
    { path: '/pages/freelancer/BrowseProjects.tsx', title: 'Browse Projects' },
    { path: '/pages/freelancer/FreelancerBids.tsx', title: 'My Bids' },
    { path: '/pages/freelancer/FreelancerProjects.tsx', title: 'Active Projects' },
    { path: '/pages/freelancer/FreelancerWallet.tsx', title: 'Wallet & Earnings' },
    { path: '/pages/freelancer/FreelancerProfile.tsx', title: 'My Profile' },
    { path: '/pages/freelancer/FreelancerSettings.tsx', title: 'Settings' },
  ],
  admin: [
    { path: '/pages/admin/AdminDashboard.tsx', title: 'Admin Dashboard' },
    { path: '/pages/admin/AdminProjects.tsx', title: 'All Projects' },
    { path: '/pages/admin/ProjectReview.tsx', title: 'Review Project' },
    { path: '/pages/admin/FreelancerDirectory.tsx', title: 'Freelancer Directory' },
    { path: '/pages/admin/BiddingManagement.tsx', title: 'Manage Bids' },
    { path: '/pages/admin/AdminConsultations.tsx', title: 'Consultations' },
    { path: '/pages/admin/AdminDisputes.tsx', title: 'Disputes' },
    { path: '/pages/admin/AdminReports.tsx', title: 'Reports' },
  ],
  superadmin: [
    { path: '/pages/superadmin/SuperAdminDashboard.tsx', title: 'Super Admin Dashboard' },
    { path: '/pages/superadmin/UserManagement.tsx', title: 'User Management' },
    { path: '/pages/superadmin/FinancialReports.tsx', title: 'Financial Reports' },
    { path: '/pages/superadmin/DisputeEscalations.tsx', title: 'Dispute Escalations' },
    { path: '/pages/superadmin/AuditLogs.tsx', title: 'Audit Logs' },
    { path: '/pages/superadmin/Analytics.tsx', title: 'Analytics' },
  ],
  shared: [
    { path: '/pages/shared/MessagesPage.tsx', title: 'Messages' },
    { path: '/pages/shared/NotificationsPage.tsx', title: 'Notifications' },
    { path: '/pages/shared/SupportPage.tsx', title: 'Help & Support' },
  ],
};
