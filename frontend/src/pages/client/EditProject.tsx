import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { RichTextEditor } from '../../components/common/RichTextEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Calendar, IndianRupee, FileText, Settings, Plus, X, Phone } from 'lucide-react';
import { toast } from '../../utils/toast';
import { categories, commonSkills, projectTypes, projectPriorities } from '../../constants/projectConstants';
import { validateProjectTitle, validateProjectDescription, validateBudget, validateDuration, VALIDATION_MESSAGES } from '../../constants/validationConstants';

export default function EditProject() {
  const { user } = useAuth();
  const { getProject, updateProject } = useData();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([1]));
  const formContentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    project_type: '',
    priority: 'medium',
    client_budget: '',
    duration_weeks: '',
    negotiable: false,
    skills_required: [] as string[],
    status: '',
  });

  // Load project data
  useEffect(() => {
    const loadProject = async () => {
      if (!id) {
        toast.error('Project ID is required');
        navigate('/client/projects');
        return;
      }

      try {
        setLoading(true);
        const project = await getProject(id);

        if (!project) {
          toast.error('Project not found');
          navigate('/client/projects');
          return;
        }

        // Pre-fill form with project data
        setFormData({
          title: project.title || '',
          description: project.description || '',
          category: project.category || '',
          project_type: '', // This might not be in the project model
          priority: project.priority || 'medium',
          client_budget: project.budget?.toString() || project.client_budget?.toString() || '',
          duration_weeks: project.duration_weeks?.toString() || (project.timeline ? project.timeline.replace(' weeks', '').replace(' weeks', '') : ''),
          negotiable: project.isNegotiableBudget || false,
          skills_required: project.skills_required || [],
          status: project.status || '',
        });
      } catch (error: any) {
        console.error('Failed to load project:', error);
        toast.error('Failed to load project');
        navigate('/client/projects');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id, getProject, navigate]);

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

  const addNewSkill = () => {
    const trimmedSkill = newSkillInput.trim();
    if (trimmedSkill && !formData.skills_required.includes(trimmedSkill)) {
      setFormData(prev => ({
        ...prev,
        skills_required: [...prev.skills_required, trimmedSkill],
      }));
      setNewSkillInput('');
    }
  };

  const handleNewSkillKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNewSkill();
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.title && formData.description && formData.category;
      case 2:
        return formData.client_budget && formData.duration_weeks && formData.priority;
      case 3:
        return formData.skills_required.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const changeStep = (newStep: number, skipValidation = false) => {
    if (isTransitioning) return;

    if (newStep > step && !skipValidation && !canProceed()) {
      return;
    }

    if (newStep <= step || visitedSteps.has(newStep) || (newStep === step + 1 && canProceed())) {
      setIsTransitioning(true);
      setStep(newStep);
      setVisitedSteps(prev => new Set([...prev, newStep]));

      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleStepChange = (newStep: number) => {
    changeStep(newStep, true);
  };

  const handleNext = () => {
    if (!validateStep(step)) {
      const firstError = Object.values(errors)[0];
      if (firstError) toast.error(firstError);
      return;
    }
    if (canProceed() && step < 4) {
      changeStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      changeStep(step - 1, true);
    }
  };

  const handleWheel = (e: WheelEvent) => {
    if (isTransitioning || scrollTimeoutRef.current) return;

    e.preventDefault();

    scrollTimeoutRef.current = setTimeout(() => {
      scrollTimeoutRef.current = null;
    }, 500);

    const deltaY = e.deltaY;

    if (deltaY > 0) {
      if (canProceed() && step < 4) {
        handleNext();
      }
    } else if (deltaY < 0) {
      if (step > 1) {
        handleBack();
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || isTransitioning) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now(),
    };

    const deltaX = touchEnd.x - touchStartRef.current.x;
    const deltaY = touchEnd.y - touchStartRef.current.y;
    const deltaTime = touchEnd.time - touchStartRef.current.time;

    const minSwipeDistance = 50;
    const maxSwipeTime = 300;

    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minSwipeDistance && deltaTime < maxSwipeTime) {
      if (deltaY < 0) {
        if (canProceed() && step < 4) {
          handleNext();
        }
      } else {
        if (step > 1) {
          handleBack();
        }
      }
    }

    touchStartRef.current = null;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const wheelHandler = (e: WheelEvent) => handleWheel(e);
    container.addEventListener('wheel', wheelHandler, { passive: false });

    return () => {
      container.removeEventListener('wheel', wheelHandler);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [step, isTransitioning]);

  const validateForm = (): boolean => {
    const formErrors: Record<string, string> = {};

    // Validate title
    const titleResult = validateProjectTitle(formData.title);
    if (!titleResult.isValid) formErrors.title = titleResult.error || VALIDATION_MESSAGES.PROJECT_TITLE.REQUIRED;

    // Validate description
    const descResult = validateProjectDescription(formData.description);
    if (!descResult.isValid) formErrors.description = descResult.error || VALIDATION_MESSAGES.PROJECT_DESCRIPTION.REQUIRED;

    // Validate category
    if (!formData.category) formErrors.category = VALIDATION_MESSAGES.PROJECT_CATEGORY.REQUIRED;

    // Validate budget
    const budgetResult = validateBudget(formData.client_budget);
    if (!budgetResult.isValid) formErrors.client_budget = budgetResult.error || VALIDATION_MESSAGES.PROJECT_BUDGET.REQUIRED;

    // Validate duration
    const durationResult = validateDuration(formData.duration_weeks);
    if (!durationResult.isValid) formErrors.duration_weeks = durationResult.error || VALIDATION_MESSAGES.PROJECT_DURATION.REQUIRED;

    // Validate skills
    if (formData.skills_required.length === 0) formErrors.skills_required = VALIDATION_MESSAGES.PROJECT_SKILLS.MIN_COUNT;

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (targetStatus?: string) => {
    if (!user || !id) return;

    if (!validateForm()) {
      const firstError = Object.values(errors)[0];
      if (firstError) toast.error(firstError);
      return;
    }

    try {
      const budget = parseInt(formData.client_budget);
      const updateData: any = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        skills_required: formData.skills_required,
        budget: budget,
        client_budget: budget,
        duration_weeks: parseInt(formData.duration_weeks),
        priority: formData.priority as 'low' | 'medium' | 'high',
        timeline: `${formData.duration_weeks} weeks`,
        isNegotiableBudget: formData.negotiable,
      };

      if (targetStatus) {
        updateData.status = targetStatus;
      }

      await updateProject(id, updateData);

      toast.success('Project updated successfully!');

      navigate(`/client/projects/${id}`);
    } catch (error: any) {
      console.error('Failed to update project:', error);
    }
  };

  const renderStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl mb-2">Project Details</h2>
              <p className="text-gray-600">Update your project information</p>
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
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => updateFormData('description', value)}
                  placeholder="Describe your project in detail. What are you trying to build? What problem does it solve?"
                  className="mt-1"
                  minHeight="200px"
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
                <Label>Project Type</Label>
                <div className="grid gap-3 mt-2">
                  {projectTypes.map(type => (
                    <Card
                      key={type.value}
                      className={`p-4 cursor-pointer transition-colors ${formData.project_type === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:border-gray-400'
                        }`}
                      onClick={() => updateFormData('project_type', type.value)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{type.label}</h4>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </div>
                        {formData.project_type === type.value && (
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

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl mb-2">Budget & Timeline</h2>
              <p className="text-gray-600">Update your budget and expected timeline</p>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
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
              </div>
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="negotiable"
                    checked={formData.negotiable}
                    onCheckedChange={(checked) => updateFormData('negotiable', checked)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="negotiable" className="cursor-pointer">
                      Budget and Timeline are Negotiable
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Check this if you're open to discussing budget and timeline with freelancers
                    </p>
                  </div>
                </div>
              </Card>
              <div>
                <Label>Project Priority *</Label>
                <div className="grid gap-3 mt-2">
                  {projectPriorities.map(priority => (
                    <Card
                      key={priority.value}
                      className={`p-4 cursor-pointer transition-colors ${formData.priority === priority.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:border-gray-400'
                        }`}
                      onClick={() => updateFormData('priority', priority.value)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{priority.label}</h4>
                          <p className="text-sm text-gray-600">{priority.description}</p>
                        </div>
                        {formData.priority === priority.value && (
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
              <h2 className="text-2xl mb-2">Required Tech-Stacks</h2>
              <p className="text-gray-600">Update the technologies and skills needed for your project</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Required Skills *</Label>
                <p className="text-sm text-gray-500 mb-3">
                  Select from the list below or create new skills
                </p>

                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Enter a new skill (e.g., Next.js, Tailwind CSS)"
                    value={newSkillInput}
                    onChange={e => setNewSkillInput(e.target.value)}
                    onKeyPress={handleNewSkillKeyPress}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={addNewSkill}
                    disabled={!newSkillInput.trim() || formData.skills_required.includes(newSkillInput.trim())}
                    variant="outline"
                  >
                    <Plus className="size-4 mr-2" />
                    Add
                  </Button>
                </div>

                {formData.skills_required.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Selected Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills_required.map(skill => (
                        <Badge
                          key={skill}
                          variant="default"
                          className="cursor-pointer hover:bg-blue-700 transition-colors flex items-center gap-1"
                          onClick={() => toggleSkill(skill)}
                        >
                          {skill}
                          <X className="size-3" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500 mb-2">Select from common skills:</p>
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

                {formData.skills_required.length === 0 && (
                  <p className="text-sm text-red-500 mt-2">Please select or add at least one skill</p>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl mb-2">Review & Update</h2>
              <p className="text-gray-600">Review your project details before updating</p>
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
                  <p className="text-sm text-gray-500">Project Type</p>
                  <p className="font-medium capitalize">
                    {projectTypes.find(t => t.value === formData.project_type)?.label || formData.project_type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Priority</p>
                  <p className="font-medium capitalize">{formData.priority}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="font-medium">
                    ₹{formData.client_budget ? parseInt(formData.client_budget).toLocaleString() : '0'}
                    {formData.negotiable && <span className="text-xs text-gray-500 ml-2">(Negotiable)</span>}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">
                    {formData.duration_weeks} weeks
                    {formData.negotiable && <span className="text-xs text-gray-500 ml-2">(Negotiable)</span>}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">Required Tech-Stacks</p>
                <div className="flex flex-wrap gap-2">
                  {formData.skills_required.length > 0 ? (
                    formData.skills_required.map(skill => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">No skills selected</p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const steps = [
    { number: 1, title: 'Details', icon: <FileText className="size-4" /> },
    { number: 2, title: 'Budget', icon: <IndianRupee className="size-4" /> },
    { number: 3, title: 'Tech-Stacks', icon: <Settings className="size-4" /> },
    { number: 4, title: 'Review', icon: <Check className="size-4" /> },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Loading project...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/client/projects/${id}`)}>
            <ArrowLeft className="size-4 mr-2" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl">Edit Project</h1>
            <p className="text-gray-600">Update your project details</p>
          </div>
        </div>

        {/* Progress Steps */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => {
              const isCompleted = step > s.number;
              const isCurrent = step === s.number;
              const isVisited = visitedSteps.has(s.number);
              const canClick = isVisited || isCurrent;

              return (
                <div key={s.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <button
                      type="button"
                      onClick={() => canClick && handleStepChange(s.number)}
                      disabled={!canClick}
                      className={`size-10 rounded-full flex items-center justify-center transition-all ${isCompleted
                        ? 'bg-green-600 text-white cursor-pointer hover:bg-green-700'
                        : isCurrent
                          ? 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700'
                          : isVisited
                            ? 'bg-gray-300 text-gray-600 cursor-pointer hover:bg-gray-400'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-50'
                        } ${canClick ? 'hover:scale-105' : ''}`}
                      title={canClick ? `Go to ${s.title}` : 'Complete previous steps first'}
                    >
                      {isCompleted ? <Check className="size-5" /> : s.icon}
                    </button>
                    <p className={`text-sm mt-2 ${step >= s.number ? 'font-medium' : 'text-gray-500'}`}>
                      {s.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 flex-1 mx-2 rounded transition-colors ${step > s.number ? 'bg-green-600' : 'bg-gray-200'}`}></div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Form Content */}
        <div
          ref={containerRef}
          className="overflow-hidden relative"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ height: '600px' }}
        >
          <Card ref={formContentRef} className="p-4 scroll-mt-4 h-full overflow-hidden">
            <div className="relative h-full">
              {[1, 2, 3, 4]
                .filter((stepNum) => {
                  return visitedSteps.has(stepNum) || stepNum === step;
                })
                .map((stepNum) => {
                  const isCurrentStep = stepNum === step;

                  return (
                    <div
                      key={stepNum}
                      className="w-full h-full overflow-y-auto absolute top-0 left-0 transition-all duration-300 ease-in-out"
                      style={{
                        height: '100%',
                        width: '100%',
                        transform: isCurrentStep
                          ? `translateY(0)`
                          : `translateY(${stepNum < step ? '-100%' : '100%'})`,
                        opacity: isCurrentStep ? 1 : 0,
                        pointerEvents: isCurrentStep ? 'auto' : 'none',
                        zIndex: isCurrentStep ? 10 : 1,
                      }}
                    >
                      <div className="space-y-6">
                        {renderStep(stepNum)}
                        {isCurrentStep && (
                          <div className="flex items-center justify-between pt-4 border-t">
                            <Button
                              variant="outline"
                              onClick={handleBack}
                              disabled={step === 1 || isTransitioning}
                            >
                              <ArrowLeft className="size-4 mr-2" />
                              Previous
                            </Button>

                            {step < 4 ? (
                              <Button
                                onClick={handleNext}
                                disabled={!canProceed() || isTransitioning}
                              >
                                Next
                                <ArrowRight className="size-4 ml-2" />
                              </Button>
                            ) : (
                              <div className="flex gap-2">
                                {(loading || !formData || (formData as any).status === 'draft') && (
                                  <>
                                    <Button onClick={() => handleSubmit('draft')} variant="outline" size="lg" disabled={isTransitioning}>
                                      Save as Draft
                                      <FileText className="size-4 ml-2" />
                                    </Button>
                                    <Button onClick={() => handleSubmit('active')} size="lg" disabled={isTransitioning}>
                                      Submit Project
                                      <Check className="size-4 ml-2" />
                                    </Button>
                                  </>
                                )}
                                {(formData as any).status !== 'draft' && (
                                  <Button onClick={() => handleSubmit()} size="lg" disabled={isTransitioning}>
                                    Update Project
                                    <Check className="size-4 ml-2" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

