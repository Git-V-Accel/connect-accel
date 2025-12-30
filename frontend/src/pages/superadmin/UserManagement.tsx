import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import PageSkeleton from '../../components/shared/PageSkeleton';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
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
import * as userService from '../../services/userService';
import {
  Search,
  User,
  Phone,
  CheckCircle2,
  Calendar,
  Building,
  Briefcase,
  Ban,
  Trash2,
  Plus,
  Shield,
  Filter,
} from 'lucide-react';
import { toast } from '../../utils/toast';

interface UnifiedUser {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'freelancer' | 'admin' | 'superadmin' | 'agent';
  status: 'active' | 'suspended' | 'banned';
  phone?: string;
  company?: string;
  created_at: string;
  last_login?: string;
  title?: string;
  rating?: number;
}

export default function UserManagement() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UnifiedUser | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [allUsers, setAllUsers] = useState<UnifiedUser[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('all');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isSuperAdmin = currentUser?.role === 'superadmin';
  console.log(currentUser, isSuperAdmin, "Selvaaaa");
  const isAdmin = currentUser?.role === 'admin';


  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const users = await userService.listUsers();
      setAllUsers(users as any);
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to load users';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin || isSuperAdmin) {
      loadUsers();
    }
  }, [isAdmin, isSuperAdmin]);

  const roleColors = {
    client: 'bg-blue-100 text-blue-700',
    freelancer: 'bg-green-100 text-green-700',
    admin: 'bg-purple-100 text-purple-700',
    superadmin: 'bg-red-100 text-red-700',
    agent: 'bg-orange-100 text-orange-700',
  };

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-yellow-100 text-yellow-700',
    banned: 'bg-red-100 text-red-700',
  };

  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.company && u.company.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const usersByRole = {
    all: filteredUsers,
    client: filteredUsers.filter((u) => u.role === 'client'),
    freelancer: filteredUsers.filter((u) => u.role === 'freelancer'),
    agent: filteredUsers.filter((u) => u.role === 'agent'),
    // Only show admin tab for superadmins
    ...(isSuperAdmin ? {
      admin: filteredUsers.filter((u) => u.role === 'admin' || u.role === 'superadmin'),
    } : {}),
  };

  // Get current tab's users
  const getCurrentTabUsers = () => {
    if (activeTab === 'admin' && !isSuperAdmin) {
      return usersByRole.all; // Fallback to all if admin tries to access admin tab
    }
    return (usersByRole as any)[activeTab] || usersByRole.all;
  };
  const currentTabUsers = getCurrentTabUsers();

  // Calculate pagination
  const totalPages = Math.ceil(currentTabUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = currentTabUsers.slice(startIndex, endIndex);

  // Reset to page 1 when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handleStatusToggle = async (user: UnifiedUser) => {
    // Backend supports only 'active' and 'inactive'
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    setLoading(true);
    try {
      await userService.updateUserStatus(user.id, newStatus as any);
      toast.success(`User status updated to ${newStatus}`);
      await loadUsers();
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to update status';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      await userService.deleteUser(selectedUser.id);
      toast.success('User deleted successfully');
      setShowDeleteDialog(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to delete user';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Define table columns
  const columns: Column<UnifiedUser>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="size-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-gray-600">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => (
        <Badge className={roleColors[user.role]}>{user.role}</Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => (
        <Badge className={statusColors[user.status]}>{user.status}</Badge>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (user) => (
        <div className="flex items-center gap-1 text-gray-600">
          {user.phone ? (
            <>
              <Phone className="size-3" />
              <span>{user.phone}</span>
            </>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Company/Title',
      render: (user) => (
        <div className="flex items-center gap-1 text-gray-600">
          {user.company ? (
            <>
              <Building className="size-3" />
              <span>{user.company}</span>
            </>
          ) : user.title ? (
            <>
              <Briefcase className="size-3" />
              <span>{user.title}</span>
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
      render: (user) => (
        <div className="flex items-center gap-1 text-gray-600">
          <Calendar className="size-3" />
          <span>{new Date(user.created_at).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user) => {
        // Hide actions for superadmin users (including own account)
        const isSuperAdminUser = user.role === 'superadmin';
        const isOwnAccount = user.id === currentUser?.id;
        const shouldHideActions = isSuperAdminUser || (isSuperAdmin && isOwnAccount);

        if (shouldHideActions) {
          return <span className="text-gray-400 text-sm">-</span>;
        }

        return (
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusToggle(user)}
              title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
            >
              {user.status === 'active' ? <Ban className="size-4" /> : <CheckCircle2 className="size-4" />}
            </Button>
            {isSuperAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedUser(user);
                  setShowDeleteDialog(true);
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        );
      },
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
            <h1 className="text-3xl mb-2">User Management</h1>
            <p className="text-gray-600">
              {isSuperAdmin ? 'Manage all platform users' : 'View and manage user accounts'}
            </p>
          </div>
          <Button onClick={() => navigate('/admin/users/create')}>
            <Plus className="size-4 mr-2" />
            Create User
          </Button>
        </div>

        {/* Stats */}
        <div className={`grid grid-cols-1  ${isSuperAdmin ? 'lg:grid-cols-4' : 'md:grid-cols-4'} gap-4`}>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-medium">{allUsers.length}</p>
              </div>
              <User className="size-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clients</p>
                <p className="text-2xl font-medium">{usersByRole.client.length}</p>
              </div>
              <Building className="size-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Freelancers</p>
                <p className="text-2xl font-medium">{usersByRole.freelancer.length}</p>
              </div>
              <Briefcase className="size-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Agents</p>
                <p className="text-2xl font-medium">{usersByRole.agent.length}</p>
              </div>
              <Shield className="size-8 text-orange-500" />
            </div>
          </Card>
          {isSuperAdmin && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Admins</p>
                  <p className="text-2xl font-medium">{(usersByRole as any).admin?.length || 0}</p>
                </div>
                <Shield className="size-8 text-purple-500" />
              </div>
            </Card>
          )}

        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search users..."
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
                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {loading && <div className="text-sm text-gray-600">Loading users...</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}
        </Card>

        {/* Users List */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="all">All ({usersByRole.all.length})</TabsTrigger>
              <TabsTrigger value="client">Clients ({usersByRole.client.length})</TabsTrigger>
              <TabsTrigger value="freelancer">Freelancers ({usersByRole.freelancer.length})</TabsTrigger>
              <TabsTrigger value="agent">Agents ({usersByRole.agent.length})</TabsTrigger>
              {isSuperAdmin && (
                <TabsTrigger value="admin">Admins ({(usersByRole as any).admin?.length || 0})</TabsTrigger>
              )}
            </TabsList>

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>

          <TabsContent value="all" className="space-y-4">
            <DataTable
              data={paginatedUsers}
              columns={columns}
              emptyMessage="No users found"
              emptyIcon={<User className="size-12 text-gray-400 mx-auto mb-4" />}
              onRowClick={(user) => {
                if (user.role === 'client') {
                  navigate(`/admin/users/${user.id}/client`);
                } else if (user.role === 'freelancer') {
                  navigate(`/admin/users/${user.id}/freelancer`);
                } else if (user.role === 'agent') {
                  navigate(`/admin/users/${user.id}/agent`);
                } else if (user.role === 'admin' || user.role === 'superadmin') {
                  navigate(`/admin/users/${user.id}/admin`);
                }
              }}
            />
          </TabsContent>

          {(['client', 'freelancer', 'agent'] as const).map((role) => (
            <TabsContent key={role} value={role} className="space-y-4">
              <DataTable
                data={paginatedUsers}
                columns={columns}
                emptyMessage={`No ${role}s found`}
                emptyIcon={<User className="size-12 text-gray-400 mx-auto mb-4" />}
                onRowClick={(user) => {
                  if (user.role === 'client') {
                    navigate(`/admin/users/${user.id}/client`);
                  } else if (user.role === 'freelancer') {
                    navigate(`/admin/users/${user.id}/freelancer`);
                  } else if (user.role === 'agent') {
                    navigate(`/admin/users/${user.id}/agent`);
                  } else if (user.role === 'admin' || user.role === 'superadmin') {
                    navigate(`/admin/users/${user.id}/admin`);
                  }
                }}
              />
            </TabsContent>
          ))}
          {isSuperAdmin && (
            <TabsContent value="admin" className="space-y-4">
              <DataTable
                data={paginatedUsers}
                columns={columns}
                emptyMessage="No admins found"
                emptyIcon={<User className="size-12 text-gray-400 mx-auto mb-4" />}
                onRowClick={(user) => {
                  if (user.role === 'admin' || user.role === 'superadmin') {
                    navigate(`/admin/users/${user.id}/admin`);
                  }
                }}
              />
            </TabsContent>
          )}
        </Tabs>

        {/* Delete Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}
