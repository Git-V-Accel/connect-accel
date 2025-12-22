import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import DashboardLayout from "../../components/shared/DashboardLayout";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
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
import { RichTextViewer } from "../../components/common/RichTextViewer";
import { RichTextEditor } from "../../components/common/RichTextEditor";
import { Progress } from "../../components/ui/progress";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { useData } from "../../contexts/DataContext";
import {
  ArrowLeft,
  Calendar,
  IndianRupee,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  FileText,
  ExternalLink,
  Download,
  Upload,
  Settings,
  Edit,
} from "lucide-react";
import { toast } from "../../utils/toast";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { statusLabels, statusColors } from "../../constants/projectConstants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const milestoneStatusColors = {
  pending: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-100 text-blue-700",
  submitted: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  paid: "bg-green-100 text-green-800",
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getProject,
    getMilestonesByProject,
    getPaymentsByProject,
    updateMilestone,
    createPayment,
    updateProject,
  } = useData();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (!project || !id) return;

    if (newStatus === project.status) return;

    setIsUpdatingStatus(true);
    try {
      const updatedProject = await updateProject(id, { status: newStatus as any });
      setProject(updatedProject);
      toast.success(`Project status changed to ${statusLabels[newStatus as keyof typeof statusLabels] || newStatus}`);
    } catch (error: any) {
      console.error("Failed to update project status:", error);
      toast.error(error?.response?.data?.message || "Failed to update project status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  useEffect(() => {
    const loadProject = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const projectData = await getProject(id);
        setProject(projectData);
      } catch (error) {
        console.error("Failed to load project:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Removed getProject from dependencies to prevent unnecessary re-renders

  if (!id) return null;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Loading project...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Button onClick={() => navigate("/client/projects")}>
            <ArrowLeft className="size-4 mr-2" />
          </Button>
          <h2 className="text-2xl font-medium mb-2">Project not found</h2>
          <p className="text-gray-600 mb-6">
            The project you're looking for doesn't exist.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const milestones = getMilestonesByProject(id);
  const payments = getPaymentsByProject(id);

  const completedMilestones = milestones.filter(
    (m) => m.status === "approved" || m.status === "paid"
  ).length;
  const progress =
    milestones.length > 0
      ? Math.round((completedMilestones / milestones.length) * 100)
      : 0;

  const totalPaid = payments
    .filter((p) => p.type === "milestone" && p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const handleApproveMilestone = async () => {
    if (!selectedMilestone) return;

    const milestone = milestones.find((m) => m.id === selectedMilestone);
    if (!milestone) return;

    try {
      await updateMilestone(selectedMilestone, {
        status: "approved",
        approval_date: new Date().toISOString(),
      });

      // Create payment record
      createPayment({
        project_id: id,
        milestone_id: selectedMilestone,
        from_user_id: project.client_id,
        to_user_id: project.freelancer_id || "",
        amount: milestone.amount,
        type: "milestone",
        status: "completed",
        completed_at: new Date().toISOString(),
      });

      // Reload project to get updated milestone data
      if (id) {
        const updatedProject = await getProject(id, true);
        setProject(updatedProject);
      }

      toast.success("Milestone approved and payment released!");
      setShowApproveDialog(false);
      setSelectedMilestone(null);
    } catch (error) {
      console.error("Failed to approve milestone:", error);
    }
  };

  const handleRejectMilestone = async () => {
    if (!selectedMilestone || !rejectionReason) return;

    try {
      await updateMilestone(selectedMilestone, {
        status: "rejected",
      });

      // Reload project to get updated milestone data
      if (id) {
        const updatedProject = await getProject(id, true);
        setProject(updatedProject);
      }

      toast.success("Milestone rejected. Freelancer has been notified.");
      setShowRejectDialog(false);
      setSelectedMilestone(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Failed to reject milestone:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/client/projects")}
              className="mb-4"
            >
              <ArrowLeft className="size-4 mr-2" />
            </Button>
            <div>
              <h1 className="text-3xl mb-2">{project.title}</h1>
              <RichTextViewer content={project.description || ""} />
            </div>
          </div>
          <Badge className={(statusColors as any)[project.status]}>
            {(statusLabels as any)[project.status]}
          </Badge>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <IndianRupee className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-xl font-medium">
                  ₹{project.client_budget.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-50 p-3 rounded-lg">
                <CheckCircle2 className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Paid</p>
                <p className="text-xl font-medium">
                  ₹{totalPaid.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-50 p-3 rounded-lg">
                <Calendar className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-xl font-medium">
                  {project.duration_weeks} weeks
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-50 p-3 rounded-lg">
                <Clock className="size-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-xl font-medium">{progress}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Progress Bar */}
        {project.status === "in_progress" && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Overall Progress</h3>
              <span className="text-sm text-gray-600">
                {completedMilestones} of {milestones.length} milestones
                completed
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="milestones">
              Milestones ({milestones.length})
            </TabsTrigger>
            <TabsTrigger value="payments">
              Payments ({payments.length})
            </TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-medium mb-4">Project Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Category</p>
                      <p className="font-medium">{project.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Complexity</p>
                      <Badge variant="outline" className="capitalize">
                        {project.complexity}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        Required Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.skills_required.map((skill: string) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {project.start_date && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Start Date
                          </p>
                          <p className="font-medium">
                            {new Date(project.start_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">End Date</p>
                          <p className="font-medium">
                            {project.end_date
                              ? new Date(project.end_date).toLocaleDateString()
                              : "TBD"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {milestones
                      .filter((m) => m.submission_date || m.approval_date)
                      .slice(0, 3)
                      .map((m) => (
                        <div
                          key={m.id}
                          className="flex gap-3 pb-4 border-b last:border-0"
                        >
                          <div
                            className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.status === "approved"
                              ? "bg-green-100 text-green-600"
                              : m.status === "submitted"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-gray-100 text-gray-600"
                              }`}
                          >
                            {m.status === "approved" ? (
                              <CheckCircle2 className="size-4" />
                            ) : (
                              <Clock className="size-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{m.title}</p>
                            <p className="text-sm text-gray-600">
                              {m.status === "approved" &&
                                `Approved on ${m.approval_date
                                  ? new Date(
                                    m.approval_date
                                  ).toLocaleDateString()
                                  : "N/A"
                                }`}
                              {m.status === "submitted" &&
                                `Submitted on ${m.submission_date
                                  ? new Date(
                                    m.submission_date
                                  ).toLocaleDateString()
                                  : "N/A"
                                }`}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {project.freelancer_id && (
                  <Card className="p-6">
                    <h3 className="text-lg font-medium mb-4">
                      Assigned Freelancer
                    </h3>
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar>
                        <AvatarFallback>
                          {project.freelancer_name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{project.freelancer_name}</p>
                        <p className="text-sm text-gray-600">
                          Full Stack Developer
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button className="w-full" size="sm" asChild>
                        <Link to="/messages">
                          <MessageSquare className="size-4 mr-2" />
                          Send Message
                        </Link>
                      </Button>
                    </div>
                  </Card>
                )}

                {project.admin_id && (
                  <Card className="p-6">
                    <h3 className="text-lg font-medium mb-4">Admin Contact</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar>
                        <AvatarFallback>
                          {project.admin_name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{project.admin_name}</p>
                        <p className="text-sm text-gray-600">Project Manager</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      size="sm"
                      asChild
                    >
                      <Link to="/messages">
                        <MessageSquare className="size-4 mr-2" />
                        Contact Admin
                      </Link>
                    </Button>
                  </Card>
                )}

                <Card className="p-6">
                  <h3 className="text-lg font-medium mb-4">Actions</h3>
                  <div className="space-y-4">
                    {/* Status Change */}
                    <div className="space-y-2">
                      <Label htmlFor="project-status">Change Project Status</Label>
                      <Select
                        value={project.status}
                        onValueChange={handleStatusChange}
                        disabled={isUpdatingStatus}
                      >
                        <SelectTrigger id="project-status" className="w-full">
                          <SelectValue placeholder="Select status">
                            <Badge className={statusColors[project.status as keyof typeof statusColors] || "bg-gray-100 text-gray-700"}>
                              {statusLabels[project.status as keyof typeof statusLabels] || project.status}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {/* Hide draft and active options once project is in_progress or beyond */}
                          {!['in_progress', 'completed', 'cancelled', 'in_bidding', 'assigned'].includes(project.status) && (
                            <>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                            </>
                          )}
                          <SelectItem value="hold">Hold</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      {project.status === "draft" && (
                        <Button
                          variant="outline"
                          className="w-full"
                          size="sm"
                          asChild
                        >
                          <Link to={`/client/projects/${id}/edit`}>
                            <Edit className="size-4 mr-2" />
                            Edit Project
                          </Link>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="w-full"
                        size="sm"
                        asChild
                      >
                        <Link to="/support">
                          <AlertCircle className="size-4 mr-2" />
                          Get Support
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones" className="space-y-4">
            {milestones.length === 0 ? (
              <Card className="p-12 text-center">
                <h3 className="text-lg font-medium mb-2">No milestones yet</h3>
                <p className="text-gray-600">
                  Milestones will be created by the admin team during project
                  setup
                </p>
              </Card>
            ) : (
              milestones.map((milestone, index) => (
                <Card key={milestone.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4 flex-1">
                      <div
                        className={`size-10 rounded-full flex items-center justify-center flex-shrink-0 ${milestone.status === "paid" ||
                          milestone.status === "approved"
                          ? "bg-green-100 text-green-600"
                          : milestone.status === "submitted"
                            ? "bg-yellow-100 text-yellow-600"
                            : milestone.status === "in_progress"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-medium text-lg">
                              {milestone.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {milestone.description}
                            </p>
                          </div>
                          <Badge
                            className={milestoneStatusColors[milestone.status]}
                          >
                            {milestone.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div>
                            <p className="text-sm text-gray-600">Amount</p>
                            <p className="font-medium">
                              ₹{milestone.amount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Due Date</p>
                            <p className="font-medium">
                              {new Date(
                                milestone.due_date
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <p className="font-medium capitalize">
                              {milestone.status.replace("_", " ")}
                            </p>
                          </div>
                        </div>

                        {milestone.submission_notes && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium mb-1">
                              Submission Notes:
                            </p>
                            <p className="text-sm text-gray-700">
                              {milestone.submission_notes}
                            </p>
                            {milestone.submission_date && (
                              <p className="text-xs text-gray-500 mt-2">
                                Submitted on{" "}
                                {new Date(
                                  milestone.submission_date
                                ).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}

                        {milestone.status === "submitted" && (
                          <div className="flex gap-2 mt-4">
                            <Button
                              onClick={() => {
                                setSelectedMilestone(milestone.id);
                                setShowApproveDialog(true);
                              }}
                            >
                              <CheckCircle2 className="size-4 mr-2" />
                              Approve & Release Payment
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedMilestone(milestone.id);
                                setShowRejectDialog(true);
                              }}
                            >
                              <XCircle className="size-4 mr-2" />
                              Request Changes
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            {payments.length === 0 ? (
              <Card className="p-12 text-center">
                <h3 className="text-lg font-medium mb-2">No payments yet</h3>
                <p className="text-gray-600">
                  Payment history will appear here
                </p>
              </Card>
            ) : (
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Payment History</h3>
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`size-10 rounded-full flex items-center justify-center ${payment.status === "completed"
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-600"
                            }`}
                        >
                          <IndianRupee className="size-5" />
                        </div>
                        <div>
                          <p className="font-medium">
                            ₹{payment.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {payment.type.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            payment.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {payment.status.toUpperCase()}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {payment.completed_at
                            ? new Date(
                              payment.completed_at
                            ).toLocaleDateString()
                            : new Date(payment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between text-lg font-medium">
                    <span>Total Paid:</span>
                    <span>₹{totalPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>Remaining:</span>
                    <span>
                      ₹{(project.client_budget - totalPaid).toLocaleString()}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Project Team</h3>
              <div className="space-y-4">
                {project.freelancer_id && (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-12">
                        <AvatarFallback>
                          {project.freelancer_name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{project.freelancer_name}</p>
                        <p className="text-sm text-gray-600">
                          Freelancer - Full Stack Developer
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/messages">
                        <MessageSquare className="size-4 mr-2" />
                        Message
                      </Link>
                    </Button>
                  </div>
                )}
                {project.admin_id && (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-12">
                        <AvatarFallback>
                          {project.admin_name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{project.admin_name}</p>
                        <p className="text-sm text-gray-600">
                          Admin - Project Manager
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/messages">
                        <MessageSquare className="size-4 mr-2" />
                        Message
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Approve Milestone Dialog */}
        <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Milestone</DialogTitle>
              <DialogDescription>
                Are you sure you want to approve this milestone? The payment
                will be released to the freelancer immediately.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowApproveDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleApproveMilestone}>
                <CheckCircle2 className="size-4 mr-2" />
                Approve & Release Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Milestone Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Changes</DialogTitle>
              <DialogDescription>
                Please explain what changes are needed. The freelancer will be
                notified.
              </DialogDescription>
            </DialogHeader>
            <RichTextEditor
              value={rejectionReason}
              onChange={setRejectionReason}
              placeholder="Describe the issues and what needs to be fixed..."
              className="mt-1"
              minHeight="150px"
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRejectMilestone}
                disabled={!rejectionReason}
              >
                Submit Feedback
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
