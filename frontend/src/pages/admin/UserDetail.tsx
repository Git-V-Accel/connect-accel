import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, User, Mail, Phone, Building, Calendar, IndianRupee, Briefcase, TrendingUp, CheckCircle, Clock, XCircle, Globe, MapPin, BriefcaseIcon, Award, Shield, CheckCircle2, XCircle as XCircleIcon } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import * as userService from '../../services/userService';
import { RichTextViewer } from '../../components/common/RichTextViewer';
import { toast } from '../../utils/toast';

interface UnifiedUser {
  id: string;
  _id?: string;
  userID?: string;
  name: string;
  email: string;
  role: 'client' | 'freelancer' | 'admin' | 'superadmin' | 'agent';
  status: 'active' | 'inactive';
  phone?: string;
  company?: string;
  title?: string;
  website?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  skills?: string[];
  hourlyRate?: number;
  experience?: string;
  adminRole?: string;
  isEmailVerified?: boolean;
  isFirstLogin?: boolean;
  created_at?: string;
  createdAt?: string;
  updatedAt?: string;
  last_login?: string;
  rating?: number;
}

export default function UserDetail() {
  const { id, type } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const { projects, bids, getProjectsByUser, getBidsByFreelancer, getMilestonesByProject, payments } = useData();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      try {
        const userData = await userService.getUserById(id);
        setUser(userData as UnifiedUser);
      } catch (err: any) {
        const message = err?.response?.data?.message || err.message || 'Failed to load user';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Loading user...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">{error || 'User not found'}</p>
          <Button onClick={() => navigate('/admin/users')} className="mt-4">
            <ArrowLeft className="size-4 mr-2" />
            Back to Users
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Get user-specific data based on type
  const userProjects = type === 'client' 
    ? getProjectsByUser(id!, 'client')
    : type === 'freelancer'
    ? getProjectsByUser(id!, 'freelancer')
    : type === 'agent'
    ? projects.filter(p => p.assigned_agent_id === id || p.admin_id === id)
    : [];

  const userBids = type === 'freelancer' ? getBidsByFreelancer(id!) : [];

  // Calculate statistics
  const totalProjects = userProjects.length;
  const activeProjects = userProjects.filter(p => ['in_progress', 'assigned'].includes(p.status)).length;
  const completedProjects = userProjects.filter(p => p.status === 'completed').length;
  
  let totalSpent = 0;
  let totalEarned = 0;
  
  if (type === 'client') {
    totalSpent = userProjects
      .filter(p => ['in_progress', 'completed'].includes(p.status))
      .reduce((sum, p) => sum + (p.budget || p.client_budget || 0), 0);
  } else if (type === 'freelancer') {
    totalEarned = userProjects
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => {
        const milestones = getMilestonesByProject(p.id);
        const paidMilestones = milestones.filter(m => m.status === 'paid' || m.status === 'approved');
        return sum + paidMilestones.reduce((mSum, m) => mSum + m.amount, 0);
      }, 0);
  } else if (type === 'agent') {
    totalSpent = userProjects
      .filter(p => ['in_progress', 'completed'].includes(p.status))
      .reduce((sum, p) => sum + (p.budget || p.client_budget || 0), 0);
  }

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/admin/users')}>
              <ArrowLeft className="size-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl mb-2">{user.name}</h1>
              <p className="text-gray-600 capitalize">{user.role} Details</p>
            </div>
          </div>
          <Badge className={statusColors[user.status]}>{user.status}</Badge>
        </div>

        {/* User Info */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            {user.userID && (
              <div className="flex items-center gap-3">
                <Shield className="size-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">User ID</p>
                  <p className="font-medium">{user.userID}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <User className="size-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="size-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="size-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
            )}
            {user.title && (
              <div className="flex items-center gap-3">
                <BriefcaseIcon className="size-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Title</p>
                  <p className="font-medium">{user.title}</p>
                </div>
              </div>
            )}
            {user.company && (
              <div className="flex items-center gap-3">
                <Building className="size-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="font-medium">{user.company}</p>
                </div>
              </div>
            )}
            {user.location && (
              <div className="flex items-center gap-3">
                <MapPin className="size-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{user.location}</p>
                </div>
              </div>
            )}
            {user.website && (
              <div className="flex items-center gap-3">
                <Globe className="size-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Website</p>
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                    {user.website}
                  </a>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="size-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Joined</p>
                <p className="font-medium">
                  {user.created_at 
                    ? new Date(user.created_at).toLocaleDateString()
                    : user.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
            {user.last_login && (
              <div className="flex items-center gap-3">
                <Clock className="size-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Last Login</p>
                  <p className="font-medium">{new Date(user.last_login).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>

          {/* Bio Section */}
          {user.bio && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Bio</h3>
              <RichTextViewer content={user.bio} />
            </div>
          )}

          {/* Freelancer Specific Information */}
          {user.role === 'freelancer' && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-600 mb-4">Freelancer Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.hourlyRate !== undefined && (
                  <div className="flex items-center gap-3">
                    <IndianRupee className="size-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Hourly Rate</p>
                      <p className="font-medium">₹{user.hourlyRate.toLocaleString()}/hr</p>
                    </div>
                  </div>
                )}
                {user.experience && (
                  <div className="flex items-center gap-3">
                    <Award className="size-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Experience Level</p>
                      <p className="font-medium capitalize">{user.experience}</p>
                    </div>
                  </div>
                )}
                {user.skills && user.skills.length > 0 && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Admin Specific Information */}
          {user.role === 'admin' && user.adminRole && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Admin Role</h3>
              <p className="font-medium capitalize">{user.adminRole}</p>
            </div>
          )}
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-2xl font-medium">{totalProjects}</p>
              </div>
              <Briefcase className="size-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Projects</p>
                <p className="text-2xl font-medium">{activeProjects}</p>
              </div>
              <Clock className="size-8 text-yellow-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-medium">{completedProjects}</p>
              </div>
              <CheckCircle className="size-8 text-green-500" />
            </div>
          </Card>
          {type === 'client' && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-medium">₹{(totalSpent / 100000).toFixed(1)}L</p>
                </div>
                <IndianRupee className="size-8 text-green-500" />
              </div>
            </Card>
          )}
          {type === 'freelancer' && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Earned</p>
                  <p className="text-2xl font-medium">₹{(totalEarned / 100000).toFixed(1)}L</p>
                </div>
                <TrendingUp className="size-8 text-green-500" />
              </div>
            </Card>
          )}
          {type === 'agent' && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Projects Managed</p>
                  <p className="text-2xl font-medium">{totalProjects}</p>
                </div>
                <Briefcase className="size-8 text-purple-500" />
              </div>
            </Card>
          )}
        </div>

        {/* Projects List */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {type === 'client' ? 'Projects Created' : type === 'freelancer' ? 'Projects Worked On' : 'Projects Managed'}
          </h2>
          {userProjects.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <Briefcase className="size-12 mx-auto mb-4 text-gray-400" />
              <p>No projects found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userProjects.map((project) => {
                const milestones = getMilestonesByProject(project.id);
                const completedMilestones = milestones.filter(m => m.status === 'paid' || m.status === 'approved').length;
                const progress = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;

                return (
                  <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{project.title}</h3>
                          <Badge className={
                            project.status === 'completed' ? 'bg-green-100 text-green-700' :
                            project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                            project.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {project.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Budget</p>
                            <p className="font-medium">₹{(project.budget || project.client_budget || 0) / 1000}K</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Duration</p>
                            <p className="font-medium">{project.duration_weeks} weeks</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Category</p>
                            <p className="font-medium">{project.category}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Progress</p>
                            <p className="font-medium">{progress}%</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/projects/${project.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Freelancer-specific: Bids */}
        {type === 'freelancer' && userBids.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Bid History</h2>
            <div className="space-y-4">
              {userBids.slice(0, 5).map((bid) => (
                <div key={bid.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Bid Amount: ₹{bid.amount / 1000}K</p>
                      <p className="text-sm text-gray-600">Status: {bid.status}</p>
                      <p className="text-sm text-gray-600">Submitted: {new Date(bid.submitted_at).toLocaleDateString()}</p>
                    </div>
                    <Badge className={
                      bid.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      bid.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }>
                      {bid.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Agent-specific: Clients and Freelancers */}
        {type === 'agent' && (
          <>
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Clients</h2>
              {(() => {
                const clientIds = Array.from(new Set(userProjects.map(p => p.client_id)));
                const clients = clientIds.map(cId => {
                  const clientProjects = userProjects.filter(p => p.client_id === cId);
                  return {
                    id: cId,
                    name: clientProjects[0]?.client_name || 'Unknown',
                    projectCount: clientProjects.length,
                  };
                });

                return clients.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    <User className="size-12 mx-auto mb-4 text-gray-400" />
                    <p>No clients found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {clients.map((client) => (
                      <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-gray-600">{client.projectCount} project(s)</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/users/${client.id}/client`)}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Freelancers</h2>
              {(() => {
                const freelancerIds = Array.from(new Set(
                  userProjects
                    .filter(p => p.freelancer_id)
                    .map(p => p.freelancer_id!)
                ));
                const freelancers = freelancerIds.map(fId => {
                  const freelancerProjects = userProjects.filter(p => p.freelancer_id === fId);
                  return {
                    id: fId,
                    name: freelancerProjects[0]?.freelancer_name || 'Unknown',
                    projectCount: freelancerProjects.length,
                  };
                });

                return freelancers.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    <Briefcase className="size-12 mx-auto mb-4 text-gray-400" />
                    <p>No freelancers found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {freelancers.map((freelancer) => (
                      <div key={freelancer.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{freelancer.name}</p>
                          <p className="text-sm text-gray-600">{freelancer.projectCount} project(s)</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/users/${freelancer.id}/freelancer`)}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

