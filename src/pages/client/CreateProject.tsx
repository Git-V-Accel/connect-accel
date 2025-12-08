import { useState } from 'react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Calendar, DollarSign, FileText, Settings } from 'lucide-react';
import { toast } from '../../utils/toast';

const categories = [
  'Web Development',
  'Mobile Development',
  'Backend Development',
  'Frontend Development',
  'Full Stack Development',
  'UI/UX Design',
  'DevOps',
  'AI/ML',
  'Blockchain',
  'Cloud Architecture',
];

const commonSkills = [
  'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript',
  'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes',
  'React Native', 'Vue.js', 'Angular', 'Django', 'Flask',
  'GraphQL', 'REST API', 'Git', 'CI/CD', 'Testing',
];

const complexityLevels = [
  { value: 'simple', label: 'Simple', description: 'Basic functionality, straightforward requirements' },
  { value: 'moderate', label: 'Moderate', description: 'Medium complexity, some integrations needed' },
  { value: 'complex', label: 'Complex', description: 'Advanced features, multiple integrations' },
];

export default function CreateProject() {
  const { user } = useAuth();
  const { createProject } = useData();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    skills_required: [] as string[],
    complexity: 'moderate',
    client_budget: '',
    duration_weeks: '',
    requirements: '',
    deliverables: '',
    prefer_consultation: false,
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills_required: prev.skills_required.includes(skill)
        ? prev.skills_required.filter(s => s !== skill)
        : [...prev.skills_required, skill],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.title && formData.description && formData.category;
      case 2:
        return formData.skills_required.length > 0 && formData.complexity;
      case 3:
        return formData.client_budget && formData.duration_weeks;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    if (!user) return;

    const project = createProject({
      title: formData.title,
      description: formData.description,
      client_id: user.id,
      client_name: user.name,
      status: formData.prefer_consultation ? 'draft' : 'pending_review',
      category: formData.category,
      skills_required: formData.skills_required,
      client_budget: parseInt(formData.client_budget),
      duration_weeks: parseInt(formData.duration_weeks),
      priority: 'medium',
      complexity: formData.complexity as 'simple' | 'moderate' | 'complex',
    });

    toast.success(
      formData.prefer_consultation
        ? 'Project saved! We\'ll contact you to schedule a consultation.'
        : 'Project submitted successfully! Our team will review it shortly.'
    );
    
    navigate('/client/projects');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl mb-2">Project Details</h2>
              <p className="text-gray-600">Tell us about your project</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., E-commerce Website for Fashion Store"
                  value={formData.title}
                  onChange={e => updateFormData('title', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="description">Project Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project in detail. What are you trying to build? What problem does it solve?"
                  rows={6}
                  value={formData.description}
                  onChange={e => updateFormData('description', e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Be as detailed as possible. This helps us match you with the right freelancers.
                </p>
              </div>

              <div>
                <Label htmlFor="category">Project Category *</Label>
                <Select value={formData.category} onValueChange={val => updateFormData('category', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="requirements">Specific Requirements (Optional)</Label>
                <Textarea
                  id="requirements"
                  placeholder="List any specific requirements, features, or functionalities"
                  rows={4}
                  value={formData.requirements}
                  onChange={e => updateFormData('requirements', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl mb-2">Technical Requirements</h2>
              <p className="text-gray-600">Select skills and complexity level</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Required Skills *</Label>
                <p className="text-sm text-gray-500 mb-3">
                  Select all relevant skills (you can select multiple)
                </p>
                <div className="flex flex-wrap gap-2">
                  {commonSkills.map(skill => {
                    const isSelected = formData.skills_required.includes(skill);
                    return (
                      <Badge
                        key={skill}
                        variant={isSelected ? 'default' : 'outline'}
                        className="cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => toggleSkill(skill)}
                      >
                        {isSelected && <Check className="size-3 mr-1" />}
                        {skill}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label>Project Complexity *</Label>
                <div className="grid gap-3 mt-2">
                  {complexityLevels.map(level => (
                    <Card
                      key={level.value}
                      className={`p-4 cursor-pointer transition-colors ${
                        formData.complexity === level.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:border-gray-400'
                      }`}
                      onClick={() => updateFormData('complexity', level.value)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{level.label}</h4>
                          <p className="text-sm text-gray-600">{level.description}</p>
                        </div>
                        {formData.complexity === level.value && (
                          <Check className="size-5 text-blue-600" />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl mb-2">Budget & Timeline</h2>
              <p className="text-gray-600">Set your budget and expected timeline</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="budget">Project Budget (₹) *</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="50000"
                  value={formData.client_budget}
                  onChange={e => updateFormData('client_budget', e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  This is your total budget including all milestones and our service fees
                </p>
              </div>

              <div>
                <Label htmlFor="duration">Expected Duration (weeks) *</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="8"
                  value={formData.duration_weeks}
                  onChange={e => updateFormData('duration_weeks', e.target.value)}
                />
              </div>

              <Card className="p-4 bg-blue-50 border-blue-200">
                <h4 className="font-medium mb-2">Budget Breakdown Estimate</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Freelancer Payment:</span>
                    <span className="font-medium">
                      ₹{formData.client_budget ? Math.floor(parseInt(formData.client_budget) * 0.85).toLocaleString() : '0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Service Fee (15%):</span>
                    <span className="font-medium">
                      ₹{formData.client_budget ? Math.floor(parseInt(formData.client_budget) * 0.15).toLocaleString() : '0'}
                    </span>
                  </div>
                  <div className="border-t border-blue-300 pt-1 mt-1 flex justify-between">
                    <span>Total:</span>
                    <span className="font-medium">
                      ₹{formData.client_budget ? parseInt(formData.client_budget).toLocaleString() : '0'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  *This is an estimate. Final breakdown will be confirmed by our team.
                </p>
              </Card>

              <div>
                <Label htmlFor="deliverables">Expected Deliverables (Optional)</Label>
                <Textarea
                  id="deliverables"
                  placeholder="What do you expect to receive at the end of the project? (e.g., source code, documentation, deployment)"
                  rows={4}
                  value={formData.deliverables}
                  onChange={e => updateFormData('deliverables', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl mb-2">Review & Submit</h2>
              <p className="text-gray-600">Review your project details before submitting</p>
            </div>

            <Card className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">{formData.title}</h3>
                <p className="text-gray-600">{formData.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{formData.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Complexity</p>
                  <p className="font-medium capitalize">{formData.complexity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="font-medium">₹{parseInt(formData.client_budget).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">{formData.duration_weeks} weeks</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {formData.skills_required.map(skill => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="consultation"
                  checked={formData.prefer_consultation}
                  onCheckedChange={(checked) => updateFormData('prefer_consultation', checked)}
                />
                <div className="flex-1">
                  <Label htmlFor="consultation" className="cursor-pointer">
                    I'd like a free consultation before proceeding
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Our team will help refine your requirements and provide a detailed proposal
                  </p>
                </div>
              </div>
            </Card>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">What happens next?</h4>
              <ol className="text-sm text-gray-600 space-y-2">
                <li className="flex gap-2">
                  <span className="font-medium">1.</span>
                  <span>Our admin team reviews your project (within 24 hours)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">2.</span>
                  <span>We refine the scope and create milestones</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">3.</span>
                  <span>Handpicked freelancers submit proposals</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">4.</span>
                  <span>We recommend the best match and you approve</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">5.</span>
                  <span>Work begins with milestone-based payments</span>
                </li>
              </ol>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const steps = [
    { number: 1, title: 'Details', icon: <FileText className="size-4" /> },
    { number: 2, title: 'Technical', icon: <Settings className="size-4" /> },
    { number: 3, title: 'Budget', icon: <DollarSign className="size-4" /> },
    { number: 4, title: 'Review', icon: <Check className="size-4" /> },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/client/dashboard')}>
            <ArrowLeft className="size-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl">Create New Project</h1>
            <p className="text-gray-600">Submit a project and get matched with expert freelancers</p>
          </div>
        </div>

        {/* Progress Steps */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            {steps.map((s, index) => (
              <div key={s.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`size-10 rounded-full flex items-center justify-center transition-colors ${
                      step > s.number
                        ? 'bg-green-600 text-white'
                        : step === s.number
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step > s.number ? <Check className="size-5" /> : s.icon}
                  </div>
                  <p className={`text-sm mt-2 ${step >= s.number ? 'font-medium' : 'text-gray-500'}`}>
                    {s.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 rounded ${step > s.number ? 'bg-green-600' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
          <Progress value={(step / steps.length) * 100} className="h-2" />
        </Card>

        {/* Form Content */}
        <Card className="p-6">
          {renderStep()}
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
          >
            <ArrowLeft className="size-4 mr-2" />
            Previous
          </Button>

          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="size-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} size="lg">
              Submit Project
              <Check className="size-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
