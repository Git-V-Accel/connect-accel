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
  Filter,
  User,
  Phone,
  Calendar,
  Ban,
  CheckCircle,
  Trash2,
  Building,
  Briefcase,
  Star,
} from 'lucide-react';
import { toast } from '../../utils/toast';

interface Freelancer {
  id: string;
  name: string;
  email: string;
  role: 'freelancer';
  status: 'active' | 'inactive';
  phone?: string;
  title?: string;
  rating?: number;
  created_at: string;
  last_login?: string;
}

export default function FreelancerManagement() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { projects, getProjectsByUser } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedFreelancer, setSelectedFreelancer] = useState<Freelancer | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [allFreelancers, setAllFreelancers] = useState<Freelancer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isAdmin = currentUser?.role === 'admin';

  const loadFreelancers = async () => {
    setLoading(true);
    setError(null);
    try {
      const freelancers = await userService.listFreelancers();
      setAllFreelancers(freelancers as Freelancer[]);
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to load freelancers';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin || isSuperAdmin) {
      loadFreelancers();
    }
  }, [isAdmin, isSuperAdmin]);

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-yellow-100 text-yellow-700',
  };

  const filteredFreelancers = allFreelancers.filter((freelancer) => {
    const matchesSearch =
      freelancer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      freelancer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (freelancer.title && freelancer.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || freelancer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredFreelancers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFreelancers = filteredFreelancers.slice(startIndex, endIndex);

  const handleStatusToggle = async (freelancer: Freelancer) => {
    const newStatus = freelancer.status === 'active' ? 'inactive' : 'active';
    setLoading(true);
    try {
      await userService.updateUserStatus(freelancer.id, newStatus as any);
      toast.success(`Freelancer status updated to ${newStatus}`);
      await loadFreelancers();
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to update status';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFreelancer) return;

    setLoading(true);
    try {
      await userService.deleteUser(selectedFreelancer.id);
      toast.success('Freelancer deleted successfully');
      setShowDeleteDialog(false);
      setSelectedFreelancer(null);
      await loadFreelancers();
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to delete freelancer';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate freelancer statistics
  const getFreelancerStats = (freelancerId: string) => {
    const freelancerProjects = getProjectsByUser(freelancerId, 'freelancer');
    const totalProjects = freelancerProjects.length;
    const activeProjects = freelancerProjects.filter(p => ['in_progress', 'assigned'].includes(p.status)).length;
    const completedProjects = freelancerProjects.filter(p => p.status === 'completed').length;

    return { totalProjects, activeProjects, completedProjects };
  };

  // Define table columns
  const columns: Column<Freelancer>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (freelancer) => (
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-green-100 flex items-center justify-center">
            <Briefcase className="size-5 text-green-600" />
          </div>
          <div>
            <div className="font-medium">{freelancer.name}</div>
            <div className="text-sm text-gray-600">{freelancer.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (freelancer) => (
        <Badge className={statusColors[freelancer.status]}>{freelancer.status}</Badge>
      ),
    },
    {
      key: 'title',
      header: 'Title',
      render: (freelancer) => (
        <div className="flex items-center gap-1 text-gray-600">
          {freelancer.title ? (
            <>
              <Briefcase className="size-3" />
              <span>{freelancer.title}</span>
            </>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (freelancer) => (
        <div className="flex items-center gap-1">
          {freelancer.rating ? (
            <>
              <Star className="size-3 text-yellow-500 fill-yellow-500" />
              <span className="font-medium">{freelancer.rating.toFixed(1)}</span>
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
      render: (freelancer) => (
        <div className="flex items-center gap-1 text-gray-600">
          {freelancer.phone ? (
            <>
              <Phone className="size-3" />
              <span>{freelancer.phone}</span>
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
      render: (freelancer) => {
        const stats = getFreelancerStats(freelancer.id);
        return (
          <div>
            <div className="font-medium">{stats.totalProjects}</div>
            <div className="text-xs text-gray-500">{stats.activeProjects} active</div>
          </div>
        );
      },
    },
    {
      key: 'created_at',
      header: 'Joined',
      render: (freelancer) => (
        <div className="flex items-center gap-1 text-gray-600">
          <Calendar className="size-3" />
          <span>{new Date(freelancer.created_at).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (freelancer) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusToggle(freelancer)}
            title={freelancer.status === 'active' ? 'Suspend Freelancer' : 'Activate Freelancer'}
          >
            {freelancer.status === 'active' ? <Ban className="size-4" /> : <CheckCircle className="size-4" />}
          </Button>
          {(isSuperAdmin || isAdmin) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedFreelancer(freelancer);
                setShowDeleteDialog(true);
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete Freelancer"
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
            <h1 className="text-3xl mb-2">Freelancers Management</h1>
            <p className="text-gray-600">
              Manage and monitor all platform freelancers
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Freelancers</p>
                <p className="text-2xl font-medium">{allFreelancers.length}</p>
              </div>
              <Briefcase className="size-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-medium">
                  {allFreelancers.filter((f) => f.status === 'active').length}
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
                  {allFreelancers.filter((f) => f.status === 'inactive').length}
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
                  {allFreelancers.reduce((sum, f) => sum + getFreelancerStats(f.id).totalProjects, 0)}
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
                placeholder="Search freelancers..."
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
                {filteredFreelancers.length} freelancer{filteredFreelancers.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </Card>

        {loading && <div className="text-sm text-gray-600">Loading freelancers...</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}

        {/* Freelancers List */}
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
          data={paginatedFreelancers}
          columns={columns}
          emptyMessage="No freelancers found"
          emptyIcon={<Briefcase className="size-12 text-gray-400 mx-auto mb-4" />}
          onRowClick={(freelancer) => navigate(`/admin/users/${freelancer.id}/freelancer`)}
        />

        {/* Delete Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Freelancer</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedFreelancer?.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete Freelancer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

