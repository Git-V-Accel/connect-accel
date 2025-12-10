import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Filter,
  Clock,
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  Send,
  FileText,
  Star,
  MapPin,
  Briefcase,
  CheckCircle,
  AlertCircle,
  Gavel,
} from 'lucide-react';
import { toast } from '../../utils/toast';

interface Project {
  id: string;
  title: string;
  description: string;
  budget: string;
  budgetType: 'fixed' | 'hourly';
  duration: string;
  postedDate: string;
  category: string;
  skills: string[];
  client: {
    name: string;
    rating: number;
    projectsPosted: number;
    location: string;
  };
  bidsCount: number;
  status: 'open' | 'in-review' | 'awarded';
}

interface Bid {
  id: string;
  projectId: string;
  projectTitle: string;
  bidAmount: string;
  deliveryTime: string;
  proposal: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  submittedDate: string;
}

export default function FreelancerBids() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, bids, getBidsByFreelancer } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isBidDialogOpen, setIsBidDialogOpen] = useState(false);

  // Bid form state
  const [bidAmount, setBidAmount] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [proposal, setProposal] = useState('');

  // Get available projects (in bidding status)
  const availableProjects = projects.filter(p => p.status === 'in_bidding' || p.status === 'open');
  
  // Get my bids
  const myBids = user ? getBidsByFreelancer(user.id) : [];

  const filteredProjects = availableProjects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      categoryFilter === 'all' || project.category === categoryFilter;

    const matchesBudget = budgetFilter === 'all'; // Can add more complex budget filtering

    return matchesSearch && matchesCategory && matchesBudget;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="size-4" />;
      case 'accepted':
        return <CheckCircle className="size-4" />;
      case 'rejected':
        return <AlertCircle className="size-4" />;
      default:
        return <Clock className="size-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl mb-2">Bids & Projects</h1>
          <p className="text-gray-600">
            Browse available projects and manage your submitted bids
          </p>
        </div>

        <Tabs defaultValue="my-bids" className="space-y-6">
          <TabsList>
            <TabsTrigger value="my-bids">
              <FileText className="size-4 mr-2" />
              My Bids ({myBids.length})
            </TabsTrigger>
            <TabsTrigger value="available">
              <Gavel className="size-4 mr-2" />
              Available Projects
            </TabsTrigger>
          </TabsList>

          {/* My Bids Tab */}
          <TabsContent value="my-bids" className="space-y-4">
            {myBids.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl mb-2">No bids yet</h3>
                <p className="text-gray-600 mb-6">
                  Start bidding on projects to see them here
                </p>
                <Button onClick={() => document.querySelector('[value="available"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}>
                  Browse Projects
                </Button>
              </Card>
            ) : (
              myBids.map((bid) => (
                <Card key={bid.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl mb-2">{bid.projectTitle}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span>Submitted {bid.submittedDate}</span>
                          <Badge className={getStatusColor(bid.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(bid.status)}
                              {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                            </span>
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 py-4 border-y">
                      <div>
                        <div className="text-sm text-gray-600">Bid Amount</div>
                        <div>{bid.bidAmount}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Delivery Time</div>
                        <div>{bid.deliveryTime}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Status</div>
                        <div className="capitalize">{bid.status}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-2">Your Proposal</div>
                      <p className="text-gray-700">
                        {bid.proposal.length > 200
                          ? `${bid.proposal.substring(0, 200)}...`
                          : bid.proposal}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm">
                        View Project
                      </Button>
                      {bid.status === 'pending' && (
                        <>
                          <Button variant="outline" size="sm">
                            Edit Bid
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            Withdraw Bid
                          </Button>
                        </>
                      )}
                      {bid.status === 'accepted' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          View Project Workspace
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Available Projects Tab */}
          <TabsContent value="available" className="space-y-6">
            {/* Filters */}
            <Card className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
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

                <div>
                  <Label>Budget Range</Label>
                  <Select value={budgetFilter} onValueChange={setBudgetFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Budgets</SelectItem>
                      <SelectItem value="low">Under ₹50K</SelectItem>
                      <SelectItem value="medium">₹50K - ₹1L</SelectItem>
                      <SelectItem value="high">Above ₹1L</SelectItem>
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
                              Posted {project.postedDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="size-4" />
                              {project.client.location}
                            </span>
                            <Badge variant="secondary">{project.category}</Badge>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-700">{project.description}</p>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-2">
                        {project.skills.map((skill) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      {/* Project Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y">
                        <div>
                          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                            <DollarSign className="size-4" />
                            Budget
                          </div>
                          <div>{project.budget}</div>
                          <div className="text-sm text-gray-600 capitalize">
                            {project.budgetType}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                            <Calendar className="size-4" />
                            Duration
                          </div>
                          <div>{project.duration}</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                            <Users className="size-4" />
                            Bids
                          </div>
                          <div>{project.bidsCount} proposals</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                            <Star className="size-4" />
                            Client
                          </div>
                          <div className="flex items-center gap-1">
                            {project.client.rating}
                            <span className="text-sm text-gray-600">
                              ({project.client.projectsPosted} projects)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Client Info & Actions */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-600">Posted by</div>
                          <div>{project.client.name}</div>
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
                    <Textarea
                      placeholder="Explain why you're the best fit for this project. Include relevant experience, approach, and any questions..."
                      rows={8}
                      value={proposal}
                      onChange={(e) => setProposal(e.target.value)}
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
    </DashboardLayout>
  );
}