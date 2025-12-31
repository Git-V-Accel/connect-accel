import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import PageSkeleton from '../../components/shared/PageSkeleton';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import {
  Briefcase,
  Calendar,
  IndianRupee,
  Clock,
  Search,
  ArrowRight,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

export default function ActiveProjects() {
  const { user } = useAuth();
  const { getProjectsByUser, getMilestonesByProject, getPaymentsByUser } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <PageSkeleton />;
  }

  if (!user) return null;

  const myProjects = getProjectsByUser(user.id, user.role);
  // Include both 'assigned' and 'in_progress' statuses for active projects
  const activeProjects = myProjects.filter(p => p.status === 'in_progress' || p.status === 'assigned');
  const completedProjects = myProjects.filter(p => p.status === 'completed');
  const payments = getPaymentsByUser(user.id);

  const filteredActive = activeProjects.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.client_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompleted = completedProjects.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.client_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateProgress = (projectId: string) => {
    const milestones = getMilestonesByProject(projectId);
    if (milestones.length === 0) return 0;
    const completed = milestones.filter(m => m.status === 'approved' || m.status === 'paid').length;
    return (completed / milestones.length) * 100;
  };

  const getProjectEarnings = (projectId: string) => {
    return payments
      .filter(p => p.project_id === projectId && p.to_user_id === user.id && p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const getPendingEarnings = (projectId: string) => {
    const milestones = getMilestonesByProject(projectId);
    return milestones
      .filter(m => m.status === 'submitted' || m.status === 'in_progress')
      .reduce((sum, m) => sum + m.amount, 0);
  };

  const ProjectCard = ({ project }: { project: any }) => {
    const progress = calculateProgress(project.id);
    const earned = getProjectEarnings(project.id);
    const pending = getPendingEarnings(project.id);
    const milestones = getMilestonesByProject(project.id);
    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(m => m.status === 'approved' || m.status === 'paid').length;

    return (
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl mb-2">{project.title}</h3>
          </div>
          <Badge variant={project.status === 'in_progress' || project.status === 'assigned' ? 'default' : 'secondary'}>
            {project.status.replace('_', ' ')}
          </Badge>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between mt-1 text-xs text-gray-600">
            <span>{completedMilestones} of {totalMilestones} milestones completed</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-green-50 rounded">
            <IndianRupee className="size-5 mx-auto mb-1 text-green-600" />
            <div className="text-xs text-gray-600">Earned</div>
            <div className="font-medium">₹{earned.toLocaleString()}</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded">
            <Clock className="size-5 mx-auto mb-1 text-orange-600" />
            <div className="text-xs text-gray-600">Pending</div>
            <div className="font-medium">₹{pending.toLocaleString()}</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded">
            <Briefcase className="size-5 mx-auto mb-1 text-blue-600" />
            <div className="text-xs text-gray-600">Total</div>
            <div className="font-medium">₹{(project.freelancer_budget || 0).toLocaleString()}</div>
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="size-4" />
            <span>Started: {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}</span>
          </div>
          {project.end_date && (
            <div className="flex items-center gap-2">
              <Calendar className="size-4" />
              <span>Due: {new Date(project.end_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Action */}
        <Link to={`/freelancer/workspace/${project.id}`}>
          <Button className="w-full">
            View Project Workspace
            <ArrowRight className="size-4 ml-2" />
          </Button>
        </Link>
      </Card>
    );
  };

  const totalActive = activeProjects.length;
  const totalCompleted = completedProjects.length;
  const totalEarned = payments.filter(p => p.to_user_id === user.id && p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2">My Projects</h1>
            <p className="text-gray-600">Manage your active and completed projects</p>
          </div>
          <Link to="/freelancer/projects">
            <Button size="lg">
              <Search className="size-5 mr-2" />
              Browse More Projects
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Projects</p>
                <p className="text-3xl mt-2">{totalActive}</p>
              </div>
              <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                <Briefcase className="size-6" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Projects</p>
                <p className="text-3xl mt-2">{totalCompleted}</p>
              </div>
              <div className="bg-green-100 text-green-600 p-3 rounded-lg">
                <CheckCircle className="size-6" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-3xl mt-2">₹{totalEarned.toLocaleString()}</p>
              </div>
              <div className="bg-purple-100 text-purple-600 p-3 rounded-lg">
                <TrendingUp className="size-6" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <Input
            placeholder="Search projects..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">
              Active Projects ({activeProjects.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed Projects ({completedProjects.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6 mt-6">
            {filteredActive.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredActive.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Briefcase className="size-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl mb-2">No Active Projects</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery ? 'No projects match your search' : 'Start browsing and bidding on projects to get started'}
                </p>
                <Link to="/freelancer/projects">
                  <Button>
                    <Search className="size-4 mr-2" />
                    Browse Projects
                  </Button>
                </Link>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6 mt-6">
            {filteredCompleted.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredCompleted.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <CheckCircle className="size-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl mb-2">No Completed Projects</h3>
                <p className="text-gray-600">
                  {searchQuery ? 'No projects match your search' : 'Completed projects will appear here'}
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
