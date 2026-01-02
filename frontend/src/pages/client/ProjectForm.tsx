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
import { ArrowLeft, ArrowRight, Check, Calendar, IndianRupee, FileText, Settings, Plus, X, Phone, Upload, FileImage, FileArchive, FileSpreadsheet } from 'lucide-react';
import { toast } from '../../utils/toast';
import { categories, commonSkills, projectTypes, projectPriorities } from '../../constants/projectConstants';
import { RichTextViewer } from '../../components/common';
import { Chip } from '@mui/material';
import { validateProjectTitle, validateProjectDescription, validateBudget, validateDuration, VALIDATION_MESSAGES, validateMaxLength } from '../../constants/validationConstants';
import { requestConsultation } from '../../services/projectService';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { formatFileSize, getFileIcon, openFileInNewTab } from '../../utils/file';
import API_CONFIG from '../../config/api';

interface ProjectFormProps {
  mode?: 'create' | 'edit';
}

export default function ProjectForm({ mode = 'create' }: ProjectFormProps) {
  const { user } = useAuth();
  const { createProject, getProject, updateProject } = useData();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [step, setStep] = useState(1);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([1]));
  const formContentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consultationLoading, setConsultationLoading] = useState(false);
  const [loading, setLoading] = useState(mode === 'edit');
  const [submitting, setSubmitting] = useState(false);
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
    attachments: [] as File[],
  });
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Load project data for edit mode
  useEffect(() => {
    if (mode === 'edit' && id) {
      const loadProject = async () => {
        try {
          const project = await getProject(id);
          if (project) {
              setFormData({
                title: project.title || '',
                description: project.description || '',
                category: project.category || '',
                project_type: project.project_type || '',
                priority: project.priority || 'medium',
                client_budget: project.client_budget?.toString() || '',
                duration_weeks: project.duration_weeks?.toString() || '',
                negotiable: project.isNegotiableBudget || false,
                skills_required: project.skills_required || [],
                attachments: [], // New attachments will be added here
              });
            setExistingAttachments(project.attachments || []);
          }
        } catch (error) {
          console.error('Failed to load project:', error);
          toast.error('Failed to load project');
          navigate('/client/projects');
        } finally {
          setLoading(false);
        }
      };
      loadProject();
    }
  }, [mode, id, getProject, navigate]);

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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const validFiles: File[] = [];
    Array.from(files).forEach(file => {
      if (file.size <= 10 * 1024 * 1024) { // 10MB
        validFiles.push(file);
      } else {
        toast.error(`${file.name} is too large. Max size is 10MB.`);
      }
    });

    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...validFiles]
      }));
      toast.success(`${validFiles.length} file(s) added successfully`);
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const removeExistingAttachment = (index: number) => {
    setExistingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const validateStep = (stepNumber: number): boolean => {
    const stepErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      const titleResult = validateProjectTitle(formData.title);
      if (!titleResult.isValid) stepErrors.title = titleResult.error || VALIDATION_MESSAGES.PROJECT_TITLE.REQUIRED;

      const descResult = validateProjectDescription(formData.description);
      if (!descResult.isValid) stepErrors.description = descResult.error || VALIDATION_MESSAGES.PROJECT_DESCRIPTION.REQUIRED;

      if (!formData.category) stepErrors.category = VALIDATION_MESSAGES.PROJECT_CATEGORY.REQUIRED;
      if (!formData.project_type) stepErrors.project_type = VALIDATION_MESSAGES.PROJECT_TYPE.REQUIRED;

      setErrors(stepErrors);
      return Object.keys(stepErrors).length === 0;
    } else if (stepNumber === 2) {
      const budgetResult = validateBudget(formData.client_budget);
      if (!budgetResult.isValid) stepErrors.client_budget = budgetResult.error || VALIDATION_MESSAGES.PROJECT_BUDGET.REQUIRED;

      const durationResult = validateDuration(formData.duration_weeks);
      if (!durationResult.isValid) stepErrors.duration_weeks = durationResult.error || VALIDATION_MESSAGES.PROJECT_DURATION.REQUIRED;

      if (!formData.priority) stepErrors.priority = VALIDATION_MESSAGES.PROJECT_PRIORITY.REQUIRED;

      setErrors(stepErrors);
      return Object.keys(stepErrors).length === 0;
    } else if (stepNumber === 3) {
      if (formData.skills_required.length === 0) {
        stepErrors.skills_required = VALIDATION_MESSAGES.PROJECT_SKILLS.MIN_COUNT;
        setErrors(stepErrors);
        return false;
      }
      setErrors({});
      return true;
    }
    setErrors({});
    return true;
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
      case 5:
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
    if (canProceed() && step < 5) {
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

  const handleRequestConsultation = async () => {
    if (!user) {
      toast.error('Please log in to request a consultation');
      return;
    }

    setConsultationLoading(true);
    try {
      const consultationData: {
        projectTitle?: string;
        projectDescription?: string;
        projectBudget?: string;
        projectTimeline?: string;
        projectCategory?: string;
        message?: string;
      } = {};

      if (formData.title) consultationData.projectTitle = formData.title;
      if (formData.description) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = formData.description;
        consultationData.projectDescription = tempDiv.textContent || tempDiv.innerText || '';
      }
      if (formData.client_budget) consultationData.projectBudget = `₹${formData.client_budget}`;
      if (formData.duration_weeks) consultationData.projectTimeline = `${formData.duration_weeks} weeks`;
      if (formData.category) consultationData.projectCategory = formData.category;

      consultationData.message = `Consultation request for project: ${formData.title || 'New Project'}`;

      await requestConsultation(consultationData);
      toast.success('Consultation request sent successfully! Our team will contact you shortly.');
    } catch (error: any) {
      console.error('Failed to request consultation:', error);
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to send consultation request';
      toast.error(errorMessage);
    } finally {
      setConsultationLoading(false);
    }
  };

  const handleSubmit = async (status: string) => {
    if (!user) return;

    for (let i = 1; i <= 3; i++) {
      if (!validateStep(i)) {
        const firstError = Object.values(errors)[0];
        if (firstError) toast.error(firstError);
        setStep(i);
        return;
      }
    }

    setSubmitting(true);
    try {
      const budget = parseInt(formData.client_budget);
      
      if (mode === 'edit' && id) {
        await updateProject(id, {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          skills_required: formData.skills_required,
          budget: budget,
          client_budget: budget,
          duration_weeks: parseInt(formData.duration_weeks),
          priority: formData.priority as 'low' | 'medium' | 'high',
          complexity: 'moderate',
          requirements: false,
          timeline: `${formData.duration_weeks} weeks`,
          isNegotiableBudget: formData.negotiable,
          project_type: formData.project_type,
          attachments: [...existingAttachments, ...formData.attachments],
        });
        toast.success('Project updated successfully!');
      } else {
        await createProject({
          title: formData.title,
          description: formData.description,
          client_id: user.id,
          client_name: user.name,
          status: status === "draft" ? "draft" : "active",
          category: formData.category,
          skills_required: formData.skills_required,
          budget: budget,
          client_budget: budget,
          duration_weeks: parseInt(formData.duration_weeks),
          priority: formData.priority as 'low' | 'medium' | 'high',
          complexity: 'moderate',
          requirements: false,
          timeline: `${formData.duration_weeks} weeks`,
          isNegotiableBudget: formData.negotiable,
          project_type: formData.project_type,
          attachments: formData.attachments,
        });
        const successMessage = status === 'draft'
          ? 'Project saved as draft successfully!'
          : 'Project submitted successfully! Our team will review it shortly.';
        toast.success(successMessage);
      }

      navigate('/client/projects');
    } catch (error: any) {
      console.error('Failed to submit project:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return (
          <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., E-commerce Website for Fashion Store"
                    value={formData.title}
                    onChange={e => {
                      const val = e.target.value;
                      updateFormData('title', val);
                      if (val.length === 50) {
                        setErrors({ ...errors, title: 'Project title cannot exceed 50 characters (maximum reached)' });
                      } else if (errors.title) {
                        setErrors({ ...errors, title: '' });
                      }
                    }}
                    className={errors.title ? 'border-red-500' : ''}
                    maxLength={50}
                  />
                  {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
                </div>
                <div>
                  <Label htmlFor="category">Project Category *</Label>
                  <Select value={formData.category} onValueChange={val => {
                    updateFormData('category', val);
                    if (errors.category) setErrors({ ...errors, category: '' });
                  }}>
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Project Description *</Label>
                <RichTextEditor
                  key={`description-${mode}-${id}`} // Force re-render when switching modes or loading different project
                  value={formData.description}
                  onChange={(value) => {
                    updateFormData('description', value);
                    if (errors.description) setErrors({ ...errors, description: '' });
                  }}
                  placeholder="Describe your project in detail. What are you trying to build? What problem does it solve?"
                  className={`mt-1 ${errors.description ? 'border-red-500' : ''}`}
                  minHeight="200px"
                />
                {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
                <p className="text-sm text-gray-500 mt-1">
                  Be as detailed as possible. This helps us match you with the right freelancers.
                </p>
              </div>

              <div>
                <Label>Project Type *</Label>
                <RadioGroup
                  value={formData.project_type}
                  onValueChange={(val) => {
                    updateFormData('project_type', val);
                    if (errors.project_type) setErrors({ ...errors, project_type: '' });
                  }}
                  className="grid gap-3 mt-2"
                >
                  {projectTypes.map(type => (
                    <label
                      key={type.value}
                      htmlFor={`project-type-${type.value}`}
                      className={`flex items-center gap-3 p-4 border rounded-md cursor-pointer transition-colors ${formData.project_type === type.value ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'}`}
                    >
                      <RadioGroupItem value={type.value} id={`project-type-${type.value}`} className="mt-0" />
                      <div className="flex-1">
                        <h4 className="font-medium">{type.label}</h4>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
                {errors.project_type && <p className="text-sm text-red-600 mt-1">{errors.project_type}</p>}
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
                    onChange={e => {
                      updateFormData('client_budget', e.target.value);
                      if (errors.client_budget) setErrors({ ...errors, client_budget: '' });
                    }}
                    className={errors.client_budget ? 'border-red-500' : ''}
                  />
                  {errors.client_budget && <p className="text-sm text-red-600 mt-1">{errors.client_budget}</p>}
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
                    onChange={e => {
                      updateFormData('duration_weeks', e.target.value);
                      if (errors.duration_weeks) setErrors({ ...errors, duration_weeks: '' });
                    }}
                    className={errors.duration_weeks ? 'border-red-500' : ''}
                  />
                  {errors.duration_weeks && <p className="text-sm text-red-600 mt-1">{errors.duration_weeks}</p>}
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
                <RadioGroup
                  value={formData.priority}
                  onValueChange={(val) => {
                    updateFormData('priority', val);
                    if (errors.priority) setErrors({ ...errors, priority: '' });
                  }}
                  className="grid gap-3 mt-2"
                >
                  {projectPriorities.map(priority => (
                    <label
                      key={priority.value}
                      htmlFor={`priority-${priority.value}`}
                      className={`flex items-center gap-3 p-4 border rounded-md cursor-pointer transition-colors ${formData.priority === priority.value
                        ? 'border-blue-500 bg-blue-50'
                        : errors.priority ? 'border-red-300 hover:border-red-400'
                          : 'hover:border-gray-400'
                        }`}
                    >
                      <RadioGroupItem value={priority.value} id={`priority-${priority.value}`} className="mt-0" />
                      <div className="flex-1">
                        <h4 className="font-medium">{priority.label}</h4>
                        <p className="text-sm text-gray-600">{priority.description}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
                {errors.priority && <p className="text-sm text-red-600 mt-1">{errors.priority}</p>}
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

                <div>
                  <p className="text-sm text-gray-500 mb-2">Select from common skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {commonSkills.map(skill => {
                      const isSelected = formData.skills_required.includes(skill);
                      return (
                        <Chip
                          key={skill}
                          variant={isSelected ? 'filled' : 'outlined'}
                          label={
                            <span className="flex items-center">
                              {isSelected && <Check className="size-3 mr-1" />}
                              {skill}
                            </span>
                          }
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => toggleSkill(skill)}
                        />
                      );
                    })}
                  </div>
                </div>

                {formData.skills_required.length === 0 && (
                  <p className="text-sm text-red-500 mt-2">Please select or add at least one skill</p>
                )}
                {formData.skills_required.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Selected Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills_required.map(skill => (
                        <Chip
                          key={skill}
                          label={
                            <span className="flex items-center gap-1">
                              {skill}
                              <X className="size-3" />
                            </span>
                          }
                          className="cursor-pointer hover:bg-blue-700 transition-colors"
                          onClick={() => toggleSkill(skill)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl mb-2">Project Attachments</h2>
              <p className="text-gray-600">Upload any relevant documents, images, or specifications (Max 10MB each)</p>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="p-4 bg-gray-100 rounded-full">
                  <Upload className="size-8 text-gray-500" />
                </div>
                <div>
                  <p className="text-lg font-medium">Drag & drop files here</p>
                  <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                </div>
                <Input
                  type="file"
                  multiple
                  className="hidden"
                  id="file-upload"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFiles(e.target.files);
                    }
                    e.target.value = '';
                  }}
                />
                <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                  Select Files
                </Button>
                <p className="text-xs text-gray-400 mt-2">Max file size: 10MB • pdf, doc, docx, jpg, png, jpeg, txt, zip, ppt, pptx, xlsx, xls, csv</p>
              </div>
            </div>

            {(mode === 'edit' && existingAttachments.length > 0) && (
              <div className="space-y-3">
                <h3 className="font-medium">Existing Attachments ({existingAttachments.length})</h3>
                <div className="grid gap-3">
                  {existingAttachments.map((att, index) => {
                    const { Icon, color, bg } = getFileIcon(att.name || att.originalName || att.fileName || 'file');
                    const url = `${API_CONFIG.API_URL.replace('/api', '')}${att.url || att.fileUrl || ''}`;
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-md shadow-sm">
                        <div
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.open(url, '_blank', 'noopener,noreferrer'); } }}
                          role="button"
                          tabIndex={0}
                          title="Open in new tab"
                        >
                          <div className={`p-2 ${bg} rounded`}>
                            <Icon className={`size-4 ${color}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium truncate max-w-[200px] group-hover:underline">{att.name || att.originalName || att.fileName || 'Attachment'}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(att.size || att.fileSize || att.compressedSize || 0)}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeExistingAttachment(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          <X className="size-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {formData.attachments.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium">New Attachments ({formData.attachments.length})</h3>
                <div className="grid gap-3">
                  {formData.attachments.map((file, index) => {
                    const { Icon, color, bg } = getFileIcon(file.name);
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-md shadow-sm">
                        <div
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => openFileInNewTab(file)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFileInNewTab(file); } }}
                          role="button"
                          tabIndex={0}
                          title="Open in new tab"
                        >
                          <div className={`p-2 ${bg} rounded`}>
                            <Icon className={`size-4 ${color}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium truncate max-w-[200px] group-hover:underline">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          <X className="size-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl mb-2">Review & Submit</h2>
              <p className="text-gray-600">Review your project details before submitting</p>
            </div>

            <Card className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">{formData.title}</h3>
                <div className="text-gray-600"><RichTextViewer content={formData.description || ''} /></div>
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
                {((mode === 'edit' && existingAttachments.length > 0) || formData.attachments.length > 0) && (
                  <div>
                    <p className="text-sm text-gray-500">Attachments</p>
                    <p className="font-medium">
                      {(mode === 'edit' ? existingAttachments.length : 0) + formData.attachments.length} file{((mode === 'edit' ? existingAttachments.length : 0) + formData.attachments.length) !== 1 ? 's' : ''}
                      {mode === 'edit' && existingAttachments.length > 0 && formData.attachments.length > 0 && (
                        <span className="text-xs text-gray-500 ml-1">
                          ({existingAttachments.length} existing, {formData.attachments.length} new)
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {formData.skills_required.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills_required.map(skill => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  const steps = [
    { number: 1, title: 'Details', icon: <FileText className="size-4" /> },
    { number: 2, title: 'Budget', icon: <IndianRupee className="size-4" /> },
    { number: 3, title: 'Tech-Stacks', icon: <Settings className="size-4" /> },
    { number: 4, title: 'Attachments', icon: <Upload className="size-4" /> },
    { number: 5, title: 'Review', icon: <Check className="size-4" /> },
  ];
  return (
    <DashboardLayout>
      <div className="max-w-8xl mx-auto p-6">
               {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4 mr-2" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl">{mode === 'edit' ? "Edit Project" : "Create New Project"}</h1>
            <p className="text-gray-600">Submit a project and get matched with expert freelancers</p>
          </div>
          <Button
            variant="default"
            onClick={handleRequestConsultation}
            disabled={consultationLoading}
          >
            <Phone className="size-4 mr-2" />
            {consultationLoading ? 'Sending...' : 'Consultation'}
          </Button>
        </div>



        <div className="flex items-center justify-between mb-4">
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
        <div
          ref={containerRef}
          className="relative"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            ref={formContentRef}
            className={`transition-all duration-300 ease-in-out ${
              isTransitioning ? 'opacity-50 transform scale-95' : 'opacity-100 transform scale-100'
            }`}
          >
            {renderStep(step)}
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {step < 5 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-4">
              <Button
                onClick={() => handleSubmit('draft')}
                variant="outline"
                className="flex-1"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save as Draft'}
              </Button>
              <Button
                onClick={() => handleSubmit('active')}
                className="flex-1"
                disabled={submitting}
              >
                {submitting ? (mode === 'edit' ? 'Updating...' : 'Submitting...') : (mode === 'edit' ? 'Update Project' : 'Submit Project')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
