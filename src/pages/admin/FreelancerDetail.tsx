import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { ArrowLeft, Star, Briefcase, DollarSign, CheckCircle, Award, Mail, Phone, MapPin } from 'lucide-react';

// Mock freelancer data - in real app this would come from database
const mockFreelancers: Record<string, any> = {
  freelancer_1: {
    id: 'freelancer_1',
    name: 'Ravi Kumar',
    email: 'ravi@example.com',
    phone: '+91 98765 43210',
    location: 'Bangalore, India',
    rating: 4.8,
    total_reviews: 45,
    hourly_rate: 2500,
    experience_years: 5,
    total_earnings: 450000,
    completion_rate: 95,
    on_time_rate: 92,
    skills: ['React', 'Node.js', 'MongoDB', 'Stripe', 'TypeScript', 'AWS'],
    bio: 'Full-stack developer with 5 years of experience building scalable web applications. Specialized in React and Node.js ecosystems.',
    portfolio: [
      { title: 'E-commerce Platform', description: 'Built a full-featured e-commerce platform with 10k+ products' },
      { title: 'SaaS Dashboard', description: 'Created analytics dashboard for B2B SaaS company' },
    ],
    certifications: ['AWS Certified Developer', 'MongoDB Certified'],
    languages: ['English (Fluent)', 'Hindi (Native)'],
    availability: 'Full-time',
  },
  freelancer_2: {
    id: 'freelancer_2',
    name: 'Priya Singh',
    email: 'priya@example.com',
    phone: '+91 98765 43211',
    location: 'Mumbai, India',
    rating: 4.9,
    total_reviews: 38,
    hourly_rate: 3000,
    experience_years: 6,
    total_earnings: 520000,
    completion_rate: 98,
    on_time_rate: 95,
    skills: ['Python', 'Django', 'PostgreSQL', 'API Development', 'Docker'],
    bio: 'Backend specialist with expertise in building robust APIs and microservices architecture.',
    portfolio: [
      { title: 'Payment Gateway Integration', description: 'Integrated multiple payment providers' },
      { title: 'Microservices Platform', description: 'Built scalable microservices architecture' },
    ],
    certifications: ['Google Cloud Professional', 'Python Advanced Certification'],
    languages: ['English (Fluent)', 'Hindi (Native)', 'Marathi (Native)'],
    availability: 'Part-time',
  },
};

export default function FreelancerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, bids } = useData();
  
  const freelancer = mockFreelancers[id || ''];
  
  // Get freelancer's projects and bids
  const freelancerProjects = projects.filter(p => p.freelancer_id === id);
  const freelancerBids = bids.filter(b => b.freelancer_id === id);
  const activeBids = freelancerBids.filter(b => b.status === 'pending' || b.status === 'shortlisted');
  const wonBids = freelancerBids.filter(b => b.status === 'accepted');

  if (!freelancer) {
    return (
      <DashboardLayout role="admin">
        <div className="p-6">
          <div className="max-w-4xl mx-auto text-center py-12">
            <h2 className="text-2xl mb-2">Freelancer Not Found</h2>
            <button
              onClick={() => navigate('/admin/freelancers')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-4"
            >
              Back to Directory
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/admin/freelancers')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Directory
            </button>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl">
                    {freelancer.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <h1 className="text-3xl mb-2">{freelancer.name}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{freelancer.rating}</span>
                        <span>({freelancer.total_reviews} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {freelancer.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {freelancer.experience_years} years
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-600">Hourly Rate</p>
                  <p className="text-2xl text-blue-600">₹{freelancer.hourly_rate.toLocaleString()}</p>
                  <span className="text-xs text-gray-500">{freelancer.availability}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Earnings</span>
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl">₹{freelancer.total_earnings.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Active Projects</span>
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl">{freelancerProjects.filter(p => p.status === 'in_progress').length}</p>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl">{freelancer.completion_rate}%</p>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">On-Time Rate</span>
                <Award className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-2xl">{freelancer.on_time_rate}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl mb-4">About</h2>
                <p className="text-gray-600">{freelancer.bio}</p>
              </div>

              {/* Skills */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl mb-4">Skills & Expertise</h2>
                <div className="flex flex-wrap gap-2">
                  {freelancer.skills.map((skill: string, index: number) => (
                    <span key={index} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Portfolio */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl mb-4">Portfolio</h2>
                <div className="space-y-4">
                  {freelancer.portfolio.map((item: any, index: number) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects History */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl mb-4">Project History ({freelancerProjects.length})</h2>
                <div className="space-y-3">
                  {freelancerProjects.map((project) => (
                    <div key={project.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{project.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{project.client_name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Started: {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not started'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{(project.freelancer_budget || 0).toLocaleString()}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            project.status === 'completed' ? 'bg-green-100 text-green-800' :
                            project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/admin/projects/${project.id}`)}
                        className="text-xs text-blue-600 hover:underline mt-2"
                      >
                        View Project →
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bidding Activity */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl mb-4">Bidding Activity</h2>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-medium">{freelancerBids.length}</p>
                    <p className="text-sm text-gray-600">Total Bids</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-medium text-blue-600">{activeBids.length}</p>
                    <p className="text-sm text-gray-600">Active</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-medium text-green-600">{wonBids.length}</p>
                    <p className="text-sm text-gray-600">Won</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Win Rate: {freelancerBids.length > 0 ? Math.round((wonBids.length / freelancerBids.length) * 100) : 0}%
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href={`mailto:${freelancer.email}`} className="text-sm text-blue-600 hover:underline">
                      {freelancer.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a href={`tel:${freelancer.phone}`} className="text-sm">
                      {freelancer.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{freelancer.location}</span>
                  </div>
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Certifications
                </h3>
                <ul className="space-y-2">
                  {freelancer.certifications.map((cert: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{cert}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Languages */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg mb-4">Languages</h3>
                <ul className="space-y-2">
                  {freelancer.languages.map((lang: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600">{lang}</li>
                  ))}
                </ul>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg mb-4">Performance</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Completion Rate</span>
                      <span className="font-medium">{freelancer.completion_rate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${freelancer.completion_rate}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">On-Time Delivery</span>
                      <span className="font-medium">{freelancer.on_time_rate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${freelancer.on_time_rate}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Client Satisfaction</span>
                      <span className="font-medium">{freelancer.rating}/5.0</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${(freelancer.rating / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate(`/messages?user=${freelancer.id}`)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Send Message
                  </button>
                  <button
                    onClick={() => navigate('/admin/projects')}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Assign to Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
