import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Save, X, CheckCircle } from 'lucide-react';
import { toast } from '../../utils/toast';

interface ProjectFormData {
  title: string;
  description: string;
  client: string;
  category: string;
  budget: string;
  timeline: string;
  requirements: string;
  consultationId?: string;
}

export default function CreateProject() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clients, createProject, projects } = useData();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdProject, setCreatedProject] = useState<any>(null);
  
  // Get URL parameters from consultation
  const clientId = searchParams.get('clientId');
  const clientName = searchParams.get('clientName');
  const consultationId = searchParams.get('consultationId');
  
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    client: clientId || '',
    category: '',
    budget: '',
    timeline: '',
    requirements: '',
    consultationId: consultationId || '',
  });

  const projectCategories = [
    'Web Development',
    'Mobile App',
    'UI/UX Design',
    'Backend Development',
    'Full Stack',
    'DevOps',
    'Data Science',
    'Machine Learning',
    'Blockchain',
    'Other',
  ];

  const timelineOptions = [
    '1-2 weeks',
    '2-4 weeks',
    '1-2 months',
    '2-3 months',
    '3-6 months',
    '6+ months',
  ];

  useEffect(() => {
    // Pre-fill project title if coming from consultation
    if (clientName && consultationId) {
      setFormData(prev => ({
        ...prev,
        title: `Project for ${clientName}`,
        description: `Project created from consultation #${consultationId.slice(-6)}`,
      }));
    }
  }, [clientName, consultationId]);

  const handleInputChange = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.client || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const projectData = {
        title: formData.title,
        description: formData.description,
        client: formData.client,
        category: formData.category,
        client_budget: parseFloat(formData.budget) || 0,
        timeline: formData.timeline,
        requirements: formData.requirements,
        status: 'pending',
        consultation_id: formData.consultationId,
        created_by: user._id,
      };

      const newProject = await createProject(projectData);
      setCreatedProject(newProject);
      setShowSuccessDialog(true);
      toast.success('Project created successfully!');
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    if (createdProject) {
      navigate(`/admin/projects/${createdProject._id}/review`);
    }
  };

  const handleGoBack = () => {
    navigate('/admin/consultations');
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="size-4" />
              Back to Consultations
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Create New Project</h1>
              <p className="text-gray-600">
                {clientName ? `Creating project for ${clientName}` : 'Create a new project for a client'}
              </p>
              {consultationId && (
                <p className="text-sm text-blue-600">
                  From consultation #{consultationId.slice(-6)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Project Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Project Title */}
              <div>
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter project title"
                  required
                />
              </div>

              {/* Client Selection */}
              <div>
                <Label htmlFor="client">Client *</Label>
                <Select
                  value={formData.client}
                  onValueChange={(value) => handleInputChange('client', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client: any) => (
                      <SelectItem key={client._id} value={client._id}>
                        {client.name} ({client.company || 'No company'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Project Category */}
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Budget */}
              <div>
                <Label htmlFor="budget">Budget (₹)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  placeholder="Enter project budget"
                  min="0"
                />
              </div>

              {/* Timeline */}
              <div>
                <Label htmlFor="timeline">Timeline</Label>
                <Select
                  value={formData.timeline}
                  onValueChange={(value) => handleInputChange('timeline', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    {timelineOptions.map((timeline) => (
                      <SelectItem key={timeline} value={timeline}>
                        {timeline}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Project Description */}
            <div>
              <Label htmlFor="description">Project Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the project scope and objectives"
                rows={4}
                required
              />
            </div>

            {/* Requirements */}
            <div>
              <Label htmlFor="requirements">Requirements & Deliverables</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                placeholder="List specific requirements, features, and deliverables"
                rows={4}
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Save className="size-4" />
                {loading ? 'Creating...' : 'Create Project'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleGoBack}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="size-5 text-green-600" />
              Project Created Successfully!
            </DialogTitle>
            <DialogDescription>
              The project "{createdProject?.title}" has been created and is now ready for review.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleSuccessDialogClose}>
              View Project Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
