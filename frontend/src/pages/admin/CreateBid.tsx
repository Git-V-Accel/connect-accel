import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/shared/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { RichTextEditor } from "../../components/common/RichTextEditor";
import { Label } from "../../components/ui/label";
import { useData } from "../../contexts/DataContext";
import { useAuth } from "../../contexts/AuthContext";
import { createBid } from "../../services/bidService";
import {
  projectTypes,
  statusColors,
  statusLabels,
} from "../../constants/projectConstants";
import {
  ArrowLeft,
  IndianRupee,
  Clock,
  Calendar,
  FileText,
  User,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "../../utils/toast";
import { RichTextViewer } from "../../components/common";
import ProjectDetail from "../client/ProjectDetail";

export default function CreateBid() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects } = useData();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // Filter projects based on user role
  const availableProjects =
    user?.role === "agent"
      ? projects.filter((p) => p.assigned_agent_id === user?.id)
      : projects;

  const [selectedProjectId, setSelectedProjectId] = useState<string>(id || "");
  const project = availableProjects.find((p) => p.id === selectedProjectId);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    project_type: "",
    amount: "",
    duration_weeks: "",
  });

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || "",
        description: project.description || "",
        category: project.category || "",
        project_type: project.project_type || "",
        amount: "",
        duration_weeks: "",
      });
    }
  }, [project]);

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    const selectedProject = availableProjects.find((p) => p.id === projectId);
    if (selectedProject) {
      setFormData({
        title: selectedProject.title || "",
        description: selectedProject.description || "",
        category: selectedProject.category || "",
        project_type: (selectedProject as any)?.project_type || "",
        amount: "",
        duration_weeks: "",
      });
    }
  };

  if (!selectedProjectId) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() =>
                  navigate(
                    user?.role === "agent" ? "/agent/bids" : "/admin/bids"
                  )
                }
              >
                <ArrowLeft className="size-4 mr-2" />
              </Button>
              <div>
                <h1 className="text-3xl">Create Bid</h1>
                <p className="text-gray-600 mt-1">
                  Select a project to create a bid
                </p>
              </div>
            </div>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="project-select">Select Project *</Label>
                <select
                  id="project-select"
                  value={selectedProjectId}
                  onChange={(e) => handleProjectSelect(e.target.value)}
                  className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a project...</option>
                  {availableProjects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
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
                navigate(user?.role === "agent" ? "/agent/bids" : "/admin/bids")
              }
            >
              Back to Bid Management
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a project title");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Please enter a project description");
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid bid amount");
      return;
    }

    const bidAmount = parseFloat(formData.amount);
    if (project.budget && bidAmount > project.budget) {
      toast.warning(
        `Warning: Bid amount ($${bidAmount.toLocaleString()}) exceeds project budget ($${project.budget.toLocaleString()})`
      );
      // Allow submission but show warning
    }

    if (!formData.duration_weeks || parseInt(formData.duration_weeks) <= 0) {
      toast.error("Please enter a valid duration");
      return;
    }

    try {
      setSubmitting(true);
      await createBid({
        projectId: project.id,
        projectTitle: formData.title.trim(),
        bidAmount: bidAmount,
        timeline: `${formData.duration_weeks} weeks`,
        description: formData.description.trim(),
        notes: "",
      });

      toast.success("Bid created successfully!");
      const redirectPath =
        user?.role === "agent" ? `/agent/bids` : `/admin/bids`;
      navigate(redirectPath);
    } catch (error: any) {
      console.error("Failed to create bid:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create bid";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const statusColorMap: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    pending: "bg-yellow-100 text-yellow-700",
    pending_review: "bg-yellow-100 text-yellow-700",
    active: "bg-yellow-100 text-yellow-700",
    in_bidding: "bg-blue-100 text-blue-700",
    bidding: "bg-blue-100 text-blue-700",
    assigned: "bg-purple-100 text-purple-700",
    in_progress: "bg-green-100 text-green-700",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-700",
    rejected: "bg-red-100 text-red-700",
    disputed: "bg-orange-100 text-orange-700",
    open: "bg-blue-100 text-blue-700",
    hold: "bg-orange-100 text-orange-700",
    closed: "bg-gray-100 text-gray-700",
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
                navigate(user?.role === "agent" ? "/agent/bids" : "/admin/bids")
              }
            >
              <ArrowLeft className="size-4 mr-2" />
            </Button>
            <div>
              <h1 className="text-3xl">Create Bid</h1>
              <p className="text-gray-600 mt-1">
                Add a new bid for this project
              </p>
            </div>
          </div>
        </div>

        {/* Main Content - Split Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Side - Project Details */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl">{project.title}</h2>
                <Badge
                  className={statusColorMap[project.status] || "bg-gray-100"}
                >
                  {statusLabels[project.status] ||
                    (project.status as string).replace("_", " ")}
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-600">Description</Label>
                  <p className="mt-2 text-gray-900">
                    <RichTextViewer content={project.description || ""} />
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <Label className="text-gray-600">Category</Label>
                    <p className="mt-1">{project.category}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Project Type</Label>
                    <p className="mt-1">
                      {project.project_type ? project.project_type : "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Priority</Label>
                    <p className="mt-1 capitalize">
                      {project.priority || "Normal"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Budget</Label>
                    <p className="mt-1">
                      ${project.budget?.toLocaleString() || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Timeline</Label>
                    <p className="mt-1">
                      {project.duration_weeks
                        ? `${project.duration_weeks} weeks`
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {project.skills_required &&
                  project.skills_required.length > 0 && (
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

                <div className="pt-4 border-t">
                  <Label className="text-gray-600">Client Information</Label>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <User className="size-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Client Name</p>
                        <p className="font-medium">{project.client_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Mail className="size-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">
                          {project.client_email || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <Phone className="size-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">
                          {project.client_phone || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Side - Create Bid Form */}
          <div>
            <Card className="p-6">
              <h2 className="text-xl mb-6">Bid Information</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter project title"
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Project Description *</Label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) =>
                      setFormData({ ...formData, description: value })
                    }
                    placeholder="Enter project description"
                    className="mt-2"
                    minHeight="200px"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Project Category</Label>
                    <p className="mt-2 text-gray-900">
                      {formData.category || project.category}
                    </p>
                  </div>

                  <div>
                    <Label className="text-gray-600">Project Type</Label>
                    <p className="mt-2 text-gray-900">
                      {formData.project_type
                        ? formData.project_type
                        : project.project_type}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Bid Amount (₹) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      placeholder="Enter bid amount"
                      min="0"
                      step="1000"
                      className="mt-2"
                      required
                    />
                    {project.budget && (
                      <p className="text-xs text-gray-500 mt-1">
                        Project budget: ₹{project.budget.toLocaleString()}
                      </p>
                    )}
                    {formData.amount &&
                      project.budget &&
                      parseFloat(formData.amount) > project.budget && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                          <AlertCircle className="size-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-yellow-800">
                            Warning: Bid amount exceeds project budget by $
                            {(
                              parseFloat(formData.amount) - project.budget
                            ).toLocaleString()}
                          </p>
                        </div>
                      )}
                  </div>

                  <div>
                    <Label htmlFor="duration_weeks">Duration (weeks) *</Label>
                    <Input
                      id="duration_weeks"
                      type="number"
                      value={formData.duration_weeks}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration_weeks: e.target.value,
                        })
                      }
                      placeholder="Enter duration"
                      min="1"
                      className="mt-2"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      navigate(
                        user?.role === "agent" ? "/agent/bids" : "/admin/bids"
                      )
                    }
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={submitting}
                  >
                    <CheckCircle className="size-4 mr-2" />
                    {submitting ? "Creating..." : "Create Bid"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
