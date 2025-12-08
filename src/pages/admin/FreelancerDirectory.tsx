import { useState } from 'react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Star,
  Briefcase,
  CheckCircle,
  XCircle,
  Eye,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Award,
  TrendingUp,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function FreelancerDirectory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [selectedFreelancer, setSelectedFreelancer] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  // Form states
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [selectedProject, setSelectedProject] = useState('');

  // Mock freelancer data
  const [freelancers] = useState([
    {
      id: 'FL-1',
      name: 'Rajesh Kumar',
      email: 'rajesh.k@example.com',
      phone: '+91 98765 43210',
      location: 'Bangalore, India',
      rating: 4.9,
      completedProjects: 87,
      successRate: 98,
      hourlyRate: 1500,
      skills: ['React', 'Node.js', 'MongoDB', 'AWS', 'TypeScript'],
      specialization: 'Full Stack Development',
      verified: true,
      available: true,
      joinedDate: '2022-03-15',
      bio: 'Senior full-stack developer with 8+ years of experience building scalable web applications.',
      totalEarnings: 2450000,
      activeProjects: 2,
      responseTime: '2 hours',
    },
    {
      id: 'FL-2',
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+91 98765 43211',
      location: 'Mumbai, India',
      rating: 4.8,
      completedProjects: 65,
      successRate: 96,
      hourlyRate: 1200,
      skills: ['Figma', 'Adobe XD', 'UI/UX', 'Prototyping', 'User Research'],
      specialization: 'UI/UX Design',
      verified: true,
      available: true,
      joinedDate: '2021-07-20',
      bio: 'Passionate UI/UX designer focused on creating intuitive and beautiful user experiences.',
      totalEarnings: 1850000,
      activeProjects: 1,
      responseTime: '1 hour',
    },
    {
      id: 'FL-3',
      name: 'Amit Patel',
      email: 'amit.p@example.com',
      phone: '+91 98765 43212',
      location: 'Ahmedabad, India',
      rating: 4.7,
      completedProjects: 52,
      successRate: 94,
      hourlyRate: 1800,
      skills: ['Python', 'Machine Learning', 'Data Analysis', 'TensorFlow', 'Pandas'],
      specialization: 'Data Science',
      verified: true,
      available: false,
      joinedDate: '2022-01-10',
      bio: 'Data scientist specializing in machine learning and predictive analytics.',
      totalEarnings: 1620000,
      activeProjects: 3,
      responseTime: '3 hours',
    },
    {
      id: 'FL-4',
      name: 'Sneha Reddy',
      email: 'sneha.r@example.com',
      phone: '+91 98765 43213',
      location: 'Hyderabad, India',
      rating: 4.9,
      completedProjects: 73,
      successRate: 97,
      hourlyRate: 1600,
      skills: ['React Native', 'Flutter', 'iOS', 'Android', 'Mobile UI'],
      specialization: 'Mobile Development',
      verified: true,
      available: true,
      joinedDate: '2021-11-05',
      bio: 'Mobile app developer with expertise in both native and cross-platform solutions.',
      totalEarnings: 2180000,
      activeProjects: 2,
      responseTime: '1 hour',
    },
    {
      id: 'FL-5',
      name: 'Vikram Singh',
      email: 'vikram.s@example.com',
      phone: '+91 98765 43214',
      location: 'Delhi, India',
      rating: 4.6,
      completedProjects: 41,
      successRate: 93,
      hourlyRate: 1400,
      skills: ['DevOps', 'Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform'],
      specialization: 'DevOps Engineering',
      verified: true,
      available: true,
      joinedDate: '2022-05-18',
      bio: 'DevOps engineer focused on automation, scalability, and cloud infrastructure.',
      totalEarnings: 1420000,
      activeProjects: 1,
      responseTime: '2 hours',
    },
  ]);

  const filteredFreelancers = freelancers.filter((freelancer) => {
    const matchesSearch =
      freelancer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      freelancer.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      freelancer.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSkill =
      skillFilter === 'all' ||
      freelancer.skills.some((skill) => skill.toLowerCase() === skillFilter.toLowerCase());

    const matchesRating =
      ratingFilter === 'all' ||
      (ratingFilter === '4.5+' && freelancer.rating >= 4.5) ||
      (ratingFilter === '4.0+' && freelancer.rating >= 4.0);

    return matchesSearch && matchesSkill && matchesRating;
  });

  const handleInviteFreelancer = () => {
    if (!inviteEmail || !inviteMessage) {
      toast.error('Please fill all required fields');
      return;
    }

    toast.success('Invitation sent successfully!');
    setIsInviteDialogOpen(false);
    setInviteEmail('');
    setInviteMessage('');
  };

  const handleAssignToProject = () => {
    if (!selectedProject) {
      toast.error('Please select a project');
      return;
    }

    toast.success(`Freelancer assigned to project successfully!`);
    setIsAssignDialogOpen(false);
    setSelectedProject('');
  };

  const FreelancerCard = ({ freelancer }: { freelancer: any }) => (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 size-16 rounded-full flex items-center justify-center">
              <span className="text-2xl">
                {freelancer.name.split(' ').map((n: string) => n[0]).join('')}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl">{freelancer.name}</h3>
                {freelancer.verified && (
                  <CheckCircle className="size-5 text-blue-600" title="Verified" />
                )}
              </div>
              <p className="text-gray-600">{freelancer.specialization}</p>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Star className="size-4 text-yellow-500 fill-yellow-500" />
                  {freelancer.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="size-4" />
                  {freelancer.completedProjects} projects
                </span>
                <span className="flex items-center gap-1">
                  <Award className="size-4" />
                  {freelancer.successRate}% success
                </span>
              </div>
            </div>
          </div>
          <Badge className={freelancer.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
            {freelancer.available ? 'Available' : 'Busy'}
          </Badge>
        </div>

        <p className="text-gray-700 line-clamp-2">{freelancer.bio}</p>

        <div className="flex flex-wrap gap-2">
          {freelancer.skills.slice(0, 5).map((skill: string) => (
            <Badge key={skill} variant="outline">
              {skill}
            </Badge>
          ))}
          {freelancer.skills.length > 5 && (
            <Badge variant="outline">+{freelancer.skills.length - 5} more</Badge>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4 py-4 border-y">
          <div>
            <div className="text-sm text-gray-600">Hourly Rate</div>
            <div className="font-medium">₹{freelancer.hourlyRate}/hr</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Earnings</div>
            <div className="font-medium">₹{(freelancer.totalEarnings / 100000).toFixed(1)}L</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Active Projects</div>
            <div className="font-medium">{freelancer.activeProjects}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Response Time</div>
            <div className="font-medium">{freelancer.responseTime}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedFreelancer(freelancer);
              setIsViewDialogOpen(true);
            }}
          >
            <Eye className="size-4 mr-2" />
            View Profile
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setSelectedFreelancer(freelancer);
              setSelectedProject('');
              setIsAssignDialogOpen(true);
            }}
            disabled={!freelancer.available}
          >
            <UserPlus className="size-4 mr-2" />
            Assign to Project
          </Button>
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
            <h1 className="text-3xl mb-2">Freelancer Directory</h1>
            <p className="text-gray-600">
              Browse, evaluate, and assign freelancers to projects
            </p>
          </div>
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <UserPlus className="size-4 mr-2" />
            Invite Freelancer
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Freelancers</p>
                <p className="text-2xl mt-1">{freelancers.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Briefcase className="size-5 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl mt-1">
                  {freelancers.filter((f) => f.available).length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="size-5 text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl mt-1">
                  {(freelancers.reduce((sum, f) => sum + f.rating, 0) / freelancers.length).toFixed(1)}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Star className="size-5 text-yellow-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl mt-1">
                  {freelancers.filter((f) => f.verified).length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Award className="size-5 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Search by name, skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Select value={skillFilter} onValueChange={setSkillFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  <SelectItem value="react">React</SelectItem>
                  <SelectItem value="node.js">Node.js</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="figma">Figma</SelectItem>
                  <SelectItem value="aws">AWS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="4.5+">4.5+ Stars</SelectItem>
                  <SelectItem value="4.0+">4.0+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Freelancers List */}
        <div className="space-y-4">
          {filteredFreelancers.length === 0 ? (
            <Card className="p-12 text-center">
              <Briefcase className="size-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl mb-2">No freelancers found</h3>
              <p className="text-gray-600">Try adjusting your filters</p>
            </Card>
          ) : (
            filteredFreelancers.map((freelancer) => (
              <FreelancerCard key={freelancer.id} freelancer={freelancer} />
            ))
          )}
        </div>

        {/* View Profile Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Freelancer Profile</DialogTitle>
              <DialogDescription>Complete profile and work history</DialogDescription>
            </DialogHeader>

            {selectedFreelancer && (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 size-20 rounded-full flex items-center justify-center">
                    <span className="text-3xl">
                      {selectedFreelancer.name.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl">{selectedFreelancer.name}</h2>
                      {selectedFreelancer.verified && (
                        <CheckCircle className="size-6 text-blue-600" />
                      )}
                    </div>
                    <p className="text-gray-600">{selectedFreelancer.specialization}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge className={selectedFreelancer.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {selectedFreelancer.available ? 'Available' : 'Busy'}
                      </Badge>
                      <span className="flex items-center gap-1 text-sm">
                        <Star className="size-4 text-yellow-500 fill-yellow-500" />
                        {selectedFreelancer.rating}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Completed Projects</div>
                    <div className="text-2xl mt-1">{selectedFreelancer.completedProjects}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Success Rate</div>
                    <div className="text-2xl mt-1">{selectedFreelancer.successRate}%</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Total Earnings</div>
                    <div className="text-2xl mt-1">₹{(selectedFreelancer.totalEarnings / 100000).toFixed(1)}L</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Bio</h4>
                  <p className="text-gray-700">{selectedFreelancer.bio}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFreelancer.skills.map((skill: string) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="size-4 text-gray-600" />
                      <span>{selectedFreelancer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="size-4 text-gray-600" />
                      <span>{selectedFreelancer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-gray-600" />
                      <span>{selectedFreelancer.location}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Work Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Hourly Rate:</span>
                      <span className="ml-2 font-medium">₹{selectedFreelancer.hourlyRate}/hr</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Response Time:</span>
                      <span className="ml-2 font-medium">{selectedFreelancer.responseTime}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Active Projects:</span>
                      <span className="ml-2 font-medium">{selectedFreelancer.activeProjects}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Joined:</span>
                      <span className="ml-2 font-medium">
                        {new Date(selectedFreelancer.joinedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setIsViewDialogOpen(false);
                  setIsAssignDialogOpen(true);
                }}
                disabled={!selectedFreelancer?.available}
              >
                <UserPlus className="size-4 mr-2" />
                Assign to Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign to Project Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign to Project</DialogTitle>
              <DialogDescription>
                Select a project to assign {selectedFreelancer?.name} to
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Project *</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P1">E-commerce Website - TechStore India</SelectItem>
                    <SelectItem value="P2">Mobile App Design - FitLife Solutions</SelectItem>
                    <SelectItem value="P3">Data Dashboard - RetailPro Analytics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedFreelancer && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Freelancer Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name</span>
                      <span>{selectedFreelancer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hourly Rate</span>
                      <span>₹{selectedFreelancer.hourlyRate}/hr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Success Rate</span>
                      <span>{selectedFreelancer.successRate}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignToProject}>
                <CheckCircle className="size-4 mr-2" />
                Assign Freelancer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invite Freelancer Dialog */}
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Freelancer</DialogTitle>
              <DialogDescription>
                Send an invitation to join the platform
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  placeholder="freelancer@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div>
                <Label>Personal Message *</Label>
                <Textarea
                  placeholder="Write a personalized invitation message..."
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  rows={5}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInviteFreelancer}>
                <Mail className="size-4 mr-2" />
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
