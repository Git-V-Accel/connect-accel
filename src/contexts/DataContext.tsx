import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Types
export interface Project {
  id: string;
  title: string;
  description: string;
  client_id: string;
  client_name: string;
  freelancer_id?: string;
  freelancer_name?: string;
  assigned_agent_id?: string;
  agent_margin_percentage?: number;
  status: 'draft' | 'pending_review' | 'in_bidding' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'disputed' | 'open';
  category: string;
  skills_required: string[];
  budget: number;
  client_budget: number;
  freelancer_budget?: number;
  margin?: number;
  duration_weeks: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  admin_id?: string;
  admin_name?: string;
  priority: 'low' | 'medium' | 'high';
  complexity: 'simple' | 'moderate' | 'complex';
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected' | 'paid';
  submission_date?: string;
  submission_notes?: string;
  approval_date?: string;
  order: number;
}

export interface Bid {
  id: string;
  project_id: string;
  freelancer_id: string;
  freelancer_name: string;
  freelancer_rating: number;
  amount: number;
  duration_weeks?: number;
  estimated_duration?: string;
  proposal?: string;
  cover_letter?: string;
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn' | 'under_review';
  created_at: string;
  submitted_at: string;
  admin_notes?: string;
  invited?: boolean;
  invitation_id?: string;
  milestones?: Array<{
    title: string;
    description: string;
    amount: number;
    duration: string;
  }>;
}

export interface BidInvitation {
  id: string;
  project_id: string;
  freelancer_id: string;
  freelancer_name: string;
  budget_min: number;
  budget_max: number;
  deadline: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  invited_by: string;
  invited_by_name: string;
  created_at: string;
  responded_at?: string;
}

export interface Consultation {
  id: string;
  client_id: string;
  client_name?: string;
  admin_id?: string;
  admin_name?: string;
  agent_id?: string;
  scheduled_date: string;
  duration: number;
  duration_minutes?: number;
  type: 'video' | 'phone' | 'in_person';
  status: 'requested' | 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  meeting_link?: string;
  notes?: string | null;
  outcome?: string | null;
  project_id?: string;
  fee?: number;
  paid?: boolean;
}

export interface Payment {
  id: string;
  project_id: string;
  milestone_id?: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  type: 'escrow' | 'milestone' | 'withdrawal' | 'refund';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}

export interface Dispute {
  id: string;
  project_id: string;
  raised_by: string;
  raised_by_name: string;
  raised_by_role: string;
  subject: string;
  description: string;
  status: 'open' | 'in_review' | 'resolved' | 'escalated';
  priority: 'low' | 'medium' | 'high';
  admin_id?: string;
  admin_notes?: string;
  resolution?: string;
  created_at: string;
  resolved_at?: string;
}

export interface Message {
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

export interface Conversation {
  id: string;
  project_id?: string;
  participants: Array<{ id: string; name: string; role: string }>;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'project' | 'milestone' | 'payment' | 'message' | 'bid' | 'dispute';
  title: string;
  description: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export interface Freelancer {
  id: string;
  name: string;
  email: string;
  title: string;
  bio: string;
  skills: string[];
  hourly_rate: number;
  rating: number;
  total_reviews: number;
  availability: 'available' | 'busy' | 'unavailable';
  member_since: string;
  portfolio?: Array<{
    title: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    year: number;
  }>;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  location?: string;
  created_at: string;
}

interface DataContextType {
  projects: Project[];
  milestones: Milestone[];
  bids: Bid[];
  bidInvitations: BidInvitation[];
  consultations: Consultation[];
  payments: Payment[];
  disputes: Dispute[];
  freelancers: Freelancer[];
  clients: Client[];
  messages: Message[];
  conversations: Conversation[];
  notifications: Notification[];
  
  // Project methods
  createProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  getProject: (id: string) => Project | undefined;
  getProjectsByUser: (userId: string, role: string) => Project[];
  getProjectsByAgent: (agentId: string) => Project[];
  
  // Milestone methods
  createMilestone: (milestone: Omit<Milestone, 'id'>) => Milestone;
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
  getMilestonesByProject: (projectId: string) => Milestone[];
  
  // Bid methods
  createBid: (bid: Omit<Bid, 'id' | 'created_at'>) => Bid;
  updateBid: (id: string, updates: Partial<Bid>) => void;
  getBidsByProject: (projectId: string) => Bid[];
  getBidsByFreelancer: (freelancerId: string) => Bid[];
  getBidsByAgent: (agentId: string) => Bid[];
  
  // Bid Invitation methods
  createBidInvitation: (invitation: Omit<BidInvitation, 'id' | 'created_at'>) => BidInvitation;
  updateBidInvitation: (id: string, updates: Partial<BidInvitation>) => void;
  getBidInvitationsByProject: (projectId: string) => BidInvitation[];
  getBidInvitationsByFreelancer: (freelancerId: string) => BidInvitation[];
  
  // Consultation methods
  createConsultation: (consultation: Omit<Consultation, 'id'>) => Consultation;
  updateConsultation: (id: string, updates: Partial<Consultation>) => void;
  getConsultationsByUser: (userId: string, role: string) => Consultation[];
  
  // Payment methods
  createPayment: (payment: Omit<Payment, 'id' | 'created_at'>) => Payment;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  getPaymentsByProject: (projectId: string) => Payment[];
  getPaymentsByUser: (userId: string) => Payment[];
  
  // Dispute methods
  createDispute: (dispute: Omit<Dispute, 'id' | 'created_at'>) => Dispute;
  updateDispute: (id: string, updates: Partial<Dispute>) => void;
  getDisputesByProject: (projectId: string) => Dispute[];
  
  // Message methods
  sendMessage: (message: Omit<Message, 'id' | 'created_at' | 'read'>) => Message;
  markMessageAsRead: (id: string) => void;
  getConversation: (conversationId: string) => Message[];
  getUserConversations: (userId: string) => Conversation[];
  
  // Notification methods
  createNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => Notification;
  markNotificationAsRead: (id: string) => void;
  getUserNotifications: (userId: string) => Notification[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock initial data
const generateMockData = (currentUserId: string, currentUserRole: string) => {
  const now = new Date().toISOString();
  
  const projects: Project[] = [
    {
      id: 'proj_1',
      title: 'E-commerce Website Development',
      description: 'Build a full-featured e-commerce platform with product catalog, shopping cart, payment integration, admin dashboard, and order management system. Must support 10,000+ products and handle high traffic.',
      client_id: currentUserRole === 'client' ? currentUserId : 'client_1',
      client_name: currentUserRole === 'client' ? 'You' : 'Acme Corp',
      freelancer_id: currentUserRole === 'freelancer' ? currentUserId : 'freelancer_1',
      freelancer_name: currentUserRole === 'freelancer' ? 'You' : 'Ravi Kumar',
      status: 'in_progress',
      category: 'Web Development',
      skills_required: ['React', 'Node.js', 'MongoDB', 'Stripe', 'Redux', 'TypeScript'],
      budget: 150000,
      client_budget: 150000,
      freelancer_budget: 120000,
      margin: 30000,
      duration_weeks: 8,
      start_date: '2025-11-01',
      end_date: '2025-12-27',
      created_at: '2025-10-15T10:00:00Z',
      updated_at: now,
      admin_id: 'admin_1',
      admin_name: 'Sarah Admin',
      priority: 'high',
      complexity: 'complex',
    },
    {
      id: 'proj_2',
      title: 'Mobile App MVP - Fitness Tracker',
      description: 'Develop a minimum viable product for a fitness tracking mobile app with workout logging, progress charts, social features, and wearable device integration.',
      client_id: currentUserRole === 'client' ? currentUserId : 'client_2',
      client_name: currentUserRole === 'client' ? 'You' : 'FitTech Solutions',
      status: 'in_bidding',
      category: 'Mobile Development',
      skills_required: ['React Native', 'Firebase', 'UI/UX', 'Health APIs'],
      budget: 200000,
      client_budget: 200000,
      duration_weeks: 10,
      created_at: '2025-11-20T14:30:00Z',
      updated_at: now,
      admin_id: 'admin_1',
      admin_name: 'Sarah Admin',
      priority: 'medium',
      complexity: 'moderate',
    },
    {
      id: 'proj_3',
      title: 'API Integration Project',
      description: 'Integrate third-party APIs for payment processing (Razorpay, Stripe), email notifications (SendGrid), and SMS alerts (Twilio). Include error handling and logging.',
      client_id: currentUserRole === 'client' ? currentUserId : 'client_3',
      client_name: currentUserRole === 'client' ? 'You' : 'StartupXYZ',
      freelancer_id: currentUserRole === 'freelancer' ? currentUserId : 'freelancer_2',
      freelancer_name: currentUserRole === 'freelancer' ? 'You' : 'Priya Singh',
      status: 'in_progress',
      category: 'Backend Development',
      skills_required: ['Python', 'REST API', 'AWS', 'Django'],
      budget: 75000,
      client_budget: 75000,
      freelancer_budget: 60000,
      margin: 15000,
      duration_weeks: 4,
      start_date: '2025-11-10',
      end_date: '2025-12-08',
      created_at: '2025-10-25T09:00:00Z',
      updated_at: now,
      admin_id: 'admin_2',
      admin_name: 'Mike Admin',
      priority: 'high',
      complexity: 'simple',
    },
    {
      id: 'proj_4',
      title: 'CRM System Development',
      description: 'Build a comprehensive Customer Relationship Management system with lead tracking, sales pipeline, reporting dashboard, and email automation.',
      client_id: 'client_4',
      client_name: 'TechVentures Ltd',
      freelancer_id: 'freelancer_3',
      freelancer_name: 'Amit Patel',
      status: 'completed',
      category: 'Web Development',
      skills_required: ['Vue.js', 'Laravel', 'MySQL', 'Chart.js'],
      budget: 250000,
      client_budget: 250000,
      freelancer_budget: 200000,
      margin: 50000,
      duration_weeks: 12,
      start_date: '2025-08-01',
      end_date: '2025-10-24',
      created_at: '2025-07-10T09:00:00Z',
      updated_at: '2025-10-25T10:00:00Z',
      admin_id: 'admin_1',
      admin_name: 'Sarah Admin',
      priority: 'high',
      complexity: 'complex',
    },
    {
      id: 'proj_5',
      title: 'Social Media Dashboard',
      description: 'Create a social media management dashboard with post scheduling, analytics, multi-account support for Instagram, Twitter, and Facebook.',
      client_id: 'client_5',
      client_name: 'Marketing Pro Agency',
      status: 'pending_review',
      category: 'Web Development',
      skills_required: ['React', 'Node.js', 'PostgreSQL', 'Social Media APIs'],
      budget: 180000,
      client_budget: 180000,
      duration_weeks: 8,
      created_at: '2025-11-28T10:00:00Z',
      updated_at: now,
      priority: 'medium',
      complexity: 'moderate',
    },
    {
      id: 'proj_6',
      title: 'Inventory Management System',
      description: 'Develop a cloud-based inventory management system with barcode scanning, stock alerts, supplier management, and detailed reporting.',
      client_id: 'client_6',
      client_name: 'RetailMax Inc',
      freelancer_id: 'freelancer_4',
      freelancer_name: 'Neha Sharma',
      status: 'in_progress',
      category: 'Web Development',
      skills_required: ['Angular', 'Spring Boot', 'MySQL', 'AWS'],
      budget: 300000,
      client_budget: 300000,
      freelancer_budget: 240000,
      margin: 60000,
      duration_weeks: 14,
      start_date: '2025-10-15',
      end_date: '2026-01-15',
      created_at: '2025-09-20T08:00:00Z',
      updated_at: now,
      admin_id: 'admin_2',
      admin_name: 'Mike Admin',
      priority: 'high',
      complexity: 'complex',
    },
    {
      id: 'proj_7',
      title: 'Landing Page & SEO Optimization',
      description: 'Design and develop a high-converting landing page with SEO optimization, lead capture forms, and A/B testing setup.',
      client_id: 'client_7',
      client_name: 'Digital Growth Co',
      status: 'in_bidding',
      category: 'Web Development',
      skills_required: ['HTML', 'CSS', 'JavaScript', 'SEO', 'Google Analytics'],
      budget: 45000,
      client_budget: 45000,
      duration_weeks: 2,
      created_at: '2025-11-27T14:00:00Z',
      updated_at: now,
      admin_id: 'admin_1',
      admin_name: 'Sarah Admin',
      priority: 'low',
      complexity: 'simple',
    },
    {
      id: 'proj_8',
      title: 'Blockchain Wallet Application',
      description: 'Create a secure cryptocurrency wallet application with multi-currency support, transaction history, and QR code scanning.',
      client_id: 'client_8',
      client_name: 'CryptoHub',
      status: 'in_bidding',
      category: 'Mobile Development',
      skills_required: ['React Native', 'Blockchain', 'Web3', 'Security'],
      budget: 350000,
      client_budget: 350000,
      duration_weeks: 16,
      created_at: '2025-11-25T11:00:00Z',
      updated_at: now,
      admin_id: 'admin_2',
      admin_name: 'Mike Admin',
      priority: 'high',
      complexity: 'complex',
    },
    {
      id: 'proj_9',
      title: 'Educational Platform - Online Courses',
      description: 'Build an online learning platform with video hosting, quizzes, progress tracking, certificates, and payment integration.',
      client_id: 'client_9',
      client_name: 'EduTech Academy',
      freelancer_id: 'freelancer_5',
      freelancer_name: 'Rohit Verma',
      status: 'in_progress',
      category: 'Web Development',
      skills_required: ['React', 'Node.js', 'MongoDB', 'Video Streaming', 'AWS'],
      budget: 400000,
      client_budget: 400000,
      freelancer_budget: 320000,
      margin: 80000,
      duration_weeks: 18,
      start_date: '2025-10-01',
      end_date: '2026-01-28',
      created_at: '2025-09-05T09:00:00Z',
      updated_at: now,
      admin_id: 'admin_1',
      admin_name: 'Sarah Admin',
      priority: 'high',
      complexity: 'complex',
    },
    {
      id: 'proj_10',
      title: 'Restaurant Management System',
      description: 'Develop a complete restaurant management system with table booking, menu management, kitchen display, and billing.',
      client_id: 'client_10',
      client_name: 'FoodService Group',
      status: 'pending_review',
      category: 'Web Development',
      skills_required: ['React', 'Node.js', 'PostgreSQL', 'POS Integration'],
      budget: 220000,
      client_budget: 220000,
      duration_weeks: 10,
      created_at: '2025-11-29T15:00:00Z',
      updated_at: now,
      priority: 'medium',
      complexity: 'moderate',
    },
    {
      id: 'proj_11',
      title: 'AI Chatbot Integration',
      description: 'Integrate an AI-powered chatbot for customer support with natural language processing and ticketing system integration.',
      client_id: 'client_11',
      client_name: 'SupportAI Solutions',
      freelancer_id: 'freelancer_6',
      freelancer_name: 'Anjali Gupta',
      status: 'completed',
      category: 'AI/ML',
      skills_required: ['Python', 'NLP', 'TensorFlow', 'REST API'],
      budget: 180000,
      client_budget: 180000,
      freelancer_budget: 150000,
      margin: 30000,
      duration_weeks: 6,
      start_date: '2025-09-15',
      end_date: '2025-10-27',
      created_at: '2025-08-20T10:00:00Z',
      updated_at: '2025-10-28T09:00:00Z',
      admin_id: 'admin_2',
      admin_name: 'Mike Admin',
      priority: 'medium',
      complexity: 'moderate',
    },
    {
      id: 'proj_12',
      title: 'Real Estate Portal',
      description: 'Create a property listing portal with advanced search, virtual tours, agent dashboard, and lead management.',
      client_id: 'client_12',
      client_name: 'PropTech Ventures',
      status: 'in_bidding',
      category: 'Web Development',
      skills_required: ['React', 'Node.js', 'MongoDB', 'Google Maps API', '3D Tours'],
      budget: 280000,
      client_budget: 280000,
      duration_weeks: 12,
      created_at: '2025-11-26T13:00:00Z',
      updated_at: now,
      admin_id: 'admin_1',
      admin_name: 'Sarah Admin',
      priority: 'medium',
      complexity: 'complex',
    },
  ];

  const milestones: Milestone[] = [
    // Project 1 milestones
    {
      id: 'milestone_1',
      project_id: 'proj_1',
      title: 'Project Setup & Design',
      description: 'Initial setup, tech stack configuration, database schema design, and UI/UX wireframes',
      amount: 30000,
      due_date: '2025-11-15',
      status: 'paid',
      submission_date: '2025-11-13T14:00:00Z',
      submission_notes: 'Setup complete. All dependencies installed and configured.',
      approval_date: '2025-11-14T10:00:00Z',
      order: 1,
    },
    {
      id: 'milestone_2',
      project_id: 'proj_1',
      title: 'Product Catalog & Cart',
      description: 'Build product listing, detail pages, shopping cart functionality, and wishlist feature',
      amount: 40000,
      due_date: '2025-12-01',
      status: 'submitted',
      submission_date: '2025-11-28T15:00:00Z',
      submission_notes: 'Completed ahead of schedule. Demo link: https://demo.example.com - All features working as expected.',
      order: 2,
    },
    {
      id: 'milestone_3',
      project_id: 'proj_1',
      title: 'Payment Integration',
      description: 'Integrate Stripe payment gateway, checkout process, and order confirmation emails',
      amount: 35000,
      due_date: '2025-12-15',
      status: 'in_progress',
      order: 3,
    },
    {
      id: 'milestone_4',
      project_id: 'proj_1',
      title: 'Testing & Deployment',
      description: 'Final testing, bug fixes, performance optimization, and production deployment',
      amount: 15000,
      due_date: '2025-12-27',
      status: 'pending',
      order: 4,
    },
    // Project 3 milestones
    {
      id: 'milestone_5',
      project_id: 'proj_3',
      title: 'Payment API Integration',
      description: 'Integrate Razorpay and Stripe payment APIs with webhooks',
      amount: 30000,
      due_date: '2025-11-25',
      status: 'paid',
      submission_date: '2025-11-23T10:00:00Z',
      submission_notes: 'Both payment providers integrated successfully with complete error handling.',
      approval_date: '2025-11-24T12:00:00Z',
      order: 1,
    },
    {
      id: 'milestone_6',
      project_id: 'proj_3',
      title: 'Email & SMS Service Integration',
      description: 'Set up SendGrid for emails and Twilio for SMS with templating system',
      amount: 30000,
      due_date: '2025-12-08',
      status: 'in_progress',
      order: 2,
    },
    // Project 4 milestones (completed project)
    {
      id: 'milestone_7',
      project_id: 'proj_4',
      title: 'Phase 1 - Core Features',
      description: 'Lead management, contact database, and basic dashboard',
      amount: 80000,
      due_date: '2025-08-31',
      status: 'paid',
      approval_date: '2025-09-01T09:00:00Z',
      order: 1,
    },
    {
      id: 'milestone_8',
      project_id: 'proj_4',
      title: 'Phase 2 - Sales Pipeline',
      description: 'Sales pipeline, deal tracking, and forecasting',
      amount: 80000,
      due_date: '2025-09-30',
      status: 'paid',
      approval_date: '2025-10-01T10:00:00Z',
      order: 2,
    },
    {
      id: 'milestone_9',
      project_id: 'proj_4',
      title: 'Phase 3 - Final Delivery',
      description: 'Reporting, email automation, and deployment',
      amount: 40000,
      due_date: '2025-10-24',
      status: 'paid',
      approval_date: '2025-10-25T08:00:00Z',
      order: 3,
    },
    // Project 6 milestones
    {
      id: 'milestone_10',
      project_id: 'proj_6',
      title: 'Database & Backend Setup',
      description: 'Database design, API development, and authentication',
      amount: 80000,
      due_date: '2025-11-15',
      status: 'approved',
      submission_date: '2025-11-14T16:00:00Z',
      approval_date: '2025-11-15T09:00:00Z',
      order: 1,
    },
    {
      id: 'milestone_11',
      project_id: 'proj_6',
      title: 'Inventory Features',
      description: 'Stock management, barcode scanning, and alerts',
      amount: 100000,
      due_date: '2025-12-15',
      status: 'in_progress',
      order: 2,
    },
    {
      id: 'milestone_12',
      project_id: 'proj_6',
      title: 'Reporting & Deployment',
      description: 'Analytics dashboard, reports, and cloud deployment',
      amount: 60000,
      due_date: '2026-01-15',
      status: 'pending',
      order: 3,
    },
    // Project 9 milestones
    {
      id: 'milestone_13',
      project_id: 'proj_9',
      title: 'Platform Foundation',
      description: 'User authentication, course structure, and video hosting setup',
      amount: 120000,
      due_date: '2025-11-15',
      status: 'approved',
      approval_date: '2025-11-16T10:00:00Z',
      order: 1,
    },
    {
      id: 'milestone_14',
      project_id: 'proj_9',
      title: 'Learning Features',
      description: 'Quiz system, progress tracking, and certificate generation',
      amount: 120000,
      due_date: '2025-12-30',
      status: 'in_progress',
      order: 2,
    },
    {
      id: 'milestone_15',
      project_id: 'proj_9',
      title: 'Payment & Launch',
      description: 'Payment integration, testing, and production launch',
      amount: 80000,
      due_date: '2026-01-28',
      status: 'pending',
      order: 3,
    },
    // Project 11 milestones (completed)
    {
      id: 'milestone_16',
      project_id: 'proj_11',
      title: 'Chatbot Development',
      description: 'NLP model training and chatbot core functionality',
      amount: 90000,
      due_date: '2025-10-10',
      status: 'paid',
      approval_date: '2025-10-11T09:00:00Z',
      order: 1,
    },
    {
      id: 'milestone_17',
      project_id: 'proj_11',
      title: 'Integration & Deployment',
      description: 'System integration, testing, and deployment',
      amount: 60000,
      due_date: '2025-10-27',
      status: 'paid',
      approval_date: '2025-10-28T08:00:00Z',
      order: 2,
    },
  ];

  const bids: Bid[] = [
    // Project 2 bids (Mobile App MVP)
    {
      id: 'bid_1',
      project_id: 'proj_2',
      freelancer_id: currentUserRole === 'freelancer' ? currentUserId : 'freelancer_1',
      freelancer_name: currentUserRole === 'freelancer' ? 'You' : 'Ravi Kumar',
      freelancer_rating: 4.8,
      amount: 160000,
      duration_weeks: 9,
      estimated_duration: '9 weeks',
      proposal: 'I have extensive experience building React Native apps with 20+ projects delivered. I can deliver a high-quality MVP with smooth animations, offline capabilities, and health API integrations. Portfolio includes 3 fitness apps with excellent ratings.',
      cover_letter: 'I have extensive experience building React Native apps with 20+ projects delivered. I can deliver a high-quality MVP with smooth animations, offline capabilities, and health API integrations. Portfolio includes 3 fitness apps with excellent ratings.',
      status: 'shortlisted',
      created_at: '2025-11-21T10:00:00Z',
      submitted_at: '2025-11-21T10:00:00Z',
      admin_notes: 'Strong portfolio, good communication, proven track record',
    },
    {
      id: 'bid_2',
      project_id: 'proj_2',
      freelancer_id: 'freelancer_3',
      freelancer_name: 'Amit Patel',
      freelancer_rating: 4.6,
      amount: 170000,
      duration_weeks: 10,
      estimated_duration: '10 weeks',
      proposal: 'I specialize in fitness and health apps. Built 5 similar projects with wearable integrations (Apple Watch, Fitbit). Can include social features and gamification to boost user engagement.',
      cover_letter: 'I specialize in fitness and health apps. Built 5 similar projects with wearable integrations (Apple Watch, Fitbit). Can include social features and gamification to boost user engagement.',
      status: 'pending',
      created_at: '2025-11-22T14:00:00Z',
      submitted_at: '2025-11-22T14:00:00Z',
    },
    {
      id: 'bid_3',
      project_id: 'proj_2',
      freelancer_id: 'freelancer_4',
      freelancer_name: 'Neha Sharma',
      freelancer_rating: 4.9,
      amount: 180000,
      duration_weeks: 8,
      proposal: 'Top-rated developer with 50+ React Native apps and 98% success rate. Fast turnaround, pixel-perfect UI, excellent code quality. Can start immediately and deliver ahead of schedule.',
      status: 'shortlisted',
      created_at: '2025-11-23T09:00:00Z',
      admin_notes: 'Excellent track record, slightly higher cost but worth it',
    },
    {
      id: 'bid_4',
      project_id: 'proj_2',
      freelancer_id: 'freelancer_5',
      freelancer_name: 'Rohit Verma',
      freelancer_rating: 4.4,
      amount: 155000,
      duration_weeks: 11,
      proposal: 'Mobile app specialist with focus on performance optimization. Have built workout tracking apps before. Competitive pricing with quality assurance.',
      status: 'pending',
      created_at: '2025-11-23T16:00:00Z',
    },
    // Project 7 bids (Landing Page)
    {
      id: 'bid_5',
      project_id: 'proj_7',
      freelancer_id: 'freelancer_2',
      freelancer_name: 'Priya Singh',
      freelancer_rating: 4.7,
      amount: 38000,
      duration_weeks: 2,
      proposal: 'SEO expert with proven conversion rate improvements. Will create a lightning-fast landing page with perfect lighthouse scores and implement A/B testing.',
      status: 'pending',
      created_at: '2025-11-27T15:00:00Z',
    },
    {
      id: 'bid_6',
      project_id: 'proj_7',
      freelancer_id: 'freelancer_6',
      freelancer_name: 'Anjali Gupta',
      freelancer_rating: 4.8,
      amount: 40000,
      duration_weeks: 2,
      proposal: 'Frontend developer specialized in high-converting landing pages. Portfolio shows average 45% conversion rate improvement. Includes 2 rounds of revisions.',
      status: 'shortlisted',
      created_at: '2025-11-27T18:00:00Z',
      admin_notes: 'Great portfolio with proven results',
    },
    // Project 8 bids (Blockchain Wallet)
    {
      id: 'bid_7',
      project_id: 'proj_8',
      freelancer_id: 'freelancer_1',
      freelancer_name: 'Ravi Kumar',
      freelancer_rating: 4.8,
      amount: 320000,
      duration_weeks: 15,
      proposal: 'Blockchain developer with 3 years experience. Built 2 crypto wallets with multi-sig support. Strong focus on security with penetration testing included.',
      status: 'pending',
      created_at: '2025-11-25T12:00:00Z',
    },
    {
      id: 'bid_8',
      project_id: 'proj_8',
      freelancer_id: 'freelancer_5',
      freelancer_name: 'Rohit Verma',
      freelancer_rating: 4.6,
      amount: 310000,
      duration_weeks: 16,
      proposal: 'Web3 specialist with extensive smart contract experience. Can integrate multiple blockchains (Bitcoin, Ethereum, BSC). Security audit included in price.',
      status: 'shortlisted',
      created_at: '2025-11-26T10:00:00Z',
      admin_notes: 'Strong Web3 experience, competitive pricing',
    },
    // Project 12 bids (Real Estate Portal)
    {
      id: 'bid_9',
      project_id: 'proj_12',
      freelancer_id: 'freelancer_3',
      freelancer_name: 'Amit Patel',
      freelancer_rating: 4.6,
      amount: 250000,
      duration_weeks: 11,
      proposal: 'Built 2 real estate portals with virtual tour integration. Expertise in Google Maps API and 3D rendering. Can implement advanced search with filters.',
      status: 'pending',
      created_at: '2025-11-26T14:00:00Z',
    },
    {
      id: 'bid_10',
      project_id: 'proj_12',
      freelancer_id: 'freelancer_4',
      freelancer_name: 'Neha Sharma',
      freelancer_rating: 4.9,
      amount: 270000,
      duration_weeks: 12,
      proposal: 'Full-stack developer with PropTech experience. Portfolio includes a successful property platform with 50K+ listings. Modern UI/UX with virtual staging capabilities.',
      status: 'shortlisted',
      created_at: '2025-11-26T16:00:00Z',
      admin_notes: 'Impressive PropTech portfolio, recommended',
    },
  ];

  const bidInvitations: BidInvitation[] = [
    {
      id: 'inv_1',
      project_id: 'proj_2',
      freelancer_id: 'freelancer_1',
      freelancer_name: 'Ravi Kumar',
      budget_min: 150000,
      budget_max: 200000,
      deadline: '2025-11-30T23:59:59Z',
      message: 'We are interested in your expertise for our fitness tracker project. Please submit a bid within the budget range.',
      status: 'pending',
      invited_by: 'client_2',
      invited_by_name: 'FitTech Solutions',
      created_at: '2025-11-25T10:00:00Z',
    },
    {
      id: 'inv_2',
      project_id: 'proj_8',
      freelancer_id: 'freelancer_5',
      freelancer_name: 'Rohit Verma',
      budget_min: 300000,
      budget_max: 350000,
      deadline: '2025-12-05T23:59:59Z',
      message: 'We are looking for a blockchain developer to build our crypto wallet. Please submit a bid within the budget range.',
      status: 'pending',
      invited_by: 'client_8',
      invited_by_name: 'CryptoHub',
      created_at: '2025-11-26T10:00:00Z',
    },
  ];

  const consultations: Consultation[] = [
    {
      id: 'consult_1',
      client_id: currentUserRole === 'client' ? currentUserId : 'client_1',
      client_name: currentUserRole === 'client' ? 'You' : 'Acme Corp',
      admin_id: 'admin_1',
      admin_name: 'Sarah Admin',
      scheduled_date: '2025-11-28T15:00:00Z',
      duration_minutes: 60,
      status: 'scheduled',
      meeting_link: 'https://meet.google.com/abc-defg-hij',
      notes: 'Discuss new CRM project requirements',
      fee: 3000,
      paid: true,
    },
    {
      id: 'consult_2',
      client_id: currentUserRole === 'client' ? currentUserId : 'client_2',
      client_name: currentUserRole === 'client' ? 'You' : 'FitTech Solutions',
      admin_id: 'admin_1',
      admin_name: 'Sarah Admin',
      scheduled_date: '2025-10-15T10:00:00Z',
      duration_minutes: 45,
      status: 'completed',
      notes: 'Project scope finalized. Moved to bidding.',
      project_id: 'proj_2',
      fee: 3000,
      paid: true,
    },
  ];

  const payments: Payment[] = [
    {
      id: 'payment_1',
      project_id: 'proj_1',
      milestone_id: 'milestone_1',
      from_user_id: currentUserRole === 'client' ? currentUserId : 'client_1',
      to_user_id: currentUserRole === 'freelancer' ? currentUserId : 'freelancer_1',
      amount: 30000,
      type: 'milestone',
      status: 'completed',
      created_at: '2025-11-14T10:00:00Z',
      completed_at: '2025-11-14T10:05:00Z',
    },
    {
      id: 'payment_2',
      project_id: 'proj_1',
      from_user_id: currentUserRole === 'client' ? currentUserId : 'client_1',
      to_user_id: 'escrow',
      amount: 120000,
      type: 'escrow',
      status: 'completed',
      created_at: '2025-11-01T09:00:00Z',
      completed_at: '2025-11-01T09:05:00Z',
    },
    {
      id: 'payment_3',
      project_id: 'proj_3',
      milestone_id: 'milestone_5',
      from_user_id: currentUserRole === 'client' ? currentUserId : 'client_3',
      to_user_id: currentUserRole === 'freelancer' ? currentUserId : 'freelancer_2',
      amount: 30000,
      type: 'milestone',
      status: 'completed',
      created_at: '2025-11-24T12:00:00Z',
      completed_at: '2025-11-24T12:05:00Z',
    },
  ];

  const disputes: Dispute[] = [
    {
      id: 'dispute_1',
      project_id: 'proj_1',
      raised_by: currentUserRole === 'client' ? currentUserId : 'client_1',
      raised_by_name: currentUserRole === 'client' ? 'You' : 'Acme Corp',
      raised_by_role: 'client',
      subject: 'Milestone 2 Quality Issues',
      description: 'The submitted work has several bugs and doesn\'t match the agreed specifications.',
      status: 'in_review',
      priority: 'medium',
      admin_id: 'admin_1',
      admin_notes: 'Reviewing both parties\' claims. Scheduled call for tomorrow.',
      created_at: '2025-11-29T10:00:00Z',
    },
  ];

  const conversations: Conversation[] = [
    {
      id: 'conv_1',
      project_id: 'proj_1',
      participants: [
        { id: currentUserRole === 'client' ? currentUserId : 'client_1', name: currentUserRole === 'client' ? 'You' : 'Acme Corp', role: 'client' },
        { id: currentUserRole === 'freelancer' ? currentUserId : 'freelancer_1', name: currentUserRole === 'freelancer' ? 'You' : 'Ravi Kumar', role: 'freelancer' },
        { id: 'admin_1', name: 'Sarah Admin', role: 'admin' },
      ],
      last_message: 'I\'ve submitted milestone 2 for your review',
      last_message_at: '2025-11-28T15:00:00Z',
      unread_count: 2,
    },
    {
      id: 'conv_2',
      project_id: 'proj_3',
      participants: [
        { id: currentUserRole === 'client' ? currentUserId : 'client_3', name: currentUserRole === 'client' ? 'You' : 'StartupXYZ', role: 'client' },
        { id: currentUserRole === 'freelancer' ? currentUserId : 'freelancer_2', name: currentUserRole === 'freelancer' ? 'You' : 'Priya Singh', role: 'freelancer' },
        { id: 'admin_2', name: 'Mike Admin', role: 'admin' },
      ],
      last_message: 'Payment API integration is complete',
      last_message_at: '2025-11-24T10:00:00Z',
      unread_count: 0,
    },
  ];

  const messages: Message[] = [
    {
      id: 'msg_1',
      conversation_id: 'conv_1',
      sender_id: currentUserRole === 'freelancer' ? currentUserId : 'freelancer_1',
      sender_name: currentUserRole === 'freelancer' ? 'You' : 'Ravi Kumar',
      sender_role: 'freelancer',
      content: 'I\'ve completed the product catalog and shopping cart. The demo is ready for review.',
      created_at: '2025-11-28T14:30:00Z',
      read: false,
    },
    {
      id: 'msg_2',
      conversation_id: 'conv_1',
      sender_id: currentUserRole === 'freelancer' ? currentUserId : 'freelancer_1',
      sender_name: currentUserRole === 'freelancer' ? 'You' : 'Ravi Kumar',
      sender_role: 'freelancer',
      content: 'I\'ve submitted milestone 2 for your review',
      created_at: '2025-11-28T15:00:00Z',
      read: false,
    },
    {
      id: 'msg_3',
      conversation_id: 'conv_2',
      sender_id: currentUserRole === 'freelancer' ? currentUserId : 'freelancer_2',
      sender_name: currentUserRole === 'freelancer' ? 'You' : 'Priya Singh',
      sender_role: 'freelancer',
      content: 'Payment API integration is complete',
      created_at: '2025-11-24T10:00:00Z',
      read: true,
    },
  ];

  const notifications: Notification[] = [
    {
      id: 'notif_1',
      user_id: currentUserId,
      type: 'milestone',
      title: 'Milestone Submitted',
      description: 'Ravi Kumar submitted Milestone 2 for E-commerce Website',
      link: '/client/projects/proj_1',
      read: false,
      created_at: '2025-11-28T15:00:00Z',
    },
    {
      id: 'notif_2',
      user_id: currentUserId,
      type: 'message',
      title: 'New Message',
      description: 'Sarah Admin sent you a message',
      link: '/messages',
      read: false,
      created_at: '2025-11-27T16:00:00Z',
    },
    {
      id: 'notif_3',
      user_id: currentUserId,
      type: 'payment',
      title: 'Payment Processed',
      description: 'Payment of ₹30,000 released to Ravi Kumar',
      link: '/client/payments',
      read: true,
      created_at: '2025-11-14T10:05:00Z',
    },
  ];

  const freelancers: Freelancer[] = [
    {
      id: 'freelancer_1',
      name: 'Ravi Kumar',
      email: 'ravi@example.com',
      title: 'Full Stack Developer',
      bio: 'Experienced full-stack developer with 8+ years in React, Node.js, and cloud technologies. Specialized in e-commerce and fintech applications.',
      skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'AWS', 'Redux'],
      hourly_rate: 50,
      rating: 4.8,
      total_reviews: 156,
      availability: 'available',
      member_since: '2020-03-15',
      portfolio: [
        {
          title: 'E-commerce Platform',
          description: 'Built a complete e-commerce solution with 10K+ products',
          technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
        },
        {
          title: 'Fintech Dashboard',
          description: 'Real-time financial analytics dashboard',
          technologies: ['React', 'D3.js', 'WebSocket', 'AWS'],
        },
      ],
      certifications: [
        { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', year: 2023 },
        { name: 'MongoDB Certified Developer', issuer: 'MongoDB University', year: 2022 },
      ],
    },
    {
      id: 'freelancer_2',
      name: 'Priya Singh',
      email: 'priya@example.com',
      title: 'Backend & API Specialist',
      bio: 'Backend developer specializing in RESTful APIs, microservices, and database optimization. Strong expertise in Python and Django.',
      skills: ['Python', 'Django', 'REST API', 'PostgreSQL', 'Docker', 'Redis'],
      hourly_rate: 45,
      rating: 4.7,
      total_reviews: 98,
      availability: 'busy',
      member_since: '2019-07-22',
      portfolio: [
        {
          title: 'Payment Gateway Integration',
          description: 'Integrated multiple payment providers with failover system',
          technologies: ['Python', 'Django', 'Celery', 'Redis'],
        },
      ],
      certifications: [
        { name: 'Python Professional Certification', issuer: 'Python Institute', year: 2021 },
      ],
    },
    {
      id: 'freelancer_3',
      name: 'Amit Patel',
      email: 'amit@example.com',
      title: 'Mobile App Developer',
      bio: 'React Native expert with a passion for creating beautiful, performant mobile applications. Delivered 50+ apps to App Store and Play Store.',
      skills: ['React Native', 'JavaScript', 'Firebase', 'UI/UX', 'iOS', 'Android'],
      hourly_rate: 55,
      rating: 4.6,
      total_reviews: 203,
      availability: 'available',
      member_since: '2018-11-10',
      portfolio: [
        {
          title: 'Fitness Tracking App',
          description: 'Comprehensive fitness app with wearable integration',
          technologies: ['React Native', 'Firebase', 'HealthKit', 'Google Fit'],
        },
        {
          title: 'Food Delivery Platform',
          description: 'Multi-restaurant food delivery with real-time tracking',
          technologies: ['React Native', 'Node.js', 'MongoDB', 'Socket.io'],
        },
      ],
    },
    {
      id: 'freelancer_4',
      name: 'Neha Sharma',
      email: 'neha@example.com',
      title: 'Full Stack & DevOps Engineer',
      bio: 'Full-stack developer with strong DevOps skills. Experienced in building scalable applications with CI/CD pipelines and cloud infrastructure.',
      skills: ['Angular', 'Spring Boot', 'MySQL', 'AWS', 'Docker', 'Kubernetes'],
      hourly_rate: 60,
      rating: 4.9,
      total_reviews: 142,
      availability: 'available',
      member_since: '2019-01-05',
      certifications: [
        { name: 'AWS DevOps Engineer', issuer: 'Amazon Web Services', year: 2023 },
        { name: 'Certified Kubernetes Administrator', issuer: 'CNCF', year: 2022 },
      ],
    },
    {
      id: 'freelancer_5',
      name: 'Rohit Verma',
      email: 'rohit@example.com',
      title: 'Web3 & Blockchain Developer',
      bio: 'Blockchain specialist with expertise in smart contracts, DeFi, and Web3 technologies. Built multiple crypto wallets and NFT platforms.',
      skills: ['Solidity', 'Web3.js', 'Ethereum', 'React', 'Node.js', 'Hardhat'],
      hourly_rate: 70,
      rating: 4.4,
      total_reviews: 67,
      availability: 'busy',
      member_since: '2021-03-20',
      portfolio: [
        {
          title: 'NFT Marketplace',
          description: 'Complete NFT trading platform with auction features',
          technologies: ['Solidity', 'React', 'Web3.js', 'IPFS'],
        },
      ],
    },
    {
      id: 'freelancer_6',
      name: 'Anjali Gupta',
      email: 'anjali@example.com',
      title: 'AI/ML & Data Science',
      bio: 'Machine learning engineer with focus on NLP and computer vision. Experience in building production-ready AI models and data pipelines.',
      skills: ['Python', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'AWS SageMaker'],
      hourly_rate: 65,
      rating: 4.8,
      total_reviews: 89,
      availability: 'available',
      member_since: '2020-06-12',
      certifications: [
        { name: 'TensorFlow Developer Certificate', issuer: 'Google', year: 2022 },
        { name: 'AWS Machine Learning Specialty', issuer: 'Amazon Web Services', year: 2023 },
      ],
    },
  ];

  const clients: Client[] = [
    {
      id: 'client_1',
      name: 'Acme Corp',
      email: 'contact@acmecorp.com',
      company: 'Acme Corporation',
      phone: '+1-555-0101',
      location: 'San Francisco, CA',
      created_at: '2024-01-15T10:00:00Z',
    },
    {
      id: 'client_2',
      name: 'FitTech Solutions',
      email: 'info@fittech.com',
      company: 'FitTech Solutions Inc',
      phone: '+1-555-0102',
      location: 'Austin, TX',
      created_at: '2024-03-22T14:30:00Z',
    },
    {
      id: 'client_3',
      name: 'StartupXYZ',
      email: 'hello@startupxyz.com',
      company: 'StartupXYZ',
      phone: '+1-555-0103',
      location: 'New York, NY',
      created_at: '2024-05-10T09:00:00Z',
    },
    {
      id: 'client_4',
      name: 'TechVentures Ltd',
      email: 'contact@techventures.com',
      company: 'TechVentures Limited',
      phone: '+1-555-0104',
      location: 'London, UK',
      created_at: '2023-11-05T11:00:00Z',
    },
    {
      id: 'client_5',
      name: 'Marketing Pro Agency',
      email: 'team@marketingpro.com',
      company: 'Marketing Pro Agency',
      phone: '+1-555-0105',
      location: 'Los Angeles, CA',
      created_at: '2024-07-18T08:00:00Z',
    },
    {
      id: 'client_6',
      name: 'RetailMax Inc',
      email: 'info@retailmax.com',
      company: 'RetailMax Incorporated',
      phone: '+1-555-0106',
      location: 'Chicago, IL',
      created_at: '2024-02-28T13:00:00Z',
    },
    {
      id: 'client_7',
      name: 'Digital Growth Co',
      email: 'hello@digitalgrowth.com',
      company: 'Digital Growth Company',
      phone: '+1-555-0107',
      location: 'Seattle, WA',
      created_at: '2024-08-05T15:00:00Z',
    },
    {
      id: 'client_8',
      name: 'CryptoHub',
      email: 'support@cryptohub.com',
      company: 'CryptoHub Technologies',
      phone: '+1-555-0108',
      location: 'Miami, FL',
      created_at: '2024-04-12T10:00:00Z',
    },
    {
      id: 'client_9',
      name: 'EduTech Academy',
      email: 'admin@edutech.com',
      company: 'EduTech Academy',
      phone: '+1-555-0109',
      location: 'Boston, MA',
      created_at: '2023-09-20T09:00:00Z',
    },
    {
      id: 'client_10',
      name: 'FoodService Group',
      email: 'contact@foodservice.com',
      company: 'FoodService Group LLC',
      phone: '+1-555-0110',
      location: 'Denver, CO',
      created_at: '2024-06-30T12:00:00Z',
    },
    {
      id: 'client_11',
      name: 'SupportAI Solutions',
      email: 'info@supportai.com',
      company: 'SupportAI Solutions',
      phone: '+1-555-0111',
      location: 'Portland, OR',
      created_at: '2023-12-08T14:00:00Z',
    },
    {
      id: 'client_12',
      name: 'PropTech Ventures',
      email: 'team@proptech.com',
      company: 'PropTech Ventures Inc',
      phone: '+1-555-0112',
      location: 'Dallas, TX',
      created_at: '2024-09-15T11:00:00Z',
    },
  ];

  return { projects, milestones, bids, bidInvitations, consultations, payments, disputes, conversations, messages, notifications, freelancers, clients };
};

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = useState(() => {
    const stored = localStorage.getItem('connect_accel_data');
    if (stored && user) {
      return JSON.parse(stored);
    }
    return user ? generateMockData(user.id, user.role) : generateMockData('', '');
  });

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem('connect_accel_data');
      if (!stored) {
        const mockData = generateMockData(user.id, user.role);
        setData(mockData);
        localStorage.setItem('connect_accel_data', JSON.stringify(mockData));
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('connect_accel_data', JSON.stringify(data));
    }
  }, [data, user]);

  // Project methods
  const createProject = (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    const newProject: Project = {
      ...projectData,
      id: 'proj_' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setData((prev: any) => ({ ...prev, projects: [...prev.projects, newProject] }));
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setData((prev: any) => {
      const updatedProjects = prev.projects.map((p: Project) =>
        p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
      );
      
      // Create notifications for project updates
      const project = prev.projects.find((p: Project) => p.id === id);
      const newNotifications = [...prev.notifications];
      
      if (project && updates.status) {
        // Notify client when project status changes
        if (updates.status === 'in_bidding') {
          newNotifications.push({
            id: 'notif_' + Math.random().toString(36).substr(2, 9),
            user_id: project.client_id,
            type: 'project',
            title: 'Project Approved!',
            description: `Your project "${project.title}" has been approved and is now open for bidding.`,
            link: `/client/projects/${id}`,
            read: false,
            created_at: new Date().toISOString(),
          });
        } else if (updates.status === 'assigned') {
          // Notify both client and freelancer
          newNotifications.push({
            id: 'notif_' + Math.random().toString(36).substr(2, 9),
            user_id: project.client_id,
            type: 'project',
            title: 'Freelancer Assigned!',
            description: `A freelancer has been assigned to your project "${project.title}".`,
            link: `/client/projects/${id}`,
            read: false,
            created_at: new Date().toISOString(),
          });
          if (updates.assigned_freelancer_id) {
            newNotifications.push({
              id: 'notif_' + Math.random().toString(36).substr(2, 9),
              user_id: updates.assigned_freelancer_id,
              type: 'project',
              title: 'Project Assigned to You!',
              description: `You've been assigned to project "${project.title}". Time to get started!`,
              link: `/freelancer/projects/${id}`,
              read: false,
              created_at: new Date().toISOString(),
            });
          }
        } else if (updates.status === 'cancelled') {
          newNotifications.push({
            id: 'notif_' + Math.random().toString(36).substr(2, 9),
            user_id: project.client_id,
            type: 'project',
            title: 'Project Update',
            description: `Your project "${project.title}" has been cancelled. ${updates.rejection_reason || ''}`,
            link: `/client/projects/${id}`,
            read: false,
            created_at: new Date().toISOString(),
          });
        }
      }
      
      return {
        ...prev,
        projects: updatedProjects,
        notifications: newNotifications,
      };
    });
  };

  const getProject = (id: string) => {
    return data.projects.find((p: Project) => p.id === id);
  };

  const getProjectsByUser = (userId: string, role: string) => {
    if (role === 'client') {
      return data.projects.filter((p: Project) => p.client_id === userId);
    } else if (role === 'freelancer') {
      return data.projects.filter((p: Project) => p.freelancer_id === userId);
    } else if (role === 'admin' || role === 'superadmin') {
      return data.projects;
    }
    return [];
  };

  const getProjectsByAgent = (agentId: string) => {
    return data.projects.filter((p: Project) => p.admin_id === agentId);
  };

  // Milestone methods
  const createMilestone = (milestoneData: Omit<Milestone, 'id'>) => {
    const newMilestone: Milestone = {
      ...milestoneData,
      id: 'milestone_' + Math.random().toString(36).substr(2, 9),
    };
    setData((prev: any) => ({ ...prev, milestones: [...prev.milestones, newMilestone] }));
    return newMilestone;
  };

  const updateMilestone = (id: string, updates: Partial<Milestone>) => {
    setData((prev: any) => ({
      ...prev,
      milestones: prev.milestones.map((m: Milestone) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    }));
  };

  const getMilestonesByProject = (projectId: string) => {
    return data.milestones.filter((m: Milestone) => m.project_id === projectId);
  };

  // Bid methods
  const createBid = (bidData: Omit<Bid, 'id' | 'created_at'>) => {
    const newBid: Bid = {
      ...bidData,
      id: 'bid_' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    setData((prev: any) => ({ ...prev, bids: [...prev.bids, newBid] }));
    return newBid;
  };

  const updateBid = (id: string, updates: Partial<Bid>) => {
    setData((prev: any) => {
      const updatedBids = prev.bids.map((b: Bid) => (b.id === id ? { ...b, ...updates } : b));
      
      // Create notifications for bid updates
      const bid = prev.bids.find((b: Bid) => b.id === id);
      const newNotifications = [...prev.notifications];
      
      if (bid && updates.status) {
        if (updates.status === 'accepted') {
          // Notify freelancer their bid was accepted
          newNotifications.push({
            id: 'notif_' + Math.random().toString(36).substr(2, 9),
            user_id: bid.freelancer_id,
            type: 'bid',
            title: 'Bid Accepted! 🎉',
            description: `Congratulations! Your bid has been accepted. The project has been assigned to you.`,
            link: `/freelancer/projects/${bid.project_id}`,
            read: false,
            created_at: new Date().toISOString(),
          });
        } else if (updates.status === 'rejected') {
          // Notify freelancer their bid was rejected
          newNotifications.push({
            id: 'notif_' + Math.random().toString(36).substr(2, 9),
            user_id: bid.freelancer_id,
            type: 'bid',
            title: 'Bid Update',
            description: `Your bid was not selected this time. ${updates.rejection_reason || 'Keep bidding on other projects!'}`,
            link: `/freelancer/my-bids`,
            read: false,
            created_at: new Date().toISOString(),
          });
        } else if (updates.status === 'shortlisted') {
          // Notify freelancer they're shortlisted
          newNotifications.push({
            id: 'notif_' + Math.random().toString(36).substr(2, 9),
            user_id: bid.freelancer_id,
            type: 'bid',
            title: 'You\'ve Been Shortlisted!',
            description: `Great news! Your bid has been shortlisted for review.`,
            link: `/freelancer/my-bids`,
            read: false,
            created_at: new Date().toISOString(),
          });
        }
      }
      
      return {
        ...prev,
        bids: updatedBids,
        notifications: newNotifications,
      };
    });
  };

  const getBidsByProject = (projectId: string) => {
    return data.bids.filter((b: Bid) => b.project_id === projectId);
  };

  const getBidsByFreelancer = (freelancerId: string) => {
    return data.bids.filter((b: Bid) => b.freelancer_id === freelancerId);
  };

  const getBidsByAgent = (agentId: string) => {
    return data.bids.filter((b: Bid) => b.admin_id === agentId);
  };

  // Bid Invitation methods
  const createBidInvitation = (invitationData: Omit<BidInvitation, 'id' | 'created_at'>) => {
    const newInvitation: BidInvitation = {
      ...invitationData,
      id: 'inv_' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    setData((prev: any) => ({ ...prev, bidInvitations: [...prev.bidInvitations, newInvitation] }));
    return newInvitation;
  };

  const updateBidInvitation = (id: string, updates: Partial<BidInvitation>) => {
    setData((prev: any) => ({
      ...prev,
      bidInvitations: prev.bidInvitations.map((i: BidInvitation) =>
        i.id === id ? { ...i, ...updates } : i
      ),
    }));
  };

  const getBidInvitationsByProject = (projectId: string) => {
    return data.bidInvitations.filter((i: BidInvitation) => i.project_id === projectId);
  };

  const getBidInvitationsByFreelancer = (freelancerId: string) => {
    return data.bidInvitations.filter((i: BidInvitation) => i.freelancer_id === freelancerId);
  };

  // Consultation methods
  const createConsultation = (consultationData: Omit<Consultation, 'id'>) => {
    const newConsultation: Consultation = {
      ...consultationData,
      id: 'consult_' + Math.random().toString(36).substr(2, 9),
    };
    setData((prev: any) => ({ ...prev, consultations: [...prev.consultations, newConsultation] }));
    return newConsultation;
  };

  const updateConsultation = (id: string, updates: Partial<Consultation>) => {
    setData((prev: any) => {
      const updatedConsultations = prev.consultations.map((c: Consultation) =>
        c.id === id ? { ...c, ...updates } : c
      );
      
      // Create notifications for consultation updates
      const consultation = prev.consultations.find((c: Consultation) => c.id === id);
      const newNotifications = [...prev.notifications];
      
      if (consultation && updates.status) {
        if (updates.status === 'scheduled') {
          // Notify client when consultation is scheduled
          newNotifications.push({
            id: 'notif_' + Math.random().toString(36).substr(2, 9),
            user_id: consultation.client_id,
            type: 'project',
            title: 'Consultation Scheduled',
            description: `Your consultation has been scheduled for ${new Date(updates.scheduled_date || consultation.scheduled_date).toLocaleString()}`,
            link: `/client/consultations`,
            read: false,
            created_at: new Date().toISOString(),
          });
        } else if (updates.status === 'completed') {
          // Notify client when consultation is completed
          newNotifications.push({
            id: 'notif_' + Math.random().toString(36).substr(2, 9),
            user_id: consultation.client_id,
            type: 'project',
            title: 'Consultation Completed',
            description: `Your consultation has been completed. ${updates.outcome || 'Check notes for details.'}`,
            link: `/client/consultations`,
            read: false,
            created_at: new Date().toISOString(),
          });
        }
      }
      
      return {
        ...prev,
        consultations: updatedConsultations,
        notifications: newNotifications,
      };
    });
  };

  const getConsultationsByUser = (userId: string, role: string) => {
    if (role === 'client') {
      return data.consultations.filter((c: Consultation) => c.client_id === userId);
    } else if (role === 'admin' || role === 'superadmin') {
      return data.consultations;
    }
    return [];
  };

  // Payment methods
  const createPayment = (paymentData: Omit<Payment, 'id' | 'created_at'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: 'payment_' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    setData((prev: any) => ({ ...prev, payments: [...prev.payments, newPayment] }));
    return newPayment;
  };

  const updatePayment = (id: string, updates: Partial<Payment>) => {
    setData((prev: any) => ({
      ...prev,
      payments: prev.payments.map((p: Payment) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  };

  const getPaymentsByProject = (projectId: string) => {
    return data.payments.filter((p: Payment) => p.project_id === projectId);
  };

  const getPaymentsByUser = (userId: string) => {
    return data.payments.filter(
      (p: Payment) => p.from_user_id === userId || p.to_user_id === userId
    );
  };

  // Dispute methods
  const createDispute = (disputeData: Omit<Dispute, 'id' | 'created_at'>) => {
    const newDispute: Dispute = {
      ...disputeData,
      id: 'dispute_' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    setData((prev: any) => ({ ...prev, disputes: [...prev.disputes, newDispute] }));
    return newDispute;
  };

  const updateDispute = (id: string, updates: Partial<Dispute>) => {
    setData((prev: any) => {
      const updatedDisputes = prev.disputes.map((d: Dispute) =>
        d.id === id ? { ...d, ...updates } : d
      );
      
      // Create notifications for dispute updates
      const dispute = prev.disputes.find((d: Dispute) => d.id === id);
      const newNotifications = [...prev.notifications];
      
      if (dispute && updates.status) {
        if (updates.status === 'in_review') {
          // Notify the person who raised the dispute
          newNotifications.push({
            id: 'notif_' + Math.random().toString(36).substr(2, 9),
            user_id: dispute.raised_by,
            type: 'dispute',
            title: 'Dispute Under Review',
            description: `Your dispute "${dispute.subject}" is now being reviewed by our admin team.`,
            link: `/disputes/${id}`,
            read: false,
            created_at: new Date().toISOString(),
          });
        } else if (updates.status === 'resolved') {
          // Notify both parties about resolution
          const project = prev.projects.find((p: Project) => p.id === dispute.project_id);
          if (project) {
            // Notify client
            newNotifications.push({
              id: 'notif_' + Math.random().toString(36).substr(2, 9),
              user_id: project.client_id,
              type: 'dispute',
              title: 'Dispute Resolved',
              description: `The dispute for "${project.title}" has been resolved. ${updates.resolution || ''}`,
              link: `/disputes/${id}`,
              read: false,
              created_at: new Date().toISOString(),
            });
            
            // Notify freelancer if assigned
            if (project.freelancer_id) {
              newNotifications.push({
                id: 'notif_' + Math.random().toString(36).substr(2, 9),
                user_id: project.freelancer_id,
                type: 'dispute',
                title: 'Dispute Resolved',
                description: `The dispute for "${project.title}" has been resolved. ${updates.resolution || ''}`,
                link: `/disputes/${id}`,
                read: false,
                created_at: new Date().toISOString(),
              });
            }
          }
        }
      }
      
      return {
        ...prev,
        disputes: updatedDisputes,
        notifications: newNotifications,
      };
    });
  };

  const getDisputesByProject = (projectId: string) => {
    return data.disputes.filter((d: Dispute) => d.project_id === projectId);
  };

  // Message methods
  const sendMessage = (messageData: Omit<Message, 'id' | 'created_at' | 'read'>) => {
    const newMessage: Message = {
      ...messageData,
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      read: false,
    };
    setData((prev: any) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      conversations: prev.conversations.map((c: Conversation) =>
        c.id === messageData.conversation_id
          ? {
              ...c,
              last_message: messageData.content,
              last_message_at: newMessage.created_at,
              unread_count: c.unread_count + 1,
            }
          : c
      ),
    }));
    return newMessage;
  };

  const markMessageAsRead = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      messages: prev.messages.map((m: Message) =>
        m.id === id ? { ...m, read: true } : m
      ),
    }));
  };

  const getConversation = (conversationId: string) => {
    return data.messages.filter((m: Message) => m.conversation_id === conversationId);
  };

  const getUserConversations = (userId: string) => {
    return data.conversations.filter((c: Conversation) =>
      c.participants.some((p) => p.id === userId)
    );
  };

  // Notification methods
  const createNotification = (notificationData: Omit<Notification, 'id' | 'created_at' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: 'notif_' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      read: false,
    };
    setData((prev: any) => ({ ...prev, notifications: [...prev.notifications, newNotification] }));
    return newNotification;
  };

  const markNotificationAsRead = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      notifications: prev.notifications.map((n: Notification) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  };

  const getUserNotifications = (userId: string) => {
    return data.notifications.filter((n: Notification) => n.user_id === userId);
  };

  const value = {
    projects: data.projects,
    milestones: data.milestones,
    bids: data.bids,
    bidInvitations: data.bidInvitations,
    consultations: data.consultations,
    payments: data.payments,
    disputes: data.disputes,
    messages: data.messages,
    conversations: data.conversations,
    notifications: data.notifications,
    freelancers: data.freelancers,
    clients: data.clients,
    
    createProject,
    updateProject,
    getProject,
    getProjectsByUser,
    getProjectsByAgent,
    
    createMilestone,
    updateMilestone,
    getMilestonesByProject,
    
    createBid,
    updateBid,
    getBidsByProject,
    getBidsByFreelancer,
    getBidsByAgent,
    
    createBidInvitation,
    updateBidInvitation,
    getBidInvitationsByProject,
    getBidInvitationsByFreelancer,
    
    createConsultation,
    updateConsultation,
    getConsultationsByUser,
    
    createPayment,
    updatePayment,
    getPaymentsByProject,
    getPaymentsByUser,
    
    createDispute,
    updateDispute,
    getDisputesByProject,
    
    sendMessage,
    markMessageAsRead,
    getConversation,
    getUserConversations,
    
    createNotification,
    markNotificationAsRead,
    getUserNotifications,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}