import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
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
  Mail,
  Phone,
  Calendar,
  Shield,
  Ban,
  CheckCircle,
  XCircle,
  Trash2,
  MoreVertical,
  Building,
  Briefcase,
  Plus,
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
  const { user: currentUser } = useAuth();
  const { clients, freelancers, getAllUsers, createUser, updateUserStatus, deleteUser } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UnifiedUser | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<'active' | 'suspended' | 'banned'>('active');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'freelancer' as 'freelancer' | 'admin' | 'agent' | 'superadmin',
    phone: '',
    company: '',
    title: '',
  });
  const [allUsers, setAllUsers] = useState<UnifiedUser[]>([]);

  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isAdmin = currentUser?.role === 'admin';

  // Get available roles based on current user's permissions
  const getAvailableRoles = () => {
    if (isSuperAdmin) {
      return [
        { value: 'superadmin', label: 'Super Admin' },
        { value: 'admin', label: 'Admin' },
        { value: 'agent', label: 'Agent' },
        { value: 'freelancer', label: 'Freelancer' },
      ];
    } else if (isAdmin) {
      return [
        { value: 'agent', label: 'Agent' },
        { value: 'freelancer', label: 'Freelancer' },
      ];
    }
    return [];
  };

  useEffect(() => {
    if (getAllUsers) {
      setAllUsers(getAllUsers());
    }
  }, [getAllUsers, clients, freelancers]);

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
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const usersByRole = {
    all: filteredUsers,
    client: filteredUsers.filter((u) => u.role === 'client'),
    freelancer: filteredUsers.filter((u) => u.role === 'freelancer'),
    admin: filteredUsers.filter((u) => u.role === 'admin' || u.role === 'superadmin'),
    agent: filteredUsers.filter((u) => u.role === 'agent'),
  };

  const handleStatusChange = () => {
    if (!selectedUser) return;

    updateUserStatus(selectedUser.id, newStatus);
    toast.success(`User status updated to ${newStatus}`);
    setShowStatusDialog(false);
    setSelectedUser(null);
  };

  const handleDelete = () => {
    if (!selectedUser) return;

    deleteUser(selectedUser.id);
    toast.success('User deleted successfully');
    setShowDeleteDialog(false);
    setSelectedUser(null);
    if (getAllUsers) {
      setAllUsers(getAllUsers());
    }
  };

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate permissions
    if (isAdmin && (newUser.role === 'admin' || newUser.role === 'superadmin')) {
      toast.error('You do not have permission to create admin or superadmin users');
      return;
    }

    createUser({
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone || undefined,
      company: newUser.company || undefined,
      title: newUser.title || undefined,
    });

    const roleLabel = getAvailableRoles().find(r => r.value === newUser.role)?.label || newUser.role;
    toast.success(`${roleLabel} created successfully`);
    setShowCreateDialog(false);
    setNewUser({
      name: '',
      email: '',
      role: 'freelancer',
      phone: '',
      company: '',
      title: '',
    });
    
    // Refresh user list
    if (getAllUsers) {
      setTimeout(() => {
        setAllUsers(getAllUsers());
      }, 100);
    }
  };

  const UserCard = ({ user }: { user: UnifiedUser }) => (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="size-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
            <div className="flex items-center gap-2">
              <Badge className={roleColors[user.role]}>{user.role}</Badge>
              <Badge className={statusColors[user.status]}>{user.status}</Badge>
            </div>
            {user.phone && (
              <div className="flex items-center gap-1 text-gray-600">
                <Phone className="size-3" />
                <span>{user.phone}</span>
              </div>
            )}
            {user.company && (
              <div className="flex items-center gap-1 text-gray-600">
                <Building className="size-3" />
                <span>{user.company}</span>
              </div>
            )}
            {user.title && (
              <div className="flex items-center gap-1 text-gray-600">
                <Briefcase className="size-3" />
                <span>{user.title}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-gray-600">
              <Calendar className="size-3" />
              <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
            </div>
            {user.rating && (
              <div className="flex items-center gap-1 text-gray-600">
                <span>⭐ {user.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedUser(user);
              setNewStatus(user.status);
              setShowStatusDialog(true);
            }}
          >
            {user.status === 'active' ? <Ban className="size-4" /> : <CheckCircle className="size-4" />}
          </Button>
          {isSuperAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedUser(user);
                setShowDeleteDialog(true);
              }}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

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
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="size-4 mr-2" />
            Create User
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-medium">
                  {allUsers.filter((u) => u.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="size-8 text-green-500" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="client">Clients</SelectItem>
                <SelectItem value="freelancer">Freelancers</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="agent">Agents</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </Card>

        {/* Users List */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All ({usersByRole.all.length})</TabsTrigger>
            <TabsTrigger value="client">Clients ({usersByRole.client.length})</TabsTrigger>
            <TabsTrigger value="freelancer">Freelancers ({usersByRole.freelancer.length})</TabsTrigger>
            <TabsTrigger value="admin">Admins ({usersByRole.admin.length})</TabsTrigger>
            <TabsTrigger value="agent">Agents ({usersByRole.agent.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredUsers.length === 0 ? (
              <Card className="p-8 text-center">
                <User className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No users found</h3>
                <p className="text-gray-600">Try adjusting your filters</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredUsers.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            )}
          </TabsContent>

          {(['client', 'freelancer', 'admin', 'agent'] as const).map((role) => (
            <TabsContent key={role} value={role} className="space-y-4">
              {usersByRole[role].length === 0 ? (
                <Card className="p-8 text-center">
                  <User className="size-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No {role}s found</h3>
                  <p className="text-gray-600">Try adjusting your filters</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {usersByRole[role].map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Status Change Dialog */}
        <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change User Status</DialogTitle>
              <DialogDescription>
                Update the status for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>New Status</Label>
                <Select value={newStatus} onValueChange={(val: any) => setNewStatus(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleStatusChange}>Update Status</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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

        {/* Create User Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                {isSuperAdmin
                  ? 'Create a new superadmin, admin, agent, or freelancer account'
                  : 'Create a new agent or freelancer account'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(val: 'freelancer' | 'admin' | 'agent' | 'superadmin') =>
                      setNewUser({ ...newUser, role: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableRoles().map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  />
                </div>
              </div>

              {newUser.role === 'freelancer' && (
                <div>
                  <Label htmlFor="title">Title/Position</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Full Stack Developer"
                    value={newUser.title}
                    onChange={(e) => setNewUser({ ...newUser, title: e.target.value })}
                  />
                </div>
              )}

              {(newUser.role === 'admin' || newUser.role === 'agent') && (
                <div>
                  <Label htmlFor="company">Company/Department</Label>
                  <Input
                    id="company"
                    placeholder="Enter company or department"
                    value={newUser.company}
                    onChange={(e) => setNewUser({ ...newUser, company: e.target.value })}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser}>
                Create User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
