import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { ArrowLeft, Send, UserPlus, Search, X } from 'lucide-react';
import { toast } from '../../utils/toast';

// Mock freelancer data
const mockFreelancers = [
  { id: 'freelancer_1', name: 'Ravi Kumar', rating: 4.8, skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'], hourly_rate: 2500, availability: 'Full-time' },
  { id: 'freelancer_2', name: 'Priya Singh', rating: 4.9, skills: ['Python', 'Django', 'PostgreSQL', 'API Development'], hourly_rate: 3000, availability: 'Part-time' },
  { id: 'freelancer_3', name: 'Amit Patel', rating: 4.6, skills: ['Vue.js', 'Laravel', 'MySQL', 'AWS'], hourly_rate: 2800, availability: 'Full-time' },
  { id: 'freelancer_4', name: 'Neha Sharma', rating: 4.9, skills: ['Angular', 'Spring Boot', 'MySQL', 'Docker'], hourly_rate: 3200, availability: 'Full-time' },
  { id: 'freelancer_5', name: 'Rohit Verma', rating: 4.7, skills: ['React Native', 'Firebase', 'iOS', 'Android'], hourly_rate: 2700, availability: 'Part-time' },
  { id: 'freelancer_6', name: 'Anjali Gupta', rating: 4.8, skills: ['Python', 'NLP', 'TensorFlow', 'Machine Learning'], hourly_rate: 3500, availability: 'Full-time' },
];

export default function CreateBidInvitation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, createBidInvitation, createNotification } = useData();
  const role = user?.role || 'agent';
  
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedFreelancers, setSelectedFreelancers] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState({ min: 0, max: 0 });
  const [deadline, setDeadline] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter projects based on role
  const availableProjects = projects.filter(p => {
    if (role === 'agent') {
      return p.admin_id === user?.id && (p.status === 'pending_review' || p.status === 'in_bidding');
    }
    return p.status === 'pending_review' || p.status === 'in_bidding';
  });

  const selectedProjectData = projects.find(p => p.id === selectedProject);

  // Auto-set budget range when project is selected
  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
    const project = projects.find(p => p.id === projectId);
    if (project && project.freelancer_budget) {
      setBudgetRange({
        min: Math.round(project.freelancer_budget * 0.8),
        max: project.freelancer_budget,
      });
    } else if (project) {
      setBudgetRange({
        min: Math.round(project.client_budget * 0.6),
        max: Math.round(project.client_budget * 0.8),
      });
    }
  };

  // Filter freelancers based on search and project skills
  const filteredFreelancers = mockFreelancers.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!selectedProjectData) return matchesSearch;
    
    // Check if freelancer has required skills
    const hasRequiredSkills = selectedProjectData.skills_required.some(skill =>
      f.skills.some(fs => fs.toLowerCase().includes(skill.toLowerCase()))
    );
    
    return matchesSearch && hasRequiredSkills;
  });

  const handleToggleFreelancer = (freelancerId: string) => {
    if (selectedFreelancers.includes(freelancerId)) {
      setSelectedFreelancers(selectedFreelancers.filter(id => id !== freelancerId));
    } else {
      if (selectedFreelancers.length >= 5) {
        toast.error('You can invite up to 5 freelancers per bid');
        return;
      }
      setSelectedFreelancers([...selectedFreelancers, freelancerId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProject) {
      toast.error('Please select a project');
      return;
    }

    if (selectedFreelancers.length === 0) {
      toast.error('Please select at least one freelancer');
      return;
    }

    if (budgetRange.min <= 0 || budgetRange.max <= 0) {
      toast.error('Please set a valid budget range');
      return;
    }

    if (budgetRange.min >= budgetRange.max) {
      toast.error('Minimum budget must be less than maximum budget');
      return;
    }

    if (!deadline) {
      toast.error('Please set a deadline');
      return;
    }

    // Create bid invitations for each selected freelancer
    selectedFreelancers.forEach(freelancerId => {
      const freelancer = mockFreelancers.find(f => f.id === freelancerId);
      if (freelancer) {
        createBidInvitation({
          project_id: selectedProject,
          freelancer_id: freelancerId,
          freelancer_name: freelancer.name,
          budget_min: budgetRange.min,
          budget_max: budgetRange.max,
          deadline,
          message: customMessage,
          invited_by: user?.id,
          invited_by_name: user?.name,
        });

        // Send notification to freelancer
        createNotification({
          user_id: freelancerId,
          type: 'bid',
          title: 'New Bid Invitation',
          description: `You've been invited to bid on "${selectedProjectData?.title}". Budget range: ₹${budgetRange.min.toLocaleString()} - ₹${budgetRange.max.toLocaleString()}`,
          link: `/freelancer/projects/${selectedProject}/detail`,
        });
      }
    });

    toast.success(`Bid invitations sent to ${selectedFreelancers.length} freelancers`);
    navigate(`/${role}/projects/${selectedProject}/bids`);
  };

  return (
    <DashboardLayout role={role as any}>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <h1 className="text-3xl mb-2">Create Bid Invitation</h1>
            <p className="text-gray-600">Invite select freelancers to bid on a project</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Selection */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl mb-4">Select Project</h2>
              <div>
                <select
                  value={selectedProject}
                  onChange={(e) => handleProjectSelect(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                  required
                >
                  <option value="">Choose a project...</option>
                  {availableProjects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.title} - ₹{project.client_budget.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProjectData && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium mb-2">{selectedProjectData.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{selectedProjectData.description}</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedProjectData.skills_required.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                    <div>
                      <span className="text-gray-600">Client Budget:</span>
                      <p className="font-medium">₹{selectedProjectData.client_budget.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <p className="font-medium">{selectedProjectData.duration_weeks} weeks</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Category:</span>
                      <p className="font-medium">{selectedProjectData.category}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Budget Range */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl mb-4">Set Budget Range</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Minimum Budget (₹)</label>
                  <input
                    type="number"
                    value={budgetRange.min}
                    onChange={(e) => setBudgetRange({ ...budgetRange, min: Number(e.target.value) })}
                    className="w-full px-4 py-3 border rounded-lg"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Maximum Budget (₹)</label>
                  <input
                    type="number"
                    value={budgetRange.max}
                    onChange={(e) => setBudgetRange({ ...budgetRange, max: Number(e.target.value) })}
                    className="w-full px-4 py-3 border rounded-lg"
                    min="0"
                    required
                  />
                </div>
              </div>
              {budgetRange.min > 0 && budgetRange.max > 0 && (
                <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-900">
                    <strong>Estimated Margin:</strong> ₹
                    {((selectedProjectData?.client_budget || 0) - budgetRange.max).toLocaleString()} - ₹
                    {((selectedProjectData?.client_budget || 0) - budgetRange.min).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Deadline */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl mb-4">Bid Deadline</h2>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                min={new Date().toISOString().slice(0, 16)}
                required
              />
              <p className="text-sm text-gray-600 mt-2">
                Freelancers must submit their proposals before this date
              </p>
            </div>

            {/* Freelancer Selection */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl">Select Freelancers ({selectedFreelancers.length}/5)</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search freelancers..."
                    className="pl-10 pr-4 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Selected Freelancers */}
              {selectedFreelancers.length > 0 && (
                <div className="mb-4 p-4 bg-green-50 rounded-lg">
                  <h3 className="text-sm font-medium mb-2 text-green-900">Selected Freelancers:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFreelancers.map(id => {
                      const freelancer = mockFreelancers.find(f => f.id === id);
                      return (
                        <span key={id} className="px-3 py-1 bg-white border border-green-200 rounded-full text-sm flex items-center gap-2">
                          {freelancer?.name}
                          <button
                            type="button"
                            onClick={() => handleToggleFreelancer(id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Freelancer List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredFreelancers.map(freelancer => (
                  <div
                    key={freelancer.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedFreelancers.includes(freelancer.id)
                        ? 'bg-blue-50 border-blue-300'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleToggleFreelancer(freelancer.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{freelancer.name}</h3>
                          <span className="text-sm text-yellow-600">★ {freelancer.rating}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {freelancer.skills.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>₹{freelancer.hourly_rate}/hr</span>
                          <span>•</span>
                          <span>{freelancer.availability}</span>
                        </div>
                      </div>
                      <div>
                        <input
                          type="checkbox"
                          checked={selectedFreelancers.includes(freelancer.id)}
                          onChange={() => handleToggleFreelancer(freelancer.id)}
                          className="w-5 h-5"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredFreelancers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No freelancers found matching your criteria</p>
                </div>
              )}
            </div>

            {/* Custom Message */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl mb-4">Custom Message (Optional)</h2>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg resize-none"
                rows={5}
                placeholder="Add a personalized message to your invitation..."
              />
              <p className="text-sm text-gray-600 mt-2">
                This message will be sent along with the bid invitation
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Invitations ({selectedFreelancers.length})
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
