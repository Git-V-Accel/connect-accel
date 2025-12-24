import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useAuth } from '../../contexts/AuthContext';
import { useData, Project } from '../../contexts/DataContext';
import { Plus, Search, Calendar, IndianRupee, User, ArrowRight, Filter, Trash } from 'lucide-react';
import { statusColors, statusLabels } from '../../constants/projectConstants';
import { RichTextViewer } from '../../components/common';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";

export default function ClientProjects() {
  const { user } = useAuth();
  const { getProjectsByUser, getMilestonesByProject, deleteProject } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  if (!user) return null;

  const allProjects = getProjectsByUser(user.id, user.role);

  const filterProjects = (status?: string[]) => {
    let filtered = status
      ? allProjects.filter(p => status.includes(p.status))
      : allProjects;

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    // Sort
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'budget') {
      filtered.sort((a, b) => b.client_budget - a.client_budget);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  };

  const calculateProgress = (projectId: string) => {
    const milestones = getMilestonesByProject(projectId);
    if (milestones.length === 0) return 0;
    const completed = milestones.filter(m => m.status === 'approved' || m.status === 'paid').length;
    return Math.round((completed / milestones.length) * 100);
  };

  const ProjectCard = ({ project }: { project: Project }) => {
    const progress = calculateProgress(project.id);
    const milestones = getMilestonesByProject(project.id);

    const navigate = useNavigate();

    return (
      <Card
        className="p-6 hover:shadow-lg transition-shadow cursor-pointer relative group"
        onClick={() => navigate(`/client/projects/${project.id}`)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-medium group-hover:text-primary transition-colors">{project.title}</h3>
              <Badge className={(statusColors as any)[project.status] || 'bg-gray-100 text-gray-800'}>
                {(statusLabels as any)[project.status] || project.status}
              </Badge>
            </div>
            <div className="text-sm text-gray-600 line-clamp-2"><RichTextViewer content={project.description || ''} /></div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <IndianRupee className="size-4 text-gray-400" />
            <span className="text-gray-600">₹{project.client_budget.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="size-4 text-gray-400" />
            <span className="text-gray-600">{project.duration_weeks} weeks</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="size-4 text-gray-400" />
            <span className="text-gray-600">{project.freelancer_name || 'Not assigned'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Milestones:</span>
            <span className="text-gray-600">{milestones.length}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {project.skills_required.slice(0, 4).map(skill => (
            <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
          ))}
          {project.skills_required.length > 4 && (
            <Badge variant="secondary" className="text-xs">+{project.skills_required.length - 4} more</Badge>
          )}
        </div>

        {project.status === 'in_progress' && progress > 0 && (
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <span className="text-sm text-gray-500">
            Created {new Date(project.created_at).toLocaleDateString()}
          </span>

          <div className="flex items-center gap-2">
            {project.status === 'draft' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                    }}
                  >
                    <Trash className="size-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your draft project
                      "{project.title}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={(e: React.MouseEvent) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        deleteProject(project.id);
                      }}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button variant="ghost" size="sm">
              View Details <ArrowRight className="size-4 ml-1" />
            </Button>
          </div>


        </div>
      </Card>
    );
  };

  const activeProjects = filterProjects(['in_progress', 'assigned', 'hold']);
  const biddingProjects = filterProjects(['active', 'in_bidding']);
  const completedProjects = filterProjects(['completed', 'cancelled']);
  const allFilteredProjects = filterProjects();

  const categories = [...new Set(allProjects.map(p => p.category))];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl">My Projects</h1>
            <p className="text-gray-600">Manage all your software projects in one place</p>
          </div>
          <Link to="/client/projects/new">
            <Button size="lg">
              <Plus className="size-5 mr-2" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Filters and Search */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="size-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="budget">Highest Budget</SelectItem>
                <SelectItem value="name">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Projects Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">
              All ({allFilteredProjects.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({activeProjects.length})
            </TabsTrigger>
            <TabsTrigger value="bidding">
              In Bidding ({biddingProjects.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedProjects.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {allFilteredProjects.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-medium mb-2">No projects found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery || categoryFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Get started by creating your first project'
                    }
                  </p>
                  {!searchQuery && categoryFilter === 'all' && (
                    <Link to="/client/projects/new">
                      <Button>
                        <Plus className="size-4 mr-2" />
                        Create Project
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            ) : (
              allFilteredProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeProjects.length === 0 ? (
              <Card className="p-12 text-center">
                <h3 className="text-lg font-medium mb-2">No active projects</h3>
                <p className="text-gray-600">Your ongoing projects will appear here</p>
              </Card>
            ) : (
              activeProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </TabsContent>

          <TabsContent value="bidding" className="space-y-4">
            {biddingProjects.length === 0 ? (
              <Card className="p-12 text-center">
                <h3 className="text-lg font-medium mb-2">No projects in bidding</h3>
                <p className="text-gray-600">Projects waiting for freelancer proposals will appear here</p>
              </Card>
            ) : (
              biddingProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedProjects.length === 0 ? (
              <Card className="p-12 text-center">
                <h3 className="text-lg font-medium mb-2">No completed projects</h3>
                <p className="text-gray-600">Your finished projects will appear here</p>
              </Card>
            ) : (
              completedProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
