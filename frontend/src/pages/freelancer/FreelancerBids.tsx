import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/shared/DashboardLayout';
import PageSkeleton from '../../components/shared/PageSkeleton';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { RichTextEditor } from '../../components/common/RichTextEditor';
import { AlertCircle, Eye, BookmarkCheck } from 'lucide-react';
import apiClient from '../../services/apiService';
import { API_CONFIG } from '../../config/api';
import { toast } from '../../utils/toast';
import * as shortlistService from '../../services/shortlistService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Search,
  Clock,
  IndianRupee,
  Users,
  Calendar,
  Send,
  FileText,
  Star,
  Filter,
  Bookmark,
  ArrowUpDown,
  ChevronDown,
} from 'lucide-react';

interface Bidding {
  _id: string;
  id: string;
  adminBidId: {
    _id: string;
    projectTitle?: string;
    bidAmount?: number;
    timeline?: string;
    description?: string;
  };
  projectId: {
    skills: never[];
    category: any;
    _id: string;
    title?: string;
    description?: string;
  };
  bidAmount: number;
  timeline: string;
  description: string;
  status: 'pending' | 'accepted' | 'rejected' | 'shortlisted' | 'withdrawn';
  submittedAt: string;
  createdAt: string;
}

export default function FreelancerBids() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, bids, getBidsByFreelancer } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isBidDialogOpen, setIsBidDialogOpen] = useState(false);
  const [myBiddings, setMyBiddings] = useState<Bidding[]>([]);
  const [shortlistedProjects, setShortlistedProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [selectedBiddingId, setSelectedBiddingId] = useState<string>('');
  const [withdrawReason, setWithdrawReason] = useState('');

  // Bid form state
  const [bidAmount, setBidAmount] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [proposal, setProposal] = useState('');


  // Get available projects (in bidding status)
  const availableProjects = projects.filter(p => p.status === 'in_bidding' || p.status === 'open');

  // Extract categories from projects
  const categories = [...new Set(projects.map(p => p.category).filter(Boolean))];

  // Fetch my biddings from API
  useEffect(() => {
    const loadBiddings = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // Fetch my biddings
        const response = await apiClient.get(API_CONFIG.BIDDING.GET_BY_FREELANCER(user.id));
        if (response.data.success && response.data.data) {
          setMyBiddings(Array.isArray(response.data.data) ? response.data.data : []);
        }

        // Fetch shortlisted projects
        try {
          const shortlistResponse = await apiClient.get(API_CONFIG.SHORTLISTED_PROJECTS.LIST);
          if (shortlistResponse.data && shortlistResponse.data.success) {
            setShortlistedProjects(Array.isArray(shortlistResponse.data.data) ? shortlistResponse.data.data : []);
          }
        } catch (error) {
          console.error('Failed to load shortlisted projects:', error);
        }
      } catch (error: any) {
        console.error('Failed to load biddings:', error);
        // If it's a 401, interceptor should handle token refresh and retry
        // If refresh fails, it will redirect to login
        setMyBiddings([]);
        setShortlistedProjects([]);
      } finally {
        setLoading(false);
      }
    };
    loadBiddings();
  }, [user?.id]);

  const filteredProjects = availableProjects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.skills_required.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      categoryFilter === 'all' || project.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Sort biddings based on selected criteria
  const sortedBiddings = [...myBiddings].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'submittedAt':
        comparison = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
        break;
      case 'bidAmount':
        comparison = (a.bidAmount || 0) - (b.bidAmount || 0);
        break;
      case 'projectTitle':
        comparison = (a.projectId?.title || '').localeCompare(b.projectId?.title || '');
        break;
      case 'status':
        comparison = (a.status || '').localeCompare(b.status || '');
        break;
      default:
        comparison = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSubmitBid = () => {
    if (!bidAmount || !deliveryTime || !proposal) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (proposal.length < 100) {
      toast.error('Proposal must be at least 100 characters');
      return;
    }

    toast.success('Bid submitted successfully!');
    setIsBidDialogOpen(false);
    setBidAmount('');
    setDeliveryTime('');
    setProposal('');
  };

  const handleWithdrawBid = (biddingId: string) => {
    setSelectedBiddingId(biddingId);
    setWithdrawDialogOpen(true);
  };

  const confirmWithdrawBid = async () => {
    if (!selectedBiddingId || !withdrawReason.trim()) {
      toast.error('Please provide a reason for withdrawal');
      return;
    }

    try {
      console.log('Making DELETE request to:', `/bidding/${selectedBiddingId}`);
      const response = await apiClient.delete(`/bidding/${selectedBiddingId}`, {
        data: { reason: withdrawReason }
      });
      console.log('Withdraw response:', response.data);
      
      if (response.data.success) {
        toast.success('Bid withdrawn successfully');
        setWithdrawDialogOpen(false);
        setWithdrawReason('');
        setSelectedBiddingId('');
        // Refresh page to reload biddings
        window.location.reload();
      } else {
        toast.error(response.data.message || 'Failed to withdraw bid');
      }
    } catch (error: any) {
      console.error('Error withdrawing bid:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to withdraw bid');
    }
  };

  const undoWithdrawBid = () => {
    setWithdrawDialogOpen(false);
    setWithdrawReason('');
    setSelectedBiddingId('');
  };

  const handleUndoWithdrawal = async (biddingId: string) => {
    try {
      const response = await apiClient.put(`/bidding/${biddingId}/undo-withdrawal`);
      console.log('Undo withdrawal response:', response.data);
      
      if (response.data.success) {
        toast.success('Bid withdrawal undone successfully');
        // Refresh page to reload biddings
        window.location.reload();
      } else {
        toast.error(response.data.message || 'Failed to undo withdrawal');
      }
    } catch (error: any) {
      console.error('Error undoing withdrawal:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to undo withdrawal');
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl mb-2">My Bids</h1>
          <p className="text-gray-600">
            Browse available projects and manage your submitted bids
          </p>
        </div>

        <Tabs defaultValue="recent-biddings" className="space-y-6">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="recent-biddings">
              <FileText className="size-4 mr-2" />
              Recent Biddings ({myBiddings.length})
            </TabsTrigger>
            <TabsTrigger value="shortlisted-bids">
              <Bookmark className="size-4 mr-2" />
              Shortlisted Bids({shortlistedProjects.length})
            </TabsTrigger>
          </TabsList>

          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Search by title, skills..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="size-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
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
                  <ArrowUpDown className="size-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submittedAt">Date Submitted</SelectItem>
                  <SelectItem value="bidAmount">Bid Amount</SelectItem>
                  <SelectItem value="projectTitle">Project Title</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Recent Biddings Tab */}
          <TabsContent value="recent-biddings" className="space-y-4">
            {loading ? (
              <Card className="p-12 text-center">
                <p className="text-gray-600">Loading your bids...</p>
              </Card>
            ) : sortedBiddings.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl mb-2">No bids found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search terms
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {sortedBiddings.map((bidding) => {
                  console.log('Bidding object:', bidding);
                  console.log('Bidding _id:', bidding._id);
                  console.log('Bidding id:', bidding.id);
                  console.log('Bidding adminBidId:', bidding.adminBidId?._id);
                  console.log('Using bidding _id for withdraw:', bidding._id);
                  
                  const projectTitle = bidding.adminBidId?.projectTitle || bidding.projectId?.title || 'Project';
                  const submittedDate = bidding.submittedAt ? new Date(bidding.submittedAt).toLocaleDateString() : 'N/A';
                  const projectCategory = bidding.projectId?.category ; // Fallback since category structure is unclear
                  const projectDescription = bidding.adminBidId?.description || bidding.projectId?.description || 'No description available';
                  const skillsRequired = bidding.projectId?.skills || []; // Fallback skills since structure is unclear
                  
                  return (
                    <Card key={bidding._id || bidding.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl mb-2">{projectTitle}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="size-4" />
                                Posted {submittedDate}
                              </span>
                              <Badge variant="secondary">{projectCategory}</Badge>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 line-clamp-2">
                          {projectDescription}
                        </p>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2">
                          {skillsRequired.slice(0, 3).map((skill: string, index: number) => (
                            <Badge key={index} variant="outline">{skill}</Badge>
                          ))}
                          {skillsRequired.length > 3 && (
                            <Badge variant="outline">+{skillsRequired.length - 3} more</Badge>
                          )}
                        </div>

                        {/* Project Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y">
                          <div>
                            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                              <IndianRupee className="size-4" />
                              Budget
                            </div>
                            <div>₹{bidding.bidAmount?.toLocaleString() || '0'}</div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                              <Calendar className="size-4" />
                              Duration
                            </div>
                            <div>{bidding.timeline || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                              <Users className="size-4" />
                              Status
                            </div>
                            <Badge variant={bidding.status === 'pending' ? 'secondary' : 'success'} className="capitalize">{bidding.status}</Badge>
                          </div>
                          <div>
                                                      </div>
                        </div>

                        {/* Client Info & Actions */}
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-gray-600">Submitted by</div>
                            <div>You</div>
                          </div>

                          <div className="flex gap-2">
                            {bidding.status === 'pending' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/freelancer/bids/${bidding.adminBidId?._id}/edit`)}
                              >
                                Edit Bid
                              </Button>
                            )}
                            {bidding.status === 'withdrawn' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleUndoWithdrawal(bidding._id)}
                                className="text-green-600 hover:text-green-700 hover:border-green-300"
                              >
                                Undo Withdrawal
                              </Button>
                            )}
                            {bidding.status === 'pending' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleWithdrawBid(bidding._id)}
                                className="text-red-600 hover:text-red-700 hover:border-red-300"
                              >
                                Withdraw Bid
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/freelancer/bids/${bidding.adminBidId?._id}/view`)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Shortlisted Bids Tab */}
          <TabsContent value="shortlisted-bids" className="space-y-4">
            {loading ? (
              <Card className="p-12 text-center">
                <p className="text-gray-600">Loading shortlisted projects...</p>
              </Card>
            ) : shortlistedProjects.length === 0 ? (
              <Card className="p-12 text-center">
                <Bookmark className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl mb-2">No shortlisted bids</h3>
                <p className="text-gray-600">
                  Projects you shortlist will appear here
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {shortlistedProjects.map((shortlistedProject) => {
                  const project = shortlistedProject.projectId || shortlistedProject.adminBidId?.projectId;
                  const adminBid = shortlistedProject.adminBidId;
                  const projectId = typeof project === 'string' ? project : project?._id || shortlistedProject.projectId;
                  
                  if (!project || !adminBid) return null;
                  
                  return (
                    <Card key={shortlistedProject._id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-medium">{project.title || adminBid.projectTitle}</h3>
                            <Badge variant="outline">Shortlisted</Badge>
                          </div>
                          <div className="text-gray-600 mb-4 line-clamp-2">
                            {project.description || adminBid.description}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center gap-2 text-sm">
                              <IndianRupee className="size-4 text-gray-400" />
                              <span className="text-gray-600">₹{adminBid.bidAmount?.toLocaleString() || '0'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="size-4 text-gray-400" />
                              <span className="text-gray-600">{adminBid.timeline || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-400">Status:</span>
                              <Badge variant={adminBid.status === 'pending' ? 'default' : 'secondary'}>
                                {adminBid.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-400">Shortlisted:</span>
                              <span className="text-gray-600">
                                {new Date(shortlistedProject.shortlistedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Remove from shortlist
                              apiClient.delete(`/shortlisted-projects/${projectId}`)
                                .then(() => {
                                  setShortlistedProjects(prev => prev.filter(sp => sp._id !== shortlistedProject._id));
                                  toast.success('Project removed from shortlist');
                                })
                                .catch((error: any) => {
                                  console.error('Failed to remove from shortlist:', error);
                                  if (error.response?.status === 404) {
                                    toast.error('Project not found in shortlist');
                                  } else {
                                    toast.error('Failed to remove from shortlist');
                                  }
                                });
                            }}
                          >
                            <BookmarkCheck className="size-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <span className="text-sm text-gray-500">
                          Shortlisted on {new Date(shortlistedProject.shortlistedAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            asChild
                          >
                            <Link to={`/freelancer/bids/${adminBid._id}/view`}>
                              <Eye className="size-4 mr-2" />
                              View Bid
                            </Link>
                          </Button>
                          <Button
                            asChild
                          >
                            <Link to={`/freelancer/bids/${adminBid._id}/submit-proposal`}>
                              <Send className="size-4 mr-2" />
                              Submit Proposal
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Available Projects Tab */}
          <TabsContent value="available" className="space-y-6">
            {/* Filters */}
            <Card className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-1">
                  <Label>Search Projects</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      placeholder="Search by title, skills..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
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
              </div>
            </Card>

            {/* Projects List */}
            <div className="space-y-4">
              {filteredProjects.length === 0 ? (
                <Card className="p-12 text-center">
                  <FileText className="size-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl mb-2">No projects found</h3>
                  <p className="text-gray-600">
                    Try adjusting your filters or search criteria
                  </p>
                </Card>
              ) : (
                filteredProjects.map((project) => (
                  <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl mb-2">{project.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock className="size-4" />
                              Posted {new Date(project.created_at).toLocaleDateString()}
                            </span>
                            <Badge variant="secondary">{project.category}</Badge>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-700">{project.description}</p>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-2">
                        {project.skills_required.map((skill) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      {/* Project Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y">
                        <div>
                          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                            <IndianRupee className="size-4" />
                            Budget
                          </div>
                          <div>₹{project.budget?.toLocaleString() || '0'}</div>
                          <div className="text-sm text-gray-600 capitalize">
                            {project.budgetType || 'Fixed Price'}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                            <Calendar className="size-4" />
                            Duration
                          </div>
                          <div>{project.duration || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                            <Users className="size-4" />
                            Bids
                          </div>
                          <div>{project.bidsCount || 0} proposals</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                            <Star className="size-4" />
                            Client
                          </div>
                          <div className="flex items-center gap-1">
                            {project.client?.rating || 0}
                            <span className="text-sm text-gray-600">
                              ({project.client?.projectsPosted || 0} projects)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Client Info & Actions */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-600">Posted by</div>
                          <div>{project.client?.name || 'N/A'}</div>
                        </div>

                        <Button
                          onClick={() => {
                            setSelectedProject(project);
                            setIsBidDialogOpen(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="size-4 mr-2" />
                          Submit Bid
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Bid Submission Dialog */}
            <Dialog open={isBidDialogOpen} onOpenChange={setIsBidDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Submit Your Bid</DialogTitle>
                  <DialogDescription>
                    {selectedProject?.title}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Project Overview */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Budget</div>
                        <div>{selectedProject?.budget}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Duration</div>
                        <div>{selectedProject?.duration}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Bids</div>
                        <div>{selectedProject?.bidsCount} proposals</div>
                      </div>
                    </div>
                  </div>

                  {/* Bid Form */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Your Bid Amount (₹) *</Label>
                      <Input
                        type="number"
                        placeholder="Enter your bid amount"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Client budget: {selectedProject?.budget}
                      </p>
                    </div>

                    <div>
                      <Label>Delivery Time *</Label>
                      <Select
                        value={deliveryTime}
                        onValueChange={setDeliveryTime}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-week">1 week</SelectItem>
                          <SelectItem value="2-weeks">2 weeks</SelectItem>
                          <SelectItem value="3-weeks">3 weeks</SelectItem>
                          <SelectItem value="1-month">1 month</SelectItem>
                          <SelectItem value="2-months">2 months</SelectItem>
                          <SelectItem value="3-months">3 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Cover Letter / Proposal *</Label>
                    <RichTextEditor
                      value={proposal}
                      onChange={setProposal}
                      placeholder="Explain why you're the best fit for this project. Include relevant experience, approach, and any questions..."
                      className="mt-1"
                      minHeight="200px"
                    />
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">
                        Minimum 100 characters
                      </p>
                      <p className="text-xs text-gray-500">
                        {proposal.length} / 100
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">Tips for a winning bid:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Be specific about your relevant experience</li>
                      <li>• Ask clarifying questions about the project</li>
                      <li>• Provide a realistic timeline and budget</li>
                      <li>• Mention similar projects you've completed</li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsBidDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitBid}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="size-4 mr-2" />
                      Submit Bid
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>

      {/* Withdraw Confirmation Dialog */}
      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="size-5 text-red-500" />
              Withdraw Bid
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to withdraw this bid? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="withdrawReason">Reason for withdrawal *</Label>
              <textarea
                id="withdrawReason"
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
                placeholder="Please provide a reason for withdrawing your bid..."
                className="w-full h-24 resize-none rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={undoWithdrawBid}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmWithdrawBid}
              disabled={!withdrawReason.trim()}
            >
              Withdraw Bid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}