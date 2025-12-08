import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { useData } from '../../contexts/DataContext';
import { 
  ArrowLeft,
  Star,
  Briefcase,
  DollarSign,
  Award,
  Calendar,
  FileText,
  Send,
  MessageSquare,
  CheckCircle2,
  Clock,
  Eye
} from 'lucide-react';

export default function AgentFreelancerDetail() {
  const { id } = useParams();
  const { freelancers, projects, bids } = useData();
  
  const freelancer = freelancers.find(f => f.id === id);
  const freelancerBids = freelancer ? bids.filter(b => b.freelancer_id === freelancer.id) : [];
  const acceptedBids = freelancerBids.filter(b => b.status === 'accepted');
  const completedProjects = acceptedBids
    .map(b => projects.find(p => p.id === b.project_id))
    .filter(p => p && p.status === 'completed');

  if (!freelancer) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl mb-4">Freelancer not found</h2>
          <Button asChild>
            <Link to="/agent/freelancers">
              <ArrowLeft className="size-4 mr-2" />
              Back to Freelancers
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const totalEarnings = acceptedBids.reduce((sum, bid) => sum + bid.amount, 0);
  const avgBidAmount = freelancerBids.length > 0 
    ? freelancerBids.reduce((sum, bid) => sum + bid.amount, 0) / freelancerBids.length 
    : 0;

  const stats = [
    {
      label: 'Rating',
      value: freelancer.rating.toFixed(1),
      icon: <Star className="size-5" />,
      color: 'bg-yellow-500',
    },
    {
      label: 'Completed Projects',
      value: completedProjects.length,
      icon: <CheckCircle2 className="size-5" />,
      color: 'bg-green-500',
    },
    {
      label: 'Total Bids',
      value: freelancerBids.length,
      icon: <FileText className="size-5" />,
      color: 'bg-blue-500',
    },
    {
      label: 'Hourly Rate',
      value: `$${freelancer.hourly_rate}`,
      icon: <DollarSign className="size-5" />,
      color: 'bg-purple-500',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline">
              <Link to="/agent/freelancers">
                <ArrowLeft className="size-4 mr-2" />
                Back
              </Link>
            </Button>
            <div className="flex items-center gap-4">
              <div className="size-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl">
                {freelancer.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl">{freelancer.name}</h1>
                <p className="text-gray-600 mt-1">{freelancer.title}</p>
                <div className="flex items-center gap-2 mt-2">
                  {freelancer.availability === 'available' && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Available
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="size-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm">{freelancer.rating} ({freelancer.total_reviews} reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link to={`/messages?freelancer=${freelancer.id}`}>
                <MessageSquare className="size-4 mr-2" />
                Message
              </Link>
            </Button>
            <Button asChild>
              <Link to={`/agent/bids/create?freelancer=${freelancer.id}`}>
                <Send className="size-4 mr-2" />
                Invite to Bid
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} text-white p-3 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl mb-4">About</h2>
              <p className="text-gray-600">{freelancer.bio}</p>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl mb-4">Skills & Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {freelancer.skills.map((skill) => (
                  <span key={skill} className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Portfolio */}
            {freelancer.portfolio && freelancer.portfolio.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl mb-4">Portfolio</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {freelancer.portfolio.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-sm mb-2">{item.title}</h3>
                      <p className="text-xs text-gray-600 mb-3">{item.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {item.technologies.map((tech) => (
                          <span key={tech} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Work History */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl mb-4">Work History</h2>
              <div className="space-y-4">
                {completedProjects.map((project) => {
                  if (!project) return null;
                  const bid = acceptedBids.find(b => b.project_id === project.id);
                  return (
                    <div key={project.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="size-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                        <Briefcase className="size-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm mb-1">{project.title}</h3>
                        <p className="text-xs text-gray-600 mb-2">{project.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <DollarSign className="size-3" />
                            <span>${bid?.amount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            <span>{new Date(project.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="size-3" />
                            <span>Completed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {completedProjects.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No completed projects yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="text-sm">
                    {freelancerBids.length > 0 
                      ? Math.round((acceptedBids.length / freelancerBids.length) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Earnings</span>
                  <span className="text-sm">${totalEarnings.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Bid Amount</span>
                  <span className="text-sm">${Math.round(avgBidAmount).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm">{new Date(freelancer.member_since).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Recent Bids */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg">Recent Bids</h2>
                <span className="text-sm text-gray-500">{freelancerBids.length} total</span>
              </div>
              <div className="space-y-3">
                {freelancerBids.slice(0, 5).map((bid) => {
                  const project = projects.find(p => p.id === bid.project_id);
                  return (
                    <div key={bid.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{project?.title || 'Unknown Project'}</span>
                        <span className="text-sm">${bid.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          bid.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          bid.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {bid.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(bid.submitted_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {freelancerBids.length === 0 && (
                  <p className="text-gray-500 text-center py-4 text-sm">No bids yet</p>
                )}
              </div>
            </div>

            {/* Certifications */}
            {freelancer.certifications && freelancer.certifications.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg mb-4">Certifications</h2>
                <div className="space-y-3">
                  {freelancer.certifications.map((cert, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="size-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Award className="size-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">{cert.name}</div>
                        <div className="text-xs text-gray-500">{cert.issuer}</div>
                        <div className="text-xs text-gray-400">{cert.year}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
