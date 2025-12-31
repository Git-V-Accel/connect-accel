import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import PageSkeleton from '../../components/shared/PageSkeleton';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
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
import * as userService from '../../services/userService';
import {
  Search,
  User,
  Phone,
  Calendar,
  Ban,
  CheckCircle,
  Trash2,
  Building,
  IndianRupee,
  Briefcase,
  Filter,
} from 'lucide-react';
import { toast } from '../../utils/toast';

interface Client {
  id: string;
  name: string;
  email: string;
  role: 'client';
  status: 'active' | 'inactive';
  phone?: string;
  company?: string;
  created_at: string;
  last_login?: string;
}

export default function ClientsManagement() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { getProjectsByUser } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isAdmin = currentUser?.role === 'admin';

  const loadClients = async () => {
    setLoading(true);
    try {
      const response = await userService.listUsers();
      setAllClients(response as Client[]);
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to load clients';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin || isSuperAdmin) {
      loadClients();
    }
  }, [isAdmin, isSuperAdmin]);

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-yellow-100 text-yellow-700',
  };

  const filteredClients = allClients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.company && client.company.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClients = filteredClients.slice(startIndex, endIndex);

  const handleStatusToggle = async (client: Client) => {
    const newStatus = client.status === 'active' ? 'inactive' : 'active';
    setLoading(true);
    try {
      await userService.updateUserStatus(client.id, newStatus as any);
      toast.success(`Client status updated to ${newStatus}`);
      await loadClients();
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to update status';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedClient) return;

    setLoading(true);
    try {
      await userService.deleteUser(selectedClient.id);
      toast.success('Client deleted successfully');
      setShowDeleteDialog(false);
      setSelectedClient(null);
      await loadClients();
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to delete client';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate client statistics
  const getClientStats = (clientId: string) => {
    const clientProjects = getProjectsByUser(clientId, 'client');
    const totalProjects = clientProjects.length;
    const activeProjects = clientProjects.filter(p => ['in_progress', 'assigned'].includes(p.status)).length;
    const totalSpent = clientProjects
      .filter(p => ['in_progress', 'completed'].includes(p.status))
      .reduce((sum, p) => sum + (p.budget || p.client_budget || 0), 0);

    return { totalProjects, activeProjects, totalSpent };
  };

  // Define table columns
  const columns: Column<Client>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (client) => (
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="size-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium">{client.name}</div>
            <div className="text-sm text-gray-600">{client.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (client) => (
        <Badge className={statusColors[client.status]}>{client.status}</Badge>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      render: (client) => (
        <div className="flex items-center gap-1 text-gray-600">
          {client.company ? (
            <>
              <Building className="size-3" />
              <span>{client.company}</span>
            </>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (client) => (
        <div className="flex items-center gap-1 text-gray-600">
          {client.phone ? (
            <>
              <Phone className="size-3" />
              <span>{client.phone}</span>
            </>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'projects',
      header: 'Projects',
      render: (client) => {
        const stats = getClientStats(client.id);
        return (
          <div>
            <div className="font-medium">{stats.totalProjects}</div>
            <div className="text-xs text-gray-500">{stats.activeProjects} active</div>
          </div>
        );
      },
    },
    {
      key: 'spent',
      header: 'Total Spent',
      render: (client) => {
        const stats = getClientStats(client.id);
        return (
          <div className="flex items-center gap-1">
            <IndianRupee className="size-3 text-gray-400" />
            <span className="font-medium">₹{(stats.totalSpent / 100000).toFixed(1)}L</span>
          </div>
        );
      },
    },
    {
      key: 'created_at',
      header: 'Joined',
      render: (client) => (
        <div className="flex items-center gap-1 text-gray-600">
          <Calendar className="size-3" />
          <span>{new Date(client.created_at).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (client) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusToggle(client)}
            title={client.status === 'active' ? 'Suspend Client' : 'Activate Client'}
          >
            {client.status === 'active' ? <Ban className="size-4" /> : <CheckCircle className="size-4" />}
          </Button>
          {(isSuperAdmin || isAdmin) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedClient(client);
                setShowDeleteDialog(true);
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete Client"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2">Clients Management</h1>
            <p className="text-gray-600">
              Manage and monitor all platform clients
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clients</p>
                <p className="text-2xl font-medium">{allClients.length}</p>
              </div>
              <User className="size-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-medium">
                  {allClients.filter((c) => c.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="size-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-medium">
                  {allClients.filter((c) => c.status === 'inactive').length}
                </p>
              </div>
              <Ban className="size-8 text-yellow-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-2xl font-medium">
                  {allClients.reduce((sum, c) => sum + getClientStats(c.id).totalProjects, 0)}
                </p>
              </div>
              <Briefcase className="size-8 text-purple-500" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search clients..."
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
                {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </Card>

        {/* Clients List */}
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
          data={paginatedClients}
          columns={columns}
          emptyMessage="No clients found"
          emptyIcon={<User className="size-12 text-gray-400 mx-auto mb-4" />}
          onRowClick={(client) => navigate(`/admin/users/${client.id}/client`)}
        />

        {/* Delete Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Client</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedClient?.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete Client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

