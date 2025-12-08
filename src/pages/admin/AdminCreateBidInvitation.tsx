import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Send, Search, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function AdminCreateBidInvitation() {
  const navigate = useNavigate();
  const { projects, freelancers, createBidInvitation } = useData();
  const { user } = useAuth();

  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedFreelancers, setSelectedFreelancers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    budget_min: 0,
    budget_max: 0,
    deadline: '',
    message: '',
  });

  // Filter projects that are open for bidding
  const availableProjects = projects.filter(p => ['open', 'pending_review'].includes(p.status));

  // Get selected project details
  const project = projects.find(p => p.id === selectedProject);

  // Filter freelancers based on search
  const filteredFreelancers = freelancers.filter(f => {
    const searchLower = searchTerm.toLowerCase();
    return (
      f.name.toLowerCase().includes(searchLower) ||
      f.title.toLowerCase().includes(searchLower) ||
      f.skills.some(s => s.toLowerCase().includes(searchLower))
    );
  });

  const toggleFreelancerSelection = (freelancerId: string) => {
    if (selectedFreelancers.includes(freelancerId)) {
      setSelectedFreelancers(selectedFreelancers.filter(id => id !== freelancerId));
    } else {
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

    if (!formData.deadline) {
      toast.error('Please set a deadline');
      return;
    }

    if (formData.budget_min <= 0 || formData.budget_max <= 0) {
      toast.error('Please set valid budget range');
      return;
    }

    if (formData.budget_min >= formData.budget_max) {
      toast.error('Maximum budget must be greater than minimum');
      return;
    }

    // Create invitation for each selected freelancer
    selectedFreelancers.forEach(freelancerId => {
      const freelancer = freelancers.find(f => f.id === freelancerId);
      if (freelancer) {
        createBidInvitation({
          project_id: selectedProject,
          freelancer_id: freelancerId,
          freelancer_name: freelancer.name,
          budget_min: formData.budget_min,
          budget_max: formData.budget_max,
          deadline: formData.deadline,
          message: formData.message,
          status: 'pending',
          invited_by: user!.id,
          invited_by_name: user!.name,
        });
      }
    });

    toast.success(`${selectedFreelancers.length} bid invitation(s) sent successfully!`);
    navigate('/admin/bids');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl">Create Bid Invitation</h1>
            <p className="text-gray-600 mt-1">Invite freelancers to submit bids on a project</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl mb-4">Select Project</h2>
            <div>
              <Label htmlFor="project">Project *</Label>
              <select
                id="project"
                value={selectedProject}
                onChange={(e) => {
                  setSelectedProject(e.target.value);
                  const proj = projects.find(p => p.id === e.target.value);
                  if (proj) {
                    setFormData({
                      ...formData,
                      budget_min: Math.floor(proj.budget * 0.8),
                      budget_max: proj.budget,
                    });
                  }
                }}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose a project...</option>
                {availableProjects.map(proj => (
                  <option key={proj.id} value={proj.id}>
                    {proj.title} - ${proj.budget.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {project && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">{project.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Budget: ${project.budget.toLocaleString()}</span>
                  <span>Duration: {project.duration_weeks} weeks</span>
                  <span>Category: {project.category}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.skills_required.map(skill => (
                    <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Budget Range */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl mb-4">Budget Range</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget_min">Minimum Budget ($) *</Label>
                <Input
                  id="budget_min"
                  type="number"
                  value={formData.budget_min}
                  onChange={(e) => setFormData({ ...formData, budget_min: parseFloat(e.target.value) })}
                  className="mt-1"
                  min="0"
                  step="1000"
                  required
                />
              </div>
              <div>
                <Label htmlFor="budget_max">Maximum Budget ($) *</Label>
                <Input
                  id="budget_max"
                  type="number"
                  value={formData.budget_max}
                  onChange={(e) => setFormData({ ...formData, budget_max: parseFloat(e.target.value) })}
                  className="mt-1"
                  min="0"
                  step="1000"
                  required
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Freelancers will be asked to submit bids within this range
            </p>
          </div>

          {/* Deadline */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl mb-4">Response Deadline</h2>
            <div>
              <Label htmlFor="deadline">Deadline *</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="mt-1 max-w-md"
                min={new Date().toISOString().split('T')[0]}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Freelancers must respond by this date
              </p>
            </div>
          </div>

          {/* Message */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl mb-4">Custom Message (Optional)</h2>
            <div>
              <Label htmlFor="message">Message to Freelancers</Label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Add a personalized message explaining why you're inviting them..."
              />
            </div>
          </div>

          {/* Freelancer Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl mb-4">Select Freelancers</h2>
            
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, title, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Selected Count */}
            {selectedFreelancers.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  {selectedFreelancers.length} freelancer(s) selected
                </p>
              </div>
            )}

            {/* Freelancer List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredFreelancers.map(freelancer => {
                const isSelected = selectedFreelancers.includes(freelancer.id);
                return (
                  <div
                    key={freelancer.id}
                    onClick={() => toggleFreelancerSelection(freelancer.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="mt-1 size-5 text-blue-600 rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm">{freelancer.name}</h3>
                            <div className="flex items-center gap-1 text-xs">
                              <span>⭐</span>
                              <span>{freelancer.rating}</span>
                              <span className="text-gray-500">({freelancer.total_reviews})</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{freelancer.title}</p>
                          <div className="flex flex-wrap gap-1">
                            {freelancer.skills.slice(0, 5).map(skill => (
                              <span key={skill} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                            {freelancer.skills.length > 5 && (
                              <span className="px-2 py-0.5 text-gray-500 text-xs">
                                +{freelancer.skills.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm">${freelancer.hourly_rate}/hr</div>
                        <div className={`text-xs mt-1 px-2 py-1 rounded ${
                          freelancer.availability === 'available' ? 'bg-green-100 text-green-700' :
                          freelancer.availability === 'busy' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {freelancer.availability}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredFreelancers.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No freelancers found matching your search
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4">
            <Button type="submit" className="flex-1">
              <Send className="size-4 mr-2" />
              Send {selectedFreelancers.length > 0 ? `${selectedFreelancers.length} ` : ''}Invitation{selectedFreelancers.length !== 1 ? 's' : ''}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
