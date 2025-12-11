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
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Calendar, DollarSign, FileText, Settings, Plus, X, Phone } from 'lucide-react';
import { toast } from '../../utils/toast';
import { categories, commonSkills, projectTypes, projectPriorities } from '../../constants/projectConstants';

export default function CreateProject() {
  const { user } = useAuth();
  const { createProject } = useData();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([1]));
  const formContentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');
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
        return formData.title && formData.description && formData.category && formData.project_type;
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
    
    // Validation: can only go forward if current step is valid
    if (newStep > step && !skipValidation && !canProceed()) {
      return;
    }
    
    // Can go back to any visited step, or forward if validation passes
    if (newStep <= step || visitedSteps.has(newStep) || (newStep === step + 1 && canProceed())) {
      setIsTransitioning(true);
      setStep(newStep);
      setVisitedSteps(prev => new Set([...prev, newStep]));
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300); // Match CSS transition duration
    }
  };

  const handleStepChange = (newStep: number) => {
    changeStep(newStep, true); // Allow clicking on visited steps
  };

  const handleNext = () => {
    if (canProceed() && step < 4) {
      changeStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      changeStep(step - 1, true);
    }
  };

  // Throttled scroll handler
  const handleWheel = (e: WheelEvent) => {
    if (isTransitioning || scrollTimeoutRef.current) return;
    
    e.preventDefault();
    
    scrollTimeoutRef.current = setTimeout(() => {
      scrollTimeoutRef.current = null;
    }, 500); // Throttle: 500ms between scroll actions
    
    const deltaY = e.deltaY;
    
    if (deltaY > 0) {
      // Scrolling down - go to next step
      if (canProceed() && step < 4) {
        handleNext();
      }
    } else if (deltaY < 0) {
      // Scrolling up - go to previous step
      if (step > 1) {
        handleBack();
      }
    }
  };

  // Touch swipe handlers
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
    
    // Minimum swipe distance and maximum time
    const minSwipeDistance = 50;
    const maxSwipeTime = 300;
    
    // Check if it's a vertical swipe (more vertical than horizontal)
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minSwipeDistance && deltaTime < maxSwipeTime) {
      if (deltaY < 0) {
        // Swipe up - go to next step
        if (canProceed() && step < 4) {
          handleNext();
        }
      } else {
        // Swipe down - go to previous step
        if (step > 1) {
          handleBack();
        }
      }
    }
    
    touchStartRef.current = null;
  };

  // Add wheel event listener
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

  const handleSubmit = async () => {
    if (!user) return;

    try {
    const budget = parseInt(formData.client_budget);
      const project = await createProject({
      title: formData.title,
      description: formData.description,
      client_id: user.id,
      client_name: user.name,
      status: 'pending_review',
      category: formData.category,
      skills_required: formData.skills_required,
      budget: budget,
      client_budget: budget,
      duration_weeks: parseInt(formData.duration_weeks),
      priority: formData.priority as 'low' | 'medium' | 'high',
      complexity: 'moderate', // Default value, can be updated later
      requirements: false, // Default value
        timeline: `${formData.duration_weeks} weeks`,
        isNegotiableBudget: formData.negotiable,
    });

    toast.success('Project submitted successfully! Our team will review it shortly.');
    
    navigate('/client/projects');
    } catch (error: any) {
      // Error is already handled in DataContext with toast
      console.error('Failed to create project:', error);
    }
  };

  const renderStep = (stepNumber: number) => {
    switch (stepNumber) {
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
                <Label>Project Type *</Label>
                <div className="grid gap-3 mt-2">
                  {projectTypes.map(type => (
                    <Card
                      key={type.value}
                      className={`p-4 cursor-pointer transition-colors ${
                        formData.project_type === type.value
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
              <p className="text-gray-600">Set your budget and expected timeline</p>
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
                      className={`p-4 cursor-pointer transition-colors ${
                        formData.priority === priority.value
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
              <p className="text-gray-600">Select the technologies and skills needed for your project</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Required Skills *</Label>
                <p className="text-sm text-gray-500 mb-3">
                  Select from the list below or create new skills
                </p>
                
                {/* Add New Skill Input */}
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

                {/* Selected Skills Display */}
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

                {/* Predefined Skills */}
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
    { number: 2, title: 'Budget', icon: <DollarSign className="size-4" /> },
    { number: 3, title: 'Tech-Stacks', icon: <Settings className="size-4" /> },
    { number: 4, title: 'Review', icon: <Check className="size-4" /> },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/client/projects')}>
            <ArrowLeft className="size-4 mr-2" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl">Create New Project</h1>
            <p className="text-gray-600">Submit a project and get matched with expert freelancers</p>
          </div>
          <Button variant="default" onClick={() => alert('Consultation request Send successfully')}>
            <Phone className="size-4 mr-2" />
            Consultation
          </Button>
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
                      className={`size-10 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
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
                  // Only show steps that are unlocked (visited or current step)
                  return visitedSteps.has(stepNum) || stepNum === step;
                })
                .map((stepNum) => {
                  const isCurrentStep = stepNum === step;
                  const unlockedSteps = [1, 2, 3, 4].filter(s => visitedSteps.has(s) || s === step);
                  const currentIndex = unlockedSteps.indexOf(step);
                  
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
                        {/* Navigation Buttons - only show for current step */}
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
                              <Button onClick={handleSubmit} size="lg" disabled={isTransitioning}>
                                Submit Project
                                <Check className="size-4 ml-2" />
                              </Button>
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
