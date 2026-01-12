import React, { useState, useEffect } from "react";
import {
  getProjectActivityLogs,
  ActivityLog,
} from "../../services/activityLogService";
import { useParams, useNavigate, Link } from "react-router-dom";
import DashboardLayout from "../../components/shared/DashboardLayout";
import ApproveProjectDialog from "../../components/shared/ApproveProjectDialog";
import RejectProjectDialog from "../../components/shared/RejectProjectDialog";
import AssignAgentDialog from "../../components/shared/AssignAgentDialog";
import AddMilestoneDialog from "../../components/shared/AddMilestoneDialog";
import EditMilestoneDialog from "../../components/shared/EditMilestoneDialog";
import DeleteMilestoneDialog from "../../components/shared/DeleteMilestoneDialog";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { RichTextEditor } from "../../components/common/RichTextEditor";
import { RichTextViewer } from "../../components/common/RichTextViewer";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useData } from "../../contexts/DataContext";
import { statusColors, statusLabels } from "../../constants/projectConstants";
import { useAuth } from "../../contexts/AuthContext";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Edit,
  IndianRupee,
  Clock,
  User,
  Home,
  Mail,
  Phone,
  Calendar,
  FileText,
  AlertCircle,
  Users,
  MessageSquare,
  Target,
  Trash2,
  Award,
  Star,
  Eye,
  Loader2,
  Paperclip,
} from "lucide-react";
import { toast } from "../../utils/toast";
import ProjectTimeline from "../../components/project/ProjectTimeline";
import * as userService from "../../services/userService";
import * as bidService from "../../services/bidService";
import type { Bid } from "../../services/bidService";
import DeleteWithReasonDialog from "../../components/common/DeleteWithReasonDialog";
import AttachmentItem from "../../components/common/AttachmentItem";
import apiClient from "../../services/apiService";
import { API_CONFIG } from "../../config/api";

export default function ProjectReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAgent = user?.role === "agent";
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const {
    projects,
    getProject,
    updateProject,
    freelancers,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    getMilestonesByProject,
    deleteBid,
  } = useData();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingBids, setLoadingBids] = useState(false);
  const [projectBids, setProjectBids] = useState<Bid[]>([]);
  const [biddingsByBidId, setBiddingsByBidId] = useState<Map<string, any[]>>(
    new Map()
  );
  const [acceptedBidding, setAcceptedBidding] = useState<any>(null);
  const [loadingAcceptedBidding, setLoadingAcceptedBidding] = useState(false);
  const [assignedFreelancer, setAssignedFreelancer] = useState<any>(null);
  const [loadingFreelancer, setLoadingFreelancer] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // Always fetch from backend with forceRefresh to ensure we have latest data
        // This ensures all users (admin/superadmin/agent) see the same status regardless of who made the change
        const fetchedProject = await getProject(id, true);
        setProject(fetchedProject || null);
      } catch (error: any) {
        console.error("Failed to load project:", error);
        // Handle rate limit errors
        if (error.response?.status === 429) {
          toast.error(
            "Too many requests. Please wait a moment and refresh the page."
          );
        }
        // Fallback to local project if fetch fails
        const localProject = projects.find((p) => p.id === id);
        setProject(localProject || null);
      } finally {
        setLoading(false);
      }
    };
    loadProject();
  }, [id]); // Removed getProject from dependencies to prevent unnecessary re-runs

  // Load activity logs when project is available
  useEffect(() => {
    const loadActivityLogs = async () => {
      if (!id || !project) return;
      setLoadingLogs(true);
      try {
        const logs = await getProjectActivityLogs(id);
        setActivityLogs(logs);
      } catch (error: any) {
        console.error("Failed to load activity logs:", error);
        // Handle rate limit errors
        if (error.response?.status === 429) {
          toast.error(
            "Too many requests. Activity logs will load automatically when available."
          );
        }
      } finally {
        setLoadingLogs(false);
      }
    };
    // Add a small delay to prevent simultaneous calls with project fetch
    const timer = setTimeout(() => {
      loadActivityLogs();
    }, 500);
    return () => clearTimeout(timer);
  }, [id, project]);

  // Load agents list - Only for admin/superadmin (agents don't need this list)
  useEffect(() => {
    if (!isAdmin) return; // Only load agents list for admins/superadmins

    const loadAgents = async () => {
      try {
        const users = await userService.listUsers();
        const agentUsers = users.filter((u) => u.role === "agent");
        setAgents(agentUsers);
      } catch (error: any) {
        console.error("Failed to load agents:", error);
      }
    };
    loadAgents();
  }, [isAdmin]);

  // Load bids for the project
  useEffect(() => {
    const loadBids = async () => {
      if (!id) return;
      setLoadingBids(true);
      try {
        const response = await bidService.getProjectBids(id);
        const bids = Array.isArray(response) ? response : [];
        setProjectBids(bids);

        // Load freelancer proposals (biddings) for each admin bid
        const biddingsMap = new Map<string, any[]>();
        await Promise.all(
          bids.map(async (bid: Bid) => {
            try {
              const biddingsResponse = await apiClient.get(
                API_CONFIG.BIDDING.GET_BY_ADMIN_BID(bid.id)
              );
              if (biddingsResponse.data.success && biddingsResponse.data.data) {
                const biddings = Array.isArray(biddingsResponse.data.data)
                  ? biddingsResponse.data.data
                  : [];
                biddingsMap.set(bid.id, biddings);
              }
            } catch (error) {
              console.error(
                `Failed to load biddings for bid ${bid.id}:`,
                error
              );
              biddingsMap.set(bid.id, []);
            }
          })
        );
        setBiddingsByBidId(biddingsMap);
      } catch (error: any) {
        console.error("Failed to load bids:", error);
        setProjectBids([]);
      } finally {
        setLoadingBids(false);
      }
    };
    loadBids();
  }, [id]);

  // Load accepted bidding for the project
  useEffect(() => {
    const loadAcceptedBidding = async () => {
      if (!id || !project?.freelancer_id) {
        setAcceptedBidding(null);
        return;
      }

      setLoadingAcceptedBidding(true);
      try {
        // Find accepted bidding for this project
        // We need to check all biddings for all bids of this project
        const allBiddings: any[] = [];
        for (const [bidId, biddings] of biddingsByBidId.entries()) {
          allBiddings.push(...biddings);
        }

        // Find the accepted one
        const accepted = allBiddings.find(
          (bidding: any) =>
            bidding.isAccepted === true &&
            (bidding.freelancerId?._id?.toString() === project.freelancer_id ||
              bidding.freelancerId?.toString() === project.freelancer_id)
        );

        if (accepted) {
          setAcceptedBidding(accepted);
        } else {
          // If not found in loaded biddings, try to fetch directly
          // We'll need to search through all bids and their biddings
          const bids = await bidService.getProjectBids(id);
          for (const bid of bids) {
            try {
              const response = await apiClient.get(
                API_CONFIG.BIDDING.GET_BY_ADMIN_BID(bid.id)
              );
              if (response.data.success && response.data.data) {
                const biddings = Array.isArray(response.data.data)
                  ? response.data.data
                  : [];
                const acceptedBid = biddings.find(
                  (b: any) =>
                    b.isAccepted === true &&
                    (b.freelancerId?._id?.toString() ===
                      project.freelancer_id ||
                      b.freelancerId?.toString() === project.freelancer_id)
                );
                if (acceptedBid) {
                  setAcceptedBidding(acceptedBid);
                  break;
                }
              }
            } catch (error) {
              console.error(
                `Failed to check biddings for bid ${bid.id}:`,
                error
              );
            }
          }
        }
      } catch (error: any) {
        console.error("Failed to load accepted bidding:", error);
      } finally {
        setLoadingAcceptedBidding(false);
      }
    };

    if (biddingsByBidId.size > 0 || projectBids.length > 0) {
      loadAcceptedBidding();
    }
  }, [id, project?.freelancer_id, biddingsByBidId, projectBids]);

  // Load assigned freelancer when project has freelancer_id
  useEffect(() => {
    const loadAssignedFreelancer = async () => {
      if (!project?.freelancer_id) {
        setAssignedFreelancer(null);
        return;
      }

      // First check if freelancer is in local context
      const localFreelancer = freelancers.find(
        (f) => f.id === project.freelancer_id
      );
      if (localFreelancer) {
        setAssignedFreelancer(localFreelancer);
        return;
      }

      // If we have freelancer_name from the project (populated data), use it directly
      if (project.freelancer_name) {
        setAssignedFreelancer({
          id: project.freelancer_id,
          name: project.freelancer_name,
          email: project.freelancer_email || "",
          title: "",
          rating: 0,
          total_reviews: 0,
          bio: "",
          hourly_rate: 0,
          availability: "unknown",
          skills: [],
          member_since: new Date().toISOString(),
        });
        return;
      }

      // If not found locally and no populated data, try to fetch from backend
      setLoadingFreelancer(true);
      try {
        const freelancerId =
          project.freelancer_id?.toString() || project.freelancer_id;
        if (!freelancerId) {
          throw new Error("Invalid freelancer ID");
        }

        const freelancerData = await userService.getUserById(freelancerId);
        if (freelancerData && freelancerData.id) {
          setAssignedFreelancer(freelancerData);
        } else {
          // Fallback: create minimal freelancer object with just ID
          setAssignedFreelancer({
            id: project.freelancer_id,
            name: "Assigned Freelancer",
            email: "",
            title: "",
            rating: 0,
            total_reviews: 0,
            bio: "",
            hourly_rate: 0,
            availability: "unknown",
            skills: [],
            member_since: new Date().toISOString(),
          });
        }
      } catch (error: any) {
        console.error("Failed to load assigned freelancer:", error);
        // Fallback: create minimal freelancer object
        setAssignedFreelancer({
          id: project.freelancer_id,
          name: "Assigned Freelancer",
          email: "",
          title: "",
          rating: 0,
          total_reviews: 0,
          bio: "",
          hourly_rate: 0,
          availability: "unknown",
          skills: [],
          member_since: new Date().toISOString(),
        });
      } finally {
        setLoadingFreelancer(false);
      }
    };

    loadAssignedFreelancer();
  }, [
    project?.freelancer_id,
    project?.freelancer_name,
    project?.freelancer_email,
    freelancers,
  ]);

  const projectMilestones = project ? getMilestonesByProject(project.id) : [];
  const isSuperAdmin = user?.role === "superadmin";
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddMilestoneDialogOpen, setIsAddMilestoneDialogOpen] =
    useState(false);
  const [isEditMilestoneDialogOpen, setIsEditMilestoneDialogOpen] =
    useState(false);
  const [isDeleteMilestoneDialogOpen, setIsDeleteMilestoneDialogOpen] =
    useState(false);
  const [editingMilestone, setEditingMilestone] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [isAssignAgentDialogOpen, setIsAssignAgentDialogOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [isEditingAgent, setIsEditingAgent] = useState(false);
  const [assignmentType, setAssignmentType] = useState<string>("assign_to_agent");
  const [isWithdrawBidDialogOpen, setIsWithdrawBidDialogOpen] = useState(false);
  const [bidToWithdraw, setBidToWithdraw] = useState<Bid | null>(null);

  // Form states
  const [editedTitle, setEditedTitle] = useState(project?.title || "");
  const [editedDescription, setEditedDescription] = useState(
    project?.description || ""
  );
  const [editedBudget, setEditedBudget] = useState(
    project?.client_budget.toString() || ""
  );
  const [editedTimeline, setEditedTimeline] = useState(
    project?.duration_weeks ? `${project.duration_weeks} weeks` : ""
  );
  const [rejectionReason, setRejectionReason] = useState("");

  // Margin calculation
  const [marginPercentage, setMarginPercentage] = useState("15");
  const [freelancerBudget, setFreelancerBudget] = useState("");
  const [marginAmount, setMarginAmount] = useState("0");

  // Milestone form
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneStartDate, setMilestoneStartDate] = useState("");
  const [milestoneEndDate, setMilestoneEndDate] = useState("");
  const [milestoneAmountPercent, setMilestoneAmountPercent] = useState("");
  const [milestoneAmount, setMilestoneAmount] = useState("");
  const [milestoneDescription, setMilestoneDescription] = useState("");

  // Edit milestone form
  const [editMilestoneTitle, setEditMilestoneTitle] = useState("");
  const [editMilestoneStartDate, setEditMilestoneStartDate] = useState("");
  const [editMilestoneEndDate, setEditMilestoneEndDate] = useState("");
  const [editMilestoneAmountPercent, setEditMilestoneAmountPercent] =
    useState("");
  const [editMilestoneAmount, setEditMilestoneAmount] = useState("");
  const [editMilestoneDescription, setEditMilestoneDescription] = useState("");

  // Activity logs state
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<{
    editedTitle?: string;
    editedDescription?: string;
    editedBudget?: string;
    editedTimeline?: string;
    rejectionReason?: string;
    milestoneTitle?: string;
    milestoneStartDate?: string;
    milestoneEndDate?: string;
    milestoneAmountPercent?: string;
    milestoneAmount?: string;
    milestoneDescription?: string;
    editMilestoneTitle?: string;
    editMilestoneStartDate?: string;
    editMilestoneEndDate?: string;
    editMilestoneAmountPercent?: string;
    editMilestoneAmount?: string;
    editMilestoneDescription?: string;
    selectedAgentId?: string;
  }>({});

  // Validation functions
  const validateTitle = (title: string): string => {
    if (!title.trim()) {
      return "Title is required";
    }
    if (title.trim().length > 100) {
      return "Title cannot exceed 100 characters";
    }
    return "";
  };

  const validateDescription = (description: string): string => {
    if (!description.trim()) {
      return "Description is required";
    }
    if (description.trim().length < 10) {
      return "Description must be at least 10 characters";
    }
    return "";
  };

  const validateBudget = (budget: string): string => {
    if (!budget.trim()) {
      return "Budget is required";
    }
    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum)) {
      return "Budget must be a valid number";
    }
    if (budgetNum < 0) {
      return "Budget cannot be negative";
    }
    if (budgetNum === 0) {
      return "Budget must be greater than 0";
    }
    return "";
  };

  const validateTimeline = (timeline: string): string => {
    if (!timeline.trim()) {
      return "Timeline is required";
    }
    const weeksMatch = timeline.match(/(\d+)\s*(?:week|weeks?)/i);
    if (!weeksMatch) {
      return "Please enter timeline in format: 'X weeks' (e.g., '2 weeks')";
    }
    const weeks = parseInt(weeksMatch[1]);
    if (weeks <= 0) {
      return "Timeline must be at least 1 week";
    }
    if (weeks > 104) {
      return "Timeline cannot exceed 104 weeks (2 years)";
    }
    return "";
  };

  const validateRejectionReason = (reason: string): string => {
    if (!reason.trim()) {
      return "Rejection reason is required";
    }
    if (reason.trim().length < 10) {
      return "Rejection reason must be at least 10 characters";
    }
    return "";
  };

  const validateMilestoneTitle = (title: string): string => {
    if (!title.trim()) {
      return "Milestone title is required";
    }
    if (title.trim().length > 100) {
      return "Milestone title cannot exceed 100 characters";
    }
    return "";
  };

  const validateDate = (date: string, fieldName: string): string => {
    if (!date) {
      return `${fieldName} is required`;
    }
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return `Please enter a valid ${fieldName.toLowerCase()}`;
    }
    return "";
  };

  const validateDateRange = (startDate: string, endDate: string): string => {
    if (!startDate || !endDate) {
      return "";
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return "End date must be after start date";
    }
    return "";
  };

  const validateMilestoneAmountPercent = (percent: string): string => {
    if (!percent) {
      return "";
    }
    const percentNum = parseFloat(percent);
    if (isNaN(percentNum)) {
      return "Percentage must be a valid number";
    }
    if (percentNum < 0) {
      return "Percentage cannot be negative";
    }
    if (percentNum > 100) {
      return "Percentage cannot exceed 100%";
    }
    return "";
  };

  const validateMilestoneAmount = (
    amount: string,
    projectBudget?: number
  ): string => {
    if (!amount) {
      return "";
    }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) {
      return "Amount must be a valid number";
    }
    if (amountNum < 0) {
      return "Amount cannot be negative";
    }
    if (projectBudget && amountNum > projectBudget) {
      return `Amount cannot exceed project budget of ₹${projectBudget.toLocaleString()}`;
    }
    return "";
  };

  const validateMilestoneDescription = (description: string): string => {
    if (!description.trim()) {
      return "Milestone description is required";
    }
    if (description.trim().length < 10) {
      return "Description must be at least 10 characters";
    }
    return "";
  };

  const validateAgentSelection = (agentId: string): string => {
    if (!agentId) {
      return "Please select an agent";
    }
    return "";
  };

  const validateMilestoneAmountFields = (
    amountPercent: string,
    amount: string
  ): string => {
    if (!amountPercent && !amount) {
      return "Please provide either amount percentage or amount";
    }
    return "";
  };

  // Helper function to update validation errors
  const setFieldError = (
    field: keyof typeof validationErrors,
    error: string
  ) => {
    setValidationErrors((prev) => ({
      ...prev,
      [field]: error || undefined,
    }));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="size-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl mb-2">Loading Project...</h2>
            <p className="text-gray-600">
              Please wait while we fetch the project details
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="size-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl mb-2">Project Not Found</h2>
            <Button
              onClick={() =>
                navigate(isAgent ? "/agent/projects" : "/admin/projects")
              }
            >
              Back to Projects
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const calculateMargin = (clientBudget: number, percentage: number) => {
    const margin = (clientBudget * percentage) / 100;
    const freelancerAmount = clientBudget - margin;
    setMarginAmount(margin.toFixed(2));
    setFreelancerBudget(freelancerAmount.toFixed(2));
  };

  const handleMarginChange = (value: string) => {
    setMarginPercentage(value);
    calculateMargin(project.client_budget, parseFloat(value));
  };

  const handleApproveProject = async () => {
    try {
      await updateProject(project.id, {
        status: "in_progress",
      });
      toast.success("Project approved and status changed to In Progress!");
      loadStatus(project.id);
      setIsApproveDialogOpen(false);

      // Reload project to get updated status
      if (id) {
        try {
          const updatedProject = await getProject(id);
          setProject(updatedProject || project);
        } catch (error) {
          console.error("Failed to reload project:", error);
        }

        // Reload activity logs after approval
        try {
          const logs = await getProjectActivityLogs(id);
          setActivityLogs(logs);
        } catch (error) {
          console.error("Failed to reload activity logs:", error);
        }
      }
    } catch (error: any) {
      console.error("Failed to approve project:", error);
      toast.error(
        error?.response?.data?.message || "Failed to approve project"
      );
    }
  };

  const handleRejectProject = async () => {
    const reasonError = validateRejectionReason(rejectionReason);
    setFieldError("rejectionReason", reasonError);

    if (reasonError) {
      toast.error("Please provide a valid rejection reason");
      return;
    }

    try {
      await updateProject(project.id, {
        status: "rejected",
        ...({ rejectionReason: rejectionReason.trim() } as any), // Include rejection reason in the update
      });
      toast.success("Project rejected successfully");
      loadStatus(project.id);
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      setFieldError("rejectionReason", "");
      // Reload activity logs after rejection
      if (id) {
        try {
          const logs = await getProjectActivityLogs(id);
          setActivityLogs(logs);
        } catch (error) {
          console.error("Failed to reload activity logs:", error);
        }
      }
      navigate(isAgent ? "/agent/projects" : "/admin/projects");
    } catch (error: any) {
      console.error("Failed to reject project:", error);
      toast.error(error?.response?.data?.message || "Failed to reject project");
    }
  };

  const handleEditProject = () => {
    // Validate all fields
    const titleError = validateTitle(editedTitle);
    const descriptionError = validateDescription(editedDescription);
    const budgetError = validateBudget(editedBudget);
    const timelineError = validateTimeline(editedTimeline);

    setValidationErrors({
      editedTitle: titleError,
      editedDescription: descriptionError,
      editedBudget: budgetError,
      editedTimeline: timelineError,
    });

    if (titleError || descriptionError || budgetError || timelineError) {
      toast.error("Please fix the validation errors");
      return;
    }

    // Extract weeks from timeline string or use default
    const weeksMatch = editedTimeline.match(/(\d+)\s*(?:week|weeks?)/i);
    const durationWeeks = weeksMatch
      ? parseInt(weeksMatch[1])
      : project.duration_weeks || 0;

    updateProject(project.id, {
      title: editedTitle,
      description: editedDescription,
      client_budget: parseFloat(editedBudget),
      duration_weeks: durationWeeks,
    });

    toast.success("Project updated successfully");
    setIsEditing(false);
    setValidationErrors({});
  };

  const handleCancelEdit = () => {
    setEditedTitle(project?.title || "");
    setEditedDescription(project?.description || "");
    setEditedBudget(project?.client_budget.toString() || "");
    setEditedTimeline(
      project?.duration_weeks ? `${project.duration_weeks} weeks` : ""
    );
    setIsEditing(false);
    setValidationErrors({});
  };

  const handleAssignAgent = async () => {
    // Only validate agent selection if we're assigning to an agent
    if (assignmentType === "assign_to_agent") {
      const agentError = validateAgentSelection(selectedAgentId);
      setFieldError("selectedAgentId", agentError);

      if (agentError) {
        toast.error("Please select an agent");
        return;
      }
    }

    try {
      // Check assignment type from state
      if (assignmentType === "assign_to_agent") {
        // Check if project is currently in-house and needs to be moved out
        if (project?.assignment_type === 'in_house') {
          // Move from in-house to agent - remove from in-house first
          const removeResponse = await apiClient.delete(`/in-house/by-project/${project.id}`);
          
          if (!removeResponse.data.success) {
            throw new Error(removeResponse.data.message || 'Failed to remove project from in-house');
          }
          
          // Then assign to agent
          await updateProject(project.id, {
            assigned_agent_id: selectedAgentId,
            assignment_type: "agent",
            status: "assigned",
          } as any);
          
          toast.success("Project reassigned from in-house to agent successfully!");
        } else {
          // Regular agent assignment
          await updateProject(project.id, {
            assigned_agent_id: selectedAgentId,
            assignment_type: "agent",
            status: "assigned",
          } as any);
          toast.success("Agent assigned successfully!");
        }
      } else if (assignmentType === "move_to_in_house") {
        // Move to in-house using new API
        const response = await apiClient.post('/in-house/move', {
          projectId: project.id,
          notes: 'Moved to in-house from project review',
          priority: 'medium'
        });

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to move project to in-house');
        }

        toast.success("Project moved to in-house successfully!");
      }
      
      loadStatus(project.id);
      setIsAssignAgentDialogOpen(false);
      setSelectedAgentId("");
      setIsEditingAgent(false);
      setAssignmentType("assign_to_agent");
      setFieldError("selectedAgentId", "");
      // Reload project to get updated data
      if (id) {
        const fetchedProject = await getProject(id);
        setProject(fetchedProject || null);
      }
    } catch (error: any) {
      console.error("Failed to assign project:", error);
      toast.error(error?.message || "Failed to assign project");
    }
  };

  const handleEditAgent = () => {
    setIsEditingAgent(true);
    setIsAssignAgentDialogOpen(true);
    setSelectedAgentId(project?.assigned_agent_id || "");
  };

  const handleWithdrawBid = () => {
    const existingBid = projectBids.find((b) => b.projectId === project?.id);
    if (existingBid) {
      setBidToWithdraw(existingBid);
      setIsWithdrawBidDialogOpen(true);
    }
  };

  const handleConfirmWithdrawBid = async (reason: string) => {
    if (!bidToWithdraw) return;

    try {
      await updateProject(project.id, {
        status: "closed",
      } as any);
      loadStatus(project.id);
      await bidService.deleteBid(bidToWithdraw.id, reason);
      deleteBid(bidToWithdraw.id); // Update global DataContext
      toast.success("Bid withdrawn successfully");
      setIsWithdrawBidDialogOpen(false);
      setBidToWithdraw(null);
      // Reload bids
      if (id) {
        const response = await bidService.getProjectBids(id);
        setProjectBids(Array.isArray(response) ? response : []);
      }
    } catch (error: any) {
      console.error("Failed to withdraw bid:", error);
      toast.error(error.message || "Failed to withdraw bid");
    }
  };
  const loadStatus = (id: string) => {
    // Force refresh from backend to get latest data (bypass cache)
    // Small delay to ensure backend has processed the update
    setTimeout(async () => {
      try {
        const refreshedProject = await getProject(id, true);
        if (refreshedProject) {
          setProject(refreshedProject);
        }
      } catch (error) {
        console.error("Failed to refresh project after status update:", error);
      }
    }, 300);
  };

  const handleProjectStatusUpdate = async (newStatus: string) => {
    if (!project || newStatus === project.status) return;

    try {
      // Update project status
      await updateProject(project.id, { status: newStatus as any });
      toast.success(
        `Project status updated to ${
          statusLabels[newStatus as keyof typeof statusLabels] || newStatus
        }`
      );

      // Force refresh from backend to get latest data (bypass cache)
      // Small delay to ensure backend has processed the update
      loadStatus(project.id);
    } catch (error: any) {
      console.error("Failed to update project status:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update project status"
      );
    }
  };

  const handleAddMilestone = () => {
    if (!project) return;

    // Validate all fields
    const titleError = validateMilestoneTitle(milestoneTitle);
    const startDateError = validateDate(milestoneStartDate, "Start date");
    const endDateError = validateDate(milestoneEndDate, "End date");
    const dateRangeError = validateDateRange(
      milestoneStartDate,
      milestoneEndDate
    );
    const descriptionError = validateMilestoneDescription(milestoneDescription);
    const amountPercentError = validateMilestoneAmountPercent(
      milestoneAmountPercent
    );
    const amountError = validateMilestoneAmount(
      milestoneAmount,
      project.client_budget
    );
    const amountFieldsError = validateMilestoneAmountFields(
      milestoneAmountPercent,
      milestoneAmount
    );

    setValidationErrors({
      milestoneTitle: titleError,
      milestoneStartDate: startDateError,
      milestoneEndDate: endDateError || dateRangeError,
      milestoneDescription: descriptionError,
      milestoneAmountPercent: amountPercentError || amountFieldsError,
      milestoneAmount: amountError || amountFieldsError,
    });

    if (
      titleError ||
      startDateError ||
      endDateError ||
      dateRangeError ||
      descriptionError ||
      amountPercentError ||
      amountError ||
      amountFieldsError
    ) {
      toast.error("Please fix the validation errors");
      return;
    }

    const milestones = getMilestonesByProject
      ? getMilestonesByProject(project.id)
      : [];
    let finalAmount = 0;

    if (milestoneAmount) {
      finalAmount = parseFloat(milestoneAmount);
    } else if (milestoneAmountPercent) {
      const amountPercent = parseFloat(milestoneAmountPercent);
      finalAmount = (project.client_budget * amountPercent) / 100;
    }

    createMilestone({
      project_id: project.id,
      title: milestoneTitle,
      description: milestoneDescription,
      amount: finalAmount,
      due_date: milestoneEndDate,
      status: "pending",
      order: milestones.length + 1,
    });

    toast.success("Milestone added successfully!");
    setIsAddMilestoneDialogOpen(false);
    setMilestoneTitle("");
    setMilestoneStartDate("");
    setMilestoneEndDate("");
    setMilestoneAmountPercent("");
    setMilestoneAmount("");
    setMilestoneDescription("");
    setValidationErrors({
      milestoneTitle: "",
      milestoneStartDate: "",
      milestoneEndDate: "",
      milestoneDescription: "",
      milestoneAmountPercent: "",
      milestoneAmount: "",
    });
  };

  const handleEditMilestone = (milestone: any) => {
    setEditingMilestone(milestone);
    setEditMilestoneTitle(milestone.title);
    setEditMilestoneStartDate("");
    setEditMilestoneEndDate(milestone.due_date);
    setEditMilestoneAmountPercent("");
    setEditMilestoneAmount(milestone.amount.toString());
    setEditMilestoneDescription(milestone.description);
    setIsEditMilestoneDialogOpen(true);
  };

  const handleUpdateMilestone = () => {
    if (!editingMilestone || !project) return;

    // Validate all fields
    const titleError = validateMilestoneTitle(editMilestoneTitle);
    const endDateError = validateDate(editMilestoneEndDate, "End date");
    const dateRangeError = editMilestoneStartDate
      ? validateDateRange(editMilestoneStartDate, editMilestoneEndDate)
      : "";
    const descriptionError = validateMilestoneDescription(
      editMilestoneDescription
    );
    const amountPercentError = validateMilestoneAmountPercent(
      editMilestoneAmountPercent
    );
    const amountError = validateMilestoneAmount(
      editMilestoneAmount,
      project.client_budget
    );
    const amountFieldsError = validateMilestoneAmountFields(
      editMilestoneAmountPercent,
      editMilestoneAmount
    );

    setValidationErrors({
      editMilestoneTitle: titleError,
      editMilestoneEndDate: endDateError || dateRangeError,
      editMilestoneDescription: descriptionError,
      editMilestoneAmountPercent: amountPercentError || amountFieldsError,
      editMilestoneAmount: amountError || amountFieldsError,
    });

    if (
      titleError ||
      endDateError ||
      dateRangeError ||
      descriptionError ||
      amountPercentError ||
      amountError ||
      amountFieldsError
    ) {
      toast.error("Please fix the validation errors");
      return;
    }

    let finalAmount = 0;
    if (editMilestoneAmount) {
      finalAmount = parseFloat(editMilestoneAmount);
    } else if (editMilestoneAmountPercent) {
      const amountPercent = parseFloat(editMilestoneAmountPercent);
      finalAmount = (project.client_budget * amountPercent) / 100;
    }

    updateMilestone(editingMilestone.id, {
      title: editMilestoneTitle,
      description: editMilestoneDescription,
      amount: finalAmount,
      due_date: editMilestoneEndDate,
    });

    toast.success("Milestone updated successfully!");
    setIsEditMilestoneDialogOpen(false);
    setEditingMilestone(null);
    // Reset form
    setEditMilestoneTitle("");
    setEditMilestoneStartDate("");
    setEditMilestoneEndDate("");
    setEditMilestoneAmountPercent("");
    setEditMilestoneAmount("");
    setEditMilestoneDescription("");
    setValidationErrors({
      editMilestoneTitle: "",
      editMilestoneStartDate: "",
      editMilestoneEndDate: "",
      editMilestoneDescription: "",
      editMilestoneAmountPercent: "",
      editMilestoneAmount: "",
    });
  };

  const handleDeleteMilestone = () => {
    if (!editingMilestone) return;

    deleteMilestone(editingMilestone.id);
    toast.success("Milestone deleted successfully!");
    setIsDeleteMilestoneDialogOpen(false);
    setEditingMilestone(null);
  };

  const openDeleteDialog = (milestone: any) => {
    setEditingMilestone(milestone);
    setIsDeleteMilestoneDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() =>
                navigate(isAgent ? "/agent/projects" : "/admin/projects")
              }
            >
              <ArrowLeft className="size-4 mr-2" />
            </Button>
            <div>
              <h1 className="text-3xl">
                {isAgent ? "Project Details" : "Project Review"}
              </h1>
              <p className="text-gray-600">Review and manage project details</p>
            </div>
          </div>
          <Badge className={statusColors[project.status]}>
            {statusLabels[project.status] || project.status.replace("_", " ")}
          </Badge>
        </div>

        {/* Action Buttons */}
        {project.status === "pending_review" && isAdmin && (
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-5 text-yellow-600" />
                <span className="font-medium">
                  This project requires your review
                </span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsRejectDialogOpen(true)}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="size-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => setIsApproveDialogOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="size-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList>
                <TabsTrigger value="details">
                  <FileText className="size-4 mr-2" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="client">
                  <User className="size-4 mr-2" />
                  Client Info
                </TabsTrigger>
                <TabsTrigger value="timeline">
                  <Clock className="size-4 mr-2" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="freelancer">
                  <Users className="size-4 mr-2" />
                  Assigned Freelancer
                </TabsTrigger>
                <TabsTrigger value="bidding">
                  <Award className="size-4 mr-2" />
                  Bidding Info
                </TabsTrigger>
                <TabsTrigger value="attachments">
                  <Paperclip className="size-4 mr-2" />
                  Attachments
                </TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    {isEditing ? (
                      <div>
                        <Input
                          value={editedTitle}
                          onChange={(e) => {
                            setEditedTitle(e.target.value);
                            setFieldError(
                              "editedTitle",
                              validateTitle(e.target.value)
                            );
                          }}
                          placeholder="Enter project title"
                          className={`text-2xl font-semibold ${
                            validationErrors.editedTitle ? "border-red-500" : ""
                          }`}
                        />
                        {validationErrors.editedTitle && (
                          <p className="text-sm text-red-500 mt-1">
                            {validationErrors.editedTitle}
                          </p>
                        )}
                      </div>
                    ) : (
                      <h2 className="text-2xl">{project.title}</h2>
                    )}
                    {!isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditedTitle(project.title);
                          setEditedDescription(project.description);
                          setEditedBudget(project.client_budget.toString());
                          setEditedTimeline(
                            project.duration_weeks
                              ? `${project.duration_weeks} weeks`
                              : ""
                          );
                          setIsEditing(true);
                        }}
                      >
                        <Edit className="size-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-600">Description</Label>
                      {isEditing ? (
                        <div>
                          <RichTextEditor
                            value={editedDescription}
                            onChange={(value) => {
                              setEditedDescription(value);
                              setFieldError(
                                "editedDescription",
                                validateDescription(value)
                              );
                            }}
                            placeholder="Describe the project..."
                            className={`mt-2 ${
                              validationErrors.editedDescription
                                ? "border-red-500"
                                : ""
                            }`}
                            minHeight="200px"
                          />
                          {validationErrors.editedDescription && (
                            <p className="text-sm text-red-500 mt-1">
                              {validationErrors.editedDescription}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="mt-2">
                          <RichTextViewer content={project.description || ""} />
                        </div>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <Label className="text-gray-600">Category</Label>
                        <p className="mt-1">{project.category}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Priority</Label>
                        <p className="mt-1 capitalize">
                          {project.priority || "Normal"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Timeline</Label>
                        {isEditing ? (
                          <div>
                            <Input
                              value={editedTimeline}
                              onChange={(e) => {
                                setEditedTimeline(e.target.value);
                                setFieldError(
                                  "editedTimeline",
                                  validateTimeline(e.target.value)
                                );
                              }}
                              placeholder="e.g., 2 weeks"
                              className={`mt-1 ${
                                validationErrors.editedTimeline
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                            {validationErrors.editedTimeline && (
                              <p className="text-sm text-red-500 mt-1">
                                {validationErrors.editedTimeline}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="mt-1">
                            {project.duration_weeks
                              ? `${project.duration_weeks} weeks`
                              : "N/A"}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-gray-600">Budget</Label>
                        {isEditing ? (
                          <div>
                            <Input
                              type="number"
                              value={editedBudget}
                              onChange={(e) => {
                                setEditedBudget(e.target.value);
                                setFieldError(
                                  "editedBudget",
                                  validateBudget(e.target.value)
                                );
                              }}
                              placeholder="Enter budget"
                              className={`mt-1 ${
                                validationErrors.editedBudget
                                  ? "border-red-500"
                                  : ""
                              }`}
                              min="0"
                              step="0.01"
                            />
                            {validationErrors.editedBudget && (
                              <p className="text-sm text-red-500 mt-1">
                                {validationErrors.editedBudget}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="mt-1">
                            ₹{project.client_budget?.toLocaleString() || "0"}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-gray-600">Created</Label>
                        <p className="mt-1">
                          {new Date(project.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                        <Button onClick={handleEditProject}>
                          <CheckCircle className="size-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    )}

                    {project.skills_required &&
                      project.skills_required.length > 0 && (
                        <div className="pt-4 border-t">
                          <Label className="text-gray-600">
                            Required Skills
                          </Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {project.skills_required.map((skill, idx) => (
                              <Badge key={idx} variant="outline">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </Card>

                {/* Milestones Section */}
                {projectMilestones.length > 0 && (
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-lg">
                        Milestones ({projectMilestones.length})
                      </h3>
                      <Badge variant="outline" className="text-sm">
                        <Target className="size-3 mr-1" />
                        Total: ₹
                        {projectMilestones
                          .reduce((sum, m) => sum + (Number(m.amount) || 0), 0)
                          .toLocaleString()}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {projectMilestones.map((milestone) => (
                        <div
                          key={milestone.id}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium text-gray-900">
                                  {milestone.title}
                                </h4>
                                <Badge
                                  variant={
                                    milestone.status === "paid"
                                      ? "default"
                                      : milestone.status === "approved"
                                      ? "default"
                                      : milestone.status === "submitted"
                                      ? "secondary"
                                      : "outline"
                                  }
                                  className={
                                    milestone.status === "paid"
                                      ? "bg-green-100 text-green-800 border-green-200"
                                      : milestone.status === "approved"
                                      ? "bg-blue-100 text-blue-800 border-blue-200"
                                      : milestone.status === "submitted"
                                      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                      : "bg-gray-100 text-gray-800 border-gray-200"
                                  }
                                >
                                  {milestone.status}
                                </Badge>
                              </div>
                              {milestone.description && (
                                <p className="text-sm text-gray-600 mb-2">
                                  {milestone.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="size-3" />
                                  <span>
                                    Due:{" "}
                                    {new Date(
                                      milestone.due_date
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <IndianRupee className="size-3" />
                                  <span className="font-medium text-gray-700">
                                    ₹{milestone.amount?.toLocaleString() || "0"}
                                  </span>
                                </div>
                                {project && (
                                  <span className="text-xs">
                                    (
                                    {(
                                      ((Number(milestone.amount) || 0) /
                                        (project.client_budget || 1)) *
                                      100
                                    ).toFixed(1)}
                                    % of budget)
                                  </span>
                                )}
                              </div>
                            </div>
                            {isSuperAdmin && (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditMilestone(milestone)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="size-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openDeleteDialog(milestone)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </TabsContent>

              {/* Client Info Tab */}
              <TabsContent value="client" className="space-y-4">
                <Card className="p-6">
                  <h3 className="font-medium mb-4">Client Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <User className="size-5 text-blue-600" />
                      </div>
                      <div>
                        <Label className="text-gray-600">Name</Label>
                        <p>{project.client_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-3 rounded-full">
                        <Mail className="size-5 text-green-600" />
                      </div>
                      <div>
                        <Label className="text-gray-600">Email</Label>
                        <p>{project.client_email || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 p-3 rounded-full">
                        <Phone className="size-5 text-purple-600" />
                      </div>
                      <div>
                        <Label className="text-gray-600">Phone</Label>
                        <p>{project.client_phone || "N/A"}</p>
                      </div>
                    </div>

                    <div>
                      <Button variant="outline" className="w-full">
                        <MessageSquare className="size-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="space-y-4">
                <Card className="p-6">
                  <h3 className="font-medium mb-4">Project Timeline</h3>
                  <ProjectTimeline
                    activityLogs={activityLogs}
                    project={project}
                    loading={loadingLogs}
                  />
                </Card>
              </TabsContent>

              {/* Assigned Freelancer Tab */}
              <TabsContent value="freelancer" className="space-y-4">
                {loadingFreelancer ? (
                  <Card className="p-6">
                    <div className="text-center py-8">
                      <p className="text-gray-600">
                        Loading freelancer details...
                      </p>
                    </div>
                  </Card>
                ) : project.freelancer_id ? (
                  assignedFreelancer ? (
                    (() => {
                      const freelancer = assignedFreelancer;
                      return (
                        <>
                          <Card className="p-6">
                            <div className="flex items-start justify-between mb-6">
                              <div className="flex items-center gap-4">
                                <div className="size-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-medium">
                                  {freelancer.name?.charAt(0)?.toUpperCase() ||
                                    "F"}
                                </div>
                                <div>
                                  <h2 className="text-2xl font-medium">
                                    {freelancer.name}
                                  </h2>
                                  <p className="text-gray-600">
                                    {freelancer.title || "Freelancer"}
                                  </p>
                                  {freelancer.rating !== undefined &&
                                    freelancer.rating > 0 && (
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-yellow-500">
                                          ⭐
                                        </span>
                                        <span className="font-medium">
                                          {freelancer.rating.toFixed(1)}
                                        </span>
                                        <span className="text-gray-500">
                                          ({freelancer.total_reviews || 0}{" "}
                                          reviews)
                                        </span>
                                      </div>
                                    )}
                                </div>
                              </div>
                              {freelancer.availability &&
                                freelancer.availability !== "unknown" && (
                                  <Badge
                                    className={
                                      freelancer.availability === "available"
                                        ? "bg-green-100 text-green-700"
                                        : freelancer.availability === "busy"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-gray-100 text-gray-700"
                                    }
                                  >
                                    {freelancer.availability}
                                  </Badge>
                                )}
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                              {freelancer.email && (
                                <div>
                                  <Label className="text-gray-600">Email</Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Mail className="size-4 text-gray-400" />
                                    <p>{freelancer.email}</p>
                                  </div>
                                </div>
                              )}

                              {freelancer.bio && (
                                <div>
                                  <Label className="text-gray-600">Bio</Label>
                                  <div className="mt-1">
                                    <RichTextViewer
                                      content={freelancer.bio || ""}
                                    />
                                  </div>
                                </div>
                              )}

                              {freelancer.hourly_rate &&
                                freelancer.hourly_rate > 0 && (
                                  <div>
                                    <Label className="text-gray-600">
                                      Hourly Rate
                                    </Label>
                                    <p className="mt-1 font-medium">
                                      ₹{freelancer.hourly_rate}/hour
                                    </p>
                                  </div>
                                )}

                              {freelancer.skills &&
                                freelancer.skills.length > 0 && (
                                  <div>
                                    <Label className="text-gray-600">
                                      Skills
                                    </Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {freelancer.skills.map((skill, idx) => (
                                        <Badge key={idx} variant="outline">
                                          {skill}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              {freelancer.member_since && (
                                <div>
                                  <Label className="text-gray-600">
                                    Member Since
                                  </Label>
                                  <p className="mt-1">
                                    {new Date(
                                      freelancer.member_since
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                            </div>
                          </Card>

                          {/* Accepted Proposal Section */}
                          {loadingAcceptedBidding ? (
                            <Card className="p-6">
                              <div className="text-center py-4">
                                <p className="text-gray-600">
                                  Loading proposal details...
                                </p>
                              </div>
                            </Card>
                          ) : acceptedBidding ? (
                            <Card className="p-6">
                              <h3 className="text-lg font-medium mb-4">
                                Accepted Proposal
                              </h3>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-gray-600">
                                      Bid Amount
                                    </Label>
                                    <p className="text-xl font-semibold mt-1">
                                      ₹
                                      {acceptedBidding.bidAmount?.toLocaleString() ||
                                        "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-gray-600">
                                      Timeline
                                    </Label>
                                    <p className="text-xl font-semibold mt-1">
                                      {acceptedBidding.timeline || "N/A"}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-gray-600">
                                    Proposal
                                  </Label>
                                  <div className="mt-2">
                                    <RichTextViewer
                                      content={
                                        acceptedBidding.proposal ||
                                        acceptedBidding.description ||
                                        "No proposal provided."
                                      }
                                    />
                                  </div>
                                </div>
                                {acceptedBidding.submittedAt && (
                                  <div>
                                    <Label className="text-gray-600">
                                      Submitted On
                                    </Label>
                                    <p className="mt-1">
                                      {new Date(
                                        acceptedBidding.submittedAt
                                      ).toLocaleString()}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </Card>
                          ) : null}

                          {(freelancer as any).portfolio &&
                            (freelancer as any).portfolio.length > 0 && (
                              <Card className="p-6">
                                <h3 className="font-medium mb-4">Portfolio</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {(freelancer as any).portfolio.map(
                                    (item: any, idx: number) => (
                                      <div
                                        key={idx}
                                        className="border rounded-lg p-4"
                                      >
                                        <h4 className="font-medium mb-2">
                                          {item.title}
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-2">
                                          {item.description}
                                        </p>
                                        {item.technologies &&
                                          item.technologies.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                              {item.technologies.map(
                                                (tech, techIdx) => (
                                                  <Badge
                                                    key={techIdx}
                                                    variant="secondary"
                                                    className="text-xs"
                                                  >
                                                    {tech}
                                                  </Badge>
                                                )
                                              )}
                                            </div>
                                          )}
                                        {item.url && (
                                          <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
                                          >
                                            View Project →
                                          </a>
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>
                              </Card>
                            )}

                          {(freelancer as any).certifications &&
                            (freelancer as any).certifications.length > 0 && (
                              <Card className="p-6">
                                <h3 className="font-medium mb-4">
                                  Certifications
                                </h3>
                                <div className="space-y-3">
                                  {(freelancer as any).certifications.map(
                                    (cert: any, idx: number) => (
                                      <div
                                        key={idx}
                                        className="flex items-center justify-between border-b pb-3 last:border-0"
                                      >
                                        <div>
                                          <p className="font-medium">
                                            {cert.name}
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            {cert.issuer}
                                          </p>
                                        </div>
                                        <Badge variant="outline">
                                          {cert.year}
                                        </Badge>
                                      </div>
                                    )
                                  )}
                                </div>
                              </Card>
                            )}

                          <Card className="p-6">
                            <div className="flex gap-3">
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() =>
                                  navigate(
                                    `/admin/users/${freelancer.id}/freelancer`
                                  )
                                }
                              >
                                <User className="size-4 mr-2" />
                                View Full Profile
                              </Button>
                              <Button variant="outline" className="flex-1">
                                <MessageSquare className="size-4 mr-2" />
                                Send Message
                              </Button>
                            </div>
                          </Card>
                        </>
                      );
                    })()
                  ) : (
                    <Card className="p-6">
                      <div className="text-center py-8">
                        <Users className="size-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                          Freelancer Not Found
                        </h3>
                        <p className="text-gray-600">
                          Freelancer with ID {project.freelancer_id} could not
                          be found.
                        </p>
                      </div>
                    </Card>
                  )
                ) : (
                  <Card className="p-6">
                    <div className="text-center py-8">
                      <Users className="size-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No Freelancer Assigned
                      </h3>
                      <p className="text-gray-600 mb-4">
                        This project doesn't have an assigned freelancer yet.
                      </p>
                      {project.status === "in_bidding" && (
                        <Button
                          onClick={() =>
                            navigate(
                              isAgent
                                ? `/agent/projects/${project.id}/bids`
                                : `/admin/projects/${project.id}/bids`
                            )
                          }
                        >
                          View Bids
                        </Button>
                      )}
                    </div>
                  </Card>
                )}
              </TabsContent>

              {/* Bidding Info Tab */}
              <TabsContent value="bidding" className="space-y-4">
                {loadingBids ? (
                  <Card className="p-6">
                    <div className="text-center py-12">
                      <Loader2 className="size-12 text-blue-600 mx-auto mb-4 animate-spin" />
                      <p className="text-gray-600">Loading bids...</p>
                    </div>
                  </Card>
                ) : projectBids.length > 0 ? (
                  <>
                    <Card className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-lg">
                          Bids ({projectBids.length})
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(
                              isAgent
                                ? `/agent/projects/${project.id}/bids`
                                : `/admin/projects/${project.id}/bids`
                            )
                          }
                        >
                          <Eye className="size-4 mr-2" />
                          Manage All Bids
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {projectBids.map((bid) => {
                          const freelancer = freelancers.find(
                            (f) => f.id === bid.bidderId
                          );
                          const getStatusColor = (status: string) => {
                            switch (status) {
                              case "accepted":
                                return "bg-green-100 text-green-800 border-green-200";
                              case "shortlisted":
                                return "bg-blue-100 text-blue-800 border-blue-200";
                              case "rejected":
                                return "bg-red-100 text-red-800 border-red-200";
                              case "pending":
                                return "bg-yellow-100 text-yellow-800 border-yellow-200";
                              default:
                                return "bg-gray-100 text-gray-800 border-gray-200";
                            }
                          };

                          return (
                            <Card
                              key={bid.id}
                              className="p-6 border-l-4 border-l-blue-500"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="bg-blue-100 p-2 rounded-full">
                                      <User className="size-5 text-blue-600" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-lg">
                                        {bid.bidderName || "Unknown Freelancer"}
                                      </h4>
                                      {freelancer && (
                                        <div className="flex items-center gap-2 mt-1">
                                          <div className="flex items-center gap-1">
                                            <Star className="size-3 text-yellow-500 fill-yellow-500" />
                                            <span className="text-sm text-gray-600">
                                              {freelancer.rating?.toFixed(1) ||
                                                "N/A"}
                                            </span>
                                          </div>
                                          <span className="text-sm text-gray-500">
                                            ({freelancer.total_reviews || 0}{" "}
                                            reviews)
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <Badge
                                      className={getStatusColor(bid.status)}
                                    >
                                      {bid.status.replace("_", " ")}
                                    </Badge>
                                  </div>

                                  <div className="grid md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                                    <div>
                                      <Label className="text-gray-600">
                                        Bid Amount
                                      </Label>
                                      <p className="text-xl font-medium mt-1">
                                        ₹
                                        {bid.bidAmount?.toLocaleString() || "0"}
                                      </p>
                                      {project && project.budget && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          {(
                                            (bid.bidAmount / project.budget) *
                                            100
                                          ).toFixed(1)}
                                          % of budget
                                        </p>
                                      )}
                                    </div>
                                    <div>
                                      <Label className="text-gray-600">
                                        Duration
                                      </Label>
                                      <p className="text-lg font-medium mt-1">
                                        {bid.timeline || "N/A"}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-gray-600">
                                        Platform Margin
                                      </Label>
                                      {project && project.budget && (
                                        <>
                                          <p className="text-lg font-medium mt-1 text-purple-600">
                                            ₹
                                            {(
                                              project.budget - bid.bidAmount
                                            ).toLocaleString()}
                                          </p>
                                          <p className="text-xs text-gray-500 mt-1">
                                            {(
                                              ((project.budget -
                                                bid.bidAmount) /
                                                project.budget) *
                                              100
                                            ).toFixed(1)}
                                            % margin
                                          </p>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {bid.description && (
                                    <div className="mt-4 pt-4 border-t">
                                      <Label className="text-gray-600">
                                        Description
                                      </Label>
                                      <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                                        <RichTextViewer
                                          content={bid.description}
                                        />
                                      </p>
                                    </div>
                                  )}

                                  {bid.submittedAt && (
                                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                                      <Calendar className="size-3" />
                                      <span>
                                        Submitted:{" "}
                                        {new Date(
                                          bid.submittedAt
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}

                                  {/* Freelancer Proposals Section */}
                                  {biddingsByBidId.has(bid.id) &&
                                    biddingsByBidId.get(bid.id)!.length > 0 && (
                                      <div className="mt-4 pt-4 border-t">
                                        <div className="flex items-center justify-between mb-3">
                                          <Label className="text-gray-600">
                                            Freelancer Proposals (
                                            {
                                              biddingsByBidId.get(bid.id)!
                                                .length
                                            }
                                            )
                                          </Label>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                          >
                                            <Link to={`/admin/bids/${bid.id}`}>
                                              <Eye className="size-4 mr-2" />
                                              View All Proposals
                                            </Link>
                                          </Button>
                                        </div>
                                        <div className="space-y-2">
                                          {biddingsByBidId
                                            .get(bid.id)!
                                            .slice(0, 3)
                                            .map((bidding: any) => {
                                              const freelancerId =
                                                bidding.freelancerId?._id ||
                                                bidding.freelancerId;
                                              const freelancerName =
                                                bidding.freelancerId?.name ||
                                                "Unknown Freelancer";

                                              return (
                                                <div
                                                  key={
                                                    bidding._id || bidding.id
                                                  }
                                                  className="p-3 bg-gray-50 rounded-lg border"
                                                >
                                                  <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                      <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm">
                                                          {freelancerName}
                                                        </span>
                                                        <Badge
                                                          className={getStatusColor(
                                                            bidding.status
                                                          )}
                                                        >
                                                          {bidding.status}
                                                        </Badge>
                                                      </div>
                                                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                                                        <span>
                                                          ₹
                                                          {bidding.bidAmount?.toLocaleString() ||
                                                            "0"}
                                                        </span>
                                                        {bidding.timeline && (
                                                          <span>
                                                            <Clock className="size-3 inline mr-1" />
                                                            {bidding.timeline}
                                                          </span>
                                                        )}
                                                      </div>
                                                    </div>
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      asChild
                                                    >
                                                      <Link
                                                        to={`/admin/bids/${
                                                          bid.id
                                                        }/proposal?biddingId=${
                                                          bidding._id ||
                                                          bidding.id
                                                        }`}
                                                      >
                                                        <Eye className="size-3 mr-1" />
                                                        View
                                                      </Link>
                                                    </Button>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          {biddingsByBidId.get(bid.id)!.length >
                                            3 && (
                                            <div className="text-center pt-2">
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                              >
                                                <Link
                                                  to={`/admin/bids/${bid.id}`}
                                                >
                                                  View{" "}
                                                  {biddingsByBidId.get(bid.id)!
                                                    .length - 3}{" "}
                                                  more proposal
                                                  {biddingsByBidId.get(bid.id)!
                                                    .length -
                                                    3 !==
                                                  1
                                                    ? "s"
                                                    : ""}
                                                </Link>
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </Card>
                  </>
                ) : (
                  <Card className="p-6">
                    <div className="text-center py-12">
                      <Award className="size-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Bids Yet</h3>
                      <p className="text-gray-600 mb-4">
                        This project doesn't have any bids submitted yet.
                      </p>
                      {project.status === "in_bidding" &&
                        (() => {
                          const existingBid = projectBids.find(
                            (b) => b.projectId === project?.id
                          );
                          const bidCreatedByAdminOrSuperadmin =
                            existingBid &&
                            (existingBid.bidder?.role === "admin" ||
                              existingBid.bidder?.role === "superadmin");
                          const bidCreatedByAgent =
                            existingBid && existingBid.bidderId === user?.id;
                          const shouldHideAddBid =
                            bidCreatedByAdminOrSuperadmin || bidCreatedByAgent;

                          return !shouldHideAddBid ? (
                            <Button
                              onClick={() =>
                                navigate(
                                  isAgent
                                    ? `/agent/projects/${project.id}/create-bid`
                                    : `/admin/projects/${project.id}/create-bid`
                                )
                              }
                            >
                              <Award className="size-4 mr-2" />
                              Create Bid
                            </Button>
                          ) : null;
                        })()}
                    </div>
                  </Card>
                )}
              </TabsContent>

              {/* Attachments Tab */}
              <TabsContent value="attachments" className="space-y-4">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-medium text-lg">
                      Project Attachments ({project.attachments?.length || 0})
                    </h3>
                  </div>
                  
                  {project.attachments && project.attachments.length > 0 ? (
                    <div className="space-y-3">
                      {project.attachments.map((attachment: any, index: number) => (
                        <AttachmentItem
                          key={attachment.id || attachment._id || index}
                          attachment={attachment}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Paperclip className="size-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Attachments</h3>
                      <p className="text-gray-600">
                        This project doesn't have any attachments yet.
                      </p>
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-medium mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {/* Project Status Update - Only for admin, agent, and superadmin */}
                {(isAdmin || isAgent) && project && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Project Status
                    </Label>
                    <Select
                      value={project.status}
                      onValueChange={handleProjectStatusUpdate}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                statusColors[
                                  project.status as keyof typeof statusColors
                                ] || "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {statusLabels[
                                project.status as keyof typeof statusLabels
                              ] || project.status}
                            </span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  statusColors[
                                    value as keyof typeof statusColors
                                  ] || "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {label}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {/* Hide "Add Bids" button if project already has a bid created by admin/superadmin or the agent themselves */}
                {(() => {
                  const existingBid = projectBids.find(
                    (b) => b.projectId === project?.id
                  );
                  const projectStatus = project?.status;

                  // Show Withdraw Bids for admin/superadmin if bid exists, otherwise show Add Bids

                  // Show Add Bids only if no bid exists and project is closed (after withdrawal)
                  if (!existingBid || projectStatus === "closed") {
                    return (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() =>
                          navigate(
                            isAgent
                              ? `/agent/projects/${project.id}/create-bid`
                              : `/admin/projects/${project.id}/create-bid`
                          )
                        }
                      >
                        <Users className="size-4 mr-2" />
                        Add Bids
                      </Button>
                    );
                  }
                  
                  // Show Withdraw Bids if bid exists
                  if (existingBid) {
                    return (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={handleWithdrawBid}
                      >
                        <Trash2 className="size-4 mr-2" />
                        Withdraw Bids
                      </Button>
                    );
                  }
                  
                  return null;
                })()}

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setIsAddMilestoneDialogOpen(true)}
                >
                  <Target className="size-4 mr-2" />
                  Add Milestone
                </Button>
                {/* Assignment Status - Only show for admin/superadmin */}
                {!isAgent && (
                  <>
                    {(!project?.assigned_agent_id && project?.assignment_type !== 'in_house') ? (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setIsAssignAgentDialogOpen(true)}
                      >
                        <User className="size-4 mr-2" />
                        Assign to Agent
                      </Button>
                    ) : (
                      <div className="space-y-2 p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {project?.assignment_type === 'in_house' ? (
                              <>
                                <Home className="size-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-600">
                                  In-House Project
                                </span>
                              </>
                            ) : (
                              <>
                                <User className="size-4 text-gray-600" />
                                <span className="text-sm font-medium">
                                  Assigned Agent
                                </span>
                              </>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleEditAgent}
                          >
                            <Edit className="size-3" />
                          </Button>
                        </div>
                        {project?.assignment_type === 'in_house' ? (
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-600">Project is currently in-house</p>
                            <p className="text-xs text-gray-500">
                              Can be reassigned to an agent
                            </p>
                          </div>
                        ) : (
                          (() => {
                            const assignedAgent = agents.find(
                              (a) => a.id === project.assigned_agent_id
                            );
                            return assignedAgent ? (
                              <div className="space-y-1 text-sm">
                                <p className="font-medium">{assignedAgent.name}</p>
                                <p className="text-gray-600">
                                  ID: {assignedAgent.userID || "N/A"}
                                </p>
                                <p className="text-gray-600">
                                  {assignedAgent.email}
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">
                                Loading agent details...
                              </p>
                            );
                          })()
                        )}
                      </div>
                    )}
                  </>
                )}
                {/* Show Agent Name for Agents (read-only) */}
                {isAgent && project?.assigned_agent_id && (
                  <div className="space-y-2 p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-gray-600" />
                      <span className="text-sm font-medium">
                        Assigned Agent
                      </span>
                    </div>
                    {(() => {
                      // For agents, show their own info if they're assigned
                      const assignedAgent =
                        agents.find(
                          (a) => a.id === project.assigned_agent_id
                        ) ||
                        (user?.id === project.assigned_agent_id && isAgent
                          ? {
                              name: user.name,
                              userID: user.userID,
                              email: user.email,
                            }
                          : null);
                      return assignedAgent ? (
                        <div className="space-y-1 text-sm">
                          <p className="font-medium">{assignedAgent.name}</p>
                          <p className="text-gray-600">
                            ID: {assignedAgent.userID || "N/A"}
                          </p>
                          <p className="text-gray-600">{assignedAgent.email}</p>
                        </div>
                      ) : isAgent && user ? (
                        <div className="space-y-1 text-sm">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-gray-600">
                            ID: {user.userID || "N/A"}
                          </p>
                          <p className="text-gray-600">{user.email}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Loading agent details...
                        </p>
                      );
                    })()}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Approve Dialog */}
        <ApproveProjectDialog
          isOpen={isApproveDialogOpen}
          onOpenChange={setIsApproveDialogOpen}
          onApprove={handleApproveProject}
        />

        {/* Reject Dialog */}
        <RejectProjectDialog
          isOpen={isRejectDialogOpen}
          onOpenChange={(open) => {
            setIsRejectDialogOpen(open);
            if (!open) {
              setRejectionReason("");
              setFieldError("rejectionReason", "");
            }
          }}
          onReject={handleRejectProject}
          rejectionReason={rejectionReason}
          onReasonChange={(value) => {
            setRejectionReason(value);
            setFieldError("rejectionReason", validateRejectionReason(value));
          }}
          validationError={validationErrors.rejectionReason}
        />

        {/* Add Milestone Dialog */}
        <AddMilestoneDialog
          isOpen={isAddMilestoneDialogOpen}
          onOpenChange={(open) => {
            setIsAddMilestoneDialogOpen(open);
            if (!open) {
              setMilestoneTitle("");
              setMilestoneStartDate("");
              setMilestoneEndDate("");
              setMilestoneAmountPercent("");
              setMilestoneAmount("");
              setMilestoneDescription("");
              setValidationErrors({
                milestoneTitle: "",
                milestoneStartDate: "",
                milestoneEndDate: "",
                milestoneDescription: "",
                milestoneAmountPercent: "",
                milestoneAmount: "",
              });
            }
          }}
          onAdd={handleAddMilestone}
          project={project}
          title={milestoneTitle}
          onTitleChange={(value) => {
            setMilestoneTitle(value);
            setFieldError("milestoneTitle", validateMilestoneTitle(value));
          }}
          startDate={milestoneStartDate}
          onStartDateChange={(value) => {
            setMilestoneStartDate(value);
            setFieldError(
              "milestoneStartDate",
              validateDate(value, "Start date")
            );
            if (milestoneEndDate) {
              setFieldError(
                "milestoneEndDate",
                validateDateRange(value, milestoneEndDate)
              );
            }
          }}
          endDate={milestoneEndDate}
          onEndDateChange={(value) => {
            setMilestoneEndDate(value);
            setFieldError("milestoneEndDate", validateDate(value, "End date"));
            if (milestoneStartDate) {
              setFieldError(
                "milestoneEndDate",
                validateDateRange(milestoneStartDate, value)
              );
            }
          }}
          amountPercent={milestoneAmountPercent}
          onAmountPercentChange={(value) => {
            if (
              value === "" ||
              (parseFloat(value) >= 0 && parseFloat(value) <= 100)
            ) {
              setMilestoneAmountPercent(value);
              if (value && project) {
                setMilestoneAmount("");
                setFieldError("milestoneAmount", "");
              }
              setFieldError(
                "milestoneAmountPercent",
                validateMilestoneAmountPercent(value)
              );
              if (!value && !milestoneAmount) {
                setFieldError(
                  "milestoneAmountPercent",
                  validateMilestoneAmountFields(value, milestoneAmount)
                );
              }
            }
          }}
          amount={milestoneAmount}
          onAmountChange={(value) => {
            if (
              value === "" ||
              (parseFloat(value) >= 0 &&
                (!project || parseFloat(value) <= project.client_budget))
            ) {
              setMilestoneAmount(value);
              if (value) {
                setMilestoneAmountPercent("");
                setFieldError("milestoneAmountPercent", "");
              }
              setFieldError(
                "milestoneAmount",
                validateMilestoneAmount(value, project?.client_budget)
              );
              if (!value && !milestoneAmountPercent) {
                setFieldError(
                  "milestoneAmount",
                  validateMilestoneAmountFields(milestoneAmountPercent, value)
                );
              }
            }
          }}
          description={milestoneDescription}
          onDescriptionChange={(value) => {
            setMilestoneDescription(value);
            setFieldError(
              "milestoneDescription",
              validateMilestoneDescription(value)
            );
          }}
          validationErrors={{
            milestoneTitle: validationErrors.milestoneTitle,
            milestoneStartDate: validationErrors.milestoneStartDate,
            milestoneEndDate: validationErrors.milestoneEndDate,
            milestoneAmountPercent: validationErrors.milestoneAmountPercent,
            milestoneAmount: validationErrors.milestoneAmount,
            milestoneDescription: validationErrors.milestoneDescription,
          }}
        />

        {/* Edit Milestone Dialog */}
        <EditMilestoneDialog
          isOpen={isEditMilestoneDialogOpen}
          onOpenChange={(open) => {
            setIsEditMilestoneDialogOpen(open);
            if (!open) {
              setEditMilestoneTitle("");
              setEditMilestoneStartDate("");
              setEditMilestoneEndDate("");
              setEditMilestoneAmountPercent("");
              setEditMilestoneAmount("");
              setEditMilestoneDescription("");
              setEditingMilestone(null);
              setValidationErrors({
                editMilestoneTitle: "",
                editMilestoneStartDate: "",
                editMilestoneEndDate: "",
                editMilestoneDescription: "",
                editMilestoneAmountPercent: "",
                editMilestoneAmount: "",
              });
            }
          }}
          onUpdate={handleUpdateMilestone}
          project={project}
          title={editMilestoneTitle}
          onTitleChange={(value) => {
            setEditMilestoneTitle(value);
            setFieldError("editMilestoneTitle", validateMilestoneTitle(value));
          }}
          startDate={editMilestoneStartDate}
          onStartDateChange={(value) => {
            setEditMilestoneStartDate(value);
            if (editMilestoneEndDate) {
              setFieldError(
                "editMilestoneEndDate",
                validateDateRange(value, editMilestoneEndDate)
              );
            }
          }}
          endDate={editMilestoneEndDate}
          onEndDateChange={(value) => {
            setEditMilestoneEndDate(value);
            setFieldError(
              "editMilestoneEndDate",
              validateDate(value, "End date")
            );
            if (editMilestoneStartDate) {
              setFieldError(
                "editMilestoneEndDate",
                validateDateRange(editMilestoneStartDate, value)
              );
            }
          }}
          amountPercent={editMilestoneAmountPercent}
          onAmountPercentChange={(value) => {
            if (
              value === "" ||
              (parseFloat(value) >= 0 && parseFloat(value) <= 100)
            ) {
              setEditMilestoneAmountPercent(value);
              if (value && project) {
                setEditMilestoneAmount("");
                setFieldError("editMilestoneAmount", "");
              }
              setFieldError(
                "editMilestoneAmountPercent",
                validateMilestoneAmountPercent(value)
              );
              if (!value && !editMilestoneAmount) {
                setFieldError(
                  "editMilestoneAmountPercent",
                  validateMilestoneAmountFields(value, editMilestoneAmount)
                );
              }
            }
          }}
          amount={editMilestoneAmount}
          onAmountChange={(value) => {
            if (
              value === "" ||
              (parseFloat(value) >= 0 &&
                (!project || parseFloat(value) <= project.client_budget))
            ) {
              setEditMilestoneAmount(value);
              if (value) {
                setEditMilestoneAmountPercent("");
                setFieldError("editMilestoneAmountPercent", "");
              }
              setFieldError(
                "editMilestoneAmount",
                validateMilestoneAmount(value, project?.client_budget)
              );
              if (!value && !editMilestoneAmountPercent) {
                setFieldError(
                  "editMilestoneAmount",
                  validateMilestoneAmountFields(
                    editMilestoneAmountPercent,
                    value
                  )
                );
              }
            }
          }}
          description={editMilestoneDescription}
          onDescriptionChange={(value) => {
            setEditMilestoneDescription(value);
            setFieldError(
              "editMilestoneDescription",
              validateMilestoneDescription(value)
            );
          }}
          validationErrors={{
            editMilestoneTitle: validationErrors.editMilestoneTitle,
            editMilestoneStartDate: validationErrors.editMilestoneStartDate,
            editMilestoneEndDate: validationErrors.editMilestoneEndDate,
            editMilestoneAmountPercent:
              validationErrors.editMilestoneAmountPercent,
            editMilestoneAmount: validationErrors.editMilestoneAmount,
            editMilestoneDescription: validationErrors.editMilestoneDescription,
          }}
        />

        {/* Delete Milestone Dialog */}
        <DeleteMilestoneDialog
          isOpen={isDeleteMilestoneDialogOpen}
          onOpenChange={setIsDeleteMilestoneDialogOpen}
          onDelete={handleDeleteMilestone}
          milestone={editingMilestone}
        />

        {/* Assign Agent Dialog */}
        <AssignAgentDialog
          isOpen={isAssignAgentDialogOpen}
          onOpenChange={(open) => {
            setIsAssignAgentDialogOpen(open);
            if (!open) {
              setSelectedAgentId("");
              setIsEditingAgent(false);
              setAssignmentType("assign_to_agent");
            }
          }}
          onAssign={handleAssignAgent}
          agents={agents}
          selectedAgentId={selectedAgentId}
          onAgentSelect={setSelectedAgentId}
          isEditingAgent={isEditingAgent}
          validationError={validationErrors.selectedAgentId}
          assignmentType={assignmentType}
          onAssignmentTypeChange={setAssignmentType}
        />

        {/* Withdraw Bid Dialog */}
        <DeleteWithReasonDialog
          open={isWithdrawBidDialogOpen}
          onOpenChange={(open) => {
            setIsWithdrawBidDialogOpen(open);
            if (!open) {
              setBidToWithdraw(null);
            }
          }}
          onConfirm={handleConfirmWithdrawBid}
          title="Withdraw Bid"
          description="Are you sure you want to withdraw this bid? Please provide a reason for withdrawal."
          confirmText="Withdraw Bid"
          cancelText="Cancel"
          reasonPlaceholder="Please provide a reason for withdrawing this bid (e.g., 'Project requirements changed', 'Client requested cancellation')"
        />
      </div>
    </DashboardLayout>
  );
}
