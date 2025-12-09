import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  User, 
  Briefcase, 
  Award, 
  Target,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { toast } from '../../utils/toast';

const STEPS = [
  { id: 1, title: 'Profile Info', icon: User },
  { id: 2, title: 'Skills & Experience', icon: Briefcase },
  { id: 3, title: 'Portfolio', icon: Award },
  { id: 4, title: 'Preferences', icon: Target }
];

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Profile Info
  const [bio, setBio] = useState('');
  const [title, setTitle] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [availability, setAvailability] = useState('');

  // Step 2: Skills
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');

  // Step 3: Portfolio
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  // Step 4: Preferences
  const [categories, setCategories] = useState<string[]>([]);
  const [projectSize, setProjectSize] = useState('');
  const [workType, setWorkType] = useState('');

  const progress = (currentStep / STEPS.length) * 100;

  const addSkill = () => {
    if (skillInput && !skills.includes(skillInput)) {
      setSkills([...skills, skillInput]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const toggleCategory = (category: string) => {
    if (categories.includes(category)) {
      setCategories(categories.filter(c => c !== category));
    } else {
      setCategories([...categories, category]);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!bio || !title || !hourlyRate) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    if (currentStep === 2) {
      if (skills.length === 0 || !experience) {
        toast.error('Please add at least one skill and your experience level');
        return;
      }
    }
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    toast.success('Profile setup complete! Welcome to Connect-Accel!');
    navigate('/freelancer/dashboard');
  };

  const availableCategories = [
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Data Science',
    'DevOps',
    'Content Writing',
    'Digital Marketing'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="size-8 text-blue-600" />
            <h1 className="text-4xl">Complete Your Profile</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Let's set up your freelancer profile to start winning projects
          </p>
        </div>

        {/* Progress */}
        <Card className="p-6 mb-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">{currentStep} of {STEPS.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Steps */}
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="size-6" /> : <Icon className="size-6" />}
                    </div>
                    <span
                      className={`text-sm mt-2 hidden md:block ${
                        isActive ? 'font-medium text-blue-600' : 'text-gray-600'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Content */}
        <Card className="p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl mb-2">Tell us about yourself</h2>
                <p className="text-gray-600">This information will be visible to clients</p>
              </div>

              <div>
                <Label>Professional Title *</Label>
                <Input
                  placeholder="e.g., Full-Stack Developer, UI/UX Designer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <Label>Professional Bio *</Label>
                <Textarea
                  placeholder="Write a compelling summary of your experience, skills, and what makes you unique..."
                  rows={6}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Hourly Rate (₹) *</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 2000"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Availability *</Label>
                  <Select value={availability} onValueChange={setAvailability}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time (40+ hrs/week)</SelectItem>
                      <SelectItem value="part-time">Part-time (20-40 hrs/week)</SelectItem>
                      <SelectItem value="occasional">Occasional (&lt; 20 hrs/week)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl mb-2">Your Skills & Experience</h2>
                <p className="text-gray-600">Help clients understand your expertise</p>
              </div>

              <div>
                <Label>Add Skills *</Label>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="e.g., React, Node.js, Python"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button onClick={addSkill}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => removeSkill(skill)}
                    >
                      {skill} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Years of Experience *</Label>
                <Select value={experience} onValueChange={setExperience}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">Less than 1 year</SelectItem>
                    <SelectItem value="1-3">1-3 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="5-10">5-10 years</SelectItem>
                    <SelectItem value="10+">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Education</Label>
                <Input
                  placeholder="e.g., B.Tech in Computer Science"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl mb-2">Portfolio & Links</h2>
                <p className="text-gray-600">Share your work and professional profiles</p>
              </div>

              <div>
                <Label>Portfolio Website</Label>
                <Input
                  placeholder="https://yourportfolio.com"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                />
              </div>

              <div>
                <Label>GitHub Profile</Label>
                <Input
                  placeholder="https://github.com/yourusername"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                />
              </div>

              <div>
                <Label>LinkedIn Profile</Label>
                <Input
                  placeholder="https://linkedin.com/in/yourusername"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Tip:</strong> Adding your portfolio and professional profiles increases your
                  chances of getting hired by 3x!
                </p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl mb-2">Your Preferences</h2>
                <p className="text-gray-600">Help us match you with the right projects</p>
              </div>

              <div>
                <Label>Preferred Categories *</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {availableCategories.map((category) => (
                    <div
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        categories.includes(category)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{category}</span>
                        {categories.includes(category) && (
                          <CheckCircle className="size-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Preferred Project Size</Label>
                <Select value={projectSize} onValueChange={setProjectSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (&lt; ₹50K)</SelectItem>
                    <SelectItem value="medium">Medium (₹50K - ₹2L)</SelectItem>
                    <SelectItem value="large">Large (&gt; ₹2L)</SelectItem>
                    <SelectItem value="any">Any size</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Work Type Preference</Label>
                <Select value={workType} onValueChange={setWorkType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select work type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short-term">Short-term projects</SelectItem>
                    <SelectItem value="long-term">Long-term contracts</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="size-4 mr-2" />
            </Button>

            {currentStep < STEPS.length ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="size-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="size-4 mr-2" />
                Complete Setup
              </Button>
            )}
          </div>
        </Card>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/freelancer/dashboard')}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}