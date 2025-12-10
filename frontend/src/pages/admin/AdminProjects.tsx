import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { useData } from '../../contexts/DataContext';
import { statusColors, statusLabels } from '../../constants/projectConstants';
import {
  Search,
  Filter,
  Clock,
  DollarSign,
  Eye,
  ArrowUpDown,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Calendar,
  User,
  TrendingUp,
} from 'lucide-react';

export default function AdminProjects() {
  const { projects } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');


  const filterProjects = (statusValue: string) => {
    let filtered = projects;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusValue !== 'all') {
      filtered = filtered.filter((p) => p.status === statusValue);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'budget_desc':
          return b.client_budget - a.client_budget;
        case 'budget_asc':
          return a.client_budget - b.client_budget;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const pendingProjects = filterProjects('pending_review');
  const biddingProjects = filterProjects('in_bidding');
  const activeProjects = filterProjects('in_progress');
  const completedProjects = filterProjects('completed');
  const allProjects = filterProjects(statusFilter);

  const ProjectCard = ({ project }: { project: any }) => (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl mb-2">{project.title}</h3>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <User className="size-4" />
                {project.client_name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="size-4" />
                {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <Badge className={statusColors[project.status]}>
            {statusLabels[project.status] || project.status.replace('_', ' ')}
          </Badge>
        </div>

        <p className="text-gray-700 line-clamp-2">{project.description}</p>

        <div className="flex items-center gap-2">
          <Badge variant="outline">{project.category}</Badge>
          {project.priority && (
            <Badge variant="outline" className="capitalize">
              {project.priority} Priority
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 py-4 border-y">
          <div>
            <div className="text-sm text-gray-600">Client Budget</div>
            <div className="font-medium">₹{project.client_budget.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Margin</div>
            <div className="font-medium">
              {project.margin ? `₹${project.margin.toLocaleString()}` : 'Not set'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Timeline</div>
            <div className="font-medium">{project.timeline}</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {project.status === 'pending_review' && (
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="size-4" />
              <span className="text-sm font-medium">Awaiting Review</span>
            </div>
          )}
          {project.status === 'in_bidding' && (
            <div className="flex items-center gap-2 text-blue-600">
              <FileText className="size-4" />
              <span className="text-sm font-medium">0 Bids Received</span>
            </div>
          )}
          {project.status === 'in_progress' && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="size-4" />
              <span className="text-sm font-medium">In Progress</span>
            </div>
          )}
          {!['pending_review', 'in_bidding', 'in_progress'].includes(project.status) && (
            <div />
          )}

          <Link to={`/admin/projects/${project.id}/review`}>
            <Button size="sm">
              <Eye className="size-4 mr-2" />
              Review
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl mb-2">Project Management</h1>
          <p className="text-gray-600">
            Review, approve, and manage all projects on the platform
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl mt-1">{pendingProjects.length}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="size-5 text-yellow-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Bidding</p>
                <p className="text-2xl mt-1">{biddingProjects.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="size-5 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl mt-1">{activeProjects.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="size-5 text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl mt-1">
                  ₹{projects.reduce((sum, p) => sum + (p.margin || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="size-5 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Search projects, clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Web Development">Web Development</SelectItem>
                  <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                  <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                  <SelectItem value="DevOps">DevOps</SelectItem>
                  <SelectItem value="Content Writing">Content Writing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_desc">Newest First</SelectItem>
                  <SelectItem value="date_asc">Oldest First</SelectItem>
                  <SelectItem value="budget_desc">Highest Budget</SelectItem>
                  <SelectItem value="budget_asc">Lowest Budget</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Projects Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">
              All Projects ({allProjects.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              <AlertCircle className="size-4 mr-2" />
              Pending ({pendingProjects.length})
            </TabsTrigger>
            <TabsTrigger value="bidding">
              <FileText className="size-4 mr-2" />
              Bidding ({biddingProjects.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              <CheckCircle className="size-4 mr-2" />
              Active ({activeProjects.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedProjects.length})
            </TabsTrigger>
          </TabsList>

          {/* All Projects */}
          <TabsContent value="all" className="space-y-4">
            {allProjects.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl mb-2">No projects found</h3>
                <p className="text-gray-600">
                  Try adjusting your filters or search criteria
                </p>
              </Card>
            ) : (
              allProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </TabsContent>

          {/* Pending Projects */}
          <TabsContent value="pending" className="space-y-4">
            {pendingProjects.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl mb-2">All caught up!</h3>
                <p className="text-gray-600">No projects pending review</p>
              </Card>
            ) : (
              pendingProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </TabsContent>

          {/* Bidding Projects */}
          <TabsContent value="bidding" className="space-y-4">
            {biddingProjects.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl mb-2">No projects in bidding</h3>
                <p className="text-gray-600">
                  Projects will appear here once approved
                </p>
              </Card>
            ) : (
              biddingProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </TabsContent>

          {/* Active Projects */}
          <TabsContent value="active" className="space-y-4">
            {activeProjects.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl mb-2">No active projects</h3>
                <p className="text-gray-600">
                  Projects in progress will appear here
                </p>
              </Card>
            ) : (
              activeProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </TabsContent>

          {/* Completed Projects */}
          <TabsContent value="completed" className="space-y-4">
            {completedProjects.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl mb-2">No completed projects</h3>
                <p className="text-gray-600">
                  Completed projects will appear here
                </p>
              </Card>
            ) : (
              completedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
