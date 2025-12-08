import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Search, Calendar, DollarSign, Clock, Send, Filter } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function BrowseProjects() {
  const { user } = useAuth();
  const { projects, createBid, getBidsByFreelancer } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showBidDialog, setShowBidDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidDuration, setBidDuration] = useState('');
  const [bidProposal, setBidProposal] = useState('');

  if (!user) return null;

  const myBids = getBidsByFreelancer(user.id);
  const availableProjects = projects.filter(p => 
    p.status === 'in_bidding' && 
    !myBids.some(b => b.project_id === p.id)
  );

  const filteredProjects = availableProjects.filter(p => {
    const matchesSearch = !searchQuery || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(projects.map(p => p.category))];

  const handleSubmitBid = () => {
    if (!selectedProject || !bidAmount || !bidDuration || !bidProposal) {
      toast.error('Please fill in all required fields');
      return;
    }

    createBid({
      project_id: selectedProject,
      freelancer_id: user.id,
      freelancer_name: user.name,
      freelancer_rating: 4.5,
      amount: parseInt(bidAmount),
      duration_weeks: parseInt(bidDuration),
      proposal: bidProposal,
      status: 'pending',
    });

    toast.success('Bid submitted successfully! We\'ll notify you if you\'re shortlisted.');
    setShowBidDialog(false);
    setSelectedProject(null);
    setBidAmount('');
    setBidDuration('');
    setBidProposal('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl">Browse Projects</h1>
          <p className="text-gray-600">Find and bid on projects that match your skills</p>
        </div>

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
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-gray-600">{filteredProjects.length} projects available</p>
        </div>

        <div className="space-y-4">
          {filteredProjects.map(project => (
            <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-2">{project.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.skills_required.slice(0, 6).map(skill => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                    {project.skills_required.length > 6 && (
                      <Badge variant="secondary">+{project.skills_required.length - 6} more</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="size-4 text-gray-400" />
                      <span className="text-gray-600">₹{project.client_budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="size-4 text-gray-400" />
                      <span className="text-gray-600">{project.duration_weeks} weeks</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">Category:</span>
                      <span className="text-gray-600">{project.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">Complexity:</span>
                      <span className="text-gray-600 capitalize">{project.complexity}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-sm text-gray-500">
                  Posted {new Date(project.created_at).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <Link to={`/freelancer/projects/${project.id}/detail`}>
                    <Button variant="outline">
                      View Details
                    </Button>
                  </Link>
                  <Button 
                    onClick={() => {
                      setSelectedProject(project.id);
                      setShowBidDialog(true);
                    }}
                  >
                    <Send className="size-4 mr-2" />
                    Submit Bid
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {filteredProjects.length === 0 && (
            <Card className="p-12 text-center">
              <h3 className="text-lg font-medium mb-2">No projects found</h3>
              <p className="text-gray-600">
                {searchQuery || categoryFilter !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'Check back soon for new opportunities'
                }
              </p>
            </Card>
          )}
        </div>

        <Dialog open={showBidDialog} onOpenChange={setShowBidDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submit Your Bid</DialogTitle>
              <DialogDescription>
                Provide your proposal and pricing for this project
              </DialogDescription>
            </DialogHeader>

            {selectedProject && (
              <>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium mb-1">
                    {projects.find(p => p.id === selectedProject)?.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Client Budget: ₹{projects.find(p => p.id === selectedProject)?.client_budget.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Your Bid Amount (₹) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="e.g., 120000"
                        value={bidAmount}
                        onChange={e => setBidAmount(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended: 80-90% of client budget
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration (weeks) *</Label>
                      <Input
                        id="duration"
                        type="number"
                        placeholder="e.g., 8"
                        value={bidDuration}
                        onChange={e => setBidDuration(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="proposal">Your Proposal *</Label>
                    <Textarea
                      id="proposal"
                      placeholder="Explain why you're the best fit for this project. Include relevant experience, approach, and what makes your bid competitive."
                      rows={6}
                      value={bidProposal}
                      onChange={e => setBidProposal(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      A detailed proposal increases your chances of being shortlisted
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Note:</strong> Your bid will be reviewed by our admin team. If shortlisted,
                    the client will see your proposal and make a final decision.
                  </p>
                </div>
              </>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBidDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitBid}
                disabled={!bidAmount || !bidDuration || !bidProposal}
              >
                <Send className="size-4 mr-2" />
                Submit Bid
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}