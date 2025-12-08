import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Plus, Trash2, Send } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function SubmitBid() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, createBid, freelancers } = useData();
  const { user } = useAuth();

  const project = projects.find(p => p.id === projectId);
  const freelancer = freelancers.find(f => f.id === user?.id);

  const [formData, setFormData] = useState({
    amount: project?.budget || 0,
    duration_weeks: project?.duration_weeks || 4,
    cover_letter: '',
  });

  const [milestones, setMilestones] = useState<Array<{
    title: string;
    description: string;
    amount: number;
    duration: string;
  }>>([
    { title: '', description: '', amount: 0, duration: '' }
  ]);

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl mb-4">Project not found</h2>
          <Button asChild>
            <Link to="/freelancer/projects">
              <ArrowLeft className="size-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleAddMilestone = () => {
    setMilestones([...milestones, { title: '', description: '', amount: 0, duration: '' }]);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (index: number, field: string, value: string | number) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cover_letter.trim()) {
      toast.error('Please write a cover letter');
      return;
    }

    if (formData.amount <= 0) {
      toast.error('Please enter a valid bid amount');
      return;
    }

    // Validate milestones if provided
    const validMilestones = milestones.filter(m => m.title.trim() && m.amount > 0);
    const totalMilestoneAmount = validMilestones.reduce((sum, m) => sum + m.amount, 0);
    
    if (validMilestones.length > 0 && totalMilestoneAmount !== formData.amount) {
      toast.error('Total milestone amounts must equal bid amount');
      return;
    }

    createBid({
      project_id: project.id,
      freelancer_id: user!.id,
      freelancer_name: freelancer?.name || user!.name,
      freelancer_rating: freelancer?.rating || 0,
      amount: formData.amount,
      duration_weeks: formData.duration_weeks,
      estimated_duration: `${formData.duration_weeks} weeks`,
      cover_letter: formData.cover_letter,
      proposal: formData.cover_letter,
      status: 'pending',
      submitted_at: new Date().toISOString(),
      milestones: validMilestones.length > 0 ? validMilestones : undefined,
    });

    toast.success('Bid submitted successfully!');
    navigate('/freelancer/bids');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline">
              <Link to={`/freelancer/projects/${project.id}/detail`}>
                <ArrowLeft className="size-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl">Submit Bid</h1>
              <p className="text-gray-600 mt-1">{project.title}</p>
            </div>
          </div>
        </div>

        {/* Project Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl mb-4">Project Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500">Budget</div>
              <div className="text-xl">${project.budget.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Duration</div>
              <div className="text-xl">{project.duration_weeks} weeks</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Status</div>
              <div className="text-xl capitalize">{project.status.replace('_', ' ')}</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500 mb-2">Description</div>
            <p className="text-gray-700">{project.description}</p>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500 mb-2">Required Skills</div>
            <div className="flex flex-wrap gap-2">
              {project.skills_required.map((skill) => (
                <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bid Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl mb-6">Your Bid</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="amount">Bid Amount ($) *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                className="mt-1"
                min="0"
                step="1000"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Project budget: ${project.budget.toLocaleString()}</p>
            </div>

            <div>
              <Label htmlFor="duration_weeks">Estimated Duration (weeks) *</Label>
              <Input
                id="duration_weeks"
                type="number"
                value={formData.duration_weeks}
                onChange={(e) => setFormData({ ...formData, duration_weeks: parseInt(e.target.value) })}
                className="mt-1"
                min="1"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Expected timeline: {project.duration_weeks} weeks</p>
            </div>
          </div>

          <div className="mb-6">
            <Label htmlFor="cover_letter">Cover Letter *</Label>
            <textarea
              id="cover_letter"
              value={formData.cover_letter}
              onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={8}
              placeholder="Explain why you're the best fit for this project. Include your relevant experience, approach, and how you'll deliver value..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.cover_letter.length} characters (minimum 100 recommended)
            </p>
          </div>

          {/* Milestones */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Label>Proposed Milestones (Optional)</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddMilestone}>
                <Plus className="size-4 mr-2" />
                Add Milestone
              </Button>
            </div>

            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm">Milestone {index + 1}</span>
                    {milestones.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMilestone(index)}
                      >
                        <Trash2 className="size-4 text-red-600" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <Input
                      placeholder="Milestone title"
                      value={milestone.title}
                      onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={milestone.amount || ''}
                        onChange={(e) => handleMilestoneChange(index, 'amount', parseFloat(e.target.value) || 0)}
                        min="0"
                      />
                      <Input
                        placeholder="Duration"
                        value={milestone.duration}
                        onChange={(e) => handleMilestoneChange(index, 'duration', e.target.value)}
                      />
                    </div>
                  </div>

                  <Input
                    placeholder="Description"
                    value={milestone.description}
                    onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                  />
                </div>
              ))}
            </div>

            {milestones.filter(m => m.amount > 0).length > 0 && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span>Total Milestone Amount:</span>
                  <span className={
                    milestones.reduce((sum, m) => sum + m.amount, 0) === formData.amount
                      ? 'text-green-600'
                      : 'text-red-600'
                  }>
                    ${milestones.reduce((sum, m) => sum + m.amount, 0).toLocaleString()}
                  </span>
                </div>
                {milestones.reduce((sum, m) => sum + m.amount, 0) !== formData.amount && (
                  <p className="text-xs text-red-600 mt-1">
                    Must equal bid amount of ${formData.amount.toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center gap-4">
            <Button type="submit" className="flex-1">
              <Send className="size-4 mr-2" />
              Submit Bid
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
