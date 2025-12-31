import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import PageSkeleton from '../../components/shared/PageSkeleton';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  Plus,
  Trash2,
  ExternalLink,
  Award,
  Briefcase,
  Code
} from 'lucide-react';
import { toast } from '../../utils/toast';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  link?: string;
  technologies: string[];
  completion_date: string;
}

interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years: number;
}

interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credential_id?: string;
}

export default function PortfolioPage() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([
    {
      id: '1',
      title: 'E-Commerce Platform',
      description: 'Full-stack e-commerce solution with payment integration and admin dashboard',
      category: 'Web Development',
      image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800',
      link: 'https://example.com/project1',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      completion_date: '2024-01-15'
    },
    {
      id: '2',
      title: 'Mobile Fitness App',
      description: 'Cross-platform mobile app for workout tracking and meal planning',
      category: 'Mobile Development',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
      technologies: ['React Native', 'Firebase', 'Redux'],
      completion_date: '2023-11-20'
    }
  ]);

  const [skills, setSkills] = useState<Skill[]>([
    { id: '1', name: 'React.js', level: 'expert', years: 5 },
    { id: '2', name: 'Node.js', level: 'advanced', years: 4 },
    { id: '3', name: 'Python', level: 'advanced', years: 3 },
    { id: '4', name: 'MongoDB', level: 'intermediate', years: 2 }
  ]);

  const [certifications, setCertifications] = useState<Certification[]>([
    { id: '1', title: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', date: '2023-06-15', credential_id: 'AWS-123456' },
    { id: '2', title: 'Google Cloud Professional', issuer: 'Google', date: '2023-03-10' }
  ]);

  const [showPortfolioDialog, setShowPortfolioDialog] = useState(false);
  const [showSkillDialog, setShowSkillDialog] = useState(false);
  const [showCertDialog, setShowCertDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);


  // Portfolio form state
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    description: '',
    category: '',
    link: '',
    technologies: ''
  });

  // Skill form state
  const [skillForm, setSkillForm] = useState({
    name: '',
    level: 'intermediate' as const,
    years: ''
  });

  // Cert form state
  const [certForm, setCertForm] = useState({
    title: '',
    issuer: '',
    date: '',
    credential_id: ''
  });

  if (loading) {
    return <PageSkeleton />;
  }

  const handleAddPortfolio = () => {
    if (!portfolioForm.title || !portfolioForm.description || !portfolioForm.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newItem: PortfolioItem = {
      id: Date.now().toString(),
      title: portfolioForm.title,
      description: portfolioForm.description,
      category: portfolioForm.category,
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
      link: portfolioForm.link,
      technologies: portfolioForm.technologies.split(',').map(t => t.trim()),
      completion_date: new Date().toISOString()
    };

    setPortfolioItems([...portfolioItems, newItem]);
    toast.success('Portfolio item added successfully!');
    setShowPortfolioDialog(false);
    setPortfolioForm({ title: '', description: '', category: '', link: '', technologies: '' });
  };

  const handleDeletePortfolio = (id: string) => {
    setPortfolioItems(portfolioItems.filter(item => item.id !== id));
    toast.success('Portfolio item deleted');
  };

  const handleAddSkill = () => {
    if (!skillForm.name || !skillForm.years) {
      toast.error('Please fill in all fields');
      return;
    }

    const newSkill: Skill = {
      id: Date.now().toString(),
      name: skillForm.name,
      level: skillForm.level,
      years: parseInt(skillForm.years)
    };

    setSkills([...skills, newSkill]);
    toast.success('Skill added successfully!');
    setShowSkillDialog(false);
    setSkillForm({ name: '', level: 'intermediate', years: '' });
  };

  const handleDeleteSkill = (id: string) => {
    setSkills(skills.filter(skill => skill.id !== id));
    toast.success('Skill removed');
  };

  const handleAddCertification = () => {
    if (!certForm.title || !certForm.issuer || !certForm.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newCert: Certification = {
      id: Date.now().toString(),
      ...certForm
    };

    setCertifications([...certifications, newCert]);
    toast.success('Certification added successfully!');
    setShowCertDialog(false);
    setCertForm({ title: '', issuer: '', date: '', credential_id: '' });
  };

  const handleDeleteCert = (id: string) => {
    setCertifications(certifications.filter(cert => cert.id !== id));
    toast.success('Certification removed');
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return 'bg-purple-500';
      case 'advanced': return 'bg-blue-500';
      case 'intermediate': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSkillLevelWidth = (level: string) => {
    switch (level) {
      case 'expert': return '100%';
      case 'advanced': return '75%';
      case 'intermediate': return '50%';
      default: return '25%';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl mb-2">Portfolio & Skills</h1>
          <p className="text-gray-600">Showcase your work and expertise</p>
        </div>

        {/* Portfolio Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl flex items-center gap-2">
              <Briefcase className="size-6" />
              Portfolio Projects
            </h2>
            <Button onClick={() => setShowPortfolioDialog(true)}>
              <Plus className="size-5 mr-2" />
              Add Project
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioItems.map(item => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-medium">{item.title}</h3>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleDeletePortfolio(item.id)}>
                        <Trash2 className="size-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  <Badge variant="secondary" className="mb-3">{item.category}</Badge>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.technologies.map((tech, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="size-4 mr-2" />
                        View Project
                      </Button>
                    </a>
                  )}
                </div>
              </Card>
            ))}

            {portfolioItems.length === 0 && (
              <Card className="col-span-full p-12 text-center">
                <Briefcase className="size-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl mb-2">No Portfolio Items</h3>
                <p className="text-gray-600 mb-6">Add your best work to showcase your skills</p>
                <Button onClick={() => setShowPortfolioDialog(true)}>
                  <Plus className="size-4 mr-2" />
                  Add Your First Project
                </Button>
              </Card>
            )}
          </div>
        </div>

        {/* Skills Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl flex items-center gap-2">
              <Code className="size-6" />
              Skills & Expertise
            </h2>
            <Button onClick={() => setShowSkillDialog(true)}>
              <Plus className="size-5 mr-2" />
              Add Skill
            </Button>
          </div>

          <Card className="p-6">
            <div className="space-y-6">
              {skills.map(skill => (
                <div key={skill.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{skill.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {skill.years} {skill.years === 1 ? 'year' : 'years'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSkillLevelColor(skill.level)}>
                        {skill.level}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSkill(skill.id)}
                      >
                        <Trash2 className="size-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${getSkillLevelColor(skill.level)} transition-all`}
                      style={{ width: getSkillLevelWidth(skill.level) }}
                    />
                  </div>
                </div>
              ))}

              {skills.length === 0 && (
                <div className="text-center py-12">
                  <Code className="size-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl mb-2">No Skills Added</h3>
                  <p className="text-gray-600 mb-6">Add your technical skills and expertise</p>
                  <Button onClick={() => setShowSkillDialog(true)}>
                    <Plus className="size-4 mr-2" />
                    Add Your First Skill
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Certifications Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl flex items-center gap-2">
              <Award className="size-6" />
              Certifications & Awards
            </h2>
            <Button onClick={() => setShowCertDialog(true)}>
              <Plus className="size-5 mr-2" />
              Add Certification
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certifications.map(cert => (
              <Card key={cert.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-yellow-100 text-yellow-600 p-3 rounded-lg">
                      <Award className="size-6" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{cert.title}</h3>
                      <p className="text-sm text-gray-600">{cert.issuer}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Issued: {new Date(cert.date).toLocaleDateString()}
                      </p>
                      {cert.credential_id && (
                        <p className="text-xs text-gray-500 mt-1">
                          ID: {cert.credential_id}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCert(cert.id)}
                  >
                    <Trash2 className="size-4 text-red-600" />
                  </Button>
                </div>
              </Card>
            ))}

            {certifications.length === 0 && (
              <Card className="col-span-full p-12 text-center">
                <Award className="size-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl mb-2">No Certifications</h3>
                <p className="text-gray-600 mb-6">Add your professional certifications</p>
                <Button onClick={() => setShowCertDialog(true)}>
                  <Plus className="size-4 mr-2" />
                  Add Certification
                </Button>
              </Card>
            )}
          </div>
        </div>

        {/* Portfolio Dialog */}
        <Dialog open={showPortfolioDialog} onOpenChange={setShowPortfolioDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Portfolio Project</DialogTitle>
              <DialogDescription>
                Showcase your best work
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Project Title *</Label>
                <Input
                  placeholder="E.g., E-Commerce Platform"
                  value={portfolioForm.title}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Category *</Label>
                <Select
                  value={portfolioForm.category}
                  onValueChange={(value) => setPortfolioForm({ ...portfolioForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Web Development">Web Development</SelectItem>
                    <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                    <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="DevOps">DevOps</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description *</Label>
                <Textarea
                  placeholder="Describe the project, your role, and key achievements..."
                  value={portfolioForm.description}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div>
                <Label>Technologies (comma-separated)</Label>
                <Input
                  placeholder="E.g., React, Node.js, MongoDB"
                  value={portfolioForm.technologies}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, technologies: e.target.value })}
                />
              </div>
              <div>
                <Label>Project Link (Optional)</Label>
                <Input
                  placeholder="https://..."
                  value={portfolioForm.link}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, link: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPortfolioDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPortfolio}>
                <Plus className="size-4 mr-2" />
                Add Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Skill Dialog */}
        <Dialog open={showSkillDialog} onOpenChange={setShowSkillDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Skill</DialogTitle>
              <DialogDescription>
                Add a new skill to your profile
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Skill Name *</Label>
                <Input
                  placeholder="E.g., React.js"
                  value={skillForm.name}
                  onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Proficiency Level *</Label>
                <Select
                  value={skillForm.level}
                  onValueChange={(value: any) => setSkillForm({ ...skillForm, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Years of Experience *</Label>
                <Input
                  type="number"
                  placeholder="E.g., 3"
                  value={skillForm.years}
                  onChange={(e) => setSkillForm({ ...skillForm, years: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSkillDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSkill}>
                <Plus className="size-4 mr-2" />
                Add Skill
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Certification Dialog */}
        <Dialog open={showCertDialog} onOpenChange={setShowCertDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Certification</DialogTitle>
              <DialogDescription>
                Add a professional certification or award
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Certification Title *</Label>
                <Input
                  placeholder="E.g., AWS Certified Solutions Architect"
                  value={certForm.title}
                  onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Issuing Organization *</Label>
                <Input
                  placeholder="E.g., Amazon Web Services"
                  value={certForm.issuer}
                  onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                />
              </div>
              <div>
                <Label>Issue Date *</Label>
                <Input
                  type="date"
                  value={certForm.date}
                  onChange={(e) => setCertForm({ ...certForm, date: e.target.value })}
                />
              </div>
              <div>
                <Label>Credential ID (Optional)</Label>
                <Input
                  placeholder="E.g., AWS-123456"
                  value={certForm.credential_id}
                  onChange={(e) => setCertForm({ ...certForm, credential_id: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCertDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCertification}>
                <Plus className="size-4 mr-2" />
                Add Certification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
