import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import PaginationControls from '../../components/common/PaginationControls';
import DataTable, { Column } from '../../components/common/DataTable';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import {
  Search,
  Filter,
  User,
  Phone,
  Calendar,
  Ban,
  CheckCircle,
  Trash2,
  Building,
  Shield,
} from 'lucide-react';
import { toast } from '../../utils/toast';

interface Agent {
  id: string;
  name: string;
  email: string;
  role: 'agent';
  status: 'active' | 'suspended' | 'banned';
  phone?: string;
  company?: string;
  created_at: string;
  last_login?: string;
  bio?: string;
}

export default function AgentManagement() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { getAllUsers, updateUserStatus, deleteUser } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (getAllUsers) {
      const allUsers = getAllUsers();
      const agents = allUsers.filter((u) => u.role === 'agent') as Agent[];
      setAllAgents(agents);
    }
  }, [getAllUsers]);

  const roleColors = {
    agent: 'bg-orange-100 text-orange-700',
  };

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-yellow-100 text-yellow-700',
    banned: 'bg-red-100 text-red-700',
  };

  const filteredAgents = allAgents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (agent.company && agent.company.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAgents = filteredAgents.slice(startIndex, endIndex);

  const handleStatusToggle = (agent: Agent) => {
    const newStatus = agent.status === 'active' ? 'suspended' : 'active';
    updateUserStatus(agent.id, newStatus);
    toast.success(`Agent status updated to ${newStatus}`);
    if (getAllUsers) {
      const allUsers = getAllUsers();
      const agents = allUsers.filter((u) => u.role === 'agent') as Agent[];
      setAllAgents(agents);
    }
  };

  const handleDelete = () => {
    if (!selectedAgent) return;

    deleteUser(selectedAgent.id);
    toast.success('Agent deleted successfully');
    setShowDeleteDialog(false);
    setSelectedAgent(null);
    if (getAllUsers) {
      const allUsers = getAllUsers();
      const agents = allUsers.filter((u) => u.role === 'agent') as Agent[];
      setAllAgents(agents);
    }
  };

  // Define table columns
  const columns: Column<Agent>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (agent) => (
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-orange-100 flex items-center justify-center">
            <Shield className="size-5 text-orange-600" />
          </div>
          <div>
            <div className="font-medium">{agent.name}</div>
            <div className="text-sm text-gray-600">{agent.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (agent) => (
        <Badge className={statusColors[agent.status]}>{agent.status}</Badge>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (agent) => (
        <div className="flex items-center gap-1 text-gray-600">
          {agent.phone ? (
            <>
              <Phone className="size-3" />
              <span>{agent.phone}</span>
            </>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      render: (agent) => (
        <div className="flex items-center gap-1 text-gray-600">
          {agent.company ? (
            <>
              <Building className="size-3" />
              <span>{agent.company}</span>
            </>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Joined',
      render: (agent) => (
        <div className="flex items-center gap-1 text-gray-600">
          <Calendar className="size-3" />
          <span>{new Date(agent.created_at).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (agent) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusToggle(agent)}
            title={agent.status === 'active' ? 'Suspend Agent' : 'Activate Agent'}
          >
            {agent.status === 'active' ? <Ban className="size-4" /> : <CheckCircle className="size-4" />}
          </Button>
          {isSuperAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedAgent(agent);
                setShowDeleteDialog(true);
              }}
              className="text-red-600 hover:text-red-700"
              title="Delete Agent"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2">Agent Management</h1>
            <p className="text-gray-600">
              Manage and monitor all platform agents
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Agents</p>
                <p className="text-2xl font-medium">{allAgents.length}</p>
              </div>
              <Shield className="size-8 text-orange-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-medium">
                  {allAgents.filter((a) => a.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="size-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Suspended</p>
                <p className="text-2xl font-medium">
                  {allAgents.filter((a) => a.status === 'suspended').length}
                </p>
              </div>
              <Ban className="size-8 text-yellow-500" />
            </div>
          </Card>
          
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </Card>

        {/* Agents List */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1" />
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>

        <DataTable
          data={paginatedAgents}
          columns={columns}
          emptyMessage="No agents found"
          emptyIcon={<Shield className="size-12 text-gray-400 mx-auto mb-4" />}
          onRowClick={(agent) => navigate(`/admin/users/${agent.id}/agent`)}
        />

        {/* Delete Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Agent</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedAgent?.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete Agent
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

