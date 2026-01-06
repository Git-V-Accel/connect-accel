import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/shared/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  MoreHorizontal,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  User,
  Home,
  Calendar,
  DollarSign,
  Clock,
  Users,
  TrendingUp,
  Filter,
  Search,
  Plus,
  XCircle,
  CheckCircle,
  AlertCircle,
  Award,
  Star,
  MessageSquare,
  Send,
  Calculator,
  Target,
  Briefcase,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import PageSkeleton from "../../components/shared/PageSkeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Tabs,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { toast } from "../../utils/toast";
import apiClient from "../../services/apiService";
import * as userService from "../../services/userService";
import { RichTextViewer } from "@/components/common";

const statusColors: { [key: string]: string } = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  on_hold: "bg-orange-100 text-orange-800 border-orange-200",
};

const statusLabels: { [key: string]: string } = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  on_hold: "On Hold",
};

const priorityColors: { [key: string]: string } = {
  low: "bg-gray-100 text-gray-800 border-gray-200",
  medium: "bg-blue-100 text-blue-800 border-blue-200",
  high: "bg-red-100 text-red-800 border-red-200",
};

export default function AdminInHouse() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [inHouseProjects, setInHouseProjects] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    on_hold: 0,
  });

  // Dialog states
  const [isAssignAgentDialogOpen, setIsAssignAgentDialogOpen] = useState(false);
  const [selectedInHouseProject, setSelectedInHouseProject] = useState<any>(null);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");

  // Check if user is admin or superadmin
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  
  // Redirect if not admin/superadmin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchInHouseProjects(),
        fetchStats(),
        fetchAgents()
      ]);
      setLoading(false);
    };

    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, statusFilter, agentFilter, searchQuery]);

  // Fetch in-house projects
  const fetchInHouseProjects = async () => {
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '100',
      });

      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (agentFilter !== 'all') params.append('agentId', agentFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await apiClient.get(`/in-house?${params}`);
      
      if (response.data.success) {
        setInHouseProjects(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch in-house projects');
      }
    } catch (error) {
      console.error('Error fetching in-house projects:', error);
      toast.error('Failed to fetch in-house projects');
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/in-house/stats');
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch agents
  const fetchAgents = async () => {
    try {
      const users = await userService.listUsers();
      const agentUsers = users.filter((u: any) => u.role === "agent");
      setAgents(agentUsers);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  // Handle agent assignment
  const handleAssignAgent = async () => {
    if (!selectedInHouseProject || !selectedAgentId) {
      toast.error('Please select an agent');
      return;
    }

    try {
      const response = await apiClient.post('/in-house/assign-agent', {
        inHouseId: selectedInHouseProject._id,
        agentId: selectedAgentId,
      });
      
      if (response.data.success) {
        toast.success('Agent assigned successfully!');
        setIsAssignAgentDialogOpen(false);
        setSelectedInHouseProject(null);
        setSelectedAgentId("");
        await fetchInHouseProjects();
        await fetchStats();
      } else {
        toast.error(response.data.message || 'Failed to assign agent');
      }
    } catch (error) {
      console.error('Error assigning agent:', error);
      toast.error('Failed to assign agent');
    }
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedInHouseProject || !selectedStatus) {
      toast.error('Please select a status');
      return;
    }

    try {
      const response = await apiClient.put('/in-house/status', {
        inHouseId: selectedInHouseProject._id,
        status: selectedStatus,
        notes: statusNotes,
      });
      
      if (response.data.success) {
        toast.success('Status updated successfully!');
        setIsStatusDialogOpen(false);
        setSelectedInHouseProject(null);
        setSelectedStatus("");
        setStatusNotes("");
        await fetchInHouseProjects();
        await fetchStats();
      } else {
        toast.error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // Handle remove from in-house
  const handleRemoveFromInHouse = async (inHouseId: string) => {
    if (!confirm('Are you sure you want to remove this project from in-house?')) {
      return;
    }

    try {
      const response = await apiClient.delete(`/in-house/${inHouseId}`);
      
      if (response.data.success) {
        toast.success('Project removed from in-house successfully!');
        await fetchInHouseProjects();
        await fetchStats();
      } else {
        toast.error(response.data.message || 'Failed to remove project');
      }
    } catch (error) {
      console.error('Error removing project:', error);
      toast.error('Failed to remove project');
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/admin/projects")}>
              <ArrowLeft className="size-4 mr-2" />
            </Button>
            <div>
              <h1 className="text-3xl">In House Projects</h1>
              <p className="text-gray-600">Manage projects assigned to in-house V-Accel team</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="size-8 text-blue-600" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={agentFilter} onValueChange={setAgentFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {agents?.map((agent) => (
                  <SelectItem key={agent._id} value={agent._id}>
                    {agent.name}
                  </SelectItem>
                )) || []}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Projects List */}
        <div className="space-y-4">
          {!inHouseProjects || inHouseProjects.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No in-house projects found</p>
            </Card>
          ) : (
            inHouseProjects.map((inHouseProject) => (
              <Card key={inHouseProject._id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl mb-2">{inHouseProject.project.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="size-4" />
                          {inHouseProject.project.client?.name || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="size-4" />
                          {new Date(inHouseProject.project.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                   
                     <div className="ml-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>navigate(`/admin/projects/${inHouseProject.project._id}/review`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {!inHouseProject.assignedAgentId && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedInHouseProject(inHouseProject);
                                setIsAssignAgentDialogOpen(true);
                              }}
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Assign Agent
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedInHouseProject(inHouseProject);
                              setSelectedStatus(inHouseProject.status);
                              setStatusNotes(inHouseProject.notes || '');
                              setIsStatusDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Update Status
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRemoveFromInHouse(inHouseProject._id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove from In-House
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2">
                    <RichTextViewer content={inHouseProject.project.description || ""} />
                  </p>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{inHouseProject.project.category}</Badge>
                    {inHouseProject.priority && (
                      <Badge variant="outline" className="capitalize">
                        {inHouseProject.priority} Priority
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-4 border-y">
                    <div>
                      <div className="text-sm text-gray-600">Client Budget</div>
                      <div className="font-medium">
                        ${inHouseProject.project.client_budget?.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Timeline</div>
                      <div className="font-medium">{inHouseProject.project.timeline}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Assigned Agent</div>
                      <div className="font-medium">
                        {inHouseProject.assignedAgentId?.name || 'Unassigned'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-600">
                      <Home className="size-4" />
                      <span className="text-sm font-medium">In-House Project</span>
                    </div>
                     <Badge className={(statusColors as any)[inHouseProject.status] || 'bg-gray-100 text-gray-700'}>
                      {statusLabels[inHouseProject.status]}
                    </Badge>
                   
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Assign Agent Dialog */}
        <Dialog open={isAssignAgentDialogOpen} onOpenChange={setIsAssignAgentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Agent to Project</DialogTitle>
              <DialogDescription>
                Select an agent to assign to this project.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="agent-select">Select Agent *</Label>
                <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose an agent..." />
                  </SelectTrigger>
                  <SelectContent>
                    {agents?.map((agent) => (
                      <SelectItem key={agent._id} value={agent._id}>
                        {agent.name} ({agent.userID || 'N/A'})
                      </SelectItem>
                    )) || []}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAssignAgentDialogOpen(false);
                  setSelectedInHouseProject(null);
                  setSelectedAgentId("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAssignAgent} disabled={!selectedAgentId}>
                Assign Agent
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Status Dialog */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Project Status</DialogTitle>
              <DialogDescription>
                Update the status of this in-house project.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="status-select">Status *</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status-notes">Notes</Label>
                <Input
                  id="status-notes"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Add notes about this status change..."
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsStatusDialogOpen(false);
                  setSelectedInHouseProject(null);
                  setSelectedStatus("");
                  setStatusNotes("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleStatusUpdate} disabled={!selectedStatus}>
                Update Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
