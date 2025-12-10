import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/shared/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
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
  DollarSign,
  Clock,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  AlertCircle,
  TrendingUp,
  Users,
  MessageSquare,
  Send,
  Calculator,
  Target,
  Briefcase,
  Trash2,
  Award,
  Star,
  Eye,
} from "lucide-react";
import { toast } from "../../utils/toast";

export default function ProjectReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    projects,
    updateProject,
    freelancers,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    getMilestonesByProject,
    getBidsByProject,
  } = useData();

  const project = projects.find((p) => p.id === id);
  const projectMilestones = project ? getMilestonesByProject(project.id) : [];
  const projectBids = project && getBidsByProject ? getBidsByProject(project.id) : [];
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

  if (!project) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="size-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl mb-2">Project Not Found</h2>
            <Button onClick={() => navigate("/admin/projects")}>
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

  const handleApproveProject = () => {
    updateProject(project.id, {
      status: "in_bidding",
    });
    toast.success("Project approved and moved to bidding!");
    setIsApproveDialogOpen(false);
    navigate("/admin/projects");
  };

  const handleRejectProject = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    updateProject(project.id, {
      status: "cancelled",
    });
    toast.success("Project rejected");
    setIsRejectDialogOpen(false);
    navigate("/admin/projects");
  };

  const handleEditProject = () => {
    if (!editedTitle.trim() || !editedDescription.trim() || !editedBudget) {
      toast.error("Please fill all required fields");
      return;
    }

    // Extract weeks from timeline string or use default
    const weeksMatch = editedTimeline.match(/(\d+)\s*(?:week|weeks?)/i);
    const durationWeeks = weeksMatch ? parseInt(weeksMatch[1]) : project.duration_weeks || 0;

    updateProject(project.id, {
      title: editedTitle,
      description: editedDescription,
      client_budget: parseFloat(editedBudget),
      duration_weeks: durationWeeks,
    });

    toast.success("Project updated successfully");
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedTitle(project?.title || "");
    setEditedDescription(project?.description || "");
    setEditedBudget(project?.client_budget.toString() || "");
    setEditedTimeline(
      project?.duration_weeks ? `${project.duration_weeks} weeks` : ""
    );
    setIsEditing(false);
  };

  const handleAddMilestone = () => {
    if (
      !milestoneTitle.trim() ||
      !milestoneStartDate ||
      !milestoneEndDate ||
      !milestoneDescription.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!milestoneAmountPercent && !milestoneAmount) {
      toast.error("Please provide either amount percentage or amount");
      return;
    }

    if (!project) return;

    // Validate percentage range (0-100%)
    if (milestoneAmountPercent) {
      const percent = parseFloat(milestoneAmountPercent);
      if (percent < 0 || percent > 100) {
        toast.error("Percentage must be between 0% and 100%");
        return;
      }
    }

    // Validate amount limit (cannot exceed project budget)
    if (milestoneAmount) {
      const amount = parseFloat(milestoneAmount);
      if (amount < 0) {
        toast.error("Amount cannot be negative");
        return;
      }
      if (amount > project.client_budget) {
        toast.error(
          `Amount cannot exceed project budget of ₹${project.client_budget.toLocaleString()}`
        );
        return;
      }
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

    if (
      !editMilestoneTitle.trim() ||
      !editMilestoneEndDate ||
      !editMilestoneDescription.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!editMilestoneAmountPercent && !editMilestoneAmount) {
      toast.error("Please provide either amount percentage or amount");
      return;
    }

    // Validate percentage range (0-100%)
    if (editMilestoneAmountPercent) {
      const percent = parseFloat(editMilestoneAmountPercent);
      if (percent < 0 || percent > 100) {
        toast.error("Percentage must be between 0% and 100%");
        return;
      }
    }

    // Validate amount limit (cannot exceed project budget)
    if (editMilestoneAmount) {
      const amount = parseFloat(editMilestoneAmount);
      if (amount < 0) {
        toast.error("Amount cannot be negative");
        return;
      }
      if (amount > project.client_budget) {
        toast.error(
          `Amount cannot exceed project budget of ₹${project.client_budget.toLocaleString()}`
        );
        return;
      }
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
            <Button variant="ghost" onClick={() => navigate("/admin/projects")}>
              <ArrowLeft className="size-4 mr-2" />
            </Button>
            <div>
              <h1 className="text-3xl">Project Review</h1>
              <p className="text-gray-600">Review and manage project details</p>
            </div>
          </div>
          <Badge className={statusColors[project.status]}>
            {statusLabels[project.status] || project.status.replace("_", " ")}
          </Badge>
        </div>

        {/* Action Buttons */}
        {project.status === "pending_review" && (
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
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    {isEditing ? (
                      <Input
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        placeholder="Enter project title"
                        className="text-2xl font-semibold"
                      />
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
                            project.duration_weeks ? `${project.duration_weeks} weeks` : ""
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
                        <Textarea
                          value={editedDescription}
                          onChange={(e) => setEditedDescription(e.target.value)}
                          placeholder="Describe the project..."
                          rows={5}
                          className="mt-2"
                        />
                      ) : (
                        <p className="mt-2 text-gray-900">
                          {project.description}
                        </p>
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
                          <Input
                            value={editedTimeline}
                            onChange={(e) => setEditedTimeline(e.target.value)}
                            placeholder="e.g., 2-3 months"
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1">
                            {project.duration_weeks ? `${project.duration_weeks} weeks` : "N/A"}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-gray-600">Budget</Label>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editedBudget}
                            onChange={(e) => setEditedBudget(e.target.value)}
                            placeholder="Enter budget"
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1">
                            ₹{project.client_budget.toLocaleString()}
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

                    {project.skills_required && project.skills_required.length > 0 && (
                      <div className="pt-4 border-t">
                        <Label className="text-gray-600">Required Skills</Label>
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
                          .reduce((sum, m) => sum + m.amount, 0)
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
                                  <DollarSign className="size-3" />
                                  <span className="font-medium text-gray-700">
                                    ₹{milestone.amount.toLocaleString()}
                                  </span>
                                </div>
                                {project && (
                                  <span className="text-xs">
                                    (
                                    {(
                                      (milestone.amount /
                                        project.client_budget) *
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
                        <p>client@example.com</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 p-3 rounded-full">
                        <Phone className="size-5 text-purple-600" />
                      </div>
                      <div>
                        <Label className="text-gray-600">Phone</Label>
                        <p>+91 98765 43210</p>
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

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-gray-100 p-2 rounded-full mt-1">
                        <Clock className="size-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Project Created</p>
                        <p className="text-sm text-gray-600">
                          {new Date(project.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {project.status !== "draft" &&
                      project.status !== "pending_review" && (
                        <div className="flex items-start gap-3">
                          <div className="bg-green-100 p-2 rounded-full mt-1">
                            <CheckCircle className="size-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Admin Approved</p>
                            <p className="text-sm text-gray-600">
                              Project moved to bidding phase
                            </p>
                          </div>
                        </div>
                      )}

                    <div className="pt-4 border-t">
                      <Label className="text-gray-600">
                        Estimated Duration
                      </Label>
                      <p className="mt-1">
                        {project.duration_weeks ? `${project.duration_weeks} weeks` : "N/A"}
                      </p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Assigned Freelancer Tab */}
              <TabsContent value="freelancer" className="space-y-4">
                {project.freelancer_id ? (
                  (() => {
                    const freelancer = freelancers.find(
                      (f) => f.id === project.freelancer_id
                    );
                    if (!freelancer) {
                      return (
                        <Card className="p-6">
                          <div className="text-center py-8">
                            <Users className="size-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">
                              Freelancer Not Found
                            </h3>
                            <p className="text-gray-600">
                              Freelancer with ID {project.freelancer_id} could
                              not be found.
                            </p>
                          </div>
                        </Card>
                      );
                    }
                    return (
                      <>
                        <Card className="p-6">
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className="size-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-medium">
                                {freelancer.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h2 className="text-2xl font-medium">
                                  {freelancer.name}
                                </h2>
                                <p className="text-gray-600">
                                  {freelancer.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-yellow-500">⭐</span>
                                  <span className="font-medium">
                                    {freelancer.rating.toFixed(1)}
                                  </span>
                                  <span className="text-gray-500">
                                    ({freelancer.total_reviews} reviews)
                                  </span>
                                </div>
                              </div>
                            </div>
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
                          </div>

                          <div className="space-y-4 pt-4 border-t">
                            <div>
                              <Label className="text-gray-600">Email</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Mail className="size-4 text-gray-400" />
                                <p>{freelancer.email}</p>
                              </div>
                            </div>

                            <div>
                              <Label className="text-gray-600">Bio</Label>
                              <p className="mt-1 text-gray-900">
                                {freelancer.bio}
                              </p>
                            </div>

                            <div>
                              <Label className="text-gray-600">
                                Hourly Rate
                              </Label>
                              <p className="mt-1 font-medium">
                                ₹{freelancer.hourly_rate}/hour
                              </p>
                            </div>

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
                          </div>
                        </Card>

                        {freelancer.portfolio &&
                          freelancer.portfolio.length > 0 && (
                            <Card className="p-6">
                              <h3 className="font-medium mb-4">Portfolio</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {freelancer.portfolio.map((item, idx) => (
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
                                ))}
                              </div>
                            </Card>
                          )}

                        {freelancer.certifications &&
                          freelancer.certifications.length > 0 && (
                            <Card className="p-6">
                              <h3 className="font-medium mb-4">
                                Certifications
                              </h3>
                              <div className="space-y-3">
                                {freelancer.certifications.map((cert, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between border-b pb-3 last:border-0"
                                  >
                                    <div>
                                      <p className="font-medium">{cert.name}</p>
                                      <p className="text-sm text-gray-600">
                                        {cert.issuer}
                                      </p>
                                    </div>
                                    <Badge variant="outline">{cert.year}</Badge>
                                  </div>
                                ))}
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
                                  `/admin/freelancers/${freelancer.id}/detail`
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
                        No Freelancer Assigned
                      </h3>
                      <p className="text-gray-600 mb-4">
                        This project doesn't have an assigned freelancer yet.
                      </p>
                      {project.status === "in_bidding" && (
                        <Button
                          onClick={() =>
                            navigate(`/admin/projects/${project.id}/bids`)
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
                {projectBids.length > 0 ? (
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
                            navigate(`/admin/projects/${project.id}/bids`)
                          }
                        >
                          <Eye className="size-4 mr-2" />
                          Manage All Bids
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {projectBids.map((bid) => {
                          const freelancer = freelancers.find(
                            (f) => f.id === bid.freelancer_id
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
                                        {bid.freelancer_name || "Unknown Freelancer"}
                                      </h4>
                                      {freelancer && (
                                        <div className="flex items-center gap-2 mt-1">
                                          <div className="flex items-center gap-1">
                                            <Star className="size-3 text-yellow-500 fill-yellow-500" />
                                            <span className="text-sm text-gray-600">
                                              {freelancer.rating.toFixed(1)}
                                            </span>
                                          </div>
                                          <span className="text-sm text-gray-500">
                                            ({freelancer.total_reviews} reviews)
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
                                        ₹{bid.amount.toLocaleString()}
                                      </p>
                                      {project && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          {(
                                            (bid.amount / project.client_budget) *
                                            100
                                          ).toFixed(1)}% of budget
                                        </p>
                                      )}
                                    </div>
                                    <div>
                                      <Label className="text-gray-600">
                                        Duration
                                      </Label>
                                      <p className="text-lg font-medium mt-1">
                                        {bid.duration_weeks
                                          ? `${bid.duration_weeks} weeks`
                                          : bid.estimated_duration || "N/A"}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-gray-600">
                                        Platform Margin
                                      </Label>
                                      {project && (
                                        <>
                                          <p className="text-lg font-medium mt-1 text-purple-600">
                                            ₹
                                            {(
                                              project.client_budget - bid.amount
                                            ).toLocaleString()}
                                          </p>
                                          <p className="text-xs text-gray-500 mt-1">
                                            {(
                                              ((project.client_budget -
                                                bid.amount) /
                                                project.client_budget) *
                                              100
                                            ).toFixed(1)}% margin
                                          </p>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {bid.cover_letter && (
                                    <div className="mt-4 pt-4 border-t">
                                      <Label className="text-gray-600">
                                        Cover Letter
                                      </Label>
                                      <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                                        {bid.cover_letter}
                                      </p>
                                    </div>
                                  )}

                                  {bid.submitted_at && (
                                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                                      <Calendar className="size-3" />
                                      <span>
                                        Submitted:{" "}
                                        {new Date(
                                          bid.submitted_at
                                        ).toLocaleDateString()}
                                      </span>
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
                      <h3 className="text-lg font-medium mb-2">
                        No Bids Yet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        This project doesn't have any bids submitted yet.
                      </p>
                      {project.status === "in_bidding" && (
                        <Button
                          onClick={() =>
                            navigate(`/admin/projects/${project.id}/create-bid`)
                          }
                        >
                          <Award className="size-4 mr-2" />
                          Create Bid
                        </Button>
                      )}
                    </div>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-medium mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate(`/admin/projects/${project.id}/create-bid`)}
                >
                  <Users className="size-4 mr-2" />
                  Add Bids
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setIsAddMilestoneDialogOpen(true)}
                >
                  <Target className="size-4 mr-2" />
                  Add Milestone
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Approve Dialog */}
        <Dialog
          open={isApproveDialogOpen}
          onOpenChange={setIsApproveDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Project</DialogTitle>
              <DialogDescription>
                This will move the project to the bidding phase where
                freelancers can submit proposals.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsApproveDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApproveProject}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="size-4 mr-2" />
                Approve Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Project</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this project.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Rejection Reason *</Label>
                <Textarea
                  placeholder="Explain why this project is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsRejectDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRejectProject}
                className="bg-red-600 hover:bg-red-700"
              >
                <XCircle className="size-4 mr-2" />
                Reject Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


        {/* Add Milestone Dialog */}
        <Dialog
          open={isAddMilestoneDialogOpen}
          onOpenChange={setIsAddMilestoneDialogOpen}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Milestone</DialogTitle>
              <DialogDescription>
                Create a new milestone for this project
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="milestone-title">Milestone Title *</Label>
                <Input
                  id="milestone-title"
                  placeholder="e.g., Design Phase, Development Phase, Testing"
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="milestone-start-date">Start Date *</Label>
                  <Input
                    id="milestone-start-date"
                    type="date"
                    value={milestoneStartDate}
                    onChange={(e) => setMilestoneStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="milestone-end-date">End Date *</Label>
                  <Input
                    id="milestone-end-date"
                    type="date"
                    value={milestoneEndDate}
                    onChange={(e) => setMilestoneEndDate(e.target.value)}
                    min={milestoneStartDate}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="milestone-amount-percent">
                    Amount Percentage (%)
                  </Label>
                  <Input
                    id="milestone-amount-percent"
                    type="number"
                    placeholder="e.g., 25"
                    min="0"
                    max="100"
                    step="0.01"
                    value={milestoneAmountPercent}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (
                        value === "" ||
                        (parseFloat(value) >= 0 && parseFloat(value) <= 100)
                      ) {
                        setMilestoneAmountPercent(value);
                        if (value && project) {
                          setMilestoneAmount("");
                        }
                      }
                    }}
                  />
                  {milestoneAmountPercent && project && (
                    <p className="text-sm text-gray-500 mt-1">
                      Amount: ₹
                      {(
                        (project.client_budget *
                          parseFloat(milestoneAmountPercent)) /
                        100
                      ).toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Range: 0% - 100%</p>
                </div>
                <div>
                  <Label htmlFor="milestone-amount">Amount (₹)</Label>
                  <Input
                    id="milestone-amount"
                    type="number"
                    placeholder="e.g., 50000"
                    min="0"
                    max={project?.client_budget || 0}
                    step="0.01"
                    value={milestoneAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (
                        value === "" ||
                        (parseFloat(value) >= 0 &&
                          (!project ||
                            parseFloat(value) <= project.client_budget))
                      ) {
                        setMilestoneAmount(value);
                        if (value) {
                          setMilestoneAmountPercent("");
                        }
                      }
                    }}
                  />
                  {milestoneAmount && project && (
                    <p className="text-sm text-gray-500 mt-1">
                      {(
                        (parseFloat(milestoneAmount) / project.client_budget) *
                        100
                      ).toFixed(1)}
                      % of budget
                    </p>
                  )}
                  {project && (
                    <p className="text-xs text-gray-400 mt-1">
                      Max: ₹{project.client_budget.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="milestone-description">Description *</Label>
                <Textarea
                  id="milestone-description"
                  placeholder="Describe what needs to be completed in this milestone..."
                  rows={4}
                  value={milestoneDescription}
                  onChange={(e) => setMilestoneDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddMilestoneDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddMilestone}>
                <Target className="size-4 mr-2" />
                Add Milestone
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Milestone Dialog */}
        <Dialog
          open={isEditMilestoneDialogOpen}
          onOpenChange={setIsEditMilestoneDialogOpen}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Milestone</DialogTitle>
              <DialogDescription>Update milestone details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-milestone-title">Milestone Title *</Label>
                <Input
                  id="edit-milestone-title"
                  placeholder="e.g., Design Phase, Development Phase, Testing"
                  value={editMilestoneTitle}
                  onChange={(e) => setEditMilestoneTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-milestone-start-date">Start Date</Label>
                  <Input
                    id="edit-milestone-start-date"
                    type="date"
                    value={editMilestoneStartDate}
                    onChange={(e) => setEditMilestoneStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-milestone-end-date">End Date *</Label>
                  <Input
                    id="edit-milestone-end-date"
                    type="date"
                    value={editMilestoneEndDate}
                    onChange={(e) => setEditMilestoneEndDate(e.target.value)}
                    min={editMilestoneStartDate}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-milestone-amount-percent">
                    Amount Percentage (%)
                  </Label>
                  <Input
                    id="edit-milestone-amount-percent"
                    type="number"
                    placeholder="e.g., 25"
                    min="0"
                    max="100"
                    step="0.01"
                    value={editMilestoneAmountPercent}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (
                        value === "" ||
                        (parseFloat(value) >= 0 && parseFloat(value) <= 100)
                      ) {
                        setEditMilestoneAmountPercent(value);
                        if (value && project) {
                          setEditMilestoneAmount("");
                        }
                      }
                    }}
                  />
                  {editMilestoneAmountPercent && project && (
                    <p className="text-sm text-gray-500 mt-1">
                      Amount: ₹
                      {(
                        (project.client_budget *
                          parseFloat(editMilestoneAmountPercent)) /
                        100
                      ).toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Range: 0% - 100%</p>
                </div>
                <div>
                  <Label htmlFor="edit-milestone-amount">Amount (₹)</Label>
                  <Input
                    id="edit-milestone-amount"
                    type="number"
                    placeholder="e.g., 50000"
                    min="0"
                    max={project?.client_budget || 0}
                    step="0.01"
                    value={editMilestoneAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (
                        value === "" ||
                        (parseFloat(value) >= 0 &&
                          (!project ||
                            parseFloat(value) <= project.client_budget))
                      ) {
                        setEditMilestoneAmount(value);
                        if (value) {
                          setEditMilestoneAmountPercent("");
                        }
                      }
                    }}
                  />
                  {editMilestoneAmount && project && (
                    <p className="text-sm text-gray-500 mt-1">
                      {(
                        (parseFloat(editMilestoneAmount) /
                          project.client_budget) *
                        100
                      ).toFixed(1)}
                      % of budget
                    </p>
                  )}
                  {project && (
                    <p className="text-xs text-gray-400 mt-1">
                      Max: ₹{project.client_budget.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="edit-milestone-description">
                  Description *
                </Label>
                <Textarea
                  id="edit-milestone-description"
                  placeholder="Describe what needs to be completed in this milestone..."
                  rows={4}
                  value={editMilestoneDescription}
                  onChange={(e) => setEditMilestoneDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditMilestoneDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateMilestone}>
                <CheckCircle className="size-4 mr-2" />
                Update Milestone
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Milestone Dialog */}
        <Dialog
          open={isDeleteMilestoneDialogOpen}
          onOpenChange={setIsDeleteMilestoneDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Milestone</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this milestone? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {editingMilestone && (
              <div className="py-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">
                    {editingMilestone.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Amount: ₹{editingMilestone.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Due:{" "}
                    {new Date(editingMilestone.due_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteMilestoneDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteMilestone}>
                <Trash2 className="size-4 mr-2" />
                Delete Milestone
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
